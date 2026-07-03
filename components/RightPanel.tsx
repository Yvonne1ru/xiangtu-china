'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { Lightbulb, Scale, ChevronDown, ChevronUp, BookOpen, PanelRightClose, PanelRightOpen, FileCheck2, Swords } from 'lucide-react';
import FieldNotebook from './FieldNotebook';
import ExamList from './ExamList';
import DebateList from './DebateList'; // 引入新的辩论列表组件

export default function RightPanel() {
  const { rightTab, setRightTab, activeChapterDetail, activeChapterId, userNotes, chapterList } = useStore();
  
  const [allComparisons, setAllComparisons] = useState<Record<string, any[]>>({});
  const [expandedIdx, setExpandedIdx] = useState<number | null>(0);
  const [isNotebookOpen, setIsNotebookOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  const currentTitle = chapterList.find(ch => ch.id === activeChapterId)?.title || '未知章节';

  useEffect(() => { 
    fetch('/data/comparisons_by_chapter.json')
      .then(res => res.json())
      .then(setAllComparisons)
      .catch(err => console.error('Failed to load comparisons:', err));
  }, []);

  useEffect(() => { setExpandedIdx(0); }, [activeChapterId]);

  const currentComparisons = useMemo(() => {
    return allComparisons[activeChapterId] || [];
  }, [allComparisons, activeChapterId]);

  const debates = activeChapterDetail?.debates || [];

  return (
    <>
      <aside className={`
        flex flex-col h-full bg-paper border-l border-earth/20 flex-shrink-0 overflow-hidden
        transition-all duration-300 ease-in-out
        ${isExpanded ? 'w-64' : 'w-12'}
      `}>
        
        {/* 顶部控制栏 */}
        <div className={`
          flex items-center border-b border-earth/20 flex-shrink-0 h-12
          ${isExpanded ? 'justify-between px-3' : 'justify-center px-0'}
        `}>
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded hover:bg-earth/10 text-ink/60 hover:text-ink transition-colors flex-shrink-0"
            title={isExpanded ? '收起问答' : '展开问答'}
          >
            {isExpanded ? <PanelRightClose size={18} /> : <PanelRightOpen size={18} />}
          </button>

          <AnimatePresence>
            {isExpanded && (
              <motion.span 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="text-[10px] font-sans text-ink/50 tracking-widest whitespace-nowrap"
              >
                探究与笔记
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* 展开状态下的完整内容 */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex-1 flex flex-col min-h-0 overflow-hidden"
            >
              {/* Tab 栏 (增加第四个 Tab) */}
              <div className="flex border-b border-earth/20 flex-shrink-0">
                <button onClick={() => setRightTab('insights')} className={`flex-1 py-2.5 text-[9px] font-sans flex items-center justify-center gap-0.5 ${rightTab === 'insights' ? 'text-field border-b-2 border-field font-medium' : 'text-ink/50'}`}>
                  <Lightbulb size={11} /><span>洞察</span>
                </button>
                <button onClick={() => setRightTab('comparison')} className={`flex-1 py-2.5 text-[9px] font-sans flex items-center justify-center gap-0.5 ${rightTab === 'comparison' ? 'text-field border-b-2 border-field font-medium' : 'text-ink/50'}`}>
                  <Scale size={11} /><span>对照</span>
                </button>
                <button onClick={() => setRightTab('exams')} className={`flex-1 py-2.5 text-[9px] font-sans flex items-center justify-center gap-0.5 ${rightTab === 'exams' ? 'text-field border-b-2 border-field font-medium' : 'text-ink/50'}`}>
                  <FileCheck2 size={11} /><span>真题</span>
                </button>
                {/* 新增辩论 Tab */}
                <button onClick={() => setRightTab('debate')} className={`flex-1 py-2.5 text-[9px] font-sans flex items-center justify-center gap-0.5 ${rightTab === 'debate' ? 'text-field border-b-2 border-field font-medium' : 'text-ink/50'}`}>
                  <Swords size={11} /><span>辩论</span>
                </button>
              </div>

              {/* 内容区 */}
              <div className="flex-1 overflow-y-auto min-h-0">
                <AnimatePresence mode="wait">
                  {rightTab === 'insights' && (
                    <motion.div key="i" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="p-3 space-y-2">
                      <h3 className="text-xs font-serif font-bold text-ink/80 mb-3 px-1">《{currentTitle}》探究</h3>
                      {debates.length === 0 ? (
                        <div className="text-center py-8 text-ink/40 font-serif text-xs">当前章节暂无深度探究</div>
                      ) : (
                        debates.map((question, idx) => (
                          <div key={idx} className="retro-card overflow-hidden">
                            <button onClick={() => setExpandedIdx(expandedIdx === idx ? null : idx)} className="w-full p-2.5 flex items-start justify-between text-left hover:bg-field/5">
                              <span className="text-xs font-serif text-ink/80 pr-2 leading-relaxed">{question}</span>
                              {expandedIdx === idx ? <ChevronUp size={14} className="text-field shrink-0 mt-0.5" /> : <ChevronDown size={14} className="text-ink/40 shrink-0 mt-0.5" />}
                            </button>
                            <AnimatePresence>
                              {expandedIdx === idx && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                  <div className="px-2.5 pb-2.5 pt-0 space-y-1.5 border-t border-earth/10 mt-0 pt-2">
                                    <div className="text-[10px] font-sans text-ink/70 leading-relaxed"><span className="font-bold text-field">费老视角：</span>{activeChapterDetail?.summary || '在乡土社会的语境下，这是一个值得深思的结构性问题。'}</div>
                                    <div className="text-[10px] font-sans text-ink/70 leading-relaxed"><span className="font-bold text-earth">现代演化：</span>{activeChapterDetail?.modern_evolution || '在当代社会，这一现象正在经历从传统向现代的复杂转型。'}</div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        ))
                      )}
                    </motion.div>
                  )}

                  {rightTab === 'comparison' && (
                    <motion.div key="c" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="p-3">
                      <h3 className="text-xs font-serif font-bold text-ink/80 mb-3 px-1">《{currentTitle}》城乡对照</h3>
                      {currentComparisons.length === 0 ? (
                        <div className="text-center py-8 text-ink/40 font-serif text-xs">当前章节暂无专属城乡对照数据</div>
                      ) : (
                        <div className="space-y-1.5">
                          {currentComparisons.map((item, idx) => (
                            <div key={idx} className="grid grid-cols-2 gap-1.5 text-[10px]">
                              <div className="p-2 bg-earth/10 rounded-l border-l-2 border-earth font-sans text-ink/80 leading-relaxed">{item.rural}</div>
                              <div className="p-2 bg-field/10 rounded-r border-r-2 border-field font-sans text-ink/80 text-right leading-relaxed">{item.urban}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}

                  {rightTab === 'exams' && (
                    <motion.div key="e" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="h-full">
                      <ExamList />
                    </motion.div>
                  )}

                  {/* 【修改】：渲染辩论列表 */}
                  {rightTab === 'debate' && (
                    <motion.div key="d" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="h-full">
                      <DebateList />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 底部田野笔记入口 */}
              <div className="p-3 border-t border-earth/20 flex-shrink-0">
                <button onClick={() => setIsNotebookOpen(true)} className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-field text-paper rounded hover:bg-field-dark transition-colors font-serif text-xs">
                  <BookOpen size={14} /><span>田野笔记</span>
                  {userNotes.length > 0 && <span className="ml-1 px-1.5 py-0.5 bg-paper/20 rounded-full text-[9px]">{userNotes.length}</span>}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 折叠状态下的垂直提示 */}
        {!isExpanded && (
          <div className="flex-1 flex items-center justify-center py-4">
             <span className="text-[10px] text-earth/40 font-sans" style={{ writingMode: 'vertical-rl' }}>问答</span>
          </div>
        )}
      </aside>

      <FieldNotebook isOpen={isNotebookOpen} onClose={() => setIsNotebookOpen(false)} />
    </>
  );
}