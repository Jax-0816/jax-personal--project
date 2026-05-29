import { useEffect, useState } from 'react';
import ProjectCard from '../components/ProjectCard';
import SectionTitle from '../components/SectionTitle';
import type { Project } from '../data/projects';
import { useEditableProjects } from '../hooks/useEditableProjects';

const toMultiline = (items: string[]) => items.join('\n');
const toList = (value: string) => value.split('\n').map((item) => item.trim()).filter(Boolean);
const categoryOptions = ['Website', 'AI Workflow', 'Writing', 'Archive'];
const yearOptions = ['2024', '2025', '2026', '2027'];
const statusOptions = ['进行中', '规划中', '持续更新', '探索中'];

export default function ProjectsPage() {
  const { defaultProjects, projects, updateProject } = useEditableProjects();
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [draftProject, setDraftProject] = useState<Project | null>(null);

  useEffect(() => {
    setDraftProject(editingProject);
  }, [editingProject]);

  const openEditor = (project: Project) => {
    setEditingProject(project);
  };

  const updateDraft = (key: keyof Project, value: string) => {
    if (!draftProject) return;
    setDraftProject({ ...draftProject, [key]: value });
  };

  const saveDraft = () => {
    if (!draftProject) return;
    updateProject(draftProject);
    setEditingProject(null);
  };

  const restoreDefault = () => {
    if (!editingProject) return;
    const defaultProject = defaultProjects.find((project) => project.id === editingProject.id);
    if (!defaultProject) return;
    setDraftProject(defaultProject);
  };

  return (
    <section className="page-section inner-page">
      <SectionTitle eyebrow="Projects" title="项目星图" description="3 到 5 个项目入口，后续可以逐步替换成真实作品。" />
      <div className="project-grid">
        {projects.map((project, index) => (
          <ProjectCard key={project.id} project={project} index={index} onEdit={openEditor} />
        ))}
      </div>
      {draftProject ? (
        <div className="editor-backdrop" role="dialog" aria-modal="true" aria-label="编辑项目">
          <div className="about-editor project-editor">
            <div className="editor-heading">
              <div>
                <span>EDIT PROJECT</span>
                <h2>编辑项目</h2>
              </div>
              <button type="button" onClick={() => setEditingProject(null)} aria-label="关闭项目编辑面板">关闭</button>
            </div>
            <label>
              GitHub 仓库链接
              <input value={draftProject.githubUrl || ''} onChange={(event) => updateDraft('githubUrl', event.target.value)} placeholder="https://github.com/Jax-0816/project-name" />
            </label>
            <div className="project-editor-grid">
              <label>
                分类
                <select value={categoryOptions.includes(draftProject.category) ? draftProject.category : ''} onChange={(event) => updateDraft('category', event.target.value)}>
                  <option value="">自定义分类</option>
                  {categoryOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
                <input value={draftProject.category} onChange={(event) => updateDraft('category', event.target.value)} placeholder="输入自定义分类" />
              </label>
              <label>
                年份 / 日期
                <select value={yearOptions.includes(draftProject.year) ? draftProject.year : ''} onChange={(event) => updateDraft('year', event.target.value)}>
                  <option value="">自定义日期</option>
                  {yearOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
                <input value={draftProject.year} onChange={(event) => updateDraft('year', event.target.value)} placeholder="例如 2025.04-2026.01" />
              </label>
              <label>
                状态
                <select value={statusOptions.includes(draftProject.status) ? draftProject.status : ''} onChange={(event) => updateDraft('status', event.target.value)}>
                  <option value="">自定义状态</option>
                  {statusOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
                <input value={draftProject.status} onChange={(event) => updateDraft('status', event.target.value)} placeholder="输入自定义状态" />
              </label>
            </div>
            <label>
              项目标题
              <input value={draftProject.title} onChange={(event) => updateDraft('title', event.target.value)} />
            </label>
            <label>
              卡片简介
              <textarea value={draftProject.tagline} onChange={(event) => updateDraft('tagline', event.target.value)} rows={3} />
            </label>
            <label>
              详情页摘要
              <textarea value={draftProject.summary} onChange={(event) => updateDraft('summary', event.target.value)} rows={4} />
            </label>
            <label>
              项目要点
              <textarea value={toMultiline(draftProject.details)} onChange={(event) => setDraftProject({ ...draftProject, details: toList(event.target.value) })} rows={5} />
            </label>
            <label>
              当前指标
              <textarea value={toMultiline(draftProject.metrics)} onChange={(event) => setDraftProject({ ...draftProject, metrics: toList(event.target.value) })} rows={5} />
            </label>
            <div className="editor-actions">
              <button type="button" onClick={restoreDefault}>恢复默认</button>
              <button type="button" onClick={() => setEditingProject(null)}>取消</button>
              <button type="button" onClick={saveDraft}>保存修改</button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
