import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { profile } from '../data/profile';
import { projects } from '../data/projects';

export default function ScrollScene() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const heroScale = useTransform(scrollYProgress, [0, 0.52, 1], [1, 0.98, 0.94]);
  const heroY = useTransform(scrollYProgress, [0, 0.55, 1], ['0%', '-3%', '-8%']);

  return (
    <section ref={ref} className="immersive-scene">
      <div className="scene-sticky">
        <motion.div className="hero-core portfolio-hero-core" style={{ scale: heroScale, y: heroY }}>
          <div className="hero-copy-panel">
            <p className="hero-kicker">Personal Portfolio</p>
            <h1>
              <span>把运营经验、项目实践</span>
              <span>和长期学习整理成</span>
              <span>清晰的作品集。</span>
            </h1>
            <p className="hero-copy">{profile.currentProject}</p>
            <div className="keyword-row">
              {profile.keywords.map((keyword) => (
                <span key={keyword}>{keyword}</span>
              ))}
            </div>
            <div className="hero-actions">
              <Link to="/projects">查看项目</Link>
              <Link to="/about">了解经历</Link>
              <Link to="/documents">整理资料</Link>
            </div>
          </div>
        </motion.div>
      </div>
      <div className="story-steps">
        {projects.slice(0, 3).map((project, index) => (
          <motion.article
            key={project.id}
            className="glass-panel story-panel"
            initial={{ opacity: 0, y: 42, scale: 0.96 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ amount: 0.5 }}
            transition={{ duration: 0.72, ease: 'easeOut' }}
          >
            <span>{project.category} / {project.year}</span>
            <h2>{project.title}</h2>
            <p>{project.summary}</p>
            <Link to={'/projects/' + project.id}>进入详情</Link>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
