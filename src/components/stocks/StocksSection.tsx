'use client';

import { useState, useEffect } from 'react';
import { StockIndex } from '@/types';
import { StockChart } from './StockChart';
import { Period } from '@/lib/stocks';
import { CollapsibleSection } from '@/components/ui/CollapsibleSection';

interface StockCardProps {
  stock: StockIndex;
}

function StockCard({ stock }: StockCardProps) {
  const isPositive = stock.change >= 0;
  const trendColor = isPositive ? 'text-green-400' : 'text-red-400';
  const bgColor = isPositive 
    ? 'bg-green-500/10 border-green-500/30' 
    : 'bg-red-500/10 border-red-500/30';
  
  const formatPrice = (price: number) => {
    return price.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatChange = (change: number, percent: number) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${formatPrice(change)} (${sign}${percent.toFixed(2)}%)`;
  };

  return (
    <div className={`rounded-xl border ${bgColor} overflow-hidden transition-all hover:scale-[1.01]`}>
      {/* Header */}
      <div className="p-3 pb-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-semibold text-white">{stock.name}</span>
          <span className="text-xs text-slate-400">{stock.symbol}</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-bold text-white">
            ${formatPrice(stock.currentPrice)}
          </span>
          <span className={`text-sm font-medium ${trendColor}`}>
            {formatChange(stock.change, stock.changePercent)}
          </span>
        </div>
        <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
          <span>H: ${formatPrice(stock.dayHigh)}</span>
          <span>L: ${formatPrice(stock.dayLow)}</span>
        </div>
      </div>
      
      {/* Chart */}
      <div className="mt-2">
        <StockChart stock={stock} height={100} />
      </div>
    </div>
  );
}

interface StocksSectionProps {
  initialStocks?: StockIndex[];
}

export function StocksSection({ initialStocks = [] }: StocksSectionProps) {
  const [stocks, setStocks] = useState<StockIndex[]>(initialStocks);
  const [period, setPeriod] = useState<Period>('5d');
  const [loading, setLoading] = useState(false);

  const periods: { value: Period; label: string }[] = [
    { value: '1d', label: '1D' },
    { value: '5d', label: '5D' },
    { value: '1mo', label: '1M' },
  ];

  const fetchData = async (selectedPeriod: Period) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/stocks?period=${selectedPeriod}`);
      if (response.ok) {
        const data = await response.json();
        setStocks(data);
      }
    } catch (error) {
      console.error('Error fetching stocks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePeriodChange = (newPeriod: Period) => {
    setPeriod(newPeriod);
    fetchData(newPeriod);
  };

  // Fetch on mount if no initial data
  useEffect(() => {
    if (initialStocks.length === 0) {
      fetchData(period);
    }
  }, []);

  if (stocks.length === 0 && !loading) {
    return (
      <div className="text-center py-4 text-slate-400">
        <p>Loading market data...</p>
      </div>
    );
  }

  const periodSelector = (
    <div className="flex items-center gap-1 bg-slate-800/50 rounded-lg p-1">
      {periods.map((p) => (
        <button
          key={p.value}
          onClick={() => handlePeriodChange(p.value)}
          disabled={loading}
          className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
            period === p.value
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50'
              : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
          } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {p.label}
        </button>
      ))}
    </div>
  );

  return (
    <CollapsibleSection
      title="Market Indices"
      subtitle="Yahoo Finance"
      badge={stocks.length}
      rightContent={periodSelector}
    >
      {/* Loading overlay */}
      <div className={`relative ${loading ? 'opacity-50' : ''}`}>
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        
        {/* Stock cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stocks.map((stock) => (
            <StockCard key={stock.symbol} stock={stock} />
          ))}
        </div>
      </div>
      
      {/* Source attribution */}
      <p className="text-xs text-slate-600 mt-3 text-center">
        Data from Yahoo Finance - Delayed 15-20 min
      </p>
    </CollapsibleSection>
  );
}
