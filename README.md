# InvestIQ AI

InvestIQ is a web application that provides equity research reports and financial health scorecards for publicly traded companies. It aggregates data using a search API and formats the output into a readable dashboard.

## Table of Contents
- [Project Overview](#project-overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Folder Structure](#folder-structure)
- [Installation & Setup](#installation--setup)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)

---

## Project Overview
InvestIQ helps users quickly get an overview of a company's financial standing. Users can enter a ticker or company name to receive an automated breakdown covering industry outlook, financial stability, risks, and competitor data. The results are cached to minimize API usage.

## Features
- **Company Search**: Pulls recent news and financial data.
- **Scorecard Dashboard**: Displays metrics across 8 categories (Growth, Financials, Moat, etc.).
- **PDF Export**: Print-ready reports.
- **Caching**: Recent reports are stored in MongoDB to speed up repeated queries.
- **Dark/Light Mode**: Toggleable UI themes.

## Technology Stack

**Frontend:**
- React (Vite)
- Tailwind CSS
- Framer Motion

**Backend:**
- Node.js & Express
- MongoDB & Mongoose
- External APIs (Gemini, Tavily)

## Folder Structure
```text
insideiim/
├── client/                     # React Frontend
│   ├── src/
│   │   ├── components/         # UI Components
│   │   ├── contexts/           # React Contexts
│   │   ├── services/           # API Client
│   │   ├── App.jsx             # Main App Component
│   │   └── main.jsx            # Entry Point
│   └── package.json
│
├── server/                     # Express Backend
│   ├── config/                 # DB Config
│   ├── controllers/            # Route Logic
│   ├── models/                 # Mongoose Schemas
│   ├── routes/                 # Express Routes
│   ├── services/               # Search/Data Logic
│   ├── index.js                # Server Entry
│   └── package.json
│
└── package.json                # Root package
```

## Installation & Setup

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/investiq.git
cd investiq
```

2. **Install Dependencies**
```bash
npm install
cd client && npm install
cd ../server && npm install
cd ..
```

3. **Run the Application**
From the root directory, you can run both the client and server concurrently:
```bash
npm run dev
```

Alternatively, run them in separate terminals:
- Backend: `cd server && npm run dev` (Runs on `http://localhost:5001`)
- Frontend: `cd client && npm run dev` (Runs on `http://localhost:3000`)

## Environment Variables

Create a `.env` file inside the `server/` directory:

```env
PORT=5001
NODE_ENV=development
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/investiq

# API Keys needed for data fetching
GEMINI_API_KEY=your_gemini_api_key_here
TAVILY_API_KEY=your_tavily_api_key_here
```

## Deployment

### Option 1: Split Deployment (Recommended)
Host the frontend on Vercel and the backend on Render/Railway.

**Backend (Render):**
- Set root directory to `server`
- Build command: `npm install`
- Start command: `node index.js`
- Set required environment variables.

**Frontend (Vercel):**
- Set root directory to `client`
- Build command: `npm run build`
- To avoid CORS issues, create a `vercel.json` in the `client/` folder:
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

### Option 2: Full-stack Vercel Deployment
The project includes a root `vercel.json` for all-in-one deployment. However, note that Vercel's free tier has a 10-second timeout on serverless functions, which may occasionally cause timeouts when fetching fresh company data.
