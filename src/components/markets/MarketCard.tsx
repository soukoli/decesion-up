'use client';

import { MarketSignal } from '@/types';

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
}

export function MarketCard({ signal, compact = false }: MarketCardProps) {
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
    const sign = signal.changePercent >= 0 ? '+' : '';
    return `${sign}${signal.changePercent.toFixed(2)}%`;
  };

  return (
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
  );
}
