import { History, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const HistorySidebar = ({ history, onSelectReport, selectedReportId }) => {
  const getBadgeStyle = (rec) => {
    switch (rec) {
      case 'Invest':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Consider':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Pass':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <div className="glass-panel p-6 rounded-2xl border border-white/5 shadow-xl flex flex-col h-full">
      <h3 className="text-base font-bold text-slate-100 mb-4 flex items-center gap-2">
        <History className="w-5 h-5 text-indigo-400" />
        Recent Searches
      </h3>

      {history.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
          <p className="text-sm text-slate-500">No past analyses found.</p>
          <p className="text-xs text-slate-600 mt-1">Start by searching a company name above.</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          <AnimatePresence>
            {history.map((report, index) => {
              const isSelected = report._id === selectedReportId;
              return (
                <motion.button
                  key={report._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  onClick={() => onSelectReport(report)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between group cursor-pointer ${
                    isSelected 
                      ? 'bg-indigo-600/10 border-indigo-500/40' 
                      : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="max-w-[80%]">
                    <h4 className="text-sm font-semibold text-slate-200 group-hover:text-indigo-400 transition-colors truncate">
                      {report.companyName}
                    </h4>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`px-2 py-0.5 text-[10px] uppercase font-bold rounded border ${getBadgeStyle(report.recommendation)}`}>
                        {report.recommendation}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">Score: {report.investmentScore}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
