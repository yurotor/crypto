import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchTopCoins, fetchMarketChart } from '../services/coingecko';
import type { CoinMarket, ChartDataPoint } from '../services/coingecko';

const REFRESH_INTERVAL = 30000; // 30 seconds

export function useCryptoData(selectedCoin: string, days: string) {
  const [coins, setCoins] = useState<CoinMarket[]>([]);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [coinsData, chartPoints] = await Promise.all([
        fetchTopCoins(),
        fetchMarketChart(selectedCoin, days),
      ]);
      setCoins(coinsData);
      setChartData(chartPoints);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch crypto data:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedCoin, days]);

  // Initial load and reload on coin/range change
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Auto-refresh
  useEffect(() => {
    intervalRef.current = setInterval(loadData, REFRESH_INTERVAL);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [loadData]);

  const refresh = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    loadData();
    intervalRef.current = setInterval(loadData, REFRESH_INTERVAL);
  }, [loadData]);

  const selectedCoinData = coins.find(c => c.id === selectedCoin) || null;

  return {
    coins,
    chartData,
    loading,
    lastUpdated,
    selectedCoinData,
    refresh,
  };
}
