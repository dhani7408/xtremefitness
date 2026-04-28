import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function inr(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n || 0);
}

export function fmtDate(d: Date | string | null | undefined) {
  if (!d) return "-";
  const dt = typeof d === "string" ? new Date(d) : d;
  return dt.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/** Printable invoice HTML. Use `download` to save a file (browser may then print to PDF). */
export function paymentInvoiceHref(paymentId: string, mode: "open" | "download" = "open") {
  return mode === "download" ? `/api/invoice/${paymentId}?download=1` : `/api/invoice/${paymentId}`;
}

/** Payment.payType from DB: FULL cleared remaining due on subscription for that receipt; PARTIAL otherwise. */
export function paymentTypeLabel(payType: string | null | undefined): { text: string; short: string } {
  if (payType === "FULL") return { text: "Full payment", short: "Full" };
  if (payType === "PARTIAL") return { text: "Partial payment", short: "Partial" };
  return { text: "Payment", short: "—" };
}

export function fmtDateTime(d: Date | string | null | undefined) {
  if (!d) return "-";
  const dt = typeof d === "string" ? new Date(d) : d;
  return dt.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function daysBetween(a: Date, b: Date) {
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}
