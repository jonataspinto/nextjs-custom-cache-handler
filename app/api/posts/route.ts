export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const perPage = searchParams.get("perPage");
  const page = searchParams.get("page");

  const req = await fetch("https://jsonplaceholder.typicode.com/posts");

  const data: Post[] = await req.json();

  let posts = data;

  if (perPage) {
    const perPageNumber = parseInt(perPage, 10);
    if (!isNaN(perPageNumber) && perPageNumber > 0) {
      posts = posts.slice(0, perPageNumber);
    }
  }

  if (page) {
    const pageNumber = parseInt(page, 10);

    if (!isNaN(pageNumber) && pageNumber > 0) {
      posts = data.slice(
        (pageNumber - 1) * (perPage ? parseInt(perPage, 10) : 10),
        pageNumber * (perPage ? parseInt(perPage, 10) : 10),
      );
    }
  }

  const response = {
    data: posts,
    total: data.length,
  };

  return new Response(JSON.stringify(response), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
