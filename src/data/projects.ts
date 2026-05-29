export interface Project {
  id: string;
  title: string;
  tagline: string;
  year: string;
  status: string;
  category: string;
  githubUrl?: string;
  summary: string;
  details: string[];
  metrics: string[];
}

export const projects: Project[] = [
  {
    id: 'personal-universe',
    title: '个人宇宙网站',
    tagline: '把作品、笔记和方向收束成一个可探索入口。',
    year: '2026',
    status: '进行中',
    category: 'Website',
    summary: '一个滚动大片感的个人主页，用来承载长期项目、内容入口和个人介绍。',
    details: ['建立清晰的信息架构', '用滚动动效制造章节推进感', '保留后续迁移到内容系统的空间'],
    metrics: ['5 个核心页面', '4 个项目样例', '可持续更新'],
  },
  {
    id: 'ai-content-lab',
    title: 'AI 内容实验室',
    tagline: '把选题、素材、脚本和复盘变成一套可重复流程。',
    year: '2026',
    status: '规划中',
    category: 'AI Workflow',
    summary: '用于沉淀 AI 辅助内容创作方法，覆盖从想法捕捉到发布复盘的全过程。',
    details: ['整理创作素材库', '设计脚本生成流程', '形成内容复盘模板'],
    metrics: ['12 个内容模板', '3 类创作场景', '1 套复盘方法'],
  },
  {
    id: 'product-notes',
    title: '产品观察笔记',
    tagline: '记录那些让人眼前一亮的产品细节和交互案例。',
    year: '2026',
    status: '持续更新',
    category: 'Writing',
    summary: '围绕产品、交互、商业和用户体验写短笔记，训练判断力。',
    details: ['拆解优秀网页体验', '记录交互设计灵感', '总结可复用的产品原则'],
    metrics: ['每周更新', '案例拆解', '沉淀方法论'],
  },
  {
    id: 'creative-archive',
    title: '创作档案库',
    tagline: '把零散灵感保存为未来可以继续生长的种子。',
    year: '2026',
    status: '探索中',
    category: 'Archive',
    summary: '收纳视觉参考、文案片段、项目设想和学习记录的私人档案库。',
    details: ['建立灵感标签系统', '沉淀视觉参考', '连接未来项目入口'],
    metrics: ['灵感收纳', '标签组织', '跨项目复用'],
  },
];
