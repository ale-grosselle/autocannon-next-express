import { Worker, isMainThread, parentPort } from 'worker_threads';
import { ResponseUrl } from '@/utils/getResponse';
import https from 'https';

let counter: number = 0;
const map = new Map<
  string,
  { promise: Promise<unknown>; resolve?: <T>(p: ResponseUrl<T>) => void }
>();

let worker: Worker | null = null;

if (isMainThread) {
  worker = new Worker(
    /* webpackChunkName: "fetch-worker" */ new URL(
      __filename,
      new URL(import.meta.url),
    ),
  );
  worker.on('message', <T>(response: ResponseUrl<T> & { id: string }) => {
    const promise = map.get(response.id);
    if (promise) {
      promise.resolve?.(response);
      map.delete(response.id);
    } else {
      console.log('ERROR ERROR ERROR');
    }
  });
} else {
  const getUsingHTTP = function (
    url: string,
    timeout: number,
    requestId: string,
  ) {
    const req = https.get(url, { timeout }, (response) => {
      let data = '';
      response.on('data', (chunk) => {
        data += chunk;
      });

      response.on('end', () => {
        if (
          response.statusCode &&
          response.statusCode >= 200 &&
          response.statusCode < 300
        ) {
          const responseData = {
            ok: true,
            status: response.statusCode,
            data: JSON.parse(data),
            details: 'WORKER_HTTP',
            id: requestId,
          };
          parentPort?.postMessage(responseData);
        } else {
          parentPort?.postMessage({
            data: null,
            ok: false,
            status: response.statusCode ?? 500,
            details: 'WORKER_HTTP',
            id: requestId,
          });
        }
      });
    });

    req.on('error', () => {
      console.log('\x1b[31m%s\x1b[0m', '///// req.on("error")');
      parentPort?.postMessage({
        data: null,
        ok: false,
        status: 500,
        details: 'WORKER_HTTP',
        id: requestId,
      });
    });

    req.on('timeout', () => {
      console.log("///// req.on('timeout");
      console.log('\x1b[31m%s\x1b[0m', '///// req.on("timeout")');
      parentPort?.postMessage({
        data: null,
        ok: false,
        status: 500,
        details: 'WORKER_HTTP',
        id: requestId,
      });
      req.destroy();
    });
  };

  const getUsingFetch = async function (
    url: string,
    timeout: number,
    requestId: string,
  ) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      const data = await response.json();
      parentPort?.postMessage({
        data,
        ok: response.ok,
        status: response.status,
        details: 'WORKER_FETCH',
        id: requestId,
      });
    } catch (error) {
      parentPort?.postMessage({
        data: null,
        ok: false,
        status: 500,
        details: 'WORKER_FETCH',
        id: requestId,
      });
    }
  };

  parentPort?.on('message', async ({ url, timeout, useFetch, requestId }) => {
    if (useFetch) {
      getUsingFetch(url, timeout, requestId);
    } else {
      getUsingHTTP(url, timeout, requestId);
    }
  });
}

export const getConfigFromWorker = function <T>(
  url: string,
  timeout: number,
  useFetch: boolean,
): Promise<ResponseUrl<T>> {
  counter = counter + 1;

  const requestId = `request_${counter}`;
  let resolve;
  const promise = new Promise<ResponseUrl<T>>((response) => {
    resolve = response;
  });
  map.set(requestId, {
    promise,
    resolve,
  });
  worker?.postMessage({ url, timeout, useFetch, requestId });

  return promise;
};
