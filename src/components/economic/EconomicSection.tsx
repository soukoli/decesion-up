'use client';

import { EconomicSignal } from '@/types';

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
    up: '↑',
    down: '↓',
    stable: '→',
  };

  const bgColors = {
    up: 'bg-green-500/10 border-green-500/30',
    down: 'bg-red-500/10 border-red-500/30',
    stable: 'bg-slate-500/10 border-slate-500/30',
  };

  return (
    <div className={`rounded-xl p-3 border ${bgColors[signal.trend]} transition-all hover:scale-[1.02]`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-slate-400">{signal.title}</span>
        <span className={`text-lg font-bold ${trendColors[signal.trend]}`}>
          {trendIcons[signal.trend]}
        </span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-xl font-bold text-white">{signal.value}</span>
        <span className={`text-sm font-medium ${trendColors[signal.trend]}`}>
          {signal.change}
        </span>
      </div>
      <p className="text-xs text-slate-500 mt-1 truncate">{signal.detail}</p>
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

  return (
    <section className="mb-8">
      <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
        <span className="text-2xl">📊</span>
        Economic Signals
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {signals.map((signal) => (
          <SignalCard key={signal.id} signal={signal} />
        ))}
      </div>
    </section>
  );
}
