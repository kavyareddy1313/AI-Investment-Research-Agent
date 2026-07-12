# InvestIQ AI

## Overview
InvestIQ is a full-stack web application that provides equity research reports and financial health scorecards for publicly traded companies. Users can enter a company ticker, and the application aggregates recent news, market sentiment, and financial data using search APIs and LLM analysis. It synthesizes this into a readable dashboard featuring a final investment score (Invest, Consider, or Pass) and metrics across 8 categories (Growth, Financials, Moat, etc.).

## How to run it

### Setup Steps
1. **Unzip the project** and navigate into the folder:
   ```bash
   cd insideiim
   ```
2. **Install all dependencies** (this installs packages for both client and server):
   ```bash
   npm install
   cd client && npm install
   cd ../server && npm install
   cd ..
   ```
3. **Environment Variables**:
   A `.env` file must be present in the `server/` directory containing your keys. If one is not included in the zip, create `server/.env` using the provided `server/.env.example` as a template:
   ```env
   PORT=5001
   NODE_ENV=development
   MONGO_URI=your_mongodb_connection_string
   GEMINI_API_KEY=your_gemini_api_key
   TAVILY_API_KEY=your_tavily_api_key
   ```

### Run Steps
From the root directory, run both the backend and frontend concurrently:
```bash
npm run dev
```
- The backend API will be available on `http://localhost:5001`
- The frontend client will be available on `http://localhost:3000`

## How it works
The application follows a standard Model-View-Controller (MVC) architecture on the backend and a component-based architecture on the frontend.

**Frontend (React/Vite)**
The client is a React Single Page Application (SPA) styled with Tailwind CSS and animated using Framer Motion. It handles state management for history and active reports. When a user queries a company, it displays a loading state with a progress breakdown while waiting for the backend to resolve the data, and then renders a cascading grid UI for the results.

**Backend (Node.js/Express)**
The Express server acts as the orchestrator. When a `POST /api/analyze` request is received:
1. The controller intercepts the request and checks the MongoDB cache to see if an analysis for this company was generated in the last 24 hours.
2. If cached, it returns the stored document instantly.
3. If not cached, the service layer triggers the Tavily API to scrape live financial news and data.
4. The retrieved data is piped into Google Gemini (using LangChain) with a highly structured prompt to analyze the data across 8 financial dimensions.
5. Gemini returns a structured JSON payload which is saved to MongoDB and sent back to the frontend.

## Key decisions & trade-offs
- **Gemini Flash over Gemini Pro**: We opted for `gemini-2.5-flash` instead of a slower reasoning model to ensure the user gets their report quickly (usually under 10-15 seconds) and to keep API costs negligible, trading off a marginal edge in deep quantitative reasoning.
- **Tavily API over generic Search APIs**: We chose Tavily because it is specifically optimized for LLM RAG (Retrieval-Augmented Generation) pipelines, returning clean text content rather than raw HTML that would need heavy parsing.
- **Client-Side PDF Export**: Instead of using heavy server-side PDF generation (like Puppeteer), we used `react-to-print` mapped to browser print engines. This saves server costs and complexity, though it relies slightly on the user's local browser rendering engine.
- **Database Caching**: Reports are cached for 24 hours. Intraday news drops won't be reflected immediately unless the cache is bypassed, but this significantly reduces API usage and latency for popular ticker searches.
- **Javascript vs Typescript**: The frontend was ultimately written in pure JavaScript (JSX) rather than TypeScript to keep the codebase minimalistic, approachable, and strictly focused on React component logic without the overhead of interface declarations.

## Example runs
When querying a company, the AI outputs a highly structured response. Here is an example of the generated payload structure:

**Company: NVIDIA (NVDA)**
- **Recommendation:** Invest
- **Investment Score:** 92/100
- **Strengths:** Dominant AI chip market share, CUDA software moat, massive data center revenue growth.
- **Risks:** Geopolitical export restrictions to China, high valuation multiples pricing in perfect execution.
- **News Sentiment:** Extremely positive due to recent earnings beats and next-generation Blackwell chip announcements.

**Company: Tesla (TSLA)**
- **Recommendation:** Consider
- **Investment Score:** 74/100
- **Strengths:** Market leader in EVs, strong energy storage growth, FSD software potential.
- **Risks:** Price cuts impacting margins, increasing competition in China (BYD), reliance on CEO sentiment.
- **News Sentiment:** Mixed, balancing price adjustments with Robotaxi event anticipations.

## What you would improve with more time
1. **User Authentication**: Implement Firebase or Clerk so users can create accounts and save personal portfolios rather than having a global history cache.
2. **Historical Charts**: Integrate TradingView or Polygon.io APIs to show real-time 1Y price charts alongside the AI reasoning to give a better visual context of the stock's performance.
3. **Force Refresh Mechanism**: Allow users to bypass the 24-hour cache limit manually via a UI button if breaking news occurs.
4. **Comparative Analysis**: Allow users to select two generated history reports and have the agent write a direct comparative analysis between the two companies.

---

*Note: The LLM chat session transcript/logs used to build this project are included in the root directory as `LLM_CHAT_TRANSCRIPT.jsonl`.*
