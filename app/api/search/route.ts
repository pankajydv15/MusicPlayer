import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ error: 'Query is required' }, { status: 400 });
  }

  try {
    const res = await fetch(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    const html = await res.text();

    // YouTube HTML ke andar ytInitialData JSON dhundhte hain
    const jsonMatch = html.match(/var ytInitialData = ({.*?});<\/script>/);
    if (!jsonMatch || !jsonMatch[1]) {
      return NextResponse.json({ songs: [] });
    }

    const data = JSON.parse(jsonMatch[1]);
    const sections =
      data?.contents?.twoColumnSearchResultsRenderer?.primaryContents
        ?.sectionListRenderer?.contents || [];

    const songs: any[] = [];

    for (const section of sections) {
      const items = section?.itemSectionRenderer?.contents || [];
      for (const item of items) {
        const video = item?.videoRenderer;
        if (video && video.videoId) {
          songs.push({
            id: video.videoId,
            title: video.title?.runs?.[0]?.text || 'Unknown Title',
            artist: video.ownerText?.runs?.[0]?.text || 'Unknown Artist',
            thumbnail: video.thumbnail?.thumbnails?.slice(-1)[0]?.url || '',
            duration: video.lengthText?.simpleText || '',
          });
        }
      }
    }

    return NextResponse.json({ songs: songs.slice(0, 20) });
  } catch (err: any) {
    console.error('Search Error:', err);
    return NextResponse.json({ error: 'Search failed', details: err?.message }, { status: 500 });
  }
}