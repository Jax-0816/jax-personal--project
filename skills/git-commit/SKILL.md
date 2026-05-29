# git-commit：Git 提交

## 触发条件

- 用户要求提交代码、创建 commit
- 一个任务阶段完成后

## 执行流程

```text
1. 检查 .gitignore 是否覆盖以下敏感项：
   - node_modules / dist / build（构建产物）
   - .env / .env.local / .env.production（敏感配置）
   - .claude/（本地权限和路径配置）
   - uploads/（用户上传的个人文件）
   - 含硬编码本地路径的脚本（如 *.command）
   - .DS_Store / .cache / coverage
2. 执行 git status，检查待提交文件清单
3. 逐项检查：
   - 是否有异常删除
   - 是否有 .env、node_modules 等敏感文件漏入
   - 是否有 uploads/ 中的用户数据
   - 改动范围是否在当前任务内
4. 确认 .gitignore 已配置 → git add .
5. git status 复核暂存区
6. 生成 commit message 并执行 git commit
```

## .gitignore 必备清单

```gitignore
node_modules
dist
build
.env
.env.local
.env.production
.DS_Store
.cache
coverage
.vscode/settings.json

# Claude 本地配置（含敏感路径和权限）
.claude/

# 用户上传文件（含个人数据）
uploads/
```

## Commit Message 规范

- 用一句话说明本次改动目的
- 不要写 "update"、"fix"、"changes"
- 一个 commit 只对应一个明确目标
- 结尾附加 `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`

推荐示例：

```bash
git commit -m "初始化项目结构

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"

git commit -m "新增首页基础布局

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"

git commit -m "修复表单提交错误

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

## 允许提交的条件

- 只完成一个明确任务
- 没有修改无关文件
- 没有提交敏感信息或构建产物
- 测试或构建已通过
- .gitignore 已正确配置
- 用户已确认

## 禁止提交的情况

- 待提交文件包含 .env、node_modules、.claude/ 配置
- uploads/ 中的用户上传文件被包含
- git status 中出现大量 deleted
- 项目无法正常启动或构建失败
- 改动范围超出当前任务
- 用户未确认
