"use client";

import { useId, useState } from "react";

import { categories } from "../../data/categories";
import { site } from "../../data/site";
import { conditionGrades } from "../../lib/catalog";
import { cx } from "../../lib/format";
import { Icon } from "../ui/icon";
import { btn, field } from "../ui/styles";

type Errors = Partial<Record<"category" | "brand" | "condition" | "name" | "email" | "phone", string>>;

/**
 * Free Online Estimate. Front-end only: on submit, POST `FormData` to a route
 * handler that emails the team / creates a CRM lead and stores the photos.
 */
export function EstimateForm({ defaultIntent = "sell" }: { defaultIntent?: "pawn" | "sell" }) {
  const id = useId();
  const [intent, setIntent] = useState<"pawn" | "sell">(defaultIntent);
  const [photos, setPhotos] = useState<File[]>([]);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [submittedName, setSubmittedName] = useState("");

  function validate(data: FormData) {
    const next: Errors = {};
    if (!data.get("category")) next.category = "Choose a category.";
    if (!String(data.get("brand") ?? "").trim()) next.brand = "Enter the brand or maker (or “Unknown”).";
    if (!data.get("condition")) next.condition = "Choose the condition.";
    if (!String(data.get("name") ?? "").trim()) next.name = "Enter your name.";
    if (!/^\S+@\S+\.\S+$/.test(String(data.get("email") ?? ""))) next.email = "Enter a valid email.";
    const phone = String(data.get("phone") ?? "").replace(/\D/g, "");
    if (phone && phone.length < 10) next.phone = "Enter a 10-digit phone number.";
    return next;
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const nextErrors = validate(data);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      const first = Object.keys(nextErrors)[0];
      event.currentTarget.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    setStatus("sending");
    await new Promise((r) => setTimeout(r, 800)); // replace with fetch("/api/estimate", { method: "POST", body: data })
    setSubmittedName(String(data.get("name")).split(" ")[0]);
    setStatus("done");
  }

  if (status === "done") {
    return (
      <div role="status" className="border border-bx-line bg-white p-8 text-center sm:p-12">
        <span className="mx-auto flex h-12 w-12 items-center justify-center border border-bx-ink text-bx-ink">
          <Icon name="check" size={22} />
        </span>
        <h3 className="mt-5 font-bx-serif text-3xl font-normal text-bx-ink">Thank you, {submittedName}!</h3>
        <p className="mx-auto mt-2 max-w-md text-[15px] leading-relaxed text-bx-muted">
          We&apos;ve received your {intent === "pawn" ? "pawn loan" : "selling"} estimate request. A specialist will reach out within one business day.
          Prefer to talk now? Call <a href={`tel:${site.phone.tel}`} className="font-semibold text-bx-ink underline">{site.phone.display}</a>.
        </p>
        <button
          type="button"
          className={`${btn.outline} mt-6`}
          onClick={() => {
            setStatus("idle");
            setPhotos([]);
          }}
        >
          Submit another item
        </button>
      </div>
    );
  }

  const err = (key: keyof Errors) =>
    errors[key] ? (
      <p id={`${id}-${key}-err`} className={field.error}>
        {errors[key]}
      </p>
    ) : null;
  const aria = (key: keyof Errors) => ({
    "aria-invalid": Boolean(errors[key]) || undefined,
    "aria-describedby": errors[key] ? `${id}-${key}-err` : undefined,
  });

  return (
    <form noValidate onSubmit={onSubmit} className="border border-bx-line bg-white p-6 sm:p-10">
      <fieldset className="mb-8">
        <legend className={field.label}>Pawn or Sell?</legend>
        <div className="mt-1 grid grid-cols-2 gap-2 bg-bx-cream p-1 sm:inline-grid sm:w-80">
          {(["pawn", "sell"] as const).map((value) => (
            <label
              key={value}
              className={cx(
                "cursor-pointer py-2.5 text-center text-sm font-semibold transition has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-bx-ink",
                intent === value ? "bg-bx-ink text-bx-ivory" : "text-bx-charcoal hover:text-bx-ink",
              )}
            >
              <input type="radio" name="intent" value={value} checked={intent === value} onChange={() => setIntent(value)} className="sr-only" />
              {value === "pawn" ? "Pawn (Loan)" : "Sell"}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor={`${id}-category`} className={field.label}>Item Category *</label>
          <select id={`${id}-category`} name="category" defaultValue="" className={field.input} {...aria("category")}>
            <option value="" disabled>Select a category</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>{c.name}</option>
            ))}
            <option value="other">Other</option>
          </select>
          {err("category")}
        </div>
        <div>
          <label htmlFor={`${id}-condition`} className={field.label}>Condition *</label>
          <select id={`${id}-condition`} name="condition" defaultValue="" className={field.input} {...aria("condition")}>
            <option value="" disabled>Select condition</option>
            {[...conditionGrades, "Needs Repair"].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          {err("condition")}
        </div>
        <div>
          <label htmlFor={`${id}-brand`} className={field.label}>Brand *</label>
          <input id={`${id}-brand`} name="brand" placeholder="e.g. Cartier, Apple, Fender" className={field.input} {...aria("brand")} />
          {err("brand")}
        </div>
        <div>
          <label htmlFor={`${id}-model`} className={field.label}>Model / Details</label>
          <input id={`${id}-model`} name="model" placeholder="Model, size, karat, year…" className={field.input} />
        </div>

        <div className="sm:col-span-2">
          <span className={field.label} id={`${id}-photos-label`}>Photos</span>
          <label
            htmlFor={`${id}-photos`}
            className="flex cursor-pointer flex-col items-center justify-center gap-2 border-2 border-dashed border-bx-line bg-bx-ivory px-6 py-8 text-center hover:border-bx-ink has-[:focus-visible]:border-bx-ink"
          >
            <Icon name="upload" size={28} className="text-bx-ink" />
            <span className="text-sm font-semibold text-bx-ink">Upload up to 5 photos</span>
            <span className="text-xs text-bx-muted">Front, back, any markings, serial numbers and papers. JPG, PNG or HEIC.</span>
            <input
              id={`${id}-photos`}
              name="photos"
              type="file"
              accept="image/*"
              multiple
              aria-labelledby={`${id}-photos-label`}
              className="sr-only"
              onChange={(e) => setPhotos(Array.from(e.target.files ?? []).slice(0, 5))}
            />
          </label>
          {photos.length ? (
            <ul className="mt-3 flex flex-wrap gap-2 text-xs text-bx-charcoal">
              {photos.map((file) => (
                <li key={file.name + file.size} className="bg-bx-cream px-3 py-1">
                  {file.name}
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <div className="sm:col-span-2">
          <label htmlFor={`${id}-name`} className={field.label}>Full Name *</label>
          <input id={`${id}-name`} name="name" autoComplete="name" className={field.input} {...aria("name")} />
          {err("name")}
        </div>
        <div>
          <label htmlFor={`${id}-email`} className={field.label}>Email *</label>
          <input id={`${id}-email`} name="email" type="email" autoComplete="email" className={field.input} {...aria("email")} />
          {err("email")}
        </div>
        <div>
          <label htmlFor={`${id}-phone`} className={field.label}>Phone</label>
          <input id={`${id}-phone`} name="phone" type="tel" autoComplete="tel" className={field.input} {...aria("phone")} />
          {err("phone")}
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-bx-muted">Online estimates are free and non-binding. Final offers are confirmed after an in-store inspection.</p>
        <button type="submit" className={`${btn.primary} shrink-0`} disabled={status === "sending"}>
          {status === "sending" ? "Sending…" : "Get My Free Estimate"}
        </button>
      </div>
    </form>
  );
}
