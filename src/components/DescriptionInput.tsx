import { ChevronRight } from "lucide-react";

interface DescriptionInputProps {
  description: string;
  setDescription: (value: string) => void;
}

export default function DescriptionInput({ description, setDescription }: DescriptionInputProps) {
  return (
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
  );
}
