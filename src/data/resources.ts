export type Resource = { title: string; url: string; kind: string; note: string };
export const RESOURCES: Resource[] = [
  { title: "NUC Computing CCMAS (PDF)", url: "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf", kind: "Official curriculum", note: "National minimum academic standards for computing programmes." },
  { title: "NUC CCMAS portal", url: "https://www.nuc.edu.ng/ccmas/", kind: "Official curriculum", note: "National Universities Commission portal." },
  { title: "University of Ibadan: Software Engineering courses", url: "https://computing.ui.edu.ng/software-engineering-courses", kind: "University reference", note: "Example course list from one university." },
  { title: "FUTA: Software Engineering course synopsis", url: "https://sen.futa.edu.ng/home/2338", kind: "University reference", note: "Example course synopsis from another university." },
  { title: "The Python Tutorial", url: "https://docs.python.org/3/tutorial/", kind: "Official documentation", note: "The official introduction to Python." },
  { title: "Python Standard Library reference", url: "https://docs.python.org/3/library/", kind: "Official documentation", note: "Reference for built-in modules." },
  { title: "Python built-in functions", url: "https://docs.python.org/3/library/functions.html", kind: "Official documentation", note: "len, range, sum, max, min and more." },
  { title: "Python unittest documentation", url: "https://docs.python.org/3/library/unittest.html", kind: "Official documentation", note: "Writing automated tests." },
  { title: "MDN Web Docs: HTML, CSS, JavaScript", url: "https://developer.mozilla.org/", kind: "Official documentation", note: "For the later web technologies course." },
  { title: "SQLite documentation", url: "https://www.sqlite.org/docs.html", kind: "Official documentation", note: "A small relational database for learning SQL." },
  { title: "Khan Academy: Mathematics", url: "https://www.khanacademy.org/math", kind: "Mathematical reference", note: "Free explanations for algebra, trigonometry, calculus and statistics." },
  { title: "OWASP Top 10", url: "https://owasp.org/www-project-top-ten/", kind: "Security reference", note: "Common web security risks (defensive study)." },
  { title: "ACM/IEEE Software Engineering curricula (SE2014)", url: "https://www.acm.org/education/curricula-recommendations", kind: "Curriculum reference", note: "International reference for software engineering education." },
];
export const RESOURCE_NOTE = "Links were provided or are well-known official sources. They are not checked automatically in this release: if a link is broken, report it in Settings > Report a content problem (stored locally). Respect copyright: do not copy whole textbooks into the platform without permission.";
