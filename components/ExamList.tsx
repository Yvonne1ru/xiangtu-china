'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { FileText, Award } from 'lucide-react';
import ExamDetailModal from './ExamDetailModal';

interface ExamItem {
  id: string;
  chapter_ids: string[];
  year: string;
  source: string;
  type: string;
  title: string;
  full_question: string;
  answer: string;
  structure: string;
}

// 复用筛选标签组件
function FilterTag({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`
        px-2 py-0.5 text-[9px] font-sans rounded-full border transition-all duration-200 whitespace-nowrap
        ${selected 
          ? 'bg-[#A0522D] text-[#F5F0E6] border-[#A0522D] shadow-sm' 
          : 'bg-transparent text-ink/60 border-[#A0522D]/20 hover:bg-[#A0522D]/5 hover:border-[#A0522D]/40'
        }
      `}
    >
      {label}
    </button>
  );
}

export default function ExamList() {
  const { chapterList } = useStore();
  const [exams, setExams] = useState<ExamItem[]>([]);
  const [selectedFilters, setSelectedFilters] = useState<string[]>(['all']);
  const [selectedExam, setSelectedExam] = useState<ExamItem | null>(null);

  useEffect(() => {
    fetch('/data/exams.json')
      .then(res => res.json())
      .then(setExams)
      .catch(err => console.error('Failed to load exams:', err));
  }, []);

  const toggleFilter = (id: string) => {
    if (id === 'all') {
      setSelectedFilters(['all']);
    } else {
      setSelectedFilters(prev => {
        const newFilters = prev.includes(id) 
          ? prev.filter(f => f !== id) 
          : [...prev.filter(f => f !== 'all'), id];
        return newFilters.length === 0 ? ['all'] : newFilters;
      });
    }
  };

  const filteredExams = useMemo(() => {
    if (selectedFilters.includes('all')) return exams;
    return exams.filter(exam => exam.chapter_ids.some(chId => selectedFilters.includes(chId)));
  }, [exams, selectedFilters]);

  return (
    <>
      <div className="flex flex-col h-full">
        {/* 筛选区 */}
        <div className="p-2 border-b border-earth/10 flex-shrink-0">
          <div className="flex flex-wrap gap-1">
            <FilterTag label="全部" selected={selectedFilters.includes('all')} onClick={() => toggleFilter('all')} />
            {chapterList.map((ch, idx) => (
              <FilterTag 
                key={ch.id} 
                label={`${String(idx + 1).padStart(2, '0')}`} 
                selected={selectedFilters.includes(ch.id)} 
                onClick={() => toggleFilter(ch.id)} 
              />
            ))}
          </div>
        </div>

        {/* 列表区 */}
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {filteredExams.length === 0 ? (
            <div className="text-center py-8 text-ink/40 font-serif text-xs">暂无该章节的真题</div>
          ) : (
            filteredExams.map((exam) => (
              <motion.div
                key={exam.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setSelectedExam(exam)}
                className="p-2.5 bg-paper border border-[#A0522D]/20 rounded cursor-pointer hover:border-[#A0522D] hover:shadow-sm transition-all group"
              >
                {/* 标签行 */}
                <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                  <span className="px-1.5 py-0.5 bg-[#A0522D]/10 text-[#A0522D] text-[9px] font-bold font-sans rounded">
                    {exam.year} {exam.source.split('·')[0]}
                  </span>
                  <span className="px-1.5 py-0.5 bg-[#6B705C]/10 text-[#6B705C] text-[9px] font-sans rounded border border-[#6B705C]/20">
                    {exam.type}
                  </span>
                </div>
                
                {/* 摘要行 */}
                <p className="text-[10px] font-serif text-ink/80 leading-relaxed line-clamp-2 group-hover:text-[#A0522D] transition-colors">
                  {exam.title}
                </p>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* 详情弹窗 */}
      <ExamDetailModal exam={selectedExam} onClose={() => setSelectedExam(null)} />
    </>
  );
}