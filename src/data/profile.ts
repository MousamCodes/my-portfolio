export const profile = {
  name: "Mousam Podder",
  firstName: "Mousam",
  handle: "MousamCodes",
  title: "AI Engineer & Full-Stack Developer",
  tagline: "I build AI-powered products end to end: real-time pipelines, LLM backends and polished web UIs.",
  location: "Konnagar, West Bengal, India",
  email: "mousampodder02@gmail.com",
  phone: "+91-7980610691",
  availability: "Open to Full-Stack, Backend and AI Engineering internships (remote or Kolkata).",
  summary:
    "Computer Science & Engineering student specialising in AI Engineering and Full-Stack Development. Experienced in building production-style systems: low-latency real-time pipelines, LLM-integrated backends and event-driven architectures using Python, TypeScript, Next.js, FastAPI and TensorFlow. Strong foundation in Data Structures & Algorithms, OOP and DBMS. Seeking an internship in Full-Stack, Backend or AI Engineering.",
  resumeUrl: "/Mousam_Podder_Resume.pdf",
  avatar: "https://avatars.githubusercontent.com/u/178002776?v=4",
  socials: {
    github: "https://github.com/MousamCodes",
    linkedin: "https://www.linkedin.com/in/mousampodder",
    x: "https://x.com/Mousam_Learning",
  },
  education: [
    {
      school: "Guru Nanak Institute of Technology, Sodepur",
      degree: "B.Tech in Computer Science & Engineering",
      period: "Aug 2023 – Aug 2027",
      detail: "CGPA 8.6 · Expected graduation Aug 2027",
    },
  ],
  certifications: [
    {
      name: "Supervised Machine Learning: Regression and Classification",
      issuer: "Stanford Online & DeepLearning.AI (Andrew Ng)",
      year: "2025",
    },
    {
      name: "Python for Everybody Specialization",
      issuer: "University of Michigan (Coursera)",
      year: "2024",
    },
    {
      name: "Data Analytics Virtual Experience",
      issuer: "Deloitte (Forage Job Simulation)",
      year: "2025",
    },
  ],
  skills: [
    {
      group: "Languages & Core",
      items: ["C++", "Python", "JavaScript", "TypeScript", "Data Structures & Algorithms", "OOP", "DBMS"],
    },
    {
      group: "AI & Machine Learning",
      items: ["TensorFlow", "Keras", "PyTorch", "Scikit-Learn", "CNNs", "NLP", "RAG", "LLM APIs (Gemini, OpenAI, Claude)", "Embeddings"],
    },
    {
      group: "Frontend",
      items: ["React", "Next.js", "Tailwind CSS", "Shadcn UI", "Framer Motion", "Clerk Auth", "Responsive UI"],
    },
    {
      group: "Backend, Data & Cloud",
      items: ["FastAPI", "Node.js", "Express", "Convex", "MongoDB", "Firebase", "Prisma ORM", "PostgreSQL", "REST APIs", "WebSockets"],
    },
    {
      group: "Workflow & DevOps",
      items: ["Inngest", "Qdrant", "Chrome Extensions (MV3)", "Git & GitHub", "Docker", "Vercel", "Playwright"],
    },
  ],
  achievements: [
    { label: "CGPA", value: "8.6", detail: "B.Tech CSE, GNIT (2023–2027)" },
    { label: "Voice AI latency", value: "<800ms", detail: "Round-trip in Intervo's interview pipeline" },
    { label: "CNN accuracy", value: "91%", detail: "7-class facial emotion classifier" },
    { label: "Tweets analysed", value: "10K+", detail: "Live sentiment pipeline, ~85% accuracy" },
  ],
  stats: {
    projects: 8,
    certifications: 3,
    yearsCoding: 3,
  },
  hiringPitch: [
    "Ships complete products, not demos: Intervo (real-time voice interviews) and Goat Note (PDF study assistant with cited answers) are both deployed with auth, background jobs and dashboards; ResumeFit is a working Chrome extension.",
    "Comfortable across the stack: TypeScript/Next.js frontends, FastAPI/Node backends, Firebase/MongoDB/Postgres data, and TensorFlow/Keras models.",
    "Hands-on with modern AI engineering: LLM orchestration, RAG with vector search (Convex, Qdrant), embeddings, structured JSON outputs, event-driven background jobs and browser agents.",
    "Strong CS fundamentals (DSA in C++, OOP, DBMS) with an 8.6 CGPA and recognised ML coursework from Stanford/DeepLearning.AI.",
  ],
} as const;

export type Profile = typeof profile;
