import { NextApiRequest, NextApiResponse } from 'next';
import autocannon from 'autocannon';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const options = req.query;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const output = await autocannon(options as autocannon.Options);
    res.status(200).json(output);
  } catch (e) {
    console.log(e, 'error');
    res.status(500).json({});
  }
}
