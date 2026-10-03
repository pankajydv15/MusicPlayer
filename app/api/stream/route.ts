import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const videoId = searchParams.get('id');

  if (!videoId) {
    return NextResponse.json({ error: 'Video ID required' }, { status: 400 });
  }

  // Fallback public Invidious instances jo direct audio stream provide karte hain
  const instances = [
    'https://inv.tux.pizza',
    'https://invidious.nerdvpn.de',
    'https://invidious.jing.rocks',
    'https://vid.puffyan.us',
  ];

  for (const instance of instances) {
    try {
      const res = await fetch(`${instance}/api/v1/videos/${videoId}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        },
        next: { revalidate: 3600 },
      });

      if (!res.ok) continue;

      const data = await res.json();
      const adaptiveFormats = data.adaptiveFormats || [];

      // Audio only stream dhundhte hain (m4a/webm)
      const audioStreams = adaptiveFormats.filter((f: any) =>
        f.type && f.type.startsWith('audio/')
      );

      if (audioStreams.length > 0) {
        // Highest audio quality stream
        const bestAudio = audioStreams[audioStreams.length - 1];
        return NextResponse.json({ audioUrl: bestAudio.url });
      }
    } catch (err) {
      continue;
    }
  }

  // Backup fallback: piped audio proxy
  try {
    const pipedRes = await fetch(`https://pipedapi.kavin.rocks/streams/${videoId}`);
    if (pipedRes.ok) {
      const pipedData = await pipedRes.json();
      const audioStreams = pipedData.audioStreams || [];
      if (audioStreams.length > 0) {
        return NextResponse.json({ audioUrl: audioStreams[0].url });
      }
    }
  } catch (err) {
    console.error('Fallback stream failed');
  }

  return NextResponse.json({ error: 'Stream extraction failed' }, { status: 500 });
}