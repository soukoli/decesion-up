import { NextResponse, NextRequest } from 'next/server';
import { MarketSignal } from '@/types';
import { fetchExchangeRates, fetchCurrencySparklines } from '@/lib/economic';
import { fetchStockData, Period } from '@/lib/stocks';
import { fetchAllMacroIndicators } from '@/lib/worldbank';
import { fetchECBRates, getFallbackECBRates } from '@/lib/ecb';
import { fetchCryptoPrices, formatCryptoPrice, formatLargeNumber } from '@/lib/coingecko';

// Dynamic route - needs to read query params
export const dynamic = 'force-dynamic';

// Get current EUR/CZK rate for conversions
let eurCzkRate = 25.0; // Default fallback

export async function GET(request: NextRequest) {
  try {
    // Get period from query params (default to 5d)
    const { searchParams } = new URL(request.url);
    const periodParam = searchParams.get('period') || '5d';
    const period: Period = ['1d', '5d', '1mo'].includes(periodParam) ? periodParam as Period : '5d';

    // Fetch all data in parallel
    const [exchangeRates, currencySparklines, stocks, macroIndicators, ecbRates, cryptoPrices] = await Promise.all([
      fetchExchangeRates().catch(err => {
        console.error('Exchange rates fetch failed:', err);
        return [];
      }),
      fetchCurrencySparklines(7).catch(err => {
        console.error('Currency sparklines fetch failed:', err);
        return [];
      }),
      fetchStockData(period).catch(err => {
        console.error('Stocks fetch failed:', err);
        return [];
      }),
      fetchAllMacroIndicators().catch(err => {
        console.error('Macro indicators fetch failed:', err);
        return [];
      }),
      fetchECBRates().catch(err => {
        console.error('ECB rates fetch failed:', err);
        return getFallbackECBRates();
      }),
      fetchCryptoPrices().catch(err => {
        console.error('Crypto prices fetch failed:', err);
        return [];
      }),
    ]);

    // Create a map for currency sparklines
    const sparklineMap = new Map(currencySparklines.map(s => [s.id, s.sparkline]));

    // Get EUR/CZK rate for conversions
    const eurCzkSignal = exchangeRates.find(r => r.id === 'eur-czk');
    if (eurCzkSignal) {
      eurCzkRate = parseFloat(eurCzkSignal.value);
    }
    const usdCzkRate = eurCzkRate / 1.08; // Approximate USD/CZK

    const markets: MarketSignal[] = [];

    // 1. Currency Exchange Rates
    for (const rate of exchangeRates) {
      const changeNum = parseFloat(rate.change.replace('%', '').replace('+', ''));
      const sparkline = sparklineMap.get(rate.id) || [];
      
      markets.push({
        id: rate.id,
        name: rate.title,
        category: 'currency',
        value: parseFloat(rate.value),
        valueFormatted: rate.value,
        change: changeNum,
        changePercent: changeNum,
        trend: rate.trend,
        sparkline, // Add sparkline data
        explanation: rate.detail,
        source: 'ECB',
        sourceUrl: 'https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html',
        updatedAt: rate.updatedAt,
      });
    }

    // 2. Stock Market Indices
    for (const stock of stocks) {
      // Create sparkline from historical data
      const sparkline = stock.historicalData
        .slice(-20) // Last 20 points
        .map(d => d.close);

      const valueCZK = stock.currentPrice * usdCzkRate;

      markets.push({
        id: `stock-${stock.symbol.replace('^', '')}`,
        name: stock.name,
        symbol: stock.symbol,
        category: 'index',
        value: stock.currentPrice,
        valueFormatted: `$${stock.currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        valueCZK,
        valueCZKFormatted: `${Math.round(valueCZK).toLocaleString('cs-CZ')} Kč`,
        change: stock.change,
        changePercent: stock.changePercent,
        trend: stock.change > 0 ? 'up' : stock.change < 0 ? 'down' : 'stable',
        sparkline,
        explanation: stock.name === 'S&P 500' 
          ? 'Index 500 largest US companies by market cap'
          : 'Tech-heavy index of NASDAQ exchange',
        source: 'Yahoo Finance',
        sourceUrl: `https://finance.yahoo.com/quote/${encodeURIComponent(stock.symbol)}`,
        updatedAt: new Date().toISOString(),
      });
    }

    // 3. Macro Indicators (Inflation, GDP, Unemployment)
    for (const indicator of macroIndicators) {
      const isInflation = indicator.name === 'Inflation';
      const isGDP = indicator.name === 'GDP Growth';
      const isUnemployment = indicator.name === 'Unemployment';

      // Build more informative explanation with year-over-year context
      let explanation = '';
      let trend: 'up' | 'down' | 'stable' = 'stable';
      
      if (isInflation) {
        explanation = `Inflation ${indicator.year}`;
        if (indicator.previousValue !== null) {
          explanation += ` (${indicator.previousYear}: ${indicator.previousValue.toFixed(1)}%)`;
        }
        // For inflation, lower is generally better
        trend = indicator.change !== null 
          ? (indicator.change > 0.1 ? 'up' : indicator.change < -0.1 ? 'down' : 'stable')
          : 'stable';
      } else if (isGDP) {
        explanation = `GDP growth ${indicator.year}`;
        if (indicator.previousValue !== null) {
          explanation += ` (${indicator.previousYear}: ${indicator.previousValue.toFixed(1)}%)`;
        }
        // For GDP, use the actual value to determine trend (positive growth = up)
        trend = indicator.value > 0.5 ? 'up' : indicator.value < 0 ? 'down' : 'stable';
      } else if (isUnemployment) {
        explanation = `Unemployment ${indicator.year}`;
        if (indicator.previousValue !== null) {
          explanation += ` (${indicator.previousYear}: ${indicator.previousValue.toFixed(1)}%)`;
        }
        // For unemployment, lower is better
        trend = indicator.change !== null 
          ? (indicator.change > 0.1 ? 'up' : indicator.change < -0.1 ? 'down' : 'stable')
          : 'stable';
      }

      const countryFlag = 
        indicator.countryCode === 'CZE' ? '🇨🇿' :
        indicator.countryCode === 'USA' ? '🇺🇸' :
        indicator.countryCode === 'EUU' ? '🇪🇺' : '';

      // For macro indicators, show year-over-year change in absolute terms (not percent of percent)
      const absChange = indicator.change !== null ? indicator.change : null;

      markets.push({
        id: indicator.id,
        name: `${countryFlag} ${indicator.country} ${indicator.name}`,
        category: 'macro',
        value: indicator.value,
        valueFormatted: `${indicator.value.toFixed(1)}%`,
        change: absChange,
        changePercent: absChange, // Use absolute change for display (e.g., +0.3pp not +15%)
        trend,
        explanation,
        source: 'World Bank',
        sourceUrl: indicator.sourceUrl,
        updatedAt: indicator.year,
        country: indicator.country,
        unit: '%',
      });
    }

    // 4. ECB Interest Rates
    for (const rate of ecbRates) {
      markets.push({
        id: rate.id,
        name: rate.name,
        category: 'rate',
        value: rate.value,
        valueFormatted: `${rate.value.toFixed(2)}%`,
        change: rate.change,
        changePercent: rate.change !== null ? (rate.change / rate.value) * 100 : null,
        trend: rate.change !== null 
          ? (rate.change > 0 ? 'up' : rate.change < 0 ? 'down' : 'stable')
          : 'stable',
        explanation: rate.explanation,
        source: 'ECB',
        sourceUrl: rate.sourceUrl,
        updatedAt: rate.date,
        unit: '%',
      });
    }

    // 5. Cryptocurrency
    for (const crypto of cryptoPrices) {
      // Normalize sparkline to fit in a small chart
      const sparkline = crypto.sparkline7d.length > 0 
        ? crypto.sparkline7d.filter((_, i) => i % 4 === 0) // Sample every 4th point
        : [];

      markets.push({
        id: crypto.id,
        name: crypto.name,
        symbol: crypto.symbol,
        category: 'crypto',
        value: crypto.priceUSD,
        valueFormatted: formatCryptoPrice(crypto.priceUSD, 'USD'),
        valueCZK: crypto.priceCZK,
        valueCZKFormatted: formatCryptoPrice(crypto.priceCZK, 'CZK'),
        change: crypto.priceUSD * (crypto.change24h / 100),
        changePercent: crypto.change24h,
        trend: crypto.change24h > 0 ? 'up' : crypto.change24h < 0 ? 'down' : 'stable',
        sparkline,
        explanation: crypto.explanation,
        source: 'CoinGecko',
        sourceUrl: crypto.sourceUrl,
        updatedAt: crypto.lastUpdated,
      });
    }

    // Sort by category order: currency, index, crypto, rate, macro
    // Within macro, sort by indicator type then country
    const categoryOrder = ['currency', 'index', 'crypto', 'rate', 'macro'];
    const macroTypeOrder = ['Inflation', 'GDP Growth', 'Unemployment'];
    const countryOrder = ['CZE', 'USA', 'EUU'];
    
    markets.sort((a, b) => {
      const orderA = categoryOrder.indexOf(a.category);
      const orderB = categoryOrder.indexOf(b.category);
      if (orderA !== orderB) return orderA - orderB;
      
      // For macro indicators, sort by type then country
      if (a.category === 'macro' && b.category === 'macro') {
        const typeA = a.name.includes('Inflation') ? 0 : a.name.includes('GDP') ? 1 : 2;
        const typeB = b.name.includes('Inflation') ? 0 : b.name.includes('GDP') ? 1 : 2;
        if (typeA !== typeB) return typeA - typeB;
        
        const countryA = countryOrder.findIndex(c => a.name.includes(c === 'CZE' ? 'Czech' : c === 'EUU' ? 'European' : 'USA'));
        const countryB = countryOrder.findIndex(c => b.name.includes(c === 'CZE' ? 'Czech' : c === 'EUU' ? 'European' : 'USA'));
        return countryA - countryB;
      }
      
      return 0;
    });

    console.log(`Fetched markets: currencies=${exchangeRates.length}, stocks=${stocks.length}, macro=${macroIndicators.length}, ecb=${ecbRates.length}, crypto=${cryptoPrices.length}`);

    return NextResponse.json({
      markets,
      lastUpdated: new Date().toISOString(),
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=1800',
      },
    });
  } catch (error) {
    console.error('Error fetching markets data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch markets data', markets: [] },
      { status: 500 }
    );
  }
}
