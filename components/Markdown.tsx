import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeRaw from "rehype-raw";
import rehypeKatex from "rehype-katex";
import ZoomImage from "./ZoomImage";

type Node = { type: string; value?: string; children?: Node[] };

/** Antes de rehype-raw: todo HTML crudo que no sea <u> o </u> se vuelve texto literal. */
function onlyUnderline() {
  const walk = (n: Node) => {
    if (n.type === "raw" && !/^<\/?u>$/i.test(n.value ?? "")) n.type = "text";
    n.children?.forEach(walk);
  };
  return walk;
}

export default function Markdown({ children }: { children: string }) {
  return (
    <div className="md">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[onlyUnderline, rehypeRaw, rehypeKatex]}
        components={{
          img: ({ src, alt }) => <ZoomImage src={typeof src === "string" ? src : undefined} alt={alt} />,
          table: (props) => (
            <div className="overflow-x-auto">
              <table {...props} />
            </div>
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
