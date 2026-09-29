import "server-only";
import fs from "node:fs";
import path from "node:path";
import type { Exam, PublicQuestion } from "./grade";

const DIR = path.join(process.cwd(), "data", "exams");
let cache: Exam[] | null = null;

export function getExams(): Exam[] {
  if (!cache || process.env.NODE_ENV === "development") {
    cache = fs
      .readdirSync(DIR)
      .filter((f) => f.endsWith(".json"))
      .map((f) => JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8")) as Exam)
      .sort((a, b) => a.subject.localeCompare(b.subject, "es"));
  }
  return cache;
}

export const getExam = (id: string) => getExams().find((e) => e.id === id);

/** Lo único que se envía al navegador antes de entregar: sin "answer". */
export const publicQuestions = (exam: Exam): PublicQuestion[] =>
  exam.questions.map(({ answer: _answer, ...q }) => q);
