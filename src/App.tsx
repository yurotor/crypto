import { useState, useEffect } from 'react';
import { useCryptoData } from './hooks/useCryptoData';
import Chart from './components/Chart/Chart';
import StatsPanel from './components/StatsPanel/StatsPanel';
import CoinSelector from './components/CoinSelector/CoinSelector';
import TimeRange from './components/TimeRange/TimeRange';
import RefreshButton from './components/RefreshButton/RefreshButton';
import ThemeSwitcher from './components/ThemeSwitcher/ThemeSwitcher';
import './App.css';

function App() {
  const [selectedCoin, setSelectedCoin] = useState('bitcoin');
  const [timeRange, setTimeRange] = useState('1');
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('crypto-theme') || 'standard';
  });

  const { coins, chartData, loading, lastUpdated, selectedCoinData, refresh } = useCryptoData(selectedCoin, timeRange);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('crypto-theme', theme);
  }, [theme]);

  const getDaysLabel = (days: string) => {
    const map: Record<string, string> = { '1': '24h', '7': '7d', '30': '30d', '365': '1y' };
    return map[days] || '24h';
  };

  const getPercentChange = () => {
    if (!selectedCoinData) return null;
    const map: Record<string, number | null | undefined> = {
      '1': selectedCoinData.price_change_percentage_24h,
      '7': selectedCoinData.price_change_percentage_7d_in_currency,
      '30': selectedCoinData.price_change_percentage_30d_in_currency,
      '365': selectedCoinData.price_change_percentage_1y_in_currency,
    };
    return map[timeRange] ?? null;
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-title">
          <h1>CryptoView</h1>
          <span className="app-subtitle">Real-time Market Data</span>
        </div>
        <div className="header-controls">
          <RefreshButton onRefresh={refresh} loading={loading} lastUpdated={lastUpdated} />
          <ThemeSwitcher currentTheme={theme} onThemeChange={setTheme} />
        </div>
      </header>

      <CoinSelector
        coins={coins.map(c => ({ id: c.id, symbol: c.symbol, name: c.name, image: c.image }))}
        selectedCoin={selectedCoin}
        onSelect={setSelectedCoin}
      />

      <StatsPanel
        price={selectedCoinData?.current_price ?? null}
        percentChange={getPercentChange()}
        volume={selectedCoinData?.total_volume ?? null}
        totalSupply={selectedCoinData?.total_supply ?? null}
        coinName={selectedCoinData?.name ?? ''}
        coinSymbol={selectedCoinData?.symbol ?? ''}
        coinImage={selectedCoinData?.image ?? ''}
        loading={loading && !selectedCoinData}
      />

      <div className="chart-controls">
        <TimeRange selected={timeRange} onSelect={setTimeRange} />
        <span className="period-label">{getDaysLabel(timeRange)} period</span>
      </div>

      <Chart data={chartData} loading={loading && chartData.length === 0} />
    </div>
  );
}

export default App;
