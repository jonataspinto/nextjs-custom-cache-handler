"use client";

import { useRouter } from "next/navigation";

export function GoBackButton() {
  const router = useRouter();
  return (
    <button
      onClick={() => router.back()}
      className="flex items-center gap-2 border border-foreground/30 rounded-lg px-4 py-2 hover:bg-foreground/10 transition-colors w-fit"
    >
      <span>←</span> Go Back
    </button>
  );
}
