// Render-compatible Node.js server for Morrow API routes
// This mimics the Next.js API routes functionality
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const rateLimit = require('rate-limit');
const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '32kb' }));

// Simple rate limiter (in-memory for Render)
const rateLimiters = {};

function createRateLimiter(key, max, windowMs) {
  if (!rateLimiters[key]) {
    rateLimiters[key] = {
      count: 0,
      resetTime: Date.now() + windowMs,
    };
  }
  
  const limiter = rateLimiters[key];
  const now = Date.now();
  
  // Reset if window has passed
  if (now > limiter.resetTime) {
    limiter.count = 0;
    limiter.resetTime = now + windowMs;
  }
  
  if (limiter.count >= max) {
    const retryAfter = Math.ceil((limiter.resetTime - now) / 1000);
    return {
      allowed: false,
      retryAfterSeconds: retryAfter,
    };
  }
  
  limiter.count++;
  return { allowed: true };
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API: Plan generation (simplified)
app.post('/api/plan', (req, res) => {
  const { OPENAI_API_KEY, GEMINI_API_KEY, OPENROUTER_API_KEY } = process.env;
  const { brief } = req.body;
  
  if (!brief) {
    return res.status(400).json({ error: 'Brief is required' });
  }
  
  // Check for AI key
  let aiKey;
  if (GEMINI_API_KEY) aiKey = GEMINI_API_KEY;
  else if (OPENAI_API_KEY) aiKey = OPENAI_API_KEY;
  else if (OPENROUTER_API_KEY) aiKey = OPENROUTER_API_KEY;
  
  if (!aiKey) {
    return res.status(200).json({ 
      plan: null, 
      source: 'guided',
      message: 'Add an AI API key to enable creative planning' 
    });
  }
  
  // In a real deployment, this would call the AI API
  // For now, return a guided response
  res.json({ 
    plan: { 
      id: 'temp-' + Date.now(),
      brief,
      vendors: [],
      tasks: [],
      createdAt: new Date().toISOString()
    }, 
    source: 'guided' 
  });
});

// API: Copilot chat
app.post('/api/copilot', (req, res) => {
  const { message } = req.body;
  
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }
  
  // Return guided response if no AI key
  res.json({ 
    reply: `I received your message: "${message}". Add an AI API key for intelligent responses.`,
    source: 'guided' 
  });
});

// Fallback API route handler for Next.js compatibility
app.all('/api/*', (req, res) => {
  res.status(404).json({ error: 'Not found' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Morrow backend running on port ${PORT}`);
  console.log('Environment variables needed:');
  console('  - GEMINI_API_KEY');
  console('  - OPENAI_API_KEY');
  console('  - OPENROUTER_API_KEY');
  console('  - DATABASE_URL (optional)');
});