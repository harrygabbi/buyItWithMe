"use client";
import { useEffect } from "react";
// Resources have their own explicit saves, independent of the property's field draft.
export function useUnsavedResource(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return;
    const before = (event: BeforeUnloadEvent) => event.preventDefault();
    const section = (event: Event) => {
      if (!window.confirm("Discard unsaved room, photo, or document details?"))
        event.preventDefault();
    };
    const link = (event: MouseEvent) => {
      const anchor = (event.target as Element).closest("a");
      if (
        anchor &&
        anchor.href !== location.href &&
        !window.confirm("Leave and discard unsaved resource details?")
      ) {
        event.preventDefault();
        event.stopPropagation();
      }
    };
    window.addEventListener("beforeunload", before);
    window.addEventListener("openhouse:before-section", section);
    window.addEventListener("openhouse:before-leave", section);
    document.addEventListener("click", link, true);
    return () => {
      window.removeEventListener("beforeunload", before);
      window.removeEventListener("openhouse:before-section", section);
      window.removeEventListener("openhouse:before-leave", section);
      document.removeEventListener("click", link, true);
    };
  }, [dirty]);
}
