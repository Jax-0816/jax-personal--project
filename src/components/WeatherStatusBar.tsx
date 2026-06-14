import { useEffect, useState, type CSSProperties, type FormEvent } from 'react';
import { formatDayName, getWeatherScene, getWeatherSceneLabel, type WeatherData } from '../utils/weatherScene';

interface WeatherStatusBarProps {
  onWeatherChange?: (weather: WeatherData | null) => void;
  onLoadingChange?: (loading: boolean) => void;
  onErrorChange?: (error: boolean) => void;
}

function toNumber(value: string | undefined, fallback: number) {
  const parsed = Number.parseFloat(value || '');
  return Number.isFinite(parsed) ? parsed : fallback;
}

export default function WeatherStatusBar({ onWeatherChange, onLoadingChange, onErrorChange }: WeatherStatusBarProps) {
  const [cityInput, setCityInput] = useState('');
  const [queryCity, setQueryCity] = useState('深圳');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let active = true;

    const fetchWeather = async () => {
      setLoading(true);
      setErrorMessage('');
      onLoadingChange?.(true);
      onErrorChange?.(false);

      try {
        const res = await fetch(`/api/weather?location=${encodeURIComponent(queryCity)}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.error || '天气信息同步失败');
        }

        if (active) {
          const nextWeather = data as WeatherData;
          setWeather(nextWeather);
          onWeatherChange?.(nextWeather);
        }
      } catch (err) {
        if (active) {
          setErrorMessage(err instanceof Error ? err.message : '天气信息同步失败');
          onErrorChange?.(true);
          onWeatherChange?.(null);
        }
      } finally {
        if (active) {
          setLoading(false);
          onLoadingChange?.(false);
        }
      }
    };

    fetchWeather();

    return () => {
      active = false;
    };
  }, [onErrorChange, onLoadingChange, onWeatherChange, queryCity]);

  const handleSearch = (event: FormEvent) => {
    event.preventDefault();
    const nextCity = cityInput.trim();
    if (!nextCity) return;
    setQueryCity(nextCity);
    setCityInput('');
  };

  const scene = weather?.scene || getWeatherScene(weather?.now.icon, weather?.now.text);
  const statusText = loading ? '同步中' : weather?.fallback ? '降级' : weather?.cached ? '缓存' : '实时';
  const temp = toNumber(weather?.now.temp, 20);
  const humidity = toNumber(weather?.now.humidity, 55);
  const windScale = toNumber(weather?.now.windScale, 2);
  const warmth = Math.max(0, Math.min(1, (temp + 8) / 44));
  const moisture = Math.max(0.15, Math.min(1, humidity / 100));
  const wind = Math.max(0.7, Math.min(2, windScale / 3));

  return (
    <aside
      id="weather-scene-panel"
      className={`weather-panel weather-panel-${scene}${loading ? ' weather-panel-loading' : ''}${errorMessage ? ' weather-panel-error' : ''}`}
      style={{
        '--panel-warmth': warmth,
        '--panel-moisture': moisture,
        '--panel-wind': wind,
      } as CSSProperties}
    >
      <div className="weather-panel-atmosphere" aria-hidden="true">
        <span className="weather-panel-sun" />
        <span className="weather-panel-cloud weather-panel-cloud-a" />
        <span className="weather-panel-cloud weather-panel-cloud-b" />
        <span className="weather-panel-rain" />
        <span className="weather-panel-snow" />
        <span className="weather-panel-fog" />
        <span className="weather-panel-wind" />
      </div>

      <div className="weather-panel-top">
        <div>
          <span className="weather-panel-kicker">Weather Scene</span>
          <h2>{weather ? `${weather.city} ${getWeatherSceneLabel(scene)}` : '天气场景'}</h2>
        </div>
        <span className="weather-panel-status">{statusText}</span>
      </div>

      <form className="weather-city-form" onSubmit={handleSearch}>
        <label htmlFor="weather-city-input">切换城市</label>
        <div className="weather-city-controls">
          <input
            id="weather-city-input"
            type="text"
            placeholder="输入城市，例如 上海"
            value={cityInput}
            onChange={(event) => setCityInput(event.target.value)}
          />
          <button type="submit">同步场景</button>
        </div>
      </form>

      {errorMessage ? (
        <div className="weather-panel-message">
          <strong>天气信息暂不可用</strong>
          <span>{errorMessage}</span>
        </div>
      ) : null}

      {weather?.fallback ? (
        <div className="weather-panel-message weather-panel-fallback">
          <strong>使用本地天气场景</strong>
          <span>实时接口暂不可用，当前为降级展示。</span>
        </div>
      ) : null}

      {weather ? (
        <>
          <div className="weather-panel-current">
            <span className="weather-panel-temp">{weather.now.temp}°</span>
            <div>
              <strong>{weather.now.text}</strong>
              <span>{weather.adm}，体感 {weather.now.feelsLike}°</span>
            </div>
          </div>

          <dl className="weather-panel-meta">
            <div>
              <dt>风</dt>
              <dd>{weather.now.windDir} {weather.now.windScale}级</dd>
            </div>
            <div>
              <dt>湿度</dt>
              <dd>{weather.now.humidity}%</dd>
            </div>
            <div>
              <dt>场景</dt>
              <dd>{getWeatherSceneLabel(scene)}</dd>
            </div>
          </dl>

          <div className="weather-panel-forecast" aria-label="三日预报">
            {weather.forecast.slice(0, 3).map((day) => (
              <div key={day.fxDate}>
                <span>{formatDayName(day.fxDate)}</span>
                <strong>{day.textDay}</strong>
                <small>{day.tempMin}° ~ {day.tempMax}°</small>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="weather-panel-empty">
          <strong>{loading ? '正在同步深圳天气' : '等待天气数据'}</strong>
          <span>场景会根据天气、温度、湿度和风力自动变化。</span>
        </div>
      )}
    </aside>
  );
}
