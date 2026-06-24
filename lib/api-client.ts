/*
  Tiny typed fetch wrapper for our own /api routes. Extracts a clean error
  message (so callers can surface it in a toast) and never leaks raw responses.
*/
export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function extractError(res: Response): Promise<string> {
  try {
    const data = await res.json();
    if (data && typeof data.error === "string") return data.error;
  } catch {
    // fall through
  }
  return `Request failed (${res.status})`;
}

export async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new ApiError(await extractError(res), res.status);
  return res.json() as Promise<T>;
}
