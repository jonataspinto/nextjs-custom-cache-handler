import Link from "next/link";
import { DeleteCacheButton } from "./components/DeleteCacheButton";
import { Pagination } from "./components/Pagination";
import { listPosts } from "../services/posts/posts.service";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ perPage?: string; page?: string }>;
}) {
  const { perPage = "6", page = "1" } = await searchParams;

  const { data, total } = await listPosts({
    page: Number(page),
    perPage: Number(perPage),
  });

  return (
    <div className="flex min-h-screen flex-col gap-6 p-4 sm:px-8">
      <header className="flex gap-2">
        <h1 className="text-3xl font-bold">Posts</h1>
        <DeleteCacheButton />
      </header>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {data.map((post) => (
          <Link
            key={post.id}
            href={`/posts/${post.id}`}
            className="flex flex-col gap-4 p-6 hover:border-foreground/20 border border-foreground/30 rounded-lg transition-colors"
          >
            <h2 className="text-xl font-semibold line-clamp-1 capitalize">
              {post.title}
            </h2>
            <p className="line-clamp-3">{post.body}</p>
          </Link>
        ))}
      </div>

      <Pagination perPage={Number(perPage)} page={Number(page)} total={total} />
    </div>
  );
}
