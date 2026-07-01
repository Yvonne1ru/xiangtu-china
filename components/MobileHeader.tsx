'use client';
import { Menu, X } from 'lucide-react';
import { useStore } from '@/store/useStore';

export default function MobileHeader() {
  const { isSidebarOpen, toggleSidebar } = useStore();
  return (
    <header className="lg:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-paper/90 backdrop-blur-md border-b border-earth/20 flex items-center px-4">
      <button onClick={toggleSidebar} className="p-2 retro-border hover:bg-field/10 transition-colors text-ink">
        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>
      <h1 className="flex-1 text-center text-lg font-serif font-bold text-ink">乡土中国</h1>
      <div className="w-9"></div> {/* 占位保持标题居中 */}
    </header>
  );
}