import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '美国经济监测仪表盘',
  description: '实时追踪美国关键经济指标、美联储政策动向及市场影响分析',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="bg-dashboard-bg text-text-primary min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
