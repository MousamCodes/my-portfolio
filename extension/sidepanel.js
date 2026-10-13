import { store } from "./lib/storage.js";
import { tailorWithGemini, validateKey } from "./lib/gemini.js";
import { offlineMatch } from "./lib/match.js";
import { renderMarkdown } from "./lib/markdown.js";

const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const hasChrome = typeof chrome !== "undefined" && !!chrome.scripting && !!chrome.tabs;

const DEFAULTS = {
  apiKey: "",
  model: "gemini-2.5-flash",
  tone: "confident and concise",
  coverLetter: true,
  resume: "",
};

const state = {
  settings: { ...DEFAULTS },
  job: null,
  entry: null,
  history: [],
  tab: "resume",
  editing: false,
  busy: false,
  firstRun: false,
  progressTimer: null,
};

const FIELD_BY_TAB = { resume: "tailored_resume", cover: "cover_letter" };
const PROGRESS_STEPS = [
  "Reading the job…",
  "Matching your experience…",
  "Rewriting bullets…",
  "Drafting the cover letter…",
  "Almost there…",
];

/* ------------------------------------------------------------------ */
/* Runs INSIDE the job page via chrome.scripting. Must be self-contained. */
function extractJobFromPage() {
  const clean = (s) =>
    String(s || "")
      .replace(/ /g, " ")
      .replace(/[ \t]+/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  const textOf = (el) => (el ? clean(el.innerText || el.textContent) : "");
  const htmlToText = (html) => {
    const d = document.createElement("div");
    d.innerHTML = html;
    return clean(d.innerText || d.textContent);
  };
  const pick = (sels, max = Infinity) => {
    for (const sel of sels) {
      try {
        const el = document.querySelector(sel);
        const t = textOf(el);
        if (t && t.length <= max) return t;
      } catch {}
    }
    return "";
  };

  let title = "";
  let company = "";
  let description = "";

  for (const s of document.querySelectorAll('script[type="application/ld+json"]')) {
    try {
      const data = JSON.parse(s.textContent);
      const items = Array.isArray(data) ? data : data["@graph"] || [data];
      for (const it of items) {
        if (!it) continue;
        const types = [].concat(it["@type"] || []);
        if (!types.includes("JobPosting")) continue;
        title = title || clean(it.title);
        company = company || clean(it.hiringOrganization && it.hiringOrganization.name);
        description = description || htmlToText(it.description || "");
      }
    } catch {}
  }

  title =
    title ||
    pick(
      [
        ".job-details-jobs-unified-top-card__job-title",
        ".top-card-layout__title",
        "[data-testid='jobsearch-JobInfoHeader-title']",
        ".jobsearch-JobInfoHeader-title",
        ".heading_4_5.profile",
        ".profile_heading",
        "h1.jd-header-title",
        ".app-title",
        ".posting-headline h2",
        "h1.job-title",
        "h1",
      ],
      140
    );
  company =
    company ||
    pick(
      [
        ".job-details-jobs-unified-top-card__company-name",
        ".topcard__org-name-link",
        "[data-testid='inlineHeader-companyName']",
        ".company_name",
        ".link_display_like_text",
        ".jd-header-comp-name a",
        ".posting-categories .company",
        ".company-name",
      ],
      80
    );
  description =
    description ||
    pick([
      "#job-details",
      ".jobs-description__content",
      ".show-more-less-html__markup",
      ".description__text",
      "#jobDescriptionText",
      ".jobsearch-JobComponent-description",
      ".internship_details",
      ".detail_view",
      ".dang-inner-html",
      ".posting-page .section-wrapper",
      "[class*='job-description']",
      "[class*='jobDescription']",
      "[id*='job-description']",
      "[id*='jobDescription']",
      "article",
      "main",
    ]);

  if (description.length < 400) {
    let best = null;
    for (const el of document.querySelectorAll("main, article, section, div")) {
      const len = (el.innerText || "").length;
      if (len < 400 || len > 30000) continue;
      const biggestChild = Math.max(0, ...[...el.children].map((c) => (c.innerText || "").length));
      if (biggestChild > len * 0.7) continue;
      if (!best || len > best.len) best = { el, len };
    }
    const fallback = best ? textOf(best.el) : clean(document.body.innerText);
    if (fallback.length > description.length) description = fallback;
  }

  title = title || clean(document.title).split(/[|–—\-·]/)[0].trim();
  return {
    title,
    company,
    description: description.slice(0, 16000),
    url: location.href,
    source: location.hostname.replace(/^www\./, ""),
  };
}

/* ------------------------------------------------------------------ */
async function init() {
  state.settings = { ...DEFAULTS, ...(await store.get("settings", {})) };
  state.history = await store.get("history", []);
  bindEvents();
  fillSettingsForm();
  renderStatus();
  renderHistory();
  if (!state.settings.resume.trim()) {
    state.firstRun = true;
    showView("settings");
  } else {
    showView("home");
    scanJob();
  }
}

function showView(name) {
  $$(".view").forEach((v) => (v.hidden = v.dataset.view !== name));
  if (name === "settings") {
    $("#setup-intro").hidden = !state.firstRun;
    $("#settings-title").textContent = state.firstRun ? "Get set up" : "Settings";
    $("#btn-save").textContent = state.firstRun ? "Save and continue" : "Save";
  }
  $("#main").scrollTop = 0;
  window.scrollTo(0, 0);
}

function renderStatus() {
  const pill = $("#status-pill");
  const { resume, apiKey } = state.settings;
  if (!resume.trim()) {
    pill.className = "pill pill-muted";
    pill.textContent = "Add resume";
  } else if (apiKey) {
    pill.className = "pill pill-good";
    pill.textContent = "Ready";
  } else {
    pill.className = "pill pill-warn";
    pill.textContent = "Score only";
  }
  $("#mode-hint").textContent = apiKey
    ? "Writes a one-page resume, cover letter and interview prep."
    : "No key yet: you will get a fit score and keyword gaps. Add a free key in Settings for the full rewrite.";
}

/* ---------------------------- settings ----------------------------- */
function fillSettingsForm() {
  const s = state.settings;
  $("#resume").value = s.resume;
  $("#api-key").value = s.apiKey;
  $("#model").value = s.model;
  $("#tone").value = s.tone;
  $("#cover-letter").checked = !!s.coverLetter;
  updateResumeMeta();
}

function updateResumeMeta() {
  const words = $("#resume").value.trim().split(/\s+/).filter(Boolean).length;
  $("#resume-meta").textContent = words ? `${words} words` : "0 words";
}

async function saveSettings() {
  const resume = $("#resume").value.trim();
  if (!resume) {
    toast("Paste your resume first");
    $("#resume").focus();
    return;
  }
  state.settings = {
    resume,
    apiKey: $("#api-key").value.trim(),
    model: $("#model").value,
    tone: $("#tone").value,
    coverLetter: $("#cover-letter").checked,
  };
  await store.set("settings", state.settings);
  const wasFirstRun = state.firstRun;
  state.firstRun = false;
  renderStatus();
  toast("Saved");
  showView("home");
  if (wasFirstRun || !state.job) scanJob();
}

async function testKey() {
  const key = $("#api-key").value.trim();
  const out = $("#key-status");
  if (!key) {
    out.textContent = "Paste a key first.";
    return;
  }
  out.textContent = "Checking…";
  try {
    await validateKey(key);
    out.textContent = "Key works.";
    out.style.color = "var(--good)";
  } catch (e) {
    out.textContent = e.message;
    out.style.color = "var(--bad)";
  }
}

/* ------------------------------ job -------------------------------- */
function setJob(job, note = "") {
  state.job = job;
  $("#job-title").textContent = job?.title || (job ? "Untitled job" : "No job detected");
  const meta = [job?.company, job?.source].filter(Boolean).join(" · ");
  $("#job-meta").textContent = meta;
  $("#job-note").textContent = note;
  $("#job-note").hidden = !note;
  $("#job-text").value = job?.description || "";
  $("#job-details").open = !!note || !job;
  updateJobCount();
}

function updateJobCount() {
  const n = $("#job-text").value.trim().length;
  $("#job-count").textContent = n ? `· ${n.toLocaleString()} chars` : "";
}

async function scanJob() {
  $("#error").hidden = true;
  $("#job-title").textContent = "Scanning…";
  $("#job-meta").textContent = "";
  if (!hasChrome) {
    setJob(null, "Preview mode: paste a job description below.");
    return;
  }
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) throw new Error("no tab");
    const [{ result }] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: extractJobFromPage,
    });
    if (!result || result.description.length < 80) {
      setJob(result, "Could not find a job description on this page. Paste it below.");
      return;
    }
    setJob(result);
  } catch {
    setJob(null, "Click the ResumeFit icon while on the job tab to let it read the page, or paste the job description below.");
  }
}

function guessTitle(description) {
  const first = description.split("\n").map((l) => l.trim()).find((l) => l.length > 3) || "Job";
  return first.length > 90 ? first.slice(0, 87) + "…" : first;
}

/* ----------------------------- tailor ------------------------------ */
function setBusy(on) {
  state.busy = on;
  $("#btn-tailor").disabled = on;
  $("#btn-tailor").textContent = on ? "Working…" : "Tailor my resume";
  $("#progress").hidden = !on;
  clearInterval(state.progressTimer);
  if (on) {
    let i = 0;
    $("#progress-text").textContent = PROGRESS_STEPS[0];
    state.progressTimer = setInterval(() => {
      i = Math.min(i + 1, PROGRESS_STEPS.length - 1);
      $("#progress-text").textContent = PROGRESS_STEPS[i];
    }, 2200);
  }
}

function showError(msg) {
  $("#error").textContent = msg;
  $("#error").hidden = false;
}

async function tailor() {
  if (state.busy) return;
  $("#error").hidden = true;
  const description = $("#job-text").value.trim();
  if (description.length < 80) {
    showError("Paste the job description first, at least a few lines.");
    $("#job-details").open = true;
    return;
  }
  const resume = state.settings.resume.trim();
  if (!resume) {
    showView("settings");
    return;
  }
  const job = {
    title: state.job?.title || guessTitle(description),
    company: state.job?.company || "",
    url: state.job?.url || "",
    source: state.job?.source || "",
    description,
  };

  setBusy(true);
  try {
    const { apiKey, model, coverLetter, tone } = state.settings;
    const result = apiKey
      ? await tailorWithGemini({ apiKey, model, resume, job, coverLetter, tone })
      : offlineMatch(resume, description);
    const entry = {
      id: Date.now().toString(36),
      date: Date.now(),
      job: { title: job.title, company: job.company, url: job.url, source: job.source },
      result,
    };
    state.entry = entry;
    state.history = [entry, ...state.history].slice(0, 12);
    await store.set("history", state.history);
    renderHistory();
    openResult(entry);
  } catch (e) {
    showError(e.message || "Something went wrong.");
  } finally {
    setBusy(false);
  }
}

/* ----------------------------- result ------------------------------ */
function scoreClass(score) {
  return score >= 75 ? "good" : score >= 50 ? "warn" : "bad";
}

function openResult(entry) {
  state.entry = entry;
  state.editing = false;
  const r = entry.result;
  const cls = scoreClass(r.score);

  $("#result-title").textContent = entry.job.title || "Job";
  $("#result-company").textContent = [entry.job.company, entry.job.source].filter(Boolean).join(" · ");
  $("#score-num").textContent = r.score;
  const ring = $("#ring-fg");
  ring.className.baseVal = `ring-fg ${cls}`;
  ring.style.strokeDashoffset = 169.6;
  requestAnimationFrame(() =>
    requestAnimationFrame(() => (ring.style.strokeDashoffset = 169.6 * (1 - r.score / 100)))
  );
  const verdict = $("#verdict");
  verdict.className = `pill pill-${cls}`;
  verdict.textContent = r.verdict || "";
  $("#result-summary").textContent = r.summary || "";

  renderChips($("#kw-matched"), r.matched_keywords, "good", "Nothing matched yet.");
  renderChips($("#kw-missing"), r.missing_keywords, "warn", "No gaps found.");

  $("#offline-cta").hidden = !r.offline;
  $$(".tab").forEach((t) => (t.hidden = r.offline && t.dataset.tab !== "insights"));
  setTab(r.offline ? "insights" : "resume");
  showView("result");
}

function renderChips(el, items, cls, empty) {
  el.innerHTML = "";
  if (!items?.length) {
    const s = document.createElement("span");
    s.className = "hint";
    s.textContent = empty;
    el.appendChild(s);
    return;
  }
  for (const k of items) {
    const c = document.createElement("span");
    c.className = `chip ${cls}`;
    c.textContent = k;
    el.appendChild(c);
  }
}

function currentField() {
  return FIELD_BY_TAB[state.tab];
}

function currentText() {
  const f = currentField();
  return f ? state.entry?.result?.[f] || "" : "";
}

function setTab(name) {
  state.tab = name;
  state.editing = false;
  $$(".tab").forEach((t) => t.classList.toggle("active", t.dataset.tab === name));
  const isInsights = name === "insights";
  $("#toolbar").hidden = isInsights;
  $("#doc-editor").hidden = true;
  $("#btn-edit").textContent = "Edit";
  $("#doc-preview").hidden = isInsights;
  $("#doc-preview").classList.toggle("letter", name === "cover");
  $("#insights").hidden = !isInsights;
  if (isInsights) {
    renderList($("#tips"), state.entry?.result?.tips, "No tips for this one.");
    renderList($("#questions"), state.entry?.result?.questions, "Add a Gemini key to get interview questions.");
  } else {
    const text = currentText();
    $("#doc-preview").innerHTML = text
      ? renderMarkdown(text)
      : `<p class="hint">${name === "cover" ? "No cover letter was requested. Turn it on in Settings." : "Nothing here yet."}</p>`;
  }
}

function renderList(el, items, empty) {
  el.innerHTML = "";
  if (!items?.length) {
    const li = document.createElement("li");
    li.className = "hint";
    li.textContent = empty;
    el.appendChild(li);
    return;
  }
  for (const t of items) {
    const li = document.createElement("li");
    li.textContent = t;
    el.appendChild(li);
  }
}

async function toggleEdit() {
  const editor = $("#doc-editor");
  const preview = $("#doc-preview");
  if (!state.editing) {
    editor.value = currentText();
    editor.hidden = false;
    preview.hidden = true;
    $("#btn-edit").textContent = "Done";
    state.editing = true;
    editor.focus();
    return;
  }
  const f = currentField();
  if (f && state.entry) {
    state.entry.result[f] = editor.value;
    state.history = state.history.map((h) => (h.id === state.entry.id ? state.entry : h));
    await store.set("history", state.history);
  }
  state.editing = false;
  editor.hidden = true;
  preview.hidden = false;
  preview.innerHTML = renderMarkdown(currentText());
  $("#btn-edit").textContent = "Edit";
  toast("Saved");
}

function slug(s) {
  return String(s || "resume").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "resume";
}

function fileBase() {
  const j = state.entry?.job || {};
  return `${slug(j.company || j.title)}-${state.tab === "cover" ? "cover-letter" : "resume"}`;
}

async function copyDoc() {
  const text = state.editing ? $("#doc-editor").value : currentText();
  if (!text) return toast("Nothing to copy");
  try {
    await navigator.clipboard.writeText(text);
    toast("Copied");
  } catch {
    toast("Copy failed");
  }
}

function downloadDoc() {
  const text = state.editing ? $("#doc-editor").value : currentText();
  if (!text) return toast("Nothing to download");
  const blob = new Blob([text], { type: "text/markdown" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${fileBase()}.md`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

async function exportPdf() {
  const text = state.editing ? $("#doc-editor").value : currentText();
  if (!text) return toast("Nothing to export");
  const id = `${state.entry.id}-${state.tab}`;
  await store.set(`export:${id}`, {
    title: fileBase(),
    kind: state.tab,
    markdown: text,
    created: Date.now(),
  });
  const path = `export.html?id=${encodeURIComponent(id)}`;
  if (hasChrome && chrome.runtime?.getURL) chrome.tabs.create({ url: chrome.runtime.getURL(path) });
  else window.open(path, "_blank");
}

/* ----------------------------- history ----------------------------- */
function renderHistory() {
  const wrap = $("#history");
  const list = $("#history-list");
  list.innerHTML = "";
  wrap.hidden = !state.history.length;
  for (const h of state.history) {
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "history-item";
    const cls = scoreClass(h.result.score);
    const when = new Date(h.date).toLocaleDateString(undefined, { day: "numeric", month: "short" });
    btn.innerHTML = `
      <span class="history-score chip ${cls}"></span>
      <span class="history-main">
        <span class="history-title"></span>
        <span class="history-sub"></span>
      </span>`;
    btn.querySelector(".history-score").textContent = h.result.score;
    btn.querySelector(".history-title").textContent = h.job.title || "Job";
    btn.querySelector(".history-sub").textContent = [h.job.company, when, h.result.offline ? "score only" : ""].filter(Boolean).join(" · ");
    btn.addEventListener("click", () => openResult(h));
    li.appendChild(btn);
    list.appendChild(li);
  }
}

/* ------------------------------ misc ------------------------------- */
let toastTimer;
function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (t.hidden = true), 1600);
}

function bindEvents() {
  $("#btn-settings").addEventListener("click", () => {
    fillSettingsForm();
    showView("settings");
  });
  $("#btn-save").addEventListener("click", saveSettings);
  $("#btn-test-key").addEventListener("click", testKey);
  $("#btn-toggle-key").addEventListener("click", (e) => {
    const input = $("#api-key");
    const show = input.type === "password";
    input.type = show ? "text" : "password";
    e.target.textContent = show ? "Hide" : "Show";
  });
  $("#resume").addEventListener("input", updateResumeMeta);
  $("#resume-file").addEventListener("change", async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    $("#resume").value = await file.text();
    updateResumeMeta();
    e.target.value = "";
  });
  $("#btn-wipe").addEventListener("click", async () => {
    if (!confirm("Delete your resume, key and history from this browser?")) return;
    await store.clear();
    location.reload();
  });

  $("#btn-rescan").addEventListener("click", scanJob);
  $("#job-text").addEventListener("input", updateJobCount);
  $("#btn-tailor").addEventListener("click", tailor);

  $("#btn-back").addEventListener("click", () => showView("home"));
  $("#btn-add-key").addEventListener("click", () => {
    fillSettingsForm();
    showView("settings");
    $("#api-key").focus();
  });
  $$(".tab").forEach((t) => t.addEventListener("click", () => setTab(t.dataset.tab)));
  $("#btn-edit").addEventListener("click", toggleEdit);
  $("#btn-copy").addEventListener("click", copyDoc);
  $("#btn-download").addEventListener("click", downloadDoc);
  $("#btn-pdf").addEventListener("click", exportPdf);

  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter" && !$("[data-view='home']").hidden) tailor();
  });
}

init();
