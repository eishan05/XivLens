import Link from "next/link";
import { PaperIndex } from "@/components/PaperIndex";
import { getAllPapers } from "@/papers/registry";

export default function Home() {
  const papers = getAllPapers().map((paper) => paper.meta);

  return (
    <main className="atlas-home">
      <header className="home-hero">
        <nav className="topline" aria-label="Atlas">
          <Link href="/" className="brand-mark">
            XivLens
          </Link>
          <span>paper atlas</span>
        </nav>

        <div className="hero-grid">
          <section className="hero-copy" aria-labelledby="home-title">
            <p className="eyebrow">Visual research notes</p>
            <h1 id="home-title">Papers, made visual.</h1>
            <p className="hero-deck">Diagrams, comparisons, concise claims.</p>
            <div className="hero-actions">
              <a href="#papers" className="primary-link">
                Browse papers
              </a>
              <Link href="/papers/kv-cache-compression" className="secondary-link">
                Open starter essay
              </Link>
            </div>
          </section>

          <section className="hero-visual" aria-label="Paper atlas preview">
            <div className="visual-axis">
              <span>claim</span>
              <span>mechanism</span>
              <span>evidence</span>
            </div>
            <div className="lens-board">
              <div className="lens-column warm">
                <p>paper</p>
                <strong>Dense PDF</strong>
                <span>methods, figures, appendix</span>
              </div>
              <div className="lens-path" aria-hidden="true">
                <i />
                <i />
                <i />
              </div>
              <div className="lens-column cool">
                <p>atlas</p>
                <strong>Conceptual spread</strong>
                <span>sections, diagrams, exact claims</span>
              </div>
            </div>
            <div className="mini-spread" aria-hidden="true">
              <div />
              <div />
              <div />
              <div />
            </div>
          </section>
        </div>
      </header>

      <section className="workflow-band" aria-label="Workflow">
        <div>
          <span>01</span>
          <strong>Send the paper</strong>
          <p>Source, claim, mechanism, evidence.</p>
        </div>
        <div>
          <span>02</span>
          <strong>Shape the story</strong>
          <p>Sections, diagrams, comparisons.</p>
        </div>
        <div>
          <span>03</span>
          <strong>Add the module</strong>
          <p>Typed React, registered in the atlas.</p>
        </div>
      </section>

      <section className="paper-index-section" id="papers" aria-labelledby="papers-title">
        <div className="section-heading">
          <p className="eyebrow">Atlas index</p>
          <h2 id="papers-title">Paper modules</h2>
        </div>
        <PaperIndex papers={papers} />
      </section>
    </main>
  );
}
