'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { PodcastSection } from '@/components/podcasts/PodcastSection';
import { EconomicSection } from '@/components/economic/EconomicSection';
import { TrendsSection } from '@/components/trends/TrendsSection';
import { PodcastEpisode, EconomicSignal, TechTrend } from '@/types';

export default function Home() {
  const [podcasts, setPodcasts] = useState<PodcastEpisode[]>([]);
  const [economic, setEconomic] = useState<EconomicSignal[]>([]);
  const [trends, setTrends] = useState<TechTrend[]>([]);
  const [loading, setLoading] = useState(true);
  
  const now = new Date();
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 18 ? 'Good afternoon' : 'Good evening';
  const dateStr = now.toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const [podcastsRes, economicRes, trendsRes] = await Promise.all([
          fetch('/api/podcasts'),
          fetch('/api/economic'),
          fetch('/api/trends'),
        ]);

        if (podcastsRes.ok) {
          const data = await podcastsRes.json();
          setPodcasts(data.podcasts || []);
        }

        if (economicRes.ok) {
          const data = await economicRes.json();
          setEconomic(data.economic || []);
        }

        if (trendsRes.ok) {
          const data = await trendsRes.json();
          setTrends(data.trends || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-slate-900/80 border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="DecisionUp"
              width={40}
              height={40}
              className="rounded-xl"
            />
            <div>
              <h1 className="text-lg font-bold text-white">DecisionUp</h1>
              <p className="text-xs text-slate-400">Signal, not noise</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-300">{greeting}</p>
            <p className="text-xs text-slate-500">{dateStr}</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Quick Summary */}
        <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-slate-800/50 border border-amber-500/20">
          {loading ? (
            <p className="text-sm text-slate-400">Loading your daily intelligence...</p>
          ) : (
            <p className="text-sm text-slate-300">
              <span className="text-amber-400 font-semibold">Today:</span>{' '}
              {podcasts.length} podcasts ready • {economic.length} economic signals • {trends.length} tech trends
            </p>
          )}
        </div>

        {/* Podcasts Section */}
        <PodcastSection episodes={podcasts} />

        {/* Economic Signals */}
        <EconomicSection signals={economic} />

        {/* Tech Trends */}
        <TrendsSection trends={trends} />

        {/* Footer */}
        <footer className="mt-12 pt-6 border-t border-slate-800 text-center">
          <p className="text-xs text-slate-500">
            DecisionUp • Updated every hour • Data from RSS, ECB, Hacker News
          </p>
          <p className="text-xs text-slate-600 mt-1">
            Built for smarter decisions in a noisy world
          </p>
        </footer>
      </main>
    </div>
  );
}
