# CareerOS 项目结构说明

## 技术栈

| 技术 | 用途 |
|------|------|
| Next.js 16 (App Router) | 前端框架 + API Routes |
| TypeScript | 类型安全 |
| Tailwind CSS v4 | 样式方案 |
| Zustand | 客户端状态管理（含 localStorage 持久化） |
| Recharts | 图表可视化 |
| DeepSeek API | AI 功能（简历分析、邮件生成等） |
| Lucide React | 图标库 |

## 目录结构

```
career-os/
├── .env.local              # DeepSeek API Key（不提交到 Git）
├── next.config.ts          # Next.js 配置
├── postcss.config.mjs      # PostCSS 配置（Tailwind v4）
├── tsconfig.json           # TypeScript 配置
├── package.json            # 项目依赖
├── docs/                   # 项目文档
│   ├── requirements.md     # 需求文档
│   └── architecture.md     # 本文件
├── dev-log/                # 开发日志
├── src/
│   ├── app/                # Next.js App Router 页面
│   │   ├── layout.tsx      # 根布局（Sidebar + Header + 内容区）
│   │   ├── page.tsx        # Dashboard 首页
│   │   ├── jobs/           # /jobs 职位追踪
│   │   ├── resume/         # /resume 简历分析
│   │   ├── outreach/       # /outreach 邮件生成
│   │   ├── interview/      # /interview 面试准备
│   │   ├── analytics/      # /analytics 数据分析
│   │   └── api/            # API Routes（服务端）
│   │       ├── analyze-resume/
│   │       ├── generate-email/
│   │       ├── generate-interview/
│   │       └── parse-job-url/
│   ├── components/         # React 组件
│   │   ├── layout/         # Sidebar、Header
│   │   ├── dashboard/      # StatCard、RecentApps、FollowUpList
│   │   ├── jobs/           # JobCard、JobForm
│   │   ├── resume/         # 简历分析相关组件
│   │   ├── outreach/       # 邮件生成相关组件
│   │   ├── interview/      # 面试准备相关组件
│   │   └── analytics/      # 图表相关组件
│   ├── lib/                # 工具库
│   │   ├── store.ts        # Zustand 全局状态
│   │   ├── mock-data.ts    # 示例数据
│   │   ├── deepseek.ts     # DeepSeek API 客户端
│   │   └── utils.ts        # 通用工具函数
│   └── types/              # TypeScript 类型定义
│       └── index.ts
```

## 数据流

```
用户操作 → Zustand Store → 自动同步 localStorage
                ↓
         需要 AI 时 → API Route → DeepSeek → 返回结果
                ↓
         更新 Store → UI 自动刷新
```

## 设计风格

- 浅绿色主色调 + 棕色辅助 + 白色背景
- 左侧 Sidebar 导航 + 右侧内容区
- 卡片式布局 + 圆角设计
- 响应式适配桌面/平板/手机
