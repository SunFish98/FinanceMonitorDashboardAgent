# Finance Monitor Dashboard

A real-time financial monitoring dashboard tracking US macroeconomic indicators, FOMC meetings, FED rate cut probabilities, and Trump's Truth Social feed.

## What It Monitors

| Category | Indicators |
|---|---|
| 就业数据 (Employment) | Non-Farm Payrolls, Unemployment Rate, Initial Jobless Claims |
| 通胀数据 (Inflation) | CPI, Core CPI, PCE, PPI |
| GDP增长率 (GDP) | GDP Growth Rate |
| PMI / 零售销售 | Michigan Consumer Sentiment, Retail Sales, ISM PMI, Housing Data |
| FED Watch | FOMC meeting calendar, rate cut probabilities |
| Truth Social | Latest posts from @realDonaldTrump |

Each indicator shows the latest value vs expectation, color-coded as:
- 🟢 **超出预期** — Beat expectations
- 🔴 **不及预期** — Missed expectations
- 🟡 **符合预期** — Inline with expectations

---

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- npm v9 or higher

Check your versions:
```bash
node -v
npm -v
```

---

## Step-by-Step Setup

### Step 1 — Clone the repository

```bash
git clone <repository-url>
cd FinanceMonitorDashboardAgent
```

### Step 2 — Install dependencies

```bash
npm install
```

### Step 3 — Configure environment variables

Copy the example env file:

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in your values:

```env
# Required for live economic data (CPI, GDP, Unemployment, etc.)
# Get a free API key at: https://fred.stlouisfed.org/docs/api/api_key.html
NEXT_PUBLIC_FRED_API_KEY=your_fred_api_key_here

# Optional: how often the dashboard auto-refreshes (milliseconds)
# Default is 300000 (5 minutes)
NEXT_PUBLIC_REFRESH_INTERVAL=300000
```

> **Note:** The FRED API key is free and takes ~1 minute to register. Without it, the dashboard will display realistic mock data automatically.

### Step 4 — Get a free FRED API key (optional but recommended)

1. Go to [https://fred.stlouisfed.org/docs/api/api_key.html](https://fred.stlouisfed.org/docs/api/api_key.html)
2. Click **"Request API Key"**
3. Create a free account or log in
4. Copy your API key into `.env.local`

### Step 5 — Run in development mode

```bash
npm run dev
```

Open your browser at [http://localhost:3000](http://localhost:3000)

---

## Running in Production

### Build and start

```bash
npm run build
npm start
```

The app will run at [http://localhost:3000](http://localhost:3000)

### Custom port

```bash
npm start -- -p 8080
```

---

## Data Sources

| Data | Source | Notes |
|---|---|---|
| Economic indicators | [FRED API](https://fred.stlouisfed.org/) | Free API key required for live data |
| Rate cut probabilities | [CME FedWatch](https://www.cmegroup.com/markets/interest-rates/cme-fedwatch-tool.html) | Public endpoint, no key needed |
| FOMC meeting dates | Hardcoded 2025–2026 schedule | Updated manually each year |
| Trump posts | [Truth Social RSS](https://truthsocial.com/@realDonaldTrump.rss) | Public RSS feed |

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx                  # Main dashboard page
│   ├── layout.tsx                # Root layout
│   └── api/
│       ├── fred/[series]/        # FRED data proxy
│       ├── fedwatch/             # CME FedWatch proxy
│       ├── fomc/                 # FOMC meeting dates
│       └── truthsocial/          # Truth Social RSS parser
├── components/
│   └── dashboard/
│       ├── MacroHeader.tsx       # Top bar with date/time
│       ├── IndicatorCard.tsx     # Single indicator card
│       ├── IndicatorSection.tsx  # Grouped indicators
│       ├── FedWatchPanel.tsx     # Rate probability panel
│       ├── FOMCCalendar.tsx      # Meeting timeline
│       ├── RateProbabilityChart.tsx  # Bar chart
│       └── TruthSocialFeed.tsx   # Trump posts feed
└── lib/
    ├── types.ts                  # TypeScript types
    ├── indicators-config.ts      # All indicator definitions
    └── fred-client.ts            # FRED API client
```

---

## Troubleshooting

**Dashboard shows mock data instead of live data**
- Make sure `NEXT_PUBLIC_FRED_API_KEY` is set in `.env.local`
- Restart the dev server after editing `.env.local`

**Truth Social feed not loading**
- The RSS feed may be rate-limited; the dashboard will fall back to cached mock posts
- Check your network can reach `truthsocial.com`

**CME FedWatch shows no probabilities**
- CME may block server-side requests; mock probability data will display instead

**Build errors**
```bash
npm run lint   # check for lint issues
npm run build  # see full TypeScript errors
```
