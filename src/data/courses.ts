import type { Course, Verification } from "@/lib/types";

type L = 100 | 200 | 300 | 400 | 500;
const m = (s: string) => s.split("|").map((x) => x.trim());
let n = 0;
function c(
  level: L,
  id: string,
  title: string,
  purpose: string,
  modules: string,
  status: Verification,
  opts: Partial<Pick<Course, "hasContent" | "prerequisites" | "practical" | "assessment">> = {}
): Course {
  n += 1;
  return {
    id,
    number: n,
    level,
    title,
    purpose,
    modules: m(modules),
    status,
    code: null,
    semester: null,
    hasContent: opts.hasContent ?? false,
    prerequisites: opts.prerequisites ?? [],
    practical: opts.practical ?? "Practical work to be defined when this course's content is added.",
    assessment: opts.assessment ?? "Quizzes, classwork, assignments and a mock examination (to be added with course content).",
  };
}

export const LEVELS: { level: L; name: string }[] = [
  { level: 100, name: "Computing Foundations" },
  { level: 200, name: "Programming and Core Computing" },
  { level: 300, name: "Data, Systems and Software Construction" },
  { level: 400, name: "Quality, Architecture and Advanced Development" },
  { level: 500, name: "Professional Engineering and Capstone" },
];

export const COURSES: Course[] = [
  // ---------- LEVEL 100
  c(100, "intro-computing", "Introduction to Computing Sciences", "Understand what computers are, how they operate and how computing is used.",
    "History of computing|Computer generations and development|Computer hardware|Computer software|Input, processing, output and storage|Operating systems and application software|Data representation|Binary and hexadecimal numbers|Internet fundamentals|Computing disciplines and careers|Computing ethics and professional responsibility|Introductory computer laboratory work",
    "provisional", { practical: "Explore the operating system, organise files and folders, use a command-line terminal, inspect basic system information.", assessment: "Multiple-choice questions, short answers, number conversions and explanations of computer components." }),
  c(100, "problem-solving", "Problem Solving", "Learn to analyse problems and develop systematic solutions before writing code.",
    "Problem definition|Breaking down complex problems|Identifying inputs and outputs|Designing step-by-step solutions|Algorithms|Pseudocode|Flowcharts|Decision structures|Repetition and iteration|Algorithm tracing|Testing proposed solutions|Introductory computational thinking",
    "provisional", { practical: "Design the algorithm for a student grading application before implementing it in code." }),
  c(100, "elementary-maths", "Elementary Mathematics", "Number systems, algebra, functions and trigonometry for computing.",
    "Number systems|Algebraic expressions|Indices and logarithms|Equations and inequalities|Functions|Graphs|Coordinate geometry|Trigonometric ratios|Trigonometric identities|Sequences and series (where required)|Applied mathematical problems",
    "provisional", { practical: "Equation-solving practice and graph plotting in the Mathematics Laboratory." }),
  c(100, "calculus", "Calculus", "Limits, differentiation and integration with graphical exploration.",
    "Functions and their properties|Limits|Continuity|Differentiation|Rules of differentiation|Applications of derivatives|Integration|Techniques of integration|Areas and introductory applications|Mathematical modelling",
    "provisional"),
  c(100, "stats-probability", "Statistics and Probability", "Describe, visualise and interpret data; reason about chance.",
    "Types of data|Data collection and organisation|Frequency tables|Mean, median and mode|Range, variance and standard deviation|Quartiles and percentiles|Data visualisation|Basic probability|Random variables|Probability distributions|Sampling and estimation (where required)|Statistical interpretation",
    "provisional", { practical: "Analyse a dataset of examination results and explain the patterns found." }),
  c(100, "general-physics", "General Physics", "Mechanics, electricity and magnetism, and practical physics (where required by the university).",
    "Units and measurement|Scalars and vectors|Motion|Newton's laws|Work and energy|Momentum|Circular motion|Electric charge and fields|Voltage and current|Resistance|Basic electrical circuits|Magnetism|Electromagnetic principles|Recording observations and measurements|Tables, graphs and uncertainty|Writing laboratory reports",
    "confirm"),
  c(100, "communication-gs", "Communication and General Studies", "Communication, technical and academic writing, and university-required general studies.",
    "Communication in English|Technical writing|Academic writing|Nigerian Peoples and Culture or equivalent university requirements|Professional presentations|Research and referencing",
    "confirm"),
  // ---------- LEVEL 200
  c(200, "prog1", "Computer Programming I (Introduction to Programming)", "Learn to write, run, test and debug programs in Python. This is the first complete course in this release.",
    "How Programs Work|Variables and Data Types|Operators|Conditions|Loops|Functions|Strings and Collections|Files and Errors|Algorithms|Object-Oriented Programming|Testing and Debugging|Final Programming Project",
    "provisional", {
      hasContent: true,
      prerequisites: ["None. Basic reading and arithmetic are enough."],
      practical: "17 coding exercises run in a sandboxed Python runtime, plus projects: calculator, grading system, guessing game, student records, contact book, library system.",
      assessment: "Lesson quizzes, coding exercises, debugging challenges, classwork, three assignments, mock examinations (mid-course and final), and a final project.",
    }),
  c(200, "prog2", "Computer Programming II", "Advanced functions, recursion, modular design and larger programs.",
    "Advanced functions|Recursion|Modular programming|More complex data structures|Object-oriented programming (per course sequence)|File processing|Exception handling|Algorithm implementation|Code organisation|Larger programming assignments", "provisional", { prerequisites: ["Computer Programming I"], practical: "Build a command-line library management system." }),
  c(200, "discrete", "Discrete Structures and Logic", "Logic, sets, relations, counting, proof and graph theory.",
    "Propositional logic|Truth tables|Predicate logic|Sets|Relations|Functions|Counting and combinatorics|Mathematical induction|Proof techniques|Graph theory|Trees|Recurrence relations|Boolean logic", "provisional"),
  c(200, "digital-logic", "Digital Logic Design", "Boolean algebra, gates and circuits.",
    "Binary and hexadecimal representation|Boolean algebra|Logic gates|Truth tables|Combinational circuits|Sequential logic|Flip-flops|Registers|Circuit design|Introductory digital systems", "provisional", { practical: "Interactive laboratory: construct basic logic circuits and observe how inputs affect outputs." }),
  c(200, "intro-se", "Introduction to Software Engineering", "What software engineering is and how software is built by teams.",
    "Definition and purpose of Software Engineering|Software development life cycles|Requirements and stakeholders|Software process models|Design and implementation|Software testing|Maintenance and evolution|Teamwork and collaboration|Professional ethics|Technical documentation", "provisional", { practical: "Analyse a real software problem, identify stakeholders and write a requirements document." }),
  c(200, "sad", "System Analysis and Design", "From problem identification to system architecture and documentation.",
    "Problem identification|Feasibility analysis|Requirements gathering|Functional requirements|Non-functional requirements|Use cases|Process modelling|Data modelling|UML diagrams|System architecture|Design evaluation|Technical documentation", "provisional", { practical: "Produce requirements and design documentation for a student management system." }),
  c(200, "algorithms", "Algorithms", "Design, correctness and complexity of algorithms.",
    "Algorithm design|Pseudocode|Correctness|Searching|Sorting|Recursion|Time complexity|Space complexity|Algorithm comparison|Problem-solving strategies", "provisional", { practical: "Implement and compare search and sorting algorithms." }),
  c(200, "hci", "Human-Computer Interaction", "Designing usable, accessible interfaces.",
    "HCI fundamentals|User research|Usability principles|Accessibility|Interaction design|Wireframes|Prototypes|Usability testing|Interface evaluation|Design iteration", "provisional", { practical: "Design and evaluate the interface for an educational application." }),
  c(200, "web-db", "Web Technologies and Databases", "HTML, CSS, JavaScript, HTTP and relational database foundations (where included in the programme).",
    "HTML|CSS|JavaScript|HTTP|Browser and server fundamentals|Forms and validation|APIs|Client-server applications|Data and information|Relational database concepts|Tables and relationships|Primary and foreign keys|Introductory SQL|Database modelling", "supplementary"),
  c(200, "l200-additional", "Additional Level 200 Areas", "University-dependent areas: confirm with your institution.",
    "Mathematical methods|Differential equations|Statistical computing|Entrepreneurship|Innovation|Practical computing laboratories|Industrial training or SIWES (where required)|University-required general studies", "confirm"),
  // ---------- LEVEL 300
  c(300, "data-structures", "Data Structures", "Core structures and how to choose between them.",
    "Arrays|Linked lists|Stacks|Queues|Trees|Binary search trees|Heaps|Hash tables|Graphs|Traversal algorithms|Data structure selection|Performance analysis", "provisional", { prerequisites: ["Computer Programming II", "Algorithms"], practical: "Implement core structures and compare their behaviour for different operations." }),
  c(300, "operating-systems", "Operating Systems", "Processes, memory, files and security.",
    "Operating system responsibilities|Processes|Threads|CPU scheduling|Synchronisation|Deadlocks|Memory management|Virtual memory|File systems|Permissions|System calls|Operating system security", "provisional", { practical: "Use command-line tools to explore processes, files, permissions and resource usage." }),
  c(300, "dbms", "Database Management Systems", "Relational design, SQL, transactions and performance.",
    "Database concepts|Relational models|Entity-relationship diagrams|SQL queries|Filtering and sorting|Joins|Aggregation|Normalisation|Keys and constraints|Transactions|Indexes|Query performance", "provisional", { practical: "Build a database-backed application with meaningful relationships, validation and tested queries." }),
  c(300, "architecture", "Computer Architecture and Organisation", "How CPUs, memory and I/O work.",
    "CPU components|Instruction execution|Registers|Memory hierarchy|Machine instructions|Input/output systems|Storage systems|Performance|Pipelining concepts|Architecture trade-offs", "provisional"),
  c(300, "ooad", "Object-Oriented Analysis and Design", "Modelling and designing with objects.",
    "Classes and objects|Encapsulation|Abstraction|Inheritance|Composition|Polymorphism|UML class diagrams|Sequence diagrams|Design responsibilities|Common design principles|Refactoring|Object-oriented testing", "provisional", { practical: "Model and implement a library, booking or student management system." }),
  c(300, "construction", "Software Construction", "Writing maintainable code in teams.",
    "Coding standards|Modularity|Error handling|Logging|Version control|Code reviews|Build tools|Refactoring|Unit testing|Dependency management|Maintainability|Collaborative workflows", "provisional"),
  c(300, "ai", "Artificial Intelligence", "Search, knowledge, reasoning and machine learning foundations.",
    "AI problem formulation|Search strategies|Knowledge representation|Reasoning|Machine learning foundations|Evaluation|Limitations and bias|Responsible AI", "provisional"),
  c(300, "cybersecurity", "Cybersecurity Foundations", "Defensive security principles. All practical work must use authorised environments.",
    "Security principles|Threat modelling|Authentication|Authorisation|Password security|Secure coding|Common web vulnerabilities|Data privacy|Security testing|Defensive incident response", "provisional"),
  c(300, "l300-additional", "Additional Level 300 Areas", "Programme-dependent areas: confirm with your institution.",
    "Formal languages and automata|Systems programming|Programming paradigms|Machine learning|Numerical analysis|Practical laboratories|Industrial training", "confirm"),
  // ---------- LEVEL 400
  c(400, "testing-qa", "Software Testing and Quality Assurance", "Plan, design, automate and report testing.",
    "Testing principles|Test planning|Unit testing|Integration testing|System testing|Acceptance testing|Test case design|Boundary-value analysis|Equivalence partitioning|Regression testing|Test automation|Defect management|Quality attributes|Testing reports", "provisional", { practical: "Build a test suite for an application and produce a quality assessment report." }),
  c(400, "sw-architecture", "Software Architecture and Design", "Architectural decisions and trade-offs.",
    "Architecture fundamentals|Quality attributes|Requirements and architectural decisions|Layered architecture|Modular systems|Client-server systems|Event-driven architecture|API design|Architecture diagrams|Design trade-offs|Architecture reviews|Documentation", "provisional", { practical: "Design and justify the architecture of a multi-user web application." }),
  c(400, "adv-db", "Advanced Database Systems", "Concurrency, performance, recovery and administration (where included).",
    "Transactions and concurrency|Database performance|Indexing strategies|Advanced queries|Backup and recovery|Data integrity|Database administration|Distributed data concepts (where specified)", "supplementary"),
  c(400, "se-economics", "Software Engineering Economics", "Cost, risk and trade-offs (where included).",
    "Cost estimation|Feasibility|Risk analysis|Cost-benefit analysis|Maintenance costs|Resource planning|Engineering trade-offs", "supplementary"),
  c(400, "compilers", "Compiler Construction", "How source code becomes executable (where included).",
    "Lexical analysis|Parsing|Syntax trees|Semantic analysis|Intermediate representations|Code generation|Optimisation concepts", "supplementary"),
  c(400, "l400-additional", "Additional Level 400 Areas", "University-dependent areas: confirm with your institution.",
    "Computer graphics|Content management systems|E-business systems|Industrial training|Advanced electives", "confirm"),
  // ---------- LEVEL 500
  c(500, "maintenance-cm", "Software Maintenance and Configuration Management", "Keeping software healthy over time.",
    "Version control workflows|Branching and merging|Release management|Dependency management|Change control|Bug fixing|Regression testing|Legacy systems|Release notes|Change traceability", "provisional"),
  c(500, "project-mgmt", "Software Project Management", "Scope, scheduling, risk and delivery.",
    "Project scope|Work breakdown structures|Scheduling|Estimation|Risk management|Team roles|Agile methods|Predictive project management|Progress reporting|Delivery and evaluation", "provisional"),
  c(500, "research-methods", "Research Methods and Technical Writing", "Research questions, methods, ethics and technical reports.",
    "Research questions|Literature reviews|Research methods|Research ethics|Data collection|Data analysis|Technical report structure|Referencing|Academic integrity|Presentation and defence", "provisional"),
  c(500, "innovation", "Software Engineering Innovation", "Evaluating and prototyping new technology responsibly.",
    "Evaluating new technologies|Innovation methods|Prototyping|Technical feasibility|Product experimentation|Technical risk|Responsible technology adoption", "provisional"),
  c(500, "concurrency", "Concurrency and Advanced Systems", "Threads, races, locks and distributed concepts (where included).",
    "Threads and tasks|Race conditions|Locks and synchronisation|Deadlocks|Concurrent algorithms|Distributed systems concepts|Testing concurrent applications", "supplementary"),
  c(500, "fyp", "Final-Year Project", "A guided capstone from problem selection to defence.",
    "Problem selection|Proposal|Literature review|Requirements|System design|Implementation plan|Development|Testing|Evaluation|Documentation|Demonstration|Final presentation and defence", "provisional"),
  c(500, "l500-additional", "Other Potential Level 500 Requirements", "University-dependent: confirm with your institution.",
    "Ethics and legal issues in computing|Mobile application development|Formal methods|Programming language semantics|Internet of Things|AI for social good|Additional electives and general studies", "confirm"),
];

export const COURSE_BY_ID: Record<string, Course> = Object.fromEntries(COURSES.map((x) => [x.id, x]));

export const REFERENCE_SOURCES = [
  { title: "NUC Computing CCMAS (PDF)", url: "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf" },
  { title: "NUC CCMAS portal", url: "https://www.nuc.edu.ng/ccmas/" },
  { title: "University of Ibadan Software Engineering course list", url: "https://computing.ui.edu.ng/software-engineering-courses" },
  { title: "FUTA Software Engineering course synopsis", url: "https://sen.futa.edu.ng/home/2338" },
];
