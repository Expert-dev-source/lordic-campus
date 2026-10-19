// The documented grading policy used throughout Lordic Campus.
export const GRADE_POLICY = [
  { letter: "A", min: 70, max: 100 },
  { letter: "B", min: 60, max: 69 },
  { letter: "C", min: 50, max: 59 },
  { letter: "D", min: 45, max: 49 },
  { letter: "E", min: 40, max: 44 },
  { letter: "F", min: 0, max: 39 },
];
export function letterGrade(percent: number): string {
  if (percent >= 70) return "A";
  if (percent >= 60) return "B";
  if (percent >= 50) return "C";
  if (percent >= 45) return "D";
  if (percent >= 40) return "E";
  return "F";
}
export const pct = (n: number, d: number) => (d > 0 ? (n / d) * 100 : 0);
export const round1 = (n: number) => Math.round(n * 10) / 10;
