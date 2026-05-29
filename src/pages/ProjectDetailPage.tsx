import { Link, useParams } from 'react-router-dom';
import { useEditableProjects } from '../hooks/useEditableProjects';

export default function ProjectDetailPage() {
  const { id } = useParams();
  const { projects } = useEditableProjects();
  const project = projects.find((item) => item.id === id);

  if (!project) {
    return (
      <section className="page-section inner-page detail-page">
        <p className="eyebrow">Project not found</p>
        <h1>没有找到这个项目</h1>
        <Link to="/projects" className="text-link">返回项目列表</Link>
      </section>
    );
  }

  return (
    <section className="page-section inner-page detail-page">
      <Link to="/projects" className="text-link">返回项目列表</Link>
      <p className="eyebrow">{project.category} / {project.year}</p>
      <h1>{project.title}</h1>
      <p className="detail-lead">{project.summary}</p>
      {project.githubUrl ? (
        <a className="text-link" href={project.githubUrl} target="_blank" rel="noreferrer">查看 GitHub</a>
      ) : null}
      <div className="detail-grid">
        <article><h2>项目要点</h2><ul>{project.details.map((item) => <li key={item}>{item}</li>)}</ul></article>
        <article><h2>当前指标</h2><ul>{project.metrics.map((item) => <li key={item}>{item}</li>)}</ul></article>
      </div>
    </section>
  );
}
