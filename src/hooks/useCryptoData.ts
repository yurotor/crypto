import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchTopCoins, fetchMarketChart, RateLimitError } from '../services/coingecko';
import type { CoinMarket, ChartDataPoint } from '../services/coingecko';

const REFRESH_INTERVAL = 60000; // 60 seconds
const MAX_RETRIES = 2;
const COINS_STORAGE_KEY = 'crypto-coins-cache';

function loadCachedCoins(): CoinMarket[] {
  try {
    const raw = localStorage.getItem(COINS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore parse errors */ }
  return [];
}

function saveCachedCoins(coins: CoinMarket[]): void {
  try {
    localStorage.setItem(COINS_STORAGE_KEY, JSON.stringify(coins));
  } catch { /* ignore quota errors */ }
}

async function fetchWithRetry<T>(
  fn: (signal: AbortSignal) => Promise<T>,
  signal: AbortSignal
): Promise<T> {
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      return await fn(signal);
    } catch (error) {
      if (signal.aborted) throw error;
      if (error instanceof RateLimitError) throw error;
      if (attempt < MAX_RETRIES - 1) {
        await new Promise(r => setTimeout(r, 3000 * (attempt + 1)));
        if (signal.aborted) throw new DOMException('Aborted', 'AbortError');
      } else {
        throw error;
      }
    }
  }
  throw new Error('Unreachable');
}

export function useCryptoData(selectedCoin: string, days: string) {
  const [coins, setCoins] = useState<CoinMarket[]>(loadCachedCoins);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const coinsControllerRef = useRef<AbortController | null>(null);
  const chartControllerRef = useRef<AbortController | null>(null);
  const prevCoinRef = useRef(selectedCoin);

  // Clear chart when coin changes (stale data from another coin is misleading)
  if (prevCoinRef.current !== selectedCoin) {
    prevCoinRef.current = selectedCoin;
    setChartData([]);
  }

  const loadCoins = useCallback(async () => {
    // Abort any in-flight coins request
    coinsControllerRef.current?.abort();
    const controller = new AbortController();
    coinsControllerRef.current = controller;

    try {
      const data = await fetchWithRetry(
        (signal) => fetchTopCoins(signal),
        controller.signal
      );
      setCoins(data);
      saveCachedCoins(data);
    } catch (error) {
      if (!controller.signal.aborted) {
        console.error('Failed to fetch coins:', error);
      }
    }
  }, []);

  const loadChart = useCallback(async () => {
    // Abort any in-flight chart request (stale coin/range)
    chartControllerRef.current?.abort();
    const controller = new AbortController();
    chartControllerRef.current = controller;

    setLoading(true);
    setError(null);
    try {
      const chartPoints = await fetchWithRetry(
        (signal) => fetchMarketChart(selectedCoin, days, signal),
        controller.signal
      );
      setChartData(chartPoints);
      setLastUpdated(new Date());
    } catch (err) {
      if (!controller.signal.aborted) {
        const message = err instanceof RateLimitError
          ? 'Rate limit exceeded — try again in a few seconds.'
          : 'Failed to load data. Check your connection and try again.';
        setError(message);
        console.error('Failed to fetch chart data:', err);
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, [selectedCoin, days]);

  // Load coins once on mount
  useEffect(() => {
    loadCoins();
    return () => { coinsControllerRef.current?.abort(); };
  }, [loadCoins]);

  // Fetch new data when coin or range changes (debounced to avoid burning rate limit)
  // Auto-retries after 5s on failure so the user doesn't have to click Retry
  useEffect(() => {
    let retryTimer: ReturnType<typeof setTimeout> | null = null;
    let cancelled = false;

    const timer = setTimeout(async () => {
      await loadChart();
      // If chart data is still empty after load, schedule an auto-retry
      if (!cancelled) {
        retryTimer = setTimeout(() => {
          if (!cancelled) loadChart();
        }, 5000);
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      if (retryTimer) clearTimeout(retryTimer);
      chartControllerRef.current?.abort();
    };
  }, [loadChart]);

  // Auto-refresh
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      loadCoins();
      loadChart();
    }, REFRESH_INTERVAL);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [loadCoins, loadChart]);

  const refresh = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    loadCoins();
    loadChart();
    intervalRef.current = setInterval(() => {
      loadCoins();
      loadChart();
    }, REFRESH_INTERVAL);
  }, [loadCoins, loadChart]);

  const selectedCoinData = coins.find(c => c.id === selectedCoin) || null;

  return {
    coins,
    chartData,
    loading,
    error,
    lastUpdated,
    selectedCoinData,
    refresh,
  };
}
