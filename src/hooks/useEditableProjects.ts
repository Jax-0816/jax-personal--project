import { useEffect, useState } from 'react';
import { projects as defaultProjects, type Project } from '../data/projects';

const projectsStorageKey = 'personal-universe-projects';
const projectsStorageEvent = 'personal-universe-projects-change';

const mergeWithDefaults = (items: Project[]) => {
  const savedById = new Map(items.map((item) => [item.id, item]));
  return defaultProjects.map((project) => ({ ...project, ...savedById.get(project.id) }));
};

const getSavedProjects = () => {
  if (typeof window === 'undefined') return defaultProjects;

  try {
    const saved = window.localStorage.getItem(projectsStorageKey);
    if (!saved) return defaultProjects;
    const parsed = JSON.parse(saved) as Project[];
    return mergeWithDefaults(parsed);
  } catch {
    return defaultProjects;
  }
};

export function useEditableProjects() {
  const [editableProjects, setEditableProjects] = useState<Project[]>(getSavedProjects);

  useEffect(() => {
    const syncProjects = () => setEditableProjects(getSavedProjects());

    window.addEventListener('storage', syncProjects);
    window.addEventListener(projectsStorageEvent, syncProjects);

    return () => {
      window.removeEventListener('storage', syncProjects);
      window.removeEventListener(projectsStorageEvent, syncProjects);
    };
  }, []);

  const saveProjects = (nextProjects: Project[]) => {
    setEditableProjects(nextProjects);
    window.localStorage.setItem(projectsStorageKey, JSON.stringify(nextProjects));
    window.dispatchEvent(new Event(projectsStorageEvent));
  };

  const updateProject = (nextProject: Project) => {
    saveProjects(editableProjects.map((project) => (project.id === nextProject.id ? nextProject : project)));
  };

  const resetProject = (projectId: string) => {
    const defaultProject = defaultProjects.find((project) => project.id === projectId);
    if (!defaultProject) return;
    updateProject(defaultProject);
  };

  return {
    defaultProjects,
    projects: editableProjects,
    resetProject,
    updateProject,
  };
}
