import { Maximize2 } from "lucide-react";
import { ASPECT_RATIOS, type AspectRatio } from "../constants";

interface AspectRatioSelectorProps {
  selectedRatio: AspectRatio;
  setSelectedRatio: (ratio: AspectRatio) => void;
}

export default function AspectRatioSelector({ selectedRatio, setSelectedRatio }: AspectRatioSelectorProps) {
  return (
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
  );
}
