"use client";

import { buildGetPosts } from "@/app/services/posts/buildTag";
import { useSearchParams } from "next/navigation";
import { useTransition } from "react";

export function DeleteCacheButton() {
  const searchParams = useSearchParams();
  const perPage = searchParams.get("perPage") || "10";
  const page = searchParams.get("page") || "1";

  async function handleRevalidate() {
    await new Promise((resolve) => setTimeout(resolve, 2_000));

    const tag = buildGetPosts({ page: Number(page), perPage: Number(perPage) });

    const { revalidateByKey } = await import("../../actions/revalidates");

    revalidateByKey(tag);
  }

  const [isPending, starTransition] = useTransition();

  return (
    <button
      onClick={() =>
        starTransition(async () => {
          await handleRevalidate();
        })
      }
      className="rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
    >
      {isPending ? "Removing cache" : "Delete cache example"}
    </button>
  );
}
