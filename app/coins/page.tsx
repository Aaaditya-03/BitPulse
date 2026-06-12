import {
	ChevronLeft,
	ChevronRight,
	TrendingDown,
	TrendingUp,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import DataTable from "@/components/DataTable";
import WatchlistStar from "@/components/ui/WatchlistStar";
import { getCoinsMarkets } from "@/lib/coingecko.actions";
import { cn, formatCurrency, formatPercentage } from "@/lib/utils";

interface PageProps {
	searchParams: Promise<{ page?: string }>;
}

export default async function CoinsListPage({ searchParams }: PageProps) {
	const params = await searchParams;
	const currentPage = Math.max(1, Number(params.page || "1"));
	const perPage = 25; // 25 coins per page is responsive and fits the screen nicely

	const coins = await getCoinsMarkets(currentPage, perPage);

	const columns: DataTableColumn<CoinMarketData>[] = [
		{
			key: "watchlist",
			header: "",
			cellClassName: "w-8 py-3!",
			cell: (coin) => <WatchlistStar coinId={coin.id} />,
		},
		{
			key: "rank",
			header: "Rank",
			cellClassName: "text-purple-200/50 w-12 font-medium text-center",
			cell: (coin) => `#${coin.market_cap_rank}`,
		},
		{
			key: "name",
			header: "Name",
			cellClassName: "name-cell",
			cell: (coin) => (
				<Link href={`/coin/${coin.id}`} className="flex items-center gap-3">
					<Image
						src={coin.image}
						alt={coin.name}
						width={32}
						height={32}
						className="rounded-full bg-dark-400"
					/>
					<div>
						<p className="font-semibold text-white hover:text-purple-300 transition-colors">
							{coin.name}
						</p>
						<p className="text-[10px] text-purple-200/40 uppercase font-semibold">
							{coin.symbol}
						</p>
					</div>
				</Link>
			),
		},
		{
			key: "price",
			header: "Price",
			cellClassName: "font-semibold text-white",
			cell: (coin) => formatCurrency(coin.current_price),
		},
		{
			key: "change",
			header: "24h Change",
			cellClassName: "font-semibold",
			cell: (coin) => {
				const change = coin.price_change_percentage_24h ?? 0;
				const isUp = change >= 0;
				return (
					<div
						className={cn(
							"flex items-center gap-0.5",
							isUp ? "text-green-500" : "text-red-500",
						)}
					>
						{isUp ? (
							<TrendingUp className="w-4 h-4" />
						) : (
							<TrendingDown className="w-4 h-4" />
						)}
						{formatPercentage(change)}
					</div>
				);
			},
		},
		{
			key: "market_cap",
			header: "Market Cap",
			cellClassName: "text-purple-200/80 font-medium",
			cell: (coin) => `$${coin.market_cap.toLocaleString()}`,
		},
		{
			key: "volume",
			header: "24h Volume",
			cellClassName: "text-purple-200/80 font-medium",
			cell: (coin) => `$${coin.total_volume.toLocaleString()}`,
		},
	];

	return (
		<main className="main-container max-w-7xl mx-auto px-4 py-8 space-y-6">
			<div className="flex justify-between items-center bg-dark-600/40 border border-purple-500/10 backdrop-blur-md p-6 rounded-2xl">
				<div>
					<h1 className="text-2xl font-bold text-white">
						All Cryptocurrencies
					</h1>
					<p className="text-sm text-purple-200/50 mt-1">
						Real-time cryptocurrency price screener and performance stats
					</p>
				</div>
			</div>

			<div className="bg-dark-500 rounded-xl p-5 border border-purple-500/10 shadow-xl overflow-x-auto">
				{coins.length > 0 ? (
					<>
						<DataTable
							data={coins}
							columns={columns}
							rowKey={(coin) => coin.id}
							tableClassName="w-full border-collapse"
						/>

						{/* Pagination controls */}
						<div className="flex justify-between items-center mt-6 pt-4 border-t border-purple-500/5">
							<span className="text-xs text-purple-200/40">
								Page {currentPage} of global assets
							</span>
							<div className="flex gap-2">
								{currentPage > 1 && (
									<Link
										href={`/coins?page=${currentPage - 1}`}
										className="flex items-center gap-1.5 px-4 py-2 bg-dark-600 hover:bg-purple-600/10 border border-purple-500/10 text-xs font-semibold rounded-lg text-purple-200 hover:text-white transition-all"
									>
										<ChevronLeft className="w-4 h-4" />
										Previous
									</Link>
								)}
								<Link
									href={`/coins?page=${currentPage + 1}`}
									className="flex items-center gap-1.5 px-4 py-2 bg-dark-600 hover:bg-purple-600/10 border border-purple-500/10 text-xs font-semibold rounded-lg text-purple-200 hover:text-white transition-all"
								>
									Next
									<ChevronRight className="w-4 h-4" />
								</Link>
							</div>
						</div>
					</>
				) : (
					<div className="text-center text-sm text-purple-200/40 py-12">
						No coin market data available. Please check back shortly.
					</div>
				)}
			</div>
		</main>
	);
}
