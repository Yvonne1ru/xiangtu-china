'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { useEffect } from 'react';
import { Info, RotateCcw } from 'lucide-react';

export default function Sidebar() {
  const { chapterList, activeChapterId, setActiveChapter, isSidebarOpen, closeSidebar, loadChapterList, loadChapterDetail } = useStore();

  useEffect(() => { loadChapterList(); }, [loadChapterList]);

  const handleClick = async (id: string) => {
    setActiveChapter(id);
    await loadChapterDetail(id);
    closeSidebar();
  };

  return (
    <>
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }} className="lg:hidden fixed inset-0 bg-black z-40" onClick={closeSidebar} />
        )}
      </AnimatePresence>

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-72 lg:w-[20%] 
        bg-paper border-r border-earth/20 flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        pt-14 lg:pt-0 
      `}>
        <div className="p-6 border-b border-earth/20 bg-paper-dark/50 hidden lg:block">
          <h1 className="text-2xl font-serif font-bold text-ink tracking-wider">乡土中国</h1>
          <p className="text-xs text-ink/60 font-sans tracking-widest mt-1">费孝通 · 沉浸式交互读本</p>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          <div className="px-4 mb-2 text-xs font-sans text-ink/50 uppercase tracking-wider">目录导航</div>
          <nav className="space-y-1">
            {chapterList.map((ch, idx) => (
              <button key={ch.id} onClick={() => handleClick(ch.id)} className={`w-full text-left px-4 py-3 flex items-center gap-3 border-l-2 transition-all ${activeChapterId === ch.id ? 'border-field bg-field/15 text-field-dark font-medium' : 'border-transparent hover:bg-field/10 hover:border-field/50'}`}>
                <span className="text-xs font-mono text-ink/40 w-6">{String(idx + 1).padStart(2, '0')}</span>
                <span className="text-sm font-serif">{ch.title}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-earth/20 space-y-2 hidden lg:block">
          <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-ink/70 hover:bg-field/10 rounded"><Info size={16} /><span>关于本项目</span></button>
          <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-ink/70 hover:bg-field/10 rounded"><RotateCcw size={16} /><span>重置进度</span></button>
        </div>
      </aside>
    </>
  );
}