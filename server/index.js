import express from 'express';
import multer from 'multer';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_DIR = path.resolve(__dirname, '..');
const UPLOADS_DIR = path.join(PROJECT_DIR, 'uploads');
const META_FILE = path.join(UPLOADS_DIR, '_metadata.json');

// Load environment variables from .env manually
function loadEnv() {
  const envPath = path.join(PROJECT_DIR, '.env');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf-8');
    content.split('\n').forEach((line) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        const value = valueParts.join('=').trim();
        process.env[key.trim()] = value;
      }
    });
  }
}
loadEnv();

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Load / save metadata
function loadMetadata() {
  try {
    if (fs.existsSync(META_FILE)) {
      const raw = fs.readFileSync(META_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch { /* ignore */ }
  return [];
}

function saveMetadata(docs) {
  fs.writeFileSync(META_FILE, JSON.stringify(docs, null, 2), 'utf-8');
}

// Multer storage: keep original filename but make it unique
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const id = uuidv4();
    const ext = path.extname(file.originalname);
    cb(null, `${id}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 300 * 1024 * 1024 }, // 300 MB max
});

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 4284;

// POST /api/documents — upload one or more files
app.post('/api/documents', upload.array('files', 20), (req, res) => {
  try {
    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const projectId = req.body.projectId || null;
    const docs = loadMetadata();
    const newDocs = files.map((file) => {
      const doc = {
        id: path.parse(file.filename).name,
        name: Buffer.from(file.originalname, 'latin1').toString('utf8'),
        filename: file.filename,
        size: file.size,
        mimetype: file.mimetype,
        uploadedAt: new Date().toISOString(),
        projectId,
      };
      docs.push(doc);
      return doc;
    });

    saveMetadata(docs);
    res.status(201).json(newDocs);
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Weather cache store
const weatherCache = new Map();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes in milliseconds

function getWeatherScene(iconCode = '', text = '') {
  const code = Number.parseInt(iconCode, 10);
  const label = String(text).toLowerCase();

  if ((code >= 300 && code <= 399) || /雨|rain|shower|storm/.test(label)) return 'rain';
  if ((code >= 400 && code <= 499) || /雪|snow|sleet/.test(label)) return 'snow';
  if ((code >= 500 && code <= 599) || /雾|霾|沙|尘|fog|haze|dust/.test(label)) return 'fog';
  if ((code >= 200 && code <= 299) || /风|wind|gale/.test(label)) return 'wind';
  if (code === 104 || /阴|overcast/.test(label)) return 'overcast';
  if ((code >= 101 && code <= 103) || /云|cloud/.test(label)) return 'cloudy';
  return 'sunny';
}

function hashText(value) {
  return Array.from(value || '深圳').reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

function getFallbackProfile(locationQuery) {
  const profiles = [
    { scene: 'sunny', text: '晴', icon: '100', temp: 22, feelsLike: 23, humidity: 42, windDir: '东南风', windScale: '2' },
    { scene: 'cloudy', text: '多云', icon: '101', temp: 20, feelsLike: 20, humidity: 55, windDir: '东风', windScale: '2' },
    { scene: 'overcast', text: '阴', icon: '104', temp: 18, feelsLike: 18, humidity: 62, windDir: '东北风', windScale: '3' },
    { scene: 'rain', text: '小雨', icon: '305', temp: 17, feelsLike: 16, humidity: 82, windDir: '北风', windScale: '3' },
    { scene: 'wind', text: '有风', icon: '200', temp: 19, feelsLike: 18, humidity: 48, windDir: '西北风', windScale: '4' },
  ];
  return profiles[hashText(locationQuery) % profiles.length];
}

function addDays(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function getFallbackWeather(locationQuery, reason) {
  const city = locationQuery || '深圳';
  const profile = getFallbackProfile(city);
  const temp = profile.temp;

  return {
    city,
    adm: '本地场景',
    now: {
      temp: String(temp),
      feelsLike: String(profile.feelsLike),
      text: profile.text,
      icon: profile.icon,
      windDir: profile.windDir,
      windScale: profile.windScale,
      humidity: String(profile.humidity),
    },
    forecast: [0, 1, 2].map((day) => ({
      fxDate: addDays(day),
      tempMin: String(temp - 4 + day),
      tempMax: String(temp + 3 + day),
      textDay: day === 0 ? profile.text : day === 1 ? '多云' : '晴',
      iconDay: day === 0 ? profile.icon : day === 1 ? '101' : '100',
    })),
    scene: profile.scene,
    cached: false,
    fallback: true,
    fallbackReason: reason,
  };
}

// GET /api/weather — fetch weather from QWeather API securely (with 30-min cache)
app.get('/api/weather', async (req, res) => {
  const key = process.env.VITE_QWEATHER_KEY;
  const rawHost = process.env.VITE_QWEATHER_HOST || '';
  const host = rawHost.trim().replace(/^https?:\/\//i, ''); // Strip protocol if user enters it
  const locationQuery = (req.query.location || '深圳').trim();

  if (!key) {
    return res.json(getFallbackWeather(locationQuery, 'Weather API key is not configured'));
  }

  const cacheKey = locationQuery.toLowerCase();
  const cached = weatherCache.get(cacheKey);
  const now = Date.now();

  // If cache is valid, return cached data immediately
  if (cached && (now - cached.timestamp < CACHE_TTL)) {
    return res.json({ ...cached.data, cached: true });
  }

  try {
    // 1. Lookup location ID
    // Under custom API Host, the GeoAPI lookup is nested under /geo path
    const geoUrl = host
      ? `https://${host}/geo/v2/city/lookup?location=${encodeURIComponent(locationQuery)}&key=${key}`
      : `https://geoapi.qweather.com/v2/city/lookup?location=${encodeURIComponent(locationQuery)}&key=${key}`;

    const geoRes = await fetch(geoUrl);
    if (!geoRes.ok) {
      return res.json(getFallbackWeather(locationQuery, 'City lookup failed'));
    }
    const geoData = await geoRes.json();
    if (!geoData.location || geoData.location.length === 0) {
      return res.json(getFallbackWeather(locationQuery, 'City not found'));
    }

    const city = geoData.location[0].name;
    const locationId = geoData.location[0].id;
    const adm = geoData.location[0].adm2 || geoData.location[0].adm1;

    // 2. Fetch current weather and 3-day forecast in parallel
    const nowUrl = host
      ? `https://${host}/v7/weather/now?location=${locationId}&key=${key}`
      : `https://devapi.qweather.com/v7/weather/now?location=${locationId}&key=${key}`;

    const forecastUrl = host
      ? `https://${host}/v7/weather/3d?location=${locationId}&key=${key}`
      : `https://devapi.qweather.com/v7/weather/3d?location=${locationId}&key=${key}`;

    const [nowRes, forecastRes] = await Promise.all([fetch(nowUrl), fetch(forecastUrl)]);

    if (!nowRes.ok || !forecastRes.ok) {
      // Degraded fallback: if fetch fails but we have expired cache, return it
      if (cached) {
        console.warn(`Fetch failed, using expired cache for: ${locationQuery}`);
        return res.json({ ...cached.data, cached: true });
      }
      return res.json(getFallbackWeather(locationQuery, 'Failed to fetch weather data'));
    }

    const nowData = await nowRes.json();
    const forecastData = await forecastRes.json();

    const weatherData = {
      city,
      adm,
      now: nowData.now,
      forecast: forecastData.daily,
      scene: getWeatherScene(nowData.now?.icon, nowData.now?.text),
      cached: false,
      fallback: false,
    };

    // Store in cache
    weatherCache.set(cacheKey, {
      timestamp: now,
      data: weatherData,
    });

    res.json(weatherData);
  } catch (err) {
    console.error('Weather fetch error:', err);
    // Degraded fallback: if catch error but we have expired cache, return it
    if (cached) {
      console.warn(`Fetch error occurred, using expired cache for: ${locationQuery}`);
      return res.json({ ...cached.data, cached: true });
    }
    res.json(getFallbackWeather(locationQuery, 'Weather fetch failed'));
  }
});

// GET /api/documents — list all documents, optional ?projectId filter
app.get('/api/documents', (req, res) => {
  let docs = loadMetadata();
  if (req.query.projectId) {
    docs = docs.filter((d) => d.projectId === req.query.projectId);
  } else {
    // 独立技能库：如果没有指定 projectId，说明请求的是全局（技能库）文件
    // 此时需过滤掉所有关联了 projectId 的项目文件
    docs = docs.filter((d) => !d.projectId);
  }
  docs.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
  res.json(docs);
});

// GET /api/documents/:id — download a document
app.get('/api/documents/:id', (req, res) => {
  const docs = loadMetadata();
  const doc = docs.find((d) => d.id === req.params.id);
  if (!doc) {
    return res.status(404).json({ error: 'Document not found' });
  }

  const filePath = path.join(UPLOADS_DIR, doc.filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found on disk' });
  }

  res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(doc.name)}`);
  res.setHeader('Content-Type', doc.mimetype || 'application/octet-stream');
  fs.createReadStream(filePath).pipe(res);
});

// PATCH /api/documents/:id — update document metadata (e.g. projectId)
app.patch('/api/documents/:id', (req, res) => {
  try {
    const docs = loadMetadata();
    const doc = docs.find((d) => d.id === req.params.id);
    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }

    if (req.body.hasOwnProperty('projectId')) {
      doc.projectId = req.body.projectId;
    }

    saveMetadata(docs);
    res.json(doc);
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ error: 'Update failed' });
  }
});

// DELETE /api/documents/:id — delete a document
app.delete('/api/documents/:id', (req, res) => {
  const docs = loadMetadata();
  const index = docs.findIndex((d) => d.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Document not found' });
  }

  const doc = docs[index];
  const filePath = path.join(UPLOADS_DIR, doc.filename);

  // Remove from disk
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  // Remove from metadata
  docs.splice(index, 1);
  saveMetadata(docs);

  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`📄 文档服务器已启动 → http://localhost:${PORT}`);
});
