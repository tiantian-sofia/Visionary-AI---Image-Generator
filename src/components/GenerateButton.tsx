import { AnimatePresence, motion } from "motion/react";
import { Sparkles, Loader2, AlertCircle } from "lucide-react";

interface GenerateButtonProps {
  isGenerating: boolean;
  handleGenerate: () => void;
  error: string | null;
}

export default function GenerateButton({ isGenerating, handleGenerate, error }: GenerateButtonProps) {
  return (
    <>
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
    </>
  );
}
