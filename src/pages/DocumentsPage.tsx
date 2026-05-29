import { useCallback, useRef, useState } from 'react';
import SectionTitle from '../components/SectionTitle';
import DocumentCard from '../components/DocumentCard';
import { useDocuments } from '../hooks/useDocuments';

type Filter = 'all' | 'image' | 'pdf' | 'text' | 'archive' | 'other';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'image', label: '图片' },
  { key: 'pdf', label: 'PDF' },
  { key: 'text', label: '文本' },
  { key: 'archive', label: '压缩包' },
  { key: 'other', label: '其他' },
];

export default function DocumentsPage() {
  const { documents, loading, error, uploadDocuments, deleteDocument, utils } = useDocuments();
  const [filter, setFilter] = useState<Filter>('all');
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      if (files.length === 0) return;
      setUploading(true);
      setUploadError(null);
      try {
        await uploadDocuments(files);
      } catch (err) {
        setUploadError(err instanceof Error ? err.message : '上传失败，请重试');
      } finally {
        setUploading(false);
      }
    },
    [uploadDocuments],
  );

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const filtered = filter === 'all' ? documents : documents.filter((d) => utils.getCategory(d.mimetype) === filter);

  return (
    <section className="page-section inner-page documents-page">
      <SectionTitle
        eyebrow="Skills"
        title="技能库"
        description="存放和管理技能文档（Markdown），拖拽上传 .md 文件，构建你的技能知识体系。"
      />

      {/* Upload zone */}
      <div
        className={`document-upload-zone ${dragOver ? 'drag-over' : ''}`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label="上传技能文档区域，点击或拖拽 .md 文件到此处"
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          hidden
          onChange={(e) => {
            if (e.target.files) handleFiles(e.target.files);
            e.target.value = '';
          }}
        />
        <div className="document-upload-icon">+</div>
        <p className="document-upload-text">
          {uploading ? '上传中...' : '拖拽 .md 技能文档到此处，或点击选择'}
        </p>
        <small className="document-upload-hint">推荐上传 Markdown (.md) 格式的技能文档</small>
        {uploadError ? <p className="document-upload-error">{uploadError}</p> : null}
      </div>

      {/* Filters */}
      {documents.length > 0 ? (
        <div className="document-filters">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              className={`document-filter-btn ${filter === f.key ? 'active' : ''}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>
      ) : null}

      {/* Document list */}
      {loading ? (
        <p className="document-empty">加载中...</p>
      ) : error ? (
        <p className="document-empty">加载失败：{error}</p>
      ) : filtered.length === 0 ? (
        <p className="document-empty">
          {documents.length === 0 ? '还没有技能文档，拖拽 .md 文件到这里开始。' : '没有匹配的文档。'}
        </p>
      ) : (
        <div className="document-grid">
          {filtered.map((doc, i) => (
            <DocumentCard key={doc.id} document={doc} index={i} onDelete={deleteDocument} />
          ))}
        </div>
      )}
    </section>
  );
}
