import Link from "next/link";

export function Pagination({
  perPage,
  page,
  total,
}: {
  perPage: number;
  page: number;
  total: number;
}) {
  return (
    <div className="flex gap-2 justify-center mt-autos">
      {page === 1 ? (
        <span className="bg-foreground px-4 py-2 text-background transition-colors">
          Previous
        </span>
      ) : (
        <Link
          href={`/posts?perPage=${perPage}&page=${page - 1}`}
          className="bg-foreground px-4 py-2 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
        >
          Previous
        </Link>
      )}

      <span className="px-4 py-2 rounded bg-foreground text-background">
        {page} of {Math.ceil(total / perPage)}
      </span>

      {page * perPage < total ? (
        <Link
          href={`/posts?perPage=${perPage}&page=${page + 1}`}
          className="bg-foreground px-4 py-2 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
        >
          Next
        </Link>
      ) : (
        <span className="bg-foreground px-4 py-2 text-background transition-colors">
          Next
        </span>
      )}
    </div>
  );
}
