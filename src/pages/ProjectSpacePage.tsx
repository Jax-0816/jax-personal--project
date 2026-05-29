import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useEditableProjects } from '../hooks/useEditableProjects';

interface DocItem {
  id: string;
  name: string;
  filename: string;
  size: number;
  mimetype: string;
  uploadedAt: string;
  projectId: string | null;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ProjectSpacePage() {
  const { id } = useParams();
  const { projects } = useEditableProjects();
  const project = projects.find((item) => item.id === id);

  const [docs, setDocs] = useState<DocItem[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDocs = useCallback(async () => {
    if (!id) return;
    try {
      const res = await fetch(`/api/documents?projectId=${encodeURIComponent(id)}`);
      if (res.ok) setDocs(await res.json());
    } catch { /* ignore */ }
  }, [id]);

  useEffect(() => {
    fetchDocs();
  }, [fetchDocs]);

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      if (files.length === 0 || !id) return;
      setUploading(true);
      const form = new FormData();
      Array.from(files).forEach((f) => form.append('files', f));
      form.append('projectId', id);
      try {
        await fetch('/api/documents', { method: 'POST', body: form });
        await fetchDocs();
      } catch { /* ignore */ }
      setUploading(false);
    },
    [id, fetchDocs],
  );

  const handleDelete = useCallback(
    async (docId: string) => {
      try {
        await fetch(`/api/documents/${docId}`, { method: 'DELETE' });
        setDocs((prev) => prev.filter((d) => d.id !== docId));
      } catch { /* ignore */ }
    },
    [],
  );

  if (!project) {
    return (
      <section className="page-section inner-page space-page">
        <p className="eyebrow">Space not found</p>
        <h1>没有找到这个项目空间</h1>
        <Link to="/projects" className="text-link">返回项目列表</Link>
      </section>
    );
  }

  return (
    <section className="page-section inner-page space-page">
      <Link to="/projects" className="text-link">← 返回项目列表</Link>

      <div className="space-hero">
        <p className="eyebrow">{project.category} / {project.year} / {project.status}</p>
        <h1>{project.title}</h1>
        <p className="space-lead">{project.summary}</p>
      </div>

      <div className="space-grid">
        <article className="glass-panel space-panel">
          <span className="space-panel-eyebrow">项目要点</span>
          <ul>
            {project.details.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <article className="glass-panel space-panel">
          <span className="space-panel-eyebrow">当前指标</span>
          <ul>
            {project.metrics.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <article className="glass-panel space-panel space-upload">
          <span className="space-panel-eyebrow">项目文档</span>
          <div
            className={`space-drop-zone ${dragOver ? 'drag-over' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={(e) => { e.preventDefault(); setDragOver(false); }}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
            onClick={() => fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            aria-label="上传项目文档"
          >
            <span className="space-drop-icon">+</span>
            <span>{uploading ? '上传中...' : '点击或拖拽上传文档'}</span>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            hidden
            onChange={(e) => { if (e.target.files) handleFiles(e.target.files); e.target.value = ''; }}
          />

          {docs.length > 0 ? (
            <div className="space-docs-list">
              {docs.map((doc) => (
                <div key={doc.id} className="space-doc-item">
                  <a
                    className="space-doc-name"
                    href={`/api/documents/${doc.id}`}
                    download={doc.name}
                    title={doc.name}
                  >
                    {doc.name}
                  </a>
                  <span className="space-doc-meta">{formatSize(doc.size)}</span>
                  <button
                    type="button"
                    className="space-doc-delete"
                    onClick={() => { if (window.confirm('删除这个文档？')) handleDelete(doc.id); }}
                    aria-label="删除文档"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="space-hint" style={{ marginTop: 16, marginBottom: 0 }}>
              还没有上传文档。
            </p>
          )}
        </article>
      </div>

      {project.githubUrl ? (
        <a className="text-link space-github" href={project.githubUrl} target="_blank" rel="noreferrer">
          查看 GitHub →
        </a>
      ) : null}
    </section>
  );
}
