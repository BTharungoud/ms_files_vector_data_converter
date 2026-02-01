CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE file_uploads (
  id UUID PRIMARY KEY,
  nickname TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE file_vectors (
  id UUID PRIMARY KEY,
  upload_id UUID REFERENCES file_uploads(id),
  chunk_index INT,
  content TEXT,
  embedding VECTOR(1536)
);

CREATE INDEX file_vectors_embedding_idx
ON file_vectors USING ivfflat (embedding vector_cosine_ops);
