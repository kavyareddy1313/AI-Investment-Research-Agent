/**
 * routes/analysisRoutes.js
 * REST API routes for InvestIQ AI analysis endpoints.
 *
 * POST   /api/analyze          → Run AI investment analysis
 * GET    /api/history          → Paginated history list
 * GET    /api/history/:id      → Single report by ID
 * DELETE /api/history/:id      → Delete a report
 */

import express from 'express';
import {
  analyzeCompany,
  getHistory,
  getReportById,
  deleteReport,
} from '../controllers/analysisController.js';
import { validateCompanyName, validateObjectId } from '../middleware/validate.js';

const router = express.Router();

// POST /api/analyze
router.post('/analyze', validateCompanyName, analyzeCompany);

// GET /api/history  (supports ?limit=20&page=1)
router.get('/history', getHistory);

// GET /api/history/:id
router.get('/history/:id', validateObjectId, getReportById);

// DELETE /api/history/:id
router.delete('/history/:id', validateObjectId, deleteReport);

export default router;
