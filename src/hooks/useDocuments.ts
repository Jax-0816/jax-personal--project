import { useCallback, useEffect, useState } from 'react';

export interface DocumentItem {
  id: string;
  name: string;
  filename: string;
  size: number;
  mimetype: string;
  uploadedAt: string;
}

export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatDate(iso: string): string {
  const date = new Date(iso);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${d} ${h}:${min}`;
}

export function getCategory(mimetype: string): string {
  if (mimetype.startsWith('image/')) return 'image';
  if (mimetype.startsWith('video/')) return 'video';
  if (mimetype.startsWith('audio/')) return 'audio';
  if (mimetype.includes('pdf')) return 'pdf';
  if (mimetype.includes('text') || mimetype.includes('markdown') || mimetype.includes('json')) return 'text';
  if (mimetype.includes('zip') || mimetype.includes('rar') || mimetype.includes('tar') || mimetype.includes('gzip')) return 'archive';
  return 'other';
}

export function getCategoryLabel(cat: string): string {
  const map: Record<string, string> = { image: '图片', video: '视频', audio: '音频', pdf: 'PDF', text: '文本', archive: '压缩包', other: '其他' };
  return map[cat] || '其他';
}

export function useDocuments() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/documents');
      if (!res.ok) throw new Error('获取文档列表失败');
      const data = (await res.json()) as DocumentItem[];
      setDocuments(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const uploadDocuments = useCallback(
    async (files: FileList | File[]) => {
      const form = new FormData();
      Array.from(files).forEach((file) => form.append('files', file));

      const res = await fetch('/api/documents', { method: 'POST', body: form });
      if (!res.ok) throw new Error('上传失败');

      const newDocs = (await res.json()) as DocumentItem[];
      setDocuments((prev) => [...newDocs, ...prev]);
      return newDocs;
    },
    [],
  );

  const deleteDocument = useCallback(async (id: string) => {
    const res = await fetch(`/api/documents/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('删除失败');
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  }, []);

  return {
    documents,
    loading,
    error,
    uploadDocuments,
    deleteDocument,
    refresh: fetchDocuments,
    utils: { formatSize, formatDate, getCategory, getCategoryLabel },
  };
}
