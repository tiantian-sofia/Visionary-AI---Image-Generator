import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Smartphone,
  Monitor,
  User,
  Sparkles,
  Loader2,
  ArrowLeft,
  Download,
  AlertCircle,
} from "lucide-react";

const MOCKUP_OPTIONS = [
  {
    id: 'phone',
    label: 'Phone Mockup',
    icon: Smartphone,
    prompt: 'Place the provided image on a modern smartphone screen. Show the phone in a 3/4 angle view on a clean minimal background, photorealistic product mockup, professional presentation.',
  },
  {
    id: 'laptop',
    label: 'Laptop Mockup',
    icon: Monitor,
    prompt: 'Place the provided image on a modern laptop screen. Show the laptop in a 3/4 angle view on a clean minimal desk, photorealistic product mockup, professional presentation.',
  },
  {
    id: 'profile',
    label: 'For Profile',
    icon: User,
    prompt: 'Transform the provided image into a professional social media profile picture. Circular crop framing, clean background, polished and professional look.',
  },
] as const;

type MockupType = typeof MOCKUP_OPTIONS[number]['id'];

interface MockupResult {
  image: string | null;
  loading: boolean;
  error: string | null;
}

interface MockupPageProps {
  generatedImage: string;
  onBack: () => void;
}

export default function MockupPage({ generatedImage, onBack }: MockupPageProps) {
  const [selected, setSelected] = useState<Set<MockupType>>(new Set());
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<Map<MockupType, MockupResult>>(new Map());
  const [error, setError] = useState<string | null>(null);

  const toggleOption = (id: MockupType) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const generateOne = async (type: MockupType): Promise<MockupResult> => {
    const option = MOCKUP_OPTIONS.find(o => o.id === type)!;

    try {
      const response = await fetch('/api/edit-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: option.prompt,
          image: generatedImage,
          size: '1024x1024',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Mockup generation failed.');
      }

      if (data.image) {
        return { image: data.image, loading: false, error: null };
      } else {
        throw new Error('No mockup was generated.');
      }
    } catch (err: any) {
      return { image: null, loading: false, error: err.message || 'Generation failed.' };
    }
  };

  const handleGenerate = async () => {
    if (selected.size === 0) {
      setError('Please select at least one mockup type.');
      return;
    }

    setIsGenerating(true);
    setError(null);

    const types: MockupType[] = Array.from(selected);

    // Set all selected to loading
    const initial = new Map<MockupType, MockupResult>();
    for (const type of types) {
      initial.set(type, { image: null, loading: true, error: null });
    }
    setResults(initial);

    // Generate all in parallel
    const promises = types.map(async (type) => {
      const result = await generateOne(type);
      setResults(prev => {
        const next = new Map(prev);
        next.set(type, result);
        return next;
      });
    });

    await Promise.all(promises);
    setIsGenerating(false);
  };

  const downloadMockup = (image: string, type: string) => {
    const link = document.createElement('a');
    link.href = image;
    link.download = `visionary-mockup-${type}-${Date.now()}.png`;
    link.click();
  };

  const orderedResults = MOCKUP_OPTIONS.filter(o => results.has(o.id));

  return (
    <motion.div
      key="mockup"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative min-h-screen flex flex-col items-center px-6 py-12"
    >
      <div className="max-w-3xl w-full space-y-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Result
        </button>

        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight mb-2">Generate Mockup</h2>
          <p className="text-sm text-white/40">Select mockup types and generate a professional presentation</p>
        </div>

        {/* Checkboxes */}
        <div className="flex flex-wrap justify-center gap-4">
          {MOCKUP_OPTIONS.map((option) => {
            const isSelected = selected.has(option.id);
            const Icon = option.icon;
            return (
              <button
                key={option.id}
                onClick={() => toggleOption(option.id)}
                disabled={isGenerating}
                className={`flex items-center gap-3 px-6 py-4 rounded-2xl border-2 text-sm font-medium transition-all ${
                  isSelected
                    ? 'bg-orange-500/10 border-orange-500 text-white'
                    : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:border-white/20'
                } ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                  isSelected ? 'bg-orange-500 border-orange-500' : 'border-white/30'
                }`}>
                  {isSelected && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <Icon className="w-5 h-5" />
                {option.label}
              </button>
            );
          })}
        </div>

        {/* Source image preview */}
        <div className="flex justify-center">
          <img
            src={generatedImage}
            alt="Source image"
            className="max-h-64 rounded-2xl border border-white/10 shadow-lg"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Generate button */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating || selected.size === 0}
          className={`w-full h-16 rounded-2xl flex items-center justify-center gap-3 text-lg font-bold transition-all ${
            isGenerating || selected.size === 0
              ? 'bg-white/10 text-white/40 cursor-not-allowed'
              : 'bg-white text-black hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-white/10'
          }`}
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              Generating {selected.size} Mockup{selected.size > 1 ? 's' : ''}...
            </>
          ) : (
            <>
              <Sparkles className="w-6 h-6" />
              Generate {selected.size > 0 ? `${selected.size} ` : ''}Mockup{selected.size > 1 ? 's' : ''}
            </>
          )}
        </button>

        {/* Error */}
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

        {/* Mockup results */}
        {orderedResults.length > 0 && (
          <div className="space-y-10">
            {orderedResults.map((option) => {
              const result = results.get(option.id)!;
              const Icon = option.icon;
              return (
                <motion.div
                  key={option.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-white/50">
                    <Icon className="w-4 h-4 text-orange-500" />
                    {option.label}
                  </div>

                  {result.loading && (
                    <div className="flex items-center justify-center h-64 rounded-2xl bg-white/5 border border-white/10">
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                        <p className="text-sm text-white/40">Generating...</p>
                      </div>
                    </div>
                  )}

                  {result.error && (
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3 text-red-400 text-sm">
                      <AlertCircle className="w-5 h-5 shrink-0" />
                      <p>{result.error}</p>
                    </div>
                  )}

                  {result.image && (
                    <div className="space-y-4">
                      <img
                        src={result.image}
                        alt={`${option.label} mockup`}
                        className="w-full rounded-3xl shadow-2xl shadow-black/50 border border-white/10"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex justify-center">
                        <button
                          onClick={() => downloadMockup(result.image!, option.id)}
                          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-sm font-medium"
                        >
                          <Download className="w-4 h-4" />
                          Download {option.label}
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}
