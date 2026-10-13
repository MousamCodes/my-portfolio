# ResumeFit

A Chrome extension that tailors your resume to the job page you are looking at, in one click.

Open a job posting on LinkedIn, Indeed, Internshala, Naukri, Greenhouse, Lever or most career pages, click the ResumeFit icon, press **Tailor my resume**, and you get:

- a fit score out of 100 with a verdict
- matched and missing keywords from the listing
- a one-page tailored resume in Markdown, editable in place
- a cover letter
- concrete tips and likely interview questions
- copy, download as `.md`, or save as PDF

It is free to use because it runs on **your own Gemini API key**, which Google gives away with a generous free tier. There is no server, no account and no tracking. Your resume, key and history live only in Chrome's local extension storage.

## Install (developer mode)

1. Open `chrome://extensions` and switch on **Developer mode** (top right).
2. Click **Load unpacked** and choose this `extension` folder.
3. Pin ResumeFit from the puzzle-piece menu, then click its icon on any job page.

## First run

1. Paste your resume as plain text or Markdown, or import a `.txt` / `.md` file.
2. Optionally paste a Gemini key from <https://aistudio.google.com/apikey>. No card is needed.
3. Save. The panel reads the current tab and shows the detected job. If a site cannot be read, paste the description into the box.

Without a key you still get the fit score and keyword gaps. The score is computed locally from the listing's own vocabulary.

## How it stays free

| Cost | How it is avoided |
|---|---|
| LLM calls | User brings their own Gemini key. The free tier covers hundreds of tailorings per day. |
| Hosting | None. Everything runs inside the extension. |
| Database | None. `chrome.storage.local` holds settings and the last 12 results. |
| PDF generation | The export page uses the browser's own print to PDF. |

## Privacy and permissions

- `activeTab` + `scripting`: read the job text from the tab you clicked the icon on. No access to other tabs or browsing history.
- `storage`: keep your resume, key and recent results locally.
- `sidePanel`: show the UI.
- Host permission for `generativelanguage.googleapis.com` only, so the key is sent nowhere else.

The model is instructed to use only facts present in your resume and never to invent experience. Always read the output before sending it.

## Project layout

```
extension/
  manifest.json      MV3 manifest
  background.js      opens the side panel on icon click
  sidepanel.html/css/js   the UI and all logic
  export.html/js     print-friendly page for Save as PDF
  lib/gemini.js      Gemini REST call with a JSON schema
  lib/match.js       offline keyword fit score
  lib/markdown.js    tiny safe Markdown renderer
  lib/storage.js     chrome.storage wrapper with localStorage fallback
  icons/             16, 48, 128 px
```

No build step. Edit a file, then click the reload icon on `chrome://extensions`.

## Publishing

- **Chrome Web Store**: one-time $5 developer fee. Zip the `extension` folder, upload, add 3 to 5 screenshots and the privacy statement above. Review usually takes a few days.
- **Gumroad**: list it as pay-what-you-want with a $0 minimum, link the Web Store page, and sell a small add-on such as a pack of resume templates or a Notion job tracker.
- **Portfolio**: add it as a case study with the fit-score screenshot and the "bring your own key" architecture note. That story, zero infra cost and honest grounding rules, is what recruiters remember.
