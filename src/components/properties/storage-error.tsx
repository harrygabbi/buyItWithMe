"use client";
import { useState } from "react";
import { AlertCircle } from "lucide-react";
import { resetPrototype } from "@/lib/properties/repository";
import { Button } from "@/components/ui/button";
export function StorageError({
  message,
  onReset,
}: {
  message: string;
  onReset: () => void;
}) {
  const [confirm, setConfirm] = useState(false);
  const [error, setError] = useState("");
  return (
    <div className="storage-error" role="alert">
      <AlertCircle size={22} aria-hidden="true" />
      <div>
        <h2>We couldn’t load your properties</h2>
        <p>{message}</p>
        {error && <p>{error}</p>}
        {confirm ? (
          <div className="mt-4">
            <p>
              Resetting replaces all saved properties in this browser with
              demonstration data. This cannot be undone.
            </p>
            <div className="flex gap-2 mt-3">
              <Button variant="outline" onClick={() => setConfirm(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  try {
                    resetPrototype();
                    onReset();
                  } catch (e) {
                    setError(e instanceof Error ? e.message : "Reset failed.");
                  }
                }}
              >
                Reset prototype data
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="outline"
            className="mt-3"
            onClick={() => setConfirm(true)}
          >
            Reset prototype data
          </Button>
        )}
      </div>
    </div>
  );
}
