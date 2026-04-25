# Add a Paper to XivLens

Use this process when you give Codex a research paper link and ask it to add the paper to the atlas.

## 1. Read the Source

- Open the paper, project page, and any official code or benchmark docs.
- Extract the paper's main claim, core mechanism, evidence, limitations, and terminology.
- Do not rely on the abstract alone. Check the method, experiments, and conclusion.

## 2. Choose the Visual Story

Pick 3-6 sections that explain the paper in order:

- overview: what problem the paper isolates
- mechanism: the model, algorithm, architecture, or benchmark rule
- comparison: what changes against the baseline
- evidence: the result table, ablation, or qualitative behavior that matters
- limitations: what the paper does not prove
- takeaway: the one sentence a technical reader should remember

## 3. Implement the Module

- Add a file in `src/papers/`.
- Export a `PaperModule` with `meta`, `sections`, and `VisualEssay`.
- Use shared primitives from `src/components/PaperEssay.tsx` and `src/components/VisualPrimitives.tsx`.
- Add bespoke SVG or React diagrams only when the shared primitives cannot explain the paper clearly.
- Register the module in `src/papers/registry.ts`.

## 4. Verify the Page

Run:

```bash
npm run typecheck
npm run lint
npm run build
```

Then inspect the page on desktop and mobile. The paper should appear in the index, render without overflow, keep claims grounded in the source, and expose the source URL when the module represents a real paper.
