/**
 * Intelligent keyword matching with synonym expansion, fuzzy matching,
 * and Chinese substring matching. Deterministic — no AI involved.
 */

// ── Types ──────────────────────────────────────────────────────────

export interface MatchResult {
  atsScore: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  /** Maps JD keyword → explanation of how it was matched (e.g. "fuzzy: ietls→ielts") */
  matchExplanations: Record<string, string>;
}

// ── Synonym Groups ─────────────────────────────────────────────────

interface SynonymGroup {
  canonical: string;
  aliases: string[];
}

const SYNONYM_GROUPS: SynonymGroup[] = [
  // ─── 中文：医药 / 生物 ───
  {
    canonical: "药代动力学",
    aliases: ["药代", "pharmacokinetics", "pk", "药物代谢动力学"],
  },
  {
    canonical: "药理学",
    aliases: ["pharmacology", "药理"],
  },
  {
    canonical: "毒理学",
    aliases: ["toxicology", "毒理"],
  },
  {
    canonical: "临床试验",
    aliases: ["clinical trial", "临床研究", "临床实验", "gcp", "good clinical practice"],
  },

  // ─── 中文：软技能 / 通用 ───
  {
    canonical: "团队协作",
    aliases: ["团队工作", "团队合作", "teamwork", "collaboration", "协作能力", "团队协作能力", "跨部门协作", "cross-functional collaboration"],
  },
  {
    canonical: "沟通能力",
    aliases: ["communication", "表达沟通", "人际沟通", "有效沟通"],
  },
  {
    canonical: "问题解决",
    aliases: ["problem solving", "解决问题", "分析问题", "problem-solving"],
  },
  {
    canonical: "领导力",
    aliases: ["leadership", "领导能力", "团队管理", "team management"],
  },
  {
    canonical: "项目管理",
    aliases: ["project management", "项目协调", "agile", "scrum"],
  },
  {
    canonical: "数据分析",
    aliases: ["data analysis", "data analytics", "数据挖掘", "data mining", "data processing", "data interpretation", "数据处理", "统计分析", "statistical analysis"],
  },

  // ─── 英文：编程 / 技术 ───
  {
    canonical: "machine learning",
    aliases: ["ml", "predictive modeling", "deep learning", "机器学习", "深度学习", "neural networks"],
  },
  {
    canonical: "artificial intelligence",
    aliases: ["ai", "人工智能", "intelligent systems"],
  },
  {
    canonical: "natural language processing",
    aliases: ["nlp", "自然语言处理", "文本分析", "text analysis"],
  },
  {
    canonical: "python",
    aliases: ["python3", "python programming"],
  },
  {
    canonical: "javascript",
    aliases: ["js", "ecmascript", "es6", "node.js", "nodejs", "node"],
  },
  {
    canonical: "typescript",
    aliases: ["ts"],
  },
  {
    canonical: "react",
    aliases: ["react.js", "reactjs", "react framework"],
  },
  {
    canonical: "vue",
    aliases: ["vue.js", "vuejs"],
  },
  {
    canonical: "kubernetes",
    aliases: ["k8s", "kube", "容器编排"],
  },
  {
    canonical: "docker",
    aliases: ["containerization", "容器化", "docker compose"],
  },
  {
    canonical: "ci/cd",
    aliases: ["continuous integration", "continuous deployment", "持续集成", "持续部署", "ci cd", "cicd"],
  },
  {
    canonical: "sql",
    aliases: ["mysql", "postgresql", "postgres", "数据库", "database", "rdbms"],
  },
  {
    canonical: "aws",
    aliases: ["amazon web services", "云端", "cloud computing", "云计算"],
  },
  {
    canonical: "git",
    aliases: ["version control", "版本控制", "github", "gitlab"],
  },
  {
    canonical: "rest api",
    aliases: ["restful", "api design", "web api", "接口开发"],
  },
  {
    canonical: "agile methodology",
    aliases: ["agile", "scrum", "kanban", "sprint", "敏捷开发"],
  },

  // ─── 英文：语言 / 认证 ───
  {
    canonical: "ielts",
    aliases: ["雅思", "ietls", "international english language testing system", "ielts academic", "ielts general"],
  },
  {
    canonical: "toefl",
    aliases: ["托福", "tofel", "test of english as a foreign language"],
  },
  {
    canonical: "英语流利",
    aliases: ["fluent english", "english proficiency", "英语熟练", "英文流利", "english fluent"],
  },

  // ─── 通用工具 ───
  {
    canonical: "microsoft excel",
    aliases: ["excel", "spreadsheet", "电子表格", "excell"],
  },
  {
    canonical: "microsoft powerpoint",
    aliases: ["powerpoint", "ppt", "演示文稿"],
  },
  {
    canonical: "figma",
    aliases: ["figma design", "figma tool"],
  },
  {
    canonical: "tableau",
    aliases: ["tableau desktop", "tableau software", "数据可视化"],
  },
  {
    canonical: "power bi",
    aliases: ["powerbi", "microsoft power bi", "商业智能"],
  },
];

// ── Build lookup maps (done once at module load) ───────────────────

const aliasToCanonical = new Map<string, string>();
const canonicalToAliases = new Map<string, Set<string>>();

for (const group of SYNONYM_GROUPS) {
  const canonNorm = normalizeText(group.canonical);
  aliasToCanonical.set(canonNorm, canonNorm);

  let aliasSet = canonicalToAliases.get(canonNorm);
  if (!aliasSet) {
    aliasSet = new Set();
    canonicalToAliases.set(canonNorm, aliasSet);
  }

  for (const alias of group.aliases) {
    const aliasNorm = normalizeText(alias);
    aliasToCanonical.set(aliasNorm, canonNorm);
    aliasSet.add(aliasNorm);
  }
  // also add the canonical itself to the alias set
  aliasSet.add(canonNorm);
}

// ── Common typo corrections ────────────────────────────────────────

const TYPO_MAP: Record<string, string> = {
  ietls: "ielts",
  tofel: "toefl",
  excell: "excel",
  "java script": "javascript",
  "type script": "typescript",
  "node js": "node.js",
  "power point": "powerpoint",
  "react js": "react.js",
  "vue js": "vue.js",
  "power bi ": "power bi",
  "restful api": "rest api",
};

// ── Normalization ──────────────────────────────────────────────────

function normalizeText(s: string): string {
  let t = s.toLowerCase().trim();
  // Remove common punctuation but keep hyphens within compound words
  t = t.replace(/[.,;:!?()（）【】「」""''、，。；：！？]/g, " ");
  t = t.replace(/\s+/g, " ");
  t = t.trim();
  return t;
}

export function normalizeKeyword(k: string): string {
  let t = normalizeText(k);
  // Fix known typos
  for (const [wrong, correct] of Object.entries(TYPO_MAP)) {
    if (t === wrong) {
      t = correct;
      break;
    }
  }
  return t;
}

// ── Synonym lookup ─────────────────────────────────────────────────

function getCanonical(kw: string): string {
  const norm = normalizeKeyword(kw);
  return aliasToCanonical.get(norm) || norm;
}

function getAliases(kw: string): Set<string> {
  const canon = getCanonical(kw);
  return canonicalToAliases.get(canon) || new Set([canon]);
}

// ── Fuzzy matching (Levenshtein) ───────────────────────────────────

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  let prev = new Array(n + 1);
  let curr = new Array(n + 1);
  for (let j = 0; j <= n; j++) prev[j] = j;

  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(
        prev[j] + 1,
        curr[j - 1] + 1,
        prev[j - 1] + cost,
      );
    }
    [prev, curr] = [curr, prev];
  }
  return prev[n];
}

function maxFuzzyDistance(s: string): number {
  if (s.length <= 3) return 0;   // too short, require exact
  if (s.length <= 5) return 1;
  return 2;
}

function hasCJK(s: string): boolean {
  return /[一-鿿㐀-䶿]/.test(s);
}

function isFuzzyMatch(a: string, b: string): boolean {
  // Only do fuzzy matching on primarily-ASCII strings
  if (hasCJK(a) || hasCJK(b)) return false;
  const maxDist = Math.max(maxFuzzyDistance(a), maxFuzzyDistance(b));
  return levenshtein(a, b) <= maxDist;
}

// ── Chinese substring matching ─────────────────────────────────────

function isChineseSubstringMatch(a: string, b: string): boolean {
  if (!hasCJK(a) || !hasCJK(b)) return false;
  const shorter = a.length <= b.length ? a : b;
  const longer = a.length <= b.length ? b : a;
  // Require at least 2 CJK chars in the shorter string
  const cjkCount = (shorter.match(/[一-鿿]/g) || []).length;
  if (cjkCount < 2) return false;
  // Don't match if the shorter is too small relative to the longer (avoid over-matching)
  if (shorter.length < longer.length * 0.35) return false;
  return longer.includes(shorter);
}

// ── Main matching logic ────────────────────────────────────────────

export function matchKeywords(
  jdKeywords: string[],
  resumeKeywords: string[],
): MatchResult {
  // Normalize all resume keywords and expand synonyms
  const resumeNormSet = new Set<string>();
  const resumeAliasSets: Set<string>[] = [];

  for (const rk of resumeKeywords) {
    const norm = normalizeKeyword(rk);
    resumeNormSet.add(norm);
    resumeAliasSets.push(getAliases(rk));
  }

  const matched: string[] = [];
  const missing: string[] = [];
  const explanations: Record<string, string> = {};

  for (const jdk of jdKeywords) {
    const jdNorm = normalizeKeyword(jdk);
    const jdCanon = getCanonical(jdk);
    const jdAliases = getAliases(jdk);

    let matchFound = false;
    let explanation = "";

    // Strategy 1: Exact match after normalization
    if (resumeNormSet.has(jdNorm)) {
      matchFound = true;
      explanation = `exact: "${jdk}"`;
    }

    // Strategy 2: Synonym group match
    if (!matchFound) {
      for (let ri = 0; ri < resumeKeywords.length; ri++) {
        const rAliases = resumeAliasSets[ri];
        const rNorm = normalizeKeyword(resumeKeywords[ri]);

        // Check if JD and resume share a synonym group
        for (const ja of jdAliases) {
          if (rAliases.has(ja)) {
            matchFound = true;
            explanation = `synonym: "${resumeKeywords[ri]}" → "${jdk}"`;
            break;
          }
        }
        if (matchFound) break;
      }
    }

    // Strategy 3: Fuzzy matching (English only)
    if (!matchFound) {
      for (const rk of resumeKeywords) {
        const rNorm = normalizeKeyword(rk);
        if (isFuzzyMatch(jdNorm, rNorm)) {
          matchFound = true;
          explanation = `fuzzy: "${rk}" ≈ "${jdk}"`;
          break;
        }
      }
    }

    // Strategy 4: Chinese substring matching
    if (!matchFound) {
      for (const rk of resumeKeywords) {
        const rNorm = normalizeKeyword(rk);
        if (isChineseSubstringMatch(jdNorm, rNorm)) {
          matchFound = true;
          explanation = `substring: "${rk}" ⊂ "${jdk}"`;
          break;
        }
      }
    }

    if (matchFound) {
      // Show the canonical form in matchedKeywords
      matched.push(jdCanon);
      explanations[jdCanon] = explanation;
    } else {
      missing.push(jdk);
    }
  }

  const atsScore = jdKeywords.length > 0
    ? Math.round((matched.length / jdKeywords.length) * 100)
    : 0;

  return { atsScore, matchedKeywords: matched, missingKeywords: missing, matchExplanations: explanations };
}
