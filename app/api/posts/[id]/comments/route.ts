export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (id && Number(id) === 2) {
    throw new Error("Method not implemented.");
  }

  const req = await fetch(
    `https://jsonplaceholder.typicode.com/posts/${id}/comments`,
  );

  const post: Post = await req.json();

  await new Promise((resolve) => setTimeout(resolve, 5_000));

  return new Response(JSON.stringify(post), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
