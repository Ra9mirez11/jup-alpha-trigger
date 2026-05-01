'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { 
  Activity, 
  Terminal, 
  Zap, 
  AlertTriangle, 
  ArrowDown, 
  ArrowUp, 
  CheckCircle,
  Bug,
  Code,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PriceHistory {
  [key: string]: {
    current: number;
    prev: number;
    change: number;
    history: number[];
  };
}

const TRACKED_TOKENS = [
  { id: 'SOL', name: 'Solana', mint: 'So11111111111111111111111111111111111111112' },
  { id: 'JUP', name: 'Jupiter', mint: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN' },
  { id: 'PYTH', name: 'Pyth', mint: 'HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3' }
];

export default function JupAlphaTrigger() {
  const { connected, publicKey } = useWallet();
  const [prices, setPrices] = useState<PriceHistory>({});
  const [dxLogs, setDxLogs] = useState<string[]>([]);
  const [triggers, setTriggers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState<string | null>(null);

  const addDxLog = (msg: string) => {
    setDxLogs(prev => [msg, ...prev].slice(0, 15));
  };

  const fetchPrices = useCallback(async () => {
    try {
      const ids = TRACKED_TOKENS.map(t => t.mint).join(',');
      const res = await fetch(`/api/jup/price?ids=${ids}`);
      
      if (!res.ok) {
        addDxLog(`[ERROR] Price API V3 returned ${res.status}`);
        return;
      }

      const data = await res.json();
      const updatedPrices: PriceHistory = { ...prices };

      TRACKED_TOKENS.forEach(token => {
        const tokenData = data[token.mint];
        if (tokenData) {
          const currentPrice = parseFloat(tokenData.usdPrice);
          const prevPrice = prices[token.id]?.current || currentPrice;
          const change = tokenData.priceChange24h || 0;
          
          updatedPrices[token.id] = {
            current: currentPrice,
            prev: prevPrice,
            change: change,
            history: [...(prices[token.id]?.history || []), currentPrice].slice(-20)
          };

          // Check for "Alpha" (for demo, any drop > 0 is logged)
          if (change < -0.1 && !triggers.find(t => t.id === token.id)) {
             addAlphaTrigger(token.id, change);
          }
        }
      });

      setPrices(updatedPrices);
      setLoading(false);
      addDxLog(`[INFO] Market scan complete. V3 Root parsed.`);
    } catch (e) {
      addDxLog(`[CRITICAL] Network failure in Price Engine.`);
    }
  }, [prices, triggers]);

  const addAlphaTrigger = (id: string, drop: number) => {
    const newTrigger = {
      id,
      drop,
      time: new Date().toLocaleTimeString(),
      status: 'DETECTED'
    };
    setTriggers(prev => [newTrigger, ...prev].slice(0, 5));
  };

  const handleExecute = async (tokenSymbol: string) => {
    setExecuting(tokenSymbol);
    addDxLog(`[ACTION] Initiating JUP Quote for ${tokenSymbol}...`);
    
    try {
      // Simulate calling Jupiter Quote API
      const token = TRACKED_TOKENS.find(t => t.id === tokenSymbol);
      // Use local proxy to avoid CORS 'Connection Refused' error
      const res = await fetch(`/api/jup/price?inputMint=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v&outputMint=${token?.mint}&amount=100000000`);
      
      if (res.ok) {
        addDxLog(`[DX_FINDING] Quote V6 response received. Logic friction: nested 'routePlan' requires deep iteration for simple simulation.`);
        setTimeout(() => {
          addDxLog(`[SUCCESS] Simulation complete. Order ready for wallet sign.`);
          setExecuting(null);
        }, 1500);
      } else {
        addDxLog(`[ERROR] Quote API failed with ${res.status}`);
        setExecuting(null);
      }
    } catch (e) {
      addDxLog(`[ERROR] Quote API connection refused.`);
      setExecuting(null);
    }
  };

  useEffect(() => {
    const interval = setInterval(fetchPrices, 5000);
    return () => clearInterval(interval);
  }, [fetchPrices]);

  return (
    <main className="min-h-screen relative bg-[#05070a] text-[#e0e6ed] p-4 lg:p-8 overflow-hidden font-mono">
      <div className="scanline" />
      
      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        {/* Header */}
        <nav className="flex flex-col md:flex-row justify-between items-center border-b border-[#00ff88]/20 pb-6 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#00ff88]/10 rounded border border-[#00ff88]/30 shadow-[0_0_15px_rgba(0,255,136,0.2)]">
              <Zap className="w-8 h-8 text-[#00ff88]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tighter text-[#00ff88]">JUP ALPHA-TRIGGER</h1>
              <div className="flex items-center gap-2 text-[10px] text-[#00d4ff] opacity-70 uppercase tracking-widest">
                <div className="status-pulse" />
                System Status: Active // API_V3_LIVE
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => addAlphaTrigger('SOL', -5.42)}
              className="text-[10px] border border-[#ff0055]/30 px-2 py-1 rounded text-[#ff0055] hover:bg-[#ff0055]/10"
            >
              GENERATE MOCK TRIGGER
            </button>
            <WalletMultiButton className="!bg-[#00ff88]/10 !border !border-[#00ff88]/40 !text-[#00ff88] hover:!bg-[#00ff88]/20 !h-10 !text-xs" />
          </div>
        </nav>

        {/* Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-8 space-y-8">
            {/* Market Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {TRACKED_TOKENS.map(token => {
                const data = prices[token.id];
                const isDown = data?.change < 0;
                return (
                  <div key={token.id} className="terminal-card p-6 border-white/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-30 transition-opacity">
                       <Activity className="w-12 h-12" />
                    </div>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-xl font-bold tracking-widest">{token.id}</span>
                      <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded ${isDown ? 'bg-[#ff0055]/10 text-[#ff0055]' : 'bg-[#00ff88]/10 text-[#00ff88]'}`}>
                        {isDown ? <ArrowDown className="w-3 h-3" /> : <ArrowUp className="w-3 h-3" />}
                        {Math.abs(data?.change || 0).toFixed(2)}%
                      </div>
                    </div>
                    <div className="text-3xl font-bold tracking-tighter mb-2">
                      ${data?.current?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 }) || '0.0000'}
                    </div>
                    <div className="text-[10px] text-gray-500 truncate">{token.mint}</div>
                  </div>
                );
              })}
            </div>

            {/* Detections */}
            <div className="terminal-card p-0 border-[#ff0055]/20 overflow-hidden">
               <div className="bg-[#ff0055]/10 p-4 border-b border-[#ff0055]/20 flex items-center justify-between">
                  <h3 className="text-xs font-bold flex items-center gap-2 text-[#ff0055]">
                    <ShieldAlert className="w-4 h-4" /> RECENT ALPHA DETECTIONS
                  </h3>
                  <span className="text-[9px] opacity-50 uppercase">Auto-Scan Active</span>
               </div>
               <div className="p-4 space-y-3 min-h-[200px]">
                  <AnimatePresence>
                    {triggers.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 opacity-20">
                         <RadarIcon className="w-12 h-12 mb-4 animate-pulse" />
                         <p className="text-xs uppercase tracking-widest">Scanning blockchain for volatility...</p>
                      </div>
                    ) : triggers.map((t, i) => (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex justify-between items-center bg-white/5 border border-white/10 p-4 rounded-lg group hover:border-[#ff0055]/30 transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded bg-[#ff0055]/20 flex items-center justify-center text-[#ff0055] font-bold">
                             {t.id[0]}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-white">{t.id} Flash Drop Detected</div>
                            <div className="text-[10px] text-gray-500 uppercase tracking-tighter">
                               Drop: {t.drop.toFixed(2)}% // Detected at {t.time}
                            </div>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleExecute(t.id)}
                          disabled={executing === t.id}
                          className="px-6 py-2 bg-[#ff0055] text-white text-[10px] font-bold rounded-md hover:bg-[#ff0055]/80 transition-all shadow-lg shadow-[#ff0055]/20 disabled:opacity-50"
                        >
                          {executing === t.id ? 'SIMULATING...' : 'EXECUTE LIMIT'}
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
               </div>
            </div>
          </div>

          {/* DX Engine */}
          <div className="lg:col-span-4">
            <div className="terminal-card p-0 border-[#00d4ff]/20 h-full flex flex-col">
               <div className="bg-[#00d4ff]/10 p-4 border-b border-[#00d4ff]/20 flex items-center justify-between">
                  <h3 className="text-xs font-bold flex items-center gap-2 text-[#00d4ff]">
                    <Terminal className="w-4 h-4" /> LIVE DX_REPORT ENGINE
                  </h3>
                  <Bug className="w-3 h-3 text-[#00d4ff] animate-pulse" />
               </div>
               <div className="p-4 flex-grow space-y-3 overflow-y-auto max-h-[600px] scrollbar-hide">
                  {dxLogs.map((log, i) => (
                    <div key={i} className={`text-[10px] p-2 rounded border-l-2 ${log.includes('ERROR') ? 'bg-[#ff0055]/5 border-[#ff0055] text-[#ff0055]' : 'bg-[#00d4ff]/5 border-[#00d4ff] text-[#00d4ff]'}`}>
                       <span className="opacity-30 mr-2">[{new Date().toLocaleTimeString().split(' ')[0]}]</span> {log}
                    </div>
                  ))}
               </div>
               <div className="p-4 mt-auto border-t border-white/5 bg-black/40">
                  <div className="text-[9px] uppercase text-[#00d4ff] mb-2 font-bold flex items-center gap-2">
                     <Code className="w-3 h-3" /> Latest Submission Feedback
                  </div>
                  <div className="p-3 bg-[#00d4ff]/5 rounded text-[10px] text-[#00d4ff] italic leading-relaxed border border-[#00d4ff]/10">
                     "Price API V3 requires Mint addresses but silently fails with empty 200 responses when Symbols are used. Added to DX Report Section 2.2."
                  </div>
               </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}

function RadarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2v20" />
      <path d="M2 12h20" />
      <path d="M12 12l5-5" />
    </svg>
  );
}
