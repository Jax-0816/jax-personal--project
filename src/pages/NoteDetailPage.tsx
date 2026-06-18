import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import NoteEditorForm from '../components/NoteEditorForm';
import { fetchNoteDetail, formatNoteDate, type NoteDetail, useNotes } from '../hooks/useNotes';

export default function NoteDetailPage() {
  const { id = '' } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { deleteNote, togglePinned, updateNote } = useNotes();
  const [note, setNote] = useState<NoteDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(Boolean(location.state?.startEditing));

  useEffect(() => {
    setEditing(Boolean(location.state?.startEditing));
  }, [location.state]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchNoteDetail(id);
        if (!cancelled) {
          setNote(data);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : '加载失败');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleDelete = async () => {
    if (!note || !window.confirm('确认删除这条灵感吗？')) {
      return;
    }

    try {
      await deleteNote(note.id);
      navigate('/notes');
    } catch (err) {
      window.alert(err instanceof Error ? err.message : '删除失败');
    }
  };

  const handleTogglePinned = async () => {
    if (!note) {
      return;
    }

    try {
      const updated = await togglePinned(note.id, !note.pinned);
      setNote(updated);
    } catch (err) {
      window.alert(err instanceof Error ? err.message : '置顶更新失败');
    }
  };

  if (loading) {
    return <section className="page-section inner-page note-detail-page"><p className="document-empty">加载中...</p></section>;
  }

  if (error || !note) {
    return (
      <section className="page-section inner-page note-detail-page">
        <div className="notes-empty glass-panel">
          <strong>这条灵感暂时不可用</strong>
          <p>{error || '内容不存在或已被删除。'}</p>
          <Link to="/notes">返回列表</Link>
        </div>
      </section>
    );
  }

  return (
    <section className="page-section inner-page note-detail-page">
      <div className="note-detail-head glass-panel">
        <div className="note-detail-copy">
          <span>{note.pinned ? '置顶 · ' : ''}最后更新 {formatNoteDate(note.updatedAt)}</span>
          <h1>{note.title}</h1>
        </div>
        <div className="note-detail-actions">
          <button type="button" className={note.pinned ? 'note-pin-btn is-active' : 'note-pin-btn'} onClick={handleTogglePinned}>
            {note.pinned ? '取消置顶' : '置顶'}
          </button>
          <button type="button" onClick={() => setEditing((prev) => !prev)}>
            {editing ? '收起编辑' : '编辑'}
          </button>
          <button type="button" className="note-delete-btn" onClick={handleDelete}>
            删除
          </button>
          <Link to="/notes">返回列表</Link>
        </div>
      </div>

      {editing ? (
        <NoteEditorForm
          initialTitle={note.title}
          initialContent={note.content}
          submitLabel="保存修改"
          savingLabel="保存中..."
          onSubmit={async ({ title, content }) => {
            const updated = await updateNote(note.id, title, content);
            setNote(updated);
            setEditing(false);
            if (updated.id !== note.id) {
              navigate(`/notes/${updated.id}`, { replace: true });
            }
          }}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <article className="note-markdown glass-panel">
          <ReactMarkdown>{note.content}</ReactMarkdown>
        </article>
      )}
    </section>
  );
}
