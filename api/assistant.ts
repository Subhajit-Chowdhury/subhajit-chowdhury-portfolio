import { VercelRequest, VercelResponse } from '@vercel/node';
import path from 'path';
import { readFile } from 'fs/promises';
import crypto from 'crypto';
import pdf from 'pdf-parse';
import { GoogleGenAI } from '@google/genai';

const EMBEDDING_MODEL = 'text-embedding-004';
const AGENT_MODEL = 'gemini-3-flash-preview';

interface AssistantChunk {
  id: string;
  source: 'portfolio' | 'resume';
  text: string;
  embedding: number[];
}

// Get API key from environment
function getGeminiApiKey(): string {
  const key = process.env.GEMINI_API_KEY || '';
  return typeof key === 'string' ? key.trim() : '';
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
  try {
    const resumePath = path.join(process.cwd(), 'public', 'Subhajit_Chowdhury_Data_Engineer_Resume.pdf');
    const resumeBuffer = await readFile(resumePath);
    const resumeData = await pdf(resumeBuffer);
    return String(resumeData.text || '').trim();
  } catch (error) {
    console.warn('Could not load resume PDF:', error);
    return '';
  }
}

async function buildKnowledgeBase(ai: GoogleGenAI): Promise<AssistantChunk[]> {
  try {
    const portfolioPath = path.join(process.cwd(), 'src', 'data', 'portfolio.json');
    const portfolioBuffer = await readFile(portfolioPath);
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

    // Get embeddings from Gemini
    const embeddingResponse = await ai.models.embedContent({
      model: EMBEDDING_MODEL,
      contents: chunkContents,
    });

    const embeddings = embeddingResponse.embeddings || [];

    if (embeddings.length !== allChunks.length) {
      console.warn('Embedding count mismatch, using chunks without embeddings');
      return allChunks;
    }

    return allChunks.map((chunk, index) => ({
      ...chunk,
      embedding: embeddings[index]?.values || [],
    }));
  } catch (error) {
    console.error('Error building knowledge base:', error);
    throw new Error('Failed to build knowledge base');
  }
}

async function retrieveRelevantChunks(question: string, chunks: AssistantChunk[], ai: GoogleGenAI, limit = 5) {
  const queryResponse = await ai.models.embedContent({
    model: EMBEDDING_MODEL,
    contents: [{ parts: [{ text: question }] }],
  });

  const queryEmbedding = queryResponse.embeddings?.[0]?.values;
  if (!queryEmbedding || queryEmbedding.length === 0) {
    throw new Error('Failed to compute query embedding.');
  }

  return chunks
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only handle POST
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const apiKey = getGeminiApiKey();
  
  if (!apiKey) {
    return res.status(500).json({
      error: 'Assistant is not configured. Please set GEMINI_API_KEY environment variable.',
    });
  }

  const ai = new GoogleGenAI({ apiKey });
  const question = String(req.body?.question || '').trim();

  if (!question) {
    return res.status(400).json({ error: 'A question is required.' });
  }

  try {
    // Build knowledge base
    const chunks = await buildKnowledgeBase(ai);

    if (chunks.length === 0) {
      return res.status(500).json({ error: 'No knowledge base available.' });
    }

    // Retrieve relevant chunks
    const topChunks = await retrieveRelevantChunks(question, chunks, ai, 5);
    const prompt = buildPrompt(question, topChunks);

    // Generate response
    const result = await ai.models.generateContent({
      model: AGENT_MODEL,
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
      config: {
        temperature: 0.2,
      },
    });

    const answer = result.text || 'I could not generate a response at this time.';

    res.status(200).json({
      answer,
      sources: topChunks.map((chunk) => ({ id: chunk.id, source: chunk.source })),
    });
  } catch (error: any) {
    console.error('Assistant query error:', error);
    res.status(500).json({
      error: 'Assistant query failed. Please try again later.',
      details: error?.message || 'Unknown error',
    });
  }
}
