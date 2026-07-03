'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Edit2, Trash2, Copy, Download, Check } from 'lucide-react';
import { useStore } from '@/store/useStore';

interface FieldNotebookProps {
  isOpen: boolean;
  onClose: () => void;
}

// 【新增】：筛选标签组件
function FilterTag({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`
        px-2.5 py-1 text-[10px] font-sans rounded-full border transition-all duration-200 whitespace-nowrap
        ${selected 
          ? 'bg-[#6B705C] text-[#F5F0E6] border-[#6B705C] shadow-sm' 
          : 'bg-transparent text-ink/60 border-[#A0522D]/20 hover:bg-[#A0522D]/5 hover:border-[#A0522D]/40'
        }
      `}
    >
      {label}
    </button>
  );
}

export default function FieldNotebook({ isOpen, onClose }: FieldNotebookProps) {
  const { userNotes, chapterList, activeChapterId, addNote, updateNote, deleteNote } = useStore();
  
  // 表单状态
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteChapterId, setNewNoteChapterId] = useState(activeChapterId || 'general');
  
  // 【核心修改】：多选筛选状态，默认为 ['all']
  const [selectedFilters, setSelectedFilters] = useState<string[]>(['all']);
  
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) setNewNoteChapterId(activeChapterId || 'general');
  }, [isOpen, activeChapterId]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // 【核心修改】：多选筛选逻辑
  const toggleFilter = (id: string) => {
    if (id === 'all') {
      setSelectedFilters(['all']);
    } else {
      setSelectedFilters(prev => {
        // 如果已选中，则取消；如果未选中，则加入，并移除 'all'
        const newFilters = prev.includes(id) 
          ? prev.filter(f => f !== id) 
          : [...prev.filter(f => f !== 'all'), id];
        // 如果取消到空，自动恢复为 'all'
        return newFilters.length === 0 ? ['all'] : newFilters;
      });
    }
  };

  // 根据多选条件过滤笔记
  const filteredNotes = useMemo(() => {
    let notes = [...userNotes].sort((a, b) => b.timestamp - a.timestamp);
    if (!selectedFilters.includes('all')) {
      notes = notes.filter(note => selectedFilters.includes(note.chapterId));
    }
    return notes;
  }, [userNotes, selectedFilters]);

  const getChapterTitle = (chapterId: string) => {
    if (chapterId === 'general') return '通用笔记';
    const index = chapterList.findIndex(ch => ch.id === chapterId);
    return index !== -1 ? `${String(index + 1).padStart(2, '0')} ${chapterList[index].title}` : '未知章节';
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('zh-CN', {
      year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
    });
  };

  // 获取当前筛选条件的文本描述（用于导出）
  const getFilterTitle = () => {
    if (selectedFilters.includes('all')) return '全部笔记';
    return selectedFilters.map(id => getChapterTitle(id)).join('、');
  };

  // --- 业务逻辑 ---

  const handleAddNote = () => {
    if (!newNoteContent.trim()) return;
    addNote(newNoteChapterId, newNoteContent);
    setNewNoteContent('');
    setIsAdding(false);
    setToast('✓ 笔记已保存');
  };

  const handleUpdateNote = (id: string) => {
    if (!editContent.trim()) return;
    updateNote(id, editContent);
    setEditingId(null);
    setEditContent('');
    setToast('✓ 笔记已更新');
  };

  const startEditing = (id: string, content: string) => {
    setEditingId(id);
    setEditContent(content);
  };

  const formatNotesToText = () => {
    if (filteredNotes.length === 0) return '暂无笔记内容';
    
    let text = `《乡土中国》田野笔记\n`;
    text += `导出时间：${new Date().toLocaleString('zh-CN')}\n`;
    text += `筛选范围：${getFilterTitle()}\n`;
    text += `========================================\n\n`;

    filteredNotes.forEach(note => {
      text += `【${getChapterTitle(note.chapterId)}】 ${formatDate(note.timestamp)}\n`;
      text += `${note.content}\n\n`;
      text += `----------------------------------------\n\n`;
    });

    return text;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formatNotesToText());
      setToast('✓ 已复制到剪贴板');
    } catch (err) {
      setToast('✗ 复制失败');
    }
  };

  const handleExport = () => {
    const text = formatNotesToText();
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `乡土中国_田野笔记_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setToast('✓ 导出成功');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-40" onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 lg:inset-10 z-50 bg-[#FDFBF7] border-2 border-[#A0522D] rounded-lg shadow-2xl flex flex-col overflow-hidden"
            style={{
              backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, #E8E0D0 31px, #E8E0D0 32px)',
            }}
          >
            {/* 头部 */}
            <div className="flex items-center justify-between p-4 lg:p-6 border-b-2 border-[#A0522D] bg-[#F2EFE9] flex-shrink-0">
              <div>
                <h2 className="text-xl lg:text-2xl font-serif font-bold text-[#A0522D]">我的田野笔记</h2>
                <p className="text-xs text-ink/60 mt-1 font-sans">记录你的思考与洞察</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-earth/10 rounded transition-colors">
                <X size={24} className="text-ink/70" />
              </button>
            </div>

            {/* 【核心修改】：工具栏 - 多选标签组与操作按钮 */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-[#A0522D]/20 bg-[#FDFBF7]/80 flex-shrink-0">
              {/* 左侧：多选筛选标签 */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-sans text-ink/50 mr-1">筛选：</span>
                <FilterTag label="全部" selected={selectedFilters.includes('all')} onClick={() => toggleFilter('all')} />
                <FilterTag label="通用" selected={selectedFilters.includes('general')} onClick={() => toggleFilter('general')} />
                {chapterList.map((ch, idx) => (
                  <FilterTag 
                    key={ch.id} 
                    label={`${String(idx + 1).padStart(2, '0')} ${ch.title}`} 
                    selected={selectedFilters.includes(ch.id)} 
                    onClick={() => toggleFilter(ch.id)} 
                  />
                ))}
              </div>

              {/* 右侧：操作按钮 */}
              <div className="flex items-center gap-2 shrink-0">
                <button 
                  onClick={handleCopy}
                  disabled={filteredNotes.length === 0}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-sans border border-[#6B705C]/50 text-[#6B705C] rounded hover:bg-[#6B705C]/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Copy size={12} /> 复制
                </button>
                <button 
                  onClick={handleExport}
                  disabled={filteredNotes.length === 0}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-sans bg-[#6B705C] text-[#F5F0E6] rounded hover:bg-[#5A5E4D] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download size={12} /> 导出 TXT
                </button>
              </div>
            </div>

            {/* 内容区 */}
            <div className="flex-1 overflow-y-auto p-4 lg:p-6">
              {!isAdding && (
                <button
                  onClick={() => setIsAdding(true)}
                  className="w-full mb-6 p-3 border-2 border-dashed border-field/40 rounded-lg hover:border-field hover:bg-field/5 transition-all flex items-center justify-center gap-2 text-field font-serif text-sm"
                >
                  <Plus size={18} />
                  <span>添加新笔记</span>
                </button>
              )}

              {isAdding && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                  className="mb-6 p-4 bg-paper border-2 border-field rounded-lg"
                >
                  <div className="mb-3 flex items-center gap-2">
                    <span className="text-xs font-sans text-ink/70">所属章节：</span>
                    <select 
                      value={newNoteChapterId}
                      onChange={(e) => setNewNoteChapterId(e.target.value)}
                      className="text-xs font-serif border border-field/50 rounded px-2 py-1 bg-[#F5F0E6] text-ink focus:outline-none focus:border-field"
                    >
                      <option value="general">通用笔记</option>
                      {chapterList.map((ch, idx) => (
                        <option key={ch.id} value={ch.id}>
                          {String(idx + 1).padStart(2, '0')} {ch.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <textarea
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                    placeholder="写下你的思考..."
                    className="w-full h-32 p-3 bg-transparent border-none resize-none focus:outline-none font-kai text-ink/80 text-sm leading-relaxed"
                    autoFocus
                  />
                  <div className="flex gap-2 mt-3">
                    <button onClick={handleAddNote} className="px-4 py-1.5 bg-field text-paper rounded hover:bg-field-dark transition-colors text-xs font-sans">保存</button>
                    <button onClick={() => { setIsAdding(false); setNewNoteContent(''); }} className="px-4 py-1.5 bg-ink/10 text-ink/70 rounded hover:bg-ink/20 transition-colors text-xs font-sans">取消</button>
                  </div>
                </motion.div>
              )}

              {filteredNotes.length === 0 ? (
                <div className="text-center py-12 text-ink/50 font-serif text-sm">
                  {userNotes.length === 0 ? '还没有笔记，开始记录你的思考吧！' : '当前筛选条件下暂无笔记'}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredNotes.map((note) => (
                    <motion.div
                      key={note.id}
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-paper border-l-4 border-field rounded-r-lg shadow-sm"
                    >
                      {editingId === note.id ? (
                        <div>
                          <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="w-full h-24 p-2 bg-transparent border border-field/30 rounded resize-none focus:outline-none font-kai text-ink/80 text-sm"
                            autoFocus
                          />
                          <div className="flex gap-2 mt-2">
                            <button onClick={() => handleUpdateNote(note.id)} className="px-3 py-1 bg-field text-paper rounded text-xs hover:bg-field-dark transition-colors">保存</button>
                            <button onClick={() => setEditingId(null)} className="px-3 py-1 bg-ink/10 text-ink/70 rounded text-xs hover:bg-ink/20 transition-colors">取消</button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="px-1.5 py-0.5 bg-field/10 text-field text-[10px] font-sans rounded border border-field/20">
                                  {getChapterTitle(note.chapterId)}
                                </span>
                                <span className="text-[10px] text-ink/40 font-sans">{formatDate(note.timestamp)}</span>
                              </div>
                              <p className="font-kai text-ink/80 leading-relaxed whitespace-pre-wrap text-sm">
                                {note.content}
                              </p>
                            </div>
                            <div className="flex gap-1 shrink-0">
                              <button onClick={() => startEditing(note.id, note.content)} className="p-1.5 hover:bg-field/10 rounded transition-colors" title="编辑">
                                <Edit2 size={14} className="text-field" />
                              </button>
                              <button onClick={() => { if(confirm('确定删除这条笔记吗？')) deleteNote(note.id); }} className="p-1.5 hover:bg-earth/10 rounded transition-colors" title="删除">
                                <Trash2 size={14} className="text-earth" />
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Toast 提示 */}
            <AnimatePresence>
              {toast && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
                  className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-[#333] text-[#F5F0E6] text-xs font-sans rounded-full shadow-lg flex items-center gap-2"
                >
                  <Check size={14} /> {toast}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}