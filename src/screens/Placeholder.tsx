export function Placeholder({ title }: { title: string }) {
  return (
    <section className="stack">
      <h1>{title}</h1>
      <p className="muted">Coming in a later sprint.</p>
    </section>
  );
}
