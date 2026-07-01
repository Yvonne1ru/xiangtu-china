import type { Metadata } from 'next';
import { Noto_Serif_SC, Noto_Sans_SC } from 'next/font/google';
import './globals.css';

// 加载字体并导出 CSS 变量
const notoSerif = Noto_Serif_SC({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-serif', // 对应 CSS 中的 --font-serif
  display: 'swap',
});

const notoSans = Noto_Sans_SC({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-sans', // 对应 CSS 中的 --font-sans
  display: 'swap',
});

export const metadata: Metadata = {
  title: '《乡土中国》沉浸式交互读本',
  description: '费孝通社会学经典的数字化探索之旅',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" className={`${notoSerif.variable} ${notoSans.variable}`}>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}