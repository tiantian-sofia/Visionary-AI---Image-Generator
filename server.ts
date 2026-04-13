import express from 'express';
import OpenAI, { toFile } from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json({ limit: '20mb' }));

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
});

app.post('/api/edit-image', async (req, res) => {
  try {
    const { prompt, image, size } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'No image provided for editing.' });
    }

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
});

const PORT = 3001;
app.listen(PORT, () => console.log(`API server running on port ${PORT}`));
