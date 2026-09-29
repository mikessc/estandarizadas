import Markdown from "./Markdown";
import ZoomImage from "./ZoomImage";
import type { Option, PublicQuestion } from "@/lib/grade";

export function QuestionText({ q }: { q: PublicQuestion }) {
  return (
    <>
      <Markdown>{q.text}</Markdown>
      {q.images?.map((src) => <ZoomImage key={src} src={src} />)}
      {q.source && <p className="mt-2 text-base text-slate-500">{q.source}</p>}
    </>
  );
}

export function OptionContent({ option }: { option: Option }) {
  if (typeof option === "string") return <Markdown>{option}</Markdown>;
  return (
    <div>
      {option.text && <Markdown>{option.text}</Markdown>}
      <ZoomImage src={option.image} />
    </div>
  );
}
