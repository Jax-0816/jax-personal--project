import { useCallback, useRef, useState } from 'react';
import SectionTitle from '../components/SectionTitle';
import DocumentCard from '../components/DocumentCard';
import { useDocuments } from '../hooks/useDocuments';

type Filter = 'all' | 'image' | 'video' | 'audio' | 'pdf' | 'text' | 'archive' | 'other';
type InputMode = 'upload' | 'paste';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'image', label: '图片' },
  { key: 'video', label: '视频' },
  { key: 'audio', label: '音频' },
  { key: 'pdf', label: 'PDF' },
  { key: 'text', label: '文本' },
  { key: 'archive', label: '压缩包' },
  { key: 'other', label: '其他' },
];

export default function DocumentsPage() {
  const {
    documents,
    loading,
    error,
    uploadDocuments,
    createTextDocument,
    readDocumentText,
    updateTextDocument,
    deleteDocument,
    utils,
  } = useDocuments();
  const [filter, setFilter] = useState<Filter>('all');
  const [inputMode, setInputMode] = useState<InputMode>('upload');
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [textTitle, setTextTitle] = useState('');
  const [textContent, setTextContent] = useState('');
  const [savingText, setSavingText] = useState(false);
  const [textError, setTextError] = useState<string | null>(null);
  const [textNotice, setTextNotice] = useState<string | null>(null);
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

  const handleCreateText = async () => {
    setTextError(null);
    setTextNotice(null);
    if (!textContent.trim()) {
      setTextError('请先粘贴从 PDF 或其他资料中复制的文字。');
      return;
    }

    setSavingText(true);
    try {
      const doc = await createTextDocument(textTitle, textContent);
      setTextTitle('');
      setTextContent('');
      setFilter('text');
      setTextNotice(`已保存为 ${doc.name}`);
    } catch (err) {
      setTextError(err instanceof Error ? err.message : '保存文本失败');
    } finally {
      setSavingText(false);
    }
  };

  const filtered = filter === 'all' ? documents : documents.filter((d) => utils.getCategory(d.mimetype) === filter);

  return (
    <section className="page-section inner-page documents-page">
      <SectionTitle
        eyebrow="Skills"
        title="技能库"
        description="存放和管理技能文档、项目资料和可复用知识文件。"
      />

      <div className="document-input-panel">
        <div className="document-mode-tabs" aria-label="选择资料录入方式">
          <button
            type="button"
            className={`document-mode-btn ${inputMode === 'upload' ? 'active' : ''}`}
            onClick={() => setInputMode('upload')}
          >
            上传文件
          </button>
          <button
            type="button"
            className={`document-mode-btn ${inputMode === 'paste' ? 'active' : ''}`}
            onClick={() => setInputMode('paste')}
          >
            粘贴文字
          </button>
        </div>

        {inputMode === 'upload' ? (
          <div
            className={`document-upload-zone ${dragOver ? 'drag-over' : ''}`}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            aria-label="上传技能文档区域，点击或拖拽文件到此处"
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
              {uploading ? '上传中...' : '拖拽文档到此处，或点击选择'}
            </p>
            <small className="document-upload-hint">支持图片、PDF、文本、压缩包等常用资料格式</small>
            {uploadError ? <p className="document-upload-error">{uploadError}</p> : null}
          </div>
        ) : (
          <div className="document-paste-zone">
            <div className="document-paste-copy">
              <strong>把 PDF 里的内容复制成文字</strong>
              <span>打开 PDF 后选中文字复制，再粘贴到这里保存为可筛选、可复制的文本资料。</span>
            </div>
            <label className="document-paste-field">
              <span>文本标题</span>
              <input
                type="text"
                value={textTitle}
                placeholder="不填则自动生成标题"
                onChange={(event) => setTextTitle(event.target.value)}
              />
            </label>
            <label className="document-paste-field">
              <span>文字内容</span>
              <textarea
                value={textContent}
                placeholder="从 PDF 或网页中复制文字后粘贴到这里..."
                rows={10}
                onChange={(event) => setTextContent(event.target.value)}
              />
            </label>
            <div className="document-paste-actions">
              <button type="button" onClick={handleCreateText} disabled={savingText}>
                {savingText ? '保存中...' : '保存为文本资料'}
              </button>
              <button
                type="button"
                className="document-paste-secondary"
                onClick={() => {
                  setTextTitle('');
                  setTextContent('');
                  setTextError(null);
                  setTextNotice(null);
                }}
              >
                清空
              </button>
            </div>
            {textError ? <p className="document-upload-error">{textError}</p> : null}
            {textNotice ? <p className="document-paste-notice">{textNotice}</p> : null}
          </div>
        )}
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
          {documents.length === 0 ? '还没有文档，拖拽文件到这里开始。' : '没有匹配的文档。'}
        </p>
      ) : (
        <div className="document-grid">
          {filtered.map((doc, i) => (
            <DocumentCard
              key={doc.id}
              document={doc}
              index={i}
              onDelete={deleteDocument}
              onReadText={readDocumentText}
              onUpdateText={updateTextDocument}
            />
          ))}
        </div>
      )}
    </section>
  );
}
