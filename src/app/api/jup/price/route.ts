import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ids = searchParams.get('ids');
  
  try {
    // 1. Price API Handling
    if (ids) {
      const apiKey = process.env.JUPITER_API_KEY;
      const headers: Record<string, string> = { 'Accept': 'application/json' };
      if (apiKey && apiKey !== 'YOUR_JUPITER_API_KEY') {
        headers['x-api-key'] = apiKey;
      }
      const res = await fetch(`https://api.jup.ag/price/v3?ids=${ids}`, { headers });
      const data = await res.json();
      return NextResponse.json(data);
    }

    // 2. Quote API Handling
    const inputMint = searchParams.get('inputMint');
    const outputMint = searchParams.get('outputMint');
    const amount = searchParams.get('amount');

    if (inputMint && outputMint && amount) {
      const jupRes = await fetch(`https://quote-api.jup.ag/v6/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}&slippageBps=50`);
      
      if (!jupRes.ok) {
        const errorText = await jupRes.text();
        console.error(`[JUP_PROXY_ERROR] Quote API returned ${jupRes.status}: ${errorText}`);
        return NextResponse.json({ error: `Jupiter API Error ${jupRes.status}`, details: errorText }, { status: jupRes.status });
      }

      const data = await jupRes.json();
      return NextResponse.json(data);
    }

    return NextResponse.json({ error: 'Invalid Parameters' }, { status: 400 });
  } catch (error: any) {
    console.error(`[JUP_PROXY_CRITICAL] ${error.message}`);
    return NextResponse.json({ error: 'Internal Server Error', message: error.message }, { status: 500 });
  }
}
