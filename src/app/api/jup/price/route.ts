import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ids = searchParams.get('ids');
  const apiKey = process.env.JUPITER_API_KEY;

  try {
    const headers: Record<string, string> = {
      'Accept': 'application/json',
    };

    // If API Key is configured, add it to headers
    if (apiKey && apiKey !== 'YOUR_JUPITER_API_KEY') {
      headers['x-api-key'] = apiKey;
    }

    const res = await fetch(`https://api.jup.ag/price/v3?ids=${ids}`, {
      headers
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
