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
  limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB max
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

// GET /api/documents — list all documents, optional ?projectId filter
app.get('/api/documents', (req, res) => {
  let docs = loadMetadata();
  if (req.query.projectId) {
    docs = docs.filter((d) => d.projectId === req.query.projectId);
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
