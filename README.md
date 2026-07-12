# InvestIQ AI 🚀

InvestIQ AI is an autonomous, multi-agent AI equity research platform. It leverages live web search (via Tavily) and advanced LLM reasoning (via Google Gemini) to generate institutional-grade investment reports, financial health scorecards, and predictive risk analysis for any publicly traded company.

---

## 📑 Table of Contents
- [Project Overview](#project-overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Folder Structure](#folder-structure)
- [Application Workflow](#application-workflow)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [API Setup Guides](#api-setup-guides)
  - [MongoDB Setup](#mongodb-setup)
  - [Gemini API Setup](#gemini-api-setup)
  - [Tavily API Setup](#tavily-api-setup)
- [Running the App](#running-the-app)
- [API Documentation](#api-documentation)
- [Example Outputs](#example-outputs)
- [Trade-offs](#trade-offs)
- [Future Improvements](#future-improvements)
- [Deployment Guide](#deployment-guide)

---

## 🎯 Project Overview
InvestIQ AI automates the grueling task of fundamental equity research. Instead of manually parsing through earnings calls, news articles, and balance sheets, users simply type in a company ticker. The underlying AI agent crawls live financial data, synthesizes the information across 8 critical dimensions, and delivers a final investment recommendation (Invest, Consider, or Pass) alongside a quantified confidence score.

---

## ✨ Features
- **Live Agentic Search**: Autonomously crawls recent news, market sentiment, and financial data.
- **8-Axis Scorecard**: Quantifies strength across Industry, Growth, Financials, Moat, etc.
- **Premium UI/UX**: Built with Glassmorphism, Framer Motion transitions, and Dark/Light mode toggling.
- **Skeleton Loaders**: Step-by-step progress feedback while the AI agent conducts research.
- **Export & Share**: Print-ready PDF exporting and Web Share API integration.
- **Intelligent Caching**: Avoids redundant LLM/API calls by storing recent analysis in MongoDB.
- **Keyboard Shortcuts**: `Cmd+K` to search, `Cmd+C` to copy insights.

---

## 💻 Technology Stack

### Frontend
- **React 19** (Vite)
- **TypeScript**
- **Tailwind CSS v4** (Glassmorphism & Theming)
- **Framer Motion** (Animations & Page Transitions)
- **Lucide React** (Iconography)

### Backend
- **Node.js & Express.js** (MVC Architecture)
- **MongoDB & Mongoose** (Data Persistence & Caching)
- **LangChain** (Agentic Orchestration)
- **Google Gemini 2.5 Flash** (LLM Reasoning Engine)
- **Tavily Search API** (Live Web Intelligence)

---

## 🏗 Architecture
The application follows a strict **MVC (Model-View-Controller)** pattern on the backend and a component-based architecture on the frontend.

1. **Client**: A React SPA that handles state (history, active report) and renders the premium dashboard.
2. **Controller Layer**: Intercepts requests, checks the MongoDB cache for recent reports (< 24 hrs old), and orchestrates the AI pipelines if a cache miss occurs.
3. **Service Layer**: Handles communication with LangChain, Gemini, and Tavily to construct the structured JSON report.
4. **Data Layer**: MongoDB stores the generated JSON reports to optimize API costs and load times for frequent queries.

---

## 📂 Folder Structure
```text
insideiim/
├── client/                     # React Frontend (Vite)
│   ├── src/
│   │   ├── components/         # UI Components (Results, Loaders, Forms)
│   │   ├── contexts/           # React Contexts (ThemeContext)
│   │   ├── services/           # Axios API Client
│   │   ├── types.ts            # Shared TypeScript Interfaces
│   │   ├── App.tsx             # Main Layout & Routing
│   │   └── index.css           # Tailwind & Global Styles
│   └── package.json
│
├── server/                     # Node.js Express Backend
│   ├── config/                 # DB & Env Configurations
│   ├── controllers/            # API Route Logic (analysisController.js)
│   ├── middleware/             # Error Handling & Validation
│   ├── models/                 # Mongoose Schemas (Analysis.js)
│   ├── routes/                 # Express Routes
│   ├── services/               # LangChain & Tavily Logic
│   ├── utils/                  # Loggers & Helpers
│   ├── index.js                # Server Entry Point
│   └── package.json
│
└── package.json                # Root Concurrently Script
```

---

## 🔄 Application Workflow
1. User enters a company name (e.g., "NVIDIA").
2. React frontend sends `POST /api/analyze` to the Express server.
3. Backend checks MongoDB for a recent analysis of "NVIDIA".
4. **If cached (and recent)**: Returns the MongoDB document instantly.
5. **If not cached**: 
   - LangChain tool triggers Tavily to scrape the web for latest financials/news.
   - Data is piped into Google Gemini with a highly-structured Analyst System Prompt.
   - Gemini returns a structured JSON payload.
6. Backend saves the new payload to MongoDB.
7. Frontend renders the cascading grid UI, animating the text and gauges.

---

## ⚙️ Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/investiq-ai.git
cd investiq-ai
```

2. Install Root Dependencies (concurrently)
```bash
npm install
```

3. Install Client and Server Dependencies
```bash
cd client && npm install
cd ../server && npm install
cd ..
```

---

## 🔐 Environment Variables

Create a `.env` file inside the `/server` directory:

```env
# Server
PORT=5001
NODE_ENV=development

# MongoDB
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/investiq

# API Keys
GEMINI_API_KEY=your_gemini_api_key_here
TAVILY_API_KEY=your_tavily_api_key_here
```

---

## 🔌 API Setup Guides

### MongoDB Setup
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a free cluster.
2. Under "Database Access", create a user and password.
3. Under "Network Access", allow your IP (or `0.0.0.0/0` for all).
4. Click "Connect" -> "Connect your application" and copy the connection string. Replace `<password>` with your DB password in your `.env` file.

### Gemini API Setup
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Click "Create API Key".
3. Copy the key to `GEMINI_API_KEY` in your `.env`.

### Tavily API Setup
1. Go to [Tavily](https://tavily.com/).
2. Sign up and navigate to the API Keys section.
3. Copy your key to `TAVILY_API_KEY` in your `.env`.

---

## 🚀 Running the App

You can run both the client and server simultaneously using the root package script:

```bash
# From the root directory (insideiim/)
npm run dev
```

Alternatively, run them separately:
- **Server**: `cd server && npm run dev` (Runs on `http://localhost:5001`)
- **Client**: `cd client && npm run dev` (Runs on `http://localhost:3000`)

---

## 📡 API Documentation

### `POST /api/analyze`
Generates or retrieves a company analysis.
- **Body**: `{ "companyName": "Tesla" }`
- **Response**: `{ "success": true, "data": { ...AnalysisObject } }`

### `GET /api/history`
Retrieves all previously generated reports.
- **Response**: `{ "success": true, "data": [ ...AnalysisObjects ] }`

### `GET /api/history/:id`
Retrieves a specific report by Mongo ID.

### `DELETE /api/history/:id`
Deletes a specific report from history.

---

## 📸 Screenshots & Example Outputs
*(Add links to your hosted images or local assets here once deployed)*
- **Dashboard View**: Clean, grid-based scorecard layout.
- **Light/Dark Mode**: Seamlessly switch aesthetics.
- **Skeleton Loader**: Step-by-step progress UI.

**Example AI Output Data Structure:**
```json
{
  "companyName": "NVIDIA",
  "recommendation": "Invest",
  "investmentScore": 92,
  "confidenceScore": 85,
  "strengths": ["Dominant AI chip market share", "CUDA software moat"],
  "risks": ["Geopolitical export restrictions", "High valuation multiples"]
}
```

---

## ⚖️ Trade-offs
- **Gemini Flash vs Pro**: We opted for `gemini-2.5-flash` for significantly faster response times and lower costs, trading off a slight edge in deep quantitative reasoning that a slower `Pro` model might provide.
- **Client-Side PDF Export**: Instead of using heavy server-side PDF generation (like Puppeteer), we used `react-to-print` mapped to browser print engines. This saves server costs and complexity but relies on the user's browser rendering engine.
- **Data Freshness vs Cache**: Reports are currently cached for 24 hours. Intraday news drops won't be reflected immediately unless the cache is bypassed.

---

## 🔮 Future Improvements
- [ ] **Auth & User Accounts**: Allow users to save personal portfolios via Firebase/Clerk.
- [ ] **Historical Charts**: Integrate TradingView or Polygon.io APIs to show 1Y price charts alongside the AI reasoning.
- [ ] **Force Refresh Button**: Allow users to bypass the 24-hour cache if breaking news occurs.
- [ ] **Multi-Stock Comparison**: Select two history reports and have the agent write a comparative analysis.

---

## 🌐 Deployment Guide

### Option 1: Full-stack Vercel Deployment (All-in-One)
We have pre-configured a `vercel.json` file in the root of the project to allow both frontend and backend to deploy to a single Vercel project:

1. **Connect Repository**: Import your GitHub repository to Vercel.
2. **Settings**:
   - Keep the **Root Directory** as the root of the project (`./` - default).
   - Vercel will auto-detect the root `vercel.json` and build your client code using the root-level `"build": "npm run build --prefix client"` script.
3. **Environment Variables**:
   Add the following environment variables in the Vercel project settings:
   - `MONGODB_URI`
   - `GEMINI_API_KEY` (or `GOOGLE_GENAI_API_KEY`)
   - `TAVILY_API_KEY`
4. **Warning (Serverless Timeout)**:
   > [!WARNING]
   > Vercel Hobby accounts have a strict **10-second execution limit** on serverless functions. Because research crawls using Tavily and Gemini can occasionally take 10–15 seconds, you may intermittently encounter `544 Gateway Timeout` errors on the serverless backend. If you hit this limit, we highly recommend **Option 2 (Split Deployment)**.

---

### Option 2: Split Deployment (Recommended)
Host the frontend on Vercel (fast static delivery) and the backend on Render/Railway/Fly.io (persistent Node environment without timeout limits).

#### 1. Deploy the Backend (e.g., on Render)
- **Root Directory**: `server` (or leave empty and run build/start scripts with path prefixes).
- **Build Command**: `npm install`
- **Start Command**: `node index.js`
- **Environment Variables**: Set `MONGODB_URI`, `GEMINI_API_KEY`, and `TAVILY_API_KEY`.

#### 2. Deploy the Frontend (Vercel)
- **Root Directory**: `client`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Vercel Routing**:
  Create a `client/vercel.json` file to proxy API requests to your Render URL without CORS conflicts:
  ```json
  {
    "rewrites": [
      {
        "source": "/api/:path*",
        "destination": "https://your-render-backend-url.onrender.com/api/:path*"
      }
    ]
  }
  ```

# AI-Investment-Research-Agent
