"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { moderateListing, resolveReport, setUserBlocked } from "@/actions/admin";
import { Button } from "@/components/ui/button";

export type AdminOp =
  | { kind: "removeListing"; id: string }
  | { kind: "restoreListing"; id: string }
  | { kind: "report"; id: string; status: "revisado" | "descartado" }
  | { kind: "block"; id: string; blocked: boolean };

const run = (op: AdminOp) => {
  switch (op.kind) {
    case "removeListing":
      return moderateListing(op.id, "remove");
    case "restoreListing":
      return moderateListing(op.id, "restore");
    case "report":
      return resolveReport(op.id, op.status);
    case "block":
      return setUserBlocked(op.id, op.blocked);
  }
};

export function AdminButton({
  op,
  label,
  variant = "outline",
  confirmText,
}: {
  op: AdminOp;
  label: string;
  variant?: "outline" | "danger" | "soft";
  confirmText?: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  return (
    <span className="inline-flex flex-col">
      <Button
        variant={variant}
        className="min-h-10"
        disabled={pending}
        onClick={() => {
          if (confirmText && !confirm(confirmText)) return;
          start(async () => {
            const res = await run(op);
            if (!res.ok) setError(res.error);
            else router.refresh();
          });
        }}
      >
        {label}
      </Button>
      {error && (
        <span role="alert" className="text-danger text-xs">
          {error}
        </span>
      )}
    </span>
  );
}
