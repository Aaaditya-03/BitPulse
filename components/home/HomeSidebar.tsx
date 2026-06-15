"use client";

import { useCallback, useEffect, useState } from "react";
import TopGainersLosers from "./TopGainersLosers";
import WatchlistWidget from "./WatchlistWidget";

/**
 * A sidebar manager client component that checks the localStorage watchlist
 * and dynamically adapts the rendering layout:
 * - Always shows the WatchlistWidget (renders a skeleton if empty).
 * - Dynamically increases/decreases the heights of both the watchlist and the top leaders
 *   table so that their combined height is exactly 672px, aligning perfectly with the chart.
 */
export default function HomeSidebar() {
	const [watchlistCount, setWatchlistCount] = useState<number>(0);
	const [mounted, setMounted] = useState(false);

	const checkWatchlist = useCallback(() => {
		const stored = localStorage.getItem("BITPULSE_WATCHLIST");
		const ids: string[] = stored ? JSON.parse(stored) : [];
		setWatchlistCount(ids.length);
	}, []);

	useEffect(() => {
		setMounted(true);
		checkWatchlist();

		const handleUpdate = () => {
			checkWatchlist();
		};

		window.addEventListener("watchlist-updated", handleUpdate);
		return () => {
			window.removeEventListener("watchlist-updated", handleUpdate);
		};
	}, [checkWatchlist]);

	// Server-rendered skeleton to match standard hydrated state to prevent hydration mismatches
	if (!mounted) {
		return (
			<div className="flex flex-col gap-8">
				<div className="w-full bg-dark-500 rounded-xl p-5 border border-purple-500/10 h-[130px] animate-pulse flex items-center justify-center">
					<span className="text-xs text-purple-200/30">
						Loading Watchlist...
					</span>
				</div>
				<div className="w-full bg-dark-500 rounded-xl p-6 h-[510px] flex items-center justify-center border border-purple-500/10 animate-pulse">
					<span className="text-sm text-purple-200/50">Loading leaders...</span>
				</div>
			</div>
		);
	}

	// Calculate heights dynamically to sum up to exactly 672px (including the 32px flex gap)
	let watchlistHeight = 260;
	if (watchlistCount === 0) watchlistHeight = 130;
	else if (watchlistCount === 1) watchlistHeight = 178;
	else if (watchlistCount === 2) watchlistHeight = 226;

	const leadersHeight = 640 - watchlistHeight;

	return (
		<div className="flex flex-col gap-5 transition-all duration-300">
			<WatchlistWidget height={watchlistHeight} />
			<TopGainersLosers height={leadersHeight} />
		</div>
	);
}
