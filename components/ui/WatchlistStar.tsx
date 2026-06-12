"use client";

import { Star } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface WatchlistStarProps {
	coinId: string;
	className?: string;
}

export default function WatchlistStar({
	coinId,
	className,
}: WatchlistStarProps) {
	const [isStarred, setIsStarred] = useState(false);
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
		const watchlist = JSON.parse(
			localStorage.getItem("BITPULSE_WATCHLIST") || "[]",
		);
		setIsStarred(watchlist.includes(coinId));
	}, [coinId]);

	const toggleWatchlist = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();

		const watchlist = JSON.parse(
			localStorage.getItem("BITPULSE_WATCHLIST") || "[]",
		);
		let newWatchlist: string[];

		if (watchlist.includes(coinId)) {
			newWatchlist = watchlist.filter((id: string) => id !== coinId);
			setIsStarred(false);
		} else {
			newWatchlist = [...watchlist, coinId];
			setIsStarred(true);
		}

		localStorage.setItem("BITPULSE_WATCHLIST", JSON.stringify(newWatchlist));

		// Dispatch custom event to notify other components (like WatchlistWidget)
		window.dispatchEvent(new Event("watchlist-updated"));
	};

	if (!mounted) {
		// Render placeholder outline star during SSR / Hydration to avoid layout shift
		return (
			<div
				className={cn(
					"p-1.5 rounded-lg text-purple-200/30 w-8 h-8 flex items-center justify-center",
					className,
				)}
			>
				<Star className="w-4.5 h-4.5" />
			</div>
		);
	}

	return (
		<button
			type="button"
			onClick={toggleWatchlist}
			className={cn(
				"p-1.5 rounded-lg hover:bg-purple-500/10 text-purple-200/50 hover:text-yellow-400 active:scale-95 transition-all duration-200 flex items-center justify-center w-8 h-8",
				isStarred && "text-yellow-400!",
				className,
			)}
			title={isStarred ? "Remove from Watchlist" : "Add to Watchlist"}
		>
			<Star
				className={cn(
					"w-4.5 h-4.5 transition-transform duration-200",
					isStarred ? "fill-yellow-400 stroke-yellow-500 scale-110" : "",
				)}
			/>
		</button>
	);
}
