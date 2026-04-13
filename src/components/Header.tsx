import { motion } from "motion/react";
import { Sparkles } from "lucide-react";

export default function Header() {
  return (
    <header className="mb-12 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-4 mb-4"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
          <Sparkles className="w-4 h-4 text-orange-400" />
          <span className="text-xs font-medium uppercase tracking-widest text-white/70">Powered by OpenAI DALL-E</span>
        </div>
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
  );
}
