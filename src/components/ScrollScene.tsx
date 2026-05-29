import { motion, useScroll, useTransform } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { profile } from '../data/profile';
import { projects } from '../data/projects';

const particleEffectsStorageKey = 'personal-universe-particle-effects';
const particleEffectsEvent = 'personal-universe-particle-effects-change';

const getParticleEffectsEnabled = () => {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(particleEffectsStorageKey) === 'on';
};

export default function ScrollScene() {
  const ref = useRef<HTMLElement>(null);
  const [particleEffectsEnabled, setParticleEffectsEnabled] = useState(getParticleEffectsEnabled);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const heroScale = useTransform(scrollYProgress, [0, 0.42, 1], [1, 0.92, 0.82]);
  const heroY = useTransform(scrollYProgress, [0, 0.55, 1], ['0%', '-10%', '-22%']);
  const portalRotate = useTransform(scrollYProgress, [0, 1], [0, 52]);
  const portalScale = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1.18, 1.45]);

  useEffect(() => {
    const syncSetting = () => setParticleEffectsEnabled(getParticleEffectsEnabled());

    window.addEventListener('storage', syncSetting);
    window.addEventListener(particleEffectsEvent, syncSetting);

    return () => {
      window.removeEventListener('storage', syncSetting);
      window.removeEventListener(particleEffectsEvent, syncSetting);
    };
  }, []);

  const toggleParticleEffects = () => {
    const nextValue = !particleEffectsEnabled;
    window.localStorage.setItem(particleEffectsStorageKey, nextValue ? 'on' : 'off');
    window.dispatchEvent(new Event(particleEffectsEvent));
    setParticleEffectsEnabled(nextValue);
  };

  return (
    <section ref={ref} className={particleEffectsEnabled ? 'immersive-scene' : 'immersive-scene particle-effects-off'}>
      <div className="scene-sticky">
        {particleEffectsEnabled ? (
          <motion.div className="particle-portal" style={{ rotate: portalRotate, scale: portalScale }} aria-hidden="true">
            <span />
            <span />
            <span />
          </motion.div>
        ) : null}
        <motion.div className="hero-core" style={{ scale: heroScale, y: heroY }}>
          <p className="hero-kicker">Personal Universe / Particle Field</p>
          <h1>{profile.headline}</h1>
          <p className="hero-copy">{profile.currentProject}</p>
          <div className="keyword-row">
            {profile.keywords.map((keyword) => (
              <span key={keyword}>{keyword}</span>
            ))}
          </div>
          <div className="hero-actions">
            <Link to="/projects">进入项目星云</Link>
            <Link to="/notes">读取笔记信号</Link>
            <button className="particle-toggle" type="button" aria-pressed={particleEffectsEnabled} onClick={toggleParticleEffects}>
              {particleEffectsEnabled ? '关闭粒子特效' : '开启粒子特效'}
            </button>
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
            <span>{String(index + 1).padStart(2, '0')} / {project.category}</span>
            <h2>{project.title}</h2>
            <p>{project.summary}</p>
            <Link to={'/projects/' + project.id}>进入详情</Link>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
