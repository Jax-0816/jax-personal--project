import { Link } from 'react-router-dom';
import ScrollScene from '../components/ScrollScene';
import ProjectCard from '../components/ProjectCard';
import SectionTitle from '../components/SectionTitle';
import { notes } from '../data/notes';
import { useEditableProjects } from '../hooks/useEditableProjects';

export default function HomePage() {
  const { projects } = useEditableProjects();

  return (
    <>
      <ScrollScene />
      <section className="page-section content-orbit">
        <SectionTitle eyebrow="Selected Projects" title="漂浮在粒子场里的项目" description="每一个项目都是一个可以继续进入的坐标点。" />
        <div className="featured-grid">
          {projects.slice(0, 3).map((project, index) => (
            <ProjectCard key={project.id} project={project} index={index} />
          ))}
        </div>
      </section>
      <section className="page-section content-orbit compact-orbit">
        <SectionTitle eyebrow="Notes Signal" title="最近捕获的想法" />
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
