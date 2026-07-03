'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, Lightbulb, Award, ChevronDown, ChevronUp } from 'lucide-react';
import { useStore } from '@/store/useStore';

interface ExamItem {
  id: string;
  chapter_ids: string[];
  year: string;
  source: string;
  type: string;
  title: string;
  options?: string[];
  correct_answer?: string;
  full_question: string;
  answer: string;
  structure: string;
}

interface ExamDetailModalProps {
  exam: ExamItem | null;
  onClose: () => void;
}

export default function ExamDetailModal({ exam, onClose }: ExamDetailModalProps) {
  const { chapterList } = useStore();
  // 【新增】：控制答案区域的展开/折叠状态，默认 false（隐藏）
  const [isAnswerExpanded, setIsAnswerExpanded] = useState(false);

  // 每次切换新题目时，自动收起答案，让学生重新思考
  useEffect(() => {
    setIsAnswerExpanded(false);
  }, [exam]);

  if (!exam) return null;

  const relatedChapters = exam.chapter_ids
    .map(id => chapterList.find(ch => ch.id === id)?.title)
    .filter(Boolean)
    .join('、');

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-5xl h-[85vh] bg-[#FDFBF7] border-2 border-[#A0522D] rounded-lg shadow-2xl flex flex-col overflow-hidden"
          style={{
            backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, #E8E0D0 31px, #E8E0D0 32px)',
          }}
        >
          {/* 头部信息 */}
          <div className="flex items-center justify-between p-4 border-b-2 border-[#A0522D] bg-[#F2EFE9] flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#A0522D] text-[#F5F0E6] flex items-center justify-center">
                <FileText size={20} />
              </div>
              <div>
                <h2 className="text-lg font-serif font-bold text-[#A0522D]">
                  {exam.year} {exam.source} · {exam.type}
                </h2>
                <p className="text-xs text-ink/60 font-sans mt-0.5">
                  关联考点：<span className="text-[#6B705C] font-bold">{relatedChapters}</span>
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-earth/10 rounded transition-colors">
              <X size={20} className="text-ink/70" />
            </button>
          </div>

          {/* 内容区：左右分栏 */}
          <div className="flex-1 flex overflow-hidden">
            
            {/* 左侧：完整题目 + 选项 (试卷风格) */}
            <div className="w-1/2 p-6 overflow-y-auto border-r border-[#A0522D]/20">
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-dashed border-[#A0522D]/30">
                <FileText size={16} className="text-[#A0522D]" />
                <h3 className="text-sm font-serif font-bold text-[#A0522D]">【完整题目】</h3>
              </div>
              
              {/* 题干 */}
              <div className="text-sm font-serif text-[#333333] leading-relaxed whitespace-pre-wrap mb-4">
                {exam.full_question}
              </div>

              {/* 【新增】：选择题选项渲染 */}
              {exam.options && exam.options.length > 0 && (
                <div className="space-y-2 mt-4 p-4 bg-[#F2EFE9] rounded border border-[#A0522D]/10">
                  {exam.options.map((opt, i) => (
                    <div key={i} className="text-sm font-serif text-[#333333]/80 leading-relaxed pl-2 border-l-2 border-transparent hover:border-[#6B705C]/30 transition-colors">
                      {opt}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 右侧：答题结构 + 满分回答 (答题纸风格) */}
            <div className="w-1/2 flex flex-col overflow-hidden bg-[#F9F7F1]">
              {/* 答题结构 (始终展开，提供思路引导) */}
              <div className="p-5 border-b border-[#6B705C]/20 flex-shrink-0 max-h-[40%] overflow-y-auto">
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-dashed border-[#6B705C]/30">
                  <Lightbulb size={16} className="text-[#6B705C]" />
                  <h3 className="text-sm font-serif font-bold text-[#6B705C]">【答题结构 / 思路拆解】</h3>
                </div>
                <div className="text-xs font-sans text-[#333333]/80 leading-relaxed whitespace-pre-wrap">
                  {exam.structure}
                </div>
              </div>

              {/* 【核心优化】：满分回答 (默认折叠，点击后展开) */}
              <div className="flex-1 p-5 overflow-y-auto">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-dashed border-[#A0522D]/30">
                  <div className="flex items-center gap-2">
                    <Award size={16} className="text-[#A0522D]" />
                    <h3 className="text-sm font-serif font-bold text-[#A0522D]">【满分回答示范】</h3>
                  </div>
                  <button
                    onClick={() => setIsAnswerExpanded(!isAnswerExpanded)}
                    className="flex items-center gap-1 px-2 py-1 text-xs font-sans text-[#6B705C] bg-[#6B705C]/5 rounded hover:bg-[#6B705C]/10 transition-colors"
                  >
                    {isAnswerExpanded ? '收起' : '点击查看'}
                    {isAnswerExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                </div>
                
                <AnimatePresence initial={false}>
                  {isAnswerExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-2 text-sm font-kai text-[#333333] leading-loose whitespace-pre-wrap">
                        {exam.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {/* 折叠时的提示语 */}
                {!isAnswerExpanded && (
                  <div className="pt-4 pb-2 flex items-center justify-center text-xs text-ink/30 font-serif italic border-t border-dashed border-[#A0522D]/10 mt-2">
                    💡 请先结合左侧思路尝试作答，再点击上方按钮查看标准答案。
                  </div>
                )}
              </div>
            </div>

          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}