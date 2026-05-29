import { motion } from 'framer-motion';
import type { DocumentItem } from '../hooks/useDocuments';
import { getCategory, getCategoryLabel, formatSize, formatDate } from '../hooks/useDocuments';

interface DocumentCardProps {
  document: DocumentItem;
  index: number;
  onDelete: (id: string) => void;
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

export default function DocumentCard({ document: doc, index, onDelete }: DocumentCardProps) {
  const category = getCategory(doc.mimetype);

  const handleDelete = () => {
    if (window.confirm(`确定要删除「${doc.name}」吗？`)) {
      onDelete(doc.id);
    }
  };

  return (
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
  );
}
