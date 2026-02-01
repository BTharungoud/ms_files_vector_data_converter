// src/services/chunker.service.ts
export function chunkText(text: string, size = 500): string[] {
  const chunks: string[] = [];
  let buffer = "";

  for (const word of text.split(" ")) {
    buffer += word + " ";
    if (buffer.length >= size) {
      chunks.push(buffer.trim());
      buffer = "";
    }
  }

  if (buffer.trim()) chunks.push(buffer.trim());
  return chunks;
}
