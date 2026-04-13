export interface CustomElement {
  id: string;
  name: string;
  content: string;
}

export const DEFAULT_MODEL = 'dall-e-3';

export const STYLES = [
  { id: 'none', name: 'Default', prompt: '' },
  { id: 'cinematic', name: 'Cinematic', prompt: 'cinematic lighting, highly detailed, 8k, masterpiece' },
  { id: 'digital-art', name: 'Digital Art', prompt: 'digital art, vibrant colors, clean lines, professional illustration' },
  { id: 'neon-punk', name: 'Neon Punk', prompt: 'cyberpunk aesthetic, neon lights, dark atmosphere, futuristic' },
  { id: 'oil-painting', name: 'Oil Painting', prompt: 'oil painting style, thick brushstrokes, classical art, rich textures' },
  { id: 'sketch', name: 'Sketch', prompt: 'pencil sketch, hand-drawn, charcoal, artistic, minimal' },
  { id: '3d-render', name: '3D Render', prompt: '3d render, octane render, unreal engine 5, volumetric lighting, hyper-realistic' },
  { id: 'minimalist', name: 'Minimalist', prompt: 'minimalist design, clean background, simple shapes, elegant' },
];

export const ASPECT_RATIOS = [
  { id: '1024x1024', name: '1:1', label: 'Square' },
  { id: '1792x1024', name: '16:9', label: 'Landscape' },
  { id: '1024x1792', name: '9:16', label: 'Portrait' },
];

export type Style = typeof STYLES[number];
export type AspectRatio = typeof ASPECT_RATIOS[number];
