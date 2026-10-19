# Lordic Campus

A personal interactive university for Software Engineering. Learn, practise, examine, review and build, in one place.

> Lordic Campus is a learning platform, **not an accredited university**. The curriculum map is a proposed framework. Course codes, credit units, semester placements and compulsory/elective status are deliberately left blank until verified against your own institution (see `src/data/courses.ts`).

## Quick start

Requires Node.js 20 or newer (tested on Node 22).

```bash
npm ci            # install exact dependency versions from package-lock.json
npm run build     # production build
npm start         # serves on http://localhost:3000
```

Development: `npm run dev`. Tests: `npm test` (needs `python3` on PATH for the content tests). Type check: `npm run typecheck`.

No database, accounts or environment variables are needed. The Python runtime is bundled in `public/pyodide`, so coding exercises work offline.

## Offline use

In production, the app registers a service worker on HTTPS (and on `localhost` for local testing). After the first online visit, it saves the app entry page, the offline fallback, the manifest and icons, and static app assets. It also saves snapshots of pages as you visit them, up to 40 pages, and caches Pyodide assets the first time they are requested. When offline, previously saved pages are served from cache; a page not saved yet shows `offline.html`. The app switches internal links to full-page navigations while the browser reports itself offline so the service worker can serve those saved snapshots.

Progress remains in this browser's `localStorage`. Exam API requests and grading are intentionally not cached or queued, so starting or submitting an exam still requires a connection. Offline storage is best-effort and subject to browser storage limits; open the app online at least once before relying on it offline.

## What is in this release (Phase 1 to 5, plus the foundations of 7)

One **complete learning journey: Computer Programming I (Introduction to Programming)**, plus the full programme outline.

| Area | Status |
|---|---|
| Curriculum Explorer: 5 levels, **35 courses**, every module listed, verification status on each | Done (outlines for 34 courses; full content for 1) |
| Lessons | **16 lessons** covering all 12 modules: overview, explanation, worked examples, live demonstration, guided and independent practice, knowledge check, summary and terms, personal notes |
| Coding Laboratory | **17 exercises** run in a sandboxed Python (Pyodide in a Web Worker, 10 s limit, never on the server), automated and hidden edge-case tests, 4 progressive hints then solution, attempt history, playground |
| Classwork Centre | 8 sets (~100 marks): multiple choice, tracing, short answer and programming tasks, auto-marked, mistakes collected |
| Assignment Centre | 3 assignments with full briefs and rubrics. Code assignments are auto-marked by tests for the criteria that can be; the other criteria are **self-assessed** and labelled as such |
| Examination Centre | 4 timed exams from a 39-question bank: timer, navigator, flagging, autosave that survives reloads, auto-submit, server-side marking, topic breakdown, explanations, recommended revision |
| Mathematics Laboratory | Function grapher with derivative, power-rule stepper, algebra practice with steps, statistics, number bases, truth tables and logic gates, formula sheets |
| Revision Centre | Spaced-repetition flashcards, mistake notebook, weak-topic detection, cumulative quiz, saved items |
| Project Workshop | **20 projects** (beginner to capstone), each with requirements, acceptance criteria, architecture tasks, milestones, checklists, rubric, reflection |
| Study Planner, Progress, Grades, Notes, Resources, Settings | Done. Grades show every calculation. Mastery is evidence-based (opening a lesson is never evidence) |
| Academic Tutor | An **offline study helper** (concept search, hints, practice, Socratic questions, error explanations) using only course content. The AI tutor itself is not connected |
| Content administration | Read-only inventory at `/admin` (content is edited in `src/data`) |

### Not in this release (honest list)

* Lessons, classwork and assessments for the other 34 courses (outlines only; they are marked as such, never counted as complete).
* Languages other than Python; Monaco editor (a plain textarea editor is used to keep the bundle small and dependable).
* Accounts, cloud sync and multi-device progress (progress lives in your browser; use Settings > Export to back it up).
* A visual admin editor, AI tutor, written-response marking by AI, and the practical coding examination type.

## Architecture

* Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS 3. A modular monolith.
* `src/data`: curriculum, lessons, exercises, classwork, assignments, projects (plain typed data).
* `src/server`: exam answer keys and marking. Imported only by API routes; `server-only` makes the build fail if client code ever imports it.
* `src/lib`: state, mastery, gradebook, planner, safe boolean-expression parser (no `eval`), maths tools, Python runner.
* `public/pyodide`: Pyodide (MPL-2.0, unmodified) for in-browser Python. `public/pyodide-worker.mjs` runs it in a worker that is terminated on timeout.

## Security and privacy design

* Exam answers and explanations are **never sent to the browser before submission**; marking happens at `/api/exams/[id]/grade`. A test checks the public question payload.
* Submitted code runs only inside a browser Web Worker, with a hard time limit. It is never executed on the server.
* No `eval`, no `dangerouslySetInnerHTML`; lesson content is rendered as text.
* Data stays in this browser (`localStorage`). No tracking, no webcam or screen monitoring, no AI data sharing (none connected). Export and delete controls are in Settings.
* Coding-exercise tests and classwork keys ship to the browser (they are formative practice). Only the examinations are server-protected.

## Known advisory

`npm audit` reports PostCSS advisories that come bundled inside Next.js 15. They concern processing attacker-controlled CSS source maps at build time; this project only processes its own stylesheet, so it is not exploitable here. Clearing it requires a major upgrade to Next 16, which is a deliberate follow-up rather than a surprise change in a verified release.

## Quality checks

`npm test` runs 100+ checks, including: every reference solution passes its tests while its starter code does not; every code sample in every lesson is executed with real Python and its documented output compared; every code-tracing exam answer is checked against real Python; rubrics total 100; exam public payloads contain no answers; grading, mastery and parser logic.

## Editing content

Edit the files in `src/data`. Add a lesson to `lessons-a.ts`/`lessons-b.ts`, an exercise to `exercises.ts` (with a `solution`), then run `npm test`: the suite will execute your code samples and exercise tests. To make a course "complete", follow the definition in the product concept (real lessons, worked examples, classwork, assessments, tested code, clear completion criteria).

## Reference sources

NUC Computing CCMAS (https://www.nuc.edu.ng/ccmas/), University of Ibadan and FUTA Software Engineering course lists (see `/curriculum` in the app). These are references for alignment, not verification of any individual degree programme.

## Licences

Application code: yours to use. Pyodide is distributed under the Mozilla Public License 2.0 (https://github.com/pyodide/pyodide); the files in `public/pyodide` are unmodified copies from the `pyodide` npm package.
