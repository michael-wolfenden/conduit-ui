import { Link } from "@tanstack/react-router";

export function NotFound() {
  return (
    <div className="container page">
      <div>
        <h3>Page not found</h3>
        <p>Sorry, we couldn&apos;t find the page you&apos;re looking for.</p>
        <Link to="/" className="btn btn-sm btn-outline-primary">
          Go back home
        </Link>
      </div>
    </div>
  );
}
