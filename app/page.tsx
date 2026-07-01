import Sidebar from '@/components/Sidebar';
import MainArea from '@/components/MainArea';
import RightPanel from '@/components/RightPanel';
import MobileHeader from '@/components/MobileHeader';

export default function Home() {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-paper text-ink font-serif">
      <MobileHeader />
      <Sidebar />
      <MainArea />
      <RightPanel />
    </div>
  );
}