import * as cheerio from 'cheerio';

export async function fetchWebsiteContent(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'en-US,en;q=0.9',
        'Upgrade-Insecure-Requests': '1',
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.statusText}`);
    }
    const html = await response.text();
    const $ = cheerio.load(html);
    $('script, style, noscript, iframe').remove();
    $('p, h1, h2, h3, h4, h5, h6, li, blockquote, pre, div').after('\n');
    const bodyText = $('body').text();
    return bodyText.replace(/[ 	]+/g, ' ').replace(/\n\s*\n/g, '\n').trim();
  } catch (error) {
    console.error('Error fetching website content:', error);
    throw new Error('Could not retrieve content from the provided URL. Please check if the URL is correct and accessible.');
  }
}
