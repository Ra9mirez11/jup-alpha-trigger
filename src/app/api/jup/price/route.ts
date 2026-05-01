import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ids = searchParams.get('ids');
  const inputMint = searchParams.get('inputMint');
  const outputMint = searchParams.get('outputMint');
  const amount = searchParams.get('amount');
  
  const commonHeaders = {
    'Accept': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  };

  try {
    // 1. Price API
    if (ids) {
      const apiKey = process.env.JUPITER_API_KEY;
      const headers: Record<string, string> = { ...commonHeaders };
      if (apiKey && apiKey !== 'YOUR_JUPITER_API_KEY') {
        headers['x-api-key'] = apiKey;
      }
      const res = await fetch(`https://api.jup.ag/price/v3?ids=${ids}`, { headers });
      const data = await res.json();
      return NextResponse.json(data);
    }

    // 2. Quote API (Alternative Endpoint)
    if (inputMint && outputMint && amount) {
      // Trying the alternative /swap/v6/quote endpoint
      const url = `https://api.jup.ag/swap/v6/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}&slippageBps=50`;
      
      try {
        const jupRes = await fetch(url, { headers: commonHeaders });
        if (!jupRes.ok) {
           const err = await jupRes.text();
           return NextResponse.json({ error: `Jup Error ${jupRes.status}`, details: err }, { status: jupRes.status });
        }
        const data = await jupRes.json();
        return NextResponse.json(data);
      } catch (innerError: any) {
        // If it still fails, return a helpful error for the DX Report
        return NextResponse.json({ 
          error: 'FETCH_FAILED_ON_VERCEL', 
          message: 'Jupiter API connection refused from Vercel edge. Possible WAF block.',
          tip: 'This finding has been added to the DX Report.'
        }, { status: 500 });
      }
    }

    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Proxy Error', message: error.message }, { status: 500 });
  }
}
