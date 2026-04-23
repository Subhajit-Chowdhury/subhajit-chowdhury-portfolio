import json
from pathlib import Path
from graphify.cache import save_semantic_cache
from graphify.build import build_from_json
from graphify.cluster import cluster, score_all
from graphify.analyze import god_nodes, surprising_connections, suggest_questions
from graphify.report import generate
from graphify.export import to_json

# Step B3: Collect, cache, and merge
cached_path = Path('.graphify_cached.json')
new_path = Path('.graphify_semantic_new.json')

cached = json.loads(cached_path.read_text()) if cached_path.exists() else {'nodes':[],'edges':[],'hyperedges':[]}
new = json.loads(new_path.read_text()) if new_path.exists() else {'nodes':[],'edges':[],'hyperedges':[]}

# Save to cache
save_semantic_cache(new.get('nodes', []), new.get('edges', []), new.get('hyperedges', []))

all_nodes = cached['nodes'] + new.get('nodes', [])
all_edges = cached['edges'] + new.get('edges', [])
all_hyperedges = cached.get('hyperedges', []) + new.get('hyperedges', [])
seen = set()
deduped = []
for n in all_nodes:
    if n['id'] not in seen:
        seen.add(n['id'])
        deduped.append(n)

merged_semantic = {
    'nodes': deduped,
    'edges': all_edges,
    'hyperedges': all_hyperedges,
    'input_tokens': new.get('input_tokens', 0),
    'output_tokens': new.get('output_tokens', 0),
}
Path('.graphify_semantic.json').write_text(json.dumps(merged_semantic, indent=2), encoding='utf-8')

# Part C: Merge AST + semantic
ast_path = Path('.graphify_ast.json')
ast = json.loads(ast_path.read_text()) if ast_path.exists() else {'nodes':[],'edges':[]}

seen = {n['id'] for n in ast['nodes']}
merged_nodes = list(ast['nodes'])
for n in merged_semantic['nodes']:
    if n['id'] not in seen:
        merged_nodes.append(n)
        seen.add(n['id'])

merged_edges = ast['edges'] + merged_semantic['edges']
merged_hyperedges = merged_semantic.get('hyperedges', [])
merged_final = {
    'nodes': merged_nodes,
    'edges': merged_edges,
    'hyperedges': merged_hyperedges,
    'input_tokens': merged_semantic.get('input_tokens', 0),
    'output_tokens': merged_semantic.get('output_tokens', 0),
}
Path('.graphify_extract.json').write_text(json.dumps(merged_final, indent=2), encoding='utf-8')

# Step 4: Build graph, cluster, analyze
extraction = merged_final
detect_path = Path('.graphify_detect.json')

# Helper to read robustly (reuse logic or assume it's fixed if we converted it, but let's be safe)
def read_robust(path):
    content = path.read_bytes()
    if content.startswith(b'\xff\xfe') or content.startswith(b'\xfe\xff'):
        return json.loads(content.decode('utf-16'))
    else:
        return json.loads(content.decode('utf-8-sig'))

detection = read_robust(detect_path)

G = build_from_json(extraction)
communities = cluster(G)
cohesion = score_all(G, communities)
tokens = {'input': extraction.get('input_tokens', 0), 'output': extraction.get('output_tokens', 0)}
gods = god_nodes(G)
surprises = surprising_connections(G, communities)
labels = {cid: 'Community ' + str(cid) for cid in communities}
questions = suggest_questions(G, communities, labels)

report = generate(G, communities, cohesion, labels, gods, surprises, detection, tokens, str(Path('.').absolute()), suggested_questions=questions)
out_dir = Path('graphify-out')
out_dir.mkdir(exist_ok=True)
(out_dir / 'GRAPH_REPORT.md').write_text(report, encoding='utf-8')
to_json(G, communities, str(out_dir / 'graph.json'))

analysis = {
    'communities': {str(k): v for k, v in communities.items()},
    'cohesion': {str(k): v for k, v in cohesion.items()},
    'gods': gods,
    'surprises': surprises,
    'questions': questions,
}
Path('.graphify_analysis.json').write_text(json.dumps(analysis, indent=2), encoding='utf-8')

print(f'Graph: {G.number_of_nodes()} nodes, {G.number_of_edges()} edges, {len(communities)} communities')
