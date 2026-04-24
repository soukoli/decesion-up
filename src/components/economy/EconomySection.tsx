'use client';

import { useState, useEffect } from 'react';
import { MarketSignal, StockIndex } from '@/types';
import { useTranslation } from '@/lib/translation';

interface EconomySectionProps {
  initialMarkets?: MarketSignal[];
  initialStocks?: StockIndex[];
}

// Sparkline component - responsive width
function Sparkline({ 
  data, 
  trend, 
  height = 32,
  className = ''
}: { 
  data: number[]; 
  trend: 'up' | 'down' | 'stable';
  height?: number;
  className?: string;
}) {
  if (!data || data.length < 2) return null;
  
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const padding = 2;
  
  // Create SVG path for the line
  const points = data.map((val, i) => {
    const x = padding + (i / (data.length - 1)) * (100 - padding * 2);
    const y = padding + (1 - (val - min) / range) * (height - padding * 2);
    return `${x},${y}`;
  }).join(' ');
  
  // Create area path for gradient fill
  const areaPath = `M ${padding},${height - padding} ` + 
    data.map((val, i) => {
      const x = padding + (i / (data.length - 1)) * (100 - padding * 2);
      const y = padding + (1 - (val - min) / range) * (height - padding * 2);
      return `L ${x},${y}`;
    }).join(' ') + 
    ` L ${100 - padding},${height - padding} Z`;
  
  const color = trend === 'up' ? '#22c55e' : trend === 'down' ? '#ef4444' : '#94a3b8';
  const gradientId = `gradient-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <svg 
      viewBox={`0 0 100 ${height}`} 
      preserveAspectRatio="none"
      className={`w-full ${className}`}
      style={{ height }}
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d={areaPath}
        fill={`url(#${gradientId})`}
      />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

// Currency card component - compact, side-by-side design
function CurrencyCard({ signal, language }: { signal: MarketSignal; language: 'en' | 'cs' }) {
  const trendColor = signal.trend === 'up' ? 'text-green-400' : signal.trend === 'down' ? 'text-red-400' : 'text-slate-400';
  const trendBg = signal.trend === 'up' ? 'bg-green-500/10' : signal.trend === 'down' ? 'bg-red-500/10' : 'bg-slate-500/10';
  const trendIcon = signal.trend === 'up' ? '↑' : signal.trend === 'down' ? '↓' : '→';
  
  // Format change for display
  const changeDisplay = signal.changePercent !== null 
    ? `${signal.changePercent > 0 ? '+' : ''}${signal.changePercent.toFixed(2)}%`
    : '—';
  
  return (
    <a
      href={signal.sourceUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`block p-3 ${trendBg} rounded-xl border border-slate-700/50 hover:border-slate-500 transition-all group`}
    >
      {/* Header: currency pair + change */}
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-slate-400 group-hover:text-slate-300 transition-colors">
          {signal.name}
        </span>
        <span className={`text-xs font-semibold ${trendColor}`}>
          {trendIcon} {changeDisplay}
        </span>
      </div>
      
      {/* Main value - large */}
      <p className="text-xl font-bold text-white mb-2 group-hover:text-amber-400 transition-colors">
        {signal.valueFormatted}
      </p>
      
      {/* Sparkline - full width */}
      {signal.sparkline && signal.sparkline.length > 0 && (
        <Sparkline 
          data={signal.sparkline} 
          trend={signal.trend} 
          height={28}
        />
      )}
    </a>
  );
}

// Stock index card - larger with more details
function StockCard({ stock, language }: { stock: StockIndex; language: 'en' | 'cs' }) {
  const isUp = stock.change >= 0;
  const trendColor = isUp ? 'text-green-400' : 'text-red-400';
  const bgGradient = isUp ? 'from-green-500/10' : 'from-red-500/10';
  
  // Create sparkline data from historical data
  const sparklineData = stock.historicalData?.slice(-20).map(d => d.close) || [];
  
  return (
    <a
      href={`https://finance.yahoo.com/quote/${stock.symbol}`}
      target="_blank"
      rel="noopener noreferrer"
      className={`block p-4 bg-gradient-to-br ${bgGradient} to-transparent rounded-xl border border-slate-700/50 hover:border-slate-500 transition-all group`}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wide">{stock.symbol}</p>
          <p className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
            {stock.name}
          </p>
        </div>
        <span className="text-2xl">{stock.symbol.includes('IXIC') ? '📊' : '📈'}</span>
      </div>
      
      {/* Price and change */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-2xl font-black text-white">
            {stock.currentPrice.toLocaleString('en-US', { maximumFractionDigits: 2 })}
          </p>
          <p className={`text-sm font-semibold ${trendColor}`}>
            {isUp ? '↑' : '↓'} {Math.abs(stock.change).toFixed(2)} ({isUp ? '+' : ''}{stock.changePercent.toFixed(2)}%)
          </p>
        </div>
        
        {/* Mini chart */}
        {sparklineData.length > 0 && (
          <div className="w-16 opacity-60 group-hover:opacity-100 transition-opacity">
            <Sparkline data={sparklineData} trend={isUp ? 'up' : 'down'} height={24} />
          </div>
        )}
      </div>
      
      {/* Day range */}
      <div className="mt-3 pt-2 border-t border-slate-700/50">
        <div className="flex justify-between text-xs text-slate-500">
          <span>{language === 'cs' ? 'Min' : 'Low'}: {stock.dayLow?.toFixed(2)}</span>
          <span>{language === 'cs' ? 'Max' : 'High'}: {stock.dayHigh?.toFixed(2)}</span>
        </div>
      </div>
    </a>
  );
}

export function EconomySection({ initialMarkets = [], initialStocks = [] }: EconomySectionProps) {
  const [markets, setMarkets] = useState<MarketSignal[]>(initialMarkets);
  const [stocks, setStocks] = useState<StockIndex[]>(initialStocks);
  const [loading, setLoading] = useState(initialMarkets.length === 0);
  const { language } = useTranslation();

  useEffect(() => {
    if (initialMarkets.length === 0) {
      fetchData();
    }
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [marketsRes, stocksRes] = await Promise.all([
        fetch('/api/markets?period=5d'),
        fetch('/api/stocks?period=5d'),
      ]);
      
      if (marketsRes.ok) {
        const data = await marketsRes.json();
        setMarkets(data.markets || []);
      }
      
      if (stocksRes.ok) {
        const data = await stocksRes.json();
        setStocks(data || []);
      }
    } catch (error) {
      console.error('Error fetching economy data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter only currencies we want: EUR/CZK, EUR/USD, EUR/GBP
  const currencies = markets.filter(m => 
    m.category === 'currency' && 
    (m.id.toLowerCase().includes('eur') || m.id.toLowerCase().includes('usd') || m.id.toLowerCase().includes('gbp'))
  );

  // Filter stock indices: S&P 500 and NASDAQ
  const stockIndices = stocks.filter(s => 
    s.symbol === '^GSPC' || s.symbol === '^IXIC'
  );

  if (loading) {
    return (
      <div className="text-center py-8 text-slate-400">
        <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-sm">{language === 'cs' ? 'Načítám data...' : 'Loading data...'}</p>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      {/* Currency section - 3 cards side by side */}
      <div>
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          {language === 'cs' ? 'Kurzy měn' : 'Exchange Rates'}
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {currencies.map((currency) => (
            <CurrencyCard key={currency.id} signal={currency} language={language} />
          ))}
        </div>
      </div>

      {/* Stock indices - larger cards */}
      <div>
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          {language === 'cs' ? 'Akciové indexy' : 'Stock Indices'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {stockIndices.map((stock) => (
            <StockCard key={stock.symbol} stock={stock} language={language} />
          ))}
        </div>
      </div>

      {/* Footer with source */}
      <div className="pt-3 border-t border-slate-800">
        <p className="text-[10px] text-slate-600 text-center">
          {language === 'cs' 
            ? 'Data: ECB, Yahoo Finance • 7denní trend'
            : 'Data: ECB, Yahoo Finance • 7-day trend'}
        </p>
      </div>
    </section>
  );
}
