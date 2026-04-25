import type { ReactNode } from "react";

export function LabelPill({ children }: { children: ReactNode }) {
  return <span className="label-pill">{children}</span>;
}

export function TokenRail({
  tokens,
  activeIndex
}: {
  tokens: Array<{
    label: string;
    kind?: "plain" | "warm" | "cool" | "muted";
  }>;
  activeIndex?: number;
}) {
  return (
    <div className="token-rail" aria-label="Token sequence">
      {tokens.map((token, index) => (
        <span
          className={`token-cell ${token.kind ?? "plain"} ${activeIndex === index ? "active" : ""}`}
          key={`${token.label}-${index}`}
        >
          {token.label}
        </span>
      ))}
    </div>
  );
}

export function CompressionDiagram() {
  return (
    <div className="compression-diagram" aria-label="KV compression diagram">
      <div className="diagram-row">
        <span className="row-label">KV0</span>
        <TokenRail
          tokens={[
            { label: "t0", kind: "cool" },
            { label: "t1", kind: "cool" },
            { label: "t2", kind: "cool" },
            { label: "t3", kind: "cool" },
            { label: "t4", kind: "warm" },
            { label: "t5", kind: "warm" },
            { label: "t6", kind: "warm" },
            { label: "t7", kind: "warm" }
          ]}
        />
        <span className="arrow">to</span>
        <TokenRail tokens={[{ label: "KVa", kind: "cool" }, { label: "KVb", kind: "warm" }]} />
      </div>
      <div className="diagram-row">
        <span className="row-label">gate</span>
        <TokenRail
          activeIndex={3}
          tokens={[
            { label: "wait", kind: "muted" },
            { label: "wait", kind: "muted" },
            { label: "wait", kind: "muted" },
            { label: "fire", kind: "warm" }
          ]}
        />
        <span className="arrow">to</span>
        <TokenRail tokens={[{ label: "write", kind: "warm" }]} />
      </div>
    </div>
  );
}

export function StateBuffer() {
  return (
    <div className="state-buffer" aria-label="Decode state buffer">
      {[
        ["t0", "d0", "", "", ""],
        ["t1", "d0", "d1", "", ""],
        ["t2", "d0", "d1", "d2", ""],
        ["t3", "d0", "d1", "d2", "d3"]
      ].map((row) => (
        <div className="buffer-row" key={row[0]}>
          <span>{row[0]}</span>
          {row.slice(1).map((cell, index) => (
            <i className={cell ? "filled" : ""} key={`${row[0]}-${index}`}>
              {cell}
            </i>
          ))}
        </div>
      ))}
    </div>
  );
}

export function GraphWalkDiagram() {
  return (
    <svg className="graph-diagram" viewBox="0 0 720 420" role="img" aria-label="BFS graph walk">
      <line x1="360" x2="210" y1="64" y2="176" />
      <line x1="360" x2="510" y1="64" y2="176" />
      <line x1="210" x2="130" y1="176" y2="318" />
      <line x1="210" x2="360" y1="176" y2="318" />
      <line x1="510" x2="360" y1="176" y2="318" />
      <line x1="510" x2="590" y1="176" y2="318" />
      <g className="depth-lines">
        <line x1="52" x2="668" y1="64" y2="64" />
        <line x1="52" x2="668" y1="176" y2="176" />
        <line x1="52" x2="668" y1="318" y2="318" />
      </g>
      <GraphNode x={360} y={64} label="a3f2c1" kind="start" />
      <GraphNode x={210} y={176} label="b9e4d7" kind="frontier" />
      <GraphNode x={510} y={176} label="c8b1f0" kind="frontier" />
      <GraphNode x={130} y={318} label="e1c9b4" kind="answer" />
      <GraphNode x={360} y={318} label="d6a3e2" kind="answer" />
      <GraphNode x={590} y={318} label="f2a8d5" kind="answer" />
      <text x="32" y="70">D0</text>
      <text x="32" y="182">D1</text>
      <text x="32" y="324">D2</text>
    </svg>
  );
}

function GraphNode({
  x,
  y,
  label,
  kind
}: {
  x: number;
  y: number;
  label: string;
  kind: "start" | "frontier" | "answer";
}) {
  return (
    <g className={`graph-node ${kind}`}>
      <circle cx={x} cy={y} r="28" />
      <text x={x} y={y + 5}>
        {label}
      </text>
    </g>
  );
}

export function PipelineFlow({
  stages
}: {
  stages: Array<{
    label: string;
    body: string;
  }>;
}) {
  return (
    <div className="pipeline-flow">
      {stages.map((stage, index) => (
        <div className="pipeline-stage" key={stage.label}>
          <span>{String(index + 1).padStart(2, "0")}</span>
          <strong>{stage.label}</strong>
          <p>{stage.body}</p>
        </div>
      ))}
    </div>
  );
}

export function MetricDelta({
  leftLabel,
  leftValue,
  center,
  rightLabel,
  rightValue
}: {
  leftLabel: string;
  leftValue: string;
  center: string;
  rightLabel: string;
  rightValue: string;
}) {
  return (
    <div className="metric-delta">
      <div>
        <span>{leftLabel}</span>
        <strong>{leftValue}</strong>
      </div>
      <p>{center}</p>
      <div>
        <span>{rightLabel}</span>
        <strong>{rightValue}</strong>
      </div>
    </div>
  );
}

export function MatrixSketch() {
  const cells = Array.from({ length: 36 }, (_, index) => index);

  return (
    <div className="matrix-sketch" aria-label="Attention matrix sketch">
      {cells.map((cell) => (
        <span
          className={cell % 7 === 0 || cell === 16 || cell === 23 ? "hot" : cell % 5 === 0 ? "mid" : ""}
          key={cell}
        />
      ))}
    </div>
  );
}
