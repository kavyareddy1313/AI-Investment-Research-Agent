import mongoose from 'mongoose';

// ── Subdocuments ──────────────────────────────────────────

const CompetitorSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  marketCap: { type: String, required: true, trim: true, maxlength: 50 },
  strengths: { type: String, required: true, trim: true, maxlength: 500 }
});

const NewsItemSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 300 },
  source: { type: String, required: true, trim: true, maxlength: 100 },
  snippet: { type: String, required: true, trim: true, maxlength: 1000 },
  url: { type: String, required: true, trim: true, match: /^https?:\/\// }
});

const DimensionScoresSchema = new mongoose.Schema({
  revenueGrowthScore: { type: Number, min: 0, max: 100, required: true },
  revenueGrowthAnalysis: { type: String, required: true },
  financialStabilityScore: { type: Number, min: 0, max: 100, required: true },
  financialStabilityAnalysis: { type: String, required: true },
  competitiveAdvantageScore: { type: Number, min: 0, max: 100, required: true },
  competitiveAdvantageAnalysis: { type: String, required: true },
  industryOutlookScore: { type: Number, min: 0, max: 100, required: true },
  industryOutlookAnalysis: { type: String, required: true },
  innovationScore: { type: Number, min: 0, max: 100, required: true },
  innovationAnalysis: { type: String, required: true },
  newsSentimentScore: { type: Number, min: 0, max: 100, required: true },
  newsSentimentAnalysis: { type: String, required: true },
  riskFactorScore: { type: Number, min: 0, max: 100, required: true },
  riskFactorAnalysis: { type: String, required: true },
  growthPotentialScore: { type: Number, min: 0, max: 100, required: true },
  growthPotentialAnalysis: { type: String, required: true }
});

// ── Main Schema ───────────────────────────────────────────

const AnalysisSchema = new mongoose.Schema(
  {
    companyName: { 
      type: String, 
      required: [true, 'Company name is required'], 
      trim: true,
      maxlength: [100, 'Company name cannot exceed 100 characters']
    },
    overview: { 
      type: String, 
      required: [true, 'Company overview is required'],
      alias: 'companyOverview' // maps to our frontend/LLM variable naming gracefully
    },
    industry: { 
      type: String, 
      required: true 
    },
    businessModel: { 
      type: String, 
      required: true 
    },
    financialHealth: { 
      type: String, 
      required: true 
    },
    strengths: {
      type: [String],
      validate: [v => Array.isArray(v) && v.length > 0, 'At least one strength is required']
    },
    weaknesses: {
      type: [String],
      validate: [v => Array.isArray(v) && v.length > 0, 'At least one weakness is required']
    },
    competitors: {
      type: [CompetitorSchema],
      default: []
    },
    recentNews: {
      type: [NewsItemSchema],
      default: []
    },
    growthDrivers: { 
      type: String, 
      required: true,
      alias: 'growthPotential' // aliased to our existing code base variables
    },
    risks: { 
      type: String, 
      required: true,
      alias: 'riskAnalysis' // aliased to our existing code base variables
    },
    investmentScore: { 
      type: Number, 
      required: true,
      min: [0, 'Score cannot be less than 0'],
      max: [100, 'Score cannot exceed 100']
    },
    recommendation: { 
      type: String, 
      enum: {
        values: ['Invest', 'Consider', 'Pass'],
        message: '{VALUE} is not a valid recommendation'
      },
      required: true 
    },
    reasoning: { 
      type: String, 
      required: true 
    },
    confidenceScore: { 
      type: Number, 
      required: true,
      min: 0,
      max: 100
    },
    dimensionScores: {
      type: DimensionScoresSchema,
      required: true
    }
  },
  { 
    // Automatically manage createdAt and updatedAt fields
    timestamps: true 
  }
);

// ── Indexes for Search Optimization ───────────────────────

// 1. Text index for fuzzy searching by company name
AnalysisSchema.index({ companyName: 'text' });

// 2. Compound index for cache-lookup speed (companyName + createdAt)
AnalysisSchema.index({ companyName: 1, createdAt: -1 });

// 3. Index for quickly fetching history sorted by newest
AnalysisSchema.index({ createdAt: -1 });

const Analysis = mongoose.model('Analysis', AnalysisSchema);
export default Analysis;
