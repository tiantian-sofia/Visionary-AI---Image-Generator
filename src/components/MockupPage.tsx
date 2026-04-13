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
  { id: 'phone', label: 'Phone Mockup', icon: Smartphone },
  { id: 'laptop', label: 'Laptop Mockup', icon: Monitor },
  { id: 'profile', label: 'For Profile', icon: User },
] as const;

type MockupType = typeof MOCKUP_OPTIONS[number]['id'];

interface MockupPageProps {
  generatedImage: string;
  onBack: () => void;
}

export default function MockupPage({ generatedImage, onBack }: MockupPageProps) {
  const [selected, setSelected] = useState<Set<MockupType>>(new Set());
  const [isGenerating, setIsGenerating] = useState(false);
  const [mockupImage, setMockupImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const toggleOption = (id: MockupType) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleGenerate = async () => {
    if (selected.size === 0) {
      setError('Please select at least one mockup type.');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setMockupImage(null);

    const mockupTypes = Array.from(selected);
    const promptParts = mockupTypes.map(type => {
      if (type === 'phone') return 'displayed on a modern smartphone screen, phone mockup';
      if (type === 'laptop') return 'displayed on a laptop screen, laptop mockup';
      if (type === 'profile') return 'as a social media profile picture, circular crop';
      return '';
    });

    const prompt = `Create a professional product mockup: the provided image ${promptParts.join(' and ')}, clean background, photorealistic, professional presentation`;

    try {
      const response = await fetch('/api/edit-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          image: generatedImage,
          size: '1024x1024',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Mockup generation failed.');
      }

      if (data.image) {
        setMockupImage(data.image);
      } else {
        throw new Error('No mockup was generated. Please try again.');
      }
    } catch (err: any) {
      console.error('Mockup error:', err);
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadMockup = () => {
    if (!mockupImage) return;
    const link = document.createElement('a');
    link.href = mockupImage;
    link.download = `visionary-mockup-${Date.now()}.png`;
    link.click();
  };

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
                className={`flex items-center gap-3 px-6 py-4 rounded-2xl border-2 text-sm font-medium transition-all ${
                  isSelected
                    ? 'bg-orange-500/10 border-orange-500 text-white'
                    : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:border-white/20'
                }`}
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
              Generating Mockup...
            </>
          ) : (
            <>
              <Sparkles className="w-6 h-6" />
              Generate Mockup
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

        {/* Mockup result */}
        {mockupImage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <img
              src={mockupImage}
              alt="Generated mockup"
              className="w-full rounded-3xl shadow-2xl shadow-black/50 border border-white/10"
              referrerPolicy="no-referrer"
            />
            <div className="flex justify-center">
              <button
                onClick={downloadMockup}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-sm font-medium"
              >
                <Download className="w-4 h-4" />
                Download Mockup
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
