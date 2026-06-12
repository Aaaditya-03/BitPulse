import {
	ArrowLeft,
	Award,
	BarChart2,
	ShieldAlert,
	TrendingDown,
	TrendingUp,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import CandlestickChart from "@/components/CandlestickChart";
import { CoinOverviewFallback } from "@/components/home/fallback";
import WatchlistStar from "@/components/ui/WatchlistStar";
import { fetcher } from "@/lib/coingecko.actions";
import { formatCurrency } from "@/lib/utils";

interface PageProps {
	params: Promise<{ id: string }>;
}

export default async function CoinDetailPage({ params }: PageProps) {
	const { id } = await params;

	try {
		// Fetch coin details and 1-day OHLC data in parallel
		const [coin, coinOHLCData] = await Promise.all([
			fetcher<CoinDetailsData>(`/coins/${id}`, {
				dex_pair_format: "symbol",
			}),
			fetcher<OHLCData[]>(`/coins/${id}/ohlc`, {
				vs_currency: "usd",
				days: 1,
				precision: "full",
			}),
		]);

		const priceUsd = coin.market_data.current_price.usd;
		const priceInr = coin.market_data.current_price.inr;
		const priceChange24h =
			coin.market_data.price_change_percentage_24h_in_currency.usd || 0;
		const isPositive = priceChange24h >= 0;

		return (
			<main className="main-container max-w-7xl mx-auto px-4 py-8">
				{/* Back Button */}
				<Link
					href="/"
					className="inline-flex items-center gap-2 text-sm text-purple-200/60 hover:text-purple-100 mb-6 transition-all"
				>
					<ArrowLeft className="w-4 h-4" />
					Back to Screener Dashboard
				</Link>

				{/* Header Section */}
				<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 bg-dark-600/40 border border-purple-500/10 backdrop-blur-md p-6 rounded-2xl">
					<div className="flex items-center gap-4">
						<Image
							src={coin.image.large}
							alt={coin.name}
							width={64}
							height={64}
							className="rounded-full shadow-lg shadow-purple-500/10"
						/>
						<div>
							<div className="flex items-center gap-2">
								<h1 className="text-2xl font-bold text-white">{coin.name}</h1>
								<span className="text-xs px-2 py-0.5 rounded bg-purple-500/20 text-purple-200 border border-purple-500/30 uppercase font-semibold">
									{coin.symbol}
								</span>
								<span className="text-xs px-2 py-0.5 rounded bg-dark-800 text-purple-200/60 border border-purple-500/5 font-semibold">
									Rank #{coin.market_cap_rank}
								</span>
								<WatchlistStar coinId={id} className="ml-1" />
							</div>
							<p className="text-sm text-purple-200/50 mt-1">
								Real-time chart & analytical screening
							</p>
						</div>
					</div>

					<div className="flex flex-col items-start md:items-end">
						<div className="flex items-baseline gap-2">
							<span className="text-3xl font-extrabold tracking-tight text-white">
								{formatCurrency(priceInr)}
							</span>
							<span className="text-sm text-purple-200/60 font-medium">
								(${priceUsd.toLocaleString()})
							</span>
						</div>
						<div
							className={`flex items-center gap-1 mt-1 text-sm font-semibold ${
								isPositive ? "text-green-500" : "text-red-500"
							}`}
						>
							{isPositive ? (
								<TrendingUp className="w-4 h-4" />
							) : (
								<TrendingDown className="w-4 h-4" />
							)}
							{isPositive ? "+" : ""}
							{priceChange24h.toFixed(2)}% (24h)
						</div>
					</div>
				</div>

				{/* Grid Layout */}
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					{/* Interactive Chart (2 cols) */}
					<div className="lg:col-span-2 space-y-6">
						<div className="bg-dark-600/30 border border-purple-500/10 backdrop-blur-md p-6 rounded-2xl shadow-xl">
							<h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
								<BarChart2 className="w-5 h-5 text-purple-400" />
								Interactive Candlestick Chart
							</h2>
							<Suspense fallback={<CoinOverviewFallback />}>
								<CandlestickChart
									data={coinOHLCData}
									coinId={id}
									height={380}
								/>
							</Suspense>
						</div>

						{/* Description Section */}
						{coin.description?.en && (
							<div className="bg-dark-600/30 border border-purple-500/10 backdrop-blur-md p-6 rounded-2xl">
								<h2 className="text-lg font-bold text-white mb-3">
									About {coin.name}
								</h2>
								<div
									className="text-sm text-purple-200/70 leading-relaxed space-y-4 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-purple-500/10"
									// biome-ignore lint/security/noDangerouslySetInnerHtml: Sanitized coin description from CoinGecko
									dangerouslySetInnerHTML={{
										__html: coin.description.en.replace(
											/<a\b[^>]*>(.*?)<\/a>/gi,
											"$1",
										), // Strips external links to keep user safe
									}}
								/>
							</div>
						)}
					</div>

					{/* Market Metrics Sidebar (1 col) */}
					<div className="space-y-6">
						<div className="bg-dark-600/30 border border-purple-500/10 backdrop-blur-md p-6 rounded-2xl shadow-xl">
							<h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
								<Award className="w-5 h-5 text-purple-400" />
								Market Data Insights
							</h2>

							<div className="space-y-4">
								<div className="flex justify-between items-center py-2.5 border-b border-purple-500/5">
									<span className="text-sm text-purple-200/50">
										Market Capitalization
									</span>
									<span className="text-sm font-semibold text-white">
										${coin.market_data.market_cap.usd.toLocaleString()}
									</span>
								</div>

								<div className="flex justify-between items-center py-2.5 border-b border-purple-500/5">
									<span className="text-sm text-purple-200/50">
										24h Trading Volume
									</span>
									<span className="text-sm font-semibold text-white">
										${coin.market_data.total_volume.usd.toLocaleString()}
									</span>
								</div>

								<div className="flex justify-between items-center py-2.5 border-b border-purple-500/5">
									<span className="text-sm text-purple-200/50">
										24h High / Low
									</span>
									<span className="text-sm font-semibold text-white">
										${coin.market_data.high_24h?.usd?.toLocaleString() ?? "N/A"}{" "}
										/ $
										{coin.market_data.low_24h?.usd?.toLocaleString() ?? "N/A"}
									</span>
								</div>

								<div className="flex justify-between items-center py-2.5 border-b border-purple-500/5">
									<span className="text-sm text-purple-200/50">
										Circulating Supply
									</span>
									<span className="text-sm font-semibold text-white">
										{coin.market_data.circulating_supply?.toLocaleString()}{" "}
										{coin.symbol.toUpperCase()}
									</span>
								</div>

								{coin.market_data.max_supply && (
									<div className="flex justify-between items-center py-2.5 border-b border-purple-500/5">
										<span className="text-sm text-purple-200/50">
											Max Supply
										</span>
										<span className="text-sm font-semibold text-white">
											{coin.market_data.max_supply.toLocaleString()}{" "}
											{coin.symbol.toUpperCase()}
										</span>
									</div>
								)}
							</div>
						</div>

						{/* Disclaimer Box */}
						<div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20 flex gap-3 text-amber-200/80">
							<ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
							<div>
								<h4 className="text-sm font-semibold text-amber-200">
									Risk Disclaimer
								</h4>
								<p className="text-xs leading-relaxed mt-1">
									Cryptocurrency trading involves high risk. Volatile market
									conditions can result in rapid financial loss. Perform your
									own detailed analysis.
								</p>
							</div>
						</div>
					</div>
				</div>
			</main>
		);
	} catch (error) {
		console.error("Error loading coin details page:", error);
		return (
			<main className="main-container max-w-7xl mx-auto px-4 py-16 flex flex-col items-center justify-center text-center">
				<ShieldAlert className="w-16 h-16 text-purple-500 mb-4 animate-bounce" />
				<h1 className="text-2xl font-bold text-white">
					Failed to Load Coin Details
				</h1>
				<p className="text-sm text-purple-200/60 max-w-md mt-2">
					CoinGecko API might be heavily rate-limited. Please return to the
					homepage screener or try again shortly.
				</p>
				<Link
					href="/"
					className="mt-6 px-6 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-sm font-medium rounded-xl hover:brightness-110 shadow-lg shadow-purple-500/20 transition-all"
				>
					Back to Dashboard
				</Link>
			</main>
		);
	}
}
