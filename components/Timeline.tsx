'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface TimelineEvent {
  year: string;
  title: string;
  event: string;
  historical: string;
  modern: string;
}

export default function Timeline() {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);

  useEffect(() => {
    fetch('/data/timeline.json')
      .then(res => res.json())
      .then(setEvents)
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="relative w-full h-full bg-[#F5F0E6] flex flex-col overflow-hidden rounded-md">
      {/* 标题区 */}
      <div className="p-4 border-b border-[#A0522D]/20 flex-shrink-0">
        <h2 className="text-xl font-serif font-bold text-[#A0522D]">社会变迁时间线</h2>
        <p className="text-xs text-[#333333]/60 mt-1 font-sans">从乡土中国到现代社会的演变轨迹</p>
      </div>

      {/* 垂直时间线区域 */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="relative max-w-3xl mx-auto">
          
          {/* 垂直轴线 (精确对齐圆圈中心) */}
          <div className="absolute left-[19px] top-0 bottom-0 w-0.5 bg-[#A0522D]/30" />

          {/* 节点列表 (使用 space-y-6 紧凑排布) */}
          <div className="space-y-6">
            {events.map((event, idx) => (
              <div key={idx} className="relative flex items-start gap-6 pl-12 group">
                
                {/* 时间圆圈 (压在轴线上) */}
                <button
                  onClick={() => setSelectedEvent(event)}
                  className="absolute left-0 w-10 h-10 rounded-full bg-[#F2EFE9] border-2 border-[#A0522D] flex items-center justify-center transition-all hover:scale-110 hover:bg-[#A0522D] hover:text-[#F5F0E6] shadow-md z-10"
                >
                  <span className="text-[10px] font-bold font-sans leading-none text-center">
                    {event.year}
                  </span>
                </button>
                
                {/* 内容卡片 (点击也可展开详情) */}
                <div 
                  onClick={() => setSelectedEvent(event)}
                  className="flex-1 p-3 bg-[#FDFBF7] border border-[#A0522D]/20 rounded-lg cursor-pointer hover:border-[#A0522D] hover:shadow-md transition-all"
                >
                  <h3 className="text-base font-serif font-bold text-[#333333]/80 mb-1">{event.title}</h3>
                  <p className="text-xs text-[#333333]/60 leading-relaxed line-clamp-2">{event.event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 现代对照卡片弹窗 (优化了尺寸和间距) */}
      <AnimatePresence>
        {selectedEvent && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black z-10" 
              onClick={() => setSelectedEvent(null)} 
            />
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.9 }}
              className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-3xl z-20 bg-[#FDFBF7] border-2 border-[#A0522D] rounded-lg shadow-2xl overflow-hidden"
            >
              <div className="p-3 bg-[#A0522D] text-[#F5F0E6] flex justify-between items-center">
                <h3 className="text-base font-serif font-bold">{selectedEvent.year} · {selectedEvent.title}</h3>
                <button onClick={() => setSelectedEvent(null)}><X size={18} /></button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#A0522D]/20">
                <div className="p-4 bg-[#A0522D]/5">
                  <h4 className="text-xs font-bold text-[#A0522D] mb-2 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#A0522D]"></span> 历史乡土 (原文语境)
                  </h4>
                  <p className="text-xs font-serif text-[#333333]/80 leading-relaxed">{selectedEvent.historical}</p>
                </div>
                <div className="p-4 bg-[#6B705C]/5">
                  <h4 className="text-xs font-bold text-[#6B705C] mb-2 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#6B705C]"></span> 当代演化 (现实映射)
                  </h4>
                  <p className="text-xs font-serif text-[#333333]/80 leading-relaxed">{selectedEvent.modern}</p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}