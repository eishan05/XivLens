import katex from "katex";

type MathInlineProps = {
  children: string;
  ariaLabel?: string;
};

export function MathInline({ children, ariaLabel }: MathInlineProps) {
  const html = katex.renderToString(children, {
    displayMode: false,
    output: "html",
    strict: "warn",
    throwOnError: false
  });

  return (
    <span
      aria-label={ariaLabel ?? children}
      className="math-inline"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
