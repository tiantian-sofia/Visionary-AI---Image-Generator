import { motion } from "motion/react";
import { Image as ImageIcon } from "lucide-react";

interface GeneratingPageProps {
  finalPrompt: string;
}

export default function GeneratingPage({ finalPrompt }: GeneratingPageProps) {
  return (
    <motion.div
      key="generating"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative min-h-screen flex flex-col items-center justify-center px-6"
    >
      <div className="relative mb-8">
        <div className="w-20 h-20 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
        <ImageIcon className="w-8 h-8 text-orange-500 absolute inset-0 m-auto animate-pulse" />
      </div>
      <p className="text-2xl font-medium text-white/80 mb-2">Crafting your vision...</p>
      <p className="text-sm text-white/40">This usually takes 10-20 seconds</p>
      <p className="mt-6 text-xs text-white/20 max-w-md text-center font-mono">{finalPrompt}</p>
    </motion.div>
  );
}
