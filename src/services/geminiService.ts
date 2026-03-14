import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

const genAI = new ChatGoogleGenerativeAI({
  apiKey: apiKey,
  model: "gemini-pro",
});

export async function askCropAI(question: string) {
  const result = await genAI.invoke(question);
  return typeof result.content === "string" ? result.content : JSON.stringify(result.content);
}