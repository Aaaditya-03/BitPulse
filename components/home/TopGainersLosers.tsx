"use client";

import { Loader2, TrendingDown, TrendingUp } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getTopGainersLosers } from "@/lib/coingecko.actions";
import { formatCurrency } from "@/lib/utils";

export default function TopGainersLosers() {
	const [activeTab, setActiveTab] = useState<"gainers" | "losers">("gainers");
	const [data, setData] = useState<{
		gainers: CoinMarketData[];
		losers: CoinMarketData[];
	} | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		async function fetchData() {
			try {
				const result = await getTopGainersLosers();
				setData(result);
			} catch (error) {
				console.error("Error loading top gainers/losers:", error);
			} finally {
				setIsLoading(false);
			}
		}
		fetchData();
	}, []);

	if (isLoading) {
		return (
			<div className="w-full bg-dark-500 rounded-xl p-6 h-[380px] flex items-center justify-center border border-purple-500/10">
				<div className="flex flex-col items-center gap-2">
					<Loader2 className="w-8 h-8 animate-spin text-purple-400" />
					<span className="text-sm text-purple-200/50">
						Loading Market Leaders...
					</span>
				</div>
			</div>
		);
	}

	const list =
		activeTab === "gainers" ? (data?.gainers ?? []) : (data?.losers ?? []);

	return (
		<div
			id="top-gainers-losers"
			className="w-full bg-dark-500 rounded-xl p-5 border border-purple-500/10 flex flex-col justify-between h-[380px]"
		>
			<div>
				{/* Tab Header */}
				<div className="flex border-b border-purple-500/5 mb-4">
					<button
						onClick={() => setActiveTab("gainers")}
						className={`flex-1 pb-3 text-sm font-semibold tracking-wider transition-all relative ${
							activeTab === "gainers"
								? "text-white"
								: "text-purple-200/40 hover:text-purple-200/60"
						}`}
						type="button"
					>
						Top Gainers
						{activeTab === "gainers" && (
							<div className="absolute bottom-0 left-0 right-0 h-[2px] bg-green-500" />
						)}
					</button>
					<button
						onClick={() => setActiveTab("losers")}
						className={`flex-1 pb-3 text-sm font-semibold tracking-wider transition-all relative ${
							activeTab === "losers"
								? "text-white"
								: "text-purple-200/40 hover:text-purple-200/60"
						}`}
						type="button"
					>
						Top Losers
						{activeTab === "losers" && (
							<div className="absolute bottom-0 left-0 right-0 h-[2px] bg-red-500" />
						)}
					</button>
				</div>

				{/* List */}
				{list.length > 0 ? (
					<div className="space-y-3.5">
						{list.map((coin) => {
							const change = coin.price_change_percentage_24h ?? 0;
							const isUp = change >= 0;

							return (
								<Link
									key={coin.id}
									href={`/coin/${coin.id}`}
									className="flex items-center justify-between p-2 rounded-lg hover:bg-purple-600/5 transition-all group"
								>
									<div className="flex items-center gap-3">
										<Image
											src={coin.image}
											alt={coin.name}
											width={28}
											height={28}
											className="rounded-full bg-dark-400"
										/>
										<div className="flex flex-col">
											<span className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors">
												{coin.name}
											</span>
											<span className="text-[10px] text-purple-200/40 uppercase font-semibold">
												{coin.symbol}
											</span>
										</div>
									</div>

									<div className="flex items-center gap-4 shrink-0">
										<span className="text-xs font-semibold text-purple-100">
											{formatCurrency(coin.current_price)}
										</span>
										<span
											className={`text-[11px] font-bold px-2 py-0.5 rounded flex items-center gap-0.5 min-w-[65px] justify-center ${
												isUp
													? "bg-green-500/10 text-green-500"
													: "bg-red-500/10 text-red-500"
											}`}
										>
											{isUp ? (
												<TrendingUp className="w-3 h-3" />
											) : (
												<TrendingDown className="w-3 h-3" />
											)}
											{change.toFixed(2)}%
										</span>
									</div>
								</Link>
							);
						})}
					</div>
				) : (
					<div className="text-center text-sm text-purple-200/40 py-12">
						No data available.
					</div>
				)}
			</div>

			{/* Market disclaimer */}
			<div className="text-[9px] text-purple-200/30 text-center mt-3 pt-3 border-t border-purple-500/5">
				Prices represent past 24h USD changes.
			</div>
		</div>
	);
}
