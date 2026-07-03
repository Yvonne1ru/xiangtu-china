'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { useEffect } from 'react';
import { Info, RotateCcw, PanelLeftClose, PanelLeftOpen, Check } from 'lucide-react';

export default function Sidebar() {
  // 【修复】：只从 store 获取实际存在的数据，彻底移除 isLeftExpanded 和 toggleLeftSidebar
  const { 
    chapterList, activeChapterId, setActiveChapter, isSidebarOpen, closeSidebar, 
    loadChapterList, loadChapterDetail,
    completedChapters, toggleChapterCompletion 
  } = useStore();
  
  // 【核心】：使用组件内部状态控制折叠，不污染全局 Store
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => { loadChapterList(); }, [loadChapterList]);

  const handleClick = async (id: string) => {
    setActiveChapter(id);
    await loadChapterDetail(id);
    closeSidebar();
  };

  // 计算进度百分比
  const progress = chapterList.length > 0 
    ? Math.round((completedChapters.length / chapterList.length) * 100) 
    : 0;

  return (
    <>
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }} className="lg:hidden fixed inset-0 bg-black z-30" onClick={closeSidebar} />
        )}
      </AnimatePresence>

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40 h-full 
        bg-paper border-r border-earth/20 flex flex-col flex-shrink-0 overflow-hidden
        transition-all duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${isExpanded ? 'w-56' : 'w-12'}
        pt-14 lg:pt-0
      `}>
        
        {/* 顶部控制栏 */}
        <div className={`
          flex items-center border-b border-earth/20 flex-shrink-0 h-14 lg:h-16
          ${isExpanded ? 'justify-between px-4' : 'justify-center px-0'}
        `}>
          <AnimatePresence>
            {isExpanded && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="hidden lg:block whitespace-nowrap overflow-hidden">
                <h1 className="text-lg font-serif font-bold text-ink tracking-wider">乡土中国</h1>
                <p className="text-[10px] text-ink/60 font-sans tracking-widest mt-0.5">费孝通 · 交互读本</p>
              </motion.div>
            )}
          </AnimatePresence>
          
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="hidden lg:flex p-1.5 rounded hover:bg-earth/10 text-ink/60 hover:text-ink transition-colors flex-shrink-0"
            title={isExpanded ? '收起目录' : '展开目录'}
          >
            {isExpanded ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
          </button>
        </div>

        {/* 展开状态下的完整内容 */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex-1 flex flex-col min-h-0 overflow-hidden"
            >
              {/* 阅读进度条 */}
              <div className="px-4 py-3 border-b border-earth/10 flex-shrink-0 bg-paper-dark/30">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[10px] font-sans text-ink/60 tracking-wider uppercase">阅读进度</span>
                  <span className="text-[10px] font-mono text-field font-bold">{progress}% <span className="text-ink/40 font-normal">({completedChapters.length}/{chapterList.length})</span></span>
                </div>
                <div className="w-full h-1.5 bg-earth/10 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-field rounded-full" 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
              </div>

              {/* 目录列表 */}
              <div className="flex-1 overflow-y-auto py-3">
                <div className="px-4 mb-2 text-[10px] font-sans text-ink/50 uppercase tracking-wider">目录导航</div>
                <nav className="space-y-0.5 px-2">
                  {chapterList.map((ch, idx) => {
                    const isCompleted = completedChapters.includes(ch.id);
                    
                    return (
                      <button 
                        key={ch.id} 
                        onClick={() => handleClick(ch.id)} 
                        className={`
                          w-full text-left px-3 py-2 flex items-center gap-2 border-l-2 transition-all rounded-r group
                          ${activeChapterId === ch.id 
                            ? 'border-field bg-field/15 text-field-dark font-medium' 
                            : 'border-transparent hover:bg-field/5 hover:border-field/30'}
                        `}
                      >
                        <span className="text-[10px] font-mono text-ink/40 w-5 shrink-0">{String(idx + 1).padStart(2, '0')}</span>
                        <span className={`text-xs font-serif truncate flex-1 transition-colors ${isCompleted ? 'text-field-dark' : ''}`}>
                          {ch.title}
                        </span>
                        
                        <div
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            toggleChapterCompletion(ch.id); 
                          }}
                          className={`
                            w-4 h-4 border-2 rounded-sm flex items-center justify-center cursor-pointer transition-all shrink-0
                            ${isCompleted 
                              ? 'bg-field border-field shadow-sm' 
                              : 'border-earth/30 hover:border-earth bg-transparent group-hover:border-earth/60'}
                          `}
                          title={isCompleted ? '取消已读' : '标记已读'}
                        >
                          {isCompleted && <Check size={10} strokeWidth={3} className="text-paper" />}
                        </div>
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* 底部功能按钮 */}
              <div className="p-3 border-t border-earth/20 space-y-1 flex-shrink-0">
                <button className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-ink/70 hover:bg-field/10 rounded whitespace-nowrap"><Info size={14} /><span>关于本项目</span></button>
                <button className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-ink/70 hover:bg-field/10 rounded whitespace-nowrap"><RotateCcw size={14} /><span>重置进度</span></button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 折叠状态下的垂直提示 */}
        {!isExpanded && (
          <div className="flex-1 flex items-center justify-center py-4">
             <span className="text-[10px] text-earth/40 font-sans" style={{ writingMode: 'vertical-rl' }}>目录</span>
          </div>
        )}
      </aside>
    </>
  );
}