import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

const provider = (process.env.AI_PROVIDER || 'openai').toLowerCase();
const requireAIEnv = (process.env.REQUIRE_AI || '').toLowerCase();
const requireAI = requireAIEnv === '1' || requireAIEnv.startsWith('t') || requireAIEnv.startsWith('y');
const openaiApiKey = process.env.OPENAI_API_KEY;
const geminiApiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;

const getOpenAIClient = () => {
  if (!openaiApiKey) return null;
  return new OpenAI({ apiKey: openaiApiKey });
};

function extractJson(text) {
  if (!text) return null;
  try { return JSON.parse(text); } catch {}
  const match = text.match(/```(?:json)?\n([\s\S]*?)```/i);
  if (match) {
    try { return JSON.parse(match[1]); } catch {}
  }
  const arrMatch = text.match(/\[\s*\{[\s\S]*\}\s*\]/);
  if (arrMatch) {
    try { return JSON.parse(arrMatch[0]); } catch {}
  }
  return null;
}

export async function generateAiQuestions(context = {}) {
  console.log(`[AI] Provider=${provider} requireAI=${requireAI}`);
  try {
    if (provider === 'openai' && openaiApiKey) {
      const client = getOpenAIClient();
      const system = 'You are an interview assistant. Generate 6 concise technical questions for a Full-Stack (React + Node) role: 2 easy (20s), 2 medium (60s), 2 hard (120s). Return ONLY valid JSON (no prose). Output must be a JSON array of 6 objects with fields: question (string), difficulty (one of easy|medium|hard), timeLimit (number: 20|60|120).';
      const contextText = context.resumeText ? `Resume excerpt: ${context.resumeText.slice(0, 1200)}` : '';
      const user = `${contextText}\nGenerate the 6 questions now as JSON only.`;

      const resp = await client.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user }
        ],
        temperature: 0.3
      });
      const content = resp.choices?.[0]?.message?.content;
      const parsed = extractJson(content);
      if (Array.isArray(parsed) && parsed.length === 6) {
        return parsed.map(q => ({
          question: q.question,
          difficulty: q.difficulty,
          timeLimit: q.timeLimit
        }));
      }
    }
    if (provider === 'gemini' && geminiApiKey) {
      const genAI = new GoogleGenerativeAI(geminiApiKey);
      const preferred = process.env.GEMINI_MODEL || 'gemini-pro';
      // Broad set of commonly available model ids for v1beta
      const candidates = [
        preferred,
        'gemini-pro',
        'gemini-1.5-pro',
        'gemini-1.5-flash',
        'gemini-1.5-pro-latest',
        'gemini-1.5-flash-latest',
        'gemini-1.0-pro',
        'gemini-1.0-pro-latest',
        'gemini-1.5-flash-8b',
        'gemini-1.5-flash-8b-latest'
      ];
      const contextText = context.resumeText ? `Resume excerpt: ${context.resumeText.slice(0, 1200)}` : '';
      const prompt = `You are an interview assistant. Generate 6 concise technical questions for a Full-Stack (React + Node) role: 2 easy (20s), 2 medium (60s), 2 hard (120s). Return ONLY JSON array of 6 objects with fields: question, difficulty in [easy, medium, hard], timeLimit in [20,60,120]. ${contextText}`;
      let lastErr;
      for (const modelName of candidates) {
        try {
          const model = genAI.getGenerativeModel({ model: modelName });
          const resp = await model.generateContent(prompt);
          const text = resp.response.text();
          const parsed = extractJson(text);
          if (Array.isArray(parsed) && parsed.length === 6) {
            console.log(`[AI] Gemini model used: ${modelName}`);
            return parsed.map(q => ({ question: q.question, difficulty: q.difficulty, timeLimit: q.timeLimit }));
          }
        } catch (e) {
          lastErr = e;
          if (e?.status === 404) {
            console.warn(`[AI] Gemini model not found: ${modelName}`);
            continue;
          }
          throw e;
        }
      }
      if (lastErr) throw lastErr;
    }
  } catch (e) {
    if (requireAI) throw e;
  }
  if (requireAI) throw new Error('AI is required but not configured');
  return null;
}

export async function scoreAnswerWithAI({ question, answer, difficulty, resumeText }) {
  try {
    if (provider === 'openai' && openaiApiKey) {
      const client = getOpenAIClient();
      const system = 'You are an interview evaluator. Score answers 0-10 (integer). Consider technical accuracy, completeness, clarity, and relevance; higher expectations for hard questions. Return ONLY JSON.';
      const resumeHint = resumeText ? `\nResume excerpt: ${resumeText.slice(0, 600)}` : '';
      const user = `Question (${difficulty}): ${question}${resumeHint}\nCandidate Answer: ${answer}\nReturn JSON only: {"score": integer 0-10, "rationale": string (<= 200 chars)}`;
      const resp = await client.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user }
        ],
        temperature: 0.2
      });
      const content = resp.choices?.[0]?.message?.content;
      const parsed = extractJson(content);
      if (typeof parsed?.score === 'number') {
        return { score: Math.max(0, Math.min(10, Math.round(parsed.score))), rationale: parsed.rationale || '' };
      }
    }
    if (provider === 'gemini' && geminiApiKey) {
      const genAI = new GoogleGenerativeAI(geminiApiKey);
      const preferred = process.env.GEMINI_MODEL || 'gemini-pro';
      const candidates = [
        preferred,
        'gemini-pro',
        'gemini-1.5-pro',
        'gemini-1.5-flash',
        'gemini-1.5-pro-latest',
        'gemini-1.5-flash-latest',
        'gemini-1.0-pro',
        'gemini-1.0-pro-latest',
        'gemini-1.5-flash-8b',
        'gemini-1.5-flash-8b-latest'
      ];
      const resumeHint = resumeText ? `\nResume excerpt: ${resumeText.slice(0, 600)}` : '';
      const prompt = `You are an interview evaluator. Score answers 0-10 (integer). Consider technical accuracy, completeness, clarity, and relevance; higher expectations for hard questions. Return ONLY JSON.\nQuestion (${difficulty}): ${question}${resumeHint}\nCandidate Answer: ${answer}\nReturn JSON only: {"score": integer 0-10, "rationale": string (<= 200 chars)}`;
      let lastErr;
      for (const modelName of candidates) {
        try {
          const model = genAI.getGenerativeModel({ model: modelName });
          const resp = await model.generateContent(prompt);
          const text = resp.response.text();
          const parsed = extractJson(text);
          if (typeof parsed?.score === 'number') {
            console.log(`[AI] Gemini model used (score): ${modelName}`);
            return { score: Math.max(0, Math.min(10, Math.round(parsed.score))), rationale: parsed.rationale || '' };
          }
        } catch (e) {
          lastErr = e;
          if (e?.status === 404) {
            console.warn(`[AI] Gemini model not found (score): ${modelName}`);
            continue;
          }
          throw e;
        }
      }
      if (lastErr) throw lastErr;
    }
  } catch (e) {
    if (requireAI) throw e;
  }
  if (requireAI) throw new Error('AI is required but not configured');
  // Fallback heuristic scoring
  const keywords = ['react','component','hook','state','props','node','express','api','database','async','await','promise','mongodb','performance','scalability'];
  let score = 5;
  const lengthBonus = answer.length > 400 ? 3 : answer.length > 200 ? 2 : answer.length > 80 ? 1 : 0;
  const keywordCount = keywords.filter(k => answer.toLowerCase().includes(k)).length;
  const keywordBonus = Math.min(3, Math.floor(keywordCount / 3));
  const difficultyAdj = difficulty === 'hard' ? 1 : difficulty === 'easy' ? 0 : 0.5;
  score = score + lengthBonus + keywordBonus + difficultyAdj;
  return { score: Math.max(0, Math.min(10, Math.round(score))), rationale: '' };
}


