export type WeatherSceneKind = 'sunny' | 'cloudy' | 'overcast' | 'rain' | 'snow' | 'fog' | 'wind';

export interface WeatherNow {
  temp: string;
  feelsLike: string;
  text: string;
  icon: string;
  windDir: string;
  windScale: string;
  humidity: string;
}

export interface WeatherForecastDay {
  fxDate: string;
  tempMin: string;
  tempMax: string;
  textDay: string;
  iconDay: string;
}

export interface WeatherData {
  city: string;
  adm: string;
  now: WeatherNow;
  forecast: WeatherForecastDay[];
  scene?: WeatherSceneKind;
  cached?: boolean;
  fallback?: boolean;
  fallbackReason?: string;
}

export function getWeatherScene(iconCode?: string, text = ''): WeatherSceneKind {
  const code = Number.parseInt(iconCode || '', 10);
  const label = text.toLowerCase();

  if ((code >= 300 && code <= 399) || /雨|rain|shower|storm/.test(label)) return 'rain';
  if ((code >= 400 && code <= 499) || /雪|snow|sleet/.test(label)) return 'snow';
  if ((code >= 500 && code <= 599) || /雾|霾|沙|尘|fog|haze|dust/.test(label)) return 'fog';
  if ((code >= 200 && code <= 299) || /风|wind|gale/.test(label)) return 'wind';
  if (code === 104 || /阴|overcast/.test(label)) return 'overcast';
  if ((code >= 101 && code <= 103) || /云|cloud/.test(label)) return 'cloudy';
  return 'sunny';
}

export function getWeatherSceneLabel(scene: WeatherSceneKind): string {
  const labels: Record<WeatherSceneKind, string> = {
    sunny: '晴朗',
    cloudy: '多云',
    overcast: '阴天',
    rain: '雨幕',
    snow: '降雪',
    fog: '雾霾',
    wind: '有风',
  };
  return labels[scene];
}

export function formatDayName(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  if (date.toDateString() === today.toDateString()) return '今天';

  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  if (date.toDateString() === tomorrow.toDateString()) return '明天';

  const dayAfterTomorrow = new Date();
  dayAfterTomorrow.setDate(today.getDate() + 2);
  if (date.toDateString() === dayAfterTomorrow.toDateString()) return '后天';

  const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  return days[date.getDay()];
}
