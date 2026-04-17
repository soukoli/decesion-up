export default function Home() {
  const podcasts = [
    {
      name: "Financial Times News Briefing",
      description: "Business, markets, geopolitics",
      url: "https://open.spotify.com/show/7LbCPcrFaBX2sL4MhSyAqB",
      category: "Finance",
    },
    {
      name: "The Economist Podcasts",
      description: "Context over sensation. Top quality.",
      url: "https://open.spotify.com/show/1SVbB4n3LV1TsACRYQdcVs",
      category: "Global",
    },
    {
      name: "BBC Global News Podcast",
      description: "Strong on world events",
      url: "https://open.spotify.com/show/7vDhMmwHRMB3JQ4X1uFjJJ",
      category: "News",
    },
    {
      name: "WSJ What's News",
      description: "Short and high quality",
      url: "https://open.spotify.com/show/0OQ3D9kkChAo3zZyZWWaAq",
      category: "Business",
    },
    {
      name: "a16z Podcast",
      description: "Tech future insights",
      url: "https://open.spotify.com/show/5bC65RDvs3oxnLyqqvkUYX",
      category: "Tech",
    },
    {
      name: "TED Talks Daily",
      description: "Ideas worth spreading",
      url: "https://open.spotify.com/show/1VXcH8QHkjRcTCEd88U3ti",
      category: "Ideas",
    },
  ];

  const signals = [
    { title: "Prague Housing", trend: "up", change: "+3.2%", detail: "Rent prices continue to rise in Q1" },
    { title: "EU Inflation", trend: "down", change: "-0.4%", detail: "ECB policy showing effects" },
    { title: "AI Jobs Europe", trend: "up", change: "+18%", detail: "Tech hiring accelerates" },
    { title: "Czech CZK/EUR", trend: "stable", change: "0.0%", detail: "Currency remains stable" },
    { title: "Tech Stocks", trend: "up", change: "+2.1%", detail: "NASDAQ showing strength" },
    { title: "Oil Prices", trend: "up", change: "+4.5%", detail: "Geopolitical tensions rising" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-black text-white">
      {/* Header */}
      <header className="border-b border-zinc-800">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center font-bold text-sm">
              D
            </div>
            <span className="text-xl font-semibold">DecisionUp</span>
          </div>
          <div className="text-sm text-zinc-400">
            Signal, not noise.
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Your Daily Intelligence Feed
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
            10 minutes. No ads. No hype. Just what matters for your decisions today.
          </p>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-16">
          {signals.map((signal, i) => (
            <div key={i} className="bg-zinc-800/50 rounded-xl p-4 border border-zinc-700 hover:border-zinc-500 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-lg font-bold ${
                  signal.trend === 'up' ? 'text-green-400' : 
                  signal.trend === 'down' ? 'text-red-400' : 'text-zinc-400'
                }`}>
                  {signal.trend === 'up' ? '^' : signal.trend === 'down' ? 'v' : '-'}
                </span>
                <span className="text-sm font-medium text-zinc-300">{signal.title}</span>
              </div>
              <div className={`text-xl font-bold ${
                signal.trend === 'up' ? 'text-green-400' : 
                signal.trend === 'down' ? 'text-red-400' : 'text-zinc-400'
              }`}>
                {signal.change}
              </div>
              <p className="text-xs text-zinc-500 mt-1">{signal.detail}</p>
            </div>
          ))}
        </div>

        {/* Podcasts Section */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <span className="text-2xl">*</span>
            Daily Podcasts for Your Commute
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {podcasts.map((podcast, i) => (
              <a 
                key={i}
                href={podcast.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-zinc-800/50 rounded-xl p-5 border border-zinc-700 hover:border-green-500 hover:bg-zinc-800 transition-all group"
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="text-xs px-2 py-1 bg-zinc-700 rounded text-zinc-300">{podcast.category}</span>
                  <svg className="w-5 h-5 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                  </svg>
                </div>
                <h3 className="font-semibold text-white mb-1">{podcast.name}</h3>
                <p className="text-sm text-zinc-400">{podcast.description}</p>
              </a>
            ))}
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <div className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 rounded-2xl p-6 border border-blue-700/50">
            <div className="text-3xl mb-4">*</div>
            <h3 className="text-xl font-bold mb-2">Morning Feed</h3>
            <p className="text-zinc-400">Scroll in 1 minute. Prague, Czechia, Europe, World, Tech, Finance.</p>
          </div>
          <div className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 rounded-2xl p-6 border border-purple-700/50">
            <div className="text-3xl mb-4">*</div>
            <h3 className="text-xl font-bold mb-2">Audio Briefing</h3>
            <p className="text-zinc-400">7 min while driving. Personalized. No ads. Just signal.</p>
          </div>
          <div className="bg-gradient-to-br from-green-900/50 to-green-800/30 rounded-2xl p-6 border border-green-700/50">
            <div className="text-3xl mb-4">*</div>
            <h3 className="text-xl font-bold mb-2">What Changed?</h3>
            <p className="text-zinc-400">See exactly what changed since yesterday. Impact on your life.</p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center py-12 border-t border-zinc-800">
          <h2 className="text-2xl font-bold mb-4">Intelligence for Smart People</h2>
          <p className="text-zinc-400 mb-8 max-w-lg mx-auto">
            Not another news app. A personal intelligence feed for the age of chaos.
          </p>
          <div className="flex gap-4 justify-center">
            <button className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full font-semibold hover:opacity-90 transition-opacity">
              Coming Soon
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-8">
        <div className="max-w-6xl mx-auto px-6 text-center text-zinc-500 text-sm">
          <p>DecisionUp - Personal Intelligence Feed</p>
          <p className="mt-2">Built with Next.js + Tailwind CSS</p>
        </div>
      </footer>
    </div>
  );
}
