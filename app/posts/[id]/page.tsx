import { Suspense } from "react";
import { Comments, CommentsSkeleton } from "./components/Comments";
import { GoBackButton } from "./components/GoBackButton";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { getPostById } = await import("../../services/posts/posts.service");

  const post = await getPostById(Number(id));

  if (!post) {
    return (
      <div className="flex min-h-screen flex-col gap-4 p-4 sm:px-8">
        <h1 className="text-2xl font-bold m-auto">Post not found</h1>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col gap-4 p-4 sm:px-8">
      <GoBackButton />

      <h1 className="text-2xl font-bold capitalize">{post.title}</h1>
      <p className="">{post.body}</p>

      <h3>Comments</h3>
      <Suspense fallback={<CommentsSkeleton />}>
        <Comments postId={Number(id)} />
      </Suspense>
    </div>
  );
}
