import YahooFinance from 'yahoo-finance2';
import { StockIndex, StockDataPoint } from '@/types';

// Initialize Yahoo Finance instance
const yahooFinance = new YahooFinance();

const INDICES = [
  { symbol: '^GSPC', name: 'S&P 500' },
  { symbol: '^IXIC', name: 'NASDAQ' },
];

export type Period = '1d' | '5d' | '1mo';

function getPeriodDates(period: Period): { start: Date; end: Date } {
  const end = new Date();
  const start = new Date();
  
  switch (period) {
    case '1d':
      start.setDate(start.getDate() - 1);
      break;
    case '5d':
      start.setDate(start.getDate() - 5);
      break;
    case '1mo':
      start.setMonth(start.getMonth() - 1);
      break;
  }
  
  return { start, end };
}

interface ChartQuote {
  date: Date;
  open: number | null;
  high: number | null;
  low: number | null;
  close: number | null;
  volume: number | null;
}

interface ChartResult {
  meta: {
    symbol: string;
    currency: string;
  };
  quotes: ChartQuote[];
}

interface QuoteResult {
  regularMarketPrice?: number;
  regularMarketPreviousClose?: number;
  regularMarketDayHigh?: number;
  regularMarketDayLow?: number;
}

export async function fetchStockData(period: Period = '5d'): Promise<StockIndex[]> {
  const { start, end } = getPeriodDates(period);
  const results: StockIndex[] = [];

  for (const index of INDICES) {
    try {
      // Get current quote
      const quote = await yahooFinance.quote(index.symbol) as QuoteResult;
      
      // Get historical data
      const historical = await yahooFinance.chart(index.symbol, {
        period1: start,
        period2: end,
        interval: period === '1d' ? '5m' : '1d', // 5-minute intervals for 1 day, daily for longer
      }) as ChartResult;

      const historicalData: StockDataPoint[] = (historical.quotes || []).map((item: ChartQuote) => ({
        date: new Date(item.date).toISOString(),
        timestamp: new Date(item.date).getTime(),
        open: item.open ?? 0,
        high: item.high ?? 0,
        low: item.low ?? 0,
        close: item.close ?? 0,
        volume: item.volume ?? 0,
      })).filter((item: StockDataPoint) => item.close > 0);

      const currentPrice = quote.regularMarketPrice ?? 0;
      const previousClose = quote.regularMarketPreviousClose ?? 0;
      const change = currentPrice - previousClose;
      const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0;

      results.push({
        symbol: index.symbol,
        name: index.name,
        currentPrice,
        previousClose,
        change,
        changePercent,
        dayHigh: quote.regularMarketDayHigh ?? currentPrice,
        dayLow: quote.regularMarketDayLow ?? currentPrice,
        historicalData,
      });
    } catch (error) {
      console.error(`Error fetching ${index.symbol}:`, error);
      // Return placeholder data if API fails
      results.push({
        symbol: index.symbol,
        name: index.name,
        currentPrice: 0,
        previousClose: 0,
        change: 0,
        changePercent: 0,
        dayHigh: 0,
        dayLow: 0,
        historicalData: [],
      });
    }
  }

  return results;
}
