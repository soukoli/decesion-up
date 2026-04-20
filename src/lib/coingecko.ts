// CoinGecko API for cryptocurrency prices
// Documentation: https://www.coingecko.com/en/api/documentation

export interface CryptoPrice {
  id: string;
  symbol: string;
  name: string;
  priceUSD: number;
  priceEUR: number;
  priceCZK: number;
  change24h: number;
  change7d: number;
  marketCap: number;
  volume24h: number;
  sparkline7d: number[];
  lastUpdated: string;
  sourceUrl: string;
  explanation: string;
}

interface CoinGeckoMarketData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  market_cap: number;
  total_volume: number;
  price_change_percentage_24h: number;
  price_change_percentage_7d_in_currency?: number;
  sparkline_in_7d?: {
    price: number[];
  };
  last_updated: string;
}

interface CoinGeckoSimplePrice {
  [coin: string]: {
    usd: number;
    eur: number;
    czk: number;
    usd_24h_change?: number;
  };
}

const CRYPTO_COINS = [
  { 
    id: 'bitcoin', 
    symbol: 'BTC', 
    name: 'Bitcoin',
    explanation: 'The first and largest cryptocurrency by market cap',
  },
  { 
    id: 'ethereum', 
    symbol: 'ETH', 
    name: 'Ethereum',
    explanation: 'Leading smart contract platform for decentralized apps',
  },
];

export async function fetchCryptoPrices(): Promise<CryptoPrice[]> {
  try {
    const coinIds = CRYPTO_COINS.map(c => c.id).join(',');
    
    // Get prices in multiple currencies with sparkline
    const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${coinIds}&order=market_cap_desc&sparkline=true&price_change_percentage=7d`;
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(10000),
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!response.ok) {
      console.error('CoinGecko API error:', response.status);
      return getFallbackCryptoPrices();
    }

    const marketData: CoinGeckoMarketData[] = await response.json();

    // Get CZK and EUR prices separately (simple endpoint)
    const pricesUrl = `https://api.coingecko.com/api/v3/simple/price?ids=${coinIds}&vs_currencies=usd,eur,czk&include_24hr_change=true`;
    const pricesResponse = await fetch(pricesUrl, {
      signal: AbortSignal.timeout(5000),
      next: { revalidate: 300 },
    });

    let simplePrices: CoinGeckoSimplePrice = {};
    if (pricesResponse.ok) {
      simplePrices = await pricesResponse.json();
    }

    const results: CryptoPrice[] = [];

    for (const coin of CRYPTO_COINS) {
      const market = marketData.find(m => m.id === coin.id);
      const simple = simplePrices[coin.id];

      if (market) {
        results.push({
          id: `crypto-${coin.id}`,
          symbol: coin.symbol,
          name: coin.name,
          priceUSD: market.current_price,
          priceEUR: simple?.eur || market.current_price * 0.92, // Fallback EUR estimate
          priceCZK: simple?.czk || market.current_price * 23.5, // Fallback CZK estimate
          change24h: market.price_change_percentage_24h || 0,
          change7d: market.price_change_percentage_7d_in_currency || 0,
          marketCap: market.market_cap,
          volume24h: market.total_volume,
          sparkline7d: market.sparkline_in_7d?.price || [],
          lastUpdated: market.last_updated,
          sourceUrl: `https://www.coingecko.com/en/coins/${coin.id}`,
          explanation: coin.explanation,
        });
      }
    }

    return results;
  } catch (error) {
    console.error('Error fetching crypto prices:', error);
    return getFallbackCryptoPrices();
  }
}

// Fallback prices if API fails
function getFallbackCryptoPrices(): CryptoPrice[] {
  return CRYPTO_COINS.map(coin => ({
    id: `crypto-${coin.id}`,
    symbol: coin.symbol,
    name: coin.name,
    priceUSD: 0,
    priceEUR: 0,
    priceCZK: 0,
    change24h: 0,
    change7d: 0,
    marketCap: 0,
    volume24h: 0,
    sparkline7d: [],
    lastUpdated: new Date().toISOString(),
    sourceUrl: `https://www.coingecko.com/en/coins/${coin.id}`,
    explanation: coin.explanation,
  }));
}

// Format large numbers (market cap, volume)
export function formatLargeNumber(num: number): string {
  if (num >= 1_000_000_000_000) {
    return `$${(num / 1_000_000_000_000).toFixed(2)}T`;
  }
  if (num >= 1_000_000_000) {
    return `$${(num / 1_000_000_000).toFixed(2)}B`;
  }
  if (num >= 1_000_000) {
    return `$${(num / 1_000_000).toFixed(2)}M`;
  }
  return `$${num.toLocaleString()}`;
}

// Format crypto price with appropriate decimals
export function formatCryptoPrice(price: number, currency: 'USD' | 'EUR' | 'CZK' = 'USD'): string {
  const symbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '';
  const suffix = currency === 'CZK' ? ' Kč' : '';
  
  if (price >= 1000) {
    return `${symbol}${price.toLocaleString('en-US', { maximumFractionDigits: 0 })}${suffix}`;
  }
  if (price >= 1) {
    return `${symbol}${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}${suffix}`;
  }
  return `${symbol}${price.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 6 })}${suffix}`;
}
