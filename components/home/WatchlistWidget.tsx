"use client";

import { Eye, Loader2, TrendingDown, TrendingUp } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { getWatchlistCoins } from "@/lib/coingecko.actions";
import { cn, formatCurrency } from "@/lib/utils";
import WatchlistStar from "../ui/WatchlistStar";

export default function WatchlistWidget() {
	const [coins, setCoins] = useState<CoinMarketData[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [watchlistIds, setWatchlistIds] = useState<string[]>([]);
	const [mounted, setMounted] = useState(false);

	const loadWatchlist = useCallback(async () => {
		const stored = localStorage.getItem("BITPULSE_WATCHLIST");
		const ids: string[] = stored ? JSON.parse(stored) : [];
		setWatchlistIds(ids);

		if (ids.length === 0) {
			setCoins([]);
			setIsLoading(false);
			return;
		}

		try {
			const data = await getWatchlistCoins(ids);
			setCoins(data);
		} catch (error) {
			console.error("Failed to load watchlist coins:", error);
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		setMounted(true);
		loadWatchlist();

		const handleUpdate = () => {
			loadWatchlist();
		};

		window.addEventListener("watchlist-updated", handleUpdate);
		return () => {
			window.removeEventListener("watchlist-updated", handleUpdate);
		};
	}, [loadWatchlist]);

	if (!mounted) return null;

	if (isLoading) {
		return (
			<div className="w-full bg-dark-500 rounded-xl p-5 border border-purple-500/10 h-[260px] flex items-center justify-center">
				<div className="flex flex-col items-center gap-2">
					<Loader2 className="w-6 h-6 animate-spin text-purple-400" />
					<span className="text-xs text-purple-200/50">
						Loading Watchlist...
					</span>
				</div>
			</div>
		);
	}

	return (
		<div
			id="watchlist-widget"
			className="w-full bg-dark-500 rounded-xl p-5 border border-purple-500/10 flex flex-col h-[260px] overflow-hidden justify-between animate-in fade-in duration-300"
		>
			<div className="h-full flex flex-col overflow-hidden">
				<h4 className="text-sm font-semibold tracking-wider text-purple-100 flex items-center gap-2 mb-3 shrink-0">
					<Eye className="w-4 h-4 text-purple-400" />
					My Watchlist
				</h4>

				{watchlistIds.length === 0 ? (
					<div className="flex-1 flex flex-col items-center justify-center text-center p-4">
						<span className="text-xs text-purple-200/40 leading-relaxed">
							Your watchlist is empty.
							<br />
							Star coins to monitor prices live.
						</span>
					</div>
				) : (
					<div className="flex-1 overflow-y-auto space-y-2.5 pr-1 scrollbar-thin scrollbar-thumb-purple-500/10">
						{coins.map((coin) => {
							const change = coin.price_change_percentage_24h ?? 0;
							const isUp = change >= 0;

							return (
								<div
									key={coin.id}
									className="flex items-center justify-between p-2 rounded-lg hover:bg-purple-600/5 transition-all duration-300 group border border-transparent hover:border-purple-500/5"
								>
									<Link
										href={`/coin/${coin.id}`}
										className="flex items-center gap-2.5 flex-1 min-w-0"
									>
										<Image
											src={coin.image}
											alt={coin.name}
											width={24}
											height={24}
											className="rounded-full bg-dark-400 shrink-0"
										/>
										<div className="flex flex-col min-w-0">
											<span className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors truncate">
												{coin.name}
											</span>
											<span className="text-[10px] text-purple-200/40 uppercase font-semibold">
												{coin.symbol}
											</span>
										</div>
									</Link>

									<div className="flex items-center gap-3 shrink-0">
										<div className="flex flex-col items-end">
											<span className="text-xs font-semibold text-purple-100">
												{formatCurrency(coin.current_price)}
											</span>
											<span
												className={cn(
													"text-[9px] font-bold flex items-center gap-0.5 mt-0.5",
													isUp ? "text-green-500" : "text-red-500",
												)}
											>
												{isUp ? (
													<TrendingUp className="w-2.5 h-2.5" />
												) : (
													<TrendingDown className="w-2.5 h-2.5" />
												)}
												{change.toFixed(2)}%
											</span>
										</div>

										<WatchlistStar
											coinId={coin.id}
											className="w-7 h-7 text-purple-200/30 hover:bg-purple-500/5"
										/>
									</div>
								</div>
							);
						})}
					</div>
				)}
			</div>
		</div>
	);
}
