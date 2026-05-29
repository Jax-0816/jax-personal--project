# TODO

## 已完成

- [x] 初始化 React + Vite + TypeScript 项目结构
- [x] 建立个人宇宙网站的信息架构（8 条路由）
- [x] 实现关于我、项目、项目详情、笔记、联系页面
- [x] 完成全站 Canvas 粒子沉浸式重设计
- [x] 实现鼠标吸附、点击脉冲、滚动扰动和响应式粒子数量
- [x] 优化粒子系统性能，降低连线、发光、DPR 和玻璃模糊开销
- [x] 实现项目和关于页内容在线编辑 + localStorage 持久化
- [x] 实现首页滚动驱动视差叙事（ScrollScene）
- [x] 新增项目工作空间页面（ProjectSpacePage）
- [x] 新增全站文档库页面（DocumentsPage）
- [x] 搭建 Express 后端 API 服务器（文件上传/下载/删除）
- [x] 实现文件拖拽上传 + 类型筛选 + 下载 + 删除
- [x] 添加个人头像（avatar.jpg）
- [x] 编写 AGENTS.md AI 协作规则
- [x] 创建 skills/ 角色技能定义
- [x] 实现粒子特效用户可开关（localStorage 持久化）
- [x] 适配 prefers-reduced-motion（动效减弱）
- [x] 玻璃拟态暗色主题 + 响应式适配（860px / 520px 断点）

## 下一步

### 个人信息
- [ ] 修改 `src/data/profile.ts` 中 name 为真实姓名（当前为 'your name'）
- [ ] 修改 `src/data/profile.ts` 中 email 为真实邮箱（当前为 hello@example.com）
- [ ] 修改 `src/data/profile.ts` 中 background 为真实个人背景（当前为占位模板）
- [ ] 确认头像是否满意，如需更换则替换 `src/assets/avatar.jpg`

### 项目内容
- [ ] 替换项目 2-4 为真实项目（当前均为示例占位内容）
- [ ] 为真实项目补充 GitHub 链接
- [ ] 补充真实项目指标数据（metrics）

### 笔记内容
- [ ] 替换 3 篇笔记为真实内容（当前均为建站过程的示例文章）
- [ ] 更新笔记日期为真实发布日期

### 视觉调优
- [ ] 根据真实内容调整粒子颜色、密度和交互节奏
- [ ] 视情况优化移动端 ScrollScene 体验

### 功能增强
- [ ] 考虑添加笔记/文章的 Markdown 渲染支持
- [ ] 考虑添加项目筛选/分类功能
