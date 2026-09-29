import { test } from "node:test";
import assert from "node:assert/strict";
import { buildReport, sanitizeAnswers, score, type Exam } from "../lib/grade.ts";

const q = (id: string, block: string, skill: string) =>
  ({ id, number: 0, block, blockNumber: 0, skill, text: "", options: { A: "", B: "", C: "", D: "" }, answer: "A" }) as const;
const exam: Exam = {
  id: "t", title: "t", subject: "t",
  questions: [q("1", "X", "s1"), q("2", "X", "s1"), q("3", "X", "s2"), q("4", "Y", "s3")],
};

test("califica, sanea y agrupa errores", () => {
  const a = sanitizeAnswers(exam, { "1": "B", "2": "Z", "3": "A", "4": "A", hack: "A" });
  assert.deepEqual(a, { "1": "B", "2": null, "3": "A", "4": "A" });
  assert.equal(score(exam, a), 2);
  const r = buildReport(exam, a);
  assert.deepEqual(r.blocks, [{ name: "X", correct: 1, total: 3 }, { name: "Y", correct: 1, total: 1 }]);
  assert.deepEqual(r.reinforce, [{ block: "X", errors: 2, skills: [{ skill: "s1", errors: 2 }] }]);
  assert.deepEqual(r.wrong.map((w) => [w.id, w.given]), [["1", "B"], ["2", null]]);
});
