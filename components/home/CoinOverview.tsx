import Image from "next/image";
import React from "react";
import CandlestickChart from "@/components/CandlestickChart";
import { fetcher } from "@/lib/coingecko.actions";
import { formatCurrency } from "@/lib/utils";
import { CoinOverviewFallback } from "./fallback";

/**
 * Displays an overview of a specific coin (defaulting to Bitcoin), including its current price
 * and a candlestick chart showing hourly price movements.
 * @returns The CoinOverview component.
 */
const CoinOverview = async () => {
	try {
		const [coin, coinOHLCData] = await Promise.all([
			fetcher<CoinDetailsData>("/coins/bitcoin", {
				dex_pair_format: "symbol",
			}),
			fetcher<OHLCData[]>("/coins/bitcoin/ohlc", {
				vs_currency: "usd",
				days: 1,
				precision: "full",
			}),
		]);

		return (
			<div id="coin-overview">
				<CandlestickChart data={coinOHLCData} coinId="bitcoin">
					<div className="header pt-2">
						<Image
							src={coin.image.large}
							alt={coin.name}
							width={56}
							height={56}
						/>
						<div className="info">
							<p>
								{coin.name} / {coin.symbol.toUpperCase()}
							</p>
							<h1>{formatCurrency(coin.market_data.current_price.inr)}</h1>
						</div>
					</div>
				</CandlestickChart>
			</div>
		);
	} catch (error) {
		console.error("Error fetching coin overview:", error);
		return <CoinOverviewFallback />;
	}
};

export default CoinOverview;
