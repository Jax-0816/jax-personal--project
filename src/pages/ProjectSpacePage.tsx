import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useEditableProjects } from '../hooks/useEditableProjects';
import { formatDate, getCategory } from '../hooks/useDocuments';

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

function typeIcon(category: string): string {
  const map: Record<string, string> = {
    image: '🖼️',
    video: '🎬',
    audio: '🎵',
    pdf: '📄',
    text: '📝',
    archive: '📦',
    other: '📎',
  };
  return map[category] || '📎';
}

function isPreviewable(mimetype: string, filename: string): boolean {
  const normalizedFilename = filename.toLowerCase();
  if (mimetype.startsWith('image/')) return true;
  if (mimetype.includes('pdf')) return true;
  if (mimetype.includes('text') || mimetype.includes('markdown') || mimetype.includes('json')) return true;
  if (normalizedFilename.endsWith('.md') || normalizedFilename.endsWith('.json') || normalizedFilename.endsWith('.txt')) return true;
  return false;
}

export default function ProjectSpacePage() {
  const { id } = useParams();
  const { projects } = useEditableProjects();
  const project = projects.find((item) => item.id === id);

  const [projectDocs, setProjectDocs] = useState<DocItem[]>([]);
  const [sharedDocs, setSharedDocs] = useState<DocItem[]>([]);
  const [activeTab, setActiveTab] = useState<'project' | 'shared'>('project');
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [spaceError, setSpaceError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Previewer State
  const [previewDoc, setPreviewDoc] = useState<DocItem | null>(null);
  const [previewContent, setPreviewContent] = useState<string>('');
  const [loadingPreview, setLoadingPreview] = useState(false);

  const fetchProjectDocs = useCallback(async () => {
    if (!id) return;
    try {
      const res = await fetch(`/api/documents?projectId=${encodeURIComponent(id)}`);
      if (!res.ok) throw new Error('项目文档加载失败');
      if (res.ok) setProjectDocs(await res.json());
    } catch (err) {
      setSpaceError(err instanceof Error ? err.message : '项目文档加载失败');
    }
  }, [id]);

  const fetchSharedDocs = useCallback(async () => {
    try {
      const res = await fetch('/api/documents');
      if (!res.ok) throw new Error('共享文档库加载失败');
      if (res.ok) setSharedDocs(await res.json());
    } catch (err) {
      setSpaceError(err instanceof Error ? err.message : '共享文档库加载失败');
    }
  }, []);

  const refreshAll = useCallback(async () => {
    await Promise.all([fetchProjectDocs(), fetchSharedDocs()]);
  }, [fetchProjectDocs, fetchSharedDocs]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  // Lock body scroll when preview modal is open
  useEffect(() => {
    if (previewDoc) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [previewDoc]);

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      if (files.length === 0 || !id) return;
      setUploading(true);
      const form = new FormData();
      Array.from(files).forEach((f) => form.append('files', f));
      form.append('projectId', id);
      setSpaceError(null);
      try {
        const res = await fetch('/api/documents', { method: 'POST', body: form });
        if (!res.ok) throw new Error('上传项目文件失败');
        await refreshAll();
      } catch (err) {
        setSpaceError(err instanceof Error ? err.message : '上传项目文件失败');
      } finally {
        setUploading(false);
      }
    },
    [id, refreshAll],
  );

  const handleDelete = useCallback(
    async (docId: string) => {
      setSpaceError(null);
      try {
        const res = await fetch(`/api/documents/${docId}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('删除文档失败');
        await refreshAll();
      } catch (err) {
        setSpaceError(err instanceof Error ? err.message : '删除文档失败');
      }
    },
    [refreshAll],
  );

  const handleLinkProject = useCallback(
    async (docId: string, associate: boolean) => {
      setSpaceError(null);
      try {
        const targetProjectId = associate ? id : null;
        const res = await fetch(`/api/documents/${docId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ projectId: targetProjectId }),
        });
        if (!res.ok) throw new Error(associate ? '关联项目失败' : '移至共享库失败');
        await refreshAll();
      } catch (err) {
        setSpaceError(err instanceof Error ? err.message : associate ? '关联项目失败' : '移至共享库失败');
      }
    },
    [id, refreshAll],
  );

  const openPreview = async (doc: DocItem) => {
    if (doc.mimetype.includes('pdf')) {
      // PDF directly opens in a new tab for native preview
      window.open(`/api/documents/${doc.id}`, '_blank');
      return;
    }
    setPreviewDoc(doc);
    if (doc.mimetype.startsWith('image/')) {
      setPreviewContent('');
      return;
    }
    setLoadingPreview(true);
    setPreviewContent('加载中...');
    try {
      const res = await fetch(`/api/documents/${doc.id}`);
      if (res.ok) {
        const text = await res.text();
        setPreviewContent(text);
      } else {
        setPreviewContent('加载预览内容失败。');
      }
    } catch {
      setPreviewContent('加载预览内容出错。');
    } finally {
      setLoadingPreview(false);
    }
  };

  const closePreview = () => {
    setPreviewDoc(null);
    setPreviewContent('');
  };

  if (!project) {
    return (
      <section className="page-section inner-page space-page">
        <p className="eyebrow">Space not found</p>
        <h1>没有找到这个项目空间</h1>
        <Link to="/projects" className="text-link">返回项目列表</Link>
      </section>
    );
  }

  const currentDocs = activeTab === 'project' ? projectDocs : sharedDocs;

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
          <span className="space-panel-eyebrow">项目文档管理</span>
          {spaceError ? <p className="space-error">{spaceError}</p> : null}
          
          {/* Tab Selection */}
          <div className="space-tabs">
            <button 
              type="button" 
              className={`space-tab-btn ${activeTab === 'project' ? 'active' : ''}`}
              onClick={() => setActiveTab('project')}
            >
              项目专属文档 ({projectDocs.length})
            </button>
            <button 
              type="button" 
              className={`space-tab-btn ${activeTab === 'shared' ? 'active' : ''}`}
              onClick={() => setActiveTab('shared')}
            >
              共享文档库 ({sharedDocs.length})
            </button>
          </div>

          {activeTab === 'project' ? (
            <>
              <div
                className={`document-upload-zone ${dragOver ? 'drag-over' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={(e) => { e.preventDefault(); setDragOver(false); }}
                onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
                onClick={() => fileInputRef.current?.click()}
                role="button"
                tabIndex={0}
                aria-label="上传项目文档"
              >
                <span className="document-upload-icon">+</span>
                <p className="document-upload-text">
                  {uploading ? '上传中...' : '拖拽项目文件到此处，或点击选择上传'}
                </p>
                <small className="document-upload-hint">上传的文件将自动绑定至当前项目</small>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                hidden
                onChange={(e) => { if (e.target.files) handleFiles(e.target.files); e.target.value = ''; }}
              />
            </>
          ) : null}

          {currentDocs.length > 0 ? (
            <div className="space-docs-list">
              {currentDocs.map((doc) => {
                const category = getCategory(doc.mimetype);
                const previewable = isPreviewable(doc.mimetype, doc.name);
                return (
                  <div key={doc.id} className="space-doc-item">
                    <div className="document-card-icon space-doc-icon">
                      {typeIcon(category)}
                    </div>
                    <div className="document-card-body space-doc-body">
                      <a
                        className="document-card-name"
                        href={`/api/documents/${doc.id}`}
                        download={doc.name}
                        title={doc.name}
                      >
                        {doc.name}
                      </a>
                      <div className="document-card-meta">
                        <span>{formatSize(doc.size)}</span>
                        <span>{formatDate(doc.uploadedAt)}</span>
                      </div>
                    </div>
                    <div className="space-doc-actions">
                      {previewable ? (
                        <button
                          type="button"
                          className="space-doc-action-btn"
                          onClick={() => openPreview(doc)}
                        >
                          预览
                        </button>
                      ) : null}
                      <a
                        className="space-doc-action-btn"
                        href={`/api/documents/${doc.id}`}
                        download={doc.name}
                      >
                        下载
                      </a>
                      {activeTab === 'project' ? (
                        <button
                          type="button"
                          className="space-doc-action-btn unlink-btn"
                          onClick={() => handleLinkProject(doc.id, false)}
                          title="解除项目关联，退回到共享技能库"
                        >
                          移至共享库
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="space-doc-action-btn link-btn"
                          onClick={() => handleLinkProject(doc.id, true)}
                          title="将此共享文件关联至当前项目"
                        >
                          关联到项目
                        </button>
                      )}
                      <button
                        type="button"
                        className="space-doc-delete"
                        onClick={() => { if (window.confirm(`确认要彻底删除「${doc.name}」吗？`)) handleDelete(doc.id); }}
                        aria-label="删除文档"
                        title="彻底删除"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="space-hint space-empty-hint">
              {activeTab === 'project' ? '当前项目暂无专属文档，您可以在上方上传，或从共享文档库中关联已有文件。' : '共享文档库中没有可用的文件，您可以在“技能”页面上传，或在此关联已解除关联的文件。'}
            </p>
          )}
        </article>
      </div>

      {project.githubUrl ? (
        <a className="text-link space-github" href={project.githubUrl} target="_blank" rel="noreferrer">
          查看 GitHub →
        </a>
      ) : null}

      {/* Previewer Modal */}
      {previewDoc ? (
        <div className="editor-backdrop" role="dialog" aria-modal="true" aria-label={`预览 ${previewDoc.name}`}>
          <div className="previewer-modal">
            <div className="previewer-header">
              <div className="previewer-title-container">
                <h2 className="previewer-title">{previewDoc.name}</h2>
                <span className="previewer-subtitle">
                  {formatSize(previewDoc.size)} | 上传于 {formatDate(previewDoc.uploadedAt)}
                </span>
              </div>
              <button type="button" className="previewer-close" onClick={closePreview} aria-label="关闭预览">
                ✕
              </button>
            </div>
            <div className="previewer-content">
              {loadingPreview ? (
                <div className="previewer-loading">正在加载预览内容...</div>
              ) : previewDoc.mimetype.startsWith('image/') ? (
                <img 
                  className="previewer-image" 
                  src={`/api/documents/${previewDoc.id}`} 
                  alt={previewDoc.name} 
                />
              ) : (
                <pre className="previewer-text" tabIndex={0}>
                  {previewContent}
                </pre>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
