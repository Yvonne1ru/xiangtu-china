import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type MainTab = 'graph' | 'scene' | 'timeline' | 'game' | 'logic' | 'rhetoric'; // 顺便把逻辑拆解和修辞赏析也补全
export type RightTab = 'insights' | 'comparison' | 'exams' | 'debate'; // <--- 补全右侧 Tab

interface Chapter { id: string; title: string; }
interface ChapterDetail extends Chapter {
  core_concept: string; summary: string; key_arguments: string[];
  field_cases: string[]; modern_evolution: string; related_concepts: string[];
  quotes: Array<{ text: string; page: number }>; debates: string[];
}
interface UserNote { id: string; chapterId: string; content: string; timestamp: number; }

interface AppState {
  activeChapterId: string;
  chapterList: Chapter[];
  activeChapterDetail: ChapterDetail | null;
  isSidebarOpen: boolean; 
  mainTab: MainTab;
  rightTab: RightTab;
  userNotes: UserNote[];
  
  // 【新增】：阅读进度状态
  completedChapters: string[];

  setActiveChapter: (id: string) => void;
  setChapterList: (chapters: Chapter[]) => void;
  setChapterDetail: (detail: ChapterDetail | null) => void;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  setMainTab: (tab: MainTab) => void;
  setRightTab: (tab: RightTab) => void;
  
  // 【新增】：切换章节完成状态
  toggleChapterCompletion: (id: string) => void;

  addNote: (chapterId: string, content: string) => void;
  updateNote: (id: string, content: string) => void;
  deleteNote: (id: string) => void;

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
      userNotes: [],
      
      completedChapters: [], // 初始为空数组

      setActiveChapter: (id) => set({ activeChapterId: id }),
      setChapterList: (chapters) => set({ chapterList: chapters }),
      setChapterDetail: (detail) => set({ activeChapterDetail: detail }),
      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      closeSidebar: () => set({ isSidebarOpen: false }),
      setMainTab: (tab) => set({ mainTab: tab }),
      setRightTab: (tab) => set({ rightTab: tab }),
      
      // 【新增】：如果已存在则移除，不存在则加入
      toggleChapterCompletion: (id) => set((state) => ({
        completedChapters: state.completedChapters.includes(id)
          ? state.completedChapters.filter(chId => chId !== id)
          : [...state.completedChapters, id]
      })),

      addNote: (chapterId, content) => {
        const newNote: UserNote = { id: `note_${Date.now()}`, chapterId, content, timestamp: Date.now() };
        set((state) => ({ userNotes: [...state.userNotes, newNote] }));
      },
      updateNote: (id, content) => {
        set((state) => ({ userNotes: state.userNotes.map((note) => note.id === id ? { ...note, content, timestamp: Date.now() } : note) }));
      },
      deleteNote: (id) => {
        set((state) => ({ userNotes: state.userNotes.filter((note) => note.id !== id) }));
      },

      loadChapterList: async () => {
        try {
          const res = await fetch('/data/chapters/index.json');
          if (!res.ok) throw new Error(`Failed to load index.json: ${res.status}`);
          set({ chapterList: await res.json() });
        } catch (error) { console.error('🔴 [Store Error]', error); }
      },
      loadChapterDetail: async (id) => {
        try {
          const res = await fetch(`/data/chapters/${id}.json`);
          if (!res.ok) { console.warn(`[Store] Chapter ${id} not found.`); return; }
          set({ activeChapterDetail: await res.json() });
        } catch (error) { console.error('🔴 [Store Error]', error); }
      },
    }),
    {
      name: 'xiangtu-storage',
      // 【修改】：将 completedChapters 加入持久化白名单
      partialize: (state) => ({ 
        activeChapterId: state.activeChapterId, 
        mainTab: state.mainTab, 
        rightTab: state.rightTab,
        userNotes: state.userNotes,
        completedChapters: state.completedChapters // 保存阅读进度
      }),
    }
  )
);