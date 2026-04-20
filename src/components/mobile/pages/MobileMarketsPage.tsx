'use client';

import { useState } from 'react';
import { StockIndex, EconomicSignal } from '@/types';
import { useTranslation } from '@/lib/translation';
import { Period } from '@/lib/stocks';

interface MobileMarketsPageProps {
  stocks: StockIndex[];
  economic: EconomicSignal[];
}

export function MobileMarketsPage({ stocks, economic }: MobileMarketsPageProps) {
  const [tab, setTab] = useState<'stocks' | 'economic'>('stocks');
  const [period, setPeriod] = useState<Period>('5d');
  const [loading, setLoading] = useState(false);
  const [stocksData, setStocksData] = useState(stocks);
  const { language } = useTranslation();

  const fetchStocks = async (newPeriod: Period) => {
    setLoading(true);
    setPeriod(newPeriod);
    try {
      const response = await fetch(`/api/stocks?period=${newPeriod}`);
      if (response.ok) {
        const data = await response.json();
        setStocksData(data);
      }
    } catch (error) {
      console.error('Error fetching stocks:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-slate-950 px-4 pt-safe-area">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-slate-950/95 backdrop-blur-sm pt-4 pb-3">
        <h1 className="text-3xl font-black text-white tracking-tight uppercase">
          {language === 'cs' ? 'Trhy' : 'Markets'}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {language === 'cs' ? 'Akcie a ekonomické ukazatele' : 'Stocks and economic indicators'}
        </p>

        {/* Tabs */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => setTab('stocks')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              tab === 'stocks'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50'
                : 'bg-slate-800/50 text-slate-400 border border-slate-700'
            }`}
          >
            {language === 'cs' ? 'Indexy' : 'Indices'}
          </button>
          <button
            onClick={() => setTab('economic')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              tab === 'economic'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50'
                : 'bg-slate-800/50 text-slate-400 border border-slate-700'
            }`}
          >
            {language === 'cs' ? 'Ekonomika' : 'Economic'}
          </button>
        </div>

        {/* Period selector for stocks */}
        {tab === 'stocks' && (
          <div className="flex gap-2 mt-3">
            {(['1d', '5d', '1mo'] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => fetchStocks(p)}
                disabled={loading}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  period === p
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-500 hover:text-white'
                } ${loading ? 'opacity-50' : ''}`}
              >
                {p.toUpperCase()}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Content */}
      <div className="pb-32 space-y-3">
        {tab === 'stocks' && stocksData.map((stock) => (
          <StockCard key={stock.symbol} stock={stock} loading={loading} />
        ))}
        
        {tab === 'economic' && economic.map((signal) => (
          <EconomicCard key={signal.id} signal={signal} />
        ))}
      </div>
    </div>
  );
}

function StockCard({ stock, loading }: { stock: StockIndex; loading: boolean }) {
  const isPositive = stock.change >= 0;
  
  return (
    <div className={`p-4 rounded-xl border transition-all ${loading ? 'opacity-50' : ''} ${
      isPositive 
        ? 'bg-green-500/10 border-green-500/30' 
        : 'bg-red-500/10 border-red-500/30'
    }`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white">{stock.name}</h3>
          <p className="text-xs text-slate-400">{stock.symbol}</p>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-white">
            ${stock.currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <p className={`text-sm font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
            {isPositive ? '+' : ''}{stock.change.toFixed(2)} ({isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%)
          </p>
        </div>
      </div>
      <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
        <span>H: ${stock.dayHigh.toFixed(2)}</span>
        <span>L: ${stock.dayLow.toFixed(2)}</span>
      </div>
    </div>
  );
}

function EconomicCard({ signal }: { signal: EconomicSignal }) {
  const trendColors = {
    up: 'text-green-400',
    down: 'text-red-400',
    stable: 'text-slate-400',
  };

  const bgColors = {
    up: 'bg-green-500/10 border-green-500/30',
    down: 'bg-red-500/10 border-red-500/30',
    stable: 'bg-slate-500/10 border-slate-500/30',
  };

  const isLink = signal.source.startsWith('http');

  const content = (
    <div className={`p-4 rounded-xl border ${bgColors[signal.trend]}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-slate-400">{signal.title}</span>
        <span className={`text-lg font-bold ${trendColors[signal.trend]}`}>
          {signal.trend === 'up' ? '↑' : signal.trend === 'down' ? '↓' : '→'}
        </span>
      </div>
      <p className="text-xl font-bold text-white">{signal.value}</p>
      <p className={`text-sm font-medium ${trendColors[signal.trend]}`}>{signal.change}</p>
      <p className="text-xs text-slate-500 mt-2">{signal.detail}</p>
    </div>
  );

  if (isLink) {
    return (
      <a href={signal.source} target="_blank" rel="noopener noreferrer" className="block">
        {content}
      </a>
    );
  }

  return content;
}
