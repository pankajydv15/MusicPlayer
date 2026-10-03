import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Video ID required' }, { status: 400 });
  }

  try {
    const res = await fetch(`https://pipedapi.kavin.rocks/streams/${id}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      },
    });

    if (!res.ok) {
      throw new Error('Failed to fetch stream details');
    }

    const data = await res.json();
    const audioStreams = data.audioStreams || [];

    // Highest bitrate stream find karo
    const bestAudio = audioStreams.sort((a: any, b: any) => (b.bitrate || 0) - (a.bitrate || 0))[0];

    if (!bestAudio?.url) {
      return NextResponse.json({ error: 'No audio stream available' }, { status: 404 });
    }

    return NextResponse.json({ audioUrl: bestAudio.url });
  } catch (err: any) {
    return NextResponse.json({ error: 'Stream extraction failed', details: err?.message }, { status: 500 });
  }
}
