import React from "react";
import "./ThemeSwitcher.css";

interface ThemeSwitcherProps {
  currentTheme: string;
  onThemeChange: (theme: string) => void;
}

const THEMES = [
  { value: "standard", label: "Standard" },
  { value: "retro", label: "Retro" },
  { value: "futuristic", label: "Futuristic" },
  { value: "vaporwave", label: "Vaporwave" },
  { value: "paper", label: "Paper" },
  { value: "hacker", label: "Hacker" },
];

const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({
  currentTheme,
  onThemeChange,
}) => {
  return (
    <div className="theme-switcher">
      <select
        className="theme-switcher__select"
        value={currentTheme}
        onChange={(e) => onThemeChange(e.target.value)}
        aria-label="Select theme"
      >
        {THEMES.map((theme) => (
          <option key={theme.value} value={theme.value}>
            {theme.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ThemeSwitcher;
