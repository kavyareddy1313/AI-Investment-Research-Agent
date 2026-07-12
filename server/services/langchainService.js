import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import axios from 'axios';
import { logger } from '../utils/logger.js';

// ─────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────

// Verified available model from API key probe
const GEMINI_MODEL = 'gemini-2.0-flash';

// ─────────────────────────────────────────────
// STEP 2: TAVILY MULTI-TOPIC INTELLIGENCE GATHER
// ─────────────────────────────────────────────

async function tavilySearch(query, tavilyKey) {
  try {
    const res = await axios.post(
      'https://api.tavily.com/search',
      {
        api_key: tavilyKey,
        query,
        search_depth: 'advanced',
        max_results: 4,
        include_answer: false,
      },
      { timeout: 12000 }
    );
    return res.data.results || [];
  } catch (err) {
    logger.warn(`[Tavily] Query failed: "${query.slice(0, 60)}" — ${err.message}`);
    return [];
  }
}

async function gatherIntelligence(companyName, tavilyKey) {
  logger.step(`[Agent Step 2] Launching 12 parallel Tavily queries for: ${companyName}`);

  const queries = {
    companyOverview: `${companyName} company overview business segments operations 2025`,
    industry:        `${companyName} industry sector market size trends outlook 2025 2026`,
    businessModel:   `${companyName} business model revenue streams monetization strategy`,
    revenue:         `${companyName} annual revenue earnings growth rate quarterly results 2024 2025`,
    profitability:   `${companyName} net profit margin EBITDA operating income profitability`,
    debt:            `${companyName} total debt balance sheet liabilities debt-to-equity ratio`,
    cashFlow:        `${companyName} free cash flow operating cash flow capital expenditure 2025`,
    competitors:     `${companyName} main competitors market share comparison landscape`,
    marketPosition:  `${companyName} market position brand valuation market capitalization`,
    recentNews:      `${companyName} latest news announcements 2025`,
    growthDrivers:   `${companyName} growth drivers catalysts expansion opportunities`,
    risks:           `${companyName} risks regulatory headwinds threats challenges 2025`,
  };

  const entries = Object.entries(queries);
  const results = await Promise.all(
    entries.map(([key, q]) =>
      tavilySearch(q, tavilyKey).then(hits => [key, hits])
    )
  );

  const intelligence = {};
  for (const [key, hits] of results) {
    intelligence[key] = hits.length
      ? hits.map(h => `• [${h.title}] (${h.url})\n  ${(h.content || '').slice(0, 500)}`).join('\n\n')
      : 'No live data retrieved for this category.';
  }

  // Deduplicated sources list
  intelligence._sources = results
    .flatMap(([, hits]) => hits.map(h => ({ title: h.title, url: h.url, source: new URL(h.url).hostname.replace('www.', '') })))
    .filter((v, i, arr) => arr.findIndex(x => x.url === v.url) === i);

  logger.step(`[Agent Step 2] Intelligence gathered. Sources found: ${intelligence._sources.length}`);
  return intelligence;
}

// ─────────────────────────────────────────────
// STEP 3: GEMINI ANALYST SYSTEM PROMPT
// ─────────────────────────────────────────────

const SYSTEM_PROMPT = `You are a Senior Equity Research Analyst. 

Your Responsibilities:
- Research companies.
- Analyze financial health.
- Evaluate market position.
- Analyze risks.
- Evaluate future growth.
- Analyze recent news.
- Generate investment recommendation.
- Assign confidence score.

Core Rules:
1. Output only JSON. No markdown tags, no preamble.
2. Never hallucinate. 
3. If information is unavailable, explicitly say "Data Not Available".
4. Keep reasoning professional and explainable.

Scoring dimensions (each 0–100):
- revenueGrowthScore: Historical CAGR, growth acceleration/deceleration, quality of growth
- financialStabilityScore: Debt levels, interest coverage, cash runway, free cash flow
- competitiveAdvantageScore: Moats — brand, switching costs, network effects, IP, scale
- industryOutlookScore: TAM trajectory, tailwinds/headwinds, regulatory environment
- innovationScore: R&D spend, patent activity, product pipeline, disruption potential
- newsSentimentScore: Quality and direction of recent news
- riskFactorScore: INVERSE score. 100 = very low risk. 0 = existential risk
- growthPotentialScore: Addressable market runway, execution track record, catalysts

Final investmentScore (weighted composite):
  revenueGrowthScore        × 0.15
  financialStabilityScore   × 0.20
  competitiveAdvantageScore × 0.20
  industryOutlookScore      × 0.10
  innovationScore           × 0.10
  newsSentimentScore        × 0.05
  riskFactorScore           × 0.10
  growthPotentialScore      × 0.10

Decision rules (apply STRICTLY):
  investmentScore ≥ 80 → recommendation = "Invest"
  investmentScore 60–79 → recommendation = "Consider"
  investmentScore < 60  → recommendation = "Pass"`;

function buildPrompt(companyName, intel) {
  return `Conduct a full equity research evaluation for: ${companyName}

=== INTELLIGENCE GATHERED VIA TAVILY WEB SEARCH ===

[COMPANY OVERVIEW]
${intel.companyOverview}

[INDUSTRY & SECTOR]
${intel.industry}

[BUSINESS MODEL]
${intel.businessModel}

[REVENUE & GROWTH]
${intel.revenue}

[PROFITABILITY]
${intel.profitability}

[DEBT & BALANCE SHEET]
${intel.debt}

[CASH FLOW]
${intel.cashFlow}

[COMPETITORS & MARKET SHARE]
${intel.competitors}

[MARKET POSITION & BRAND]
${intel.marketPosition}

[RECENT NEWS & SENTIMENT]
${intel.recentNews}

[GROWTH DRIVERS & CATALYSTS]
${intel.growthDrivers}

[RISKS & HEADWINDS]
${intel.risks}

=== REQUIRED JSON OUTPUT ===

{
  "companyName": "<full name and ticker if public>",
  "recommendation": "<Invest|Consider|Pass>",
  "investmentScore": <0-100 weighted composite>,
  "confidenceScore": <0-100 based on data completeness>,

  "dimensionScores": {
    "revenueGrowthScore": <0-100>,
    "revenueGrowthAnalysis": "<2-3 sentence evidence-backed evaluation>",
    "financialStabilityScore": <0-100>,
    "financialStabilityAnalysis": "<2-3 sentence evaluation>",
    "competitiveAdvantageScore": <0-100>,
    "competitiveAdvantageAnalysis": "<2-3 sentence moat evaluation>",
    "industryOutlookScore": <0-100>,
    "industryOutlookAnalysis": "<2-3 sentence industry evaluation>",
    "innovationScore": <0-100>,
    "innovationAnalysis": "<2-3 sentence innovation evaluation>",
    "newsSentimentScore": <0-100>,
    "newsSentimentAnalysis": "<2-3 sentence news sentiment evaluation>",
    "riskFactorScore": <0-100>,
    "riskFactorAnalysis": "<2-3 sentence risk evaluation>",
    "growthPotentialScore": <0-100>,
    "growthPotentialAnalysis": "<2-3 sentence growth runway evaluation>"
  },

  "companyOverview":  "<2-3 sentences: what company does, scale, key segments>",
  "businessModel":    "<how company makes money — products, channels, monetization>",
  "industry":         "<industry context — size, tailwinds, headwinds, dynamics>",
  "financialHealth":  "<synthesis of revenue, margins, FCF, debt, returns>",

  "strengths": ["<evidence-backed strength 1>", "<strength 2>", "<strength 3>"],
  "weaknesses": ["<evidence-backed weakness 1>", "<weakness 2>", "<weakness 3>"],

  "competitors": [
    { "name": "<Competitor 1>", "marketCap": "<est. cap>", "strengths": "<why they are a threat>" },
    { "name": "<Competitor 2>", "marketCap": "<est. cap>", "strengths": "<why they are a threat>" }
  ],

  "recentNews": [
    { "title": "<headline>", "source": "<publication>", "snippet": "<analytical impact assessment>", "url": "<url>" }
  ],

  "riskAnalysis":    "<full risk narrative — regulatory, macro, competitive, execution, geopolitical>",
  "growthPotential": "<full growth narrative — TAM, expansion vectors, pipeline, catalysts>",
  "reasoning":       "<final synthesis: why this recommendation, what pushed score up/down, what would change rating>"
}`;
}

export const performResearch = async (companyName) => {
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY;
  const tavilyKey = process.env.TAVILY_API_KEY;

  logger.info(`Starting fundamental research request for: "${companyName}"`);

  if (!geminiKey) {
    throw new Error('GEMINI_API_KEY is not configured in the server environment.');
  }

  // ── Gather intelligence ──
  let intelligence = {};
  if (tavilyKey) {
    intelligence = await gatherIntelligence(companyName, tavilyKey);
  } else {
    logger.warn('TAVILY_API_KEY missing — analysis will run without real-time web search.');
    const cats = ['companyOverview','industry','businessModel','revenue','profitability',
      'debt','cashFlow','competitors','marketPosition','recentNews','growthDrivers','risks'];
    cats.forEach(c => { intelligence[c] = 'No live search data available. Evaluate using training knowledge.'; });
    intelligence._sources = [];
  }

  // ── Gemini evaluation ──
  try {
    logger.info(`Sending to Gemini (${GEMINI_MODEL}) for equity analysis...`);

    const model = new ChatGoogleGenerativeAI({
      apiKey:          geminiKey,
      modelName:       GEMINI_MODEL,
      maxOutputTokens: 4096,
      temperature:     0.15,
    });

    const response = await model.invoke([
      new SystemMessage(SYSTEM_PROMPT),
      new HumanMessage(buildPrompt(companyName, intelligence)),
    ]);

    let raw = (typeof response.content === 'string' ? response.content : JSON.stringify(response.content))
      .trim()
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    let report;
    try {
      report = JSON.parse(raw);
    } catch {
      logger.error('JSON parse failed. Raw output:\n' + raw.slice(0, 400));
      throw new Error('LLM response returned malformed JSON.');
    }

    // Enforce decision rule server-side (overrides LLM if it miscalculates)
    const score = Number(report.investmentScore) || 0;
    report.recommendation = score >= 80 ? 'Invest' : score >= 60 ? 'Consider' : 'Pass';

    // Attach live sources if LLM left recentNews empty
    if (!report.recentNews?.length) {
      report.recentNews = (intelligence._sources || []).slice(0, 3).map(s => ({
        title:   s.title,
        source:  s.source,
        snippet: 'Retrieved via live search.',
        url:     s.url,
      }));
    }

    logger.info(`Analysis complete. Score: ${score} → ${report.recommendation}`);
    return report;

  } catch (err) {
    logger.error(`Analysis pipeline failed: ${err.message}`);
    throw err;
  }
};
