import { useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Suspense } from "react";

import { getTags } from "#app/api/tags/tags.queries.ts";

export function Tags() {
  return (
    <div className="sidebar">
      <Suspense
        fallback={
          <>
            <p>Popular Tags</p>
            Loading tags...
          </>
        }
      >
        <TagFilter />
      </Suspense>
    </div>
  );
}

function TagFilter() {
  const { data: tags, isFetching } = useSuspenseQuery(getTags);

  return (
    <>
      <p>Popular Tags{isFetching ? "..." : null}</p>
      <div className="tag-list">
        {tags.length === 0 && <>No tags are here... yet.</>}
        {tags.map((tag) => (
          <Link key={tag} to="/tag/$tag" params={{ tag }} className="tag-pill tag-default">
            {tag}
          </Link>
        ))}
      </div>
    </>
  );
}
