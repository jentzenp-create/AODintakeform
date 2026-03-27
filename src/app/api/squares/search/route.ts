import { NextRequest, NextResponse } from 'next/server';
import squaresData from '@/data/squares.json';

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.trim().toLowerCase() ?? '';

  if (q.length < 2) {
    return NextResponse.json([]);
  }

  const results = (squaresData.searchIndex as Array<{ name: string; gridIndex: number; cellIndex: number }>)
    .filter(entry => entry.name.toLowerCase().includes(q))
    .slice(0, 8);

  return NextResponse.json(results, {
    headers: { 'Cache-Control': 'no-store' },
  });
}
