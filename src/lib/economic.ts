import { EconomicSignal } from '@/types';

// Frankfurter API (ECB rates) - completely free, no auth
export async function fetchExchangeRates(): Promise<EconomicSignal[]> {
  try {
    const [todayRes, yesterdayRes] = await Promise.all([
      fetch('https://api.frankfurter.app/latest?from=EUR&to=CZK,USD,GBP', {
        signal: AbortSignal.timeout(5000),
        next: { revalidate: 3600 }, // Cache for 1 hour
      }),
      fetch(`https://api.frankfurter.app/${getYesterdayDate()}?from=EUR&to=CZK,USD,GBP`, {
        signal: AbortSignal.timeout(5000),
        next: { revalidate: 86400 }, // Cache for 24 hours (yesterday's rates don't change)
      }),
    ]);

    const today = await todayRes.json();
    const yesterday = await yesterdayRes.json();

    const signals: EconomicSignal[] = [];

    // EUR/CZK
    const czkToday = today.rates.CZK;
    const czkYesterday = yesterday.rates.CZK;
    const czkChange = ((czkToday - czkYesterday) / czkYesterday * 100).toFixed(2);
    
    signals.push({
      id: 'eur-czk',
      title: 'EUR/CZK',
      value: czkToday.toFixed(2),
      change: `${parseFloat(czkChange) >= 0 ? '+' : ''}${czkChange}%`,
      trend: parseFloat(czkChange) > 0.1 ? 'up' : parseFloat(czkChange) < -0.1 ? 'down' : 'stable',
      detail: 'European Central Bank rate',
      source: 'ECB',
      updatedAt: today.date,
    });

    // EUR/USD
    const usdToday = today.rates.USD;
    const usdYesterday = yesterday.rates.USD;
    const usdChange = ((usdToday - usdYesterday) / usdYesterday * 100).toFixed(2);
    
    signals.push({
      id: 'eur-usd',
      title: 'EUR/USD',
      value: usdToday.toFixed(4),
      change: `${parseFloat(usdChange) >= 0 ? '+' : ''}${usdChange}%`,
      trend: parseFloat(usdChange) > 0.1 ? 'up' : parseFloat(usdChange) < -0.1 ? 'down' : 'stable',
      detail: 'Euro to US Dollar',
      source: 'ECB',
      updatedAt: today.date,
    });

    // EUR/GBP
    const gbpToday = today.rates.GBP;
    const gbpYesterday = yesterday.rates.GBP;
    const gbpChange = ((gbpToday - gbpYesterday) / gbpYesterday * 100).toFixed(2);
    
    signals.push({
      id: 'eur-gbp',
      title: 'EUR/GBP',
      value: gbpToday.toFixed(4),
      change: `${parseFloat(gbpChange) >= 0 ? '+' : ''}${gbpChange}%`,
      trend: parseFloat(gbpChange) > 0.1 ? 'up' : parseFloat(gbpChange) < -0.1 ? 'down' : 'stable',
      detail: 'Euro to British Pound',
      source: 'ECB',
      updatedAt: today.date,
    });

    return signals;
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    return [];
  }
}

function getYesterdayDate(): string {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return date.toISOString().split('T')[0];
}

// Market indices with links to sources (no live data - requires paid API)
export async function fetchMarketIndices(): Promise<EconomicSignal[]> {
  // These are links to view current data - we can't fetch live values without paid API
  const indices: EconomicSignal[] = [
    {
      id: 'sp500',
      title: 'S&P 500',
      value: 'View Live',
      change: '→',
      trend: 'stable',
      detail: 'Click for real-time data',
      source: 'https://www.google.com/finance/quote/.INX:INDEXSP',
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'nasdaq',
      title: 'NASDAQ',
      value: 'View Live',
      change: '→',
      trend: 'stable',
      detail: 'Click for real-time data',
      source: 'https://www.google.com/finance/quote/.IXIC:INDEXNASDAQ',
      updatedAt: new Date().toISOString(),
    },
  ];
  
  return indices;
}

export async function fetchAllEconomicData(): Promise<EconomicSignal[]> {
  const [exchangeRates, indices] = await Promise.all([
    fetchExchangeRates(),
    fetchMarketIndices(),
  ]);

  return [...exchangeRates, ...indices];
}
