"use client";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { LESSONS } from "@/data/lessons";
import { EXERCISES } from "@/data/exercises";
import { ASSIGNMENTS } from "@/data/assignments";
import { PROJECTS } from "@/data/projects";
import { COURSES } from "@/data/courses";
import { PageHeader, ProgressBar, Stat, Badge, Loading, Empty } from "@/components/ui";
import { courseProgress } from "@/lib/mastery";
import { recommendations } from "@/lib/recommend";
import { achievements, computeXp, levelFromXp } from "@/lib/achievements";
import { gradebook } from "@/lib/gradebook";

const today = () => new Date().toISOString().slice(0, 10);

export default function Dashboard() {
  const { state, ready } = useStore();
  if (!ready) return <Loading />;
  const prog = courseProgress(state, "prog1");
  const nextLesson = LESSONS.find((l) => !state.done[l.id]);
  const lastOpened = Object.entries(state.opened).sort((a, b) => b[1] - a[1])[0]?.[0];
  const resume = (lastOpened && !state.done[lastOpened] ? LESSONS.find((l) => l.id === lastOpened) : undefined) ?? nextLesson;
  const todays = state.plan.filter((p) => p.date === today());
  const upcoming = state.plan.filter((p) => p.date > today() && !p.done).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 4);
  const recs = recommendations(state);
  const ach = achievements(state);
  const earned = ach.filter((a) => a.earned);
  const xp = computeXp(state);
  const lvl = levelFromXp(xp);
  const gb = gradebook(state);
  const exercisesAttempted = Object.values(state.exercises).filter((e) => e.attempts > 0).length;
  const assignmentsDone = ASSIGNMENTS.filter((a) => state.assignments[a.id]?.submissions.length).length;
  const projectsDone = PROJECTS.filter((p) => p.milestones.every((m) => state.projects[p.id]?.[m])).length;
  const coursesStarted = COURSES.filter((c) => c.hasContent && courseProgress(state, c.id).done > 0).length;
  const coursesDone = COURSES.filter((c) => c.hasContent && courseProgress(state, c.id).percent === 100).length;
  const unfinishedAssignments = ASSIGNMENTS.filter((a) => !state.assignments[a.id]?.submissions.length);

  return (
    <div>
      <PageHeader title={state.profile.name ? `Welcome back, ${state.profile.name}` : "Welcome to Lordic Campus"} subtitle="Your personal academic workspace. The next useful step is always at the top." />

      {!state.profile.name && (
        <div className="card mb-6 border-gold-300 bg-gold-50">
          <p className="font-medium">New here? Start with <Link className="underline" href="/lessons/prog1-1-1">What a Program Is</Link>, the first lesson of Computer Programming I. You can add your name and daily study time in <Link className="underline" href="/settings">Settings</Link>.</p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="card lg:col-span-2" aria-labelledby="cont">
          <h2 id="cont" className="h3">Continue learning</h2>
          {resume ? (
            <div className="mt-3">
              <div className="flex flex-wrap items-center gap-2"><Badge tone="gold">Computer Programming I</Badge><Badge>Module {resume.moduleNo}</Badge></div>
              <p className="mt-2 font-serif text-2xl font-semibold">{resume.title}</p>
              <p className="muted">Estimated {resume.minutes} minutes · {resume.difficulty}</p>
              <div className="mt-4"><div className="mb-1 flex justify-between text-xs text-ink-500"><span>Course completion</span><span>{prog.done} of {prog.total} lessons · {prog.percent}%</span></div><ProgressBar value={prog.percent} label="Course completion" /></div>
              <Link href={`/lessons/${resume.id}`} className="btn btn-gold mt-4">{state.opened[resume.id] ? "Resume lesson" : "Start lesson"}</Link>
            </div>
          ) : (
            <div className="mt-3"><p className="font-serif text-xl font-semibold">You have completed every lesson in this release. 🎓</p><p className="muted">Take the Full Mock Semester Examination, then revisit weak topics in the Revision Centre.</p><Link href="/exams" className="btn btn-primary mt-3">Go to examinations</Link></div>
          )}
        </section>

        <section className="card" aria-labelledby="lvl">
          <h2 id="lvl" className="h3">Level and achievements</h2>
          <p className="mt-2 font-serif text-3xl font-semibold">Level {lvl.level}</p>
          <p className="muted">{xp} XP · earned from lessons completed, exercises passed, classwork, assignments and exams, not from time on the site.</p>
          <div className="mt-2"><ProgressBar value={lvl.progress * 100} label="Progress to next level" /></div>
          <div className="mt-3 flex flex-wrap gap-1.5">{earned.length ? earned.slice(-4).map((a) => <Badge key={a.id} tone="gold">🏅 {a.title}</Badge>) : <span className="muted">No achievements yet. Pass your first exercise!</span>}</div>
        </section>

        <section className="card lg:col-span-2" aria-labelledby="today">
          <div className="flex items-center justify-between"><h2 id="today" className="h3">Today&apos;s study plan</h2><Link href="/schedule" className="btn btn-sm">Open planner</Link></div>
          {todays.length ? (
            <table className="mt-3 w-full text-sm"><thead><tr className="text-left text-xs uppercase text-ink-500"><th className="py-1">Activity</th><th>Subject</th><th className="text-right">Time</th></tr></thead>
              <tbody>{todays.map((p) => <tr key={p.id} className="border-t border-ink-100"><td className={`py-2 ${p.done ? "text-ink-400 line-through" : ""}`}>{p.link ? <Link className="underline" href={p.link}>{p.title}</Link> : p.title}</td><td>{p.subject}</td><td className="text-right">{p.minutes} min</td></tr>)}</tbody></table>
          ) : (<Empty title="Nothing planned for today" href="/schedule" cta="Build today's plan">Generate a plan that fits your {state.profile.dailyMinutes} available minutes.</Empty>)}
        </section>

        <section className="card" aria-labelledby="up">
          <h2 id="up" className="h3">Upcoming activities</h2>
          <ul className="mt-2 space-y-2 text-sm">
            {upcoming.map((p) => <li key={p.id} className="flex justify-between gap-2"><span>{p.title}</span><span className="text-ink-500">{p.date}</span></li>)}
            {unfinishedAssignments.slice(0, 2).map((a) => <li key={a.id}><Link className="underline" href={`/assignments/${a.id}`}>{a.title}</Link> <span className="text-ink-500">(not yet submitted)</span></li>)}
            {!upcoming.length && !unfinishedAssignments.length && <li className="muted">Nothing scheduled.</li>}
          </ul>
        </section>

        <section className="card lg:col-span-3" aria-labelledby="progress">
          <h2 id="progress" className="h3">Academic progress</h2>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
            <Stat label="Courses started" value={coursesStarted} />
            <Stat label="Courses completed" value={coursesDone} />
            <Stat label="Lessons completed" value={`${Object.keys(state.done).length}/${LESSONS.length}`} />
            <Stat label="Exercises attempted" value={`${exercisesAttempted}/${EXERCISES.length}`} />
            <Stat label="Assignments submitted" value={`${assignmentsDone}/${ASSIGNMENTS.length}`} />
            <Stat label="Exam performance" value={state.exams.length ? `${Math.round(state.exams.reduce((a, e) => a + e.percent, 0) / state.exams.length)}%` : "–"} sub={state.exams.length ? `${state.exams.length} attempt(s)` : "No attempts yet"} />
            <Stat label="Projects completed" value={projectsDone} />
          </div>
          {gb.overall !== null && <p className="mt-3 text-sm text-ink-600">Overall course grade so far: <strong>{gb.overall}% ({gb.letter})</strong>. <Link href="/grades" className="underline">See how it is calculated</Link>.</p>}
        </section>

        <section className="card lg:col-span-3" aria-labelledby="rec">
          <h2 id="rec" className="h3">Recommended next steps</h2>
          <ul className="mt-3 space-y-3">
            {recs.map((r, i) => (<li key={i} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-ink-50 p-3"><span className="max-w-3xl text-sm">{r.text}</span><Link className="btn btn-sm" href={r.href}>{r.label}</Link></li>))}
            {!recs.length && <li className="muted">Complete a lesson and its quiz to receive recommendations based on your results.</li>}
          </ul>
        </section>
      </div>
    </div>
  );
}
