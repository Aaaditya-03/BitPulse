import React, { Suspense } from "react";
import Categories from "@/components/home/Categories";
import CoinOverview from "@/components/home/CoinOverview";
import {
	CategoriesFallback,
	CoinOverviewFallback,
	TrendingCoinsFallback,
} from "@/components/home/fallback";
import TrendingCoins from "@/components/home/TrendingCoins";

/**
 * The main landing page of the application, rendering key widgets and overviews.
 * @returns The home page component containing Coin Overview, Trending Coins, and Categories.
 */
const Page = async () => {
	return (
		<main className="main-container">
			<section className="home-grid">
				<Suspense fallback={<CoinOverviewFallback />}>
					<CoinOverview />
				</Suspense>

				<Suspense fallback={<TrendingCoinsFallback />}>
					<TrendingCoins />
				</Suspense>
			</section>

			<section className="w-full mt-7 space-y-4">
				<Suspense fallback={<CategoriesFallback />}>
					<Categories />
				</Suspense>
			</section>
		</main>
	);
};

export default Page;
