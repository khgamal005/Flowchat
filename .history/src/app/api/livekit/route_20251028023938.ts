// src/pages/api/livekit.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { AccessToken } from 'livekit-server-sdk';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { room, username } = req.query;

  if (!process.env.LIVEKIT_API_KEY || !process.env.LIVEKIT_API_SECRET || !process.env.NEXT_PUBLIC_LIVEKIT_URL) {
    return res.status(500).json({ error: 'Server misconfigured' });
  }

  if (!room || !username) {
    return res.status(400).json({ error: 'Missing room or username' });
  }
  console.log(process.env.LIVEKIT_API_KEY, process.env.LIVEKIT_API_SECRET, process.env.NEXT_PUBLIC_LIVEKIT_URL);


  try {
    const at = new AccessToken(
      process.env.LIVEKIT_API_KEY,
      process.env.LIVEKIT_API_SECRET,
      { identity: username as string }
    );
    at.addGrant({ roomJoin: true, room: room as string, canPublish: true, canSubscribe: true });
    const token = await at.toJwt();

    res.status(200).json({ token });
  } catch (err) {
    console.error('LiveKit token generation error:', err);
    res.status(500).json({ error: 'Failed to create token' });
  }
}
