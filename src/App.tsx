/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useMemo, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { motion, AnimatePresence } from "motion/react";
import { 
  Image as ImageIcon, 
  Sparkles, 
  Download, 
  RefreshCw, 
  Layers, 
  Maximize2, 
  AlertCircle,
  Loader2,
  ChevronRight,
  Plus,
  Trash2,
  Settings2,
  MessageSquare,
  Key
} from "lucide-react";

declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

interface CustomElement {
  id: string;
  name: string;
  content: string;
}

// Initialize Gemini AI (will be re-initialized inside handleGenerate to use latest key)
const DEFAULT_MODEL = 'gemini-3.1-flash-image-preview';

const STYLES = [
  { id: 'none', name: 'Default', prompt: '' },
  { id: 'cinematic', name: 'Cinematic', prompt: 'cinematic lighting, highly detailed, 8k, masterpiece' },
  { id: 'digital-art', name: 'Digital Art', prompt: 'digital art, vibrant colors, clean lines, professional illustration' },
  { id: 'neon-punk', name: 'Neon Punk', prompt: 'cyberpunk aesthetic, neon lights, dark atmosphere, futuristic' },
  { id: 'oil-painting', name: 'Oil Painting', prompt: 'oil painting style, thick brushstrokes, classical art, rich textures' },
  { id: 'sketch', name: 'Sketch', prompt: 'pencil sketch, hand-drawn, charcoal, artistic, minimal' },
  { id: '3d-render', name: '3D Render', prompt: '3d render, octane render, unreal engine 5, volumetric lighting, hyper-realistic' },
  { id: 'minimalist', name: 'Minimalist', prompt: 'minimalist design, clean background, simple shapes, elegant' },
];

const ASPECT_RATIOS = [
  { id: '1:1', name: '1:1', label: 'Square' },
  { id: '4:3', name: '4:3', label: 'Landscape' },
  { id: '3:4', name: '3:4', label: 'Portrait' },
  { id: '16:9', name: '16:9', label: 'Widescreen' },
  { id: '9:16', name: '9:16', label: 'Story' },
];

export default function App() {
  const [description, setDescription] = useState('');
  const [inputRows, setInputRows] = useState<CustomElement[]>([
    { id: '1', name: '', content: '' }
  ]);
  const [selectedStyle, setSelectedStyle] = useState(STYLES[0]);
  const [selectedRatio, setSelectedRatio] = useState(ASPECT_RATIOS[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [finalPrompt, setFinalPrompt] = useState('');
  const [isManualPrompt, setIsManualPrompt] = useState(false);
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(hasKey);
      } else {
        // Fallback for environments without the aistudio global
        setHasApiKey(true);
      }
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      setHasApiKey(true); // Assume success as per skill guidelines
    }
  };

  // Auto-sync prompt when inputs change, unless in manual mode
  useMemo(() => {
    if (isManualPrompt) return;
    
    const elementsPrompt = inputRows
      .filter(el => el.name.trim() && el.content.trim())
      .map(el => `${el.name}: ${el.content}`)
      .join(', ');
    
    const derived = [
      description,
      elementsPrompt,
      selectedStyle.prompt
    ].filter(Boolean).join(', ');
    
    setFinalPrompt(derived);
  }, [description, inputRows, selectedStyle, isManualPrompt]);

  const handleGenerate = async () => {
    if (!finalPrompt.trim()) {
      setError('Please enter a description or prompt first.');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedImage(null);

    try {
      // Create a new instance right before the call to ensure latest key is used
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const response = await ai.models.generateContent({
        model: DEFAULT_MODEL,
        contents: {
          parts: [{ text: finalPrompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: selectedRatio.id as any,
            imageSize: '1K'
          },
        },
      });

      let imageUrl = null;
      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            const base64Data = part.inlineData.data;
            imageUrl = `data:image/png;base64,${base64Data}`;
            break;
          }
        }
      }

      if (imageUrl) {
        setGeneratedImage(imageUrl);
        // Smooth scroll to result
        setTimeout(() => {
          resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      } else {
        throw new Error('No image was generated. Please try a different prompt.');
      }
    } catch (err: any) {
      console.error('Generation error:', err);
      let message = err.message || 'An unexpected error occurred during generation.';
      
      // Handle quota error specifically
      if (message.includes('429') || message.includes('RESOURCE_EXHAUSTED')) {
        message = 'The shared API quota has been reached. Please select your own API key to continue generating images.';
        setHasApiKey(false); // Prompt to select key
      }
      
      setError(message);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `visionary-ai-${Date.now()}.png`;
    link.click();
  };

  const addRow = () => {
    const newRow: CustomElement = {
      id: Math.random().toString(36).substr(2, 9),
      name: '',
      content: '',
    };
    setInputRows([...inputRows, newRow]);
  };

  const updateRow = (id: string, field: 'name' | 'content', value: string) => {
    setInputRows(inputRows.map(row => 
      row.id === id ? { ...row, [field]: value } : row
    ));
  };

  const removeRow = (id: string) => {
    if (inputRows.length > 1) {
      setInputRows(inputRows.filter(row => row.id !== id));
    } else {
      setInputRows([{ id: '1', name: '', content: '' }]);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-orange-500/30">
      {/* Background Glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
      </div>

      <main className="relative max-w-5xl mx-auto px-6 py-12 lg:py-20">
        {/* API Key Selection Overlay */}
        <AnimatePresence>
          {hasApiKey === false && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="max-w-md w-full bg-[#111] border border-white/10 rounded-3xl p-8 text-center space-y-6 shadow-2xl"
              >
                <div className="w-16 h-16 bg-orange-500/20 rounded-2xl flex items-center justify-center mx-auto">
                  <Key className="w-8 h-8 text-orange-500" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold">API Key Required</h2>
                  <p className="text-white/50 text-sm">
                    To avoid shared quota limits and generate high-quality images, please select your own Gemini API key.
                  </p>
                </div>
                <div className="space-y-3">
                  <button
                    onClick={handleSelectKey}
                    className="w-full py-4 bg-white text-black rounded-xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    Select API Key
                  </button>
                  <a 
                    href="https://ai.google.dev/gemini-api/docs/billing" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block text-xs text-white/30 hover:text-white/50 transition-colors"
                  >
                    Learn about Gemini API billing
                  </a>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <header className="mb-12 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-4 mb-4"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
              <Sparkles className="w-4 h-4 text-orange-400" />
              <span className="text-xs font-medium uppercase tracking-widest text-white/70">Powered by Gemini AI</span>
            </div>
            
            {hasApiKey && (
              <button
                onClick={handleSelectKey}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-[10px] font-semibold uppercase tracking-widest text-orange-400 hover:bg-orange-500/20 transition-all"
              >
                <Key className="w-3 h-3" />
                Change API Key
              </button>
            )}
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl lg:text-7xl font-bold tracking-tighter mb-4 bg-gradient-to-b from-white to-white/50 bg-clip-text text-transparent"
          >
            Visionary AI
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-white/50 max-w-2xl mx-auto"
          >
            Transform your imagination into high-quality visuals with a single prompt.
          </motion.p>
        </header>

        {/* Controls Section */}
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <div className="space-y-8">
            {/* Prompt Input */}
            <section className="space-y-3">
              <label className="text-xs font-semibold uppercase tracking-widest text-white/40 flex items-center gap-2">
                <ChevronRight className="w-3 h-3 text-orange-500" />
                Description
              </label>
              <div className="relative group">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="A futuristic city floating in the clouds at sunset..."
                  className="w-full h-40 bg-white/5 border border-white/10 rounded-2xl p-6 text-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all resize-none placeholder:text-white/20"
                />
                <div className="absolute bottom-4 right-4 text-xs text-white/20">
                  {description.length} characters
                </div>
              </div>
            </section>

            {/* Style Selection */}
            <section className="space-y-4">
              <label className="text-xs font-semibold uppercase tracking-widest text-white/40 flex items-center gap-2">
                <Layers className="w-3 h-3 text-orange-500" />
                Artistic Style
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {STYLES.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setSelectedStyle(style)}
                    className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                      selectedStyle.id === style.id
                        ? 'bg-orange-500 border-orange-400 text-white shadow-lg shadow-orange-500/20'
                        : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:border-white/20'
                    }`}
                  >
                    {style.name}
                  </button>
                ))}
              </div>
            </section>

            {/* Adding Element Section */}
            <section className="space-y-4 p-6 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold uppercase tracking-widest text-white/40 flex items-center gap-2">
                  <Settings2 className="w-3 h-3 text-orange-500" />
                  Adding Element
                </label>
                <button
                  onClick={() => setInputRows([{ id: Math.random().toString(36).substr(2, 9), name: '', content: '' }])}
                  className="text-[10px] uppercase tracking-widest text-white/20 hover:text-white/40 transition-colors"
                >
                  Clear All
                </button>
              </div>
              
              <div className="space-y-3">
                <AnimatePresence initial={false}>
                  {inputRows.map((row) => (
                    <motion.div
                      key={row.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="flex gap-3"
                    >
                      <input
                        type="text"
                        value={row.name}
                        onChange={(e) => updateRow(row.id, 'name', e.target.value)}
                        placeholder="Name (e.g. Framing)"
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
                      />
                      <input
                        type="text"
                        value={row.content}
                        onChange={(e) => updateRow(row.id, 'content', e.target.value)}
                        placeholder="Content (e.g. wide shot)"
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
                      />
                      <button
                        onClick={() => removeRow(row.id)}
                        className="px-3 py-3 rounded-xl bg-white/5 border border-white/10 text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <button
                onClick={addRow}
                className="w-full mt-2 py-3 rounded-xl border border-dashed border-white/10 text-white/20 hover:text-white/40 hover:border-white/20 hover:bg-white/5 transition-all flex items-center justify-center gap-2 text-xs font-medium uppercase tracking-widest"
              >
                <Plus className="w-4 h-4" />
                Add More Lines
              </button>
            </section>
          </div>

          <aside className="space-y-8">
            {/* Aspect Ratio */}
            <section className="space-y-4">
              <label className="text-xs font-semibold uppercase tracking-widest text-white/40 flex items-center gap-2">
                <Maximize2 className="w-3 h-3 text-orange-500" />
                Aspect Ratio
              </label>
              <div className="space-y-2">
                {ASPECT_RATIOS.map((ratio) => (
                  <button
                    key={ratio.id}
                    onClick={() => setSelectedRatio(ratio)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                      selectedRatio.id === ratio.id
                        ? 'bg-white/10 border-white/30 text-white'
                        : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:text-white/60'
                    }`}
                  >
                    <span>{ratio.label}</span>
                    <span className="opacity-50">{ratio.name}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* Your Prompt Preview */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-widest text-white/40 flex items-center gap-2">
                  <MessageSquare className="w-3 h-3 text-orange-500" />
                  Your Prompt
                </label>
                {isManualPrompt && (
                  <button
                    onClick={() => setIsManualPrompt(false)}
                    className="text-[10px] uppercase tracking-widest text-orange-500 hover:text-orange-400 transition-colors flex items-center gap-1"
                  >
                    <RefreshCw className="w-2 h-2" />
                    Reset to Auto
                  </button>
                )}
              </div>
              <div className="relative group">
                <textarea
                  value={finalPrompt}
                  onChange={(e) => {
                    setFinalPrompt(e.target.value);
                    setIsManualPrompt(true);
                  }}
                  placeholder="Final prompt will appear here..."
                  className={`w-full min-h-[100px] p-4 rounded-xl bg-white/5 border text-xs font-mono leading-relaxed transition-all resize-none focus:outline-none focus:ring-2 focus:ring-orange-500/50 ${
                    isManualPrompt 
                      ? 'border-orange-500/50 text-white' 
                      : 'border-white/10 text-white/60'
                  }`}
                />
                {!isManualPrompt && (
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[8px] uppercase tracking-tighter text-white/20 pointer-events-none">
                    Auto-Syncing
                  </div>
                )}
              </div>
            </section>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className={`w-full h-16 rounded-2xl flex items-center justify-center gap-3 text-lg font-bold transition-all ${
                isGenerating
                  ? 'bg-white/10 text-white/40 cursor-not-allowed'
                  : 'bg-white text-black hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-white/10'
              }`}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-6 h-6" />
                  Generate Image
                </>
              )}
            </button>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3 text-red-400 text-sm"
                >
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p>{error}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </aside>
        </div>

        {/* Result Section */}
        <section ref={resultRef} className="mt-16">
          <AnimatePresence mode="wait">
            {isGenerating ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="aspect-square max-w-2xl mx-auto rounded-3xl bg-white/5 border border-white/10 flex flex-col items-center justify-center gap-6"
                style={{ aspectRatio: selectedRatio.id.replace(':', '/') }}
              >
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
                  <ImageIcon className="w-6 h-6 text-orange-500 absolute inset-0 m-auto animate-pulse" />
                </div>
                <div className="text-center">
                  <p className="text-lg font-medium text-white/80">Crafting your vision...</p>
                  <p className="text-sm text-white/40">This usually takes 5-10 seconds</p>
                </div>
              </motion.div>
            ) : generatedImage ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="relative group max-w-2xl mx-auto">
                  <img
                    src={generatedImage}
                    alt="Generated vision"
                    className="w-full rounded-3xl shadow-2xl shadow-black/50 border border-white/10"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-8">
                    <button
                      onClick={downloadImage}
                      className="p-4 rounded-full bg-white text-black hover:scale-110 transition-transform shadow-xl"
                      title="Download Image"
                    >
                      <Download className="w-6 h-6" />
                    </button>
                    <button
                      onClick={handleGenerate}
                      className="p-4 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-all border border-white/20"
                      title="Regenerate"
                    >
                      <RefreshCw className="w-6 h-6" />
                    </button>
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <button
                    onClick={downloadImage}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-sm font-medium"
                  >
                    <Download className="w-4 h-4" />
                    Download PNG
                  </button>
                  <button
                    onClick={() => {
                      setGeneratedImage(null);
                      setDescription('');
                    }}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-sm font-medium text-white/60"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Start Over
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="aspect-square max-w-2xl mx-auto rounded-3xl border-2 border-dashed border-white/5 flex flex-col items-center justify-center gap-4 text-white/20"
                style={{ aspectRatio: selectedRatio.id.replace(':', '/') }}
              >
                <ImageIcon className="w-12 h-12" />
                <p className="text-sm uppercase tracking-widest font-medium">Your creation will appear here</p>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto px-6 py-12 border-t border-white/5 text-center">
        <p className="text-xs text-white/20 uppercase tracking-[0.2em]">
          Visionary AI &copy; 2024 &bull; Built with Gemini 2.5 Flash Image
        </p>
      </footer>
    </div>
  );
}
