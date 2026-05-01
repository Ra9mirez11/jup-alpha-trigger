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
  Code
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PriceData {
  id: string;
  price: string;
  mint: string;
}

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

  const addDxLog = (msg: string) => {
    setDxLogs(prev => [msg, ...prev].slice(0, 10));
  };

  const fetchPrices = useCallback(async () => {
    try {
      const ids = TRACKED_TOKENS.map(t => t.mint).join(',');
      const res = await fetch(`/api/jup/price?ids=${ids}`);
      
      if (!res.ok) {
        addDxLog(`[ERROR] Price API returned ${res.status}`);
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

          // Check for "Alpha" (big drop detected via 24h change or local logic)
          if (change < -5.0) { // Example: 5% drop in 24h
            addAlphaTrigger(token.id, change);
          }
        }
      });

      setPrices(updatedPrices);
      setLoading(false);
      addDxLog(`[INFO] Price sync complete. Root-level V3 parsed.`);
    } catch (e) {
      addDxLog(`[CRITICAL] Network error in Price API polling.`);
    }
  }, [prices]);

  const addAlphaTrigger = (id: string, drop: number) => {
    const newTrigger = {
      id,
      drop,
      time: new Date().toLocaleTimeString(),
      status: 'DETECTED'
    };
    setTriggers(prev => [newTrigger, ...prev].slice(0, 5));
  };

  useEffect(() => {
    const interval = setInterval(fetchPrices, 5000);
    return () => clearInterval(interval);
  }, [fetchPrices]);

  return (
    <main className="min-h-screen relative bg-background text-foreground p-4 lg:p-8 overflow-hidden">
      <div className="scanline" />
      
      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        {/* Header */}
        <nav className="flex justify-between items-center border-b border-primary/20 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded border border-primary/30">
              <Zap className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tighter text-primary">JUP ALPHA-TRIGGER</h1>
              <div className="flex items-center gap-2 text-xs text-secondary opacity-70">
                <div className="status-pulse" />
                SYSTEM_STABLE // API_V3_ACTIVE
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <WalletMultiButton className="!bg-primary/20 !border !border-primary/40 !text-primary hover:!bg-primary/30" />
          </div>
        </nav>

        {/* Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Market Radar */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center gap-2 px-2">
              <Activity className="w-5 h-5 text-secondary" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-secondary">Volatility Radar</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {TRACKED_TOKENS.map(token => {
                const data = prices[token.id];
                return (
                  <motion.div 
                    key={token.id}
                    layout
                    className="terminal-card p-6 space-y-4"
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-2xl font-bold">{token.id}</span>
                      <div className={`px-2 py-1 rounded text-[10px] font-bold ${data?.change >= 0 ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent'}`}>
                        {data?.change >= 0 ? '+' : ''}{data?.change?.toFixed(3)}%
                      </div>
                    </div>
                    <div className="text-3xl font-mono">
                      ${data?.current?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 }) || '0.0000'}
                    </div>
                    <div className="h-8 flex items-end gap-1 overflow-hidden opacity-50">
                      {data?.history.map((p, i) => (
                        <div 
                          key={i} 
                          className="w-full bg-primary" 
                          style={{ height: `${(p / data.current) * 100}%` }}
                        />
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Triggers Section */}
            <div className="terminal-card p-6">
              <h3 className="text-sm font-bold mb-4 flex items-center gap-2 text-accent">
                <AlertTriangle className="w-4 h-4" /> RECENT ALPHA DETECTIONS
              </h3>
              <div className="space-y-3">
                <AnimatePresence>
                  {triggers.length === 0 ? (
                    <div className="text-center py-8 text-gray-600 border border-dashed border-gray-800 rounded">
                      Waiting for market volatility...
                    </div>
                  ) : triggers.map((t, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex justify-between items-center bg-accent/5 border border-accent/20 p-4 rounded"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-accent animate-ping" />
                        <span className="font-bold">{t.id} Flash Drop Detected</span>
                        <span className="text-xs text-accent/60">{t.drop.toFixed(2)}% in 5s</span>
                      </div>
                      <button className="px-4 py-2 bg-accent text-white text-xs font-bold rounded hover:opacity-90">
                        EXECUTE LIMIT ORDER
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* DX Engine & Sidebars */}
          <div className="lg:col-span-4 space-y-6">
            <div className="terminal-card p-6 h-full border-secondary/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold flex items-center gap-2 text-secondary">
                  <Terminal className="w-4 h-4" /> LIVE DX_REPORT ENGINE
                </h3>
                <div className="flex gap-2">
                   <Bug className="w-3 h-3 text-secondary animate-bounce" />
                </div>
              </div>
              <div className="space-y-4 font-mono text-[11px]">
                {dxLogs.map((log, i) => (
                  <div key={i} className={`p-2 border-l-2 ${log.includes('ERROR') ? 'border-accent text-accent' : 'border-secondary text-secondary'}`}>
                    <span className="opacity-50">{new Date().toLocaleTimeString()}</span> {log}
                  </div>
                ))}
                <div className="pt-4 mt-4 border-t border-secondary/10">
                   <p className="text-secondary opacity-60 uppercase text-[9px] mb-2 tracking-widest font-bold">Feedback Collector</p>
                   <div className="bg-secondary/5 p-3 rounded text-secondary italic">
                      "API V3 Quote returns raw transaction data. It would be better to have an integrated SDK helper for transaction simulation directly in the response."
                   </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
