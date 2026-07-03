'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  useDraggable,
  useDroppable,
} from '@dnd-kit/core';
import { Check, Lightbulb, Quote } from 'lucide-react';
import { useStore } from '@/store/useStore';

interface GameItem {
  id: string;
  phenomenon: string;
  answer: string;
  hint: string;
  analysis: string;
}

function DraggableCard({ id, children, isCorrect, showHint, isShaking }: any) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id });
  const style = transform ? { transform: `translate(${transform.x}px, ${transform.y}px)` } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`
        p-3 bg-[#F2EFE9] border-2 rounded-lg cursor-grab active:cursor-grabbing
        transition-all duration-200 shadow-sm hover:shadow-md
        ${isDragging ? 'opacity-50 scale-105 z-50' : ''}
        ${isCorrect ? 'border-[#6B705C] bg-[#6B705C]/10' : 'border-[#A0522D]'}
        ${showHint ? 'ring-2 ring-[#6B705C]/50' : ''}
        ${isShaking ? 'animate-shake border-red-500 bg-red-50' : ''}
      `}
    >
      {children}
    </div>
  );
}

function DroppableZone({ id, label, isMatched, matchedItem }: any) {
  const { isOver, setNodeRef } = useDroppable({ id });

  return (
    <div className="space-y-2">
      <div
        ref={setNodeRef}
        className={`
          p-3 border-2 border-dashed rounded-lg min-h-[60px] flex items-center justify-center
          transition-all duration-200
          ${isOver ? 'border-[#6B705C] bg-[#6B705C]/10 scale-105' : 'border-[#A0522D]/40 bg-[#EDE7D9]/30'}
          ${isMatched ? 'border-[#6B705C] bg-[#6B705C]/15' : ''}
        `}
      >
        <span className={`text-sm font-serif font-bold flex items-center gap-2 ${isMatched ? 'text-[#6B705C]' : 'text-[#333333]/60'}`}>
          {isMatched && <Check size={16} className="text-[#6B705C]" />}
          {label}
        </span>
      </div>

      <AnimatePresence>
        {isMatched && matchedItem?.analysis && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: 8 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            className="overflow-hidden"
          >
            <div 
              className="relative p-3 bg-[#FDFBF7] border-l-4 border-[#6B705C] rounded-r shadow-sm"
              style={{
                backgroundImage: 'repeating-linear-gradient(transparent, transparent 23px, #E8E0D0 23px, #E8E0D0 24px)',
              }}
            >
              <Quote size={14} className="absolute top-2 right-2 text-[#6B705C]/30" />
              <p className="text-xs font-kai text-[#333333]/80 leading-relaxed italic">
                {matchedItem.analysis}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function MatchingGame() {
  // 【修复 1】：引入 chapterList，移除对 activeChapterDetail 的依赖
  const { activeChapterId, chapterList } = useStore();
  
  // 【核心修复】：直接从目录列表中提取当前章节标题，彻底解决 404 导致的标题不更新问题
  const currentTitle = chapterList.find(ch => ch.id === activeChapterId)?.title || '未知章节';

  const [gameData, setGameData] = useState<GameItem[]>([]);
  const [shuffledItems, setShuffledItems] = useState<GameItem[]>([]);
  const [matchedIds, setMatchedIds] = useState<Set<string>>(new Set());
  const [activeId, setActiveId] = useState<string | null>(null);
  const [errorCount, setErrorCount] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [shakingId, setShakingId] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
    setMatchedIds(new Set());
    setErrorCount({});

    const url = `/data/games/${activeChapterId}.json`;
    
    fetch(url)
      .then((res) => {
        if (!res.ok) {
          if (res.status === 404) throw new Error('NOT_FOUND');
          throw new Error('FETCH_ERROR');
        }
        return res.json();
      })
      .then((data: GameItem[]) => {
        setGameData(data);
        setShuffledItems([...data].sort(() => Math.random() - 0.5));
        setIsLoading(false);
      })
      .catch((err) => {
        if (err.message === 'NOT_FOUND') setHasError(true);
        else console.error(err);
        setIsLoading(false);
      });
  }, [activeChapterId]);

  const handleDragStart = (event: DragStartEvent) => setActiveId(event.active.id as string);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const draggedItemId = active.id as string;
    const droppedZoneId = over.id as string;
    const draggedItem = gameData.find((item) => item.id === draggedItemId);
    if (!draggedItem) return;

    const expectedAnswer = droppedZoneId.replace('zone-', '');
    
    if (draggedItem.answer === expectedAnswer) {
      setMatchedIds((prev) => new Set([...prev, draggedItemId]));
      setFeedback({ type: 'success', message: '✓ 匹配正确！' });
      setErrorCount((prev) => ({ ...prev, [draggedItemId]: 0 }));
      setTimeout(() => setFeedback(null), 1500);
    } else {
      const currentErrors = (errorCount[draggedItemId] || 0) + 1;
      setErrorCount((prev) => ({ ...prev, [draggedItemId]: currentErrors }));
      
      setFeedback({ type: 'error', message: '✗ 再想想？' });
      setTimeout(() => setFeedback(null), 1500);

      setShakingId(draggedItemId);
      setTimeout(() => setShakingId(null), 400);
    }
  };

  const resetGame = () => {
    setMatchedIds(new Set());
    setErrorCount({});
    setShuffledItems([...gameData].sort(() => Math.random() - 0.5));
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-full text-[#A0522D] font-serif text-xl">正在翻阅田野笔记...</div>;
  }

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-[#A0522D]/70 font-serif gap-4">
        <div className="text-6xl">📜</div>
        {/* 【修复 2】：使用 currentTitle */}
        <p className="text-xl">《{currentTitle}》暂无匹配游戏</p>
        <p className="text-sm text-[#333333]/50">请尝试其他章节，或期待后续更新</p>
      </div>
    );
  }

  const uniqueAnswers = Array.from(new Set(gameData.map((item) => item.answer)));
  const isCompleted = matchedIds.size === gameData.length && gameData.length > 0;

  return (
    <div className="w-full h-full bg-[#F5F0E6] rounded-lg p-4 overflow-hidden flex flex-col relative">
      
      {/* 顶部反馈提示 Toast */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`
              absolute top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-2 rounded-full shadow-xl font-serif text-sm
              ${feedback.type === 'success' ? 'bg-[#6B705C] text-[#F5F0E6]' : 'bg-[#A0522D] text-[#F5F0E6]'}
            `}
          >
            {feedback.message}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto w-full h-full flex flex-col">
        
        {/* 标题区 */}
        <div className="flex items-center justify-between mb-3 flex-shrink-0">
          <div>
            {/* 【修复 3】：使用 currentTitle */}
            <h2 className="text-xl font-serif font-bold text-[#A0522D]">
              《{currentTitle}》概念匹配
            </h2>
            <p className="text-xs text-[#333333]/60 mt-1 font-sans">将左侧现象拖拽至右侧对应概念</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-xs font-sans text-[#333333]/70">
              进度: <span className="font-bold text-[#6B705C]">{matchedIds.size}</span> / {gameData.length}
            </div>
            <button
              onClick={resetGame}
              className="px-3 py-1.5 bg-[#6B705C] text-[#F5F0E6] rounded hover:bg-[#5A5E4D] transition-colors text-xs font-serif"
            >
              重新开始
            </button>
          </div>
        </div>

        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="flex-1 flex flex-row gap-6 min-h-0 overflow-hidden">
            
            {/* 左侧：社会现象 */}
            <div className="w-1/2 flex flex-col min-h-0">
              <h3 className="text-sm font-serif font-bold text-[#333333]/80 mb-2 flex-shrink-0 border-b border-[#A0522D]/20 pb-1">
                社会现象 (拖拽此列)
              </h3>
              <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                {shuffledItems.map((item) => {
                  const isMatched = matchedIds.has(item.id);
                  const errors = errorCount[item.id] || 0;
                  const showHint = errors >= 3 && !isMatched;

                  return (
                    <DraggableCard 
                      key={item.id} 
                      id={item.id} 
                      isCorrect={isMatched} 
                      showHint={showHint}
                      isShaking={shakingId === item.id}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-serif text-[#333333]/80 flex-1 leading-relaxed">
                          {item.phenomenon}
                        </p>
                        {/* 【修复】：用 span 包裹图标，将 title 属性转移到 span 上，并加上 cursor-help 提示鼠标 */}
                        {showHint && (
                          <span title={item.hint} className="shrink-0 cursor-help">
                            <Lightbulb size={16} className="text-[#6B705C]" />
                          </span>
                        )}
                      </div>
                    </DraggableCard>
                  );
                })}
              </div>
            </div>

            {/* 右侧：核心概念 */}
            <div className="w-1/2 flex flex-col min-h-0">
              <h3 className="text-sm font-serif font-bold text-[#333333]/80 mb-2 flex-shrink-0 border-b border-[#A0522D]/20 pb-1">
                核心概念 (放置于此)
              </h3>
              <div className="flex-1 overflow-y-auto space-y-2 pl-2">
                {uniqueAnswers.map((answer) => {
                  const matchedItem = gameData.find(
                    (item) => item.answer === answer && matchedIds.has(item.id)
                  );
                  const isMatched = !!matchedItem;

                  return (
                    <DroppableZone
                      key={answer}
                      id={`zone-${answer}`}
                      label={answer}
                      isMatched={isMatched}
                      matchedItem={matchedItem}
                    />
                  );
                })}
              </div>
            </div>

          </div>

          <DragOverlay>
            {activeId && (
              <div className="p-3 bg-[#F2EFE9] border-2 border-[#A0522D] rounded-lg shadow-2xl opacity-90 max-w-xs">
                <p className="text-xs font-serif text-[#333333]/80">
                  {gameData.find((item) => item.id === activeId)?.phenomenon}
                </p>
              </div>
            )}
          </DragOverlay>
        </DndContext>

        {/* 底部恭喜提示 */}
        <AnimatePresence>
          {isCompleted && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20 }}
              className="mt-3 py-2 px-5 bg-[#6B705C] text-[#F5F0E6] rounded-full flex items-center justify-center gap-2 flex-shrink-0 shadow-lg self-center"
            >
              <Check size={18} className="text-[#F5F0E6]" />
              <span className="text-sm font-serif font-bold">
                恭喜完成本章概念匹配！
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}