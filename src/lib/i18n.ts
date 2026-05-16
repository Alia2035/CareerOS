import { getLanguage, type Language } from "@/lib/settingsStore";

export type { Language };

type TranslationMap = Record<string, Record<Language, string>>;

const translations: TranslationMap = {
  // Dashboard
  "Dashboard": { en: "Dashboard", zh: "仪表盘" },
  "Total": { en: "Total", zh: "总计" },
  "Applied": { en: "Applied", zh: "已投递" },
  "Interview": { en: "Interview", zh: "面试" },
  "Offer": { en: "Offer", zh: "录取" },
  "Rejected": { en: "Rejected", zh: "已拒绝" },
  "Response Rate": { en: "Response Rate", zh: "回应率" },
  "Interview Rate": { en: "Interview Rate", zh: "面试率" },
  "Offer Rate": { en: "Offer Rate", zh: "录取率" },
  "Upcoming Interviews": { en: "Upcoming Interviews", zh: "即将面试" },
  "No upcoming interviews": { en: "No upcoming interviews", zh: "暂无即将到来的面试" },
  "Recent Applications": { en: "Recent Applications", zh: "最近申请" },
  "View all": { en: "View all", zh: "查看全部" },
  "Pending Follow-ups": { en: "Pending Follow-ups", zh: "待跟进" },

  // Sidebar navigation
  "Jobs": { en: "Jobs", zh: "职位" },
  "Resume": { en: "Resume", zh: "简历" },
  "Outreach": { en: "Outreach", zh: "外联" },
  "Analytics": { en: "Analytics", zh: "数据分析" },
  "Settings": { en: "Settings", zh: "设置" },
  "Give Feedback": { en: "Give Feedback", zh: "反馈建议" },

  // Settings
  "Language": { en: "Language", zh: "语言" },
  "System Language": { en: "System Language", zh: "系统语言" },
  "English": { en: "English", zh: "English" },
  "中文": { en: "中文", zh: "中文" },
  "API Configuration": { en: "API Configuration", zh: "API 配置" },
  "AI Provider": { en: "AI Provider", zh: "AI 供应商" },
  "API Key": { en: "API Key", zh: "API 密钥" },
  "Base URL": { en: "Base URL", zh: "基础 URL" },
  "Model Name": { en: "Model Name", zh: "模型名称" },
  "Save": { en: "Save", zh: "保存" },
  "Saved!": { en: "Saved!", zh: "已保存！" },
  "Save Language": { en: "Save Language", zh: "保存语言" },
  "Language saved": { en: "Language saved", zh: "语言已保存" },
  "Clear": { en: "Clear", zh: "清除" },
  "Test Connection": { en: "Test Connection", zh: "测试连接" },
  "Testing...": { en: "Testing...", zh: "测试中..." },
  "Connection successful": { en: "Connection successful", zh: "连接成功" },
  "Connection failed — check your API key, base URL, and model.": {
    en: "Connection failed — check your API key, base URL, and model.",
    zh: "连接失败 — 请检查 API 密钥、基础 URL 和模型名称。",
  },
  "Data Backup": { en: "Data Backup", zh: "数据备份" },
  "Export Data": { en: "Export Data", zh: "导出数据" },
  "Import Data": { en: "Import Data", zh: "导入数据" },

  // Jobs
  "Job Tracker": { en: "Job Tracker", zh: "职位追踪" },
  "Add Job": { en: "Add Job", zh: "添加职位" },
  "Edit Job": { en: "Edit Job", zh: "编辑职位" },
  "Find Jobs with AI": { en: "Find Jobs with AI", zh: "AI 职位搜索" },
  "Company": { en: "Company", zh: "公司" },
  "Position": { en: "Position", zh: "职位" },
  "Location": { en: "Location", zh: "地点" },
  "Status": { en: "Status", zh: "状态" },
  "Applied Date": { en: "Applied Date", zh: "投递日期" },
  "Follow-up Date": { en: "Follow-up Date", zh: "跟进日期" },
  "Deadline Date": { en: "Deadline Date", zh: "截止日期" },
  "Interview Date": { en: "Interview Date", zh: "面试日期" },
  "Interview Time": { en: "Interview Time", zh: "面试时间" },
  "Interview Stage": { en: "Interview Stage", zh: "面试阶段" },
  "Assessment": { en: "Assessment", zh: "笔试/测评" },
  "First Interview": { en: "First Interview", zh: "一面" },
  "Second Interview": { en: "Second Interview", zh: "二面" },
  "Final Interview": { en: "Final Interview", zh: "终面" },
  "Custom": { en: "Custom", zh: "自定义" },
  "Salary": { en: "Salary", zh: "薪资" },
  "Source": { en: "Source", zh: "来源" },
  "Job URL": { en: "Job URL", zh: "职位链接" },
  "Job Description": { en: "Job Description", zh: "职位描述" },
  "Notes": { en: "Notes", zh: "备注" },
  "Edit": { en: "Edit", zh: "编辑" },
  "Delete": { en: "Delete", zh: "删除" },
  "Cancel": { en: "Cancel", zh: "取消" },
  "Save Changes": { en: "Save Changes", zh: "保存修改" },
  "Delete Job?": { en: "Delete Job?", zh: "删除职位？" },
  "Not analyzed": { en: "Not analyzed", zh: "未分析" },
  "Show more": { en: "Show more", zh: "展开" },
  "Show less": { en: "Show less", zh: "收起" },
  "Next:": { en: "Next:", zh: "下一步：" },
  "All": { en: "All", zh: "全部" },
  "Saved": { en: "Saved", zh: "已保存" },
  "Not Analyzed": { en: "Not Analyzed", zh: "未分析" },
  "ATS ≥ 80%": { en: "ATS ≥ 80%", zh: "ATS ≥ 80%" },
  "ATS 60–79%": { en: "ATS 60–79%", zh: "ATS 60–79%" },
  "ATS < 60%": { en: "ATS < 60%", zh: "ATS < 60%" },
  "Default": { en: "Default", zh: "默认" },
  "ATS: High → Low": { en: "ATS: High → Low", zh: "ATS：高 → 低" },
  "ATS: Low → High": { en: "ATS: Low → High", zh: "ATS：低 → 高" },
  "No jobs match the current filters.": { en: "No jobs match the current filters.", zh: "没有匹配当前筛选条件的职位。" },

  // Resume
  "Resume Analyzer": { en: "Resume Analyzer", zh: "简历分析" },
  "Analyze Resume": { en: "Analyze Resume", zh: "分析简历" },
  "Analyzing...": { en: "Analyzing...", zh: "分析中..." },
  "ATS Match Score": { en: "ATS Match Score", zh: "ATS 匹配分数" },
  "Matched Keywords": { en: "Matched Keywords", zh: "匹配关键词" },
  "Missing Keywords": { en: "Missing Keywords", zh: "缺失关键词" },
  "Optimization Suggestions": { en: "Optimization Suggestions", zh: "优化建议" },
  "Generate Improved Resume": { en: "Generate Improved Resume", zh: "生成优化简历" },
  "Generating...": { en: "Generating...", zh: "生成中..." },
  "Original Resume": { en: "Original Resume", zh: "原始简历" },
  "Improved Resume": { en: "Improved Resume", zh: "优化后简历" },
  "Resume Comparison": { en: "Resume Comparison", zh: "简历对比" },
  "Regenerate": { en: "Regenerate", zh: "重新生成" },

  // Outreach
  "Cold Email Generator": { en: "Cold Email Generator", zh: "冷邮件生成器" },
  "Generate Email": { en: "Generate Email", zh: "生成邮件" },
  "Cold Email": { en: "Cold Email", zh: "冷邮件" },
  "Connect Message": { en: "Connect Message", zh: "连接消息" },
  "Follow-up Email": { en: "Follow-up Email", zh: "跟进邮件" },
  "Follow-up Scenario": { en: "Follow-up Scenario", zh: "跟进场景" },
  "Email Type": { en: "Email Type", zh: "邮件类型" },

  // Interview
  "Interview Prep": { en: "Interview Prep", zh: "面试准备" },
  "Generate Questions": { en: "Generate Questions", zh: "生成问题" },
  "Get Feedback": { en: "Get Feedback", zh: "获取反馈" },
  "Mock Interview": { en: "Mock Interview", zh: "模拟面试" },
  "Your Answer": { en: "Your Answer", zh: "你的回答" },
  "Strengths": { en: "Strengths", zh: "优势" },
  "Areas to Improve": { en: "Areas to Improve", zh: "改进空间" },
  "Suggested Better Answer": { en: "Suggested Better Answer", zh: "建议更好的回答" },
  "STAR Structure Check": { en: "STAR Structure Check", zh: "STAR 结构检查" },
  "Behavioral": { en: "Behavioral", zh: "行为" },
  "Technical": { en: "Technical", zh: "技术" },
  "Resume-based": { en: "Resume", zh: "简历" },
  "JD-based": { en: "JD-based", zh: "JD相关" },

  // Analytics
  "Application Status": { en: "Application Status", zh: "申请状态" },
  "Application Trend (30d)": { en: "Application Trend (30d)", zh: "申请趋势（30天）" },
  "Applications by Source": { en: "Applications by Source", zh: "按来源分布" },
  "No data yet": { en: "No data yet", zh: "暂无数据" },

  // Misc
  "No applications yet. Start tracking your job search!": { en: "No applications yet. Start tracking your job search!", zh: "暂无申请。开始追踪你的求职吧！" },
  "No follow-ups yet. Add one from the Jobs page!": { en: "No follow-ups yet. Add one from the Jobs page!", zh: "暂无跟进事项。在职位页面添加吧！" },
  "Today": { en: "Today", zh: "今天" },
  "Tomorrow": { en: "Tomorrow", zh: "明天" },
  "In ## days": { en: "In ## days", zh: "## 天后" },
  "Your Resume": { en: "Your Resume", zh: "你的简历" },
  "Copy": { en: "Copy", zh: "复制" },
  "Copied!": { en: "Copied!", zh: "已复制！" },
  "Select a Job": { en: "Select a Job", zh: "选择职位" },
  "Select a Job (optional)": { en: "Select a Job (optional)", zh: "选择职位（可选）" },
  "Results saved to job": { en: "Results saved to job", zh: "结果已保存至职位" },
};

export function t(key: string, language?: Language): string {
  const lang = language || getLanguage();
  const entry = translations[key];
  if (!entry) return key;
  return entry[lang] || key;
}

export function useT() {
  const lang = typeof window !== "undefined" ? getLanguage() : "en";
  return (key: string) => t(key, lang);
}

export function getLocale(): string {
  return getLanguage() === "zh" ? "zh-CN" : "en-GB";
}

export function langInstruction(language?: Language): string {
  const lang = language || getLanguage();
  return lang === "zh" ? "请始终使用中文回答。" : "Always respond in English.";
}
