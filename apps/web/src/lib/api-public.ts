// Unauthenticated fetch helper for customer-facing public API endpoints.
// Does NOT read cookies or forward auth headers — any customer can call these.
export async function fetchPublicApi(path: string, options: RequestInit = {}) {
  // NEXT_PUBLIC_API_URL is available in the browser; API_URL is server-only
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? process.env.API_URL;
  const res = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> | undefined),
    },
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `API error: ${res.status}`);
  }
  return res.json();
}
