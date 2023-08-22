import type { ResponseUrl } from './';
export async function getUsingFetch<T>(
  url: string,
  timeout: number,
): Promise<ResponseUrl<T>> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeout);

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId); // Clear the timeout if the request succeeds
    const data = response.ok ? await response.json() : null;
    return { ok: response.ok, status: response.status, data, details: 'FETCH' };
  } catch (error) {
    return { ok: false, status: 500, data: null, details: 'FETCH' };
  }
}
