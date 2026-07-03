'use client';

import { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Quote } from 'lucide-react';
import { useStore } from '@/store/useStore';

interface GraphData {
  nodes: any[];
  links: any[];
  categories: any[];
}

// 简单的打字机 Hook
function useTypewriter(text: string, speed: number = 50) {
  const [displayedText, setDisplayedText] = useState('');
  useEffect(() => {
    if (!text) {
      setDisplayedText('');
      return;
    }
    let i = 0;
    setDisplayedText('');
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayedText(text.substring(0, i + 1));
        i++;
      } else {
        clearInterval(timer);
      }
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);
  return displayedText;
}

export default function ConceptGraph() {
  const [data, setData] = useState<GraphData | null>(null);
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);
  
  const { activeChapterDetail, loadChapterDetail } = useStore();

  // 1. 加载图谱数据
  useEffect(() => {
    fetch('/data/graph.json')
      .then(res => res.json())
      .then(setData)
      .catch(err => console.error('Failed to load graph:', err));
  }, []);

  // 2. 当选中章节时，加载章节详情
  useEffect(() => {
    if (selectedChapterId && selectedChapterId !== 'ch00') {
      loadChapterDetail(selectedChapterId);
    }
  }, [selectedChapterId, loadChapterDetail]);

  // 3. 初始化 ECharts (核心修复：只在 data 加载后初始化一次，不再依赖 selectedChapterId)
  useEffect(() => {
    if (!data || !chartRef.current) return;

    const initChart = () => {
      if (!chartRef.current || chartRef.current.clientWidth === 0) return;
      if (chartInstance.current) chartInstance.current.dispose();

      try {
        const chart = echarts.init(chartRef.current);
        chartInstance.current = chart;

        const option = {
          backgroundColor: 'transparent',
          tooltip: { 
            trigger: 'item', 
            backgroundColor: '#F5F0E6', 
            borderColor: '#A0522D', 
            textStyle: { color: '#333', fontFamily: 'serif' } 
          },
          legend: [{ 
            data: data.categories.map(c => c.name),
            textStyle: { color: '#333', fontFamily: 'serif' }
          }],
          series: [{
            type: 'graph', layout: 'force', data: data.nodes, links: data.links, categories: data.categories,
            roam: true, draggable: true,
            force: { repulsion: 300, edgeLength: [100, 200], gravity: 0.1 },
            label: { show: true, position: 'right', formatter: '{b}', color: '#333', fontFamily: 'serif' },
            itemStyle: { color: '#6B705C', borderColor: '#A0522D', borderWidth: 2 },
            lineStyle: { color: '#A0522D', opacity: 0.6, width: 2 },
            emphasis: { focus: 'adjacency', lineStyle: { width: 4 }, itemStyle: { borderWidth: 4 } }
          }]
        };

        chart.setOption(option, true);

        chart.on('click', (params: any) => {
          if (params.dataType === 'node' && params.data.chapterId) {
            setSelectedChapterId(params.data.chapterId);
          }
        });
      } catch (error) {
        console.error('ECharts init error:', error);
      }
    };

    const rafId = requestAnimationFrame(initChart);

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
          if (chartInstance.current) {
            chartInstance.current.resize();
          } else {
            initChart();
          }
        }
      }
    });

    if (chartRef.current) resizeObserver.observe(chartRef.current);

    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      chartInstance.current?.dispose();
      chartInstance.current = null;
    };
  }, [data]); // 注意：这里只依赖 data，确保图表只初始化一次

  // 4. 处理返回操作
  const handleBack = () => {
    setSelectedChapterId(null);
    // 返回时手动触发一次 resize，确保图谱完美适配
    setTimeout(() => chartInstance.current?.resize(), 100); 
  };

  // 打字机效果
  const quoteText = activeChapterDetail?.quotes?.[0]?.text || '';
  const typedQuote = useTypewriter(selectedChapterId ? quoteText : '', 60);

  if (!data) {
    return <div className="flex items-center justify-center h-full text-[#A0522D] font-serif">加载概念图谱中...</div>;
  }

  return (
    <div className="relative w-full h-full overflow-hidden rounded-md">
      {/* 【核心】：ECharts 容器永远存在，不被 AnimatePresence 销毁 */}
      <div ref={chartRef} className="w-full h-full" />
      
      {/* 底部提示 */}
      {!selectedChapterId && (
        <div className="absolute bottom-4 left-4 bg-[#333]/80 text-[#F5F0E6] text-xs px-3 py-1.5 rounded-full pointer-events-none z-[5]">
          点击节点探索概念详情
        </div>
      )}

      {/* 【覆盖层】：详情卡片作为 Overlay 盖在图谱上方 */}
      <AnimatePresence>
        {selectedChapterId && (
          <motion.div
            key="detail-overlay"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute inset-0 z-10 bg-[#FDFBF7] flex flex-col overflow-hidden"
            style={{
              backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, #E8E0D0 31px, #E8E0D0 32px)',
            }}
          >
            {/* 返回按钮 */}
            <button
              onClick={handleBack}
              className="absolute top-4 left-4 z-20 flex items-center gap-2 px-4 py-2 bg-[#F2EFE9] border border-[#A0522D] rounded-full hover:bg-[#A0522D] hover:text-[#F5F0E6] transition-colors text-sm font-serif text-[#A0522D] shadow-md"
            >
              <ArrowLeft size={16} /> 返回图谱
            </button>

            <div className="flex-1 flex flex-col md:flex-row p-8 pt-16 gap-8 overflow-y-auto">
              {/* 左侧 40%：概念隐喻插画 */}
              <div className="w-full md:w-2/5 flex items-center justify-center bg-[#F2EFE9] rounded-lg border-2 border-dashed border-[#A0522D]/30 p-8">
                <div className="text-center">
                  <div className="text-8xl mb-4">
                    {selectedChapterId === 'ch04' ? '🌊' : selectedChapterId === 'ch01' ? '🌾' : '📜'}
                  </div>
                  <h3 className="text-2xl font-serif font-bold text-[#A0522D]">
                    {activeChapterDetail?.core_concept || '概念隐喻'}
                  </h3>
                  <p className="text-sm text-ink/60 mt-2 font-sans leading-relaxed">
                    {activeChapterDetail?.summary || '加载中...'}
                  </p>
                </div>
              </div>

              {/* 右侧 60%：费孝通金句 */}
              <div className="w-full md:w-3/5 flex flex-col justify-center relative">
                <Quote size={48} className="absolute top-0 left-0 text-[#A0522D]/20" />
                <div className="pl-12">
                  <h2 className="text-xl font-serif font-bold text-[#333] mb-6 border-b border-[#A0522D]/30 pb-2">
                    {activeChapterDetail?.title || ''} · 经典原音
                  </h2>
                  <p className="text-lg font-kai text-[#333] leading-relaxed min-h-[100px]">
                    {typedQuote}
                    <span className="animate-pulse text-[#A0522D]">|</span>
                  </p>
                  {typedQuote === quoteText && quoteText && (
                    <p className="text-xs text-ink/40 mt-4 text-right font-sans">
                      —— 摘自第 {activeChapterDetail?.quotes?.[0]?.page} 页
                    </p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}