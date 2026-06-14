import SectionTitle from '../components/SectionTitle';
import { notes } from '../data/notes';

export default function NotesPage() {
  return (
    <section className="page-section inner-page">
      <SectionTitle eyebrow="Notes" title="笔记与记录" description="持续记录想法、学习过程和项目复盘。" />
      <div className="note-list">
        {notes.map((note) => (
          <article key={note.id} className="note-item">
            <span>{note.date}</span>
            <h3>{note.title}</h3>
            <p>{note.excerpt}</p>
            <div className="tag-row">{note.tags.map((tag) => <small key={tag}>{tag}</small>)}</div>
          </article>
        ))}
      </div>
    </section>
  );
}
