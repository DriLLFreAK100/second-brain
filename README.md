# 🧠 Second Brain - REST API + CLI Query Engine

A TypeScript-based REST API and CLI tool to search and query your markdown knowledge base. The architecture separates the server backend from the CLI client, allowing flexible deployment and usage patterns.

## Architecture

```
┌─────────────────────┐
│   CLI Client        │
│  (src/cli.ts)      │
└──────────┬──────────┘
           │ HTTP
           ▼
┌──────────────────────┐
│   REST API Server    │
│  (src/server.ts)     │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  Search Logic        │
│  (src/search.ts)     │
└──────────────────────┘
```

## Setup

### Prerequisites

- Node.js 16+

### Installation

```bash
npm install
npm run build
```

## Usage

### Start the Server

```bash
npm run start
# Server runs on http://localhost:3000
```

### Run CLI (in another terminal)

```bash
# Search for a term
node dist/cli.js query "your search term"
node dist/cli.js q "your search term"

# List all files
node dist/cli.js list
node dist/cli.js ls

# Check server health
node dist/cli.js health
```

### With Context Options

```bash
# Show 5 lines of context around matches (default is 2)
node dist/cli.js query "term" --context 5
node dist/cli.js query "term" -c 5
```

## Development

### Run Server in Development Mode (with auto-rebuild)

```bash
npm run dev:server
```

This uses **nodemon** to watch for TypeScript changes in `src/`, automatically recompile, and restart the server.

### Run CLI in Development Mode

```bash
# In another terminal (with server running)
npm run dev:cli query "term"
```

### Rebuild TypeScript

```bash
npm run build
```

### Clean Compiled Files

```bash
npm run clean
```

## REST API Endpoints

### Search

```
GET /api/search?q=term&context=2

Response:
{
  "query": "term",
  "resultsCount": 1,
  "results": [
    {
      "file": ".knowledge/change-address.md",
      "filePath": "/full/path/to/file.md",
      "matchCount": 1,
      "matches": [
        {
          "lineNumber": 2,
          "matchedLine": "2. term in context",
          "snippet": "1. previous line\n2. term in context\n3. next line",
          "startLine": 1,
          "endLine": 3
        }
      ]
    }
  ]
}
```

### List Files

```
GET /api/files

Response:
{
  "filesCount": 4,
  "files": [
    ".knowledge/change-address.md",
    ".knowledge/drums/accent-grids.md",
    ".knowledge/drums/exercises.md",
    "README.md"
  ]
}
```

### Health Check

```
GET /api/health

Response:
{
  "status": "ok"
}
```

## Examples

### Terminal 1: Start the server

```bash
npm run start
# Output:
# 🧠 Second Brain API server running on http://localhost:3000
# 📍 Available endpoints:
#    GET /api/search?q=term&context=2
#    GET /api/files
#    GET /api/health
```

### Terminal 2: Use the CLI

```bash
# Search for "drums"
node dist/cli.js query "drums"

# Search with more context
node dist/cli.js query "accent" -c 3

# List all files
node dist/cli.js list

# Check server status
node dist/cli.js health
```

### Using curl to call the API directly

```bash
# Search
curl "http://localhost:3000/api/search?q=accent&context=2"

# List files
curl "http://localhost:3000/api/files"

# Health check
curl "http://localhost:3000/api/health"
```

## Project Structure

```
second-brain/
├── src/
│   ├── server.ts          # REST API server (Koa)
│   ├── cli.ts             # CLI client
│   ├── api-client.ts      # API client library for CLI
│   └── search.ts          # Core search logic
├── dist/                  # Compiled JavaScript (generated)
├── .knowledge/            # Your knowledge base
│   ├── change-address.md
│   └── drums/
│       ├── accent-grids.md
│       └── exercises.md
├── package.json           # Project dependencies
├── tsconfig.json          # TypeScript configuration
├── README.md              # This file
└── .gitignore             # Git ignore rules
```

## Features

✅ **REST API Server** - Host your knowledge base as a service  
✅ **CLI Client** - User-friendly command-line interface  
✅ **Full-text search** - Case-insensitive search across all markdown files  
✅ **TypeScript** - Type-safe development  
✅ **Context snippets** - Display matched lines with surrounding content  
✅ **Recursive directory scanning** - Automatically discover all knowledge files  
✅ **Colored output** - Easy-to-read terminal formatting  
✅ **CORS enabled** - Call the API from different origins  
✅ **Health checks** - Monitor server status

## Tech Stack

- **TypeScript** - Type-safe development
- **Koa** - Minimal and flexible REST API framework
- **Koa Router** - URL routing for Koa
- **Commander.js** - CLI framework
- **Chalk** - Colored terminal output
- **tsx** - TypeScript execution for development

## Environment Variables

```bash
# Custom API URL (CLI only, defaults to http://localhost:3000/api)
BRAIN_API_URL=http://example.com/api

# Custom server port (Server only, defaults to 3000)
PORT=8080
```

## Future Enhancements

- [ ] Support for tags/metadata in frontmatter
- [ ] Full-text search index for faster queries
- [ ] Export results to different formats (JSON, CSV)
- [ ] Interactive mode with fuzzy search
- [ ] Watch mode to reindex on file changes
- [ ] Configuration file for search settings
- [ ] Global CLI installation with npm link
- [ ] Docker containerization
- [ ] Web UI for search and browse
- [ ] Webhook support for indexing events
- [ ] Authentication and multi-user support
