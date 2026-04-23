import sys, json
from graphify.extract import collect_files, extract
from graphify.cache import check_semantic_cache
from pathlib import Path

# Part A: AST Extraction
code_files = []
detect_path = Path('.graphify_detect.json')
if not detect_path.exists():
    print("Error: .graphify_detect.json not found")
    sys.exit(1)

def read_robust(path):
    content = path.read_bytes()
    if content.startswith(b'\xff\xfe') or content.startswith(b'\xfe\xff'):
        return json.loads(content.decode('utf-16'))
    else:
        return json.loads(content.decode('utf-8-sig'))

detect = read_robust(detect_path)
for f in detect.get('files', {}).get('code', []):
    p = Path(f)
    if p.is_dir():
        code_files.extend(collect_files(p))
    else:
        code_files.append(p)

if code_files:
    result = extract(code_files)
    Path('.graphify_ast.json').write_text(json.dumps(result, indent=2))
    print(f'AST: {len(result["nodes"])} nodes, {len(result["edges"])} edges')
else:
    Path('.graphify_ast.json').write_text(json.dumps({'nodes':[],'edges':[],'input_tokens':0,'output_tokens':0}))
    print('No code files - skipping AST extraction')

# Part B0: Cache Check
all_files = [f for files in detect['files'].values() for f in files]
cached_nodes, cached_edges, cached_hyperedges, uncached = check_semantic_cache(all_files)

if cached_nodes or cached_edges or cached_hyperedges:
    Path('.graphify_cached.json').write_text(json.dumps({
        'nodes': cached_nodes, 
        'edges': cached_edges, 
        'hyperedges': cached_hyperedges
    }))

Path('.graphify_uncached.txt').write_text('\n'.join(uncached))
print(f'Cache: {len(all_files)-len(uncached)} files hit, {len(uncached)} files need extraction')
