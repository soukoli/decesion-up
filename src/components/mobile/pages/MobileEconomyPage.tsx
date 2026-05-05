'use client';

import { MarketSignal, StockIndex } from '@/types';
import { EconomySection } from '@/components/economy';

interface MobileEconomyPageProps {
  markets: MarketSignal[];
  stocks: StockIndex[];
  onGlobeClick?: () => void;
  conflictCount?: number;
}

export function MobileEconomyPage({ markets, stocks, onGlobeClick, conflictCount = 0 }: MobileEconomyPageProps) {
  return (
    <div className="h-full overflow-y-auto bg-slate-950 px-4 py-4 pb-32">
      <EconomySection 
        initialMarkets={markets} 
        initialStocks={stocks} 
        onGlobeClick={onGlobeClick}
        conflictCount={conflictCount}
      />
    </div>
  );
}
