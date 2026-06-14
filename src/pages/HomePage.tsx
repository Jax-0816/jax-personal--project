import { Link } from 'react-router-dom';
import ScrollScene from '../components/ScrollScene';
import ProjectCard from '../components/ProjectCard';
import SectionTitle from '../components/SectionTitle';
import { notes } from '../data/notes';
import { profile } from '../data/profile';
import { useEditableProjects } from '../hooks/useEditableProjects';

export default function HomePage() {
  const { projects } = useEditableProjects();

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
        <div className="note-list compact">
          {notes.slice(0, 2).map((note) => (
            <Link key={note.id} to="/notes" className="note-item glass-panel">
              <span>{note.date}</span>
              <strong>{note.title}</strong>
              <p>{note.excerpt}</p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
