// ECB Statistical Data Warehouse API for interest rates
// Documentation: https://data.ecb.europa.eu/help/api/overview

export interface ECBRate {
  id: string;
  name: string;
  value: number;
  previousValue: number | null;
  change: number | null;
  date: string;
  previousDate: string | null;
  unit: string;
  explanation: string;
  sourceUrl: string;
}

interface ECBObservation {
  [key: string]: [number]; // period index -> [value]
}

interface ECBDimension {
  observation: Array<{
    id: string;
    name: string;
    values: Array<{ id: string; name: string }>;
  }>;
}

interface ECBDataSet {
  series: {
    [key: string]: {
      observations: ECBObservation;
    };
  };
}

interface ECBResponse {
  dataSets: ECBDataSet[];
  structure: {
    dimensions: ECBDimension;
  };
}

// ECB rate series keys
const ECB_RATES = {
  MRO: {
    key: 'FM.D.U2.EUR.4F.KR.MRR_FR.LEV',
    name: 'ECB Main Rate',
    explanation: 'Main refinancing operations rate - the key ECB interest rate',
  },
  DFR: {
    key: 'FM.D.U2.EUR.4F.KR.DFR.LEV',
    name: 'ECB Deposit Rate',
    explanation: 'Deposit facility rate - rate banks earn on overnight deposits',
  },
};

async function fetchECBRate(
  seriesKey: string,
  rateName: string,
  explanation: string
): Promise<ECBRate | null> {
  try {
    // Get last 30 observations to find the latest non-null values
    const url = `https://data-api.ecb.europa.eu/service/data/${seriesKey}?format=jsondata&lastNObservations=30`;
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(10000),
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      console.error(`ECB API error for ${seriesKey}:`, response.status);
      return null;
    }

    const data: ECBResponse = await response.json();

    if (!data.dataSets?.[0]?.series) {
      console.error(`No data in ECB response for ${seriesKey}`);
      return null;
    }

    // Get the time periods
    const timeDimension = data.structure.dimensions.observation.find(d => d.id === 'TIME_PERIOD');
    const timePeriods = timeDimension?.values || [];

    // Get the series data (there should be only one series)
    const seriesData = Object.values(data.dataSets[0].series)[0];
    if (!seriesData?.observations) {
      return null;
    }

    // Find the latest and previous non-null values
    const observations = Object.entries(seriesData.observations)
      .map(([index, [value]]) => ({
        index: parseInt(index),
        value,
        date: timePeriods[parseInt(index)]?.id || '',
      }))
      .filter(obs => obs.value !== null && !isNaN(obs.value))
      .sort((a, b) => b.index - a.index);

    if (observations.length === 0) {
      return null;
    }

    const latest = observations[0];
    const previous = observations.length > 1 ? observations[1] : null;

    return {
      id: `ecb-${seriesKey.split('.').slice(-2).join('-').toLowerCase()}`,
      name: rateName,
      value: latest.value,
      previousValue: previous?.value ?? null,
      change: previous ? latest.value - previous.value : null,
      date: latest.date,
      previousDate: previous?.date ?? null,
      unit: '%',
      explanation,
      sourceUrl: `https://data.ecb.europa.eu/data/datasets/${seriesKey.split('.')[0]}`,
    };
  } catch (error) {
    console.error(`Error fetching ECB rate ${seriesKey}:`, error);
    return null;
  }
}

export async function fetchECBRates(): Promise<ECBRate[]> {
  const results: ECBRate[] = [];

  for (const [, rateConfig] of Object.entries(ECB_RATES)) {
    const rate = await fetchECBRate(rateConfig.key, rateConfig.name, rateConfig.explanation);
    if (rate) {
      results.push(rate);
    }
  }

  return results;
}

// Fallback with hardcoded current rates if API fails
export function getFallbackECBRates(): ECBRate[] {
  return [
    {
      id: 'ecb-mro',
      name: 'ECB Main Rate',
      value: 4.5,
      previousValue: 4.5,
      change: 0,
      date: new Date().toISOString().split('T')[0],
      previousDate: null,
      unit: '%',
      explanation: 'Main refinancing operations rate - the key ECB interest rate',
      sourceUrl: 'https://www.ecb.europa.eu/stats/policy_and_exchange_rates/key_ecb_interest_rates/html/index.en.html',
    },
    {
      id: 'ecb-dfr',
      name: 'ECB Deposit Rate',
      value: 4.0,
      previousValue: 4.0,
      change: 0,
      date: new Date().toISOString().split('T')[0],
      previousDate: null,
      unit: '%',
      explanation: 'Deposit facility rate - rate banks earn on overnight deposits',
      sourceUrl: 'https://www.ecb.europa.eu/stats/policy_and_exchange_rates/key_ecb_interest_rates/html/index.en.html',
    },
  ];
}
