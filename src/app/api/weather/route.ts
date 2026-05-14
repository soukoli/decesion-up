import { NextResponse } from 'next/server';

export const revalidate = 300; // Cache 5 minutes

// Prague coordinates
const LAT = 50.0755;
const LON = 14.4378;

// WMO Weather interpretation codes
const WEATHER_CODES: Record<number, { description: string; descriptionCz: string; icon: string }> = {
  0: { description: 'Clear sky', descriptionCz: 'Jasno', icon: '☀️' },
  1: { description: 'Mainly clear', descriptionCz: 'Převážně jasno', icon: '🌤️' },
  2: { description: 'Partly cloudy', descriptionCz: 'Polojasno', icon: '⛅' },
  3: { description: 'Overcast', descriptionCz: 'Oblačno', icon: '☁️' },
  45: { description: 'Fog', descriptionCz: 'Mlha', icon: '🌫️' },
  48: { description: 'Rime fog', descriptionCz: 'Námraza', icon: '🌫️' },
  51: { description: 'Light drizzle', descriptionCz: 'Mrholení', icon: '🌦️' },
  53: { description: 'Drizzle', descriptionCz: 'Mrholení', icon: '🌦️' },
  55: { description: 'Dense drizzle', descriptionCz: 'Husté mrholení', icon: '🌧️' },
  61: { description: 'Light rain', descriptionCz: 'Slabý déšť', icon: '🌦️' },
  63: { description: 'Rain', descriptionCz: 'Déšť', icon: '🌧️' },
  65: { description: 'Heavy rain', descriptionCz: 'Silný déšť', icon: '🌧️' },
  71: { description: 'Light snow', descriptionCz: 'Slabé sněžení', icon: '🌨️' },
  73: { description: 'Snow', descriptionCz: 'Sněžení', icon: '❄️' },
  75: { description: 'Heavy snow', descriptionCz: 'Silné sněžení', icon: '❄️' },
  77: { description: 'Snow grains', descriptionCz: 'Sněhové zrno', icon: '❄️' },
  80: { description: 'Light showers', descriptionCz: 'Slabé přeháňky', icon: '🌦️' },
  81: { description: 'Showers', descriptionCz: 'Přeháňky', icon: '🌧️' },
  82: { description: 'Heavy showers', descriptionCz: 'Silné přeháňky', icon: '⛈️' },
  85: { description: 'Snow showers', descriptionCz: 'Sněhové přeháňky', icon: '🌨️' },
  86: { description: 'Heavy snow showers', descriptionCz: 'Silné sněhové přeháňky', icon: '❄️' },
  95: { description: 'Thunderstorm', descriptionCz: 'Bouřka', icon: '⛈️' },
  96: { description: 'Thunderstorm + hail', descriptionCz: 'Bouřka s kroupami', icon: '⛈️' },
  99: { description: 'Thunderstorm + heavy hail', descriptionCz: 'Silná bouřka', icon: '⛈️' },
};

// Precipitation codes (any rain/snow/thunderstorm)
const PRECIPITATION_CODES = new Set([51, 53, 55, 61, 63, 65, 71, 73, 75, 77, 80, 81, 82, 85, 86, 95, 96, 99]);

function getWeatherInfo(code: number) {
  return WEATHER_CODES[code] || { description: 'Unknown', descriptionCz: 'Neznámo', icon: '🌡️' };
}

export async function GET() {
  try {
    // Fetch hourly data for next 12 hours + daily + current
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current=temperature_2m,weather_code,wind_speed_10m&hourly=temperature_2m,weather_code,precipitation_probability&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=Europe/Prague&forecast_days=2&forecast_hours=12`;

    const response = await fetch(url);

    if (!response.ok) {
      return NextResponse.json({ weather: null, error: 'Open-Meteo unavailable' }, { status: 200 });
    }

    const data = await response.json();

    const currentCode = data.current?.weather_code ?? 0;
    const currentWeather = getWeatherInfo(currentCode);

    const tomorrowCode = data.daily?.weather_code?.[1] ?? 0;
    const tomorrowWeather = getWeatherInfo(tomorrowCode);

    // Process hourly forecast (next 6 hours)
    const hourlyTimes: string[] = data.hourly?.time || [];
    const hourlyTemps: number[] = data.hourly?.temperature_2m || [];
    const hourlyCodes: number[] = data.hourly?.weather_code || [];
    const hourlyPrecipProb: number[] = data.hourly?.precipitation_probability || [];

    const now = new Date();
    const hourly = hourlyTimes
      .map((time: string, i: number) => {
        const hour = new Date(time);
        if (hour <= now) return null; // Skip past hours
        const info = getWeatherInfo(hourlyCodes[i]);
        return {
          time: hour.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Prague' }),
          temperature: Math.round(hourlyTemps[i]),
          weatherCode: hourlyCodes[i],
          icon: info.icon,
          precipProbability: hourlyPrecipProb[i] || 0,
        };
      })
      .filter(Boolean)
      .slice(0, 6);

    // Determine if precipitation is expected in next hours
    const hasPrecipitation = hourly.some((h: any) => 
      PRECIPITATION_CODES.has(h.weatherCode) || h.precipProbability > 50
    );

    // Radar URL for Prague area (RainViewer free animated radar)
    // Only provide when precipitation is expected
    const radarUrl = hasPrecipitation 
      ? `https://www.rainviewer.com/map.html?loc=${LAT},${LON},8&oFa=1&oC=1&oU=1&oCS=1&oF=1&oAP=1&c=1&o=83&lm=1&layer=radar&sm=1&sn=1`
      : null;

    const weather = {
      current: {
        temperature: Math.round(data.current?.temperature_2m ?? 0),
        weatherCode: currentCode,
        description: currentWeather.description,
        descriptionCz: currentWeather.descriptionCz,
        icon: currentWeather.icon,
        windSpeed: Math.round(data.current?.wind_speed_10m ?? 0),
      },
      today: {
        max: Math.round(data.daily?.temperature_2m_max?.[0] ?? 0),
        min: Math.round(data.daily?.temperature_2m_min?.[0] ?? 0),
      },
      tomorrow: {
        max: Math.round(data.daily?.temperature_2m_max?.[1] ?? 0),
        min: Math.round(data.daily?.temperature_2m_min?.[1] ?? 0),
        weatherCode: tomorrowCode,
        description: tomorrowWeather.description,
        descriptionCz: tomorrowWeather.descriptionCz,
        icon: tomorrowWeather.icon,
      },
      hourly,
      hasPrecipitation,
      radarUrl,
      lastUpdated: new Date().toISOString(),
    };

    return NextResponse.json({ weather });
  } catch (error) {
    console.error('Error fetching weather:', error);
    return NextResponse.json({ weather: null, error: 'Failed to fetch weather' }, { status: 200 });
  }
}
