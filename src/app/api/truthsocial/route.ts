import { NextResponse } from 'next/server';
import { TruthPost } from '@/lib/types';

export const dynamic = 'force-dynamic';

const MOCK_TRUTH_POSTS: TruthPost[] = [
  {
    id: '1',
    content:
      'The economy is doing GREAT! Stock Market up, jobs are up, inflation coming down. The MAGA agenda is working! 🇺🇸',
    date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    url: 'https://truthsocial.com/@realDonaldTrump',
  },
  {
    id: '2',
    content:
      'The Federal Reserve needs to CUT RATES NOW! Inflation is under control. Our economy could be even stronger with lower interest rates. MAKE AMERICA GREAT AGAIN!',
    date: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    url: 'https://truthsocial.com/@realDonaldTrump',
  },
  {
    id: '3',
    content:
      'Big announcement coming on TARIFFS. We are going to protect American workers and American industries. Other countries have taken advantage of us for too long. Not anymore!',
    date: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    url: 'https://truthsocial.com/@realDonaldTrump',
  },
  {
    id: '4',
    content:
      'The Fake News Media refuses to report on our tremendous economic success. GDP is up, unemployment is near all-time lows, and the Dollar is STRONG!',
    date: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    url: 'https://truthsocial.com/@realDonaldTrump',
  },
  {
    id: '5',
    content:
      'We are renegotiating terrible trade deals that have hurt American workers for decades. China, the EU, and others will be paying their FAIR SHARE. America First!',
    date: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
    url: 'https://truthsocial.com/@realDonaldTrump',
  },
  {
    id: '6',
    content:
      'ENERGY DOMINANCE! We are drilling, baby drilling. Gasoline prices are coming down. The Green New Scam is DEAD. American energy independence is here!',
    date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    url: 'https://truthsocial.com/@realDonaldTrump',
  },
  {
    id: '7',
    content:
      'The Stock Market hit another ALL TIME HIGH today! Under Crooked Joe Biden, the market was a disaster. Under Trump, it\'s booming. MAGA!',
    date: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
    url: 'https://truthsocial.com/@realDonaldTrump',
  },
  {
    id: '8',
    content:
      'Tax cuts are WORKING! Businesses are investing in America, hiring American workers, and bringing jobs back home. The Trump economic miracle continues!',
    date: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    url: 'https://truthsocial.com/@realDonaldTrump',
  },
];

function parseXmlPosts(xml: string): TruthPost[] {
  const posts: TruthPost[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  let index = 0;

  while ((match = itemRegex.exec(xml)) !== null && index < 10) {
    const item = match[1];
    const titleMatch = item.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/);
    const linkMatch = item.match(/<link>([\s\S]*?)<\/link>/);
    const descMatch = item.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/);
    const pubDateMatch = item.match(/<pubDate>([\s\S]*?)<\/pubDate>/);
    const guidMatch = item.match(/<guid[^>]*>([\s\S]*?)<\/guid>/);

    const title = titleMatch ? titleMatch[1].trim() : '';
    const link = linkMatch ? linkMatch[1].trim() : '';
    const description = descMatch ? descMatch[1].trim() : title;
    const pubDate = pubDateMatch ? pubDateMatch[1].trim() : new Date().toISOString();
    const guid = guidMatch ? guidMatch[1].trim() : String(index);

    // Strip HTML tags from description
    const content = description
      .replace(/<[^>]+>/g, '')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim();

    if (content) {
      posts.push({
        id: guid || String(index),
        title: title || undefined,
        content,
        date: new Date(pubDate).toISOString(),
        url: link || 'https://truthsocial.com/@realDonaldTrump',
      });
      index++;
    }
  }

  return posts;
}

export async function GET() {
  try {
    const rssUrl = 'https://truthsocial.com/@realDonaldTrump.rss';
    const response = await fetch(rssUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; FinanceDashboard/1.0)',
        Accept: 'application/rss+xml, application/xml, text/xml',
      },
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(8000),
    });

    if (response.ok) {
      const xml = await response.text();
      const posts = parseXmlPosts(xml);
      if (posts.length > 0) {
        return NextResponse.json({
          posts,
          source: 'live',
          lastUpdated: new Date().toISOString(),
        });
      }
    }
  } catch (error) {
    console.error('Failed to fetch Truth Social RSS:', error);
  }

  return NextResponse.json({
    posts: MOCK_TRUTH_POSTS,
    source: 'mock',
    lastUpdated: new Date().toISOString(),
  });
}
