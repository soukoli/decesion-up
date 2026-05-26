'use client';

import { useState, useRef, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';
import { PodcastEpisode, TechTrend, WorldNews, AIResearch, SchoolArticle } from '@/types';
import { useFontSize } from '@/lib/font-size';
import { PageHeader } from '@/components/ui/PageHeader';
import { formatRelativeTime, isFresh, isFreshFromTimeAgo } from '@/lib/utils';
import { useSnackbar } from '@/components/ui/Snackbar';

const FEED_TABS = [
  { id: 'podcasts', label: 'Podcasty' },
  { id: 'aitech', label: 'AI & Tech' },
  { id: 'news', label: 'Zprávy' },
  { id: 'school', label: 'Škola' },
];

export function FeedScreen() {
  const [activeTab, setActiveTab] = useState(0);
  const nestedSwiperRef = useRef<SwiperType | null>(null);
  const [podcasts, setPodcasts] = useState<PodcastEpisode[]>([]);
  const [trends, setTrends] = useState<TechTrend[]>([]);
  const [research, setResearch] = useState<AIResearch[]>([]);
  const [news, setNews] = useState<WorldNews[]>([]);
  const [school, setSchool] = useState<SchoolArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { fontConfig } = useFontSize();
  const { showSnackbar } = useSnackbar();
  const [ideaForPodcast, setIdeaForPodcast] = useState<string | null>(null);
  const [ideaText, setIdeaText] = useState('');

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    // Only show full loading spinner on initial load (no data yet)
    const isInitial = podcasts.length === 0 && trends.length === 0 && news.length === 0;
    if (isInitial) setLoading(true);
    else setRefreshing(true);

    try {
      const [pRes, tRes, rRes, nRes, sRes] = await Promise.all([
        fetch('/api/podcasts'),
        fetch('/api/trends'),
        fetch('/api/research'),
        fetch('/api/news'),
        fetch('/api/school'),
      ]);
      if (pRes.ok) { const d = await pRes.json(); setPodcasts(d.podcasts || []); }
      if (tRes.ok) { const d = await tRes.json(); setTrends(d.trends || []); }
      if (rRes.ok) { const d = await rRes.json(); setResearch(d.research || []); }
      if (nRes.ok) { const d = await nRes.json(); setNews(d.news || []); }
      if (sRes.ok) { const d = await sRes.json(); setSchool(d.articles || []); }
    } catch (err) {
      console.error('Feed fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleTabClick = (index: number) => {
    setActiveTab(index);
    nestedSwiperRef.current?.slideTo(index);
  };

  const handlePodcastIdea = async (ep: PodcastEpisode) => {
    const content = ideaText.trim()
      ? `${ideaText.trim()} (z: ${ep.podcastName})`
      : `Insight z: ${ep.podcastName} - ${ep.title}`;

    try {
      const res = await fetch('/api/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          source: 'podcast',
          podcast_id: ep.id,
          podcast_name: ep.podcastName,
        }),
      });
      if (res.ok) {
        const { idea } = await res.json();
        // Notify other components
        window.dispatchEvent(new Event('idea-created'));
        // AI analyze in background
        fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ raw_id: idea.id, content }),
        })
          .then(() => window.dispatchEvent(new Event('idea-updated')))
          .catch(() => {});
        setIdeaForPodcast(null);
        setIdeaText('');
        showSnackbar('Nápad uložen');
      }
    } catch { /* silent */ }
  };

  const categoryColors: Record<string, string> = {
    Tech: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
    Science: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    Learning: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    Business: 'bg-green-500/20 text-green-400 border-green-500/30',
    Czech: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  };

  const aiTechChipColors: Record<string, string> = {
    HN: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    AI: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
    ML: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    NLP: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    Research: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  };

  const newsSourceColors: Record<string, string> = {
    'BBC World': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'BBC Europe': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'BBC Business': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'The Guardian': 'bg-green-500/20 text-green-400 border-green-500/30',
    'NPR': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    'ČT24': 'bg-red-500/20 text-red-400 border-red-500/30',
    'iROZHLAS': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    'Seznam Zprávy': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    'Respekt': 'bg-pink-500/20 text-pink-400 border-pink-500/30',
    'Aktuálně.cz': 'bg-teal-500/20 text-teal-400 border-teal-500/30',
  };

  const schoolCategoryColors: Record<string, string> = {
    'Novinky': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    'Družina': 'bg-lime-500/20 text-lime-400 border-lime-500/30',
  };

  const getResearchChip = (category: string) => {
    if (category.includes('AI') || category.includes('cs.AI')) return { label: 'AI', color: aiTechChipColors.AI };
    if (category.includes('LG') || category.includes('cs.LG')) return { label: 'ML', color: aiTechChipColors.ML };
    if (category.includes('CL') || category.includes('cs.CL')) return { label: 'NLP', color: aiTechChipColors.NLP };
    return { label: 'Research', color: aiTechChipColors.Research };
  };

  return (
    <div className="h-full flex flex-col bg-slate-950">
      {/* Header + tabs */}
      <div className="flex-shrink-0">
        <PageHeader
          title="Feed"
          rightContent={
            <button
              onClick={fetchAll}
              disabled={loading || refreshing}
              className="p-2 rounded-lg bg-slate-800/50 text-slate-400 hover:text-white transition-colors disabled:opacity-50"
            >
              <svg className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
            </button>
          }
        />
        <div className="px-4 pb-2">
          <div className="flex gap-1 bg-slate-800/50 p-1 rounded-lg">
          {FEED_TABS.map((tab, index) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(index)}
              className={`flex-1 py-2 px-2 rounded-md text-xs font-medium transition-all ${
                activeTab === index
                  ? 'bg-slate-700 text-white shadow-lg'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <Swiper
            onSwiper={(swiper) => (nestedSwiperRef.current = swiper)}
            onSlideChange={(swiper) => setActiveTab(swiper.activeIndex)}
            nested={true}
            className="h-full"
            speed={250}
            resistance={true}
            resistanceRatio={0.65}
            touchStartPreventDefault={false}
            touchMoveStopPropagation={false}
          >
            {/* Podcasts */}
            <SwiperSlide>
              <div className="h-full overflow-y-auto overscroll-contain px-4 py-3 pb-6 space-y-2">
                {podcasts.map(ep => {
                  const fresh = isFresh(ep.pubDate);
                  const showIdeaInput = ideaForPodcast === ep.id;
                  const hasRealTitle = ep.title && ep.title !== 'Latest Episode';

                  return (
                    <div key={ep.id} className={`rounded-xl overflow-hidden transition-colors ${fresh ? 'border border-green-500/30 bg-slate-800/40' : 'border border-slate-700/50 bg-slate-800/30'}`}>
                      {/* Clickable card → opens podcast */}
                      <a href={ep.spotifyUrl} target="_blank" rel="noopener noreferrer" className="block p-3">
                        <div className="flex items-start gap-3">
                          {ep.imageUrl && !ep.imageUrl.startsWith('/') ? (
                            <img src={ep.imageUrl} alt="" className="w-11 h-11 rounded-lg object-cover flex-shrink-0" />
                          ) : (
                            <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center flex-shrink-0">
                              <span className="text-base">🎧</span>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className={`${fontConfig.title} text-white font-semibold`}>{ep.podcastName}</p>
                            {hasRealTitle && (
                              <p className="text-xs text-slate-300 mt-0.5 line-clamp-2">{ep.title}</p>
                            )}
                          </div>
                          {/* + idea button */}
                          <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIdeaForPodcast(showIdeaInput ? null : ep.id); setIdeaText(''); }}
                            className={`p-1.5 rounded-lg flex-shrink-0 transition-all ${showIdeaInput ? 'bg-amber-500/20 text-amber-400' : 'text-slate-600 hover:text-slate-300 hover:bg-slate-700/50'}`}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                          </button>
                        </div>

                        {/* Bottom meta row */}
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-700/30">
                          <div className="flex items-center gap-2">
                            <span className={`text-[11px] px-1.5 py-0.5 rounded-full border font-medium ${categoryColors[ep.category] || 'bg-slate-700/50 text-slate-400 border-slate-600'}`}>
                              {ep.category}
                            </span>
                            <span className="text-[11px] text-slate-500">{ep.duration}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {fresh && <span className="w-2 h-2 rounded-full bg-green-500" />}
                            <span className="text-[11px] text-slate-600 font-mono">{formatRelativeTime(ep.pubDate)}</span>
                          </div>
                        </div>
                      </a>

                      {/* Inline idea input */}
                      {showIdeaInput && (
                        <div className="px-3 pb-3 border-t border-slate-700/30">
                          <div className="flex items-center gap-2 mt-2">
                            <input
                              type="text"
                              value={ideaText}
                              onChange={(e) => setIdeaText(e.target.value)}
                              onKeyDown={(e) => { if (e.key === 'Enter') handlePodcastIdea(ep); }}
                              placeholder="Jaký nápad tě napadl..."
                              autoFocus
                              className="flex-1 px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50"
                            />
                            <button
                              onClick={() => handlePodcastIdea(ep)}
                              className="p-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/50 hover:bg-amber-500/30 active:scale-95 transition-all"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                              </svg>
                            </button>
                          </div>
                          <p className="text-[11px] text-slate-600 mt-1 px-1">Z: {ep.podcastName}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </SwiperSlide>

            {/* AI & Tech */}
            <SwiperSlide>
              <div className="h-full overflow-y-auto overscroll-contain px-4 py-3 pb-6 space-y-2">
                {trends.slice(0, 10).map(t => {
                  const fresh = isFreshFromTimeAgo(t.timeAgo);
                  return (
                    <a key={t.id} href={t.url} target="_blank" rel="noopener noreferrer" className={`block p-3 rounded-xl transition-colors group ${fresh ? 'border border-green-500/30 bg-slate-800/40' : 'border border-slate-700/50 bg-slate-800/30'}`}>
                      <p className={`${fontConfig.title} text-white group-hover:text-amber-400 transition-colors line-clamp-2`}>{t.title}</p>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-700/30">
                        <div className="flex items-center gap-2">
                          <span className={`text-[11px] px-1.5 py-0.5 rounded-full border font-medium ${aiTechChipColors.HN}`}>HN</span>
                          <span className="text-[11px] text-slate-500">{t.score} pts · {t.comments} comments</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {fresh && <span className="w-2 h-2 rounded-full bg-green-500" />}
                          <span className="text-[11px] text-slate-600 font-mono">{t.timeAgo}</span>
                        </div>
                      </div>
                    </a>
                  );
                })}
                {research.slice(0, 5).map(r => {
                  const fresh = isFresh(r.publishedAt);
                  const chip = getResearchChip(r.category);
                  return (
                    <a key={r.id} href={r.url} target="_blank" rel="noopener noreferrer" className={`block p-3 rounded-xl transition-colors group ${fresh ? 'border border-green-500/30 bg-slate-800/40' : 'border border-slate-700/50 bg-slate-800/30'}`}>
                      <p className={`${fontConfig.title} text-white group-hover:text-blue-400 transition-colors line-clamp-2`}>{r.title}</p>
                      {r.summary && (
                        <p className={`${fontConfig.body} text-slate-400 mt-1 line-clamp-1`}>{r.summary}</p>
                      )}
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-700/30">
                        <div className="flex items-center gap-2">
                          <span className={`text-[11px] px-1.5 py-0.5 rounded-full border font-medium ${chip.color}`}>{chip.label}</span>
                          <span className="text-[11px] text-slate-500">{r.authors.slice(0, 2).join(', ')}{r.authors.length > 2 ? ' +' : ''}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {fresh && <span className="w-2 h-2 rounded-full bg-green-500" />}
                          <span className="text-[11px] text-slate-600 font-mono">{formatRelativeTime(r.publishedAt)}</span>
                        </div>
                      </div>
                    </a>
                  );
                })}
              </div>
            </SwiperSlide>

            {/* News */}
            <SwiperSlide>
              <div className="h-full overflow-y-auto overscroll-contain px-4 py-3 pb-6 space-y-2">
                {news.map(item => {
                  const fresh = isFresh(item.publishedAt);
                  const chipColor = newsSourceColors[item.source] || 'bg-slate-700/50 text-slate-400 border-slate-600';
                  return (
                    <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer" className={`block p-3 rounded-xl transition-colors group ${fresh ? 'border border-green-500/30 bg-slate-800/40' : 'border border-slate-700/50 bg-slate-800/30'}`}>
                      <p className={`${fontConfig.title} text-white font-medium group-hover:text-amber-400 transition-colors line-clamp-2`}>{item.title}</p>
                      {item.description && (
                        <p className={`${fontConfig.body} text-slate-400 mt-1 line-clamp-2`}>{item.description}</p>
                      )}
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-700/30">
                        <span className={`text-[11px] px-1.5 py-0.5 rounded-full border font-medium ${chipColor}`}>{item.source}</span>
                        <div className="flex items-center gap-1.5">
                          {fresh && <span className="w-2 h-2 rounded-full bg-green-500" />}
                          <span className="text-[11px] text-slate-600 font-mono">{formatRelativeTime(item.publishedAt)}</span>
                        </div>
                      </div>
                    </a>
                  );
                })}
              </div>
            </SwiperSlide>

            {/* Škola */}
            <SwiperSlide>
              <div className="h-full overflow-y-auto overscroll-contain px-4 py-3 pb-6 space-y-2">
                {school.length === 0 && !loading && (
                  <div className="text-center py-12">
                    <span className="text-3xl block mb-2">🏫</span>
                    <p className="text-slate-400 text-sm">Žádné novinky ze školy</p>
                  </div>
                )}
                {school.map(item => {
                  const fresh = isFresh(item.pubDate);
                  const chipColor = schoolCategoryColors[item.category] || 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
                  return (
                    <a key={item.id} href={item.articleUrl} target="_blank" rel="noopener noreferrer" className={`block p-3 rounded-xl transition-colors group ${fresh ? 'border border-green-500/30 bg-slate-800/40' : 'border border-slate-700/50 bg-slate-800/30'}`}>
                      <p className={`${fontConfig.title} text-white font-medium group-hover:text-amber-400 transition-colors line-clamp-2`}>{item.title}</p>
                      {item.description && (
                        <p className={`${fontConfig.body} text-slate-400 mt-1 line-clamp-2`}>{item.description}</p>
                      )}
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-700/30">
                        <div className="flex items-center gap-2">
                          <span className={`text-[11px] px-1.5 py-0.5 rounded-full border font-medium ${chipColor}`}>{item.category}</span>
                          <span className="text-[11px] text-slate-500">Horáčkova</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {fresh && <span className="w-2 h-2 rounded-full bg-green-500" />}
                          <span className="text-[11px] text-slate-600 font-mono">{formatRelativeTime(item.pubDate)}</span>
                        </div>
                      </div>
                    </a>
                  );
                })}
              </div>
            </SwiperSlide>
          </Swiper>
        )}
      </div>
    </div>
  );
}
