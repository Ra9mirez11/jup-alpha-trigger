import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ids = searchParams.get('ids');
  
  // If it's a Price API call
  if (ids) {
    const apiKey = process.env.JUPITER_API_KEY;
    try {
      const headers: Record<string, string> = { 'Accept': 'application/json' };
      if (apiKey && apiKey !== 'YOUR_JUPITER_API_KEY') {
        headers['x-api-key'] = apiKey;
      }
      const res = await fetch(`https://api.jup.ag/price/v3?ids=${ids}`, { headers });
      const data = await res.json();
      return NextResponse.json(data);
    } catch (error) {
      return NextResponse.json({ error: 'Price API Proxy Error' }, { status: 500 });
    }
  }

  // If it's a Quote API call
  const inputMint = searchParams.get('inputMint');
  const outputMint = searchParams.get('outputMint');
  const amount = searchParams.get('amount');

  if (inputMint && outputMint && amount) {
    try {
      const res = await fetch(`https://quote-api.jup.ag/v6/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}&slippageBps=50`);
      const data = await res.json();
      return NextResponse.json(data);
    } catch (error) {
      return NextResponse.json({ error: 'Quote API Proxy Error' }, { status: 500 });
    }
  }

  return NextResponse.json({ error: 'Invalid Parameters' }, { status: 400 });
}
