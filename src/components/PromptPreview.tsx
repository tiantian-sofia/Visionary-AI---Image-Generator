import { MessageSquare, RefreshCw } from "lucide-react";

interface PromptPreviewProps {
  finalPrompt: string;
  setFinalPrompt: (value: string) => void;
  isManualPrompt: boolean;
  setIsManualPrompt: (value: boolean) => void;
}

export default function PromptPreview({
  finalPrompt,
  setFinalPrompt,
  isManualPrompt,
  setIsManualPrompt,
}: PromptPreviewProps) {
  return (
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
  );
}
