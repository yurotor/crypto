import React from "react";
import "./CoinSelector.css";

interface Coin {
  id: string;
  symbol: string;
  name: string;
  image: string;
}

interface CoinSelectorProps {
  coins: Coin[];
  selectedCoin: string;
  onSelect: (id: string) => void;
}

const CoinSelector: React.FC<CoinSelectorProps> = ({
  coins,
  selectedCoin,
  onSelect,
}) => {
  return (
    <div className="coin-selector">
      {coins.map((coin) => (
        <button
          key={coin.id}
          className={`coin-selector__pill ${
            coin.id === selectedCoin ? "coin-selector__pill--active" : ""
          }`}
          onClick={() => onSelect(coin.id)}
          type="button"
        >
          <img
            src={coin.image}
            alt={coin.name}
            className="coin-selector__pill-image"
          />
          <span className="coin-selector__pill-symbol">
            {coin.symbol.toUpperCase()}
          </span>
        </button>
      ))}
    </div>
  );
};

export default CoinSelector;
