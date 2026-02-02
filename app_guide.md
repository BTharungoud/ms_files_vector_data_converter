# Vector File Ingestion Service - Application Guide

A TypeScript-based file ingestion service that converts text and Excel files into vector embeddings and stores them in PostgreSQL with pgvector support.

## Prerequisites

Before you begin, ensure you have the following installed on your machine:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **PostgreSQL** (v12 or higher) with pgvector extension
- **Git** - [Download](https://git-scm.com/)
- **curl** - For testing API endpoints (or use Postman)

## Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/ms_files_vector_data_converter.git
cd ms_files_vector_data_converter
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up PostgreSQL Database

#### Create a new PostgreSQL database:

```sql
CREATE DATABASE vector_converter;
```

#### Connect to the database and enable pgvector extension:

```bash
psql -U postgres -d vector_converter
```

Then run the schema:

```sql
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
```

Or run the schema file directly:

```bash
psql -U postgres -d vector_converter -f doc/sql/schema.sql
```

### 4. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
touch .env
```

Add the following environment variables:

```env
# PostgreSQL Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password_here
DB_NAME=vector_converter

# Server Configuration
PORT=9009
```

**Important:** Replace `your_password_here` with your PostgreSQL password.

### 5. Build the Application (Optional for Development)

For development, use the dev server with automatic reload:

```bash
npm run dev
```

For production, build first:

```bash
npm run build
npm run start
```

## Running the Application

### Start the Development Server

```bash
npm run dev
```

You should see output:

```
🚀 Vector ingestion service running on port 9009
```

The server is now running and ready to accept file uploads.

## Sample API Calls

### Upload a Text File

#### Using curl:

```bash
curl -X POST http://localhost:9009/api/upload \
  -F "file=@/path/to/your/file.txt" \
  -F "nickname=my-document"
```

**Example with a sample file:**

```bash
curl -X POST http://localhost:9009/api/upload \
  -F "file=@doc/uploads/dummy_file.txt" \
  -F "nickname=sample-doc"
```

#### Response (Success):

```json
{
  "status": "success",
  "uploadId": "550e8400-e29b-41d4-a716-446655440000",
  "chunks": 5
}
```

### Upload an Excel File

```bash
curl -X POST http://localhost:9009/api/upload \
  -F "file=@/path/to/your/spreadsheet.xlsx" \
  -F "nickname=excel-data"
```

### Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file` | File | Yes | Text (.txt) or Excel (.xlsx) file to upload |
| `nickname` | String | Yes | A friendly name for the uploaded document |

### Supported File Types

- `.txt` - Plain text files
- `.xlsx` - Excel spreadsheets (all worksheets are processed)

### Error Responses

**Missing file or nickname:**

```json
{
  "message": "File and nickname required"
}
```

**Unsupported file type:**

```json
{
  "message": "Unsupported file type"
}
```

**Server error:**

```json
{
  "message": "Upload failed"
}
```

## How It Works

1. **File Upload** - Client sends a file (TXT or XLSX) with a nickname
2. **File Parsing** - Service reads and extracts text content
3. **Chunking** - Large text is split into manageable chunks
4. **Embedding Generation** - Each chunk is converted to a 1536-dimensional vector
5. **Storage** - Vectors and metadata are stored in PostgreSQL with pgvector

## Project Structure

```
src/
├── app.ts                 # Express server setup
├── config/
│   └── db.ts             # PostgreSQL connection pool
├── interfaces/
│   └── file-reader.interface.ts  # File reader interface
├── readers/
│   ├── txt.reader.ts     # Text file reader
│   └── excel.reader.ts   # Excel file reader
├── routes/
│   └── upload.route.ts   # Upload endpoint
├── services/
│   ├── chunker.service.ts      # Text chunking logic
│   ├── embedding.service.ts    # Vector generation
│   └── vector.service.ts       # Database vector storage
└── utils/
    └── file-type.util.ts       # File type validation
```

## Troubleshooting

### Port 9009 already in use

If you get `EADDRINUSE: address already in use :::9009`, another process is using the port.

**Windows:**
```powershell
netstat -ano | findstr :9009
taskkill /PID <PID> /F
```

**macOS/Linux:**
```bash
lsof -i :9009
kill -9 <PID>
```

### Database Connection Error

Ensure PostgreSQL is running and `.env` variables are correct:

```bash
# Test connection with psql
psql -U postgres -d vector_converter -c "SELECT 1"
```

### Missing pgvector Extension

If you get an error about the vector type not existing:

```bash
psql -U postgres -d vector_converter -c "CREATE EXTENSION vector;"
```

## Development Commands

```bash
# Start dev server with auto-reload
npm run dev

# Build TypeScript to JavaScript
npm run build

# Start production server
npm run start

# Build and start
npm run start-build
```

## Next Steps

- Implement semantic search queries using vector similarity
- Add authentication/authorization
- Implement batch file uploads
- Add vector similarity endpoints
- Set up automated testing

## Support

For issues or questions, please create an issue in the repository.
