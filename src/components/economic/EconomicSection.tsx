'use client';

import { EconomicSignal } from '@/types';
import { CollapsibleSection } from '@/components/ui/CollapsibleSection';

interface SignalCardProps {
  signal: EconomicSignal;
}

export function SignalCard({ signal }: SignalCardProps) {
  const trendColors = {
    up: 'text-green-400',
    down: 'text-red-400',
    stable: 'text-slate-400',
  };

  const trendIcons = {
    up: '^',
    down: 'v',
    stable: '-',
  };

  const bgColors = {
    up: 'bg-green-500/10 border-green-500/30',
    down: 'bg-red-500/10 border-red-500/30',
    stable: 'bg-slate-500/10 border-slate-500/30',
  };

  // Check if this is a clickable link (stock indices)
  const isLink = signal.source.startsWith('http');

  const CardContent = (
    <>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-slate-400">{signal.title}</span>
        <span className={`text-lg font-bold ${trendColors[signal.trend]}`}>
          {trendIcons[signal.trend]}
        </span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-xl font-bold text-white">{signal.value}</span>
        {!isLink && (
          <span className={`text-sm font-medium ${trendColors[signal.trend]}`}>
            {signal.change}
          </span>
        )}
      </div>
      <p className="text-xs text-slate-500 mt-1 truncate">{signal.detail}</p>
      {isLink && (
        <div className="flex items-center gap-1 mt-2 text-xs text-amber-400">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          View live data
        </div>
      )}
    </>
  );

  if (isLink) {
    return (
      <a 
        href={signal.source}
        target="_blank"
        rel="noopener noreferrer"
        className={`block rounded-xl p-3 border ${bgColors[signal.trend]} transition-all hover:scale-[1.02] hover:border-amber-500/50`}
      >
        {CardContent}
      </a>
    );
  }

  return (
    <div className={`rounded-xl p-3 border ${bgColors[signal.trend]} transition-all hover:scale-[1.02]`}>
      {CardContent}
    </div>
  );
}

interface EconomicSectionProps {
  signals: EconomicSignal[];
}

export function EconomicSection({ signals }: EconomicSectionProps) {
  if (signals.length === 0) {
    return (
      <div className="text-center py-4 text-slate-400">
        <p>Loading economic data...</p>
      </div>
    );
  }

  // Separate currency rates and indices
  const currencies = signals.filter(s => !s.source.startsWith('http'));
  const indices = signals.filter(s => s.source.startsWith('http'));

  return (
    <CollapsibleSection
      title="Economic Signals"
      subtitle="ECB rates"
      badge={signals.length}
    >
      {/* Currency Rates */}
      <div className="grid grid-cols-3 gap-3 mb-3">
        {currencies.map((signal) => (
          <SignalCard key={signal.id} signal={signal} />
        ))}
      </div>

      {/* Market Indices (links) */}
      {indices.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {indices.map((signal) => (
            <SignalCard key={signal.id} signal={signal} />
          ))}
        </div>
      )}
    </CollapsibleSection>
  );
}
