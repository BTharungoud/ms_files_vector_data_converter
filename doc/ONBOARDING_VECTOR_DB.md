# 👋 Team Onboarding

## Vector Database Setup (PostgreSQL + pgvector + Docker)

Welcome to the project!
This document helps new team members **set up the local vector database environment** used for:

* PDF ingestion
* Text chunking
* Vector embeddings
* Semantic search / RAG pipelines

By the end of this guide, you should have:

* PostgreSQL running via Docker
* pgvector enabled
* pgAdmin connected
* A working vector schema

---

## 🧠 What You’re Setting Up (Mental Model)

```
Your Machine (Windows)
 ├── Docker Desktop
 │    └── PostgreSQL 16 (Linux)
 │         └── pgvector extension
 │
 └── pgAdmin 4
      └── Database UI & SQL client
```

⚠️ **Important**

* pgvector does **NOT** work with native Windows PostgreSQL
* Docker is **mandatory**
* pgAdmin is **only a client**, not the database

---

## ✅ Prerequisites (Before You Start)

Ensure you have:

* Windows 10 / 11
* Admin access on your machine
* Stable internet connection

---

## 1️⃣ Install pgAdmin 4 (Database Client)

### Purpose

Used to:

* Connect to PostgreSQL
* Run SQL queries
* Inspect tables & data

### Steps

1. Download from: [https://www.pgadmin.org/download/](https://www.pgadmin.org/download/)
2. Install with default options
3. Launch pgAdmin
4. Set a **master password** on first launch

✅ **Checkpoint**

* pgAdmin UI opens successfully

---

## 2️⃣ Install Docker Desktop (Database Runtime)

### Purpose

Runs PostgreSQL in a Linux container (required for pgvector).

### Steps

1. Download from: [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/)
2. Install Docker Desktop
3. Enable **WSL 2 backend** when prompted
4. Restart your machine

### Verify installation

Open **Command Prompt** and run:

```bash
docker --version
```

✅ **Checkpoint**

* Docker version is printed (no errors)

---

## 3️⃣ Start PostgreSQL + pgvector (Docker)

### Why Docker?

* pgvector binaries are Linux-only
* Avoids Windows compatibility issues
* Matches production-like setup

### Run this command (copy-paste):

```bash
docker run -d ^
  --name pgvector-db ^
  -p 5433:5432 ^
  -v pgvector_data:/var/lib/postgresql/data ^
  -e POSTGRES_USER=postgres ^
  -e POSTGRES_PASSWORD=vector ^
  -e POSTGRES_DB=vector_db ^
  pgvector/pgvector:pg16
```

### What this creates

| Item             | Value       |
| ---------------- | ----------- |
| Container name   | pgvector-db |
| Database         | vector_db   |
| Username         | postgres    |
| Password         | vector      |
| Host port        | 5433        |
| Data persistence | Enabled     |

### Verify container

```bash
docker ps
```

✅ **Checkpoint**

* Container `pgvector-db` is running
* Port mapping shows `5433 -> 5432`

---

## 4️⃣ Daily Docker Commands (Know These)

```bash
docker start pgvector-db
docker stop pgvector-db
docker restart pgvector-db
docker ps
```

⚠️ If Docker stops, **your database stops**.

---

## 5️⃣ Connect pgAdmin to Docker Database

### Register New Server in pgAdmin

Right-click **Servers → Register → Server**

#### General Tab

* **Name**: `Docker PostgreSQL (pgvector)`

#### Connection Tab

| Field          | Value     |
| -------------- | --------- |
| Host           | localhost |
| Port           | 5433      |
| Maintenance DB | vector_db |
| Username       | postgres  |
| Password       | vector    |
| Save Password  | ✅         |

Click **Save**

---

## 6️⃣ CRITICAL CHECK: Verify You’re on Docker (Not Local DB)

Run in pgAdmin Query Tool:

```sql
SELECT version();
```

### ✅ Correct (Docker)

```
x86_64-pc-linux-gnu
```

### ❌ Wrong (Local Windows DB)

```
Visual C++
```

🚨 If you see **Visual C++**, STOP and recheck:

* Port (must be 5433)
* Server entry in pgAdmin

---

## 7️⃣ Enable pgvector Extension

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

Verify:

```sql
SELECT extname FROM pg_extension;
```

✅ **Checkpoint**

* `vector` is listed

---

## 8️⃣ Create Project Tables

### Enable UUID support

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### Schema

```sql
CREATE TABLE file_uploads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nickname TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE file_vectors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  upload_id UUID REFERENCES file_uploads(id) ON DELETE CASCADE,
  chunk_index INT NOT NULL,
  content TEXT NOT NULL,
  embedding VECTOR(1536) NOT NULL
);
```

---

## 9️⃣ Insert Test Data (Validation Step)

```sql
INSERT INTO file_uploads (nickname, file_name, file_type)
VALUES ('demo', 'sample.pdf', 'application/pdf')
RETURNING id;
```

Then insert a dummy vector:

```sql
INSERT INTO file_vectors (upload_id, chunk_index, content, embedding)
SELECT
  id,
  0,
  'hello vector world',
  array_fill(0.01, ARRAY[1536])::vector
FROM file_uploads
LIMIT 1;
```

---

## 🔍 Test Vector Search

```sql
SELECT
  content,
  1 - (embedding <=> array_fill(0.01, ARRAY[1536])::vector) AS similarity
FROM file_vectors
ORDER BY embedding <=> array_fill(0.01, ARRAY[1536])::vector
LIMIT 3;
```

✅ **Checkpoint**

* Query returns inserted text

---

## ⚠️ Common Issues New Joiners Face

| Issue               | Cause                    | Fix                             |
| ------------------- | ------------------------ | ------------------------------- |
| pgvector not found  | Connected to Windows DB  | Check port & `SELECT version()` |
| Port already in use | Local PostgreSQL running | Use port 5433                   |
| UUID null error     | Missing default          | Ensure `uuid_generate_v4()`     |
| Dimension mismatch  | Vector length ≠ 1536     | Use real embeddings             |

---

## 🔑 Environment Variables (For App Code)

```env
DB_HOST=localhost
DB_PORT=5433
DB_USER=postgres
DB_PASSWORD=vector
DB_NAME=vector_db
```

---

## 🧭 What Happens Next in the Project

After onboarding, you will work on:

* PDF text extraction
* Chunking strategies
* Embedding generation
* Vector search APIs
* RAG pipelines

---

## ✅ Onboarding Completion Checklist

* [ ] Docker running
* [ ] pgAdmin connected
* [ ] `SELECT version()` shows linux
* [ ] pgvector enabled
* [ ] Tables created
* [ ] Vector search works

---

## 📣 Need Help?

If you’re stuck:

1. Copy the **exact error**
2. Run:

   ```sql
   SELECT version();
   ```
3. Share both with the team

---

Welcome aboard 🚀
You’re now ready to work with the vector database system.
