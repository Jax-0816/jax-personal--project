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
    title: '个人项目库',
    tagline: '存放 Jax 的个人私有项目文件与定制化成果。',
    year: '2026',
    status: '持续更新',
    category: 'Personal',
    summary: 'Jax 专属的个人私有项目归档库，支持上传、下载、解除关联与在线预览多种格式的压缩包和文档。',
    details: [
      '存放 Jax 的日常个人开发项目、私有代码与设计成果',
      '支持各种文件与打包好的压缩包归档',
      '支持在专属空间进行独立分类与维护'
    ],
    metrics: [
      '专属管理',
      '支持多格式归档',
      '安全独立存取'
    ],
  },
  {
    id: 'public-projects',
    title: '公共项目库',
    tagline: '存放开源、公共共享或团队协作项目成果。',
    year: '2026',
    status: '公开探索',
    category: 'Public',
    summary: '面向大众或团队公开分享的共享项目归档库，包含开源工具、公共模版与文档。',
    details: [
      '存放开源项目、公共工具箱与团队共享包',
      '支持关联全局技能库文件，支持多压缩包快速上传',
      '对外部伙伴或访客公开展示与下载'
    ],
    metrics: [
      '公开分享',
      '团队协作',
      '支持多文件下载'
    ],
  },
];
