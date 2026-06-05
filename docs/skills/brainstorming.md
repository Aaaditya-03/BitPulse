# BitPulse Brainstorming Skill

This skill guides the design, UI/UX conceptualization, and technical architecture of new features for the **BitPulse** crypto charts dashboard.

It is inspired by the `superpowers` framework, ensuring that before any code is written, user intent is thoroughly understood, API rate limits are addressed, and UI/UX alignment is verified.

---

## Hard Gate: Do Not Write Code Yet!
Do NOT create files, write code, run commands to install packages, or scaffold pages until a brainstorming session is finished and the user has approved the final spec.

---

## 1. Project Context Check
Before asking the user clarifying questions, you must inspect the existing BitPulse code:
- **API Access**: [lib/coingecko.actions.ts](file:///d:/project/bitpulse/lib/coingecko.actions.ts) handles data fetch. Note that the CoinGecko Demo API key has severe rate limits (e.g., 30 requests/min).
- **Charting**: [components/CandlestickChart.tsx](file:///d:/project/bitpulse/components/CandlestickChart.tsx) handles TradingView `lightweight-charts` rendering.
- **Styling**: Tailwind CSS combined with custom variables in [app/globals.css](file:///d:/project/bitpulse/app/globals.css).

---

## 2. Brainstorming Checklist
Ensure you execute these steps for any new feature request:

### Step 1: Clarify Intent
Ask the user clarifying questions **one at a time**.
- What is the primary user goal?
- Are there specific UI layouts they envision?
- What timeframes or data points are relevant?

### Step 2: Architecture Constraints
Analyze the technical requirements:
- **Server vs. Client Components**: Can we render this server-side to minimize client bundle size and optimize initial load? Or does it require client-side state/interactivity?
- **CoinGecko API & Caching**: How will we fetch the data? If it requires CoinGecko, does it require a new endpoint? What cache revalidation time (`revalidate` parameter in `fetcher`) makes sense?
- **State Management**: Will state be local (`useState`), url-driven (search params via `next/navigation`), or persistent (`localStorage`)?

### Step 3: Propose Approaches
Propose 2-3 approaches with trade-offs. Example:
- *Approach A (Local State)*: Simple, fast, but resets on page reload.
- *Approach B (URL Search Params)*: Great for shareable links, integrates well with Next.js Server Components.
- *Approach C (Local Storage)*: Good for personalizing lists (e.g., watchlists, portfolios) without needing database authentication.

### Step 4: UI/UX & Aesthetics Design
Present a layout plan:
- Map out the typography (using Geist/Inter), spacing, and styling.
- Design micro-animations (e.g., hover scaling, active state highlights, smooth chart loading transitions).
- Design responsive layout grids (mobile-friendly stack vs desktop grid).

### Step 5: Write Design Specification
Once approved, document the design in [docs/plans/YYYY-MM-DD-<feature-name>-design.md](file:///d:/project/bitpulse/docs/plans/).
Get the user's final sign-off before proceeding to the **Planning Skill**.

---

## 3. BitPulse Best Practices

### A. CoinGecko API Optimization
- **Always Cache**: The default revalidation is 60 seconds. Do not set it lower than 30 seconds unless live data is explicitly selected.
- **Error Handling**: Use the existing `fetcher` error boundary and fallback components (like those in `components/home/fallback.tsx`).
- **Dex / Onchain queries**: Use `getPools` for decentralized pairs and onchain search.

### B. Lightweight Charts Integration
- Keep series creation inside React `useEffect` hooks.
- Handle resize events using `ResizeObserver` (already implemented in `CandlestickChart.tsx`).
- Clean up the chart using `chart.remove()` on component unmount to prevent memory leaks.
- Prefer feeding data formatted as UTC timestamps in seconds (convert milliseconds if needed).

### C. Aesthetic Excellence
- Use dark mode styling (`bg-background`, custom text colors).
- Use gradient borders and background overlays for premium cards.
- Add hover transitions: `transition-all duration-300 ease-in-out hover:scale-[1.02]`.
