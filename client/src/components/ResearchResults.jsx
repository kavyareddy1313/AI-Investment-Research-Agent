import { useState, useRef } from 'react';
import { 
  ShieldCheck, HelpCircle, AlertTriangle, 
  TrendingUp, TrendingDown, Users, Newspaper, 
  Building, Compass, CircleDollarSign, ShieldAlert, 
  Lightbulb, Briefcase, BarChart3, Brain,
  Copy, Share2, Printer
} from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useReactToPrint } from 'react-to-print';

const DIMENSION_META = [
  { key: 'revenueGrowthScore',       analysisKey: 'revenueGrowthAnalysis',       label: 'Revenue Growth',        weight: '15%' },
  { key: 'financialStabilityScore',  analysisKey: 'financialStabilityAnalysis',  label: 'Financial Stability',   weight: '20%' },
  { key: 'competitiveAdvantageScore',analysisKey: 'competitiveAdvantageAnalysis',label: 'Competitive Advantage', weight: '20%' },
  { key: 'industryOutlookScore',     analysisKey: 'industryOutlookAnalysis',     label: 'Industry Outlook',      weight: '10%' },
  { key: 'innovationScore',          analysisKey: 'innovationAnalysis',          label: 'Innovation',            weight: '10%' },
  { key: 'newsSentimentScore',       analysisKey: 'newsSentimentAnalysis',       label: 'News Sentiment',        weight: '5%'  },
  { key: 'riskFactorScore',          analysisKey: 'riskFactorAnalysis',          label: 'Risk Factor',           weight: '10%' },
  { key: 'growthPotentialScore',     analysisKey: 'growthPotentialAnalysis',     label: 'Growth Potential',      weight: '10%' },
];

const ScoreBar = ({ score, label, weight, analysis }) => {
  const [expanded, setExpanded] = useState(false);
  const color = score >= 80 ? 'bg-emerald-500' : score >= 60 ? 'bg-amber-500' : 'bg-rose-500';
  const textColor = score >= 80 ? 'text-emerald-400' : score >= 60 ? 'text-amber-400' : 'text-rose-400';
  
  return (
    <div 
      className="cursor-pointer group"
      onClick={() => setExpanded(e => !e)}
    >
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-300 group-hover:text-white transition-colors">{label}</span>
          <span className="text-[9px] text-slate-600 uppercase tracking-wider font-bold px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">
            {weight}
          </span>
        </div>
        <span className={`text-sm font-extrabold font-mono ${textColor}`}>{score}</span>
      </div>
      <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${score}%` }}
        />
      </div>
      {expanded && analysis && (
        <p className="text-xs text-slate-400 mt-2.5 leading-relaxed pl-1 border-l-2 border-slate-700">
          {analysis}
        </p>
      )}
    </div>
  );
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

const TypewriterText = ({ text }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  
  return (
    <p ref={ref} className="text-sm text-slate-300 leading-relaxed overflow-y-auto max-h-24">
      {text.split('').map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.02, delay: i * 0.01 }}
        >
          {char}
        </motion.span>
      ))}
    </p>
  );
};

export const ResearchResults = ({ report }) => {
  const contentRef = useRef(null);
  const handlePrint = useReactToPrint({
    contentRef,
    documentTitle: `${report.companyName}_InvestIQ_Report`,
  });

  const handleCopy = () => {
    const reportText = `InvestIQ Analysis: ${report.companyName}\nRecommendation: ${report.recommendation}\nScore: ${report.investmentScore}/100`;
    navigator.clipboard.writeText(reportText);
    toast.success('Report summary copied to clipboard!');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `InvestIQ Analysis: ${report.companyName}`,
          text: `Check out this AI equity research report for ${report.companyName}. Recommendation: ${report.recommendation}.`,
          url: window.location.href,
        });
        toast.success('Shared successfully!');
      } catch (err) {
        // user cancelled share, do nothing
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };
  const { 
    companyName, recommendation, investmentScore, confidenceScore,
    dimensionScores, companyOverview, businessModel, industry, financialHealth, 
    strengths, weaknesses, competitors, recentNews, 
    riskAnalysis, growthPotential, reasoning 
  } = report;

  const getVerdictTheme = () => {
    switch (recommendation) {
      case 'Invest':
        return { badge: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400', gaugeColor: 'stroke-emerald-500', icon: ShieldCheck };
      case 'Consider':
        return { badge: 'bg-amber-500/10 border-amber-500/20 text-amber-400', gaugeColor: 'stroke-amber-500', icon: HelpCircle };
      case 'Pass':
        return { badge: 'bg-rose-500/10 border-rose-500/20 text-rose-400', gaugeColor: 'stroke-rose-500', icon: AlertTriangle };
      default:
        return { badge: 'bg-slate-500/10 border-slate-500/20 text-slate-400', gaugeColor: 'stroke-slate-500', icon: HelpCircle };
    }
  };

  const theme = getVerdictTheme();
  const VerdictIcon = theme.icon;

  const GaugeSvg = ({ val, colorClass }) => {
    const radius = 36, stroke = 6, normRadius = radius - stroke;
    const circ = normRadius * 2 * Math.PI;
    const offset = circ - (val / 100) * circ;
    return (
      <div className="relative flex items-center justify-center w-20 h-20">
        <svg className="w-full h-full transform -rotate-90">
          <circle className="stroke-slate-800" fill="transparent" strokeWidth={stroke} r={normRadius} cx={radius} cy={radius} />
          <circle
            className={`transition-all duration-1000 ${colorClass}`}
            fill="transparent" strokeWidth={stroke}
            strokeDasharray={`${circ} ${circ}`}
            style={{ strokeDashoffset: offset }}
            strokeLinecap="round"
            r={normRadius} cx={radius} cy={radius}
          />
        </svg>
        <div className="absolute text-center">
          <span className="text-xl font-extrabold text-white">{val}</span>
          <span className="text-[8px] text-slate-500 block -mt-0.5">%</span>
        </div>
      </div>
    );
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >

      {/* ── HEADER ── */}
      <motion.div variants={itemVariants} className="glass-panel p-6 rounded-2xl border border-white/5 shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] tracking-wider uppercase font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-md">
            Equity Research Report · InvestIQ AI
          </span>
          <h2 className="text-2xl font-extrabold text-white mt-3 tracking-tight">{companyName}</h2>
          <p className="text-xs text-slate-400 mt-1">Multi-step autonomous analysis — Tavily Intelligence + Gemini Analyst</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleCopy} className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 transition-colors text-slate-300 hover:text-indigo-400 no-print" title="Copy Report Summary">
            <Copy className="w-4 h-4" />
          </button>
          <button onClick={handlePrint} className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 transition-colors text-slate-300 hover:text-indigo-400 no-print" title="Export PDF">
            <Printer className="w-4 h-4" />
          </button>
          <button onClick={handleShare} className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 transition-colors text-slate-300 hover:text-indigo-400 no-print" title="Share Report">
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </motion.div>

      <div ref={contentRef} className="space-y-6">
      {/* ── METRICS & VERDICT CARDS ── */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center shadow-lg">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-indigo-400" /> Investment Score
          </span>
          <GaugeSvg val={investmentScore} colorClass={theme.gaugeColor} />
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center shadow-lg">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <VerdictIcon className={`w-4 h-4 ${theme.gaugeColor.replace('stroke-', 'text-')}`} /> Recommendation
          </span>
          <div className={`mt-2 px-6 py-4 rounded-xl border flex items-center justify-center text-lg font-extrabold uppercase tracking-widest w-full ${theme.badge}`}>
            {recommendation}
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center shadow-lg">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-indigo-400" /> Confidence Score
          </span>
          <GaugeSvg val={confidenceScore} colorClass="stroke-indigo-500" />
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col justify-center shadow-lg lg:col-span-1 md:col-span-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-3">
            Reasoning
          </span>
          <TypewriterText text={reasoning} />
        </div>
      </motion.div>

      {/* ── 8-DIMENSION ANALYST SCORECARD ── */}
      {dimensionScores && (
        <motion.div variants={itemVariants} className="glass-panel p-6 rounded-2xl border border-white/5 shadow-lg">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 mb-5">
            <Brain className="w-4 h-4 text-indigo-400" />
            8-Dimension Analyst Scorecard
            <span className="text-[9px] text-slate-600 font-normal ml-1">Click a metric to expand analysis</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
            {DIMENSION_META.map(({ key, analysisKey, label, weight }) => {
              const score = dimensionScores[key] || 0;
              const analysis = dimensionScores[analysisKey] || '';
              return (
                <ScoreBar
                  key={key}
                  score={score}
                  label={label}
                  weight={weight}
                  analysis={analysis}
                />
              );
            })}
          </div>
        </motion.div>
      )}

      {/* ── DEEP DIVES: Overview / Business / Industry ── */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: Building,         color: 'text-indigo-400', label: 'Overview',          body: companyOverview },
          { icon: Compass,          color: 'text-indigo-400', label: 'Industry',          body: industry },
          { icon: Briefcase,        color: 'text-indigo-400', label: 'Business Model',    body: businessModel },
        ].map(({ icon: Icon, color, label, body }) => (
          <div key={label} className="glass-panel p-5 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 mb-3">
              <Icon className={`w-4 h-4 ${color}`} /> {label}
            </h4>
            <p className="text-sm text-slate-400 leading-relaxed">{body}</p>
          </div>
        ))}
      </motion.div>

      {/* ── FINANCIAL / GROWTH / RISK ── */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: CircleDollarSign, color: 'text-indigo-400', label: 'Financial Health',  body: financialHealth },
          { icon: Lightbulb,        color: 'text-indigo-400', label: 'Growth Drivers',    body: growthPotential },
          { icon: ShieldAlert,      color: 'text-rose-400',   label: 'Risk Analysis',     body: riskAnalysis },
        ].map(({ icon: Icon, color, label, body }) => (
          <div key={label} className="glass-panel p-5 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 mb-3">
              <Icon className={`w-4 h-4 ${color}`} /> {label}
            </h4>
            <p className="text-sm text-slate-400 leading-relaxed">{body}</p>
          </div>
        ))}
      </motion.div>

      {/* ── STRENGTHS & WEAKNESSES ── */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-5 rounded-2xl border border-white/5 bg-emerald-500/[0.015]">
          <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4" /> Strengths
          </h4>
          <ul className="space-y-3">
            {(strengths || []).map((s, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                {s}
              </li>
            ))}
          </ul>
        </div>
        <div className="glass-panel p-5 rounded-2xl border border-white/5 bg-rose-500/[0.01]">
          <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-2 mb-4">
            <TrendingDown className="w-4 h-4" /> Weaknesses
          </h4>
          <ul className="space-y-3">
            {(weaknesses || []).map((w, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 flex-shrink-0" />
                {w}
              </li>
            ))}
          </ul>
        </div>
      </motion.div>

      {/* ── COMPETITORS & NEWS ── */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel p-5 rounded-2xl border border-white/5">
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 mb-4">
            <Users className="w-4 h-4 text-indigo-400" /> Competitors
          </h4>
          <div className="space-y-3">
            {(competitors || []).map((comp, i) => (
              <div key={i} className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-900 flex items-start justify-between gap-3">
                <div>
                  <h5 className="text-sm font-semibold text-white">{comp.name}</h5>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{comp.strengths}</p>
                </div>
                <span className="text-xs font-mono font-bold text-indigo-400 px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 rounded whitespace-nowrap">
                  {comp.marketCap}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/5">
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 mb-4">
            <Newspaper className="w-4 h-4 text-indigo-400" /> Recent News
          </h4>
          <div className="space-y-3">
            {(recentNews || []).map((news, i) => (
              <a key={i} href={news.url} target="_blank" rel="noopener noreferrer"
                className="block p-3.5 rounded-xl bg-slate-950/40 border border-slate-900 hover:border-indigo-500/40 transition-colors group">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">{news.source}</span>
                <h5 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors mt-1.5">{news.title}</h5>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">{news.snippet}</p>
              </a>
            ))}
          </div>
        </div>
      </motion.div>
      
      </div>
    </motion.div>
  );
};
