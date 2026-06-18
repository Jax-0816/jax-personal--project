import { Link, useNavigate } from 'react-router-dom';
import SectionTitle from '../components/SectionTitle';
import { useNotes } from '../hooks/useNotes';

export default function NotesPage() {
  const navigate = useNavigate();
  const { notes, loading, error, deleteNote, togglePinned } = useNotes();

  const handleDelete = async (id: string) => {
    if (!window.confirm('确认删除这条灵感吗？')) {
      return;
    }

    try {
      await deleteNote(id);
    } catch (err) {
      window.alert(err instanceof Error ? err.message : '删除失败');
    }
  };

  const handleTogglePinned = async (id: string, pinned: boolean) => {
    try {
      await togglePinned(id, !pinned);
    } catch (err) {
      window.alert(err instanceof Error ? err.message : '置顶更新失败');
    }
  };

  return (
    <section className="page-section inner-page notes-page">
      <SectionTitle eyebrow="Notes" title="灵感列表" description="在这里记录想法、思路和可以继续推进的线索。" />

      <div className="notes-toolbar">
        <button type="button" onClick={() => navigate('/notes/new')}>
          新建灵感
        </button>
      </div>

      {loading ? <p className="document-empty">加载中...</p> : null}
      {!loading && error ? <p className="document-empty">加载失败：{error}</p> : null}
      {!loading && !error && notes.length === 0 ? (
        <div className="notes-empty glass-panel">
          <strong>还没有灵感记录</strong>
          <p>先创建第一条，把零散想法沉淀成可以反复查看和编辑的文本。</p>
          <button type="button" onClick={() => navigate('/notes/new')}>
            创建第一条
          </button>
        </div>
      ) : null}

      {!loading && !error && notes.length > 0 ? (
        <div className="notes-list-shell">
          {notes.map((note) => (
            <article key={note.id} className={`note-row glass-panel ${note.pinned ? 'is-pinned' : ''}`}>
              <div className="note-row-main">
                {note.pinned ? <span className="note-pin-badge">置顶</span> : null}
                <Link to={`/notes/${note.id}`} className="note-row-title">
                  {note.title}
                </Link>
              </div>
              <div className="note-row-actions">
                <button type="button" className={note.pinned ? 'note-pin-btn is-active' : 'note-pin-btn'} onClick={() => handleTogglePinned(note.id, note.pinned)}>
                  {note.pinned ? '取消置顶' : '置顶'}
                </button>
                <button type="button" onClick={() => navigate(`/notes/${note.id}`, { state: { startEditing: true } })}>
                  编辑
                </button>
                <button type="button" className="note-delete-btn" onClick={() => handleDelete(note.id)}>
                  删除
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
