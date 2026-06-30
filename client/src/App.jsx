import { useState, useEffect } from 'react';
import { DashboardHeader } from './components/DashboardHeader.jsx';
import { ResearchForm } from './components/ResearchForm.jsx';
import { LoadingState } from './components/LoadingState.jsx';
import { ResearchResults } from './components/ResearchResults.jsx';
import { HistorySidebar } from './components/HistorySidebar.jsx';
import { analyzeCompany, getHistory } from './services/api.js';
import { Sparkles, Brain, Info, RefreshCw } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from './contexts/ThemeContext.jsx';

function App() {
  const [history, setHistory] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const { theme } = useTheme();

  useEffect(() => {
    loadHistory();

    const handleKeyDown = (e) => {
      // Cmd/Ctrl + K to focus search is handled in ResearchForm
      // Cmd/Ctrl + C to copy report
      if ((e.metaKey || e.ctrlKey) && e.key === 'c' && selectedReport) {
        // Only trigger if user hasn't selected text
        if (window.getSelection()?.toString() === '') {
          e.preventDefault();
          const reportText = `InvestIQ Analysis: ${selectedReport.companyName}\nRecommendation: ${selectedReport.recommendation}\nScore: ${selectedReport.investmentScore}/100`;
          navigator.clipboard.writeText(reportText);
          toast.success('Report summary copied to clipboard!');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedReport]);

  const loadHistory = async () => {
    try {
      const data = await getHistory();
      setHistory(data);
      if (data.length > 0 && !selectedReport) {
        setSelectedReport(data[0]);
      }
    } catch (err) {
      console.warn('Failed to load analysis history:', err);
    }
  };

  const handleResearch = async (companyName) => {
    setIsLoading(true);
    setError(null);
    setSelectedReport(null);

    try {
      const report = await analyzeCompany(companyName);
      setSelectedReport(report);
      // Reload history to include the new report
      await loadHistory();
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.error || 
        'An error occurred while compiling research. Ensure backend server is running.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Toaster 
        position="top-right" 
        toastOptions={{
          style: {
            background: theme === 'dark' ? '#1e293b' : '#ffffff',
            color: theme === 'dark' ? '#f8fafc' : '#0f172a',
            border: theme === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
          }
        }} 
      />
      <DashboardHeader />

      <main className="flex-1 p-6 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form & General Info */}
        <div className="lg:col-span-4 space-y-6">
          <ResearchForm onSearch={handleResearch} isLoading={isLoading} />
          
          {/* Platform Information Box */}
          <div className="glass-panel p-5 rounded-2xl border border-white/5 bg-indigo-950/5">
            <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2 mb-2">
              <Brain className="w-4.5 h-4.5 text-indigo-400" />
              How the System Works
            </h4>
            <ul className="text-xs text-slate-400 space-y-2">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0" />
                <span>Crawls live search data for active stock indicators & market trends.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0" />
                <span>Aggregates competitor metrics, valuations, and SWOT profiles.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0" />
                <span>Evaluates growth drivers and parses risks using structured analytical models.</span>
              </li>
            </ul>
          </div>

          {/* History Sidebar - Visible under Search on smaller screens */}
          <div className="block lg:hidden">
            <HistorySidebar
              history={history}
              onSelectReport={setSelectedReport}
              selectedReportId={selectedReport?._id}
            />
          </div>
        </div>

        {/* Right Column: Output / Loaders / Results */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {isLoading && <LoadingState />}

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel p-6 rounded-2xl border border-rose-500/20 bg-rose-500/5 text-slate-100 flex items-start justify-between gap-3.5"
            >
              <div className="flex items-start gap-3.5">
                <Info className="w-6 h-6 text-rose-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-rose-400">Research Compilation Failed</h4>
                  <p className="text-sm text-slate-350 mt-1">{error}</p>
                </div>
              </div>
              <button 
                onClick={() => handleResearch('Retry')} 
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg hover:bg-rose-500/20 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Retry
              </button>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {!isLoading && !error && selectedReport && (
              <motion.div
                key={selectedReport._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <ResearchResults report={selectedReport} />
              </motion.div>
            )}
          </AnimatePresence>

          {!isLoading && !error && !selectedReport && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-panel p-8 rounded-2xl border border-white/5 shadow-xl flex flex-col items-center justify-center min-h-[400px] text-center"
            >
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-full mb-4 shadow-lg shadow-indigo-500/10">
                <Sparkles className="w-8 h-8 text-indigo-400" />
              </div>
              <h3 className="text-base font-bold text-slate-200 mb-2">No Active Analysis</h3>
              <p className="text-sm text-slate-400 max-w-sm">
                Press <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-xs text-slate-300 font-mono">⌘K</kbd> to search for a company, or select a report from history.
              </p>
            </motion.div>
          )}
        </div>

        {/* Desktop History Sidebar (Fixed in layout) */}
        <div className="hidden lg:block lg:col-span-12 mt-6">
          <HistorySidebar
            history={history}
            onSelectReport={setSelectedReport}
            selectedReportId={selectedReport?._id}
          />
        </div>
      </main>
    </div>
  );
}

export default App;
