export function Spinner() {
  return (
    <div
      // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role
      role="status"
      aria-label="Loading"
      className="page-spinner"
      style={{
        position: "fixed",
        inset: 0,
        margin: "auto",
        width: "2.5rem",
        height: "2.5rem",
        border: "0.4em solid currentColor",
        borderRightColor: "transparent",
        borderRadius: "50%",
        color: "#5cb85c",
        animation: "spin 0.75s linear infinite",
      }}
    >
      <style>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        `}</style>
    </div>
  );
}
