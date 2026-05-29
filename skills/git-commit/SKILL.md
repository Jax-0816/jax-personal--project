# git-commit：Git 提交

## 触发条件

- 用户要求提交代码、创建 commit
- 一个任务阶段完成后

## 执行流程

```text
1. 执行 git status，检查待提交文件清单
2. 执行 git diff --stat，确认变更范围
3. 逐项检查：
   - 是否有异常删除
   - 是否有 .env、node_modules 等敏感文件
   - 是否有无关文件变更
   - 改动范围是否在当前任务内
4. 生成 commit message（一句话，说明本次改动目的）
5. 等待用户确认后执行 git add 和 git commit
```

## Commit Message 规范

- 用一句话说明本次改动目的
- 不要写 "update"、"fix"、"changes"
- 一个 commit 只对应一个明确目标

推荐示例：

```bash
git commit -m "初始化项目结构"
git commit -m "新增首页基础布局"
git commit -m "修复表单提交错误"
git commit -m "更新项目开发规则"
```

## 允许提交的条件

- 只完成一个明确任务
- 没有修改无关文件
- 没有提交敏感信息或构建产物
- 测试或构建已通过
- 用户已确认

## 禁止提交的情况

- 待提交文件包含 .env、node_modules
- git status 中出现大量 deleted
- 项目无法正常启动或构建失败
- 改动范围超出当前任务
- 用户未确认
