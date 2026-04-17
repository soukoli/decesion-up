# Personal Intelligence Dashboard - API Research

## 1. Podcast APIs & RSS Feeds

### Spotify Web API
- **Endpoint**: `https://api.spotify.com/v1/`
- **Podcast Search**: `GET /search?type=show,episode&q={query}`
- **Show Episodes**: `GET /shows/{id}/episodes`
- **Free Tier**: Unlimited calls with rate limiting (rolling 30-second window)
- **Auth**: OAuth 2.0 (Client Credentials for public data)
- **Format**: JSON
- **Docs**: https://developer.spotify.com/documentation/web-api
- **Notes**: Excellent for podcast discovery, but audio streaming requires premium

### Apple Podcasts API (via iTunes Search)
- **Endpoint**: `https://itunes.apple.com/search`
- **Example**: `?term=financial+times&media=podcast&entity=podcastEpisode`
- **Lookup by ID**: `https://itunes.apple.com/lookup?id={podcastId}&entity=podcastEpisode`
- **Free Tier**: ~20 calls/minute (undocumented soft limit)
- **Auth**: None required
- **Format**: JSON
- **Notes**: No OAuth needed, very easy to use

### Podcast Index API (Open Source Alternative)
- **Endpoint**: `https://api.podcastindex.org/api/1.0/`
- **Search**: `/search/byterm?q={query}`
- **Recent Episodes**: `/recent/episodes`
- **Trending**: `/podcasts/trending`
- **Free Tier**: 1000 calls/month free
- **Auth**: API Key + Secret (free registration)
- **Format**: JSON
- **Docs**: https://podcastindex-org.github.io/docs-api/
- **Notes**: Best open alternative, excellent metadata

### Direct RSS Feeds (No API needed - FREE)

| Podcast | RSS Feed URL |
|---------|-------------|
| **Financial Times News Briefing** | `https://feeds.acast.com/public/shows/ft-news-briefing` |
| **The Economist Podcasts** | `https://feeds.simplecast.com/kq4i57B5` (The Intelligence) |
| **BBC Global News Podcast** | `https://podcasts.files.bbci.co.uk/p02nq0gn.rss` |
| **WSJ What's News** | `https://feeds.megaphone.fm/wsj-whats-news` |
| **a]a16z Podcast** | `https://feeds.simplecast.com/JGE3yC0V` |
| **TED Talks Daily** | `https://feeds.feedburner.com/tedtalks_audio` |
| **Hacker News (top stories)** | Use API below, no official RSS |

**RSS Parsing Libraries**:
- JavaScript: `rss-parser`, `feedparser`
- Python: `feedparser`

---

## 2. Economic Data APIs

### Exchange Rates

#### ExchangeRate-API
- **Endpoint**: `https://v6.exchangerate-api.com/v6/{API_KEY}/latest/USD`
- **Pair Conversion**: `/pair/USD/CZK`
- **Free Tier**: 1,500 requests/month
- **Auth**: API Key (free)
- **Format**: JSON
- **Update Frequency**: Daily
- **Docs**: https://www.exchangerate-api.com/docs

#### Frankfurter (ECB Data - Completely Free)
- **Endpoint**: `https://api.frankfurter.app/`
- **Latest Rates**: `GET /latest?from=CZK&to=EUR,USD`
- **Historical**: `GET /2024-01-01?from=CZK`
- **Time Series**: `GET /2024-01-01..2024-03-01?from=CZK&to=EUR`
- **Free Tier**: Unlimited (rate-limited)
- **Auth**: None
- **Format**: JSON
- **Notes**: Best free option for EUR-based currencies

#### Open Exchange Rates
- **Endpoint**: `https://openexchangerates.org/api/`
- **Latest**: `/latest.json?app_id={id}`
- **Free Tier**: 1,000 requests/month, hourly updates
- **Auth**: API Key
- **Format**: JSON

### Inflation Data

#### World Bank API (FREE)
- **Endpoint**: `https://api.worldbank.org/v2/`
- **CZ Inflation**: `/country/CZ/indicator/FP.CPI.TOTL.ZG?format=json`
- **EU Inflation**: `/country/EU/indicator/FP.CPI.TOTL.ZG?format=json`
- **Global**: `/country/all/indicator/FP.CPI.TOTL.ZG?format=json`
- **Free Tier**: Unlimited
- **Auth**: None
- **Format**: JSON, XML
- **Update Frequency**: Monthly/Quarterly
- **Docs**: https://datahelpdesk.worldbank.org/knowledgebase/topics/125589

#### FRED API (Federal Reserve Economic Data)
- **Endpoint**: `https://api.stlouisfed.org/fred/`
- **Series Data**: `/series/observations?series_id=CPIAUCSL&api_key={key}&file_type=json`
- **Key Series**:
  - `CPIAUCSL` - US CPI
  - `FPCPITOTLZGCZE` - Czech Inflation
  - `FPCPITOTLZGEMU` - Euro Area Inflation
  - `FEDFUNDS` - Fed Interest Rate
- **Free Tier**: 120 requests/minute
- **Auth**: API Key (free registration)
- **Format**: JSON, XML
- **Docs**: https://fred.stlouisfed.org/docs/api/fred/

#### Eurostat API (Official EU Data - FREE)
- **Endpoint**: `https://ec.europa.eu/eurostat/api/dissemination/`
- **Statistics**: `/statistics/1.0/data/{datasetCode}`
- **HICP Inflation**: `/statistics/1.0/data/prc_hicp_manr?geo=CZ&geo=EU27_2020`
- **Free Tier**: Unlimited
- **Auth**: None
- **Format**: JSON, SDMX
- **Docs**: https://wikis.ec.europa.eu/display/EUROSTATHELP/API

### Stock Market Indices

#### Alpha Vantage
- **Endpoint**: `https://www.alphavantage.co/query`
- **Global Quote**: `?function=GLOBAL_QUOTE&symbol=SPY&apikey={key}`
- **Index Data** (use ETFs):
  - S&P 500: `SPY` or `^GSPC`
  - NASDAQ: `QQQ` or `^IXIC`
  - Euro Stoxx: `FEZ`
- **Free Tier**: 25 requests/day
- **Auth**: API Key (free)
- **Format**: JSON, CSV
- **Docs**: https://www.alphavantage.co/documentation/

#### Yahoo Finance (Unofficial - via yfinance)
- **Endpoint**: `https://query1.finance.yahoo.com/v8/finance/chart/{symbol}`
- **Symbols**:
  - `^GSPC` - S&P 500
  - `^IXIC` - NASDAQ
  - `^STOXX50E` - Euro Stoxx 50
  - `^GDAXI` - DAX
  - `^FTSE` - FTSE 100
  - `^PX` - Prague PX Index
- **Free Tier**: Unofficial, use with caution
- **Auth**: None
- **Format**: JSON
- **Notes**: Use `yfinance` Python library or direct API

#### Twelve Data
- **Endpoint**: `https://api.twelvedata.com/`
- **Quote**: `/quote?symbol=SPY&apikey={key}`
- **Time Series**: `/time_series?symbol=AAPL&interval=1day`
- **Free Tier**: 800 API calls/day, 8 calls/minute
- **Auth**: API Key (free)
- **Format**: JSON
- **Docs**: https://twelvedata.com/docs

#### Polygon.io
- **Endpoint**: `https://api.polygon.io/`
- **Daily Open/Close**: `/v1/open-close/{symbol}/{date}`
- **Free Tier**: 5 API calls/minute, end-of-day data only
- **Auth**: API Key
- **Format**: JSON
- **Docs**: https://polygon.io/docs

### Interest Rates

#### FRED API (Best for Interest Rates)
- **Key Series**:
  - `FEDFUNDS` - Federal Funds Rate
  - `ECBMLFR` - ECB Main Refinancing Rate
  - `IR3TIB01CZM156N` - Czech 3-Month Interbank
  - `DGS10` - 10-Year Treasury
  - `MORTGAGE30US` - 30-Year Mortgage

#### Czech National Bank (CNB)
- **Endpoint**: `https://www.cnb.cz/cs/financni_trhy/devizovy_trh/kurzy_devizoveho_trhu/denni_kurz.txt`
- **Exchange Rates**: Daily TXT file
- **JSON API**: `https://www.cnb.cz/en/financial-markets/foreign-exchange-market/central-bank-exchange-rate-fixing/daily.php?format=json`
- **Free Tier**: Unlimited
- **Auth**: None
- **Interest Rates Page**: Manual scraping needed

---

## 3. News & Trends APIs

### General News

#### NewsAPI
- **Endpoint**: `https://newsapi.org/v2/`
- **Top Headlines**: `/top-headlines?country=us&category=technology`
- **Everything Search**: `/everything?q=AI&sortBy=publishedAt`
- **Free Tier**: 100 requests/day, 1 month historical
- **Auth**: API Key
- **Format**: JSON
- **Limitations**: Free tier limited to dev only, localhost
- **Docs**: https://newsapi.org/docs

#### GNews API
- **Endpoint**: `https://gnews.io/api/v4/`
- **Search**: `/search?q=tech&token={token}`
- **Top Headlines**: `/top-headlines?category=technology&lang=en`
- **Free Tier**: 100 requests/day
- **Auth**: API Key
- **Format**: JSON
- **Docs**: https://gnews.io/docs/v4

#### The Guardian Open Platform
- **Endpoint**: `https://content.guardianapis.com/`
- **Search**: `/search?q=technology&api-key={key}`
- **Free Tier**: 5,000 requests/day
- **Auth**: API Key (free)
- **Format**: JSON
- **Docs**: https://open-platform.theguardian.com/documentation/

#### New York Times API
- **Endpoint**: `https://api.nytimes.com/svc/`
- **Top Stories**: `/topstories/v2/technology.json?api-key={key}`
- **Article Search**: `/search/v2/articlesearch.json?q=AI`
- **Free Tier**: 500 requests/day
- **Auth**: API Key (free)
- **Format**: JSON
- **Docs**: https://developer.nytimes.com/

### Tech News

#### Hacker News API (FREE - No Auth)
- **Endpoint**: `https://hacker-news.firebaseio.com/v0/`
- **Top Stories**: `/topstories.json` (returns IDs)
- **Best Stories**: `/beststories.json`
- **New Stories**: `/newstories.json`
- **Item Details**: `/item/{id}.json`
- **Free Tier**: Unlimited
- **Auth**: None
- **Format**: JSON
- **Docs**: https://github.com/HackerNews/API

#### Dev.to API
- **Endpoint**: `https://dev.to/api/`
- **Articles**: `/articles?tag=ai&top=7`
- **Free Tier**: 30 requests/30 seconds
- **Auth**: None (or API key for more)
- **Format**: JSON
- **Docs**: https://developers.forem.com/api

#### Reddit API
- **Endpoint**: `https://oauth.reddit.com/` or `https://www.reddit.com/r/{sub}.json`
- **Tech Subreddits**:
  - `/r/technology.json`
  - `/r/programming.json`
  - `/r/MachineLearning.json`
  - `/r/artificial.json`
- **Free Tier**: 60 requests/minute
- **Auth**: OAuth 2.0 (or `.json` suffix for public)
- **Format**: JSON

#### Product Hunt API (GraphQL)
- **Endpoint**: `https://api.producthunt.com/v2/api/graphql`
- **Free Tier**: 450 requests/15 min
- **Auth**: OAuth 2.0
- **Format**: JSON (GraphQL)
- **Docs**: https://api.producthunt.com/v2/docs

### RSS Feeds for Tech News

| Source | RSS URL |
|--------|---------|
| TechCrunch | `https://techcrunch.com/feed/` |
| Ars Technica | `https://feeds.arstechnica.com/arstechnica/index` |
| Wired | `https://www.wired.com/feed/rss` |
| The Verge | `https://www.theverge.com/rss/index.xml` |
| MIT Tech Review | `https://www.technologyreview.com/feed/` |
| Reuters Tech | `https://feeds.reuters.com/reuters/technologyNews` |
| AP Tech | `https://rss.app/feeds/v1.1/tsxeCPSjrFmGDNPp.json` |

---

## 4. Real Estate Data - Prague/Czech Republic

### Sreality.cz (Scraping Required)
- **Website**: https://www.sreality.cz/
- **Note**: No official API, requires web scraping
- **Data Available**: Prices, locations, property types
- **Legal**: Check terms of service

### Bezrealitky API (Limited)
- **Website**: https://www.bezrealitky.cz/
- **API**: Not officially public
- **Alternative**: RSS feeds for new listings

### CZSO (Czech Statistical Office) - FREE
- **Endpoint**: `https://vdb.czso.cz/pll/eweb/`
- **Housing Price Index**: Available via data portal
- **Website**: https://www.czso.cz/csu/czso/ceny_bytu
- **Format**: XLS, CSV downloads
- **Update Frequency**: Quarterly

### Eurostat Housing Data - FREE
- **Endpoint**: `https://ec.europa.eu/eurostat/api/dissemination/`
- **House Price Index**: `/statistics/1.0/data/prc_hpi_q?geo=CZ`
- **Auth**: None
- **Format**: JSON, SDMX

### Numbeo API (Freemium)
- **Endpoint**: `https://www.numbeo.com/api/`
- **City Prices**: `/city_prices?api_key={key}&city=Prague`
- **Property Prices**: `/property_prices?api_key={key}&city=Prague`
- **Free Tier**: 100 requests/day (limited data)
- **Auth**: API Key
- **Format**: JSON

### Deloitte Property Index
- **Website**: https://www2.deloitte.com/cz/en/pages/real-estate/articles/property-index.html
- **Data**: Annual report, PDF
- **Note**: Manual extraction needed

---

## 5. AI/Tech Job Market & Industry Trends

### GitHub Jobs Alternative: Adzuna API
- **Endpoint**: `https://api.adzuna.com/v1/api/jobs/`
- **Search**: `/{country}/search/1?app_id={id}&app_key={key}&what=AI+developer`
- **Countries**: `gb`, `us`, `de`, `cz`
- **Free Tier**: 250 requests/month
- **Auth**: API Key
- **Format**: JSON
- **Docs**: https://developer.adzuna.com/

### The Muse API
- **Endpoint**: `https://www.themuse.com/api/public/`
- **Jobs Search**: `/jobs?category=Data%20Science&level=Senior%20Level`
- **Free Tier**: 500 requests/hour
- **Auth**: None (or API key)
- **Format**: JSON

### LinkedIn (Limited)
- **Note**: Official API very restricted
- **Alternative**: Use job board aggregators

### Indeed (Scraping)
- **Note**: No public API
- **Alternative**: RSS feeds for job alerts

### Stack Overflow Jobs (Deprecated)
- **Alternative**: Use Stack Overflow Trends: https://insights.stackoverflow.com/trends

### GitHub Trending
- **Endpoint**: No official API
- **Unofficial**: `https://api.gitterapp.com/`
- **Alternative**: Scrape `https://github.com/trending`

### AI/ML Specific Sources

#### Papers with Code API
- **Endpoint**: `https://paperswithcode.com/api/v1/`
- **Papers**: `/papers/?ordering=-published`
- **Trends**: `/trends/`
- **Free Tier**: Unlimited (fair use)
- **Auth**: None
- **Format**: JSON
- **Docs**: https://paperswithcode.com/api/

#### Hugging Face API
- **Endpoint**: `https://huggingface.co/api/`
- **Models**: `/models?sort=downloads&direction=-1`
- **Trending**: `/models?sort=trending`
- **Free Tier**: 30 requests/minute
- **Auth**: None (or token for more)
- **Format**: JSON

### Economic/Industry Reports

#### BLS API (US Labor Statistics)
- **Endpoint**: `https://api.bls.gov/publicAPI/v2/`
- **Data**: `/timeseries/data/`
- **Tech Employment Series**: `CES6054000001`
- **Free Tier**: 50 requests/day (v2), 25/day (v1)
- **Auth**: API Key (free, higher limits)
- **Format**: JSON

#### OECD API
- **Endpoint**: `https://sdmx.oecd.org/public/rest/`
- **Data**: Various economic indicators
- **Free Tier**: Unlimited
- **Auth**: None
- **Format**: SDMX, JSON

---

## Summary: Recommended Stack (All Free/Freemium)

### Must-Have APIs (Free Tier Sufficient)

| Category | Primary API | Backup |
|----------|-------------|--------|
| **Podcasts** | Direct RSS Feeds | Podcast Index API |
| **Exchange Rates** | Frankfurter (ECB) | ExchangeRate-API |
| **Inflation** | FRED API | World Bank |
| **Stock Indices** | Twelve Data | Alpha Vantage |
| **Interest Rates** | FRED API | CNB (Czech) |
| **Tech News** | Hacker News API | Dev.to |
| **General News** | Guardian API | NYT API |
| **AI Trends** | Papers with Code | Hugging Face |
| **Jobs** | Adzuna | The Muse |
| **Real Estate** | Eurostat | CZSO |

### Daily API Call Budget (Free Tiers)

| API | Daily Limit | Calls Needed |
|-----|-------------|--------------|
| Frankfurter | Unlimited | 3 |
| FRED | 5,760 (120/min) | 10 |
| Twelve Data | 800 | 20 |
| Guardian | 5,000 | 20 |
| NYT | 500 | 10 |
| Hacker News | Unlimited | 50 |
| NewsAPI | 100 | 10 |
| **Total** | ~7,000+ available | ~123 needed |

---

## Authentication Summary

### No Auth Required (Easiest)
- Frankfurter (exchange rates)
- World Bank
- Eurostat
- Hacker News
- Apple Podcasts/iTunes
- RSS Feeds

### Free API Key (Easy)
- FRED
- Alpha Vantage
- Twelve Data
- NewsAPI
- Guardian
- NYT
- Adzuna
- Podcast Index

### OAuth 2.0 (More Complex)
- Spotify
- Reddit (for higher limits)
- Product Hunt

---

## Implementation Notes

### Caching Strategy
- Exchange rates: Cache 1 hour
- Stock data: Cache 15 minutes during market hours
- News: Cache 30 minutes
- Podcasts: Cache 6 hours
- Economic data: Cache 24 hours

### Error Handling
- Implement exponential backoff
- Have fallback APIs for critical data
- Cache last successful response

### Rate Limiting
- Use a request queue
- Implement per-API rate limiters
- Batch requests where possible

