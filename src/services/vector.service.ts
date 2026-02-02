// src/services/vector.service.ts
import { pool } from "../config/db";
import { v4 as uuid } from "uuid";

export async function saveVector(
  uploadId: string,
  index: number,
  content: string,
  embedding: number[]
) {
  await pool.query(
    `INSERT INTO file_vectors
     (id, upload_id, chunk_index, content, embedding)
     VALUES ($1, $2, $3, $4, $5)`,
    [uuid(), uploadId, index, content, `[${embedding.join(",")}]`]
  );
}
