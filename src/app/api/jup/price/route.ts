import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ids = searchParams.get('ids');

  try {
    // Migrated to V3 as V2 returns 404
    const res = await fetch(`https://api.jup.ag/price/v3?ids=${ids}`, {
      headers: {
        'Accept': 'application/json',
      }
    });
    
    if (!res.ok) {
      return NextResponse.json({ error: `Jupiter API Error: ${res.status}` }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
