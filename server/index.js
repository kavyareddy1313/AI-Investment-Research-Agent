import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import analysisRoutes from './routes/analysisRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { logger } from './utils/logger.js';


dotenv.config();

const app  = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

connectDB();


app.use('/api', analysisRoutes);


app.get('/health', (req, res) => {
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY;
  const tavilyKey = process.env.TAVILY_API_KEY;
  const mongoUri  = process.env.MONGODB_URI;

  res.status(200).json({
    success:  true,
    service:  'InvestIQ AI API Server',
    services: {
      gemini:  { connected: !!(geminiKey && !geminiKey.includes('YOUR_KEY')) },
      tavily:  { connected: !!(tavilyKey && !tavilyKey.includes('YOUR_KEY')) },
      mongodb: { connected: !!(mongoUri && !mongoUri.includes('xxxxx')) },
    },
    endpoints: {
      analyze:        'POST /api/analyze',
      history:        'GET  /api/history',
      historyById:    'GET  /api/history/:id',
      deleteReport:   'DELETE /api/history/:id',
    },
  });
});


app.use((req, res) => {
  res.status(404).json({ success: false, error: `Route ${req.method} ${req.path} not found.` });
});

app.use(errorHandler);

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
