import { GoogleGenerativeAI } from "@langchain/google-genai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

const genAI = new GoogleGenerativeAI({
  apiKey: apiKey,
});

export async function askCropAI(question: string) {
  const model = genAI.getGenerativeModel({
    model: "gemini-pro",
  });

  const result = await model.generateContent(question);
  const response = await result.response;

  return response.text();
}