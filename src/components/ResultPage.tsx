import { useState } from "react";
import { motion } from "motion/react";
import { Download, RefreshCw, MessageSquare, Pencil, Layout } from "lucide-react";

interface ResultPageProps {
  generatedImage: string;
  finalPrompt: string;
  setFinalPrompt: (value: string) => void;
  downloadImage: () => void;
  handleGenerate: () => void;
  handleModifyImage: () => void;
  handleStartOver: () => void;
  handleGoToMockup: () => void;
}

export default function ResultPage({
  generatedImage,
  finalPrompt,
  setFinalPrompt,
  downloadImage,
  handleGenerate,
  handleModifyImage,
  handleStartOver,
  handleGoToMockup,
}: ResultPageProps) {
  const [isSaving, setIsSaving] = useState(false);

  const handleMockupClick = async () => {
    setIsSaving(true);
    try {
      const dirHandle = await (window as any).showDirectoryPicker({ mode: 'readwrite' });

      const cleaned = (finalPrompt || 'image')
        .split(',')[0]
        .replace(/^(a |an |the |create |generate |make )/i, '')
        .trim();
      const sanitized = (cleaned.replace(/[^a-zA-Z0-9 -]/g, '').trim() || 'image').slice(0, 40).replace(/\s+/g, '_');
      const date = new Date().toISOString().slice(0, 10);
      const folderName = `${sanitized}_${date}`;

      const subDir = await dirHandle.getDirectoryHandle(folderName, { create: true });
      const fileHandle = await subDir.getFileHandle('image.png', { create: true });
      const writable = await fileHandle.createWritable();

      const response = await fetch(generatedImage);
      const blob = await response.blob();
      await writable.write(blob);
      await writable.close();
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setIsSaving(false);
        return;
      }
      console.error('Failed to save image:', err);
    }
    setIsSaving(false);
    handleGoToMockup();
  };

  return (
    <motion.div
      key="result"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative min-h-screen flex flex-col items-center justify-center px-6 py-12"
    >
      <div className="max-w-3xl w-full space-y-8">
        <div className="relative group">
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

        <div className="max-w-lg mx-auto">
          <label className="text-xs font-semibold uppercase tracking-widest text-white/40 flex items-center gap-2 mb-2">
            <MessageSquare className="w-3 h-3 text-orange-500" />
            Prompt
          </label>
          <textarea
            value={finalPrompt}
            onChange={(e) => setFinalPrompt(e.target.value)}
            className="w-full min-h-[80px] p-4 rounded-xl bg-white/5 border border-white/10 text-xs font-mono leading-relaxed text-white/60 resize-none focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:text-white transition-all"
          />
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
            onClick={handleModifyImage}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-orange-500 border border-orange-400 hover:bg-orange-600 transition-all text-sm font-bold text-white shadow-lg shadow-orange-500/20"
          >
            <Pencil className="w-4 h-4" />
            Modify Image
          </button>
          <button
            onClick={handleStartOver}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-sm font-medium text-white/60"
          >
            <RefreshCw className="w-4 h-4" />
            Create New
          </button>
        </div>

        <button
          onClick={handleMockupClick}
          disabled={isSaving}
          className={`w-full h-16 rounded-2xl flex items-center justify-center gap-3 text-lg font-bold transition-all ${
            isSaving
              ? 'bg-white/10 text-white/40 cursor-not-allowed'
              : 'bg-white text-black hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-white/10'
          }`}
        >
          <Layout className="w-6 h-6" />
          {isSaving ? 'Saving...' : 'Go to Mockup'}
        </button>
      </div>
    </motion.div>
  );
}
