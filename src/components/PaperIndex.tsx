"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { PaperMeta } from "@/papers/types";

type PaperIndexProps = {
  papers: PaperMeta[];
};

export function PaperIndex({ papers }: PaperIndexProps) {
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState("All");

  const tags = useMemo(() => {
    const uniqueTags = new Set(papers.flatMap((paper) => paper.tags));
    return ["All", ...Array.from(uniqueTags).sort()];
  }, [papers]);

  const filteredPapers = papers.filter((paper) => {
    const haystack = [
      paper.title,
      paper.subtitle,
      paper.abstract,
      paper.venue,
      paper.authors.join(" "),
      paper.tags.join(" ")
    ]
      .join(" ")
      .toLowerCase();

    const matchesQuery = haystack.includes(query.trim().toLowerCase());
    const matchesTag = activeTag === "All" || paper.tags.includes(activeTag);

    return matchesQuery && matchesTag;
  });

  return (
    <div className="paper-index">
      <div className="index-controls">
        <label className="search-field">
          <span>Search</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="mechanism, benchmark, long context..."
          />
        </label>
        <div className="tag-row" aria-label="Filter by topic">
          {tags.map((tag) => (
            <button
              className={tag === activeTag ? "tag-chip active" : "tag-chip"}
              key={tag}
              onClick={() => setActiveTag(tag)}
              type="button"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div className="paper-list">
        {filteredPapers.map((paper) => (
          <Link className="paper-row" href={`/papers/${paper.slug}`} key={paper.slug}>
            <span className="paper-accent" style={{ backgroundColor: paper.accent }} />
            <span className="paper-row-main">
              <span className="paper-row-kicker">
                {paper.status === "demo" ? "Demo module" : paper.venue}
              </span>
              <strong>{paper.title}</strong>
              <span>{paper.subtitle}</span>
            </span>
            <span className="paper-row-meta">
              <span>{paper.publishedAt}</span>
              <span>{paper.tags.slice(0, 3).join(" / ")}</span>
            </span>
          </Link>
        ))}
      </div>

      {filteredPapers.length === 0 ? (
        <p className="empty-state">No paper modules match that filter.</p>
      ) : null}
    </div>
  );
}
