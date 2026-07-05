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
const NOTES_DIR = path.join(PROJECT_DIR, 'notes');
const NOTES_META_FILE = path.join(NOTES_DIR, '_metadata.json');
const NOTE_DOCUMENTS_DIR = path.join(NOTES_DIR, 'documents');

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

if (!fs.existsSync(NOTES_DIR)) {
  fs.mkdirSync(NOTES_DIR, { recursive: true });
}

if (!fs.existsSync(NOTE_DOCUMENTS_DIR)) {
  fs.mkdirSync(NOTE_DOCUMENTS_DIR, { recursive: true });
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

function loadNotesMetadata() {
  try {
    if (fs.existsSync(NOTES_META_FILE)) {
      const raw = fs.readFileSync(NOTES_META_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      return {
        pinnedIds: Array.isArray(parsed?.pinnedIds)
          ? parsed.pinnedIds.filter((item) => typeof item === 'string')
          : [],
      };
    }
  } catch { /* ignore */ }

  return { pinnedIds: [] };
}

function saveNotesMetadata(meta) {
  fs.writeFileSync(
    NOTES_META_FILE,
    JSON.stringify({ pinnedIds: Array.from(new Set(meta.pinnedIds || [])) }, null, 2),
    'utf-8',
  );
}

function makeDefaultTextName() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  return `粘贴文本-${yyyy}${mm}${dd}-${hh}${min}.txt`;
}

function normalizeTextDocumentName(name) {
  const raw = String(name || '').trim() || makeDefaultTextName();
  const safe = raw.replace(/[\\/:*?"<>|]/g, '-').slice(0, 120);
  return path.extname(safe).toLowerCase() === '.txt' ? safe : `${safe}.txt`;
}

function normalizeNoteDocumentName(name) {
  const raw = String(name || '').trim() || makeDefaultTextName();
  const withoutExt = raw.replace(/\.(txt|md|markdown)$/i, '');
  const safe = withoutExt.replace(/[\\/:*?"<>|]/g, '-').replace(/\s+/g, ' ').trim().slice(0, 120);
  return `${safe || path.basename(makeDefaultTextName(), '.txt')}.md`;
}

function makeNoteDocumentId(name) {
  const baseName = path.basename(normalizeNoteDocumentName(name), '.md');
  const slug = baseName
    .replace(/[\\/:*?"<>|]/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80) || 'text-document';
  const date = new Date();
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}${mm}${dd}-${slug}`;
}

function ensureUniqueNoteDocumentId(baseId, currentId = null) {
  let candidate = baseId;
  let index = 2;

  while (candidate !== currentId && fs.existsSync(path.join(NOTE_DOCUMENTS_DIR, `${candidate}.md`))) {
    candidate = `${baseId}-${index}`;
    index += 1;
  }

  return candidate;
}

function isNoteDocumentId(id) {
  return String(id || '').startsWith('note:');
}

function stripNoteDocumentPrefix(id) {
  return String(id || '').replace(/^note:/, '');
}

function getNoteDocumentPath(id) {
  return path.join(NOTE_DOCUMENTS_DIR, `${stripNoteDocumentPrefix(id)}.md`);
}

function buildNoteDocumentItem(id) {
  const cleanId = stripNoteDocumentPrefix(id);
  const filePath = getNoteDocumentPath(cleanId);
  const stat = fs.statSync(filePath);
  const name = path.basename(filePath);

  return {
    id: `note:${cleanId}`,
    name,
    filename: path.join('notes', 'documents', name),
    size: stat.size,
    mimetype: 'text/markdown',
    uploadedAt: stat.mtime.toISOString(),
    projectId: null,
    storage: 'notes',
  };
}

function listNoteDocuments() {
  if (!fs.existsSync(NOTE_DOCUMENTS_DIR)) {
    return [];
  }

  return fs
    .readdirSync(NOTE_DOCUMENTS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isFile() && path.extname(entry.name).toLowerCase() === '.md')
    .map((entry) => buildNoteDocumentItem(path.basename(entry.name, '.md')));
}

function sanitizeNoteTitle(title) {
  return String(title || '')
    .trim()
    .replace(/[\\/:*?"<>|]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

function buildNoteBaseId(title) {
  const date = new Date();
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const slug = sanitizeNoteTitle(title) || 'note';
  return `${yyyy}${mm}${dd}-${slug}`;
}

function ensureUniqueNoteId(baseId, currentId = null) {
  let candidate = baseId;
  let index = 2;

  while (candidate !== currentId && fs.existsSync(path.join(NOTES_DIR, `${candidate}.md`))) {
    candidate = `${baseId}-${index}`;
    index += 1;
  }

  return candidate;
}

function serializeNote(title, content) {
  return `# ${String(title).trim()}\n\n${String(content).trim()}\n`;
}

function parseNoteFile(id) {
  const filePath = path.join(NOTES_DIR, `${id}.md`);
  const raw = fs.readFileSync(filePath, 'utf-8');
  const stat = fs.statSync(filePath);
  const lines = raw.split(/\r?\n/);

  let title = id;
  let content = raw.trim();

  if (lines[0]?.startsWith('# ')) {
    title = lines[0].replace(/^#\s+/, '').trim() || id;
    const body = lines.slice(1);
    while (body[0] === '') {
      body.shift();
    }
    content = body.join('\n').trim();
  }

  return {
    id,
    title,
    content,
    updatedAt: stat.mtime.toISOString(),
    pinned: false,
  };
}

function listNotes() {
  const notesMeta = loadNotesMetadata();
  const pinnedIndexMap = new Map(notesMeta.pinnedIds.map((item, index) => [item, index]));
  const files = fs
    .readdirSync(NOTES_DIR, { withFileTypes: true })
    .filter((entry) => entry.isFile() && path.extname(entry.name).toLowerCase() === '.md')
    .map((entry) => path.parse(entry.name).name)
    .map((id) => {
      const note = parseNoteFile(id);
      note.pinned = pinnedIndexMap.has(id);
      return note;
    });

  files.sort((a, b) => {
    if (a.pinned !== b.pinned) {
      return a.pinned ? -1 : 1;
    }
    if (a.pinned && b.pinned) {
      return (pinnedIndexMap.get(a.id) ?? Number.MAX_SAFE_INTEGER) - (pinnedIndexMap.get(b.id) ?? Number.MAX_SAFE_INTEGER);
    }
    return new Date(b.updatedAt) - new Date(a.updatedAt);
  });

  const validIds = new Set(files.map((note) => note.id));
  const normalizedPinnedIds = notesMeta.pinnedIds.filter((id) => validIds.has(id));
  if (normalizedPinnedIds.length !== notesMeta.pinnedIds.length) {
    saveNotesMetadata({ pinnedIds: normalizedPinnedIds });
  }

  return files;
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

app.get('/api/notes', (_req, res) => {
  try {
    const notes = listNotes().map(({ id, title, updatedAt, pinned }) => ({ id, title, updatedAt, pinned }));
    res.json(notes);
  } catch (err) {
    console.error('List notes error:', err);
    res.status(500).json({ error: 'Failed to list notes' });
  }
});

app.get('/api/notes/:id', (req, res) => {
  try {
    const filePath = path.join(NOTES_DIR, `${req.params.id}.md`);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Note not found' });
    }

    const note = parseNoteFile(req.params.id);
    note.pinned = loadNotesMetadata().pinnedIds.includes(req.params.id);
    res.json(note);
  } catch (err) {
    console.error('Read note error:', err);
    res.status(500).json({ error: 'Failed to read note' });
  }
});

app.post('/api/notes', (req, res) => {
  try {
    const title = String(req.body?.title || '').trim();
    const content = String(req.body?.content || '').trim();

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const id = ensureUniqueNoteId(buildNoteBaseId(title));
    const filePath = path.join(NOTES_DIR, `${id}.md`);
    fs.writeFileSync(filePath, serializeNote(title, content), 'utf-8');

    res.status(201).json(parseNoteFile(id));
  } catch (err) {
    console.error('Create note error:', err);
    res.status(500).json({ error: 'Failed to create note' });
  }
});

app.patch('/api/notes/:id', (req, res) => {
  try {
    const currentId = req.params.id;
    const currentPath = path.join(NOTES_DIR, `${currentId}.md`);
    if (!fs.existsSync(currentPath)) {
      return res.status(404).json({ error: 'Note not found' });
    }

    const title = String(req.body?.title || '').trim();
    const content = String(req.body?.content || '').trim();

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const nextId = ensureUniqueNoteId(buildNoteBaseId(title), currentId);
    const nextPath = path.join(NOTES_DIR, `${nextId}.md`);
    fs.writeFileSync(currentPath, serializeNote(title, content), 'utf-8');

    if (nextId !== currentId) {
      const notesMeta = loadNotesMetadata();
      notesMeta.pinnedIds = notesMeta.pinnedIds.map((item) => (item === currentId ? nextId : item));
      saveNotesMetadata(notesMeta);
      fs.renameSync(currentPath, nextPath);
    }

    const note = parseNoteFile(nextId);
    note.pinned = loadNotesMetadata().pinnedIds.includes(nextId);
    res.json(note);
  } catch (err) {
    console.error('Update note error:', err);
    res.status(500).json({ error: 'Failed to update note' });
  }
});

app.patch('/api/notes/:id/pin', (req, res) => {
  try {
    const id = req.params.id;
    const filePath = path.join(NOTES_DIR, `${id}.md`);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Note not found' });
    }

    const pinned = Boolean(req.body?.pinned);
    const notesMeta = loadNotesMetadata();
    const pinnedIds = notesMeta.pinnedIds.filter((item) => item !== id);

    if (pinned) {
      pinnedIds.unshift(id);
    }

    saveNotesMetadata({ pinnedIds });

    const note = parseNoteFile(id);
    note.pinned = pinned;
    res.json(note);
  } catch (err) {
    console.error('Pin note error:', err);
    res.status(500).json({ error: 'Failed to update pin status' });
  }
});

app.delete('/api/notes/:id', (req, res) => {
  try {
    const filePath = path.join(NOTES_DIR, `${req.params.id}.md`);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Note not found' });
    }

    fs.unlinkSync(filePath);
    const notesMeta = loadNotesMetadata();
    saveNotesMetadata({ pinnedIds: notesMeta.pinnedIds.filter((item) => item !== req.params.id) });
    res.json({ success: true });
  } catch (err) {
    console.error('Delete note error:', err);
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

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

// POST /api/documents/text — create a plain-text document from pasted content
app.post('/api/documents/text', (req, res) => {
  try {
    const content = String(req.body?.content || '').trim();
    if (!content) {
      return res.status(400).json({ error: 'Text content is required' });
    }

    const name = normalizeNoteDocumentName(req.body?.name);
    const id = ensureUniqueNoteDocumentId(makeNoteDocumentId(name));
    const filePath = path.join(NOTE_DOCUMENTS_DIR, `${id}.md`);
    const buffer = Buffer.from(content, 'utf8');
    fs.writeFileSync(filePath, buffer);

    res.status(201).json(buildNoteDocumentItem(id));
  } catch (err) {
    console.error('Text document create error:', err);
    res.status(500).json({ error: 'Create text document failed' });
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
    docs = [...docs, ...listNoteDocuments()];
  }
  docs.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
  res.json(docs);
});

// GET /api/documents/:id — download a document
app.get('/api/documents/:id', (req, res) => {
  if (isNoteDocumentId(req.params.id)) {
    const filePath = getNoteDocumentPath(req.params.id);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found on disk' });
    }

    const doc = buildNoteDocumentItem(req.params.id);
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(doc.name)}`);
    res.setHeader('Content-Type', doc.mimetype);
    return fs.createReadStream(filePath).pipe(res);
  }

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
    if (isNoteDocumentId(req.params.id)) {
      const currentId = stripNoteDocumentPrefix(req.params.id);
      const currentPath = getNoteDocumentPath(currentId);
      if (!fs.existsSync(currentPath)) {
        return res.status(404).json({ error: 'File not found on disk' });
      }

      let nextId = currentId;
      let nextPath = currentPath;

      if (req.body.hasOwnProperty('name')) {
        const nextName = normalizeNoteDocumentName(req.body.name);
        nextId = ensureUniqueNoteDocumentId(makeNoteDocumentId(nextName), currentId);
        nextPath = path.join(NOTE_DOCUMENTS_DIR, `${nextId}.md`);
      }

      if (req.body.hasOwnProperty('content')) {
        const content = String(req.body.content || '').trim();
        if (!content) {
          return res.status(400).json({ error: 'Text content is required' });
        }
        fs.writeFileSync(currentPath, content, 'utf8');
      }

      if (nextId !== currentId) {
        fs.renameSync(currentPath, nextPath);
      }

      return res.json(buildNoteDocumentItem(nextId));
    }

    const docs = loadMetadata();
    const doc = docs.find((d) => d.id === req.params.id);
    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }

    if (req.body.hasOwnProperty('projectId')) {
      doc.projectId = req.body.projectId;
    }

    if (req.body.hasOwnProperty('content') || req.body.hasOwnProperty('name')) {
      if (!String(doc.mimetype || '').includes('text')) {
        return res.status(400).json({ error: 'Only text documents can be edited' });
      }

      const filePath = path.join(UPLOADS_DIR, doc.filename);
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'File not found on disk' });
      }

      if (req.body.hasOwnProperty('name')) {
        doc.name = normalizeTextDocumentName(req.body.name);
      }

      if (req.body.hasOwnProperty('content')) {
        const content = String(req.body.content || '').trim();
        if (!content) {
          return res.status(400).json({ error: 'Text content is required' });
        }
        const buffer = Buffer.from(content, 'utf8');
        fs.writeFileSync(filePath, buffer);
        doc.size = buffer.length;
      }

      doc.uploadedAt = new Date().toISOString();
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
  if (isNoteDocumentId(req.params.id)) {
    const filePath = getNoteDocumentPath(req.params.id);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Document not found' });
    }

    fs.unlinkSync(filePath);
    return res.json({ success: true });
  }

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
