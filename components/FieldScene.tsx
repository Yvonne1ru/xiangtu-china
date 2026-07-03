'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Hotspot {
  id: string;
  x: string;
  y: string;
  label: string;
  related_concept: string;
  description: string;
}

interface SceneData {
  scene_id: string;
  image_url: string;
  hotspots: Hotspot[];
}

export default function FieldScene() {
  const [data, setData] = useState<SceneData | null>(null);
  const [activeHotspot, setActiveHotspot] = useState<Hotspot | null>(null);
  
  // 缩放与拖拽状态
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/data/scenes/village.json')
      .then(res => res.json())
      .then(setData);
  }, []);

  // 滚轮缩放
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setScale(prev => Math.min(Math.max(0.5, prev + delta), 3));
  };

  // 拖拽逻辑
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.hotspot-btn')) return; // 点击热区不触发拖拽
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  if (!data) return <div className="flex items-center justify-center h-full text-[#A0522D]">加载田野场景中...</div>;

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full overflow-hidden cursor-grab active:cursor-grabbing rounded-md"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* 可缩放/拖拽的地图层 */}
      <div 
        className="absolute inset-0 origin-center transition-transform duration-100 ease-out"
        style={{ 
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          width: '100%',
          height: '100%'
        }}
      >
        <img 
          src={data.image_url} 
          alt="Village Map" 
          className="w-full h-full object-contain pointer-events-none select-none"
          draggable="false"
        />
        
        {/* 热区渲染 */}
        {data.hotspots.map(hs => (
          <button
            key={hs.id}
            className="hotspot-btn absolute group"
            style={{ left: hs.x, top: hs.y, transform: 'translate(-50%, -50%)' }}
            onClick={(e) => { e.stopPropagation(); setActiveHotspot(hs); }}
          >
            {/* 闪烁光点 */}
            <span className="relative flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#A0522D] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-[#A0522D] border-2 border-[#F5F0E6]"></span>
            </span>
            {/* 悬浮标签 */}
            <span className="absolute bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-[#333] text-[#F5F0E6] text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity font-serif">
              {hs.label}
            </span>
          </button>
        ))}
      </div>

      {/* 田野笔记弹窗 */}
      <AnimatePresence>
        {activeHotspot && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 20 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 p-6 z-20 shadow-2xl"
            style={{
              backgroundColor: '#FDFBF7',
              backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, #E8E0D0 31px, #E8E0D0 32px)',
              border: '1px solid #A0522D',
              fontFamily: 'cursive, "Kaiti", serif' // 手写体
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute -top-3 left-4 bg-[#6B705C] text-[#F5F0E6] text-xs px-2 py-1 rounded font-sans">
              {activeHotspot.related_concept}
            </div>
            <h3 className="text-xl font-bold text-[#A0522D] mb-4 mt-2 border-b border-dashed border-[#A0522D] pb-2">
              {activeHotspot.label}
            </h3>
            <p className="text-[#333] leading-relaxed text-base">
              {activeHotspot.description}
            </p>
            <button 
              onClick={() => setActiveHotspot(null)}
              className="mt-4 w-full py-2 bg-[#6B705C] text-[#F5F0E6] rounded hover:bg-[#5A5E4D] transition-colors font-sans text-sm"
            >
              收起笔记
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 缩放提示 */}
      <div className="absolute bottom-4 right-4 bg-[#333]/80 text-[#F5F0E6] text-xs px-3 py-1.5 rounded-full font-sans pointer-events-none">
        滚轮缩放 / 拖拽漫游
      </div>
    </div>
  );
}