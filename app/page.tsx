import { Suspense } from "react";
import Categories from "@/components/home/Categories";
import CoinOverview from "@/components/home/CoinOverview";
import {
	CategoriesFallback,
	CoinOverviewFallback,
	TrendingCoinsFallback,
} from "@/components/home/fallback";
import MarketStatsBar from "@/components/home/MarketStatsBar";
import TopGainersLosers from "@/components/home/TopGainersLosers";
import TrendingCoins from "@/components/home/TrendingCoins";
import WatchlistWidget from "@/components/home/WatchlistWidget";

/**
 * The main landing page of the application, rendering key widgets and overviews.
 * @returns The home page component containing Coin Overview, Trending Coins, and Categories.
 */
const Page = async () => {
	return (
		<main className="main-container max-w-7xl mx-auto px-4 py-8 space-y-8">
			{/* Top: Macro Market Stats Bar */}
			<section className="w-full">
				<Suspense
					fallback={
						<div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
							{["sk-stats-1", "sk-stats-2", "sk-stats-3", "sk-stats-4"].map(
								(keyId) => (
									<div
										key={keyId}
										className="bg-dark-500/30 border border-purple-500/5 backdrop-blur-md rounded-2xl p-4 h-24 animate-pulse"
									/>
								),
							)}
						</div>
					}
				>
					<MarketStatsBar />
				</Suspense>
			</section>

			{/* Middle: Chart & Sidebar Leaderboard Grid */}
			<section className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
				{/* Chart Area (2/3 width on desktop) */}
				<div className="xl:col-span-2">
					<Suspense fallback={<CoinOverviewFallback />}>
						<CoinOverview />
					</Suspense>
				</div>

				{/* Sidebar stack (1/3 width on desktop) */}
				<div className="flex flex-col gap-8">
					<Suspense
						fallback={
							<div className="w-full bg-dark-500 rounded-xl p-5 border border-purple-500/10 h-[260px] animate-pulse flex items-center justify-center">
								<span className="text-xs text-purple-200/30">
									Loading Watchlist...
								</span>
							</div>
						}
					>
						<WatchlistWidget />
					</Suspense>

					<Suspense fallback={<TrendingCoinsFallback />}>
						<TrendingCoins />
					</Suspense>

					<Suspense
						fallback={
							<div className="w-full bg-dark-500 rounded-xl p-6 h-[380px] flex items-center justify-center border border-purple-500/10 animate-pulse">
								<span className="text-sm text-purple-200/50">
									Loading leaders...
								</span>
							</div>
						}
					>
						<TopGainersLosers />
					</Suspense>
				</div>
			</section>

			{/* Bottom: Asset Categories */}
			<section className="w-full space-y-4">
				<Suspense fallback={<CategoriesFallback />}>
					<Categories />
				</Suspense>
			</section>
		</main>
	);
};

export default Page;
