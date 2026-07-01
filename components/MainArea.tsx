'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { Network, Map, Clock, Gamepad2 } from 'lucide-react';

const TABS = [
  { id: 'graph', label: '概念图谱', icon: Network },
  { id: 'scene', label: '田野场景', icon: Map },
  { id: 'timeline', label: '社会变迁', icon: Clock },
  { id: 'game', label: '匹配游戏', icon: Gamepad2 },
];

export default function MainArea() {
  const { mainTab, setMainTab, activeChapterDetail, activeChapterId, chapterList } = useStore();
  const currentTitle = chapterList.find(c => c.id === activeChapterId)?.title || '乡土中国';

  return (
    <main className="flex-1 lg:w-[55%] flex flex-col bg-paper min-h-screen pt-14 lg:pt-0">
      <header className="sticky top-14 lg:top-0 z-30 bg-paper/90 backdrop-blur-md border-b border-earth/20 px-6 py-4 flex items-center justify-between">
        <nav className="flex gap-2 overflow-x-auto">
          {TABS.map(tab => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setMainTab(tab.id as any)} className={`flex items-center gap-2 px-4 py-2 text-sm font-sans whitespace-nowrap transition-all ${mainTab === tab.id ? 'text-field border-b-2 border-field font-medium' : 'text-ink/50 hover:text-ink/70'}`}>
                <Icon size={16} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="hidden md:block text-xs text-ink/50 font-sans">当前：{currentTitle}</div>
      </header>

      <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div key={mainTab + activeChapterId} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="h-full">
            {mainTab === 'graph' && <GraphView />}
            {mainTab === 'scene' && <SceneView />}
            {mainTab === 'timeline' && <TimelineView />}
            {mainTab === 'game' && <GameView />}
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  );
}

function GraphView() {
  const { activeChapterDetail } = useStore();
  return (
    <div className="max-w-2xl mx-auto retro-card p-8">
      <h2 className="text-2xl font-serif font-bold text-ink mb-4 text-center">{activeChapterDetail?.coreConcept || '概念图谱'}</h2>
      <div className="aspect-video bg-paper rounded border border-earth/20 flex items-center justify-center mb-6">
        <div className="text-center text-ink/40">
          <Network size={48} className="mx-auto mb-2 opacity-50" />
          <p className="text-sm font-sans">ECharts 力导向图区域</p>
        </div>
      </div>
      <p className="text-ink/70 text-sm leading-relaxed font-serif text-center">{activeChapterDetail?.summary}</p>
    </div>
  );
}
function SceneView() { return <div className="retro-card p-8 text-center text-ink/40">田野微缩场景占位</div>; }
function TimelineView() { return <div className="retro-card p-8 text-center text-ink/40">社会变迁时间线占位</div>; }
function GameView() { return <div className="retro-card p-8 text-center text-ink/40">概念匹配游戏占位</div>; }