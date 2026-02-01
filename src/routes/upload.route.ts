// src/routes/upload.route.ts
import express from "express";
import multer from "multer";
import { v4 as uuid } from "uuid";
import { pool } from "../config/db";
import { readTxt } from "../readers/txt.reader";
import { readExcel } from "../readers/excel.reader";
import { chunkText } from "../services/chunker.service";
import { generateEmbedding } from "../services/embedding.service";
import { saveVector } from "../services/vector.service";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const { nickname } = req.body;
    const file = req.file;

    if (!file || !nickname) {
      return res.status(400).json({ message: "File and nickname required" });
    }

    let content = "";

    if (file.mimetype === "text/plain") {
      content = readTxt(file.path);
    } else if (
      file.mimetype ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
      content = readExcel(file.path);
    } else {
      return res.status(400).json({ message: "Unsupported file type" });
    }

    const uploadId = uuid();

    await pool.query(
      `INSERT INTO file_uploads (id, nickname, file_name, file_type)
       VALUES ($1, $2, $3, $4)`,
      [uploadId, nickname, file.originalname, file.mimetype]
    );

    const chunks = chunkText(content);

    for (let i = 0; i < chunks.length; i++) {
      const embedding = await generateEmbedding(chunks[i]);
      await saveVector(uploadId, i, chunks[i], embedding);
    }

    res.json({
      status: "success",
      uploadId,
      chunks: chunks.length
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Upload failed" });
  }
});

export default router;
