import { Worker } from 'worker_threads';

import type { ResponseUrl } from '..';

const worker = new Worker(
  /* webpackChunkName: "fetch-worker" */ new URL(
    'worker.js',
    new URL(import.meta.url),
  ),
);

let counter: number = 0;
const map = new Map<
  string,
  { promise: Promise<unknown>; resolve?: <T>(p: ResponseUrl<T>) => void }
>();

worker.on('message', <T>(response: ResponseUrl<T> & { id: string }) => {
  const promise = map.get(response.id);
  if (promise) {
    promise.resolve?.(response);
    map.delete(response.id);
  } else {
    console.log('ERROR ERROR ERROR');
  }
});

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
  worker.postMessage({ url, timeout, useFetch, requestId });

  return promise;
};
