import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function listModels() {
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);
  
  try {
    // We can't directly call listModels from the SDK easily without a specific client
    // but we can try to initialize common ones
    const models = [
      "gemini-1.5-flash",
      "gemini-1.5-flash-latest",
      "gemini-1.5-pro",
      "gemini-2.0-flash-exp"
    ];

    for (const modelName of models) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("test");
        console.log(`✅ Model ${modelName} is working!`);
        process.exit(0);
      } catch (e) {
        console.log(`❌ Model ${modelName} failed: ${e.message}`);
      }
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

listModels();
