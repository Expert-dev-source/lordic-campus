import "server-only";
import type { PublicQuestion } from "@/lib/types";

// This file contains answer keys. It is imported only by server code (API routes),
// never by client components, and the "server-only" import enforces that at build time.
export type ServerQuestion = PublicQuestion & {
  answer: number | number[] | boolean | number | string[];
  explain: string;
  tolerance?: number;
};

const T = (id: string, lessonId: string, topic: string, difficulty: "Easy" | "Medium" | "Hard", prompt: string, code: string, accept: string[], explain: string): ServerQuestion =>
  ({ id, type: "trace", lessonId, topic, difficulty, marks: 2, prompt, code, answer: accept, explain });
const S = (id: string, lessonId: string, topic: string, difficulty: "Easy" | "Medium" | "Hard", prompt: string, options: string[], answer: number, explain: string): ServerQuestion =>
  ({ id, type: "single", lessonId, topic, difficulty, marks: 1, prompt, options, answer, explain });
const F = (id: string, lessonId: string, topic: string, prompt: string, answer: boolean, explain: string): ServerQuestion =>
  ({ id, type: "tf", lessonId, topic, difficulty: "Easy", marks: 1, prompt, answer, explain });
const N = (id: string, lessonId: string, topic: string, difficulty: "Easy" | "Medium" | "Hard", prompt: string, answer: number, explain: string, code?: string): ServerQuestion =>
  ({ id, type: "numeric", lessonId, topic, difficulty, marks: 2, prompt, code, answer, explain });
const M = (id: string, lessonId: string, topic: string, difficulty: "Easy" | "Medium" | "Hard", prompt: string, options: string[], answer: number[], explain: string): ServerQuestion =>
  ({ id, type: "multi", lessonId, topic, difficulty, marks: 2, prompt, options, answer, explain });
const SH = (id: string, lessonId: string, topic: string, prompt: string, accept: string[], explain: string): ServerQuestion =>
  ({ id, type: "short", lessonId, topic, difficulty: "Easy", marks: 2, prompt, answer: accept, explain });

export const BANK: ServerQuestion[] = [
  S("q01", "prog1-1-1", "How programs work", "Easy", "Which statement best defines an algorithm?", ["A programming language", "A finite, ordered set of steps that solves a problem", "A type of computer", "A mistake in a program"], 1, "An algorithm is a precise sequence of steps; code is one way of writing it down."),
  F("q02", "prog1-1-1", "How programs work", "Python source code is run by an interpreter.", true, "The interpreter reads source code and carries out its instructions."),
  T("q03", "prog1-1-1", "How programs work", "Easy", "What does this program print?", 'print("3" + "4")', ["34"], "Both values are strings, so + joins them."),
  S("q04", "prog1-1-2", "Input, processing, output", "Easy", "A program runs without any error but prints 12 for 3 + 4. What kind of error is this?", ["Syntax error", "Runtime error", "Logic error", "No error"], 2, "It runs and gives a wrong answer: a logic error."),
  F("q05", "prog1-1-2", "Input, processing, output", "input() always returns a string.", true, "Convert it with int() or float() before calculating."),
  S("q06", "prog1-2-1", "Variables and types", "Easy", "What is the type of 3.0?", ["int", "float", "str", "bool"], 1, "A number with a decimal point is a float, even if the fractional part is zero."),
  T("q07", "prog1-2-1", "Variables and types", "Medium", "What does this print?", "x = 2\ny = x\nx = 5\nprint(y)", ["2"], "y took the value 2 when assigned. Reassigning x later does not change y."),
  M("q08", "prog1-2-1", "Variables and types", "Medium", "Select ALL valid Python variable names.", ["total_score", "2nd_score", "_count", "my-var"], [0, 2], "Names cannot start with a digit or contain a hyphen."),
  T("q09", "prog1-2-2", "Type conversion", "Easy", "What does this print?", 'print(int("8") + 2)', ["10"], 'int("8") is 8.'),
  T("q10", "prog1-2-2", "Type conversion", "Medium", "What does this print?", "print(int(9.99))", ["9"], "int() truncates; it does not round."),
  S("q11", "prog1-2-2", "Type conversion", "Medium", "What does f\"{3.14159:.2f}\" produce?", ["3.1", "3.14", "3.142", "3.14159"], 1, ".2f means two decimal places."),
  N("q12", "prog1-3-1", "Operators", "Easy", "What is the value of 17 // 5?", 3, "Floor division drops the remainder: 17 = 3 x 5 + 2.", "17 // 5"),
  N("q13", "prog1-3-1", "Operators", "Easy", "What is the value of 2 ** 5?", 32, "** is exponentiation: 2 x 2 x 2 x 2 x 2.", "2 ** 5"),
  T("q14", "prog1-3-1", "Operators", "Easy", "What does this print?", "print(10 % 4)", ["2"], "The remainder when 10 is divided by 4 is 2."),
  T("q15", "prog1-3-1", "Operators", "Hard", "What does this print?", "print(not True or True)", ["True"], "not binds tighter than or: (not True) or True is False or True, which is True."),
  T("q16", "prog1-4-1", "Conditions", "Easy", "What does this print?", 'x = 15\nif x > 20:\n    print("A")\nelif x > 10:\n    print("B")\nelse:\n    print("C")', ["B"], "15 > 20 is False; 15 > 10 is True, so B runs and the rest is skipped."),
  S("q17", "prog1-4-1", "Conditions", "Medium", "In if / elif / else, how many blocks can run?", ["All that match", "At most one", "Exactly two", "Always the last"], 1, "Only the first block whose condition is True runs."),
  F("q18", "prog1-4-1", "Conditions", "'if score = 50:' is a valid way to test equality in Python.", false, "= is assignment. Use == to compare."),
  N("q19", "prog1-5-1", "Loops", "Medium", "How many times is print executed?", 6, "The outer loop runs 3 times and the inner loop 2 times per outer pass: 3 x 2 = 6.", "for i in range(3):\n    for j in range(2):\n        print(i, j)"),
  T("q20", "prog1-5-1", "Loops", "Medium", "What does this print?", "s = 0\nfor i in range(1, 5):\n    s += i\nprint(s)", ["10"], "range(1, 5) is 1, 2, 3, 4; the sum is 10."),
  S("q21", "prog1-5-2", "Loops", "Medium", "Why does 'x = 1' followed by 'while x < 5: print(x)' never end?", ["print is slow", "x never changes so the condition stays True", "range is missing", "x is a float"], 1, "Nothing moves x toward making the condition False."),
  S("q22", "prog1-5-2", "Loops", "Easy", "Which statement leaves a loop immediately?", ["skip", "stop", "break", "exit_loop"], 2, "break exits the nearest enclosing loop."),
  T("q23", "prog1-6-1", "Functions", "Easy", "What does this print?", "def f(a, b):\n    return a * b\n\nprint(f(3, 4))", ["12"], "f returns 3 * 4."),
  F("q24", "prog1-6-1", "Functions", "A variable created inside a function can be used directly outside it.", false, "Local variables exist only while the function runs."),
  T("q25", "prog1-6-1", "Functions", "Hard", "What does this print?", "def f(n):\n    if n == 0:\n        return 1\n    return n * f(n - 1)\n\nprint(f(4))", ["24"], "4 x 3 x 2 x 1 x 1 = 24."),
  T("q26", "prog1-7-1", "Strings and lists", "Medium", "What does this print?", 'print("Lordic"[2:5])', ["rdi"], "Index 0 is L, 1 is o, 2 is r, 3 is d, 4 is i; the slice excludes index 5."),
  T("q27", "prog1-7-1", "Strings and lists", "Easy", "What does this print?", "nums = [5, 3, 8]\nnums.append(1)\nprint(len(nums))", ["4"], "append adds an item, so the length becomes 4."),
  S("q28", "prog1-7-2", "Dictionaries", "Medium", "What does d.get('x', 0) return if 'x' is not a key of d?", ["An error", "None", "0", "'x'"], 2, ".get returns the default when the key is missing."),
  N("q29", "prog1-7-2", "Dictionaries", "Medium", "What is the value of len(set([1, 2, 2, 3, 3, 3]))?", 3, "A set keeps each value once: {1, 2, 3}.", "len(set([1, 2, 2, 3, 3, 3]))"),
  S("q30", "prog1-8-1", "Files and errors", "Easy", "Which exception does int('x') raise?", ["TypeError", "ValueError", "KeyError", "IndexError"], 1, "The type is right (a string) but the content is not a valid integer."),
  SH("q31", "prog1-8-1", "Files and errors", "Which keyword fills the gap so the file closes automatically: ___ open('f.txt') as f: ?", ["with"], "A with block closes the file even if an error occurs."),
  N("q32", "prog1-9-1", "Algorithms", "Medium", "Linear search looks for 15 in [4, 8, 15, 16]. How many items are compared?", 3, "It checks 4, 8 and then 15, and stops.", "[4, 8, 15, 16]"),
  F("q33", "prog1-9-1", "Algorithms", "Binary search works correctly on an unsorted list.", false, "Binary search relies on the list being sorted."),
  S("q34", "prog1-9-1", "Algorithms", "Hard", "After the FIRST pass of bubble sort on [3, 1, 2], the list is...", ["[1, 2, 3]", "[1, 3, 2]", "[3, 1, 2]", "[2, 1, 3]"], 0, "3 and 1 swap giving [1, 3, 2]; then 3 and 2 swap giving [1, 2, 3]."),
  S("q35", "prog1-10-1", "Object-oriented programming", "Easy", "What is __init__ used for?", ["Deleting an object", "Setting up a new object's attributes", "Printing", "Importing modules"], 1, "It is the constructor and runs when an object is created."),
  T("q36", "prog1-10-1", "Object-oriented programming", "Medium", "What does this print?", "class A:\n    def __init__(self, x):\n        self.x = x\n\na = A(4)\nprint(a.x * 2)", ["8"], "a.x is 4, so a.x * 2 is 8."),
  S("q37", "prog1-11-1", "Testing and debugging", "Medium", "Which input is the best edge case for a function that calculates the average of a list?", ["[1, 2, 3]", "[]", "[10, 20]", "[5, 5, 5]"], 1, "An empty list would cause division by zero."),
  M("q38", "prog1-11-1", "Testing and debugging", "Medium", "Select ALL good debugging steps.", ["Reproduce the problem with a small input", "Change random lines until it works", "Read the traceback starting from the last line", "Add a test after the fix"], [0, 2, 3], "Systematic steps beat guessing."),
  S("q39", "prog1-12-1", "Project planning", "Easy", "Which part of a student management system is easiest to test automatically?", ["Menu typing", "Pure calculation functions", "Screen colours", "User patience"], 1, "Functions with clear inputs and outputs are easy to test."),
];

export const BANK_BY_ID: Record<string, ServerQuestion> = Object.fromEntries(BANK.map((q) => [q.id, q]));

export function toPublic(q: ServerQuestion): PublicQuestion {
  // Explicitly copy only public fields: no answer, no explanation.
  return { id: q.id, type: q.type, topic: q.topic, lessonId: q.lessonId, difficulty: q.difficulty, marks: q.marks, prompt: q.prompt, code: q.code, options: q.options };
}
