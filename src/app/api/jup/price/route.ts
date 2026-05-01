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

    // 2. Quote API (Correct Endpoint: quote-api.jup.ag)
    if (inputMint && outputMint && amount) {
      const url = `https://quote-api.jup.ag/v6/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}&slippageBps=50`;
      
      try {
        const jupRes = await fetch(url, { headers: commonHeaders, cache: 'no-store' });
        if (jupRes.ok) {
          const data = await jupRes.json();
          return NextResponse.json(data);
        }
        
        // If Jupiter returns error (like 403/429), we provide a Mock for the Demo
        // but tell the truth in the logs
        return NextResponse.json({ 
          isDemo: true,
          outAmount: "1234567",
          priceImpactPct: "0.01",
          info: "Real API returned " + jupRes.status + ". Using Demo Mock for UI preview."
        });

      } catch (e: any) {
        // Fetch failure (CORS/WAF block)
        return NextResponse.json({ 
          isDemo: true,
          outAmount: "1234567",
          priceImpactPct: "0.01",
          info: "Fetch failed from Edge. Using Demo Mock for UI preview."
        });
      }
    }

    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Proxy Error', message: error.message }, { status: 500 });
  }
}
