"use server";

const API_BASE_URL = process.env.INTERNAL_API_URL ?? "http://localhost:3000";

export async function listPosts({
  page,
  perPage,
}: {
  page: number;
  perPage: number;
}) {
  const searchParamsQuery = new URLSearchParams();

  if (perPage) {
    searchParamsQuery.set("perPage", String(perPage));
    searchParamsQuery.set("page", String(page));
  }

  const queryString = searchParamsQuery.toString();

  const requestTags = ["posts"];

  if (perPage) {
    requestTags.push(`posts-perPage-${perPage}`);
  }

  if (page) {
    requestTags.push(`posts-page-${page}`);
  }

  const { buildGetPosts } = await import("./buildTag");

  const requestTag = buildGetPosts({ page, perPage });

  const req = await fetch(
    `${API_BASE_URL}/api/posts${queryString ? `?${queryString}` : ""}`,
    {
      next: { tags: [requestTag], revalidate: 120 },
    },
  );

  const data: { data: Post[]; total: number } = await req.json();

  return data;
}

export async function getPostById(id: number) {
  try {
    const { buildGetPostTag } = await import("./buildTag");
    const requestTag = buildGetPostTag(id);
    const req = await fetch(`${API_BASE_URL}/api/posts/${id}`, {
      next: { tags: [requestTag], revalidate: 120 },
    });

    const data = await req.json();

    return data;
  } catch (error) {
    console.error("Error fetching post by ID:", error);
    return null;
  }
}

export async function getCommentsByPostId(postId: number) {
  try {
    const { buildGetPostCommentsTag } = await import("./buildTag");

    const requestTag = buildGetPostCommentsTag(postId);

    const req = await fetch(`${API_BASE_URL}/api/posts/${postId}/comments`, {
      next: { tags: [requestTag], revalidate: 120 },
    });

    const data: PostComment[] = await req.json();

    return data;
  } catch (error) {
    console.error("Error fetching comments by post ID:", error);
    return [];
  }
}
