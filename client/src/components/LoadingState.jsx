import { useEffect, useState } from 'react';
import { Loader2, Globe, ShieldAlert, AlertTriangle, Compass, CheckCircle2 } from 'lucide-react';

const RESEARCH_STEPS = [
  { id: 0, label: 'Initializing Research Agent', subLabel: 'Configuring Gemini LLM and research parameters...', icon: Compass },
  { id: 1, label: 'Crawling Web for Live Market Intelligence', subLabel: 'Triggering Tavily search crawler across financial journals and news portals...', icon: Globe },
  { id: 2, label: 'Analyzing Financial Indicators & Cash Flows', subLabel: 'Parsing balance sheets, cash flows, and operating margins...', icon: AlertTriangle },
  { id: 3, label: 'Running SWOT & Risk Assessment', subLabel: 'Synthesizing strengths, weaknesses, threats, and competitor landscapes...', icon: ShieldAlert },
  { id: 4, label: 'Finalizing Investment Recommendation', subLabel: 'Compiling thesis score and formatting structured report...', icon: CheckCircle2 }
];

export const LoadingState = () => {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const intervals = [2500, 3500, 3000, 2500];
    let currentStep = 0;

    const runNext = () => {
      if (currentStep < RESEARCH_STEPS.length - 1) {
        currentStep += 1;
        setActiveStep(currentStep);
        setTimeout(runNext, intervals[currentStep - 1] || 2000);
      }
    };

    const timer = setTimeout(runNext, intervals[0]);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-6 animate-pulse">
      {/* Skeleton Header */}
      <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-3">
          <div className="h-5 w-48 bg-slate-800/50 rounded-md"></div>
          <div className="h-8 w-64 bg-slate-800/80 rounded-md"></div>
          <div className="h-3 w-72 bg-slate-800/40 rounded-md"></div>
        </div>
        <div className="flex gap-2">
          <div className="w-10 h-10 bg-slate-800/50 rounded-lg"></div>
          <div className="w-10 h-10 bg-slate-800/50 rounded-lg"></div>
          <div className="w-10 h-10 bg-slate-800/50 rounded-lg"></div>
        </div>
      </div>

      {/* Skeleton Top Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col items-center justify-center min-h-[160px]">
            <div className="h-4 w-24 bg-slate-800/50 rounded-md mb-6"></div>
            <div className="w-20 h-20 bg-slate-800/30 rounded-full border-4 border-slate-800/50"></div>
          </div>
        ))}
        <div className="glass-panel p-6 rounded-2xl border border-white/5 lg:col-span-1 md:col-span-2">
           <div className="h-4 w-24 bg-slate-800/50 rounded-md mb-4"></div>
           <div className="space-y-2">
             <div className="h-3 w-full bg-slate-800/40 rounded-md"></div>
             <div className="h-3 w-full bg-slate-800/40 rounded-md"></div>
             <div className="h-3 w-3/4 bg-slate-800/40 rounded-md"></div>
             <div className="h-3 w-5/6 bg-slate-800/40 rounded-md"></div>
           </div>
        </div>
      </div>

      {/* Center Agent Status overlaying skeleton */}
      <div className="relative">
        <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm z-10 flex flex-col items-center justify-center rounded-3xl">
          <div className="relative flex items-center justify-center mb-6 mt-8">
            <div className="absolute w-20 h-20 rounded-full border border-indigo-500/30 animate-ping opacity-25"></div>
            <div className="p-4 bg-indigo-600/10 border border-indigo-500/25 rounded-2xl shadow-lg relative">
              <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
            </div>
          </div>

          <h3 className="text-lg font-semibold text-slate-100 mb-2">Analyzing Data</h3>
          
          <div className="w-full max-w-md space-y-3 mb-8 px-6">
            {RESEARCH_STEPS.map((step) => {
              const isActive = step.id === activeStep;
              const isCompleted = step.id < activeStep;
              const Icon = step.icon;
              return (
                <div key={step.id} className={`flex items-start gap-3 transition-all ${isActive ? 'opacity-100' : isCompleted ? 'opacity-50' : 'opacity-20'}`}>
                  <Icon className={`w-4 h-4 mt-0.5 ${isActive ? 'text-indigo-400' : isCompleted ? 'text-emerald-400' : 'text-slate-500'}`} />
                  <div>
                    <h4 className={`text-sm font-semibold ${isActive ? 'text-indigo-300' : isCompleted ? 'text-emerald-400' : 'text-slate-400'}`}>{step.label}</h4>
                    {isActive && <p className="text-[10px] text-slate-400 mt-1">{step.subLabel}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Deep Dives Skeleton Background */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 opacity-30">
          {[1, 2, 3].map(i => (
            <div key={i} className="glass-panel p-6 rounded-2xl border border-white/5 min-h-[200px]">
              <div className="h-4 w-32 bg-slate-800/50 rounded-md mb-6"></div>
              <div className="space-y-3">
                <div className="h-3 w-full bg-slate-800/40 rounded-md"></div>
                <div className="h-3 w-full bg-slate-800/40 rounded-md"></div>
                <div className="h-3 w-4/5 bg-slate-800/40 rounded-md"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
