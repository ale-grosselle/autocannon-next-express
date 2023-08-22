// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-nocheck

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { parentPort } = require('worker_threads');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const http = require('https');

const getUsingHTTP = function (url, timeout, requestId) {
  const req = http.get(url, { timeout }, (response) => {
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
        parentPort.postMessage(responseData);
      } else {
        parentPort.postMessage({
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
    parentPort.postMessage({
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
    parentPort.postMessage({
      data: null,
      ok: false,
      status: 500,
      details: 'WORKER_HTTP',
      id: requestId,
    });
    req.destroy();
  });
};

async function getUsingFetch(url, timeout, requestId) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    // eslint-disable-next-line no-restricted-globals
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    const data = await response.json();
    parentPort.postMessage({
      data,
      ok: response.ok,
      status: response.status,
      details: 'WORKER_FETCH',
      id: requestId,
    });
  } catch (error) {
    parentPort.postMessage({
      data: null,
      ok: false,
      status: 500,
      details: 'WORKER_FETCH',
      id: requestId,
    });
  }
}

parentPort.on('message', async ({ url, timeout, useFetch, requestId }) => {
  if (useFetch) {
    getUsingFetch(url, timeout, requestId);
  } else {
    getUsingHTTP(url, timeout, requestId);
  }
});
