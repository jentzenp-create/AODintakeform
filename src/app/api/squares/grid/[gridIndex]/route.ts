import { NextRequest, NextResponse } from 'next/server';
import squaresData from '@/data/squares.json';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ gridIndex: string }> }
) {
  const { gridIndex: gridIndexStr } = await params;
  const idx = parseInt(gridIndexStr, 10);

  if (isNaN(idx) || idx < 0 || idx >= squaresData.grids.length) {
    return NextResponse.json({ error: 'Grid not found' }, { status: 404 });
  }

  return NextResponse.json(squaresData.grids[idx], {
    headers: { 'Cache-Control': 'public, max-age=86400, immutable' },
  });
}
