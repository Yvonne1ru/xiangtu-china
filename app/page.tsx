import Sidebar from '@/components/Sidebar';
import MainArea from '@/components/MainArea';
import RightPanel from '@/components/RightPanel';
import MobileHeader from '@/components/MobileHeader';

export default function Home() {
  return (
    // 全局垂直容器 (处理 MobileHeader 和下方内容区的上下分配)
    <main className="flex flex-col h-screen w-screen overflow-hidden bg-paper text-ink font-serif">
      <MobileHeader />
      
      {/* 下方水平容器 (左侧固定 + 中间自适应 + 右侧悬浮) */}
      <div className="flex flex-1 min-h-0 w-full relative">
        <Sidebar />
        <MainArea />
        <RightPanel />
      </div>
    </main>
  );
}