import { NextRequest } from 'next/server';
import ytdl from '@distube/ytdl-core';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const videoId = searchParams.get('id');

  if (!videoId) {
    return new Response('Video ID missing', { status: 400 });
  }

  try {
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    
    // Sirf pure audio format filter karte hain (low bandwidth + instant streaming)
    const audioStream = ytdl(videoUrl, {
      filter: 'audioonly',
      quality: 'highestaudio',
      highWaterMark: 1 << 25,
    });

    // Native audio response return karte hain
    return new Response(audioStream as any, {
      headers: {
        'Content-Type': 'audio/mp4',
        'Cache-Control': 'public, max-age=3600',
        'Accept-Ranges': 'bytes',
      },
    });
  } catch (error: any) {
    console.error('Streaming error:', error.message);
    return new Response('Failed to stream audio', { status: 500 });
  }
}