import React from "react";
import { getGlobalMarketData } from "@/lib/coingecko.actions";
import { TrendingUp, TrendingDown, Coins, Activity, Percent, Database } from "lucide-react";

export default async function MarketStatsBar() {
	const data = await getGlobalMarketData();

	if (!data) {
		return (
			<div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
				{[...Array(4)].map((_, i) => (
					<div key={i} className="bg-dark-500/30 border border-purple-500/5 backdrop-blur-md rounded-2xl p-4 h-24 animate-pulse" />
				))}
			</div>
		);
	}

	const totalCap = data.total_market_cap?.usd ?? 0;
	const totalVol = data.total_volume?.usd ?? 0;
	const btcDominance = data.market_cap_percentage?.btc ?? 0;
	const capChange24h = data.market_cap_change_percentage_24h_usd ?? 0;
	const activeCoins = data.active_cryptocurrencies ?? 0;
	const isCapUp = capChange24h >= 0;

	return (
		<div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full" id="market-stats-bar">
			{/* Market Cap */}
			<div className="bg-dark-500/30 border border-purple-500/10 hover:border-purple-500/20 backdrop-blur-md rounded-2xl p-4 flex items-center justify-between transition-all duration-300">
				<div>
					<span className="text-[11px] font-semibold text-purple-200/50 uppercase tracking-wider block">
						Total Market Cap
					</span>
					<span className="text-base sm:text-lg font-bold text-white mt-1 block">
						${(totalCap / 1e12).toFixed(2)}T
					</span>
					<span className={`text-xs font-semibold flex items-center gap-0.5 mt-1 ${isCapUp ? "text-green-500" : "text-red-500"}`}>
						{isCapUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
						{isCapUp ? "+" : ""}{capChange24h.toFixed(2)}%
					</span>
				</div>
				<div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
					<Coins className="w-5 h-5" />
				</div>
			</div>

			{/* 24h Volume */}
			<div className="bg-dark-500/30 border border-purple-500/10 hover:border-purple-500/20 backdrop-blur-md rounded-2xl p-4 flex items-center justify-between transition-all duration-300">
				<div>
					<span className="text-[11px] font-semibold text-purple-200/50 uppercase tracking-wider block">
						24h Global Volume
					</span>
					<span className="text-base sm:text-lg font-bold text-white mt-1 block">
						${(totalVol / 1e9).toFixed(2)}B
					</span>
					<span className="text-xs text-purple-200/40 block mt-1">
						Total exchange transactions
					</span>
				</div>
				<div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
					<Activity className="w-5 h-5" />
				</div>
			</div>

			{/* BTC Dominance */}
			<div className="bg-dark-500/30 border border-purple-500/10 hover:border-purple-500/20 backdrop-blur-md rounded-2xl p-4 flex items-center justify-between transition-all duration-300">
				<div>
					<span className="text-[11px] font-semibold text-purple-200/50 uppercase tracking-wider block">
						BTC Dominance
					</span>
					<span className="text-base sm:text-lg font-bold text-white mt-1 block">
						{btcDominance.toFixed(1)}%
					</span>
					<span className="text-xs text-purple-200/40 block mt-1">
						Bitcoin market share percentage
					</span>
				</div>
				<div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
					<Percent className="w-5 h-5" />
				</div>
			</div>

			{/* Active Cryptocurrencies */}
			<div className="bg-dark-500/30 border border-purple-500/10 hover:border-purple-500/20 backdrop-blur-md rounded-2xl p-4 flex items-center justify-between transition-all duration-300">
				<div>
					<span className="text-[11px] font-semibold text-purple-200/50 uppercase tracking-wider block">
						Active Coins
					</span>
					<span className="text-base sm:text-lg font-bold text-white mt-1 block">
						{activeCoins.toLocaleString()}
					</span>
					<span className="text-xs text-purple-200/40 block mt-1">
						Tracked assets worldwide
					</span>
				</div>
				<div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
					<Database className="w-5 h-5" />
				</div>
			</div>
		</div>
	);
}
