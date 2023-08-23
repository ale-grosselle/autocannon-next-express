// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { getResponse, type ResponseUrl } from '@/utils/getResponse';

type Data = {
  response: ResponseUrl<unknown> | null;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  let { url } = req.query;
  if (url) {
    if (Array.isArray(url)) {
      url = url[0];
    }
    const response = await getResponse(
      url,
      req.query.timeout ? Number(req.query.timeout) : 150,
      req.query,
    );
    const statusCode = response?.status ?? 404;
    res.status(statusCode).json({ response });
    return;
  }
  res.status(500).json({ response: null });
}
