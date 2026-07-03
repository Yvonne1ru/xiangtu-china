'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { Quote, PenTool, Target } from 'lucide-react';

interface RhetoricQuote {
  id: string;
  original_text: string;
  rhetoric_type: string;
  appreciation: string;
  exam_focus: string;
}

export default function RhetoricGallery() {
  // 【修复】：引入 chapterList
  const { activeChapterId, chapterList } = useStore();
  const [quotes, setQuotes] = useState<RhetoricQuote[]>([]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 【核心修复】：直接从目录列表中提取当前章节标题
  const currentTitle = chapterList.find(ch => ch.id === activeChapterId)?.title || '未知章节';

  useEffect(() => {
    setIsLoading(true);
    fetch('/data/chapters/analysis.json')
      .then(res => res.json())
      .then(data => {
        const chapterData = data[activeChapterId];
        setQuotes(chapterData?.rhetoric_quotes || []);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [activeChapterId]);

  if (isLoading) return <div className="flex items-center justify-center h-full text-[#A0522D] font-serif">正在翻阅修辞词典...</div>;

  if (quotes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-[#A0522D]/70 font-serif gap-3">
        <div className="text-5xl">🖋️</div>
        <p className="text-lg">《{currentTitle}》暂无修辞赏析数据</p>
        <p className="text-xs text-[#333333]/50">敬请期待后续更新</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-[#F5F0E6] rounded-lg p-6 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center gap-3 border-b border-[#A0522D]/20 pb-4">
          <div className="w-10 h-10 rounded-full bg-[#A0522D] text-[#F5F0E6] flex items-center justify-center">
            <PenTool size={18} />
          </div>
          <div>
            {/* 【修复】：使用 currentTitle */}
            <h2 className="text-xl font-serif font-bold text-[#A0522D]">《{currentTitle}》经典修辞赏析</h2>
            <p className="text-xs text-[#333333]/60 font-sans mt-1">鼠标悬停金句，查看修辞手法与高考语文考点解析</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {quotes.map((quote, idx) => (
            <motion.div
              key={quote.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="group relative"
              onMouseEnter={() => setHoveredId(quote.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <div className={`
                relative p-5 rounded-lg border-2 transition-all duration-300 cursor-default
                ${hoveredId === quote.id 
                  ? 'bg-[#FDFBF7] border-[#A0522D] shadow-xl scale-[1.02]' 
                  : 'bg-[#F2EFE9] border-[#A0522D]/30 shadow-sm'}
              `}>
                <Quote size={32} className="absolute top-2 right-3 text-[#A0522D]/10" />
                
                <div className="inline-block px-2 py-0.5 bg-[#A0522D]/10 text-[#A0522D] text-[10px] font-sans font-bold rounded mb-3 border border-[#A0522D]/20">
                  {quote.rhetoric_type}
                </div>

                <p className="text-base font-kai text-[#333333] leading-relaxed italic">
                  “{quote.original_text}”
                </p>

                <AnimatePresence>
                  {hoveredId === quote.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, marginTop: 0 }}
                      animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                      exit={{ opacity: 0, height: 0, marginTop: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-4 border-t border-dashed border-[#A0522D]/30 space-y-3">
                        <div>
                          <h4 className="text-xs font-sans font-bold text-[#6B705C] mb-1 flex items-center gap-1">
                            <PenTool size={12} /> 写作手法赏析
                          </h4>
                          <p className="text-xs font-sans text-[#333333]/80 leading-relaxed">
                            {quote.appreciation}
                          </p>
                        </div>
                        
                        <div className="bg-[#A0522D]/5 p-2.5 rounded border-l-2 border-[#A0522D]">
                          <h4 className="text-[10px] font-sans font-bold text-[#A0522D] mb-1 flex items-center gap-1">
                            <Target size={12} /> 高考考点 / 写作启发
                          </h4>
                          <p className="text-[10px] font-sans text-[#333333]/70 leading-relaxed">
                            {quote.exam_focus}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}