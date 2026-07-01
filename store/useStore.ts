import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type MainTab = 'graph' | 'scene' | 'timeline' | 'game';
export type RightTab = 'insights' | 'comparison';

interface Chapter { id: string; title: string; }
interface ChapterDetail extends Chapter {
  coreConcept: string; summary: string; keyArguments: string[];
  fieldCases: string[]; modernEvolution: string; relatedConcepts: string[];
  quotes: Array<{ text: string; page: number }>; debates: string[];
}

interface AppState {
  activeChapterId: string;
  chapterList: Chapter[];
  activeChapterDetail: ChapterDetail | null;
  isSidebarOpen: boolean;
  mainTab: MainTab;
  rightTab: RightTab;
  
  setActiveChapter: (id: string) => void;
  setChapterList: (chapters: Chapter[]) => void;
  setChapterDetail: (detail: ChapterDetail | null) => void;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  setMainTab: (tab: MainTab) => void;
  setRightTab: (tab: RightTab) => void;
  
  loadChapterList: () => Promise<void>;
  loadChapterDetail: (id: string) => Promise<void>;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      activeChapterId: 'ch04',
      chapterList: [],
      activeChapterDetail: null,
      isSidebarOpen: false,
      mainTab: 'graph',
      rightTab: 'insights',

      setActiveChapter: (id) => set({ activeChapterId: id }),
      setChapterList: (chapters) => set({ chapterList: chapters }),
      setChapterDetail: (detail) => set({ activeChapterDetail: detail }),
      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      closeSidebar: () => set({ isSidebarOpen: false }),
      setMainTab: (tab) => set({ mainTab: tab }),
      setRightTab: (tab) => set({ rightTab: tab }),

      // 直接请求根路径下的静态资源
      loadChapterList: async () => {
        try {
          const res = await fetch('/data/chapters/index.json');
          const data = await res.json();
          set({ chapterList: data });
        } catch (error) { console.error('Failed to load chapter list:', error); }
      },

      loadChapterDetail: async (id) => {
        try {
          const res = await fetch(`/data/chapters/${id}.json`);
          const data = await res.json();
          set({ activeChapterDetail: data });
        } catch (error) { console.error(`Failed to load chapter ${id}:`, error); }
      },
    }),
    {
      name: 'xiangtu-storage',
      partialize: (state) => ({ activeChapterId: state.activeChapterId, mainTab: state.mainTab, rightTab: state.rightTab }),
    }
  )
);