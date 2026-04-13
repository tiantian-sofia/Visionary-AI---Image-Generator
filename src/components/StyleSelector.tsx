import { Layers } from "lucide-react";
import { STYLES, type Style } from "../constants";

interface StyleSelectorProps {
  selectedStyle: Style;
  setSelectedStyle: (style: Style) => void;
}

export default function StyleSelector({ selectedStyle, setSelectedStyle }: StyleSelectorProps) {
  return (
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
  );
}
