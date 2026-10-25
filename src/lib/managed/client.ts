export async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      ...(init?.body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
      ...init?.headers,
    },
    cache: "no-store",
  });
  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error("The server returned an unexpected response. Try again.");
  }
  if (response.status === 401) {
    window.dispatchEvent(new Event("openhouse:unauthorized"));
    throw new Error("Sign in to continue.");
  }
  if (!response.ok)
    throw new Error(
      data.issues?.length
        ? data.issues
            .map(
              (i: { path: string; message: string }) =>
                `${i.path}: ${i.message}`,
            )
            .join("\n")
        : data.error || "Request failed.",
    );
  return data as T;
}
