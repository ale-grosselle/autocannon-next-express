import http from 'https';
import type { ResponseUrl } from './';

export const getUsingHTTP = function <T>(
  url: string,
  timeout: number,
): Promise<ResponseUrl<T>> {
  return new Promise((resolve) => {
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
          const responseData: ResponseUrl<T> = {
            ok: true,
            status: response.statusCode,
            data: JSON.parse(data),
            details: 'HTTP',
          };
          resolve(responseData);
        } else {
          resolve({
            data: null,
            ok: false,
            status: response.statusCode ?? 500,
            details: 'HTTP',
          });
        }
      });
    });

    req.on('error', () => {
      resolve({ data: null, ok: false, status: 503, details: 'HTTP' });
    });

    req.on('timeout', () => {
      resolve({ data: null, ok: false, status: 504, details: 'HTTP' });
      req.destroy();
    });
  });
};
