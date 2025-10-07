import { NextResponse } from 'next/server';
import Parser from 'rss-parser';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const feedUrl = searchParams.get('feedUrl');

  if (!feedUrl) {
    return NextResponse.json({ error: 'feedUrl is required' }, { status: 400 });
  }

  const parser = new Parser();

  try {
    const feed = await parser.parseURL(feedUrl);
    // Return only the top 5 items for a clean feed
    const items = feed.items.slice(0, 5).map(item => ({
      title: item.title,
      link: item.link,
      pubDate: item.pubDate,
      snippet: item.contentSnippet,
    }));
    return NextResponse.json({ items });
  } catch (error) {
    console.error('Failed to parse RSS feed:', error);
    return NextResponse.json({ error: 'Failed to fetch or parse RSS feed' }, { status: 500 });
  }
}
