import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function listModels() {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.models) {
      console.log(data.models.map(m => m.name).join('\n'));
    } else {
      console.log(JSON.stringify(data, null, 2));
    }
  } catch (err) {
    console.error("Fetch error:", err);
  }
}

listModels();
