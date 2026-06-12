import DataTable from "@/components/DataTable";

/**
 * A fallback skeleton component for the CoinOverview, displayed while data is loading.
 * @returns The CoinOverviewFallback component.
 */
export const CoinOverviewFallback = () => {
	return (
		<div id="coin-overview-fallback">
			<div className="header pt-2">
				<div className="header-image skeleton" />
				<div className="info">
					<div className="header-line-sm skeleton" />
					<div className="header-line-lg skeleton" />
				</div>
			</div>
			<div className="chart">
				<div className="chart-skeleton skeleton" />
			</div>
		</div>
	);
};

/**
 * A fallback skeleton component for the TrendingCoins table, displayed while data is loading.
 * @returns The TrendingCoinsFallback component.
 */
export const TrendingCoinsFallback = () => {
	const columns: DataTableColumn<{ id: number }>[] = [
		{
			key: "name",
			header: "Name",
			cell: () => (
				<div className="name-link">
					<div className="name-image skeleton" />
					<div className="name-line skeleton" />
				</div>
			),
		},
		{
			key: "change",
			header: "24h Change",
			cell: () => (
				<div className="price-change">
					<div className="change-icon skeleton" />
					<div className="change-line skeleton" />
				</div>
			),
		},
		{
			key: "price",
			header: "Price",
			cell: () => <div className="price-line skeleton" />,
		},
	];

	const dummyData = Array.from({ length: 6 }, (_, i) => ({ id: i }));

	return (
		<div id="trending-coins-fallback">
			<h4>Trending Coins</h4>
			<DataTable
				data={dummyData}
				columns={columns}
				rowKey={(item) => item.id}
				tableClassName="trending-coins-table"
			/>
		</div>
	);
};

/**
 * A fallback skeleton component for the Categories table, displayed while data is loading.
 * @returns The CategoriesFallback component.
 */
export const CategoriesFallback = () => {
	const columns: DataTableColumn<{ id: number }>[] = [
		{
			key: "category",
			header: "Category",
			cellClassName: "category-cell",
			cell: () => <div className="category-line skeleton" />,
		},
		{
			key: "top_gainers",
			header: "Top Gainers",
			cellClassName: "top-gainers-cell",
			cell: () => (
				<div className="flex gap-1">
					<div className="gainer-image skeleton" />
					<div className="gainer-image skeleton" />
					<div className="gainer-image skeleton" />
				</div>
			),
		},
		{
			key: "change",
			header: "24h Change",
			cellClassName: "change-header-cell",
			cell: () => (
				<div className="change-cell">
					<div className="change-icon skeleton" />
					<div className="change-line skeleton" />
				</div>
			),
		},
		{
			key: "market_cap",
			header: "Market Cap",
			cellClassName: "market-cap-cell",
			cell: () => <div className="value-skeleton-lg skeleton" />,
		},
		{
			key: "volume",
			header: "24h Volume",
			cellClassName: "volume-cell",
			cell: () => <div className="value-skeleton-md skeleton" />,
		},
	];

	const dummyData = Array.from({ length: 10 }, (_, i) => ({ id: i }));

	return (
		<div id="categories-fallback">
			<h4>Top Categories</h4>
			<DataTable
				data={dummyData}
				columns={columns}
				rowKey={(item) => item.id}
				tableClassName="mt-3"
			/>
		</div>
	);
};
