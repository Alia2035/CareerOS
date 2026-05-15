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

  // Resume
  "Resume Analyzer": { en: "Resume Analyzer", zh: "简历分析" },

  // Outreach
  "Cold Email Generator": { en: "Cold Email Generator", zh: "冷邮件生成器" },

  // Interview
  "Interview Prep": { en: "Interview Prep", zh: "面试准备" },

  // Analytics
  "Analytics": { en: "Analytics", zh: "数据分析" },

  // Settings
  "Settings": { en: "Settings", zh: "设置" },
  "Language": { en: "Language", zh: "语言" },
  "English": { en: "English", zh: "English" },
  "中文": { en: "中文", zh: "中文" },

  // Status values
  "Saved": { en: "Saved", zh: "已保存" },
  "All": { en: "All", zh: "全部" },

  // Misc
  "Give Feedback": { en: "Give Feedback", zh: "反馈建议" },
  "No jobs match the current filters.": { en: "No jobs match the current filters.", zh: "没有匹配当前筛选条件的职位。" },
  "No applications yet. Start tracking your job search!": { en: "No applications yet. Start tracking your job search!", zh: "暂无申请。开始追踪你的求职吧！" },
  "No follow-ups yet. Add one from the Jobs page!": { en: "No follow-ups yet. Add one from the Jobs page!", zh: "暂无跟进事项。在职位页面添加吧！" },
  "Today": { en: "Today", zh: "今天" },
  "Tomorrow": { en: "Tomorrow", zh: "明天" },
  "In ## days": { en: "In ## days", zh: "## 天后" },
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
