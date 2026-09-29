import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { getExam, publicQuestions } from "@/lib/exams";
import ExamRunner from "@/components/ExamRunner";

export default async function ExamPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole("STUDENT");
  const exam = getExam((await params).id);
  if (!exam) notFound();
  return (
    <>
      <h1 className="mb-4 text-2xl font-bold">{exam.title}</h1>
      <ExamRunner examId={exam.id} questions={publicQuestions(exam)} />
    </>
  );
}
