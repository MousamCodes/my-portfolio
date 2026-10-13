import { store } from "./lib/storage.js";
import { renderMarkdown } from "./lib/markdown.js";

const id = new URLSearchParams(location.search).get("id");
const sheet = document.getElementById("sheet");
const title = document.getElementById("title");

(async () => {
  const doc = id ? await store.get(`export:${id}`) : null;
  if (!doc) {
    sheet.innerHTML = '<p class="empty">Nothing to export. Go back to ResumeFit and press "Save as PDF" again.</p>';
    return;
  }
  document.title = `${doc.title} – ResumeFit`;
  title.textContent = doc.kind === "cover" ? "Cover letter" : "Resume";
  sheet.classList.toggle("letter", doc.kind === "cover");
  sheet.innerHTML = renderMarkdown(doc.markdown);
})();

document.getElementById("print").addEventListener("click", () => window.print());
