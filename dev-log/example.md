# 开发日志

> 记录每次重要改动，方便回顾项目演进过程。

---

## 2026-05-12

### 做了什么
- 初始化 CareerOS 项目
- 搭建 Next.js + TypeScript + Tailwind CSS v4 技术栈
- 实现 6 个页面基础 UI
- 创建 Mock Data 和 Zustand 状态管理
- 完成 4 个 AI API Routes

### 遇到的问题
- npm 不支持中文目录名，手动创建 package.json 解决
- Tailwind v4 使用 CSS 配置替代 tailwind.config.ts
- Zustand persist 中间件初始化时访问 localStorage 导致 SSR 报错
- 组件中派生数据未用 useMemo 包裹导致无限重渲染

### 下一步计划
- [ ] 接入真实 DeepSeek API Key 并测试 AI 功能
- [ ] 优化移动端响应式体验
- [ ] 考虑添加数据导出功能

---

## 模板（复制使用）

```
## YYYY-MM-DD

### 做了什么
-

### 遇到的问题
-

### 下一步计划
-
```
