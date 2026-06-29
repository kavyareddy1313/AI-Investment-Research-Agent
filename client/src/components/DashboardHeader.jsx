import { TrendingUp, Cpu, Moon, Sun } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext.jsx';

export const DashboardHeader = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="glass-panel sticky top-0 z-50 px-6 py-4 flex items-center justify-between border-b border-white/5">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/25 rounded-xl shadow-inner shadow-indigo-500/20">
          <TrendingUp className="w-6 h-6 text-indigo-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white m-0 flex items-center gap-2">
            InvestIQ <span className="px-2 py-0.5 text-[10px] tracking-wide uppercase font-semibold bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 rounded-md">Pro</span>
          </h1>
          <p className="text-xs text-slate-400">Fundamental Investment Analytics</p>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-medium text-emerald-400">
          <Cpu className="w-3.5 h-3.5" />
          <span>Active Connection</span>
        </div>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 transition-colors text-slate-300"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
