'use client';

export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 border-2 border-dashboard-border border-t-accent-blue rounded-full animate-spin" />
      <div className="text-text-secondary text-sm">正在加载经济数据...</div>
    </div>
  );
}
