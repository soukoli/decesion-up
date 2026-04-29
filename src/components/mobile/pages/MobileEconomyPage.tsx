'use client';

import { MarketSignal, StockIndex } from '@/types';
import { EconomySection } from '@/components/economy';

interface MobileEconomyPageProps {
  markets: MarketSignal[];
  stocks: StockIndex[];
}

export function MobileEconomyPage({ markets, stocks }: MobileEconomyPageProps) {
  return (
    <div className="h-full overflow-y-auto bg-slate-950 px-4 py-4 pb-32">
      <EconomySection initialMarkets={markets} initialStocks={stocks} />
    </div>
  );
}
