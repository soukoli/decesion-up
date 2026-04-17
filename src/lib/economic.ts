import { EconomicSignal } from '@/types';

// Frankfurter API (ECB rates) - completely free, no auth
export async function fetchExchangeRates(): Promise<EconomicSignal[]> {
  try {
    const [todayRes, yesterdayRes] = await Promise.all([
      fetch('https://api.frankfurter.app/latest?from=EUR&to=CZK,USD'),
      fetch(`https://api.frankfurter.app/${getYesterdayDate()}?from=EUR&to=CZK,USD`),
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

// Fetch basic stock indices (using free APIs)
export async function fetchMarketIndices(): Promise<EconomicSignal[]> {
  // Using a simple approach - in production you'd use Alpha Vantage or similar
  // For MVP, we'll use placeholder data that gets updated
  const indices: EconomicSignal[] = [
    {
      id: 'sp500',
      title: 'S&P 500',
      value: '---',
      change: '---',
      trend: 'stable',
      detail: 'US Large Cap Index',
      source: 'Market',
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'nasdaq',
      title: 'NASDAQ',
      value: '---',
      change: '---',
      trend: 'stable',
      detail: 'US Tech Index',
      source: 'Market',
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
