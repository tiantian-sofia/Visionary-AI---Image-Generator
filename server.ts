import express from 'express';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_API_HOST || undefined,
});

app.post('/api/generate-image', async (req, res) => {
  try {
    const { prompt, size } = req.body;

    const response = await openai.images.generate({
      model: process.env.OPENAI_IMAGE_MODEL || 'dall-e-3',
      prompt,
      n: 1,
      size: size || '1024x1024',
      response_format: 'b64_json',
    });

    const b64 = response.data[0]?.b64_json;
    if (!b64) {
      return res.status(500).json({ error: 'No image generated.' });
    }

    res.json({ image: `data:image/png;base64,${b64}` });
  } catch (err: any) {
    console.error('OpenAI error:', err);
    const message = err?.error?.message || err.message || 'Generation failed.';
    res.status(500).json({ error: message });
  }
});

const PORT = 3001;
app.listen(PORT, () => console.log(`API server running on port ${PORT}`));
