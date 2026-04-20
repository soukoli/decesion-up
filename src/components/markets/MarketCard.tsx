'use client';

import { useState } from 'react';
import { MarketSignal } from '@/types';

// Macro indicator explanations
const macroHelp: Record<string, { en: string; cs: string }> = {
  Inflation: {
    en: 'Consumer price inflation (CPI). Higher inflation erodes purchasing power. Central banks target ~2% inflation.',
    cs: 'Spotřebitelská inflace (CPI). Vyšší inflace snižuje kupní sílu. Centrální banky cílí ~2% inflaci.',
  },
  'GDP Growth': {
    en: 'Annual economic growth. Positive = economy expanding. Negative = recession. Healthy growth is 2-3% annually.',
    cs: 'Roční růst ekonomiky. Kladný = ekonomika roste. Záporný = recese. Zdravý růst je 2-3% ročně.',
  },
  Unemployment: {
    en: 'Percentage of labor force without jobs. Lower is better. Natural rate is typically 4-5%.',
    cs: 'Procento pracovní síly bez zaměstnání. Nižší je lepší. Přirozená míra je typicky 4-5%.',
  },
};

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
}

export function Sparkline({ data, width = 60, height = 24, color }: SparklineProps) {
  if (!data || data.length < 2) {
    return <div style={{ width, height }} className="bg-slate-700/30 rounded" />;
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  // Calculate points for SVG polyline
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  // Determine color based on trend (first vs last value)
  const trend = data[data.length - 1] - data[0];
  const strokeColor = color || (trend >= 0 ? '#22c55e' : '#ef4444');

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface MarketCardProps {
  signal: MarketSignal;
  compact?: boolean;
  language?: 'en' | 'cs';
}

export function MarketCard({ signal, compact = false, language = 'en' }: MarketCardProps) {
  const [showHelp, setShowHelp] = useState(false);
  const isPositive = signal.trend === 'up';
  const isNegative = signal.trend === 'down';
  
  const trendColor = isPositive ? 'text-green-400' : isNegative ? 'text-red-400' : 'text-slate-400';
  const bgColor = isPositive 
    ? 'bg-green-500/5 border-green-500/20 hover:border-green-500/40' 
    : isNegative 
      ? 'bg-red-500/5 border-red-500/20 hover:border-red-500/40' 
      : 'bg-slate-500/5 border-slate-500/20 hover:border-slate-500/40';

  const categoryIcons: Record<MarketSignal['category'], string> = {
    currency: '💱',
    index: '📈',
    macro: '🏛️',
    rate: '🏦',
    crypto: '₿',
  };

  const formatChange = () => {
    if (signal.changePercent === null) return null;
    
    // For macro indicators, show change in percentage points (pp)
    if (signal.category === 'macro') {
      const sign = signal.changePercent >= 0 ? '+' : '';
      const absValue = Math.abs(signal.changePercent);
      if (absValue < 0.05) return null; // Don't show tiny changes
      return `${sign}${signal.changePercent.toFixed(1)}pp`;
    }
    
    const sign = signal.changePercent >= 0 ? '+' : '';
    return `${sign}${signal.changePercent.toFixed(2)}%`;
  };

  // Determine if this is a macro indicator that needs help
  const getMacroHelpKey = (): string | null => {
    if (signal.category !== 'macro') return null;
    if (signal.name.includes('Inflation')) return 'Inflation';
    if (signal.name.includes('GDP')) return 'GDP Growth';
    if (signal.name.includes('Unemployment')) return 'Unemployment';
    return null;
  };

  const helpKey = getMacroHelpKey();
  const helpText = helpKey ? macroHelp[helpKey]?.[language] : null;

  return (
    <div className="relative">
      <a
        href={signal.sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`block rounded-xl p-3 border transition-all ${bgColor}`}
      >
      {/* Header: Icon + Name + Change */}
      <div className="flex items-start justify-between gap-2 mb-1">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm flex-shrink-0">{categoryIcons[signal.category]}</span>
          <span className="text-sm font-medium text-white truncate">
            {signal.symbol ? `${signal.name} (${signal.symbol})` : signal.name}
          </span>
        </div>
        {formatChange() && (
          <span className={`text-sm font-semibold ${trendColor} flex-shrink-0`}>
            {formatChange()}
          </span>
        )}
      </div>

      {/* Value row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="text-lg font-bold text-white">
            {signal.valueFormatted}
          </div>
          {signal.valueCZKFormatted && (
            <div className="text-xs text-slate-500">
              ≈ {signal.valueCZKFormatted}
            </div>
          )}
        </div>
        
        {/* Sparkline */}
        {signal.sparkline && signal.sparkline.length > 0 && (
          <div className="flex-shrink-0">
            <Sparkline data={signal.sparkline} />
          </div>
        )}
      </div>

      {/* Explanation */}
      <p className="text-xs text-slate-500 mt-2 line-clamp-1">
        {signal.explanation}
      </p>

      {/* Source */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-700/50">
        <span className="text-[10px] text-slate-600">
          {signal.source}
        </span>
        <div className="flex items-center gap-1 text-[10px] text-amber-500/70">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          <span>Source</span>
        </div>
      </div>
    </a>

      {/* Help button for macro indicators */}
      {helpText && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowHelp(!showHelp);
          }}
          className="absolute top-2 right-2 w-5 h-5 rounded-full bg-slate-700/80 hover:bg-slate-600 flex items-center justify-center text-slate-400 hover:text-white transition-colors z-10"
          title={language === 'cs' ? 'Nápověda' : 'Help'}
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      )}

      {/* Help tooltip */}
      {showHelp && helpText && (
        <div 
          className="absolute top-10 right-0 z-20 w-64 p-3 bg-slate-800 border border-slate-600 rounded-lg shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-2 mb-2">
            <span className="text-xs font-semibold text-amber-400">
              {helpKey}
            </span>
            <button
              onClick={() => setShowHelp(false)}
              className="text-slate-400 hover:text-white"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {helpText}
          </p>
          
          {/* Quick interpretation */}
          <div className="mt-2 pt-2 border-t border-slate-700">
            <p className="text-[10px] text-slate-400">
              {signal.trend === 'up' && helpKey === 'Inflation' && (language === 'cs' ? '⚠️ Inflace roste - sledujte' : '⚠️ Rising inflation - watch closely')}
              {signal.trend === 'down' && helpKey === 'Inflation' && (language === 'cs' ? '✓ Inflace klesá - pozitivní' : '✓ Falling inflation - positive')}
              {signal.trend === 'up' && helpKey === 'GDP Growth' && (language === 'cs' ? '✓ Ekonomika roste' : '✓ Economy growing')}
              {signal.trend === 'down' && helpKey === 'GDP Growth' && (language === 'cs' ? '⚠️ Zpomalení růstu' : '⚠️ Growth slowing')}
              {signal.trend === 'up' && helpKey === 'Unemployment' && (language === 'cs' ? '⚠️ Nezaměstnanost roste' : '⚠️ Unemployment rising')}
              {signal.trend === 'down' && helpKey === 'Unemployment' && (language === 'cs' ? '✓ Nezaměstnanost klesá' : '✓ Unemployment falling')}
              {signal.trend === 'stable' && (language === 'cs' ? '→ Stabilní trend' : '→ Stable trend')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
