import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import type { PaperMeta, PaperSection } from "@/papers/types";

type PaperShellProps = {
  paper: PaperMeta;
  sections: PaperSection[];
  children: ReactNode;
};

export function PaperShell({ paper, sections, children }: PaperShellProps) {
  const style = { "--accent": paper.accent } as CSSProperties;

  return (
    <main className="paper-shell" style={style}>
      <header className="paper-hero">
        <nav className="topline" aria-label="Paper">
          <Link href="/" className="brand-mark">
            XivLens
          </Link>
          <span>{paper.status === "demo" ? "starter module" : paper.venue}</span>
        </nav>

        <div className="paper-hero-grid">
          <div className="paper-title-block">
            <p className="eyebrow">{paper.tags.join(" / ")}</p>
            <h1>{paper.title}</h1>
            <p className="hero-deck">{paper.subtitle}</p>
          </div>

          <aside className="paper-summary" aria-label="Paper metadata">
            <p>{paper.abstract}</p>
            <dl>
              <div>
                <dt>Authors</dt>
                <dd>{paper.authors.join(", ")}</dd>
              </div>
              <div>
                <dt>Venue</dt>
                <dd>{paper.venue}</dd>
              </div>
              <div>
                <dt>Date</dt>
                <dd>{paper.publishedAt}</dd>
              </div>
            </dl>
            {paper.sourceUrl ? (
              <a className="source-link" href={paper.sourceUrl}>
                Source paper
              </a>
            ) : (
              <span className="source-link disabled">Demo module</span>
            )}
          </aside>
        </div>
      </header>

      <div className="paper-body">
        <aside className="section-rail" aria-label="Sections">
          {sections.map((section, index) => (
            <a href={`#${section.id}`} key={section.id}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              {section.label}
            </a>
          ))}
        </aside>
        <article className="paper-article">{children}</article>
      </div>
    </main>
  );
}

type PaperSpreadProps = {
  id: string;
  kicker: string;
  title: string;
  children: ReactNode;
  aside?: ReactNode;
};

export function PaperSpread({ id, kicker, title, children, aside }: PaperSpreadProps) {
  return (
    <section className="paper-spread" id={id}>
      <div className="spread-heading">
        <p className="eyebrow">{kicker}</p>
        <h2>{title}</h2>
      </div>
      <div className={aside ? "spread-grid" : "spread-single"}>
        <div>{children}</div>
        {aside ? <aside>{aside}</aside> : null}
      </div>
    </section>
  );
}

export function PullNote({
  label,
  children,
  tone = "neutral"
}: {
  label: string;
  children: ReactNode;
  tone?: "neutral" | "warm" | "cool";
}) {
  return (
    <div className={`pull-note ${tone}`}>
      <strong>{label}</strong>
      <p>{children}</p>
    </div>
  );
}

export function StepList({
  items
}: {
  items: Array<{
    title: string;
    body: string;
  }>;
}) {
  return (
    <ol className="step-list">
      {items.map((item, index) => (
        <li key={item.title}>
          <span>{String(index + 1).padStart(2, "0")}</span>
          <div>
            <strong>{item.title}</strong>
            <p>{item.body}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

export function ComparisonRows({
  leftTitle,
  rightTitle,
  rows
}: {
  leftTitle: string;
  rightTitle: string;
  rows: Array<{
    label: string;
    left: ReactNode;
    right: ReactNode;
  }>;
}) {
  return (
    <div className="comparison-table">
      <div className="comparison-header">
        <span />
        <strong>{leftTitle}</strong>
        <strong>{rightTitle}</strong>
      </div>
      {rows.map((row) => (
        <div className="comparison-row" key={row.label}>
          <span>{row.label}</span>
          <div>{row.left}</div>
          <div>{row.right}</div>
        </div>
      ))}
    </div>
  );
}
