import { NextResponse } from 'next/server';
import { TruthPost } from '@/lib/types';

export const dynamic = 'force-dynamic';

// Truth Social is Mastodon-compatible — use the public API (no auth needed for public accounts)
const TRUTH_SOCIAL_API = 'https://truthsocial.com/api/v1';

interface MastodonStatus {
  id: string;
  content: string;
  created_at: string;
  url: string;
  reblog?: MastodonStatus | null;
  in_reply_to_id?: string | null;
}

interface MastodonAccount {
  id: string;
  username: string;
}

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<p>/gi, '')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .trim();
}

export async function GET() {
  try {
    // Step 1: look up the account ID for @realDonaldTrump
    const lookupRes = await fetch(
      `${TRUTH_SOCIAL_API}/accounts/lookup?acct=realDonaldTrump`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; FinanceDashboard/1.0)',
          Accept: 'application/json',
        },
        cache: 'no-store',
        signal: AbortSignal.timeout(8000),
      }
    );

    if (!lookupRes.ok) {
      throw new Error(`Lookup failed: ${lookupRes.status}`);
    }

    const account: MastodonAccount = await lookupRes.json();

    // Step 2: fetch latest statuses (exclude replies and reblogs for cleaner feed)
    const statusRes = await fetch(
      `${TRUTH_SOCIAL_API}/accounts/${account.id}/statuses?limit=20&exclude_replies=true&exclude_reblogs=false`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; FinanceDashboard/1.0)',
          Accept: 'application/json',
        },
        cache: 'no-store',
        signal: AbortSignal.timeout(8000),
      }
    );

    if (!statusRes.ok) {
      throw new Error(`Statuses failed: ${statusRes.status}`);
    }

    const statuses: MastodonStatus[] = await statusRes.json();

    const posts: TruthPost[] = statuses
      .filter((s) => s.content)
      .slice(0, 15)
      .map((s) => ({
        id: s.id,
        content: stripHtml(s.reblog ? s.reblog.content : s.content),
        date: s.created_at,
        url: s.url,
        isRetruth: !!s.reblog,
      }));

    if (posts.length === 0) {
      throw new Error('No posts returned');
    }

    return NextResponse.json({
      posts,
      source: 'live',
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Truth Social API error:', error);

    // Return error info so the UI can show a clear message instead of fake data
    return NextResponse.json(
      {
        posts: [],
        source: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        lastUpdated: new Date().toISOString(),
      },
      { status: 200 } // return 200 so the client handles it gracefully
    );
  }
}
