import React, { useState, useEffect } from "react";
import "./RefreshButton.css";

interface RefreshButtonProps {
  onRefresh: () => void;
  loading: boolean;
  lastUpdated: Date | null;
}

function getSecondsAgo(date: Date | null): number | null {
  if (!date) return null;
  return Math.floor((Date.now() - date.getTime()) / 1000);
}

function formatTimeAgo(seconds: number | null): string {
  if (seconds === null) return "";
  if (seconds < 60) return `Updated ${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `Updated ${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `Updated ${hours}h ago`;
}

const RefreshButton: React.FC<RefreshButtonProps> = ({
  onRefresh,
  loading,
  lastUpdated,
}) => {
  const [secondsAgo, setSecondsAgo] = useState<number | null>(
    getSecondsAgo(lastUpdated)
  );

  useEffect(() => {
    setSecondsAgo(getSecondsAgo(lastUpdated));

    if (!lastUpdated) return;

    const interval = setInterval(() => {
      setSecondsAgo(getSecondsAgo(lastUpdated));
    }, 1000);

    return () => clearInterval(interval);
  }, [lastUpdated]);

  return (
    <div className="refresh-button-wrapper">
      <button
        className={`refresh-button ${loading ? "refresh-button--spinning" : ""}`}
        onClick={onRefresh}
        disabled={loading}
        type="button"
        aria-label="Refresh data"
      >
        ↻
      </button>
      {lastUpdated && (
        <span className="refresh-button__text">
          {formatTimeAgo(secondsAgo)}
        </span>
      )}
    </div>
  );
};

export default RefreshButton;
