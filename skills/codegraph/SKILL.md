# codegraph：代码图谱检索

## 触发条件

- 用户输入 `/codegraph`
- 需要理解代码结构、调用链、影响范围或符号定义
- 需要在大范围搜索前定位相关文件、函数、组件或模块

## 执行流程

```text
1. 检查仓库根目录是否存在 .codegraph/
2. 若存在索引，优先使用 codegraph explore 查询目标符号、文件或问题
3. 阅读 CodeGraph 返回的源码、调用路径和影响范围
4. 仅在 CodeGraph 信息不足时，再使用 rg、sed 等工具补充查看文件
5. 输出结论时标注关键文件、符号和影响面
```

## 使用示例

```bash
codegraph explore "WeatherScene"
codegraph explore "项目上传文件的调用链"
codegraph explore "src/pages/ProjectSpacePage.tsx"
```

## 输出要求

- 说明查询的问题或符号
- 列出相关文件、函数或组件
- 总结调用链、依赖关系和潜在影响范围
- 若没有 `.codegraph/` 索引，明确说明已跳过 CodeGraph，并改用常规代码检索

## 禁止事项

- 不在未确认的情况下创建或更新 CodeGraph 索引
- 不把 CodeGraph 输出当作唯一事实来源，必要时必须回看实际文件
- 不借 `/codegraph` 进行无关重构或扩大修改范围
