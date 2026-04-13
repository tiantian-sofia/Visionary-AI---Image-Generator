import OpenAI, { toFile } from 'openai';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '20mb',
    },
  },
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, image, size } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'No image provided for editing.' });
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: process.env.OPENAI_API_HOST || undefined,
    });

    // Convert base64 data URI to a File object for the OpenAI SDK
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');
    const imageFile = await toFile(imageBuffer, 'image.png', { type: 'image/png' });

    const response = await openai.images.edit({
      model: process.env.OPENAI_IMAGE_EDIT_MODEL || process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1',
      prompt,
      image: imageFile,
      size: size || '1024x1024',
    });

    const data = response.data[0];
    if (data?.b64_json) {
      res.json({ image: `data:image/png;base64,${data.b64_json}` });
    } else if (data?.url) {
      res.json({ image: data.url });
    } else {
      return res.status(500).json({ error: 'No edited image generated.' });
    }
  } catch (err: any) {
    console.error('OpenAI edit error:', err);
    const message = err?.error?.message || err.message || 'Image editing failed.';
    res.status(500).json({ error: message });
  }
}
