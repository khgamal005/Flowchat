import { NextApiRequest } from 'next';


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST')
    return res.status(405).json({ message: 'Method not allowed' });

  try {

    
    }catch (error) {
    console.error('Error handling WebSocket message:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }

 


}
