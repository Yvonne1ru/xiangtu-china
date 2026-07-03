'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';

// 引入原有组件
const ConceptGraph = dynamic(() => import('./ConceptGraph'), { ssr: false });
const FieldScene = dynamic(() => import('./FieldScene'), { ssr: false });
const Timeline = dynamic(() => import('./Timeline'), { ssr: false });
const MatchingGame = dynamic(() => import('./MatchingGame'), { ssr: false });

// 【新增】引入高考辅助组件
const LogicFlow = dynamic(() => import('./LogicFlow'), { ssr: false });
const RhetoricGallery = dynamic(() => import('./RhetoricGallery'), { ssr: false });

const tabs = [
  { id: 'graph', label: '概念图谱' },
  { id: 'scene', label: '田野微缩场景' },
  { id: 'timeline', label: '社会变迁时间线' },
  { id: 'game', label: '概念匹配游戏' },
  { id: 'logic', label: '逻辑拆解' },       // 【新增】
  { id: 'rhetoric', label: '修辞赏析' },    // 【新增】
];

export default function MainArea() {
  const [activeTab, setActiveTab] = useState('graph');

  const renderContent = () => {
    switch (activeTab) {
      case 'graph': return <ConceptGraph />;
      case 'scene': return <FieldScene />;
      case 'timeline': return <Timeline />;
      case 'game': return <MatchingGame />;
      case 'logic': return <LogicFlow />;         // 【新增】
      case 'rhetoric': return <RhetoricGallery />; // 【新增】
      default: return null;
    }
  };

  return (
    <main className="flex flex-col flex-1 h-full min-w-0 bg-[#F2EFE9] p-4 md:p-6 overflow-hidden">
      
      {/* 顶部 Tab 导航 (增加了 overflow-x-auto 防止 6 个 Tab 在窄屏下溢出) */}
      <div className="flex gap-2 mb-4 pb-2 flex-shrink-0 border-b border-earth/10 overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-t-lg font-serif text-sm md:text-base whitespace-nowrap transition-all duration-300 border-b-2 ${
              activeTab === tab.id
                ? 'bg-[#F5F0E6] text-[#A0522D] border-[#A0522D] font-bold shadow-sm'
                : 'bg-transparent text-[#6B705C] border-transparent hover:bg-[#F5F0E6]/50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 内容区 */}
      <div className="flex-1 relative overflow-hidden min-h-0 mt-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0 w-full h-full box-border rounded-lg border-2 border-[#A0522D] bg-[#F5F0E6] p-1"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  );
}