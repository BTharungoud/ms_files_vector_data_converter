// src/services/embedding.service.ts
export async function generateEmbedding(text: string): Promise<number[]> {
  // Replace with OpenAI / local model later
  return Array.from({ length: 1536 }, () => Math.random());
}
