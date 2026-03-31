import { NextResponse } from 'next/server';
import { TruthPost } from '@/lib/types';

export const dynamic = 'force-dynamic';

// Full browser-like headers to avoid bot detection
const BROWSER_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
  Accept:
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Accept-Encoding': 'gzip, deflate, br',
  'Cache-Control': 'no-cache',
  Pragma: 'no-cache',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'none',
  'Upgrade-Insecure-Requests': '1',
};

const API_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
  Accept: 'application/json, text/plain, */*',
  'Accept-Language': 'en-US,en;q=0.9',
  'Cache-Control': 'no-cache',
  Referer: 'https://truthsocial.com/',
  Origin: 'https://truthsocial.com',
};

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
    .replace(/&apos;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function parseRssXml(xml: string): TruthPost[] {
  const posts: TruthPost[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  let index = 0;

  while ((match = itemRegex.exec(xml)) !== null && index < 15) {
    const item = match[1];

    const titleMatch = item.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/);
    const linkMatch = item.match(/<link>([\s\S]*?)<\/link>/);
    const descMatch = item.match(/<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/);
    const pubDateMatch = item.match(/<pubDate>([\s\S]*?)<\/pubDate>/);
    const guidMatch = item.match(/<guid[^>]*>([\s\S]*?)<\/guid>/);
    const contentMatch = item.match(/<content:encoded>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/content:encoded>/);

    const rawContent = contentMatch?.[1] || descMatch?.[1] || titleMatch?.[1] || '';
    const content = stripHtml(rawContent);
    const pubDate = pubDateMatch?.[1]?.trim() || new Date().toISOString();
    const guid = guidMatch?.[1]?.trim() || String(index);
    const link = linkMatch?.[1]?.trim() || 'https://truthsocial.com/@realDonaldTrump';

    if (content && content.length > 2) {
      posts.push({
        id: guid,
        content,
        date: new Date(pubDate).toISOString(),
        url: link,
      });
      index++;
    }
  }

  return posts;
}

interface MastodonStatus {
  id: string;
  content: string;
  created_at: string;
  url: string;
  reblog?: MastodonStatus | null;
}

// Strategy 1: Mastodon API
async function tryMastodonApi(): Promise<TruthPost[]> {
  // Step 1: lookup account ID
  const lookupRes = await fetch(
    'https://truthsocial.com/api/v1/accounts/lookup?acct=realDonaldTrump',
    {
      headers: API_HEADERS,
      cache: 'no-store',
      signal: AbortSignal.timeout(8000),
    }
  );

  if (!lookupRes.ok) {
    throw new Error(`Lookup failed: ${lookupRes.status}`);
  }

  const account = await lookupRes.json();

  // Step 2: fetch statuses
  const statusRes = await fetch(
    `https://truthsocial.com/api/v1/accounts/${account.id}/statuses?limit=20&exclude_replies=true`,
    {
      headers: API_HEADERS,
      cache: 'no-store',
      signal: AbortSignal.timeout(8000),
    }
  );

  if (!statusRes.ok) {
    throw new Error(`Statuses failed: ${statusRes.status}`);
  }

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

// Strategy 2: RSS feed variants
async function tryRss(url: string): Promise<TruthPost[]> {
  const res = await fetch(url, {
    headers: BROWSER_HEADERS,
    cache: 'no-store',
    signal: AbortSignal.timeout(10000),
  });

  if (!res.ok) {
    throw new Error(`RSS ${url} returned ${res.status}`);
  }

  const text = await res.text();
  if (!text.includes('<item>') && !text.includes('<entry>')) {
    throw new Error(`Response from ${url} does not look like RSS/Atom`);
  }

  const posts = parseRssXml(text);
  if (posts.length === 0) {
    throw new Error(`No posts parsed from ${url}`);
  }

  return posts;
}

// Strategy 3: Mastodon API with account ID hardcoded (avoids the lookup step)
// Trump's Truth Social account ID — can be found via the lookup endpoint when it works
async function tryMastodonDirect(): Promise<TruthPost[]> {
  // Try fetching the account page to find the ID dynamically from HTML
  const profileRes = await fetch('https://truthsocial.com/@realDonaldTrump', {
    headers: BROWSER_HEADERS,
    cache: 'no-store',
    signal: AbortSignal.timeout(10000),
  });

  if (!profileRes.ok) {
    throw new Error(`Profile page returned ${profileRes.status}`);
  }

  const html = await profileRes.text();

  // Extract account ID from the HTML (it appears in og:url or initial data)
  const idMatch =
    html.match(/"id":"(\d+)","username":"realDonaldTrump"/) ||
    html.match(/accounts\/(\d+)\/statuses/) ||
    html.match(/"acct":"realDonaldTrump","id":"(\d+)"/) ||
    html.match(/\/api\/v1\/accounts\/(\d+)/);

  if (!idMatch) {
    throw new Error('Could not extract account ID from profile page');
  }

  const accountId = idMatch[1];
  const statusRes = await fetch(
    `https://truthsocial.com/api/v1/accounts/${accountId}/statuses?limit=20&exclude_replies=true`,
    {
      headers: API_HEADERS,
      cache: 'no-store',
      signal: AbortSignal.timeout(8000),
    }
  );

  if (!statusRes.ok) {
    throw new Error(`Statuses failed: ${statusRes.status}`);
  }

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

export async function GET() {
  const strategies: Array<{ name: string; fn: () => Promise<TruthPost[]> }> = [
    { name: 'Mastodon API (lookup)', fn: tryMastodonApi },
    {
      name: 'RSS feed (@realDonaldTrump.rss)',
      fn: () => tryRss('https://truthsocial.com/@realDonaldTrump.rss'),
    },
    {
      name: 'RSS feed (users/realDonaldTrump.rss)',
      fn: () => tryRss('https://truthsocial.com/users/realDonaldTrump.rss'),
    },
    { name: 'Profile page + Mastodon API', fn: tryMastodonDirect },
  ];

  const errors: string[] = [];

  for (const strategy of strategies) {
    try {
      const posts = await strategy.fn();
      if (posts.length > 0) {
        return NextResponse.json({
          posts,
          source: 'live',
          strategy: strategy.name,
          lastUpdated: new Date().toISOString(),
        });
      }
    } catch (err) {
      const msg = `${strategy.name}: ${err instanceof Error ? err.message : 'unknown'}`;
      errors.push(msg);
      console.error('[TruthSocial]', msg);
    }
  }

  return NextResponse.json({
    posts: [],
    source: 'error',
    error: 'Truth Social 所有访问方式均被拒绝',
    errors,
    lastUpdated: new Date().toISOString(),
  });
}
