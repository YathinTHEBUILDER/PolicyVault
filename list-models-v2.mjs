import { GoogleGenerativeAI } from '@google/generative-ai';

async function list() {
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);
  // Try v1 first
  console.log('--- V1 Models ---');
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${process.env.GOOGLE_GEMINI_API_KEY}`);
    const data = await response.json();
    console.log(JSON.stringify(data.models?.map(m => m.name), null, 2));
  } catch (e) {
    console.log('V1 Fetch failed');
  }

  console.log('\n--- V1BETA Models ---');
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GOOGLE_GEMINI_API_KEY}`);
    const data = await response.json();
    console.log(JSON.stringify(data.models?.map(m => m.name), null, 2));
  } catch (e) {
    console.log('V1BETA Fetch failed');
  }
}

list();
