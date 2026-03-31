'use client';

import { TruthPost } from '@/lib/types';

interface TruthFeedProps {
  posts: TruthPost[];
}

function timeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return '刚刚';
  if (diffMins < 60) return `${diffMins}分钟前`;
  if (diffHours < 24) return `${diffHours}小时前`;
  if (diffDays < 7) return `${diffDays}天前`;
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
}

function PostCard({ post }: { post: TruthPost }) {
  return (
    <div className="border border-dashboard-border rounded-lg p-3 bg-dashboard-card-alt hover:border-dashboard-border-light transition-colors">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 rounded-full bg-[#1a3a5c] border border-[#2a5a8a] flex items-center justify-center shrink-0">
          <span className="text-[10px] font-bold text-[#4d9fff]">T</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-xs font-semibold text-text-primary truncate">Donald J. Trump</div>
          <div className="text-[10px] text-text-muted">@realDonaldTrump</div>
        </div>
        <span className="text-[10px] text-text-muted shrink-0">{timeAgo(post.date)}</span>
      </div>

      {/* Content */}
      <p className="text-xs text-text-secondary leading-relaxed line-clamp-4">
        {post.content}
      </p>

      {/* Footer */}
      <div className="mt-2 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-[#e2341d]" />
          <span className="text-[10px] text-text-muted">Truth Social</span>
        </div>
        <a
          href={post.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] text-accent-blue hover:text-accent-blue/80 transition-colors"
        >
          查看原文 →
        </a>
      </div>
    </div>
  );
}

export default function TruthFeed({ posts }: TruthFeedProps) {
  return (
    <section className="bg-dashboard-card border border-dashboard-border rounded-lg p-4 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-1 h-5 rounded-full bg-[#e2341d]" />
          <h2 className="text-sm font-semibold text-text-primary">Truth Social</h2>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="live-indicator w-1.5 h-1.5 rounded-full bg-accent-green" />
          <a
            href="https://truthsocial.com/@realDonaldTrump"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-text-muted hover:text-text-secondary transition-colors"
          >
            @realDonaldTrump
          </a>
        </div>
      </div>

      {/* Posts */}
      <div className="space-y-3 overflow-y-auto flex-1">
        {posts.length === 0 ? (
          <div className="text-center py-8 text-text-muted text-xs">暂无动态</div>
        ) : (
          posts.map((post) => <PostCard key={post.id} post={post} />)
        )}
      </div>
    </section>
  );
}
