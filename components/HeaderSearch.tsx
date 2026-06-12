"use client";

import { Loader2, Search, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { searchCoins } from "@/lib/coingecko.actions";
import { formatPercentage } from "@/lib/utils";

export default function HeaderSearch() {
	const [query, setQuery] = useState("");
	const [results, setResults] = useState<SearchCoin[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isOpen, setIsOpen] = useState(false);

	const router = useRouter();
	const containerRef = useRef<HTMLDivElement | null>(null);
	const inputRef = useRef<HTMLInputElement | null>(null);

	// Shortcut listener for Ctrl + K or '/'
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if ((e.ctrlKey || e.metaKey) && e.key === "k") {
				e.preventDefault();
				setIsOpen(true);
				inputRef.current?.focus();
			} else if (e.key === "/" && document.activeElement !== inputRef.current) {
				e.preventDefault();
				setIsOpen(true);
				inputRef.current?.focus();
			} else if (e.key === "Escape") {
				setIsOpen(false);
				inputRef.current?.blur();
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, []);

	// Click outside to close handler
	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (
				containerRef.current &&
				!containerRef.current.contains(e.target as Node)
			) {
				setIsOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	// Debounce search query
	useEffect(() => {
		if (query.trim().length < 2) {
			setResults([]);
			setIsLoading(false);
			return;
		}

		setIsLoading(true);
		const timer = setTimeout(async () => {
			try {
				const coins = await searchCoins(query);
				setResults(coins.slice(0, 5)); // Limit to top 5 results
			} catch (err) {
				console.error(err);
			} finally {
				setIsLoading(false);
			}
		}, 300);

		return () => clearTimeout(timer);
	}, [query]);

	const handleSelect = (coinId: string) => {
		setQuery("");
		setResults([]);
		setIsOpen(false);
		router.push(`/coin/${coinId}`);
	};

	return (
		<div
			ref={containerRef}
			className="relative w-48 sm:w-64 md:w-80"
			id="search-modal"
		>
			<div className="relative flex items-center h-10 bg-dark-500/80 border border-purple-500/10 hover:border-purple-500/30 rounded-xl px-3 text-purple-100/60 focus-within:border-purple-500/40 focus-within:text-purple-100 transition-all duration-300">
				<Search className="w-4 h-4 mr-2 text-purple-400" />
				<input
					ref={inputRef}
					type="text"
					value={query}
					onChange={(e) => {
						setQuery(e.target.value);
						setIsOpen(true);
					}}
					onFocus={() => setIsOpen(true)}
					placeholder="Search coins... (Ctrl + K)"
					className="w-full bg-transparent border-none text-sm text-purple-100 placeholder-purple-200/30 focus:outline-none focus:ring-0 py-1"
				/>
				{query && (
					<button
						onClick={() => setQuery("")}
						className="p-1 text-purple-200/40 hover:text-purple-100 rounded-full"
						type="button"
					>
						<X className="w-3.5 h-3.5" />
					</button>
				)}
				{!query && (
					<kbd className="pointer-events-none hidden md:inline-flex h-5 select-none items-center gap-1 rounded bg-dark-400 px-1.5 font-mono text-[9px] font-semibold text-purple-100/40 border border-purple-500/5">
						Ctrl K
					</kbd>
				)}
			</div>

			{/* Dropdown panel */}
			{isOpen && (query.trim().length >= 2 || isLoading) && (
				<div className="absolute top-12 left-0 right-0 z-50 bg-dark-500/95 backdrop-blur-xl border border-purple-500/20 rounded-xl shadow-2xl p-2 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-500/15 animate-in fade-in slide-in-from-top-2 duration-200">
					{isLoading ? (
						<div className="flex items-center justify-center py-6 text-sm text-purple-200/50 gap-2">
							<Loader2 className="w-4 h-4 animate-spin text-purple-400" />
							Searching CoinGecko...
						</div>
					) : results.length > 0 ? (
						<div className="divide-y divide-purple-500/5">
							{results.map((coin) => {
								const change24h = coin.data?.price_change_percentage_24h;
								const price = coin.data?.price;
								const hasPrice = price !== undefined && price !== null;
								const hasChange = change24h !== undefined && change24h !== null;

								return (
									<button
										key={coin.id}
										type="button"
										onClick={() => handleSelect(coin.id)}
										className="search-item w-full text-left bg-transparent border-none focus:outline-none px-3 py-2.5 rounded-lg flex items-center justify-between hover:bg-purple-600/10 cursor-pointer transition-all"
									>
										<div className="coin-info flex items-center gap-3">
											<Image
												src={coin.large || coin.thumb || "/logo.svg"}
												alt={coin.name}
												width={28}
												height={28}
												className="rounded-full bg-dark-400"
											/>
											<div className="flex flex-col">
												<span className="text-sm font-semibold text-white leading-none">
													{coin.name}
												</span>
												<span className="coin-symbol text-[10px] text-purple-200/50 mt-1 uppercase font-semibold">
													{coin.symbol}
												</span>
											</div>
										</div>

										<div className="flex flex-col items-end shrink-0">
											{hasPrice && (
												<span className="coin-price text-xs font-semibold text-purple-100">
													${price < 0.01 ? price.toFixed(6) : price.toFixed(2)}
												</span>
											)}
											{hasChange && (
												<span
													className={`coin-change text-[10px] font-semibold flex items-center gap-0.5 mt-0.5 ${
														change24h >= 0 ? "text-green-500" : "text-red-500"
													}`}
												>
													{change24h >= 0 ? "+" : ""}
													{formatPercentage(change24h)}
												</span>
											)}
											{!hasPrice && coin.market_cap_rank && (
												<span className="text-[10px] text-purple-200/40">
													Rank #{coin.market_cap_rank}
												</span>
											)}
										</div>
									</button>
								);
							})}
						</div>
					) : (
						<div className="py-6 text-center text-sm text-purple-200/40">
							No coins found for "{query}"
						</div>
					)}
				</div>
			)}
		</div>
	);
}
