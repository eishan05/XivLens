import Link from "next/link";

export default function NotFound() {
  return (
    <main className="not-found">
      <p className="eyebrow">XivLens</p>
      <h1>Paper not found</h1>
      <p>The atlas does not have a module for that slug yet.</p>
      <Link href="/" className="primary-link">
        Back to atlas
      </Link>
    </main>
  );
}
