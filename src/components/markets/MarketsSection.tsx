'use client';

import { useState, useEffect } from 'react';
import { MarketSignal } from '@/types';
import { MarketCard } from './MarketCard';
import { CollapsibleSection } from '@/components/ui/CollapsibleSection';
import { useTranslation } from '@/lib/translation';

interface MarketsSectionProps {
  initialMarkets?: MarketSignal[];
}

type CategoryFilter = 'all' | 'currency' | 'index' | 'crypto' | 'macro';

const categoryLabels: Record<CategoryFilter, { en: string; cs: string }> = {
  all: { en: 'All', cs: 'Vše' },
  currency: { en: 'Currencies', cs: 'Měny' },
  index: { en: 'Indices', cs: 'Indexy' },
  crypto: { en: 'Crypto', cs: 'Krypto' },
  macro: { en: 'Macro', cs: 'Makro' },
};

export function MarketsSection({ initialMarkets = [] }: MarketsSectionProps) {
  const [markets, setMarkets] = useState<MarketSignal[]>(initialMarkets);
  const [loading, setLoading] = useState(initialMarkets.length === 0);
  const [filter, setFilter] = useState<CategoryFilter>('all');
  const { language } = useTranslation();

  useEffect(() => {
    if (initialMarkets.length === 0) {
      fetchMarkets();
    }
  }, []);

  const fetchMarkets = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/markets');
      if (response.ok) {
        const data = await response.json();
        setMarkets(data.markets || []);
      }
    } catch (error) {
      console.error('Error fetching markets:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const filterTabs = (
    <div className="flex items-center gap-1 bg-slate-800/50 rounded-lg p-1 overflow-x-auto">
      {(Object.keys(categoryLabels) as CategoryFilter[]).map((cat) => (
        <button
          key={cat}
          onClick={() => setFilter(cat)}
          className={`px-2 py-1 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
            filter === cat
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50'
              : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
          }`}
        >
          {categoryLabels[cat][language]}
          {counts[cat] > 0 && (
            <span className="ml-1 text-[10px] opacity-70">({counts[cat]})</span>
          )}
        </button>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="text-center py-8 text-slate-400">
        <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-sm">{language === 'cs' ? 'Načítám data...' : 'Loading data...'}</p>
      </div>
    );
  }

  if (markets.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400">
        <p>{language === 'cs' ? 'Nepodařilo se načíst data' : 'Failed to load data'}</p>
      </div>
    );
  }

  return (
    <CollapsibleSection
      title={language === 'cs' ? 'Trhy' : 'Markets'}
      subtitle={`${markets.length} ${language === 'cs' ? 'signálů' : 'signals'}`}
      badge={markets.length}
      rightContent={filterTabs}
      defaultExpanded={true}
    >
      {/* Grid of market cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredMarkets.map((market) => (
          <MarketCard key={market.id} signal={market} />
        ))}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-3 border-t border-slate-800">
        <div className="flex flex-wrap gap-3 text-[10px] text-slate-600">
          <span>💱 {language === 'cs' ? 'Měny' : 'Currencies'}</span>
          <span>📈 {language === 'cs' ? 'Indexy' : 'Indices'}</span>
          <span>₿ Crypto</span>
          <span>🏛️ {language === 'cs' ? 'Makro ukazatele' : 'Macro indicators'}</span>
          <span>🏦 {language === 'cs' ? 'Úrokové sazby' : 'Interest rates'}</span>
        </div>
        <p className="text-[10px] text-slate-600 mt-2">
          {language === 'cs' 
            ? 'Data z ECB, World Bank, Yahoo Finance, CoinGecko. Klikněte pro zdrojová data.'
            : 'Data from ECB, World Bank, Yahoo Finance, CoinGecko. Click for source data.'}
        </p>
      </div>
    </CollapsibleSection>
  );
}
