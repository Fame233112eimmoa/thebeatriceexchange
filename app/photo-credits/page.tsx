import type { Metadata } from "next";

import { PageHero } from "@/components/ui/page-hero";
import { container } from "@/components/ui/styles";
import { imageCredits } from "@/lib/images";

export const metadata: Metadata = {
  alternates: { canonical: "/photo-credits" }, title: "Photo Credits", description: "Credits for the photography used on BHS Premier Pawn and Jewelry website." };

const groups = [
  ["hero", "Homepage"],
  ["categories", "Categories"],
  ["products", "Products"],
  ["blog", "Blog"],
  ["about", "About & How It Works"],
] as const;

export default function PhotoCreditsPage() {
  return (
    <>
      <PageHero
        title="Photo Credits"
        crumbs={[{ label: "Photo Credits" }]}
        description="Photography on this site is openly licensed work by the photographers credited below. Product photos are representative and may not show the exact item for sale."
      />
      <div className={`${container} space-y-12 py-12`}>
        {imageCredits.length === 0 ? (
          <p className="text-[15px] text-bx-muted">No stock photos are in use yet.</p>
        ) : (
          groups.map(([group, label]) => {
            const rows = imageCredits.filter((image) => image.group === group);
            if (!rows.length) return null;
            return (
              <section key={group} aria-labelledby={`credits-${group}`}>
                <h2 id={`credits-${group}`} className="mb-4 font-bx-serif text-3xl font-normal text-bx-ink">
                  {label}
                </h2>
                <ul className="divide-y divide-bx-line border-y border-bx-line text-sm">
                  {rows.map((image) => (
                    <li key={image.key} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
                      <span className="text-bx-charcoal">{image.alt}</span>
                      <span className="shrink-0 text-bx-muted">
                        <a href={image.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-bx-ink">
                          Photo
                        </a>{" "}
                        by{" "}
                        {image.creatorUrl ? (
                          <a href={image.creatorUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-bx-ink">
                            {image.creator}
                          </a>
                        ) : (
                          image.creator
                        )}
                        {" · "}
                        <a href={image.licenseUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-bx-ink">
                          {image.license}
                        </a>
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })
        )}
      </div>
    </>
  );
}
