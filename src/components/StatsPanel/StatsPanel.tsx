import React from "react";
import { formatCurrency, formatCompact, formatPercent } from "../../utils/format";
import "./StatsPanel.css";

interface StatsPanelProps {
  price: number | null;
  percentChange: number | null;
  volume: number | null;
  totalSupply: number | null;
  coinName: string;
  coinSymbol: string;
  coinImage: string;
  loading: boolean;
}

const StatsPanel: React.FC<StatsPanelProps> = ({
  price,
  percentChange,
  volume,
  totalSupply,
  coinName,
  coinSymbol,
  coinImage,
  loading,
}) => {
  const isPositive = percentChange !== null && percentChange >= 0;
  const changeColor = percentChange === null ? undefined : isPositive ? "var(--positive, #16c784)" : "var(--negative, #ea3943)";
  const arrow = percentChange === null ? "" : isPositive ? "▲" : "▼";

  return (
    <div className={`stats-panel ${loading ? "stats-panel--loading" : ""}`}>
      {/* Card 1: Coin identity + price */}
      <div className="stats-card stats-card--price">
        <div className="stats-card__coin">
          <img src={coinImage} alt={coinName} className="stats-card__coin-image" />
          <div className="stats-card__coin-info">
            <span className="stats-card__coin-name">{coinName}</span>
            <span className="stats-card__coin-symbol">{coinSymbol.toUpperCase()}</span>
          </div>
        </div>
        <span className="stats-card__price">
          {price !== null ? formatCurrency(price) : "—"}
        </span>
      </div>

      {/* Card 2: Percentage change */}
      <div className="stats-card stats-card--change">
        <span className="stats-card__label">24h Change</span>
        <span className="stats-card__value" style={{ color: changeColor }}>
          {arrow} {formatPercent(percentChange)}
        </span>
      </div>

      {/* Card 3: Volume */}
      <div className="stats-card stats-card--volume">
        <span className="stats-card__label">Volume</span>
        <span className="stats-card__value">
          {volume !== null ? `$${formatCompact(volume)}` : "—"}
        </span>
      </div>

      {/* Card 4: Total Supply */}
      <div className="stats-card stats-card--supply">
        <span className="stats-card__label">Total Supply</span>
        <span className="stats-card__value">{formatCompact(totalSupply)}</span>
      </div>
    </div>
  );
};

export default StatsPanel;
