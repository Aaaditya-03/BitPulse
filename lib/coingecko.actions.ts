"use server";

import qs from "query-string";

const BASE_URL = process.env.COINGECKO_BASE_URL;
const API_KEY = process.env.COINGECKO_API_KEY;

if (!BASE_URL) throw new Error("Could not get base url");
if (!API_KEY) throw new Error("Could not get api key");

/**
 * Fetches data from the CoinGecko API.
 * @param endpoint - The API endpoint to fetch data from.
 * @param params - Optional query parameters to include in the request.
 * @param revalidate - The cache revalidation time in seconds (default is 60).
 * @param timeout - The request timeout in milliseconds (default is 10000).
 * @returns A promise that resolves to the expected generic type T.
 */
export async function fetcher<T>(
	endpoint: string,
	params?: QueryParams,
	revalidate = 60,
	timeout = 10000,
): Promise<T> {
	const url = qs.stringifyUrl(
		{
			url: `${BASE_URL}/${endpoint}`,
			query: params,
		},
		{ skipEmptyString: true, skipNull: true },
	);

	const isPro = (BASE_URL || "").includes("pro-api");
	const headerKey = isPro ? "x-cg-pro-api-key" : "x-cg-demo-api-key";

	const response = await fetch(url, {
		headers: {
			[headerKey]: API_KEY,
			"Content-Type": "application/json",
		} as Record<string, string>,
		next: { revalidate },
		signal: AbortSignal.timeout(timeout),
	});

	if (!response.ok) {
		const errorBody: CoinGeckoErrorBody = await response
			.json()
			.catch(() => ({}));

		throw new Error(
			`API Error: ${response.status}: ${errorBody.error || response.statusText} `,
		);
	}

	return response.json();
}

/**
 * Retrieves pool data based on the provided identifier, network, and contract address.
 * @param id - The identifier for the pool.
 * @param network - Optional network name.
 * @param contractAddress - Optional contract address for the pool.
 * @returns A promise that resolves to the pool data or a fallback default on failure.
 */
export async function getPools(
	id: string,
	network?: string | null,
	contractAddress?: string | null,
): Promise<PoolData> {
	const fallback: PoolData = {
		id: "",
		address: "",
		name: "",
		network: "",
	};

	if (network && contractAddress) {
		try {
			const poolData = await fetcher<{ data: PoolData[] }>(
				`/onchain/networks/${network}/tokens/${contractAddress}/pools`,
			);

			return poolData.data?.[0] ?? fallback;
		} catch (error) {
			console.log(error);
			return fallback;
		}
	}

	try {
		const poolData = await fetcher<{ data: PoolData[] }>(
			"/onchain/search/pools",
			{ query: id },
		);

		return poolData.data?.[0] ?? fallback;
	} catch {
		return fallback;
	}
}

/**
 * Fetches global cryptocurrency market data.
 * Cached for 10 minutes (600s) to avoid rate limits.
 */
// biome-ignore lint/suspicious/noExplicitAny: Global market data is a complex nested structure
export async function getGlobalMarketData(): Promise<any> {
	try {
		// biome-ignore lint/suspicious/noExplicitAny: API response is dynamic
		const result = await fetcher<{ data: any }>("/global", undefined, 600);
		return result?.data ?? null;
	} catch (error) {
		console.error("Error fetching global market data:", error);
		return null;
	}
}

/**
 * Searches for coins on CoinGecko by query.
 * Cached for 5 minutes (300s).
 */
export async function searchCoins(query: string): Promise<SearchCoin[]> {
	if (!query || query.trim().length < 2) return [];

	try {
		const result = await fetcher<{ coins: SearchCoin[] }>(
			"/search",
			{ query },
			300,
		);
		return result?.coins || [];
	} catch (error) {
		console.error("Error searching coins:", error);
		return [];
	}
}

/**
 * Fetches market data for top coins and returns top 5 gainers and losers.
 * Cached for 2 minutes (120s).
 */
export async function getTopGainersLosers(): Promise<{
	gainers: CoinMarketData[];
	losers: CoinMarketData[];
}> {
	const fallback = { gainers: [], losers: [] };

	try {
		// Fetch top 50 coins by market cap
		const coins = await fetcher<CoinMarketData[]>(
			"/coins/markets",
			{
				vs_currency: "usd",
				order: "market_cap_desc",
				per_page: 50,
				page: 1,
				sparkline: "false",
			},
			120,
		);

		if (!Array.isArray(coins)) return fallback;

		// Sort by 24h change descending for gainers
		const sorted = [...coins].filter(
			(c) => c.price_change_percentage_24h !== null,
		);

		const gainers = [...sorted]
			.sort(
				(a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h,
			)
			.slice(0, 5);

		const losers = [...sorted]
			.sort(
				(a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h,
			)
			.slice(0, 5);

		return { gainers, losers };
	} catch (error) {
		console.error("Error fetching top gainers/losers:", error);
		return fallback;
	}
}

/**
 * Fetches market data for specific coins in the watchlist.
 * Cached for 30 seconds to provide responsive updates.
 */
export async function getWatchlistCoins(
	ids: string[],
): Promise<CoinMarketData[]> {
	if (!ids || ids.length === 0) return [];
	try {
		return await fetcher<CoinMarketData[]>(
			"/coins/markets",
			{
				vs_currency: "usd",
				ids: ids.join(","),
				order: "market_cap_desc",
				per_page: ids.length,
				page: 1,
				sparkline: "false",
			},
			30, // cache for 30 seconds
		);
	} catch (error) {
		console.error("Error fetching watchlist coins:", error);
		return [];
	}
}

/**
 * Fetches market data for coins with pagination support.
 * Cached for 2 minutes (120s).
 */
export async function getCoinsMarkets(
	page = 1,
	perPage = 50,
): Promise<CoinMarketData[]> {
	try {
		return await fetcher<CoinMarketData[]>(
			"/coins/markets",
			{
				vs_currency: "usd",
				order: "market_cap_desc",
				per_page: perPage,
				page,
				sparkline: "false",
			},
			120, // cache for 120 seconds
		);
	} catch (error) {
		console.error("Error fetching coins markets:", error);
		return [];
	}
}
