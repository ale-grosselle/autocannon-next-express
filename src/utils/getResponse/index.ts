import type { ParsedUrlQuery } from 'querystring';
import { getConfigFromWorker } from './worker/main';
import { getUsingHTTP } from './https';
import { getUsingFetch } from './fetch';

export interface ResponseUrl<T> {
  data: T | null;
  status: number;
  ok: boolean;
  details: string;
}

export const getResponse = async <T>(
  url: string,
  requestTimeout = 150,
  query: ParsedUrlQuery,
): Promise<ResponseUrl<T> | null> => {
  try {
    if (query.worker === 'true') {
      return await getConfigFromWorker<T>(
        url,
        requestTimeout,
        query.fetch === 'true',
      );
    } else {
      if (query.fetch !== 'false') {
        return await getUsingFetch<T>(url, requestTimeout);
      } else {
        return await getUsingHTTP<T>(url, requestTimeout);
      }
    }
  } catch (error) {
    return null;
  }
};
