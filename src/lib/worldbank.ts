// World Bank API for macroeconomic indicators
// Documentation: https://datahelpdesk.worldbank.org/knowledgebase/topics/125589-developer-information

interface WorldBankDataPoint {
  indicator: { id: string; value: string };
  country: { id: string; value: string };
  countryiso3code: string;
  date: string;
  value: number | null;
  unit: string;
  obs_status: string;
  decimal: number;
}

interface WorldBankResponse {
  page: number;
  pages: number;
  per_page: number;
  total: number;
  sourceid: string;
  lastupdated: string;
}

export interface MacroIndicator {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  value: number;
  previousValue: number | null;
  change: number | null;
  changePercent: number | null;
  year: string;
  previousYear: string | null;
  unit: string;
  indicator: string;
  sourceUrl: string;
}

// Country codes for World Bank API
const COUNTRIES = {
  CZE: { code: 'CZE', name: 'Czech Republic', nameCs: 'Česko' },
  USA: { code: 'USA', name: 'USA', nameCs: 'USA' },
  EUU: { code: 'EUU', name: 'European Union', nameCs: 'Evropská unie' },
};

// World Bank indicator codes
const INDICATORS = {
  INFLATION: 'FP.CPI.TOTL.ZG',      // Inflation, consumer prices (annual %)
  GDP_GROWTH: 'NY.GDP.MKTP.KD.ZG',  // GDP growth (annual %)
  UNEMPLOYMENT: 'SL.UEM.TOTL.ZS',   // Unemployment, total (% of labor force)
};

async function fetchWorldBankData(
  countryCode: string,
  indicatorCode: string,
  perPage: number = 5
): Promise<WorldBankDataPoint[]> {
  try {
    const url = `https://api.worldbank.org/v2/country/${countryCode}/indicator/${indicatorCode}?format=json&per_page=${perPage}`;
    
    const response = await fetch(url, {
      signal: AbortSignal.timeout(10000),
      next: { revalidate: 86400 }, // Cache for 24 hours (data updates infrequently)
    });

    if (!response.ok) {
      console.error(`World Bank API error for ${countryCode}/${indicatorCode}:`, response.status);
      return [];
    }

    const data = await response.json();
    
    // World Bank returns [metadata, data] array
    if (!Array.isArray(data) || data.length < 2 || !Array.isArray(data[1])) {
      return [];
    }

    return data[1] as WorldBankDataPoint[];
  } catch (error) {
    console.error(`Error fetching World Bank data for ${countryCode}/${indicatorCode}:`, error);
    return [];
  }
}

function processIndicatorData(
  data: WorldBankDataPoint[],
  indicatorName: string,
  unit: string
): MacroIndicator | null {
  // Filter out null values and sort by date descending
  const validData = data
    .filter(d => d.value !== null)
    .sort((a, b) => parseInt(b.date) - parseInt(a.date));

  if (validData.length === 0) return null;

  const latest = validData[0];
  const previous = validData.length > 1 ? validData[1] : null;

  const change = previous ? latest.value! - previous.value! : null;
  const changePercent = previous && previous.value !== 0
    ? ((latest.value! - previous.value!) / Math.abs(previous.value!)) * 100
    : null;

  const country = COUNTRIES[latest.countryiso3code as keyof typeof COUNTRIES] || {
    code: latest.countryiso3code,
    name: latest.country.value,
    nameCs: latest.country.value,
  };

  return {
    id: `wb-${latest.countryiso3code.toLowerCase()}-${indicatorName.toLowerCase().replace(/\s+/g, '-')}`,
    name: indicatorName,
    country: country.name,
    countryCode: latest.countryiso3code,
    value: latest.value!,
    previousValue: previous?.value ?? null,
    change,
    changePercent,
    year: latest.date,
    previousYear: previous?.date ?? null,
    unit,
    indicator: latest.indicator.id,
    sourceUrl: `https://data.worldbank.org/indicator/${latest.indicator.id}?locations=${latest.countryiso3code}`,
  };
}

export async function fetchInflationRates(): Promise<MacroIndicator[]> {
  const results: MacroIndicator[] = [];

  const countries = Object.values(COUNTRIES);
  
  for (const country of countries) {
    const data = await fetchWorldBankData(country.code, INDICATORS.INFLATION);
    const indicator = processIndicatorData(data, 'Inflation', '%');
    if (indicator) {
      results.push(indicator);
    }
  }

  return results;
}

export async function fetchGDPGrowth(): Promise<MacroIndicator[]> {
  const results: MacroIndicator[] = [];

  const countries = Object.values(COUNTRIES);
  
  for (const country of countries) {
    const data = await fetchWorldBankData(country.code, INDICATORS.GDP_GROWTH);
    const indicator = processIndicatorData(data, 'GDP Growth', '%');
    if (indicator) {
      results.push(indicator);
    }
  }

  return results;
}

export async function fetchUnemploymentRates(): Promise<MacroIndicator[]> {
  const results: MacroIndicator[] = [];

  const countries = Object.values(COUNTRIES);
  
  for (const country of countries) {
    const data = await fetchWorldBankData(country.code, INDICATORS.UNEMPLOYMENT);
    const indicator = processIndicatorData(data, 'Unemployment', '%');
    if (indicator) {
      results.push(indicator);
    }
  }

  return results;
}

export async function fetchAllMacroIndicators(): Promise<MacroIndicator[]> {
  const [inflation, gdp, unemployment] = await Promise.all([
    fetchInflationRates(),
    fetchGDPGrowth(),
    fetchUnemploymentRates(),
  ]);

  return [...inflation, ...gdp, ...unemployment];
}
