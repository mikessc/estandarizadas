// Lógica pura (sin imports) para poder probarla con `node --test`.

export type Letter = "A" | "B" | "C" | "D";
export const LETTERS: Letter[] = ["A", "B", "C", "D"];
export type Option = string | { text?: string; image: string };

export type Question = {
  id: string;
  number: number;
  block: string;
  blockNumber: number;
  skill: string;
  text: string;
  images?: string[];
  source?: string;
  options: Record<Letter, Option>;
  answer: Letter;
};
export type PublicQuestion = Omit<Question, "answer">;
export type Exam = { id: string; title: string; subject: string; questions: Question[] };
export type Answers = Record<string, Letter | null>;

/** Solo acepta ids de preguntas del examen y letras A–D; lo demás queda en null. */
export function sanitizeAnswers(exam: Exam, raw: unknown): Answers {
  const input = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const out: Answers = {};
  for (const q of exam.questions) {
    const v = input[q.id];
    out[q.id] = LETTERS.includes(v as Letter) ? (v as Letter) : null;
  }
  return out;
}

export function score(exam: Exam, answers: Answers) {
  return exam.questions.filter((q) => answers[q.id] === q.answer).length;
}

export function buildReport(exam: Exam, answers: Answers) {
  const blocks: { name: string; correct: number; total: number }[] = [];
  const skillErrors = new Map<string, Map<string, number>>();
  const wrong: (Question & { given: Letter | null })[] = [];

  for (const q of exam.questions) {
    let b = blocks.find((x) => x.name === q.block);
    if (!b) blocks.push((b = { name: q.block, correct: 0, total: 0 }));
    b.total++;
    const given = answers[q.id] ?? null;
    if (given === q.answer) {
      b.correct++;
      continue;
    }
    wrong.push({ ...q, given });
    const skills = skillErrors.get(q.block) ?? new Map<string, number>();
    skills.set(q.skill, (skills.get(q.skill) ?? 0) + 1);
    skillErrors.set(q.block, skills);
  }

  const reinforce = [...skillErrors]
    .map(([block, skills]) => ({
      block,
      errors: [...skills.values()].reduce((a, n) => a + n, 0),
      skills: [...skills].map(([skill, errors]) => ({ skill, errors })).sort((a, b) => b.errors - a.errors),
    }))
    .sort((a, b) => b.errors - a.errors);

  return { blocks, reinforce, wrong };
}
