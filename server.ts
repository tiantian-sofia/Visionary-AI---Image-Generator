import express from 'express';
import OpenAI, { toFile } from 'openai';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const IMAGES_DIR = path.resolve(__dirname, 'images');

app.post('/api/save-image', async (req, res) => {
  try {
    const { image, prompt } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'No image provided.' });
    }

    // Extract subject from prompt
    const cleaned = (prompt || 'image')
      .split(',')[0]
      .replace(/^(a |an |the |create |generate |make )/i, '')
      .trim();
    const sanitized = cleaned.replace(/[^a-zA-Z0-9 -]/g, '').trim() || 'image';
    const subject = sanitized.slice(0, 40).replace(/\s+/g, '_');

    const date = new Date().toISOString().slice(0, 10);
    const folderName = `${subject}_${date}`;
    const folderPath = path.join(IMAGES_DIR, folderName);

    fs.mkdirSync(folderPath, { recursive: true });

    // Convert base64 data URI to buffer and write
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    const filePath = path.join(folderPath, 'image.png');
    fs.writeFileSync(filePath, buffer);

    res.json({ folder: folderName, path: filePath });
  } catch (err: any) {
    console.error('Save error:', err);
    res.status(500).json({ error: err.message || 'Failed to save image.' });
  }
});

const PORT = 3001;
app.listen(PORT, () => console.log(`API server running on port ${PORT}`));
