import React from "react";
import "./TimeRange.css";

interface TimeRangeProps {
  selected: string;
  onSelect: (range: string) => void;
}

const RANGES: { label: string; value: string }[] = [
  { label: "24H", value: "1" },
  { label: "1W", value: "7" },
  { label: "1M", value: "30" },
  { label: "1Y", value: "365" },
];

const TimeRange: React.FC<TimeRangeProps> = ({ selected, onSelect }) => {
  return (
    <div className="time-range">
      {RANGES.map((range) => (
        <button
          key={range.value}
          className={`time-range__btn ${
            range.value === selected ? "time-range__btn--active" : ""
          }`}
          onClick={() => onSelect(range.value)}
          type="button"
        >
          {range.label}
        </button>
      ))}
    </div>
  );
};

export default TimeRange;
