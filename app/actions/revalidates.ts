"use server";

import { revalidateTag } from "next/cache";

export async function revalidateByKey(key: string) {
  revalidateTag(key, "max");
}
