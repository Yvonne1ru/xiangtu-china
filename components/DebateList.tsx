'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, MessageSquareText } from 'lucide-react';
import DebateModal from './DebateModal';

interface DebateRound {
  fei: string;
  modern: string;
}

interface DebateTopic {
  id: string;
  topic: string;
  rounds: DebateRound[];
}

export default function DebateList() {
  const [debates, setDebates] = useState<DebateTopic[]>([]);
  const [selectedDebate, setSelectedDebate] = useState<DebateTopic | null>(null);

  useEffect(() => {
    fetch('/data/debates.json')
      .then(res => res.json())
      .then(setDebates)
      .catch(err => console.error('Failed to load debates:', err));
  }, []);

  return (
    <>
      <div className="flex flex-col h-full">
        {/* 标题区 */}
        <div className="p-3 border-b border-earth/10 flex-shrink-0 flex items-center gap-2">
          <Swords size={14} className="text-[#A0522D]" />
          <span className="text-[10px] font-sans font-bold text-ink/70 tracking-wider">跨时空辩论场</span>
        </div>

        {/* 辩题列表 */}
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {debates.length === 0 ? (
            <div className="text-center py-8 text-ink/40 font-serif text-xs">正在布置辩论场...</div>
          ) : (
            debates.map((debate) => (
              <motion.div
                key={debate.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setSelectedDebate(debate)}
                className="p-3 bg-paper border border-[#A0522D]/20 rounded cursor-pointer hover:border-[#A0522D] hover:shadow-md transition-all group relative overflow-hidden"
              >
                {/* 装饰性引号 */}
                <MessageSquareText size={24} className="absolute -right-2 -bottom-2 text-[#A0522D]/5 group-hover:text-[#A0522D]/10 transition-colors" />
                
                {/* 辩题摘要 */}
                <p className="text-[11px] font-serif text-ink/80 leading-relaxed line-clamp-3 group-hover:text-[#A0522D] transition-colors relative z-10">
                  “{debate.topic}”
                </p>
                
                {/* 回合数提示 */}
                <div className="mt-2 flex items-center justify-between relative z-10">
                  <span className="text-[9px] font-sans text-ink/40">共 {debate.rounds.length} 个回合交锋</span>
                  <span className="text-[9px] font-sans font-bold text-[#A0522D] opacity-0 group-hover:opacity-100 transition-opacity">
                    开启辩论 →
                  </span>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* 辩论详情弹窗 */}
      <DebateModal debate={selectedDebate} onClose={() => setSelectedDebate(null)} />
    </>
  );
}