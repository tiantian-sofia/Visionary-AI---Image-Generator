export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Saving to the local filesystem is only available in local dev.
  // On Vercel, return success so the frontend flow continues to the mockup page.
  res.json({ folder: 'n/a', path: 'n/a', note: 'Local save is only available in dev mode.' });
}
