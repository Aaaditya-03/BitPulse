import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ShieldCheck, Info, Heart } from "lucide-react";

export default function Footer() {
	return (
		<footer className="w-full bg-dark-900/40 border-t border-purple-500/10 mt-16">
			<div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
				<div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
					{/* Brand Column */}
					<div className="md:col-span-2 space-y-4">
						<div className="flex items-center gap-2">
							<Image src="/logo.svg" alt="BitPulse logo" width={110} height={32} />
						</div>
						<p className="text-sm text-purple-200/50 max-w-sm leading-relaxed">
							BitPulse is an interactive high-frequency cryptocurrency terminal and screener. 
							Monitor price movements, track trending coins, and query safety insights powered by Gemini AI.
						</p>
						<div className="flex items-center gap-2 text-xs text-green-500 font-medium bg-green-500/5 border border-green-500/10 w-fit px-3 py-1.5 rounded-full">
							<span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
							CoinGecko API: Operational
						</div>
					</div>

					{/* Navigation Links Column */}
					<div className="space-y-4">
						<h4 className="text-sm font-semibold text-white uppercase tracking-wider">Navigation</h4>
						<ul className="space-y-2 text-sm">
							<li>
								<Link href="/" className="text-purple-200/60 hover:text-purple-100 transition-colors">
									Dashboard Home
								</Link>
							</li>
							<li>
								<Link href="/#trending-coins" className="text-purple-200/60 hover:text-purple-100 transition-colors">
									Trending Coins
								</Link>
							</li>
							<li>
								<Link href="/#categories" className="text-purple-200/60 hover:text-purple-100 transition-colors">
									Coin Categories
								</Link>
							</li>
						</ul>
					</div>

					{/* Risk & Safety Note Column */}
					<div className="space-y-4">
						<h4 className="text-sm font-semibold text-white uppercase tracking-wider">Platform Info</h4>
						<div className="flex items-start gap-2 text-xs text-purple-200/50 leading-relaxed">
							<Info className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
							<span>
								Charts rendered using TradingView's lightweight-charts engine. Prices retrieved from CoinGecko API (Demo License).
							</span>
						</div>
						<div className="flex items-start gap-2 text-xs text-purple-200/50 leading-relaxed">
							<ShieldCheck className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
							<span>
								Safety metrics are calculated algorithmically based on volatility and volume to identify trading risk.
							</span>
						</div>
					</div>
				</div>

				{/* Divider */}
				<div className="border-t border-purple-500/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
					<p className="text-xs text-purple-200/40 text-center md:text-left leading-relaxed max-w-2xl">
						<strong>Disclaimer:</strong> Cryptocurrency assets are highly volatile and speculative. 
						The safety index, chatbot analysis, and screener metrics on BitPulse are for educational and informational purposes only. 
						They do not constitute financial or investment advice. Always perform your own diligence before trading.
					</p>
					<div className="text-xs text-purple-200/40 flex items-center gap-1 shrink-0">
						&copy; {new Date().getFullYear()} BitPulse. Built with <Heart className="w-3 h-3 text-red-500" />
					</div>
				</div>
			</div>
		</footer>
	);
}
