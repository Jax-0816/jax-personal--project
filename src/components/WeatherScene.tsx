import { getWeatherScene, getWeatherSceneLabel, type WeatherData } from '../utils/weatherScene';
import type { CSSProperties } from 'react';

interface WeatherSceneProps {
  weather: WeatherData | null;
  loading: boolean;
  error: boolean;
}

function toNumber(value: string | undefined, fallback: number) {
  const parsed = Number.parseFloat(value || '');
  return Number.isFinite(parsed) ? parsed : fallback;
}

export default function WeatherScene({ weather, loading, error }: WeatherSceneProps) {
  const scene = weather?.scene || getWeatherScene(weather?.now.icon, weather?.now.text);
  const temp = toNumber(weather?.now.temp, 18);
  const humidity = toNumber(weather?.now.humidity, 48);
  const windScale = toNumber(weather?.now.windScale, 2);
  const warmth = Math.max(0, Math.min(1, (temp + 8) / 44));
  const moisture = Math.max(0.18, Math.min(1, humidity / 100));
  const wind = Math.max(0.7, Math.min(1.8, windScale / 3));

  return (
    <div
      className={`weather-scene weather-scene-${scene}${loading ? ' weather-scene-loading' : ''}${error ? ' weather-scene-error' : ''}`}
      style={{
        '--weather-warmth': warmth,
        '--weather-moisture': moisture,
        '--weather-wind': wind,
      } as CSSProperties}
      aria-hidden="true"
    >
      <div className="weather-scene-sky" />
      <div className="weather-scene-sun" />
      <div className="weather-scene-cloud weather-scene-cloud-a" />
      <div className="weather-scene-cloud weather-scene-cloud-b" />
      <div className="weather-scene-rain" />
      <div className="weather-scene-snow" />
      <div className="weather-scene-fog" />
      <div className="weather-scene-wind" />
      <div className="weather-scene-grid" />
      <span className="weather-scene-label">{weather ? getWeatherSceneLabel(scene) : '天气场景'}</span>
    </div>
  );
}
