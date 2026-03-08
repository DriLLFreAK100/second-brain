import Koa from 'koa';
import Router from '@koa/router';
import { searchMarkdown, findMarkdownFiles } from './search.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Use .knowledge folder as the base directory for all searches
const BASE_DIR = path.join(__dirname, '..', '.knowledge');
const PORT = process.env.PORT || 3000;

const app = new Koa();
const router = new Router({ prefix: '/api' });

// CORS middleware
app.use(async (ctx, next) => {
  ctx.set('Access-Control-Allow-Origin', '*');
  ctx.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  ctx.set('Access-Control-Allow-Headers', 'Content-Type');
  if (ctx.method === 'OPTIONS') {
    ctx.status = 204;
  } else {
    await next();
  }
});

// Search endpoint
router.get('/search', (ctx) => {
  const { q, context } = ctx.query;

  if (!q) {
    ctx.status = 400;
    ctx.body = { error: 'Query parameter "q" is required' };
    return;
  }

  const contextLines = context ? parseInt(context as string, 10) : 2;

  if (isNaN(contextLines) || contextLines < 0) {
    ctx.status = 400;
    ctx.body = { error: 'Context must be a non-negative number' };
    return;
  }

  try {
    const results = searchMarkdown(q as string, BASE_DIR, contextLines);
    ctx.body = {
      query: q,
      resultsCount: results.length,
      results,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    ctx.status = 500;
    ctx.body = { error: errorMessage };
  }
});

// List files endpoint
router.get('/files', (ctx) => {
  try {
    const files = findMarkdownFiles(BASE_DIR);
    const relativePaths = files.map((file) => path.relative(BASE_DIR, file));
    ctx.body = {
      filesCount: files.length,
      files: relativePaths,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    ctx.status = 500;
    ctx.body = { error: errorMessage };
  }
});

// Health check endpoint
router.get('/health', (ctx) => {
  ctx.body = { status: 'ok' };
});

app.use(router.routes());
app.use(router.allowedMethods());

// Error handling
app.on('error', (error, ctx) => {
  console.error('Server error:', error);
  ctx.status = 500;
  ctx.body = { error: 'Internal server error' };
});

const server = app.listen(PORT, () => {
  console.log(`🧠 Second Brain API server running on http://localhost:${PORT}`);
  console.log(`📍 Available endpoints:`);
  console.log(`   GET /api/search?q=term&context=2`);
  console.log(`   GET /api/files`);
  console.log(`   GET /api/health`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  server.close(() => {
    process.exit(0);
  });
});
