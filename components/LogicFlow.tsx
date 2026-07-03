'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { ChevronRight, Lightbulb } from 'lucide-react';

interface LogicNode {
  id: string;
  step: string;
  title: string;
  content: string;
  detail: string;
}

export default function LogicFlow() {
  // 【修复】：引入 chapterList 用于获取准确的标题
  const { activeChapterId, chapterList } = useStore();
  const [nodes, setNodes] = useState<LogicNode[]>([]);
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 【核心修复】：直接从目录列表中提取当前章节标题，彻底解决 404 导致的标题不更新问题
  const currentTitle = chapterList.find(ch => ch.id === activeChapterId)?.title || '未知章节';

  useEffect(() => {
    setIsLoading(true);
    setActiveNodeId(null);
    fetch('/data/chapters/analysis.json')
      .then(res => res.json())
      .then(data => {
        const chapterData = data[activeChapterId];
        setNodes(chapterData?.logic_nodes || []);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [activeChapterId]);

  if (isLoading) return <div className="flex items-center justify-center h-full text-[#A0522D] font-serif">正在梳理逻辑脉络...</div>;
  
  if (nodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-[#A0522D]/70 font-serif gap-3">
        <div className="text-5xl">📜</div>
        <p className="text-lg">《{currentTitle}》暂无逻辑拆解数据</p>
        <p className="text-xs text-[#333333]/50">敬请期待后续更新</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-[#F5F0E6] rounded-lg p-6 overflow-y-auto">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 flex items-center gap-3 border-b border-[#A0522D]/20 pb-4">
          <div className="w-10 h-10 rounded-full bg-[#A0522D] text-[#F5F0E6] flex items-center justify-center">
            <ChevronRight size={20} />
          </div>
          <div>
            {/* 【修复】：使用 currentTitle */}
            <h2 className="text-xl font-serif font-bold text-[#A0522D]">《{currentTitle}》论述逻辑拆解</h2>
            <p className="text-xs text-[#333333]/60 font-sans mt-1">点击节点查看费孝通先生的论证思路，学习议论文写作框架</p>
          </div>
        </div>

        {/* 垂直流程图 */}
        <div className="relative pl-8">
          <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-[#A0522D]/20" />

          <div className="space-y-6">
            {nodes.map((node, idx) => {
              const isActive = activeNodeId === node.id;

              return (
                <motion.div 
                  key={node.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="relative"
                >
                  <div className={`
                    absolute -left-8 top-3 w-8 h-8 rounded-full border-2 flex items-center justify-center z-10 transition-all
                    ${isActive ? 'bg-[#6B705C] border-[#6B705C] text-[#F5F0E6] scale-110' : 'bg-[#F5F0E6] border-[#A0522D] text-[#A0522D]'}
                  `}>
                    <span className="text-[10px] font-bold font-mono">{node.step}</span>
                  </div>

                  <div 
                    onClick={() => setActiveNodeId(isActive ? null : node.id)}
                    className={`
                      ml-4 p-4 rounded-lg border cursor-pointer transition-all duration-300
                      ${isActive 
                        ? 'bg-[#FDFBF7] border-[#6B705C] shadow-lg' 
                        : 'bg-[#F2EFE9] border-[#A0522D]/20 hover:border-[#A0522D]/50 hover:shadow-md'}
                    `}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className={`text-base font-serif font-bold ${isActive ? 'text-[#6B705C]' : 'text-[#333333]/80'}`}>
                        {node.title}
                      </h3>
                      {isActive && <Lightbulb size={16} className="text-[#A0522D]" />}
                    </div>
                    <p className="text-sm font-sans text-[#333333]/70 leading-relaxed">
                      {node.content}
                    </p>

                    <AnimatePresence>
                      {isActive && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-3 pt-3 border-t border-dashed border-[#A0522D]/20">
                            <p className="text-xs font-kai text-[#333333]/80 leading-relaxed italic bg-[#A0522D]/5 p-3 rounded">
                              💡 <span className="font-bold not-italic text-[#A0522D]">写作启发：</span> {node.detail}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}