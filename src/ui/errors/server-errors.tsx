import { getServerErrors } from "#app/lib/utils/errors.ts";

export function ServerErrors({ error }: { error: Error | null }) {
  if (error === null) return null;

  return (
    <ul className="error-messages">
      {getServerErrors(error).map((err) => (
        <li key={err}>{err}</li>
      ))}
    </ul>
  );
}
