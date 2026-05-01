import type { Metadata } from "next";
import "./globals.css";
import "@solana/wallet-adapter-react-ui/styles.css";
import SolanaWalletProvider from "@/components/WalletProvider";

export const metadata: Metadata = {
  title: "Jup Alpha-Trigger | Premium Trading Intelligence",
  description: "Real-time volatility monitoring and automated execution on Solana.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased dark">
        <SolanaWalletProvider>
          {children}
        </SolanaWalletProvider>
      </body>
    </html>
  );
}
