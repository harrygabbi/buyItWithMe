"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
export function SignOutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <div>
      <Button
        type="button"
        variant="ghost"
        disabled={busy}
        onClick={async () => {
          if (
            !window.dispatchEvent(
              new Event("openhouse:before-leave", { cancelable: true }),
            )
          )
            return;
          setBusy(true);
          setError("");
          try {
            const response = await fetch("/api/auth/logout", {
              method: "POST",
            });
            if (!response.ok) throw new Error("Sign out failed. Try again.");
            router.replace("/login");
            router.refresh();
          } catch (e) {
            setError((e as Error).message);
            setBusy(false);
          }
        }}
      >
        {busy ? "Signing out…" : "Sign out"}
      </Button>
      {error && <small role="alert">{error}</small>}
    </div>
  );
}
