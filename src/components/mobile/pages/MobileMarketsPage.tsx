'use client';

import { useState } from 'react';
import { MarketSignal } from '@/types';
import { MarketCard } from '@/components/markets/MarketCard';
import { useTranslation } from '@/lib/translation';

interface MobileMarketsPageProps {
  markets: MarketSignal[];
}

type CategoryFilter = 'all' | 'currency' | 'index' | 'crypto' | 'macro';

const categoryLabels: Record<CategoryFilter, { en: string; cs: string; icon: string }> = {
  all: { en: 'All', cs: 'Vše', icon: '🔥' },
  currency: { en: 'Currencies', cs: 'Měny', icon: '💱' },
  index: { en: 'Indices', cs: 'Indexy', icon: '📈' },
  crypto: { en: 'Crypto', cs: 'Krypto', icon: '₿' },
  macro: { en: 'Macro', cs: 'Makro', icon: '🏛️' },
};

export function MobileMarketsPage({ markets }: MobileMarketsPageProps) {
  const [filter, setFilter] = useState<CategoryFilter>('all');
  const { language } = useTranslation();

  const filteredMarkets = filter === 'all' 
    ? markets 
    : markets.filter(m => {
        if (filter === 'macro') {
          return m.category === 'macro' || m.category === 'rate';
        }
        return m.category === filter;
      });

  // Count by category
  const counts: Record<CategoryFilter, number> = {
    all: markets.length,
    currency: markets.filter(m => m.category === 'currency').length,
    index: markets.filter(m => m.category === 'index').length,
    crypto: markets.filter(m => m.category === 'crypto').length,
    macro: markets.filter(m => m.category === 'macro' || m.category === 'rate').length,
  };

  return (
    <div className="h-full overflow-y-auto bg-slate-950 px-4 pt-safe-area">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-slate-950/95 backdrop-blur-sm pt-4 pb-3">
        <h1 className="text-3xl font-black text-white tracking-tight uppercase">
          {language === 'cs' ? 'Trhy' : 'Markets'}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {language === 'cs' 
            ? `${markets.length} signálů z globálních trhů` 
            : `${markets.length} signals from global markets`}
        </p>

        {/* Category Filter Pills */}
        <div className="flex gap-2 mt-4 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          {(Object.keys(categoryLabels) as CategoryFilter[]).map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                filter === cat
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50'
                  : 'bg-slate-800/50 text-slate-400 border border-slate-700'
              }`}
            >
              <span>{categoryLabels[cat].icon}</span>
              <span>{categoryLabels[cat][language]}</span>
              {counts[cat] > 0 && (
                <span className={`text-xs ${filter === cat ? 'text-amber-400/70' : 'text-slate-500'}`}>
                  {counts[cat]}
                </span>
              )}
            </button>
          ))}
        </div>
      </header>

      {/* Market Cards Grid */}
      <div className="pb-32 pt-2">
        {filteredMarkets.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <p>{language === 'cs' ? 'Žádná data k zobrazení' : 'No data to display'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {filteredMarkets.map((market) => (
              <MarketCard key={market.id} signal={market} />
            ))}
          </div>
        )}

        {/* Legend */}
        <div className="mt-6 pt-4 border-t border-slate-800/50">
          <div className="flex flex-wrap gap-3 text-[10px] text-slate-600">
            <span>💱 {language === 'cs' ? 'Měny' : 'Currencies'}</span>
            <span>📈 {language === 'cs' ? 'Indexy' : 'Indices'}</span>
            <span>₿ Crypto</span>
            <span>🏛️ {language === 'cs' ? 'Makro' : 'Macro'}</span>
            <span>🏦 {language === 'cs' ? 'Sazby' : 'Rates'}</span>
          </div>
          <p className="text-[10px] text-slate-600 mt-2">
            {language === 'cs' 
              ? 'Zdroje: ECB, World Bank, Yahoo Finance, CoinGecko'
              : 'Sources: ECB, World Bank, Yahoo Finance, CoinGecko'}
          </p>
        </div>
      </div>
    </div>
  );
}
