"use client";

import { useIsFetching, useIsMutating } from "@tanstack/react-query";

export default function GlobalLoadingOverlay() {
  const fetching = useIsFetching();
  const mutating = useIsMutating();

  if (!fetching && !mutating) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 pointer-events-none">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-white border-t-transparent" />
    </div>
  );
}
