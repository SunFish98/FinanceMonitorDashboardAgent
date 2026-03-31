'use client';

import { useState, useEffect, useCallback } from 'react';
import { TruthPost } from '@/lib/types';

const TRUTH_API = 'https://truthsocial.com/api/v1';

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<p>/gi, '')
    .replace(/<\/p>/gi, '\n')
    .replace(/<a\s[^>]*>(.*?)<\/a>/gi, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

interface MastodonStatus {
  id: string;
  content: string;
  created_at: string;
  url: string;
  reblog?: MastodonStatus | null;
}

async function fetchTruthPosts(): Promise<TruthPost[]> {
  // Step 1: look up account ID (client-side — browser request, not server)
  const lookupRes = await fetch(
    `${TRUTH_API}/accounts/lookup?acct=realDonaldTrump`,
    { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(10000) }
  );
  if (!lookupRes.ok) throw new Error(`Lookup ${lookupRes.status}`);
  const account = await lookupRes.json();

  // Step 2: fetch statuses
  const statusRes = await fetch(
    `${TRUTH_API}/accounts/${account.id}/statuses?limit=20&exclude_replies=true`,
    { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(10000) }
  );
  if (!statusRes.ok) throw new Error(`Statuses ${statusRes.status}`);
  const statuses: MastodonStatus[] = await statusRes.json();

  return statuses
    .filter((s) => s.content)
    .slice(0, 15)
    .map((s) => ({
      id: s.id,
      content: stripHtml(s.reblog ? s.reblog.content : s.content),
      date: s.created_at,
      url: s.url,
      isRetruth: !!s.reblog,
    }));
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
          <div className="flex items-center gap-1.5">
            <div className="text-xs font-semibold text-text-primary truncate">Donald J. Trump</div>
            {post.isRetruth && (
              <span className="text-[9px] px-1 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0">ReTruth</span>
            )}
          </div>
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
        <a href={post.url} target="_blank" rel="noopener noreferrer"
          className="text-[10px] text-accent-blue hover:underline transition-colors">
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

// Self-contained component: fetches directly from Truth Social in the browser.
// Browser requests bypass the 403 that blocks server-side Node.js fetches because
// Truth Social's Mastodon API allows CORS from browser origins.
export default function TruthSocialFeed() {
  const [posts, setPosts] = useState<TruthPost[]>([]);
  const [status, setStatus] = useState<'loading' | 'live' | 'error'>('loading');
  const [error, setError] = useState<string>('');
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const fetched = await fetchTruthPosts();
      setPosts(fetched);
      setStatus('live');
      setLastUpdated(new Date().toISOString());
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, []);

  useEffect(() => {
    load();
    // Refresh every 2 minutes
    const t = setInterval(load, 120000);
    return () => clearInterval(t);
  }, [load]);

  return (
    <section className="bg-dashboard-card border border-dashboard-border rounded-lg p-4 flex flex-col" style={{ maxHeight: '85vh' }}>
      <div className="flex items-center justify-between mb-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-1 h-5 rounded-full bg-[#e2341d]" />
          <h2 className="text-sm font-semibold text-text-primary">Truth Social</h2>
          {status === 'live' && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent-green/10 text-accent-green border border-accent-green/20">实时</span>
          )}
          {status === 'error' && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">获取失败</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {lastUpdated && status === 'live' && (
            <span className="text-[10px] text-text-muted">
              {new Date(lastUpdated).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <button
            onClick={load}
            className="text-[10px] text-text-muted hover:text-text-secondary transition-colors"
            title="刷新"
          >
            ↺
          </button>
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

      <div className="space-y-2 overflow-y-auto flex-1">
        {status === 'loading'
          ? Array.from({ length: 5 }).map((_, i) => <SkeletonPost key={i} />)
          : status === 'error'
            ? (
              <div className="text-center py-8 space-y-3">
                <div className="text-2xl">🔒</div>
                <div className="text-sm text-red-400">Truth Social 访问被拒绝</div>
                <div className="text-[11px] text-text-muted max-w-[240px] mx-auto leading-relaxed">
                  Truth Social 对浏览器也启用了访问限制（CORS 策略）。
                  错误: <span className="font-mono text-red-400/80">{error}</span>
                </div>
                <a
                  href="https://truthsocial.com/@realDonaldTrump"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-3 py-1.5 rounded border border-accent-blue/40 text-accent-blue text-xs hover:bg-accent-blue/10 transition-colors"
                >
                  直接访问 Truth Social →
                </a>
              </div>
            )
            : posts.map((p) => <PostCard key={p.id} post={p} />)
        }
      </div>
    </section>
  );
}
