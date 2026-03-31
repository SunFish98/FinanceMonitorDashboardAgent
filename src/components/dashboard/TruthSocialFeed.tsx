'use client';

import { TruthPost } from '@/lib/types';

interface TruthSocialFeedProps {
  posts: TruthPost[];
  isLoading: boolean;
  source: string;
}

function timeAgo(dateString: string): string {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const m = Math.floor(diffMs / 60000);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (m < 1) return '刚刚';
  if (m < 60) return `${m}分钟前`;
  if (h < 24) return `${h}小时前`;
  if (d < 7) return `${d}天前`;
  return new Date(dateString).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
}

function PostCard({ post }: { post: TruthPost }) {
  return (
    <div className="border border-dashboard-border rounded-lg p-3 bg-dashboard-card-alt hover:border-dashboard-border-light transition-colors">
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
      <p className="text-xs text-text-secondary leading-relaxed line-clamp-4">{post.content}</p>
      <div className="mt-2 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-[#e2341d]" />
          <span className="text-[10px] text-text-muted">Truth Social</span>
        </div>
        <a href={post.url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-accent-blue hover:underline transition-colors">
          查看原文 →
        </a>
      </div>
    </div>
  );
}

function SkeletonPost() {
  return (
    <div className="animate-pulse border border-dashboard-border rounded-lg p-3 bg-dashboard-card-alt">
      <div className="flex gap-2 mb-2">
        <div className="w-7 h-7 rounded-full bg-dashboard-border" />
        <div className="flex-1 space-y-1">
          <div className="h-3 bg-dashboard-border rounded w-3/4" />
          <div className="h-2 bg-dashboard-border rounded w-1/2" />
        </div>
      </div>
      <div className="space-y-1">
        <div className="h-2 bg-dashboard-border rounded" />
        <div className="h-2 bg-dashboard-border rounded w-5/6" />
        <div className="h-2 bg-dashboard-border rounded w-4/6" />
      </div>
    </div>
  );
}

export default function TruthSocialFeed({ posts, isLoading, source }: TruthSocialFeedProps) {
  return (
    <section className="bg-dashboard-card border border-dashboard-border rounded-lg p-4 flex flex-col" style={{ maxHeight: '85vh' }}>
      <div className="flex items-center justify-between mb-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-1 h-5 rounded-full bg-[#e2341d]" />
          <h2 className="text-sm font-semibold text-text-primary">Truth Social</h2>
          {source === 'live' && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent-green/10 text-accent-green border border-accent-green/20">实时</span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <div className="live-indicator w-1.5 h-1.5 rounded-full bg-accent-green" />
          <a href="https://truthsocial.com/@realDonaldTrump" target="_blank" rel="noopener noreferrer" className="text-[10px] text-text-muted hover:text-text-secondary transition-colors">
            @realDonaldTrump
          </a>
        </div>
      </div>

      <div className="space-y-2 overflow-y-auto flex-1">
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => <SkeletonPost key={i} />)
          : posts.length === 0
            ? <div className="text-center py-8 text-text-muted text-xs">暂无动态</div>
            : posts.map((p) => <PostCard key={p.id} post={p} />)
        }
      </div>
    </section>
  );
}
