
import Analysis from '../models/Analysis.js';
import { performResearch } from '../services/langchainService.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { logger } from '../utils/logger.js';


const CACHE_TTL_HOURS = 24;

// ─────────────────────────────────────────────
// POST /api/analyze
// ─────────────────────────────────────────────
export const analyzeCompany = async (req, res, next) => {
  const { companyName } = req.body;

  try {
    // ── Step 1: Check MongoDB for a recent cached report ──
    const cacheThreshold = new Date(Date.now() - CACHE_TTL_HOURS * 60 * 60 * 1000);

    const cachedReport = await Analysis.findOne({
      companyName: { $regex: new RegExp(`^${companyName}$`, 'i') },
      createdAt:   { $gte: cacheThreshold },
    }).sort({ createdAt: -1 });

    if (cachedReport) {
      logger.info(`[Cache HIT] Returning cached report for "${companyName}" (ID: ${cachedReport._id})`);
      return sendSuccess(res, { ...cachedReport.toObject(), cached: true });
    }

    logger.info(`[Cache MISS] No fresh report found for "${companyName}". Running AI pipeline...`);

    // ── Step 2: Run the full LangChain → Gemini → analysis pipeline ──
    const reportData = await performResearch(companyName);

    // ── Step 3: Persist to MongoDB ──
    let savedReport;
    try {
      const report = new Analysis(reportData);
      savedReport = await report.save();
      logger.info(`[DB] Report saved successfully. ID: ${savedReport._id}`);
    } catch (dbErr) {
      logger.warn(`[DB] Could not save report (offline mode): ${dbErr.message}`);
      savedReport = { ...reportData, _id: `offline_${Date.now()}`, offline: true };
    }

    return sendSuccess(res, savedReport, 201);

  } catch (err) {
    logger.error(`[analyzeCompany] ${err.message}`);
    next(err);
  }
};

// ─────────────────────────────────────────────
// GET /api/history
// ─────────────────────────────────────────────
export const getHistory = async (req, res, next) => {
  try {
    const { limit = 20, page = 1 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [reports, total] = await Promise.all([
      Analysis.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .select('companyName recommendation investmentScore confidenceScore createdAt'),
      Analysis.countDocuments(),
    ]);

    return sendSuccess(res, {
      reports,
      pagination: {
        total,
        page:       Number(page),
        limit:      Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    logger.error(`[getHistory] ${err.message}`);
    // Return empty list gracefully if DB is unavailable
    return sendSuccess(res, { reports: [], pagination: { total: 0, page: 1, limit: 20, totalPages: 0 } });
  }
};

// ─────────────────────────────────────────────
// GET /api/history/:id
// ─────────────────────────────────────────────
export const getReportById = async (req, res, next) => {
  try {
    const report = await Analysis.findById(req.params.id);

    if (!report) {
      return sendError(res, `Report with ID "${req.params.id}" not found.`, 404);
    }

    return sendSuccess(res, report);
  } catch (err) {
    logger.error(`[getReportById] ${err.message}`);
    next(err);
  }
};

// ─────────────────────────────────────────────
// DELETE /api/history/:id
// ─────────────────────────────────────────────
export const deleteReport = async (req, res, next) => {
  try {
    const report = await Analysis.findByIdAndDelete(req.params.id);

    if (!report) {
      return sendError(res, `Report with ID "${req.params.id}" not found.`, 404);
    }

    logger.info(`[DB] Report deleted. ID: ${req.params.id}`);
    return sendSuccess(res, { message: `Report for "${report.companyName}" deleted successfully.` });
  } catch (err) {
    logger.error(`[deleteReport] ${err.message}`);
    next(err);
  }
};
