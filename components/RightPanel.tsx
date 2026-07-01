'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { Lightbulb, Scale, ChevronDown, ChevronUp } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function RightPanel() {
  const { rightTab, setRightTab } = useStore();
  const [insights, setInsights] = useState<any[]>([]);
  const [comparisons, setComparisons] = useState<any[]>([]);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(0);

  useEffect(() => {
    const load = async () => {
      try {
        // 直接请求根路径
        const [iRes, cRes] = await Promise.all([
          fetch('/data/insights.json'),
          fetch('/data/comparisons.json')
        ]);
        setInsights(await iRes.json());
        setComparisons(await cRes.json());
      } catch (e) { console.error(e); }
    };
    load();
  }, []);

  return (
    <aside className="lg:w-[25%] w-full bg-paper border-l border-earth/20 flex flex-col min-h-screen pt-14 lg:pt-0">
      <div className="flex border-b border-earth/20">
        <button onClick={() => setRightTab('insights')} className={`flex-1 py-3 text-xs font-sans flex items-center justify-center gap-1 ${rightTab === 'insights' ? 'text-field border-b-2 border-field font-medium' : 'text-ink/50'}`}>
          <Lightbulb size={14} /><span className="hidden lg:inline">社会学洞察</span>
        </button>
        <button onClick={() => setRightTab('comparison')} className={`flex-1 py-3 text-xs font-sans flex items-center justify-center gap-1 ${rightTab === 'comparison' ? 'text-field border-b-2 border-field font-medium' : 'text-ink/50'}`}>
          <Scale size={14} /><span className="hidden lg:inline">城乡对照</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 lg:p-6">
        <AnimatePresence mode="wait">
          {rightTab === 'insights' ? (
            <motion.div key="i" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-3">
              <h3 className="text-sm font-serif font-bold text-ink/80 mb-4">思考与探究</h3>
              {insights.map((item, idx) => (
                <div key={idx} className="retro-card overflow-hidden">
                  <button onClick={() => setExpandedIdx(expandedIdx === idx ? null : idx)} className="w-full p-3 flex items-start justify-between text-left hover:bg-field/5">
                    <span className="text-sm font-serif text-ink/80 pr-2">{item.question}</span>
                    {expandedIdx === idx ? <ChevronUp size={16} className="text-field shrink-0" /> : <ChevronDown size={16} className="text-ink/40 shrink-0" />}
                  </button>
                  <AnimatePresence>
                    {expandedIdx === idx && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="px-3 pb-3 pt-0 space-y-2 border-t border-earth/10 mt-0 pt-2">
                          <div className="text-xs font-sans text-ink/70"><span className="font-bold text-field">费孝通原解：</span>{item.answer.original}</div>
                          <div className="text-xs font-sans text-ink/70"><span className="font-bold text-earth">现代思考：</span>{item.answer.modern}</div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </motion.div>
          ) : (
            <motion.div key="c" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h3 className="text-sm font-serif font-bold text-ink/80 mb-4">传统 vs 现代</h3>
              <div className="space-y-2">
                {comparisons.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-3 bg-earth/10 rounded-l border-l-2 border-earth font-sans text-ink/80">{item.rural}</div>
                    <div className="p-3 bg-field/10 rounded-r border-r-2 border-field font-sans text-ink/80 text-right">{item.urban}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </aside>
  );
}