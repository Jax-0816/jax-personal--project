import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Project } from '../data/projects';

interface ProjectCardProps {
  project: Project;
  index: number;
  onEdit?: (project: Project) => void;
}

export default function ProjectCard({ project, index, onEdit }: ProjectCardProps) {
  return (
    <motion.article
      className="project-card"
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.55, delay: index * 0.08, ease: 'easeOut' }}
    >
      <div className="project-card-topline">
        <span>{project.category}</span>
        <span>{project.year}</span>
      </div>
      <h3>{project.title}</h3>
      <p>{project.tagline}</p>
      {project.githubUrl ? (
        <a className="project-github" href={project.githubUrl} target="_blank" rel="noreferrer">GitHub</a>
      ) : null}
      <div className="project-card-footer">
        <span>{project.status}</span>
        <div className="project-card-actions">
          <Link to={`/projects/${project.id}/space`}>打开</Link>
          {onEdit ? <button type="button" onClick={() => onEdit(project)}>编辑</button> : null}
        </div>
      </div>
    </motion.article>
  );
}
