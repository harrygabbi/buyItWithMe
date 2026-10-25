"use client";
export default function GlobalError({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          fontFamily: "system-ui,sans-serif",
          background: "#f5f5f7",
          color: "#1d1d1f",
          padding: 40,
        }}
      >
        <main
          style={{
            maxWidth: 560,
            margin: "10vh auto",
            background: "white",
            borderRadius: 24,
            padding: 32,
          }}
        >
          <h1>Workspace unavailable</h1>
          <p>
            The application could not connect to its required services. Check
            the database configuration and availability, then try again.
          </p>
          <button
            onClick={reset}
            style={{
              padding: "12px 20px",
              borderRadius: 12,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
