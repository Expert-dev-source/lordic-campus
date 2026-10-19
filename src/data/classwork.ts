import type { Classwork } from "@/lib/types";

const C = "prog1";

export const CLASSWORK: Classwork[] = [
  {
    id: "cw-1-trace", title: "Predict the Output", courseId: C, lessonId: "prog1-1-1", category: "Code tracing", difficulty: "Beginner", minutes: 15,
    instructions: "Work out the output by hand first. Type exactly what Python would print. Separate lines with a space if the answer has several lines.",
    objectives: ["Trace short programs", "Tell text from expressions"],
    tasks: [
      { type: "trace", q: "What is printed?", code: 'print("2 + 3")', accept: ["2 + 3"], marks: 2, explain: "Inside quotes it is text and printed as written." },
      { type: "trace", q: "What is printed?", code: "print(2 + 3)", accept: ["5"], marks: 2, explain: "Without quotes Python calculates 2 + 3." },
      { type: "mc", q: "Which best describes an algorithm?", options: ["A kind of computer", "Precise ordered steps that solve a problem", "A syntax error", "A file type"], answer: 1, marks: 2, explain: "An algorithm is a finite ordered set of steps." },
      { type: "short", q: "In the input-process-output model, which stage shows or returns the results? (one word)", accept: ["output"], marks: 2, explain: "The last stage is output: what the program shows or returns." },
      { type: "code", q: "Write greet(name) in the Coding Laboratory and pass all tests, then return here.", exerciseId: "ex-greet", marks: 2, explain: "Return text rather than printing it." },
    ],
  },
  {
    id: "cw-2-variables", title: "Variables and Types Workshop", courseId: C, lessonId: "prog1-2-1", category: "Concept questions", difficulty: "Beginner", minutes: 20,
    instructions: "Answer each question. For short answers use a single word or short phrase.",
    objectives: ["Identify data types", "Trace reassignment"],
    tasks: [
      { type: "mc", q: "What is the type of 85.5?", options: ["int", "float", "str", "bool"], answer: 1, marks: 2, explain: "Decimal numbers are floats." },
      { type: "mc", q: "What is the type of \"18\" (with quotes)?", options: ["int", "float", "str", "bool"], answer: 2, explain: "Anything in quotes is a string.", marks: 2 },
      { type: "trace", q: "What does this print?", code: "x = 4\nx = x + 3\nprint(x)", accept: ["7"], marks: 2, explain: "x is reassigned to 4 + 3." },
      { type: "trace", q: "What does this print?", code: 'a = "5"\nb = "5"\nprint(a + b)', accept: ["55"], marks: 2, explain: "+ joins strings." },
      { type: "short", q: "Which operator assigns a value to a name? Write the symbol.", accept: ["="], marks: 1, explain: "= assigns; == compares." },
      { type: "short", q: "In one sentence: what is the difference between an int and a float?", accept: ["whole number", "decimal", "fraction", "point"], marks: 3, explain: "An int is a whole number; a float has a decimal point." },
    ],
  },
  {
    id: "cw-3-operators", title: "Operators and Averages", courseId: C, lessonId: "prog1-3-1", category: "Mathematical problems", difficulty: "Beginner", minutes: 25,
    instructions: "Compute carefully and mind operator precedence.",
    objectives: ["Use arithmetic operators", "Apply precedence", "Write boolean expressions"],
    tasks: [
      { type: "trace", q: "What is printed?", code: "print(2 + 3 * 4)", accept: ["14"], marks: 2, explain: "Multiplication happens before addition." },
      { type: "trace", q: "What is printed?", code: "print(17 % 5)", accept: ["2"], marks: 2, explain: "Remainder of 17 / 5." },
      { type: "trace", q: "What is printed?", code: "print(7 // 2)", accept: ["3"], marks: 2, explain: "Floor division drops the fraction." },
      { type: "trace", q: "What is printed?", code: "print(not (5 > 3 and 2 > 4))", accept: ["True"], marks: 2, explain: "True and False is False; not False is True." },
      { type: "code", q: "Implement average(a, b, c) and pass all tests.", exerciseId: "ex-average", marks: 3, explain: "Use brackets: (a + b + c) / 3." },
      { type: "code", q: "Implement is_even(n) and pass all tests.", exerciseId: "ex-even", marks: 3, explain: "n % 2 == 0." },
    ],
  },
  {
    id: "cw-4-conditions", title: "Build a Grading System", courseId: C, lessonId: "prog1-4-1", category: "Programming tasks", difficulty: "Beginner", minutes: 30,
    instructions: "Use the course grading policy: A 70-100, B 60-69, C 50-59, D 45-49, E 40-44, F 0-39.",
    objectives: ["Write if/elif/else", "Test boundary values"],
    tasks: [
      { type: "mc", q: "Which score is the lowest that earns a B?", options: ["59", "60", "65", "70"], answer: 1, marks: 2, explain: "B starts at 60." },
      { type: "mc", q: "Why test the highest threshold first in an elif chain?", options: ["It is faster to type", "Because each branch only sees scores that failed the previous tests", "Python requires it", "It does not matter"], answer: 1, marks: 2, explain: "Order determines which branch matches first." },
      { type: "trace", q: "What is printed?", code: 'score = 49\nif score >= 50:\n    print("Pass")\nelse:\n    print("Fail")', accept: ["Fail"], marks: 2, explain: "49 is below 50." },
      { type: "code", q: "Implement grade(score) and pass all tests (including boundaries).", exerciseId: "ex-grade", marks: 6, explain: "Boundaries 70, 69, 60, 50, 45, 40 are tested." },
    ],
  },
  {
    id: "cw-5-loops", title: "Loops Practice", courseId: C, lessonId: "prog1-5-1", category: "Programming tasks", difficulty: "Elementary", minutes: 30,
    instructions: "Trace loops carefully; then implement your own.",
    objectives: ["Trace loops", "Use accumulators", "Count digits with while"],
    tasks: [
      { type: "trace", q: "What is printed?", code: "total = 0\nfor i in range(4):\n    total += i\nprint(total)", accept: ["6"], marks: 2, explain: "0+1+2+3 = 6." },
      { type: "trace", q: "How many numbers does list(range(2, 8)) contain? (type the number)", code: "print(len(list(range(2, 8))))", accept: ["6"], marks: 2, explain: "2,3,4,5,6,7: the stop is excluded." },
      { type: "code", q: "Implement sum_to and times_table.", exerciseId: "ex-sumto", marks: 5, explain: "Accumulator and list-building." },
      { type: "code", q: "Implement count_digits with a while loop.", exerciseId: "ex-digits", marks: 5, explain: "Integer-divide by 10 until nothing is left." },
    ],
  },
  {
    id: "cw-6-functions", title: "Functions and Recursion", courseId: C, lessonId: "prog1-6-1", category: "Debugging exercises", difficulty: "Elementary", minutes: 25,
    instructions: "Answer the questions and implement factorial.",
    objectives: ["Distinguish print and return", "Write a recursive function"],
    tasks: [
      { type: "mc", q: "A function that only prints a result can be used in further calculations.", options: ["True", "False"], answer: 1, marks: 2, explain: "print displays; only return hands a value to other code." },
      { type: "trace", q: "What is printed?", code: "def double(x):\n    x = x * 2\n    return x\n\ny = 5\ndouble(y)\nprint(y)", accept: ["5"], marks: 3, explain: "The call's result is discarded and y is unchanged." },
      { type: "short", q: "What must every recursive function have so it stops? (two words)", accept: ["base case"], marks: 2, explain: "The base case." },
      { type: "code", q: "Implement factorial(n).", exerciseId: "ex-factorial", marks: 5, explain: "n * factorial(n - 1) with base case 0." },
    ],
  },
  {
    id: "cw-7-collections", title: "Strings, Lists and Dictionaries", courseId: C, lessonId: "prog1-7-1", category: "Programming tasks", difficulty: "Elementary", minutes: 35,
    instructions: "Work with sequences and dictionaries.",
    objectives: ["Index and slice", "Count with dictionaries"],
    tasks: [
      { type: "trace", q: "What is printed?", code: 'print("Python"[1:4])', accept: ["yth"], marks: 2, explain: "Indexes 1, 2, 3." },
      { type: "trace", q: "What is printed?", code: "nums = [4, 8, 15, 16]\nprint(nums[-1])", accept: ["16"], marks: 2, explain: "-1 is the last item." },
      { type: "code", q: "Implement count_vowels and largest.", exerciseId: "ex-vowels", marks: 5, explain: "Loop; start best with the first item." },
      { type: "code", q: "Implement word_count.", exerciseId: "ex-wordcount", marks: 5, explain: "Use .get(word, 0) + 1." },
    ],
  },
  {
    id: "cw-8-debug", title: "Debugging and Testing Lab", courseId: C, lessonId: "prog1-11-1", category: "Debugging exercises", difficulty: "Intermediate", minutes: 35,
    instructions: "Find, fix and prevent bugs.",
    objectives: ["Trace buggy code", "Choose edge cases", "Fix logic errors"],
    tasks: [
      { type: "mc", q: "Where do you start reading a traceback?", options: ["The first line", "The last line", "The middle", "You do not"], answer: 1, marks: 2, explain: "The last line names the error." },
      { type: "mc", q: "Which input is an edge case for an average function?", options: ["[1, 2, 3]", "[]", "[10, 20]", "[5, 5]"], answer: 1, marks: 2, explain: "The empty list would cause division by zero." },
      { type: "code", q: "Fix the buggy average_of.", exerciseId: "ex-fixavg", marks: 6, explain: "total += n and handle the empty list." },
      { type: "code", q: "Implement parse_int that never crashes.", exerciseId: "ex-parseint", marks: 5, explain: "try/except ValueError." },
    ],
  },
];

export const CLASSWORK_BY_ID: Record<string, Classwork> = Object.fromEntries(CLASSWORK.map((c) => [c.id, c]));
export function classworkMarks(c: Classwork) {
  return c.tasks.reduce((s, t) => s + t.marks, 0);
}
