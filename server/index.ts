import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { readFile, writeFile, access } from 'fs/promises';
import crypto from 'crypto';
import pdf from 'pdf-parse';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const PORT = Number(process.env.PORT || 4000);
const STORE_FILE = path.join(projectRoot, 'server', 'assistant-store.json');
const PORTFOLIO_FILE = path.join(projectRoot, 'src', 'data', 'portfolio.json');
const RESUME_FILE = path.join(projectRoot, 'public', 'Subhajit_Chowdhury_Data_Engineer_Resume.pdf');
const EMBEDDING_MODEL = 'text-embedding-004';
const AGENT_MODEL = 'gemini-3-flash-preview';

interface AssistantChunk {
  id: string;
  source: 'portfolio' | 'resume';
  text: string;
  embedding: number[];
}

interface AssistantStore {
  version: number;
  updatedAt: string;
  fileHashes: {
    portfolio: string;
    resume: string;
  };
  chunks: AssistantChunk[];
}

const app = express();
app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  next();
});

const apiKey = getGeminiApiKey();
if (!apiKey) {
  console.error('Error: GEMINI_API_KEY is not set. Please add it to a .env file or your environment.');
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });

app.get('/api/assistant/status', async (req, res) => {
  try {
    const store = await ensureKnowledgeBase();
    res.json({ ready: true, updatedAt: store.updatedAt, chunkCount: store.chunks.length });
  } catch (error) {
    console.error('Assistant status error:', error);
    res.status(500).json({ ready: false, error: 'Failed to initialize the assistant knowledge base.' });
  }
});

app.post('/api/assistant/query', async (req, res) => {
  const question = String(req.body?.question || '').trim();

  if (!question) {
    return res.status(400).json({ error: 'A question is required.' });
  }

  try {
    const store = await ensureKnowledgeBase();
    const topChunks = await retrieveRelevantChunks(question, store, 5);
    const prompt = buildPrompt(question, topChunks);

    const result = await ai.models.generateContent({
      model: AGENT_MODEL,
      contents: [
        {
          role: 'system',
          parts: [
            {
              text: `You are Subhajit Chowdhury's portfolio assistant. Answer only from the provided source excerpts and do not hallucinate.
              If a detail is not available in the provided sources, respond that the information is unavailable in the current resume or portfolio.
              Keep answers concise, professional, and recruiter-friendly.`,
            },
          ],
        },
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
      config: {
        temperature: 0.2,
      },
    });

    const answer = result.text || 'I could not generate a response from the assistant at this time.';

    res.json({ answer, sources: topChunks.map((chunk) => ({ id: chunk.id, source: chunk.source })) });
  } catch (error) {
    console.error('Assistant query error:', error);
    res.status(500).json({ error: 'Assistant query failed. Please check the server logs for details.' });
  }
});

app.listen(PORT, () => {
  console.log(`Assistant API listening on http://localhost:${PORT}`);
});

function getGeminiApiKey(): string {
  const key = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '';
  return typeof key === 'string' ? key.trim() : '';
}

async function fileExists(filePath: string) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

function computeHash(buffer: Buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

async function loadStore(): Promise<AssistantStore | null> {
  if (!(await fileExists(STORE_FILE))) {
    return null;
  }

  try {
    const raw = await readFile(STORE_FILE, 'utf-8');
    return JSON.parse(raw) as AssistantStore;
  } catch (error) {
    console.warn('Failed to read assistant store, rebuilding from source.', error);
    return null;
  }
}

async function saveStore(store: AssistantStore) {
  await writeFile(STORE_FILE, JSON.stringify(store, null, 2), 'utf-8');
}

function chunkText(text: string, maxLength = 900, overlap = 200) {
  const normalized = text.replace(/\s+/g, ' ').trim();
  const chunks: string[] = [];
  let start = 0;

  while (start < normalized.length) {
    const end = Math.min(start + maxLength, normalized.length);
    const chunk = normalized.slice(start, end).trim();

    if (chunk.length) {
      chunks.push(chunk);
    }

    if (end === normalized.length) break;
    start = Math.max(0, end - overlap);
  }

  return chunks;
}

function chunkPortfolioData(portfolio: any): AssistantChunk[] {
  const chunks: AssistantChunk[] = [];
  const { basics, experience, projects, skills, education, certifications, achievements, awards, extra } = portfolio;

  if (basics?.summary) {
    chunks.push({
      id: 'portfolio_basics_summary',
      source: 'portfolio',
      text: `Summary: ${basics.summary}`,
      embedding: [],
    });
  }

  if (basics) {
    chunks.push({
      id: 'portfolio_basics_contact',
      source: 'portfolio',
      text: `Name: ${basics.name}\nTitle: ${basics.title}\nLocation: ${basics.location}\nEmail: ${basics.email}\nPhone: ${basics.phone}`,
      embedding: [],
    });
  }

  if (Array.isArray(experience)) {
    experience.forEach((item: any, index: number) => {
      const bullets = Array.isArray(item.bullets) ? item.bullets.join(' ') : '';
      chunks.push({
        id: `portfolio_experience_${index}`,
        source: 'portfolio',
        text: `Role: ${item.role} at ${item.company}\nDates: ${item.dates}\nLocation: ${item.location}\nWork mode: ${item.work_mode}\nDetails: ${bullets}`,
        embedding: [],
      });
    });
  }

  if (Array.isArray(projects)) {
    projects.forEach((item: any, index: number) => {
      const bullets = Array.isArray(item.bullets) ? item.bullets.join(' ') : '';
      const techStack = Array.isArray(item.tech_stack) ? item.tech_stack.join(', ') : '';
      chunks.push({
        id: `portfolio_project_${index}`,
        source: 'portfolio',
        text: `Project: ${item.title}\nTech stack: ${techStack}\nDetails: ${bullets}`,
        embedding: [],
      });
    });
  }

  if (Array.isArray(skills)) {
    skills.forEach((item: any, index: number) => {
      const items = Array.isArray(item.items) ? item.items.join(', ') : '';
      chunks.push({
        id: `portfolio_skill_${index}`,
        source: 'portfolio',
        text: `Skill category: ${item.category}\nSkills: ${items}`,
        embedding: [],
      });
    });
  }

  if (Array.isArray(education)) {
    education.forEach((item: any, index: number) => {
      chunks.push({
        id: `portfolio_education_${index}`,
        source: 'portfolio',
        text: `Education: ${item.degree} from ${item.institution} (${item.dates})\nDetails: ${item.details}`,
        embedding: [],
      });
    });
  }

  if (Array.isArray(certifications)) {
    certifications.forEach((item: any, index: number) => {
      chunks.push({
        id: `portfolio_certification_${index}`,
        source: 'portfolio',
        text: `Certification: ${item.name} by ${item.issuer} (${item.date})\nDetails: ${item.details}`,
        embedding: [],
      });
    });
  }

  if (Array.isArray(achievements) && achievements.length) {
    chunks.push({
      id: 'portfolio_achievements',
      source: 'portfolio',
      text: `Achievements: ${achievements.join('; ')}`,
      embedding: [],
    });
  }

  if (Array.isArray(awards) && awards.length) {
    chunks.push({
      id: 'portfolio_awards',
      source: 'portfolio',
      text: `Awards: ${awards.join('; ')}`,
      embedding: [],
    });
  }

  if (Array.isArray(extra) && extra.length) {
    chunks.push({
      id: 'portfolio_extra',
      source: 'portfolio',
      text: `Extra: ${extra.join(' ')}`,
      embedding: [],
    });
  }

  return chunks;
}

async function loadResumeText() {
  const resumeBuffer = await readFile(RESUME_FILE);
  const resumeData = await pdf(resumeBuffer);
  return String(resumeData.text || '').trim();
}

async function ensureKnowledgeBase(): Promise<AssistantStore> {
  const [portfolioBuffer, resumeBuffer] = await Promise.all([
    readFile(PORTFOLIO_FILE),
    readFile(RESUME_FILE),
  ]);

  const portfolioHash = computeHash(portfolioBuffer);
  const resumeHash = computeHash(resumeBuffer);
  const existingStore = await loadStore();

  if (
    !existingStore ||
    existingStore.fileHashes.portfolio !== portfolioHash ||
    existingStore.fileHashes.resume !== resumeHash ||
    !Array.isArray(existingStore.chunks) ||
    existingStore.chunks.length === 0
  ) {
    return await buildKnowledgeBase(portfolioBuffer, resumeBuffer, portfolioHash, resumeHash);
  }

  return existingStore;
}

async function buildKnowledgeBase(
  portfolioBuffer: Buffer,
  resumeBuffer: Buffer,
  portfolioHash: string,
  resumeHash: string,
): Promise<AssistantStore> {
  console.log('Building assistant knowledge base from local resume and portfolio data...');

  const portfolioData = JSON.parse(portfolioBuffer.toString('utf-8'));
  const resumeText = await loadResumeText();
  const portfolioChunks = chunkPortfolioData(portfolioData);
  const resumeChunks = chunkText(resumeText, 900, 250).map((text, index) => ({
    id: `resume_${index + 1}`,
    source: 'resume' as const,
    text,
    embedding: [],
  }));

  const allChunks = [...portfolioChunks, ...resumeChunks];
  const chunkContents = allChunks.map((chunk) => ({ parts: [{ text: chunk.text }] }));

  const embeddingResponse = await ai.models.embedContent({
    model: EMBEDDING_MODEL,
    contents: chunkContents,
  });

  const embeddings = embeddingResponse.embeddings || [];

  if (embeddings.length !== allChunks.length) {
    throw new Error('Embedding count mismatch during knowledge base creation.');
  }

  const store: AssistantStore = {
    version: 1,
    updatedAt: new Date().toISOString(),
    fileHashes: {
      portfolio: portfolioHash,
      resume: resumeHash,
    },
    chunks: allChunks.map((chunk, index) => ({
      ...chunk,
      embedding: embeddings[index]?.values || [],
    })),
  };

  await saveStore(store);
  console.log(`Assistant knowledge base built with ${store.chunks.length} chunks.`);
  return store;
}

function cosineSimilarity(a: number[], b: number[]) {
  const length = Math.min(a.length, b.length);
  let dot = 0;
  let magA = 0;
  let magB = 0;

  for (let i = 0; i < length; i += 1) {
    dot += a[i] * b[i];
    magA += a[i] ** 2;
    magB += b[i] ** 2;
  }

  if (magA === 0 || magB === 0) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

async function retrieveRelevantChunks(question: string, store: AssistantStore, limit = 4) {
  const queryResponse = await ai.models.embedContent({
    model: EMBEDDING_MODEL,
    contents: [{ parts: [{ text: question }] }],
  });

  const queryEmbedding = queryResponse.embeddings?.[0]?.values;
  if (!queryEmbedding || queryEmbedding.length === 0) {
    throw new Error('Failed to compute query embedding.');
  }

  return store.chunks
    .map((chunk) => ({
      chunk,
      score: cosineSimilarity(queryEmbedding, chunk.embedding),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.chunk);
}

function buildPrompt(question: string, chunks: AssistantChunk[]) {
  const sourceText = chunks
    .map(
      (chunk) =>
        `SOURCE: ${chunk.source.toUpperCase()} (${chunk.id})\n${chunk.text}`,
    )
    .join('\n\n---\n\n');

  return `Use the following source excerpts to answer the user's question. Do not invent any information. If the answer cannot be found in the sources, say that the information is unavailable in the current resume or portfolio.

${sourceText}

QUESTION: ${question}

Provide a concise, recruiter-ready response.`;
}
