import { NextApiRequest } from 'next';


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST')
    return res.status(405).json({ message: 'Method not allowed' });

  try {
    const userData = await getUserDataPage(req, res);

    if (!userData) {
      return res.status(401).json({ message: 'Unauthorized' });

    
    }catch (error) {
    console.error('Error handling WebSocket message:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }

 


}
