'use client';

import { TransportAlert, WeatherData, PodcastEpisode, WorldNews, SchoolArticle, GlobalHotspot } from '@/types';
import { useTranslation } from '@/lib/translation';
import { useSettings } from '@/lib/settings';
import { useState, useEffect, useCallback } from 'react';
import { GlobeModal } from '../GlobeModal';

interface MobileBriefingPageProps {
  transport: TransportAlert[];
  weather: WeatherData | null;
  podcasts: PodcastEpisode[];
  news: WorldNews[];
  czechNews: WorldNews[];
  school: SchoolArticle[];
  hotspots: GlobalHotspot[];
}

function useRelativeTime(date: Date, lang: 'en' | 'cs'): string {
  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 30000); // update every 30s
    return () => clearInterval(interval);
  }, []);

  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  if (diffMins < 1) return lang === 'cs' ? 'právě teď' : 'just now';
  if (diffMins < 60) return lang === 'cs' ? `před ${diffMins} min` : `${diffMins} min ago`;
  const diffHours = Math.floor(diffMins / 60);
  return lang === 'cs' ? `před ${diffHours}h` : `${diffHours}h ago`;
}

function formatTimeAgo(dateStr: string, lang: 'en' | 'cs'): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  if (diffMins < 1) return lang === 'cs' ? 'teď' : 'now';
  if (diffMins < 60) return `${diffMins}m`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h`;
  return `${Math.floor(diffHours / 24)}d`;
}

export function MobileBriefingPage({ transport, weather, podcasts, news, czechNews, school, hotspots }: MobileBriefingPageProps) {
  const { language } = useTranslation();
  const { openSettings } = useSettings();
  const [showGlobe, setShowGlobe] = useState(false);
  const [transportLastUpdate, setTransportLastUpdate] = useState<Date>(new Date());
  const [weatherLastUpdate, setWeatherLastUpdate] = useState<Date>(new Date());
  const [liveTransport, setLiveTransport] = useState<TransportAlert[]>(transport);
  const [liveWeather, setLiveWeather] = useState<WeatherData | null>(weather);

  const conflictCount = hotspots.filter(h => h.intensity >= 7).length;

  const transportAgo = useRelativeTime(transportLastUpdate, language);
  const weatherAgo = useRelativeTime(weatherLastUpdate, language);

  // Auto-refresh transport every 1 minute
  const refreshTransport = useCallback(async () => {
    try {
      const res = await fetch('/api/transport');
      if (res.ok) {
        const data = await res.json();
        setLiveTransport(data.alerts || []);
        setTransportLastUpdate(new Date());
      }
    } catch { /* silent */ }
  }, []);

  // Auto-refresh weather every 5 minutes
  const refreshWeather = useCallback(async () => {
    try {
      const res = await fetch('/api/weather');
      if (res.ok) {
        const data = await res.json();
        setLiveWeather(data.weather || null);
        setWeatherLastUpdate(new Date());
      }
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    const transportInterval = setInterval(refreshTransport, 60 * 1000);
    const weatherInterval = setInterval(refreshWeather, 5 * 60 * 1000);
    return () => { clearInterval(transportInterval); clearInterval(weatherInterval); };
  }, [refreshTransport, refreshWeather]);

  useEffect(() => { setLiveTransport(transport); setTransportLastUpdate(new Date()); }, [transport]);
  useEffect(() => { setLiveWeather(weather); setWeatherLastUpdate(new Date()); }, [weather]);

  // Fresh news (< 6h)
  const freshNews = [...news, ...czechNews]
    .filter(n => (Date.now() - new Date(n.publishedAt).getTime()) < 6 * 60 * 60 * 1000)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, 4);

  // Fresh podcasts (< 24h)
  const freshPodcasts = podcasts
    .filter(p => (Date.now() - new Date(p.pubDate).getTime()) < 24 * 60 * 60 * 1000)
    .slice(0, 3);

  // Today's date
  const dateStr = new Date().toLocaleDateString(language === 'cs' ? 'cs-CZ' : 'en-US', {
    weekday: 'short', day: 'numeric', month: 'short',
  });

  return (
    <div className="h-full bg-slate-950 px-4 py-4 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between mb-3 flex-shrink-0">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight uppercase">DecisionUp</h1>
          <p className="text-xs text-slate-500">{dateStr}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowGlobe(true)} className="relative p-2 rounded-lg bg-slate-800/50 text-slate-400 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5a17.92 17.92 0 01-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
            </svg>
            {conflictCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center text-[9px] font-bold bg-red-500 text-white rounded-full">{conflictCount}</span>
            )}
          </button>
          <button onClick={openSettings} className="p-2 rounded-lg bg-slate-800/50 text-slate-400 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 flex flex-col gap-3 min-h-0 overflow-y-auto overscroll-contain pb-6">
        {/* Transport Alerts */}
        {liveTransport.length > 0 && (
          <div className="rounded-xl bg-red-950/30 border border-red-500/30 p-3 flex-shrink-0">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                <span className="text-xs font-semibold text-red-400 uppercase">
                  {language === 'cs' ? 'Doprava' : 'Transport'}
                </span>
              </div>
              <span className="text-[10px] text-red-400/60">{transportAgo}</span>
            </div>
            <div className="space-y-1.5">
              {liveTransport.slice(0, 3).map((alert) => (
                <a key={alert.id} href={alert.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors">
                  <span className="text-xs font-mono font-bold text-red-300 bg-red-500/20 px-1.5 py-0.5 rounded">
                    {alert.type === 'metro' ? `M${alert.lines[0]}` : alert.lines.slice(0, 3).join(',')}
                  </span>
                  <span className="truncate text-xs">{alert.title}</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Weather with hourly forecast */}
        {liveWeather && (
          <div className="rounded-xl bg-slate-800/30 border border-slate-700/50 p-3 flex-shrink-0">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{liveWeather.current.icon}</span>
                <div>
                  <span className="text-xl font-bold text-white">{liveWeather.current.temperature}°C</span>
                  <p className="text-xs text-slate-400">
                    {language === 'cs' ? liveWeather.current.descriptionCz : liveWeather.current.description}
                  </p>
                </div>
              </div>
              <span className="text-[10px] text-slate-600">{weatherAgo}</span>
            </div>

            {/* Hourly forecast strip */}
            {liveWeather.hourly && liveWeather.hourly.length > 0 && (
              <div className="flex gap-3 mt-2 pt-2 border-t border-slate-700/30 overflow-x-auto no-scrollbar">
                {liveWeather.hourly.map((h, i) => (
                  <div key={i} className="flex flex-col items-center gap-0.5 flex-shrink-0">
                    <span className="text-[10px] text-slate-500">{h.time}</span>
                    <span className="text-sm">{h.icon}</span>
                    <span className="text-xs text-slate-300">{h.temperature}°</span>
                    {h.precipProbability > 30 && (
                      <span className="text-[9px] text-blue-400">{h.precipProbability}%</span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Radar link when precipitation */}
            {liveWeather.hasPrecipitation && liveWeather.radarUrl && (
              <a
                href={liveWeather.radarUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-700/30 text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
                </svg>
                {language === 'cs' ? 'Zobrazit radar srážek' : 'View precipitation radar'}
              </a>
            )}
          </div>
        )}

        {/* Fresh News */}
        {freshNews.length > 0 && (
          <div className="rounded-xl bg-slate-800/30 border border-slate-700/50 p-3 flex-shrink-0">
            <div className="flex items-center gap-2 mb-2.5">
              <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
              <span className="text-xs font-semibold text-amber-400 uppercase">
                {language === 'cs' ? 'Nové zprávy' : 'Latest News'}
              </span>
            </div>
            <div className="space-y-2">
              {freshNews.map((item) => (
                <div key={item.id} className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-900/50">
                  <span className="text-[10px] text-slate-600 mt-0.5 w-6 flex-shrink-0 text-right font-mono">
                    {formatTimeAgo(item.publishedAt, language)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium leading-snug line-clamp-2">{item.title}</p>
                    <span className="text-[10px] text-slate-500 mt-0.5">{item.source}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Fresh Podcasts */}
        {freshPodcasts.length > 0 && (
          <div className="rounded-xl bg-slate-800/30 border border-slate-700/50 p-3 flex-shrink-0">
            <div className="flex items-center gap-2 mb-2.5">
              <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
              <span className="text-xs font-semibold text-amber-400 uppercase">
                {language === 'cs' ? 'Nové epizody' : 'New Episodes'}
              </span>
            </div>
            <div className="space-y-2">
              {freshPodcasts.map((item) => (
                <a key={item.id} href={item.spotifyUrl} target="_blank" rel="noopener noreferrer" className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-900/50 group">
                  <span className="text-[10px] text-slate-600 mt-0.5 w-6 flex-shrink-0 text-right font-mono">
                    {formatTimeAgo(item.pubDate, language)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium leading-snug line-clamp-1 group-hover:text-amber-400 transition-colors">{item.title}</p>
                    <span className="text-[10px] text-slate-500">{item.podcastName}</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {freshNews.length === 0 && freshPodcasts.length === 0 && liveTransport.length === 0 && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <span className="text-3xl mb-2 block">✓</span>
              <p className="text-sm text-slate-400">{language === 'cs' ? 'Vše v pořádku.' : 'All clear.'}</p>
            </div>
          </div>
        )}
      </div>

      {/* Globe Modal */}
      <GlobeModal isOpen={showGlobe} onClose={() => setShowGlobe(false)} hotspots={hotspots} />
    </div>
  );
}
