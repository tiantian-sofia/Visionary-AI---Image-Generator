import OpenAI from 'openai';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, size } = req.body;

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: process.env.OPENAI_API_HOST || undefined,
    });

    const response = await openai.images.generate({
      model: process.env.OPENAI_IMAGE_MODEL || 'dall-e-3',
      prompt,
      n: 1,
      size: size || '1024x1024',
    });

    const data = response.data[0];
    if (data?.b64_json) {
      res.json({ image: `data:image/png;base64,${data.b64_json}` });
    } else if (data?.url) {
      res.json({ image: data.url });
    } else {
      return res.status(500).json({ error: 'No image generated.' });
    }
  } catch (err: any) {
    console.error('OpenAI error:', err);
    const message = err?.error?.message || err.message || 'Generation failed.';
    res.status(500).json({ error: message });
  }
}
