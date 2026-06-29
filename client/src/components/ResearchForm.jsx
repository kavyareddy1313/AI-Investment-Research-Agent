import { useState, useRef, useEffect } from 'react';
import { Search, Sparkles } from 'lucide-react';

const POPULAR_COMPANIES = ['Apple (AAPL)', 'Microsoft (MSFT)', 'Tesla (TSLA)', 'NVIDIA (NVDA)', 'Infosys', 'Reliance'];

export const ResearchForm = ({ onSearch, isLoading }) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onSearch(query.trim());
    }
  };

  const handleQuickSelect = (name) => {
    if (!isLoading) {
      setQuery(name);
      onSearch(name);
    }
  };

  return (
    <div className="glass-panel p-6 rounded-2xl border border-white/5 shadow-xl">
      <h2 className="text-lg font-semibold text-slate-100 mb-2 flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-indigo-400" />
        Analyze Investment Opportunity
      </h2>
      <p className="text-sm text-slate-400 mb-6">
        Enter a company name or ticker. Our autonomous research agent will scan the live web, compile financials, assess risks, and generate an institutional-grade investment recommendation.
      </p>

      <form onSubmit={handleSubmit} className="relative mb-6">
        <div className="relative flex items-center">
          <Search className="absolute left-4 w-5 h-5 text-slate-400" />
          <input
            ref={inputRef}
            type="text"
            placeholder="e.g., Apple Inc., NVIDIA, Super Micro Computer..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={isLoading}
            className="w-full pl-12 pr-44 py-4 rounded-xl bg-slate-950/60 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-base disabled:opacity-50"
          />
          <div className="absolute right-28 hidden sm:flex items-center gap-1 opacity-50 pointer-events-none">
            <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-[10px] text-slate-300 font-mono">⌘</kbd>
            <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-[10px] text-slate-300 font-mono">K</kbd>
          </div>
          <button
            type="submit"
            disabled={!query.trim() || isLoading}
            className="absolute right-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all shadow-lg shadow-indigo-600/20 active:scale-95 disabled:opacity-50 disabled:scale-100 disabled:shadow-none flex items-center gap-1.5"
          >
            {isLoading ? 'Researching...' : 'Analyze'}
          </button>
        </div>
      </form>

      <div>
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2.5">
          Popular Queries
        </span>
        <div className="flex flex-wrap gap-2">
          {POPULAR_COMPANIES.map((company) => (
            <button
              key={company}
              type="button"
              onClick={() => handleQuickSelect(company)}
              disabled={isLoading}
              className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-850 hover:text-white transition-all disabled:opacity-50 cursor-pointer"
            >
              {company}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
