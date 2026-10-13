// Offline fit score. No API needed: pulls the most frequent skill-like terms
// out of the job description and checks which ones the resume already covers.

const STOP = new Set(
  `a about above across after again against all also am an and any are as at be because been before
being below between both but by can could did do does doing down during each few for from further
had has have having he her here hers him his how i if in into is it its itself just me more most my
no nor not now of off on once only or other our ours out over own same she should so some such than
that the their theirs them then there these they this those through to too under until up very was
we were what when where which while who whom why will with would you your yours job role team work
working experience years year strong ability skills skill required requirements responsibilities
responsibility preferred plus including include knowledge understanding candidate candidates position
opportunity company environment benefits apply application qualifications qualification degree
bachelor bachelors master masters related field fields excellent good great new using use used
develop development developing build building design designing support ensure within across daily
etc per month week day hours time full part remote hybrid onsite location salary stipend internship
intern looking seeking join based must should able well high level least minimum maximum one two
three four five six annum ctc lpa inr usd eur we're you'll you're our's about us what who engineer
intern team product features nice have plus`.split(/\s+/)
);

// Terms the resume may express differently from the listing.
const ALIASES = {
  "retrieval augmented generation": ["rag"],
  "large language models": ["llm", "llms", "gemini", "claude", "openai", "gpt"],
  llm: ["large language model", "gemini", "claude", "openai", "gpt"],
  llms: ["large language model", "gemini", "claude", "openai", "gpt"],
  "natural language processing": ["nlp"],
  "machine learning": ["ml"],
  "computer vision": ["cnn", "image classifier", "opencv"],
  "ci/cd": ["github actions", "gitlab ci", "jenkins"],
  "version control": ["git", "github"],
  "amazon web services": ["aws"],
  "google cloud": ["gcp"],
  javascript: ["typescript", "node.js", "react", "next.js"],
  frontend: ["react", "next.js", "tailwind"],
  backend: ["node.js", "express", "fastapi", "django", "flask", "api"],
};

const KNOWN_PHRASES = [
  "machine learning", "deep learning", "data science", "data analysis", "data engineering",
  "computer vision", "natural language processing", "large language models", "prompt engineering",
  "react native", "next.js", "node.js", "vue.js", "express.js", "tailwind css", "rest api",
  "rest apis", "graphql", "unit testing", "test driven", "ci/cd", "version control",
  "problem solving", "communication skills", "project management", "product management",
  "cloud computing", "google cloud", "amazon web services", "power bi", "google analytics",
  "digital marketing", "content writing", "customer support", "user research", "ui/ux",
  "system design", "microservices", "object oriented", "agile", "scrum", "sql", "nosql",
  "vector database", "retrieval augmented generation", "fine tuning", "generative ai",
];

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");
const normalize = (s) => String(s || "").toLowerCase().replace(/[“”’"']/g, "");

export function offlineMatch(resume, jobDescription) {
  const jd = normalize(jobDescription);
  const cv = normalize(resume);
  const counts = new Map();

  for (const phrase of KNOWN_PHRASES) {
    const re = new RegExp(`\\b${escapeRe(phrase)}\\b`, "g");
    const n = (jd.match(re) || []).length;
    if (n) counts.set(phrase, n + 1);
  }

  const tokens = jd.match(/[a-z][a-z0-9+#.]{1,}/g) || [];
  for (let t of tokens) {
    t = t.replace(/\.$/, "");
    if (t.length < 2 || STOP.has(t) || /^\d+$/.test(t)) continue;
    counts.set(t, (counts.get(t) || 0) + 1);
  }

  const ranked = [...counts.entries()]
    .filter(([term, n]) => n >= 2 || term.includes(" ") || /[+#.]/.test(term))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 24);

  let total = 0;
  let hit = 0;
  const matched = [];
  const missing = [];
  for (const [term, n] of ranked) {
    const w = Math.min(n, 4);
    total += w;
    const covered = cv.includes(term) || (ALIASES[term] || []).some((a) => cv.includes(a));
    if (covered) {
      hit += w;
      matched.push(term);
    } else {
      missing.push(term);
    }
  }
  const score = total ? Math.round((hit / total) * 100) : 0;
  const verdict = score >= 75 ? "Strong match" : score >= 50 ? "Worth applying" : "Stretch";
  return {
    score,
    verdict,
    summary: ranked.length
      ? `The listing leans on ${ranked.slice(0, 4).map(([t]) => t).join(", ")}. Your resume already covers ${matched.length} of the ${ranked.length} key terms.`
      : "Not enough text in the job description to score.",
    matched_keywords: matched,
    missing_keywords: missing,
    tailored_resume: "",
    cover_letter: "",
    tips: missing.length
      ? [`If you genuinely have experience with ${missing.slice(0, 3).join(", ")}, say so explicitly in your skills or project bullets.`]
      : [],
    questions: [],
    offline: true,
  };
}
