'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Swords, ChevronDown, ChevronUp, Lock, Unlock } from 'lucide-react';

interface DebateRound {
  fei: string;
  modern: string;
}

interface DebateTopic {
  id: string;
  topic: string;
  rounds: DebateRound[];
}

interface DebateModalProps {
  debate: DebateTopic | null;
  onClose: () => void;
}

export default function DebateModal({ debate, onClose }: DebateModalProps) {
  // 控制当前解锁到的回合数 (默认只解锁第 1 回合)
  const [unlockedRounds, setUnlockedRounds] = useState(1);

  // 切换辩题时重置进度
  useEffect(() => {
    setUnlockedRounds(1);
  }, [debate]);

  if (!debate) return null;

  const handleNextRound = () => {
    if (unlockedRounds < debate.rounds.length) {
      setUnlockedRounds(prev => prev + 1);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-6xl h-[85vh] bg-[#FDFBF7] border-2 border-[#A0522D] rounded-lg shadow-2xl flex flex-col overflow-hidden"
          // 背景使用复古信纸纹理
          style={{
            backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, #E8E0D0 31px, #E8E0D0 32px)',
          }}
        >
          {/* 头部：辩题 */}
          <div className="p-5 border-b-2 border-[#A0522D] bg-[#F2EFE9] flex-shrink-0 relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-[#A0522D] text-[#F5F0E6] flex items-center justify-center shadow-md">
                <Swords size={20} />
              </div>
              <div>
                <h2 className="text-xs font-sans text-ink/50 tracking-widest uppercase">跨时空辩论场 · Cross-time Debate</h2>
                <p className="text-[10px] font-sans text-ink/40">费孝通 (乡土中国) vs 现代社会学视角</p>
              </div>
            </div>
            <h3 className="text-xl font-serif font-bold text-[#333333] leading-snug pl-13 ml-13">
              “{debate.topic}”
            </h3>
            <button onClick={onClose} className="absolute top-5 right-5 p-2 hover:bg-earth/10 rounded transition-colors">
              <X size={20} className="text-ink/70" />
            </button>
          </div>

          {/* 主体：左右对阵与回合 */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-8">
              {debate.rounds.map((round, idx) => {
                const isLocked = idx >= unlockedRounds;
                const roundTitle = `第 ${idx + 1} 回合：${idx === 0 ? '现象溯源' : idx === 1 ? '深度交锋' : '终极思辨'}`;

                return (
                  <div key={idx} className="relative">
                    {/* 回合标题分隔线 */}
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center gap-2 px-3 py-1 bg-[#333333] text-[#F5F0E6] rounded-full text-xs font-sans font-bold shadow-md">
                        {isLocked ? <Lock size={12} /> : <Unlock size={12} />}
                        {roundTitle}
                      </div>
                      <div className="flex-1 h-px bg-[#A0522D]/20"></div>
                    </div>

                    {/* 对阵内容区 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* 左侧：费孝通观点 (土褐色/传统) */}
                      <motion.div 
                        initial={isLocked ? { opacity: 0, x: -20 } : { opacity: 1, x: 0 }}
                        animate={isLocked ? { opacity: 0.3, x: 0 } : { opacity: 1, x: 0 }}
                        className={`relative p-5 rounded-lg border-2 transition-all duration-500 ${
                          isLocked 
                            ? 'border-[#A0522D]/10 bg-[#F2EFE9]/50' 
                            : 'border-[#A0522D]/40 bg-[#FDFBF7] shadow-md'
                        }`}
                      >
                        {/* 阵营标识 */}
                        <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-[#A0522D] text-[#F5F0E6] flex items-center justify-center text-xs font-bold font-serif shadow-md border-2 border-[#FDFBF7]">
                          费
                        </div>
                        <h4 className="text-xs font-sans font-bold text-[#A0522D] mb-2 ml-6 tracking-wider">【乡土中国 · 费孝通】</h4>
                        
                        {isLocked ? (
                          <div className="ml-6 text-sm font-serif text-ink/30 italic">
                            观点正在酝酿中，请解锁上一回合...
                          </div>
                        ) : (
                          <p className="text-sm font-serif text-[#333333] leading-loose ml-6">
                            {round.fei}
                          </p>
                        )}
                      </motion.div>

                      {/* 右侧：现代社会学观点 (田野绿/现代) */}
                      <motion.div 
                        initial={isLocked ? { opacity: 0, x: 20 } : { opacity: 1, x: 0 }}
                        animate={isLocked ? { opacity: 0.3, x: 0 } : { opacity: 1, x: 0 }}
                        className={`relative p-5 rounded-lg border-2 transition-all duration-500 ${
                          isLocked 
                            ? 'border-[#6B705C]/10 bg-[#F9F7F1]/50' 
                            : 'border-[#6B705C]/40 bg-[#FDFBF7] shadow-md'
                        }`}
                      >
                        {/* 阵营标识 */}
                        <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-[#6B705C] text-[#F5F0E6] flex items-center justify-center text-xs font-bold font-sans shadow-md border-2 border-[#FDFBF7]">
                          现
                        </div>
                        <h4 className="text-xs font-sans font-bold text-[#6B705C] mb-2 mr-6 tracking-wider text-right">【现代社会学视角】</h4>
                        
                        {isLocked ? (
                          <div className="mr-6 text-sm font-sans text-ink/30 italic text-right">
                            观点正在酝酿中，请解锁上一回合...
                          </div>
                        ) : (
                          <p className="text-sm font-sans text-[#333333] leading-loose mr-6">
                            {round.modern}
                          </p>
                        )}
                      </motion.div>

                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 底部控制区 */}
          <div className="p-4 border-t-2 border-[#A0522D] bg-[#F2EFE9] flex-shrink-0 flex items-center justify-between">
            <div className="text-xs font-sans text-ink/60">
              进度：<span className="font-bold text-[#A0522D]">{unlockedRounds}</span> / {debate.rounds.length} 回合
            </div>
            <button
              onClick={handleNextRound}
              disabled={unlockedRounds >= debate.rounds.length}
              className="px-6 py-2 bg-[#A0522D] text-[#F5F0E6] rounded-full font-serif text-sm font-bold hover:bg-[#8B4513] transition-colors disabled:bg-ink/20 disabled:cursor-not-allowed flex items-center gap-2 shadow-md"
            >
              {unlockedRounds >= debate.rounds.length ? '辩论结束' : '开启下一回合'}
              {unlockedRounds < debate.rounds.length && <ChevronDown size={16} />}
            </button>
          </div>

        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}