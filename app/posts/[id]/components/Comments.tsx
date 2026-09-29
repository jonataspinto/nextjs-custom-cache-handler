import { getCommentsByPostId } from "@/app/services/posts/posts.service";

export function CommentsSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="flex flex-col gap-2 p-4 border border-foreground/30 rounded-lg animate-pulse"
        >
          <div className="h-4 w-1/2 bg-foreground/30 rounded"></div>
          <div className="h-3 w-full bg-foreground/30 rounded"></div>
          <div className="h-3 w-full bg-foreground/30 rounded"></div>
          <div className="h-3 w-full bg-foreground/30 rounded"></div>
        </div>
      ))}
    </div>
  );
}

export async function Comments({ postId }: { postId: number }) {
  const comments = await getCommentsByPostId(postId);

  if (!comments || comments.length === 0) {
    return <p>No comments found for this post.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {comments.map((comment) => (
        <div
          key={comment.id}
          className="flex flex-col gap-2 p-4 border border-foreground/30 rounded-lg"
        >
          <h4 className="font-semibold">{comment.name}</h4>
          <p>{comment.body}</p>
          <span className="text-sm text-foreground/70">{comment.email}</span>
        </div>
      ))}
    </div>
  );
}
