import { useEffect, useState } from 'react';

interface NoteEditorFormProps {
  initialTitle?: string;
  initialContent?: string;
  submitLabel: string;
  savingLabel: string;
  onSubmit: (payload: { title: string; content: string }) => Promise<void>;
  onCancel?: () => void;
}

export default function NoteEditorForm({
  initialTitle = '',
  initialContent = '',
  submitLabel,
  savingLabel,
  onSubmit,
  onCancel,
}: NoteEditorFormProps) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTitle(initialTitle);
    setContent(initialContent);
    setError(null);
  }, [initialTitle, initialContent]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    if (!trimmedTitle) {
      setError('标题不能为空');
      return;
    }
    if (!trimmedContent) {
      setError('正文不能为空');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await onSubmit({ title: trimmedTitle, content: trimmedContent });
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="note-editor-form glass-panel" onSubmit={handleSubmit}>
      <label className="note-editor-field">
        <span>标题</span>
        <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="给这条灵感起一个明确标题" />
      </label>
      <label className="note-editor-field">
        <span>正文（Markdown）</span>
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          rows={18}
          placeholder="把完整思路、推导、引用和待办都写在这里。"
        />
      </label>
      {error ? <p className="note-form-error">{error}</p> : null}
      <div className="note-editor-actions">
        <button type="submit" disabled={saving}>
          {saving ? savingLabel : submitLabel}
        </button>
        {onCancel ? (
          <button type="button" className="document-paste-secondary" onClick={onCancel} disabled={saving}>
            取消
          </button>
        ) : null}
      </div>
    </form>
  );
}
