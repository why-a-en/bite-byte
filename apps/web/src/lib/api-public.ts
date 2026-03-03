// Unauthenticated fetch helper for customer-facing public API endpoints.
// Does NOT read cookies or forward auth headers — any customer can call these.
export async function fetchPublicApi(path: string, options: RequestInit = {}) {
  const res = await fetch(`${process.env.API_URL}${path}`, {
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
