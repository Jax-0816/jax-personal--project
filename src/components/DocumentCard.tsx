import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import type { DocumentItem } from '../hooks/useDocuments';
import { getCategory, getCategoryLabel, formatSize, formatDate } from '../hooks/useDocuments';

interface DocumentCardProps {
  document: DocumentItem;
  index: number;
  onDelete: (id: string) => void;
  onReadText?: (id: string) => Promise<string>;
  onUpdateText?: (id: string, name: string, content: string) => Promise<DocumentItem>;
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

export default function DocumentCard({ document: doc, index, onDelete, onReadText, onUpdateText }: DocumentCardProps) {
  const category = getCategory(doc.mimetype);
  const [previewText, setPreviewText] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<string | null>(null);
  const [editName, setEditName] = useState(doc.name);
  const [actionMessage, setActionMessage] = useState('');
  const [actionError, setActionError] = useState('');
  const [loadingText, setLoadingText] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    if (previewText !== null || editingText !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [previewText, editingText]);

  useEffect(() => {
    setEditName(doc.name);
  }, [doc.name]);

  const handleDelete = () => {
    if (window.confirm(`确定要删除「${doc.name}」吗？`)) {
      onDelete(doc.id);
    }
  };

  const readText = async () => {
    if (!onReadText) throw new Error('暂不支持读取文本');
    return onReadText(doc.id);
  };

  const handlePreview = async () => {
    setActionError('');
    setActionMessage('');
    setLoadingText(true);
    try {
      setPreviewText(await readText());
    } catch (err) {
      setActionError(err instanceof Error ? err.message : '预览失败');
    } finally {
      setLoadingText(false);
    }
  };

  const handleCopy = async () => {
    setActionError('');
    setActionMessage('');
    setLoadingText(true);
    try {
      const text = await readText();
      await navigator.clipboard.writeText(text);
      setActionMessage('已复制文字');
    } catch (err) {
      setActionError(err instanceof Error ? err.message : '复制失败');
    } finally {
      setLoadingText(false);
    }
  };

  const handleEdit = async () => {
    setActionError('');
    setActionMessage('');
    setLoadingText(true);
    try {
      setEditName(doc.name);
      setEditingText(await readText());
    } catch (err) {
      setActionError(err instanceof Error ? err.message : '读取编辑内容失败');
    } finally {
      setLoadingText(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!onUpdateText || editingText === null) return;
    setActionError('');
    if (!editingText.trim()) {
      setActionError('文本内容不能为空');
      return;
    }

    setSavingEdit(true);
    try {
      const updated = await onUpdateText(doc.id, editName, editingText);
      setEditName(updated.name);
      setEditingText(null);
      setActionMessage('已更新文本');
    } catch (err) {
      setActionError(err instanceof Error ? err.message : '保存编辑失败');
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <>
      <motion.article
        className="document-card glass-panel"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.45, delay: index * 0.06, ease: 'easeOut' }}
      >
        <div className="document-card-icon">{typeIcon(category)}</div>
        <div className="document-card-body">
          <a
            className="document-card-name"
            href={`/api/documents/${doc.id}`}
            download={doc.name}
            title={doc.name}
          >
            {doc.name}
          </a>
          <div className="document-card-meta">
            <span className="document-category">{getCategoryLabel(category)}</span>
            <span>{formatSize(doc.size)}</span>
            <span>{formatDate(doc.uploadedAt)}</span>
          </div>
          {category === 'text' ? (
            <div className="document-card-actions">
              <button type="button" onClick={handlePreview} disabled={loadingText}>预览</button>
              <button type="button" onClick={handleEdit} disabled={loadingText}>编辑</button>
              <button type="button" onClick={handleCopy} disabled={loadingText}>复制文字</button>
              {actionMessage ? <span>{actionMessage}</span> : null}
              {actionError ? <span className="document-card-action-error">{actionError}</span> : null}
            </div>
          ) : null}
        </div>
        <button
          type="button"
          className="document-card-delete"
          onClick={handleDelete}
          aria-label={`删除 ${doc.name}`}
          title="删除"
        >
          ✕
        </button>
      </motion.article>

      {previewText !== null ? (
        <div className="editor-backdrop" role="dialog" aria-modal="true" aria-label={`预览 ${doc.name}`}>
          <div className="previewer-modal">
            <div className="previewer-header">
              <div className="previewer-title-container">
                <h2 className="previewer-title">{doc.name}</h2>
                <span className="previewer-subtitle">文本资料 / {formatSize(doc.size)}</span>
              </div>
              <button type="button" className="previewer-close" onClick={() => setPreviewText(null)} aria-label="关闭预览">
                ✕
              </button>
            </div>
            <div className="previewer-content">
              <pre className="previewer-text" tabIndex={0}>{previewText}</pre>
            </div>
          </div>
        </div>
      ) : null}

      {editingText !== null ? (
        <div className="editor-backdrop" role="dialog" aria-modal="true" aria-label={`编辑 ${doc.name}`}>
          <div className="previewer-modal document-text-editor-modal">
            <div className="previewer-header">
              <div className="previewer-title-container">
                <h2 className="previewer-title">编辑文本资料</h2>
                <span className="previewer-subtitle">保存后会覆盖当前文本文件</span>
              </div>
              <button type="button" className="previewer-close" onClick={() => setEditingText(null)} aria-label="关闭编辑">
                ✕
              </button>
            </div>
            <div className="document-text-editor">
              <label>
                <span>标题</span>
                <input value={editName} onChange={(event) => setEditName(event.target.value)} />
              </label>
              <label>
                <span>内容</span>
                <textarea value={editingText} onChange={(event) => setEditingText(event.target.value)} rows={14} />
              </label>
              <div className="document-text-editor-actions">
                <button type="button" onClick={handleSaveEdit} disabled={savingEdit}>
                  {savingEdit ? '保存中...' : '保存修改'}
                </button>
                <button type="button" className="document-text-editor-secondary" onClick={() => setEditingText(null)}>
                  取消
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
