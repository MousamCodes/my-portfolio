export type ProjectCategory = "AI/ML" | "Full-Stack" | "Backend" | "Data" | "Agents";

export interface CaseStudy {
  problem: string;
  solution: string;
  architecture: string[]; // ordered pipeline steps, rendered as a flow
  features: string[];
  challenges: { challenge: string; resolution: string }[];
  results: string[];
}

export interface Project {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  period: string;
  categories: ProjectCategory[];
  tech: string[];
  featured: boolean;
  status: "live" | "complete" | "in-progress";
  links: { live?: string; github?: string };
  highlights: string[]; // short bullet metrics shown on cards
  caseStudy: CaseStudy;
  /** Role fit hints used by the offline project matcher. */
  roleKeywords: string[];
}

export const projects: Project[] = [
  {
    slug: "intervo",
    title: "Intervo",
    tagline: "Real-time voice AI interview platform",
    description:
      "AI-powered mock interviews over live voice. An AI agent asks adaptive questions, listens to the candidate, scores the transcript against a role-specific rubric and shows feedback on a dashboard.",
    period: "Apr – May 2026",
    categories: ["AI/ML", "Full-Stack", "Backend"],
    tech: ["Next.js", "TypeScript", "FastAPI", "Vapi SDK", "WebSockets", "Gemini 3 Flash", "Firebase", "Firestore", "Shadcn UI", "Vercel"],
    featured: true,
    status: "live",
    links: {
      live: "https://intervo-interview-ai.vercel.app",
      github: "https://github.com/MousamCodes/Intervo-interview-ai",
    },
    highlights: ["<800ms voice round-trip", "Adaptive LLM questioning", "Rubric-based auto scoring"],
    roleKeywords: ["ai", "ml", "llm", "full-stack", "fullstack", "backend", "frontend", "voice", "real-time", "nextjs", "react", "typescript", "python", "fastapi", "firebase", "product"],
    caseStudy: {
      problem:
        "Students preparing for placements rarely get realistic interview practice. Text-based mock interviews miss the pressure of speaking out loud, and human mock interviews are expensive and hard to schedule.",
      solution:
        "Intervo lets a candidate pick a role and tech stack, then holds a spoken interview with an AI agent in real time. Questions adapt to previous answers, every answer is scored and the candidate gets a written breakdown afterwards.",
      architecture: [
        "Candidate signs in (Firebase Auth) and configures role, level and tech stack",
        "Browser streams audio to Vapi over WebSockets; speech-to-text runs in the Vapi pipeline",
        "Vapi calls serverless FastAPI webhook handlers for each turn",
        "FastAPI builds context from prior answers and asks Gemini 3 Flash for the next question",
        "Text-to-speech returns the question to the candidate in under 800ms round-trip",
        "After the call, an evaluation job scores the transcript against a role-specific rubric",
        "Scores and feedback are persisted in Cloud Firestore and shown on the Next.js dashboard",
      ],
      features: [
        "Live bidirectional voice conversation with an AI interviewer",
        "Context-aware, adaptive question generation based on earlier responses",
        "Automated transcript evaluation with per-category scores and improvement tips",
        "Secure sessions using Firebase Admin SDK with HTTP-only cookies",
        "Dashboard of past interviews with scores and detected tech-stack icons",
      ],
      challenges: [
        {
          challenge: "Keeping the conversation natural meant the whole STT → LLM → TTS loop had to finish in well under a second.",
          resolution: "Moved orchestration to lightweight serverless FastAPI handlers, kept prompts short with a rolling context window and used Gemini Flash for low-latency generation.",
        },
        {
          challenge: "Protecting authenticated routes without leaking tokens to the client.",
          resolution: "Verified Firebase ID tokens on the server and issued HTTP-only session cookies, so session logic never runs in the browser.",
        },
        {
          challenge: "Making the LLM scoring consistent across candidates.",
          resolution: "Scored transcripts against explicit, role-specific rubrics with structured output instead of free-form grading.",
        },
      ],
      results: [
        "Deployed on Vercel and used for real mock interviews",
        "Sub-800ms round-trip latency on the voice loop",
        "End-to-end flow: auth → interview → scoring → dashboard, all automated",
      ],
    },
  },
  {
    slug: "notemind",
    title: "NoteMind",
    tagline: "PDF question-answering with RAG and citations",
    description:
      "Upload PDFs and ask questions about them. Documents are parsed and embedded asynchronously, stored in a vector database, and answers come back with source page citations.",
    period: "2026",
    categories: ["AI/ML", "Backend", "Full-Stack"],
    tech: ["Next.js", "TypeScript", "Inngest", "OpenAI Embeddings", "Qdrant", "RAG", "Docker"],
    featured: true,
    status: "complete",
    links: {},
    highlights: ["Event-driven ingestion", "Vector search in Qdrant", "Page-level citations"],
    roleKeywords: ["ai", "ml", "llm", "rag", "backend", "full-stack", "fullstack", "nextjs", "typescript", "vector", "search", "data", "nlp"],
    caseStudy: {
      problem:
        "Reading long PDFs (lecture notes, papers, manuals) to find one answer is slow, and generic chatbots cannot see the document or tell you where an answer came from.",
      solution:
        "NoteMind turns any PDF into a searchable knowledge base. Each upload is processed in the background, chunked and embedded, and questions are answered from the most relevant chunks with document and page citations.",
      architecture: [
        "PDF uploaded through a Next.js API route",
        "A document/uploaded event is dispatched to Inngest",
        "An Inngest worker parses the PDF, chunks the text and embeds each chunk with OpenAI",
        "Vectors and metadata (document, page) are upserted into Qdrant",
        "A question is embedded and matched by cosine similarity against stored chunks",
        "Top chunks are passed to the LLM, which answers with source citations",
      ],
      features: [
        "Asynchronous, retry-safe ingestion pipeline using event-driven queues",
        "Semantic search across multiple documents",
        "Answers include the document name and page number used",
        "Runs locally with Docker-hosted Qdrant or against a hosted instance",
      ],
      challenges: [
        {
          challenge: "Large PDFs made upload requests time out when parsing ran inline.",
          resolution: "Decoupled ingestion from the request using Inngest events so parsing and embedding run as background steps with retries.",
        },
        {
          challenge: "Chunk size trade-off between precision and context.",
          resolution: "Tuned chunk length and overlap so retrieved passages stay coherent while still pinpointing the right page.",
        },
      ],
      results: [
        "Full RAG pipeline: ingest → embed → store → retrieve → cite",
        "Demonstrates vector database and background-job architecture end to end",
      ],
    },
  },
  {
    slug: "job-apply-ai",
    title: "Job-Apply AI Agent",
    tagline: "Autonomous internship application agent",
    description:
      "A command-line agent that scores every listing in an internship tracker against a candidate profile, writes a tailored resume and cover letter for each good match, then drives a real browser to fill in applications and update the tracker.",
    period: "2026",
    categories: ["Agents", "AI/ML", "Backend"],
    tech: ["Python", "Playwright", "Claude API", "LLM Agents", "openpyxl", "YAML"],
    featured: true,
    status: "in-progress",
    links: {},
    highlights: ["Scores listings 0–100", "Tailored resume PDFs", "Browser form-filling agent"],
    roleKeywords: ["ai", "agent", "agents", "automation", "python", "llm", "backend", "scraping", "playwright", "ml"],
    caseStudy: {
      problem:
        "Applying to dozens of internships means re-reading every listing, rewriting the resume for each one and filling the same forms again and again, while keeping a spreadsheet up to date by hand.",
      solution:
        "A pipeline of commands (collect → match → tailor → apply → status) that gathers listings from Internshala and LinkedIn, asks an LLM for a fit score and verdict per listing, generates a tailored one-page resume and cover letter, and then uses a browser agent to fill in the application with a human confirmation before submit.",
      architecture: [
        "collect: scrape public listing pages (Internshala, LinkedIn guest API) into an Excel tracker",
        "match: fetch each job description and ask the LLM for fit score, verdict, missing skills and expected questions",
        "tailor: generate a role-specific resume PDF, cover letter and prepared answers from profile.yaml",
        "apply: Playwright drives Chrome with the saved login sessions, fills forms, waits for confirmation",
        "status: writes application status and dates back into the tracker spreadsheet",
      ],
      features: [
        "Grounded generation: the agent may only use facts present in profile.yaml, never invent",
        "Human-in-the-loop submit by default, with an opt-in auto-submit flag",
        "Reuses logged-in browser sessions so the agent never handles passwords",
        "Ranked match table with reasons, red flags and missing requirements",
      ],
      challenges: [
        {
          challenge: "LinkedIn and Internshala block or pad guest searches and redirect some filters.",
          resolution: "Fell back to LinkedIn's guest job-postings endpoint, cleared only site-specific cookies, and post-filtered Internshala results by city.",
        },
        {
          challenge: "Spreadsheet locked while it was open in Excel.",
          resolution: "Detected the lock and reported it clearly instead of silently losing status updates.",
        },
      ],
      results: [
        "173 listings collected and scored in one run, split into apply / maybe / filtered-out sheets",
        "Reduces a multi-hour weekly chore to a few commands with review checkpoints",
      ],
    },
  },
  {
    slug: "cnn-emotion-classifier",
    title: "CNN Emotion Classifier",
    tagline: "Facial emotion detection with a custom CNN",
    description:
      "A convolutional neural network designed from scratch in TensorFlow/Keras that classifies facial expressions into 7 emotions with 91% validation accuracy.",
    period: "Mar 2025",
    categories: ["AI/ML"],
    tech: ["Python", "TensorFlow", "Keras", "CNN", "Matplotlib", "NumPy"],
    featured: false,
    status: "complete",
    links: { github: "https://github.com/MousamCodes/image-classifier-cnn" },
    highlights: ["91% validation accuracy", "7 emotion classes", "~12% less overfitting"],
    roleKeywords: ["ml", "ai", "deep learning", "computer vision", "cnn", "tensorflow", "data", "research", "python"],
    caseStudy: {
      problem:
        "Recognising emotions from faces is a classic but hard vision task: small, low-resolution images, class imbalance and a strong tendency to overfit.",
      solution:
        "Designed a compact CNN with four convolutional blocks, batch normalisation and dropout, trained with data augmentation, and evaluated with confusion matrices and learning curves.",
      architecture: [
        "Load and normalise the 7-class facial emotion dataset",
        "Augment training images (flips, shifts, zoom) to improve generalisation",
        "4 × [Conv → BatchNorm → ReLU → MaxPool] blocks with dropout",
        "Dense head with softmax over 7 emotions",
        "Track training/validation curves and confusion matrix with Matplotlib",
      ],
      features: [
        "Custom architecture rather than a pre-trained backbone",
        "Regularisation strategy: dropout, batch normalisation and augmentation",
        "Reproducible preprocessing, training and evaluation notebook",
      ],
      challenges: [
        {
          challenge: "Validation accuracy plateaued while training accuracy kept rising.",
          resolution: "Added augmentation and batch normalisation, which cut the train/validation gap by roughly 12%.",
        },
      ],
      results: ["91% validation accuracy on 7 classes", "Clear per-class error analysis via confusion matrix"],
    },
  },
  {
    slug: "twitter-sentiment-analysis",
    title: "Twitter Sentiment Analysis",
    tagline: "NLP pipeline from raw tweets to a live trend dashboard",
    description:
      "An end-to-end sentiment pipeline: a classifier trained on the 1.6M-tweet Sentiment140 dataset, applied to 10K+ live tweets on trending topics and visualised as a sentiment-trend dashboard.",
    period: "Sep 2025",
    categories: ["AI/ML", "Data"],
    tech: ["Python", "NLP", "TF-IDF", "VADER", "Logistic Regression", "Tweepy", "Twitter API", "Matplotlib"],
    featured: false,
    status: "complete",
    links: { github: "https://github.com/MousamCodes/twitter-sentiment-analysis" },
    highlights: ["~85% accuracy", "10K+ live tweets", "Trend dashboard"],
    roleKeywords: ["data", "analytics", "nlp", "ml", "ai", "python", "analyst", "visualization"],
    caseStudy: {
      problem:
        "Public opinion on a trending topic shifts quickly, but reading thousands of tweets by hand is impossible and keyword counts miss tone.",
      solution:
        "Collect tweets through the Twitter API, clean and vectorise them, classify sentiment with a trained model (plus VADER as a lexicon baseline) and plot sentiment over time per topic.",
      architecture: [
        "Stream and store tweets for a set of trending topics via Tweepy",
        "Clean text: URLs, mentions, emojis, stop-words; tokenise",
        "TF-IDF features → Logistic Regression trained on Sentiment140",
        "Score each live tweet; compare with VADER lexicon scores",
        "Aggregate by topic and time window; render dashboard with Matplotlib",
      ],
      features: [
        "Handles noisy social-media text",
        "Model-based and lexicon-based sentiment for comparison",
        "Topic-level trend charts",
      ],
      challenges: [
        {
          challenge: "Sarcasm and slang produce misleading lexicon scores.",
          resolution: "Used the trained TF-IDF + Logistic Regression model as the primary signal and VADER only as a sanity check.",
        },
      ],
      results: ["~85% classification accuracy", "10K+ tweets processed into topic-level insights"],
    },
  },
  {
    slug: "ai-developer-hq",
    title: "AI Developer HQ (this site)",
    tagline: "A portfolio that is itself an AI product",
    description:
      "This portfolio: a SaaS-style dashboard with product case studies and two AI features (Ask My Portfolio and a role-based project matcher) powered by retrieval over the site's own content.",
    period: "Oct 2026",
    categories: ["Full-Stack", "AI/ML"],
    tech: ["Next.js", "TypeScript", "Tailwind CSS", "Framer Motion", "Gemini API", "Embeddings", "RAG", "Vercel"],
    featured: false,
    status: "live",
    links: { github: "https://github.com/MousamCodes" },
    highlights: ["Streaming RAG chat", "Role → project matcher", "Zero-infra, free tier"],
    roleKeywords: ["frontend", "full-stack", "fullstack", "ai", "react", "nextjs", "typescript", "3d", "design", "web"],
    caseStudy: {
      problem: "Recruiters skim portfolios in seconds. A static list of projects does not show how someone thinks or what they can build with AI tooling.",
      solution: "Make the portfolio an AI application: visitors ask questions in natural language and get grounded answers, or pick a role and get ranked, explained project recommendations.",
      architecture: [
        "Profile and project case studies live as typed data modules",
        "A build script chunks that data and stores Gemini embeddings in a JSON index",
        "The chat API embeds the question, ranks chunks by cosine similarity and streams a grounded Gemini answer",
        "The matcher API asks Gemini for structured JSON scores per project, with an offline keyword fallback",
      ],
      features: ["Streaming chat with source chips", "Structured JSON project matching", "Static case-study pages with SEO metadata"],
      challenges: [
        { challenge: "Keeping AI answers honest.", resolution: "The model only sees retrieved chunks and is instructed to say when something is not in the portfolio." },
        { challenge: "Streaming without a heavy client library.", resolution: "The API returns a plain text stream and the widget reads it with the Fetch reader API; sources travel in a response header." },
      ],
      results: ["Zero-infrastructure RAG: no vector database, runs on Vercel free tier"],
    },
  },
];

export const featuredProjects = projects.filter((p) => p.featured);
export const getProject = (slug: string) => projects.find((p) => p.slug === slug);
export const allCategories: ProjectCategory[] = ["AI/ML", "Full-Stack", "Backend", "Agents", "Data"];
