# 个人作品集空间

一个使用 React + Vite + TypeScript 构建的个人作品集网站，采用后端天气 API 驱动的首页天气场景，支持内容在线编辑、文件上传管理。

## 当前功能

- **首页** — 清爽个人介绍首屏、可切换城市的天气场景、精选项目与近期笔记入口
- **关于我** — 个人画像、教育/工作经历、技能面板，支持在线编辑并持久化到 localStorage
- **项目** — 项目卡片网格展示、独立详情页、项目专属工作空间（支持文件拖拽上传）
- **文档库** — 全站文档/技能文件管理，支持拖拽上传、类型筛选、下载、删除
- **笔记** — 笔记列表展示，标签分类
- **联系** — Email、微信、GitHub 联系方式
- **天气场景** — Express 后端代理和风天气 API，首页背景随天气、温度、湿度、风力变化
- **内容编辑** — 项目和关于页内容可在线编辑，localStorage 持久化，跨标签页同步
- **AI 工作规则** — AGENTS.md 定义 AI 协作规则，skills/ 目录定义常用角色技能

## 技术栈

- React 19
- Vite 7
- TypeScript 5.8
- React Router 7.6
- Framer Motion 12.15
- CSS 天气场景系统
- Express 5（文件上传 API）
- Multer（文件处理）
- CSS（BEM-ish 命名，清爽作品集视觉系统，浅色主题 + 克制暗色功能面板）

## 项目结构

```
src/
├── main.tsx                  # 入口：BrowserRouter → App
├── App.tsx                   # 路由定义（8 条路由）
├── styles.css                # 全局样式（清爽作品集主题、响应式）
├── assets/
│   └── avatar.jpg            # 头像
├── components/
│   ├── Layout.tsx            # 外壳：固定顶栏 + <Outlet />
│   ├── WeatherScene.tsx      # 首页天气场景背景
│   ├── WeatherStatusBar.tsx  # 首页天气场景卡片
│   ├── ScrollScene.tsx       # 首页视差滚动叙事
│   ├── ProjectCard.tsx       # 项目卡片
│   ├── DocumentCard.tsx      # 文档卡片
│   └── SectionTitle.tsx      # 可复用段落标题
├── pages/
│   ├── HomePage.tsx          # 首页
│   ├── AboutPage.tsx         # 关于我（可编辑）
│   ├── ProjectsPage.tsx      # 项目列表（可编辑）
│   ├── ProjectDetailPage.tsx # 项目详情
│   ├── ProjectSpacePage.tsx  # 项目工作空间（文件上传）
│   ├── DocumentsPage.tsx     # 文档库
│   ├── NotesPage.tsx         # 笔记列表
│   └── ContactPage.tsx       # 联系方式
├── data/
│   ├── profile.ts            # 个人信息
│   ├── projects.ts           # 项目数据
│   └── notes.ts              # 笔记数据
├── hooks/
│   ├── useEditableProjects.ts # 项目 CRUD + localStorage
│   └── useDocuments.ts        # 文档 CRUD + API 调用
server/
└── index.js                  # Express API 服务器（文件上传/下载/删除）
skills/                       # AI 协作角色技能定义
uploads/                      # 用户上传文件存储
```

## 常用命令

```bash
npm install          # 安装依赖
npm run dev          # 同时启动前端（端口 4283）和后端（端口 4284）
npm run build        # 类型检查 + 生产构建
npm run preview      # 预览生产构建
```
