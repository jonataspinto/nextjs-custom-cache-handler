export function buildGetPosts({
  page,
  perPage,
}: {
  page: number;
  perPage: number;
}): string {
  return `posts:page:${page}__perPage__${perPage}`;
}

export function buildGetPostTag(postId: number): string {
  return `posts:id:${postId}`;
}

export function buildGetPostCommentsTag(postId: number): string {
  return `posts:id:${postId}:comments`;
}
