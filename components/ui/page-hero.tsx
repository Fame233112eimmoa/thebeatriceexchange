import Link from "next/link";

import { routes } from "../../lib/routes";
import { container } from "./styles";

export function PageHero({
  title,
  description,
  crumbs = [],
  children,
}: {
  title: string;
  description?: string;
  crumbs?: Array<{ label: string; href?: string }>;
  children?: React.ReactNode;
}) {
  return (
    <section className="border-b border-bx-line bg-white">
      <div className={`${container} py-10 sm:py-14`}>
        <nav aria-label="Breadcrumb" className="mb-5 text-xs text-bx-muted">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link href={routes.home} className="hover:text-bx-ink">
                Home
              </Link>
            </li>
            {crumbs.map((crumb) => (
              <li key={crumb.label} className="flex items-center gap-1.5">
                <span aria-hidden="true">/</span>
                {crumb.href ? (
                  <Link href={crumb.href} className="hover:text-bx-ink">
                    {crumb.label}
                  </Link>
                ) : (
                  <span aria-current="page" className="text-bx-ink">
                    {crumb.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
        <h1 className="font-bx-serif text-4xl font-normal leading-tight text-bx-ink sm:text-[52px]">{title}</h1>
        {description ? <p className="mt-3 max-w-2xl text-base leading-relaxed text-bx-muted">{description}</p> : null}
        {children}
      </div>
    </section>
  );
}
