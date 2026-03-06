import React, { useEffect, useRef } from 'react';
import {
  createChart,
  BaselineSeries,
} from 'lightweight-charts';
import type {
  IChartApi,
  ISeriesApi,
  UTCTimestamp,
  DeepPartial,
  ChartOptions,
} from 'lightweight-charts';
import './Chart.css';

interface ChartProps {
  data: { time: UTCTimestamp; value: number }[];
  loading: boolean;
  error?: string | null;
  onRetry?: () => void;
}

function getThemeColors() {
  const style = getComputedStyle(document.documentElement);
  return {
    textColor: style.getPropertyValue('--chart-text').trim() || style.getPropertyValue('--text').trim() || '#1d1d1f',
    gridColor: style.getPropertyValue('--chart-grid').trim() || 'rgba(128, 128, 128, 0.12)',
  };
}

function buildChartOptions(container: HTMLDivElement): DeepPartial<ChartOptions> {
  const { textColor, gridColor } = getThemeColors();
  return {
    layout: {
      background: { color: 'transparent' },
      textColor,
    },
    grid: {
      vertLines: { color: gridColor },
      horzLines: { color: gridColor },
    },
    rightPriceScale: {
      borderVisible: false,
    },
    timeScale: {
      borderVisible: false,
    },
    crosshair: {
      vertLine: {
        color: 'rgba(128, 128, 128, 0.4)',
        labelBackgroundColor: '#363a45',
      },
      horzLine: {
        color: 'rgba(128, 128, 128, 0.4)',
        labelBackgroundColor: '#363a45',
      },
    },
    width: container.clientWidth,
    height: container.clientHeight,
  };
}

const BASELINE_SERIES_OPTIONS = {
  topFillColor1: 'rgba(76, 175, 80, 0.3)',
  topFillColor2: 'rgba(76, 175, 80, 0.05)',
  topLineColor: '#4caf50',
  bottomFillColor1: 'rgba(244, 67, 54, 0.05)',
  bottomFillColor2: 'rgba(244, 67, 54, 0.3)',
  bottomLineColor: '#f44336',
  lineWidth: 2 as const,
};

const Chart: React.FC<ChartProps> = ({ data, loading, error, onRetry }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Baseline'> | null>(null);

  // Create chart on mount, destroy on unmount
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const chart = createChart(container, buildChartOptions(container));
    chartRef.current = chart;

    const series = chart.addSeries(BaselineSeries, {
      ...BASELINE_SERIES_OPTIONS,
      baseValue: { type: 'price', price: 0 },
    });
    seriesRef.current = series;

    // --- ResizeObserver with 100ms debounce ---
    let resizeTimer: ReturnType<typeof setTimeout> | null = null;
    const resizeObserver = new ResizeObserver(() => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (container) {
          chart.applyOptions({
            width: container.clientWidth,
            height: container.clientHeight,
          });
        }
      }, 100);
    });
    resizeObserver.observe(container);

    // --- MutationObserver for theme changes ---
    const mutationObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (
          mutation.type === 'attributes' &&
          mutation.attributeName === 'data-theme'
        ) {
          const { textColor, gridColor } = getThemeColors();
          chart.applyOptions({
            layout: { textColor },
            grid: {
              vertLines: { color: gridColor },
              horzLines: { color: gridColor },
            },
          });
          break;
        }
      }
    });
    mutationObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    // Cleanup
    return () => {
      mutationObserver.disconnect();
      resizeObserver.disconnect();
      if (resizeTimer) clearTimeout(resizeTimer);
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, []);

  // Update data when it changes
  useEffect(() => {
    const series = seriesRef.current;
    const chart = chartRef.current;
    if (!series || !chart) return;

    if (data.length === 0) {
      series.setData([]);
      return;
    }

    // Set baseValue to first data point so the baseline reflects the starting price
    series.applyOptions({
      baseValue: { type: 'price', price: data[0].value },
    });

    series.setData(data);
    chart.timeScale().fitContent();
  }, [data]);

  const showLoading = loading && data.length === 0;
  const showError = !loading && error && data.length === 0;

  return (
    <div className="chart-container" ref={containerRef}>
      {showLoading && (
        <div className="chart-loading-overlay">
          <span>Loading...</span>
        </div>
      )}
      {showError && (
        <div className="chart-error-overlay">
          <span>{error}</span>
          {onRetry && <button className="chart-retry-btn" onClick={onRetry}>Retry</button>}
        </div>
      )}
    </div>
  );
};

export default Chart;
