import { ReactNode } from "react";

export function Card({
  header,
  description,
  children,
}: {
  header: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="card mb-6">
      <div className="card-header">
        <div className="card-title">{header}</div>
        {description ? (
          <div className="card-description">{description}</div>
        ) : null}
      </div>
      <div className="card-body">{children}</div>
    </section>
  );
}
