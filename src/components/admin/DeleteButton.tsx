"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Trash2 } from "lucide-react";

export default function DeleteButton({
  endpoint,
  confirm = "Delete this item?",
  label = "Delete",
  onDeleted,
  size = "sm",
  iconOnly = false,
  redirectTo,
  permanent = false,
}: {
  endpoint: string;
  confirm?: string;
  label?: string;
  onDeleted?: () => void;
  size?: "sm" | "md";
  iconOnly?: boolean;
  redirectTo?: string;
  /** Super admin: permanently remove a soft-deleted row from the database. */
  permanent?: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onClick() {
    if (!window.confirm(confirm)) return;
    setBusy(true);
    const url = permanent
      ? `${endpoint}${endpoint.includes("?") ? "&" : "?"}permanent=1`
      : endpoint;
    const res = await fetch(url, { method: "DELETE" });
    setBusy(false);
    if (!res.ok) {
      alert("Delete failed");
      return;
    }
    if (onDeleted) onDeleted();
    if (redirectTo) router.push(redirectTo);
    router.refresh();
  }

  return (
    <button
      onClick={onClick}
      disabled={busy}
      className={`inline-flex items-center gap-1 rounded hover:bg-red-50 disabled:opacity-50 ${
        permanent ? "text-ink-900" : "text-red-600"
      } ${size === "sm" ? "px-2 py-1 text-xs" : "px-3 py-1.5 text-sm"}`}
      title={label}
    >
      <Trash2 className={size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"} />
      {!iconOnly && (busy ? "Deleting..." : label)}
    </button>
  );
}
