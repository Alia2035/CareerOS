# CareerOS 需求文档

## 项目概述

CareerOS 是一个 AI 驱动的求职管理 Web 应用，帮助用户系统化管理求职全流程。

## 目标用户

求职者，个人使用，不需要多用户登录。

## 核心功能

### 1. Job Tracker（职位申请追踪）
- 保存职位信息（公司、岗位、地点、薪资、来源）
- 记录申请状态：Saved → Applied → Interview → Offer → Rejected
- 记录申请日期和备注

### 2. Resume Analyzer（简历分析）
- 输入职位描述（JD）和简历文本
- AI 提取关键词并计算 ATS Match Score
- 给出缺失关键词和优化建议

### 3. Cold Email Generator（邮件生成）
- 根据公司、岗位、个人背景生成个性化邮件
- 三种类型：Cold Email / Connect Message / Follow-up Email

### 4. Interview Prep（面试准备）
- AI 生成常见 Behavioral Questions
- 使用 STAR 方法提供参考答案

### 5. Follow-up Reminder（跟进提醒）
- 设置跟进日期、标记待跟进事项
- 可视化展示到期提醒

### 6. Analytics Dashboard（数据分析）
- 投递数量、回复率、面试率、Offer Rate
- 申请状态分布图、投递趋势图

### 7. Job URL Parser（职位链接解析）
- 粘贴招聘链接，AI 自动提取职位信息

## 页面列表

| 路由 | 页面名称 | 功能说明 |
|------|----------|----------|
| `/` | Dashboard | 统计概览 + 最近申请 + 待跟进 |
| `/jobs` | Job Tracker | 职位 CRUD + 状态筛选 |
| `/resume` | Resume Analyzer | JD + 简历 AI 分析 |
| `/outreach` | Cold Email | AI 生成邮件 |
| `/interview` | Interview Prep | AI 面试准备 |
| `/analytics` | Analytics | 数据图表 |

## 数据存储

使用浏览器 localStorage，Zustand 状态管理 + 持久化中间件。

## AI 集成

通过 Next.js API Routes 代理 DeepSeek API 调用，API Key 存储在 `.env.local` 中。
