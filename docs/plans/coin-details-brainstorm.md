# BitPulse Features Brainstorming & Specs

**Date**: 2026-06-04
**Project**: BitPulse (Next.js & CoinGecko Crypto Dashboard)
**Status**: Proposal / Brainstorming Draft

This document utilizes the [docs/skills/brainstorming.md](file:///d:/project/bitpulse/docs/skills/brainstorming.md) skill to propose and design four key features to enhance the BitPulse platform:

1. **Dynamic Coin Detail Pages** (`/coin/[id]`)
2. **Interactive Watchlist** (Persistent Client-side Watchlist)
3. **Technical Indicator Overlays** (SMA/EMA on charts)
4. **Real-time Price Polling/Updates** (Utilizing the live chart interface)

---

## Feature 1: Dynamic Coin Detail Pages (`/coin/[id]`)

### User Intent
Currently, BitPulse displays a hardcoded overview of Bitcoin on the homepage. Users need a way to click on any trending coin or search result to see a full, dedicated view of that coin's historical charts, stats, and metadata.

### Proposed UI/UX
- **URL Routing**: Dynamic segment `app/coin/[id]/page.tsx`.
- **Top Bar**: Coin badge, logo, name, symbol, current price in INR/USD, and 24h percentage change (colored dynamically: green for positive, red for negative).
- **Main Section**: A larger [CandlestickChart](file:///d:/project/bitpulse/components/CandlestickChart.tsx) component supporting multiple periods (1D, 7D, 30D, 1Y).
- **Sidebar / Grid Card**: Detailed stats grid:
  - Market Cap & Rank
  - 24h Trading Volume
  - 24h High / 24h Low
  - Circulating & Max Supply
  - All-Time High (ATH) and All-Time Low (ATL) with dates.
- **Description Card**: Collapsible rich text rendering of the coin description fetched from CoinGecko.

### Technical Implementation
- **Data Source**: Use existing server action fetcher with `/coins/${id}` (for details) and `/coins/${id}/ohlc` (for charts).
- **Caching**: Enable 60-second caching for details, and custom revalidation based on historical ranges (e.g., 1D revalidates in 1 min, 1Y in 12 hours) to avoid hitting CoinGecko API rate limits.
- **Fallbacks**: Implement a detailed skeleton page using Next.js `loading.tsx` to handle loading states smoothly.

---

## Feature 2: Interactive Watchlist

### User Intent
Users want to bookmark coins they track frequently and view their price changes at a glance on the homepage or sidebar.

### Proposed UI/UX
- **Watchlist Button**: An interactive Star icon on coin list items (in `TrendingCoins`, `DataTable`, and `/coin/[id]`).
- **Dashboard Widget**: A modern, glassmorphic card on the homepage showing bookmarked coins:
  - Mini table showing Symbol, Price, and 24h Change.
  - Hover state to remove from watchlist or navigate to the coin detail page.
  - Subtle slide-in animation when a coin is added or removed.

### Technical Implementation
- **Storage**: Use client-side `localStorage` to save an array of bookmarked coin IDs (`['bitcoin', 'ethereum', 'solana']`). This avoids the need for database authentication.
- **Data Fetching**:
  - In a client component, load the array from `localStorage` on mount.
  - Fetch markets data in batch using CoinGecko API: `/coins/markets?vs_currency=inr&ids=bitcoin,ethereum,solana`.
  - Display loading spinner while retrieving markets data.

---

## Feature 3: Technical Indicator Overlays (SMA/EMA)

### User Intent
Traders and chart enthusiasts want to overlay simple moving averages (SMA) or exponential moving averages (EMA) on the price chart to identify trends.

### Proposed UI/UX
- **Controls**: A small dropdown or toggle button group labeled "Indicators" on the [CandlestickChart](file:///d:/project/bitpulse/components/CandlestickChart.tsx) toolbar.
- **Visuals**: Overlay colored, semi-transparent line curves (e.g., purple for SMA 9, gold for SMA 21) directly on top of the candlestick chart.
- **Interactive Tooltip**: When hovering, show the indicator values alongside the Open, High, Low, Close (OHLC) values in the chart legend.

### Technical Implementation
- **Calculation**: Since historical OHLC data is available on the client side, we can calculate SMA/EMA dynamically in JavaScript:
  $$\text{SMA}_n = \frac{1}{n} \sum_{i=0}^{n-1} P_{t-i}$$
- **Chart Series**:
  ```typescript
  // In CandlestickChart useEffect
  const smaSeries = chart.addLineSeries({
    color: '#a855f7', // Purple-500
    lineWidth: 1.5,
    title: 'SMA 9',
  });
  // Calculate and feed data
  smaSeries.setData(calculateSMA(ohlcData, 9));
  ```
- **Performance**: Ensure indicators recalculate only when `ohlcData` or period changes.

---

## Feature 4: Real-time Price Polling/Updates

### User Intent
Users want the chart and main overview price to update live without manually reloading the browser.

### Proposed UI/UX
- **Live Indicator**: A glowing green dot labeled "Live" next to the frequency selection buttons.
- **Frequency Selector**: Button group to set update frequency: "30s", "1m", "5m", or "Off".

### Technical Implementation
- **Data Update**: Use client-side `setInterval` based on the selected frequency.
- **Action**: Fetch the latest 1-day OHLC interval or current price from CoinGecko.
- **State Integration**: Pass the new data point to `liveOhlcv` inside `CandlestickChart.tsx`.
- **Chart Logic**: The lightweight-chart `candleSeriesRef.current.update(...)` method will append or update the last candlestick in real time, making the chart animate smoothly.
