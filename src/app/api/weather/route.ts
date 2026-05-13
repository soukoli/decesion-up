import { NextResponse } from 'next/server';

export const revalidate = 900; // Cache 15 minutes

// Prague coordinates
const LAT = 50.0755;
const LON = 14.4378;

// WMO Weather interpretation codes to simple descriptions
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

function getWeatherInfo(code: number) {
  return WEATHER_CODES[code] || { description: 'Unknown', descriptionCz: 'Neznámo', icon: '🌡️' };
}

export async function GET() {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current=temperature_2m,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=Europe/Prague&forecast_days=2`;

    const response = await fetch(url);

    if (!response.ok) {
      return NextResponse.json({ weather: null, error: 'Open-Meteo unavailable' }, { status: 200 });
    }

    const data = await response.json();

    const currentCode = data.current?.weather_code ?? 0;
    const currentWeather = getWeatherInfo(currentCode);

    const tomorrowCode = data.daily?.weather_code?.[1] ?? 0;
    const tomorrowWeather = getWeatherInfo(tomorrowCode);

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
      lastUpdated: new Date().toISOString(),
    };

    return NextResponse.json({ weather });
  } catch (error) {
    console.error('Error fetching weather:', error);
    return NextResponse.json({ weather: null, error: 'Failed to fetch weather' }, { status: 200 });
  }
}
