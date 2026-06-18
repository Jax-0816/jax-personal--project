import { Link } from 'react-router-dom';
import ScrollScene from '../components/ScrollScene';
import ProjectCard from '../components/ProjectCard';
import SectionTitle from '../components/SectionTitle';
import { profile } from '../data/profile';
import { useNotes } from '../hooks/useNotes';
import { useEditableProjects } from '../hooks/useEditableProjects';

export default function HomePage() {
  const { projects } = useEditableProjects();
  const { notes, loading: notesLoading } = useNotes();

  return (
    <>
      <ScrollScene />
      <section className="page-section content-orbit home-overview">
        <div className="overview-copy">
          <SectionTitle title="更容易被理解的个人工作台" description={profile.featuredEntry} />
        </div>
        <div className="overview-grid">
          {profile.directions.map((item) => (
            <article key={item} className="overview-item">
              <span>Direction</span>
              <strong>{item}</strong>
            </article>
          ))}
        </div>
      </section>
      <section className="page-section content-orbit">
        <SectionTitle eyebrow="Selected Projects" title="代表项目" description="保留可继续编辑、查看详情和进入项目工作台的完整流程。" />
        <div className="featured-grid">
          {projects.slice(0, 3).map((project, index) => (
            <ProjectCard key={project.id} project={project} index={index} />
          ))}
        </div>
      </section>
      <section className="page-section content-orbit compact-orbit">
        <SectionTitle eyebrow="Recent Notes" title="最近记录" description="用更轻的方式沉淀学习、创作和项目过程。" />
        {notesLoading ? <p className="document-empty">加载中...</p> : null}
        {!notesLoading && notes.length === 0 ? <p className="document-empty">还没有最近记录。</p> : null}
        {!notesLoading && notes.length > 0 ? (
          <div className="note-list compact">
            {notes.slice(0, 2).map((note) => (
              <Link key={note.id} to={`/notes/${note.id}`} className="note-item glass-panel">
                <span>Recent Note</span>
                <strong>{note.title}</strong>
                <p>点击查看完整灵感内容，并继续编辑、整理或删除。</p>
              </Link>
            ))}
          </div>
        ) : null}
      </section>
    </>
  );
}
