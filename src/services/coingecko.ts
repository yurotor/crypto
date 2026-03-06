import type { UTCTimestamp } from "lightweight-charts";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CoinMarket {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  total_volume: number;
  price_change_percentage_24h: number;
  price_change_percentage_7d_in_currency: number;
  price_change_percentage_30d_in_currency: number;
  price_change_percentage_1y_in_currency: number;
  total_supply: number | null;
  circulating_supply: number;
}

export interface ChartDataPoint {
  time: UTCTimestamp;
  value: number;
}

// ---------------------------------------------------------------------------
// In-memory cache (TTL = 30 s)
// ---------------------------------------------------------------------------

const CACHE_TTL_MS = 30_000;

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry<unknown>>();

function getCached<T>(key: string): T | null {
  const entry = cache.get(key) as CacheEntry<T> | undefined;
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

function setCache<T>(key: string, data: T): void {
  cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS });
}

// ---------------------------------------------------------------------------
// API helpers
// ---------------------------------------------------------------------------

const BASE_URL = "https://api.coingecko.com/api/v3";

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`CoinGecko API error: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Fetch the top 10 coins sorted by 24 h volume.
 */
export async function fetchTopCoins(): Promise<CoinMarket[]> {
  const cacheKey = "top-coins";
  const cached = getCached<CoinMarket[]>(cacheKey);
  if (cached) return cached;

  const params = new URLSearchParams({
    vs_currency: "usd",
    order: "volume_desc",
    per_page: "10",
    sparkline: "false",
    price_change_percentage: "1h,24h,7d,30d,1y",
  });

  const data = await fetchJSON<CoinMarket[]>(
    `${BASE_URL}/coins/markets?${params.toString()}`
  );

  setCache(cacheKey, data);
  return data;
}

/**
 * Fetch historical market-chart data for a given coin.
 *
 * Returns an array of `{ time, value }` objects ready for lightweight-charts,
 * with duplicate timestamps removed.
 */
export async function fetchMarketChart(
  coinId: string,
  days: string
): Promise<ChartDataPoint[]> {
  const cacheKey = `chart-${coinId}-${days}`;
  const cached = getCached<ChartDataPoint[]>(cacheKey);
  if (cached) return cached;

  const params = new URLSearchParams({
    vs_currency: "usd",
    days,
  });

  const raw = await fetchJSON<{ prices: [number, number][] }>(
    `${BASE_URL}/coins/${coinId}/market_chart?${params.toString()}`
  );

  // Transform & deduplicate by timestamp
  const seen = new Set<number>();
  const points: ChartDataPoint[] = [];

  for (const [ms, value] of raw.prices) {
    const timeSec = Math.floor(ms / 1000) as UTCTimestamp;
    if (seen.has(timeSec)) continue;
    seen.add(timeSec);
    points.push({ time: timeSec, value });
  }

  setCache(cacheKey, points);
  return points;
}
