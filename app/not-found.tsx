import Link from "next/link";

import { Monogram } from "@/components/ui/logo";
import { btn, container } from "@/components/ui/styles";
import { routes } from "@/lib/routes";

export default function NotFound() {
  return (
    <div className={`${container} flex flex-col items-center py-24 text-center`}>
      <Monogram size={72} />
      <h1 className="mt-6 font-bx-serif text-5xl text-bx-ink">This one&apos;s already been sold.</h1>
      <p className="mt-3 max-w-md text-bx-muted">The page or item you&apos;re looking for isn&apos;t here. Our inventory turns over fast, but new treasures arrive every day.</p>
      <div className="mt-8 flex gap-3">
        <Link href={routes.shop} className={btn.primary}>Shop New Arrivals</Link>
        <Link href={routes.home} className={btn.outline}>Go Home</Link>
      </div>
    </div>
  );
}
