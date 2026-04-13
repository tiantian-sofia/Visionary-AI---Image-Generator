import { motion, AnimatePresence } from "motion/react";
import { Settings2, Trash2, Plus } from "lucide-react";
import type { CustomElement } from "../constants";

interface ElementEditorProps {
  inputRows: CustomElement[];
  setInputRows: (rows: CustomElement[]) => void;
  addRow: () => void;
  updateRow: (id: string, field: 'name' | 'content', value: string) => void;
  removeRow: (id: string) => void;
}

export default function ElementEditor({
  inputRows,
  setInputRows,
  addRow,
  updateRow,
  removeRow,
}: ElementEditorProps) {
  return (
    <section className="space-y-4 p-6 rounded-2xl bg-white/5 border border-white/10">
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-semibold uppercase tracking-widest text-white/40 flex items-center gap-2">
          <Settings2 className="w-3 h-3 text-orange-500" />
          Adding Element
        </label>
        <button
          onClick={() => setInputRows([{ id: Math.random().toString(36).substr(2, 9), name: '', content: '' }])}
          className="text-[10px] uppercase tracking-widest text-white/20 hover:text-white/40 transition-colors"
        >
          Clear All
        </button>
      </div>

      <div className="space-y-3">
        <AnimatePresence initial={false}>
          {inputRows.map((row) => (
            <motion.div
              key={row.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="flex gap-3"
            >
              <input
                type="text"
                value={row.name}
                onChange={(e) => updateRow(row.id, 'name', e.target.value)}
                placeholder="Name (e.g. Framing)"
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
              />
              <input
                type="text"
                value={row.content}
                onChange={(e) => updateRow(row.id, 'content', e.target.value)}
                placeholder="Content (e.g. wide shot)"
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
              />
              <button
                onClick={() => removeRow(row.id)}
                className="px-3 py-3 rounded-xl bg-white/5 border border-white/10 text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <button
        onClick={addRow}
        className="w-full mt-2 py-3 rounded-xl border border-dashed border-white/10 text-white/20 hover:text-white/40 hover:border-white/20 hover:bg-white/5 transition-all flex items-center justify-center gap-2 text-xs font-medium uppercase tracking-widest"
      >
        <Plus className="w-4 h-4" />
        Add More Lines
      </button>
    </section>
  );
}
