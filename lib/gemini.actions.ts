"use server";

import { fetcher } from "@/lib/coingecko.actions";
import { GoogleGenerativeAI } from "@google/generative-ai";

export interface ChatMessage {
	role: "user" | "model";
	content: string;
}

/**
 * Handles communication with Gemini API, appending real-time cryptocurrency data context.
 * Calculates risk indicators based on market data: volatility, volume-to-market-cap ratio, and market cap rank.
 *
 * @param messages The chat history.
 * @param activeCoinId Optional coin ID to fetch context for.
 * @param userApiKey Optional user-supplied API key from UI settings.
 * @returns The AI response string.
 */
export async function sendChatMessage(
	messages: ChatMessage[],
	activeCoinId?: string | null,
	userApiKey?: string | null,
): Promise<string> {
	const apiKey = process.env.GEMINI_API_KEY || userApiKey;

	if (!apiKey) {
		throw new Error("MISSING_API_KEY");
	}

	let coinContext = "";

	if (activeCoinId) {
		try {
			const coin = await fetcher<CoinDetailsData>(`/coins/${activeCoinId}`, {
				localization: "false",
				tickers: "false",
				market_data: "true",
				community_data: "false",
				developer_data: "false",
				sparkline: "false",
			});

			if (coin && coin.market_data) {
				const priceInr = coin.market_data.current_price.inr;
				const priceUsd = coin.market_data.current_price.usd;
				const priceChange24h = coin.market_data.price_change_percentage_24h_in_currency.usd || 0;
				const marketCap = coin.market_data.market_cap.usd;
				const volume24h = coin.market_data.total_volume.usd;

				// Volatility Index: 24h Price Change Percentage
				const volatility = Math.abs(priceChange24h);

				// Liquidity Ratio: Volume / Market Cap
				const liquidityRatio = marketCap > 0 ? volume24h / marketCap : 0;

				// Basic Risk Analysis
				let riskScore = 0;
				let riskReason = "";

				// Volatility Points (max 40)
				if (volatility > 15) {
					riskScore += 40;
					riskReason += "high 24h volatility (>15%); ";
				} else if (volatility > 8) {
					riskScore += 25;
					riskReason += "moderate 24h volatility (8-15%); ";
				} else {
					riskScore += 10;
					riskReason += "low 24h volatility (<8%); ";
				}

				// Liquidity Points (max 30)
				if (liquidityRatio < 0.01) {
					riskScore += 30;
					riskReason += "extremely low volume relative to market cap (low liquidity); ";
				} else if (liquidityRatio < 0.03) {
					riskScore += 15;
					riskReason += "moderate liquidity ratio (3-5% volume/cap); ";
				} else {
					riskScore += 5;
					riskReason += "healthy liquidity (>3% volume/cap); ";
				}

				// Market Cap Size Points (max 30)
				if (marketCap < 50_000_000) {
					riskScore += 30;
					riskReason += "micro-cap size (under $50M), vulnerable to market manipulation; ";
				} else if (marketCap < 1_000_000_000) {
					riskScore += 20;
					riskReason += "mid-cap size ($50M-$1B); ";
				} else {
					riskScore += 5;
					riskReason += "large/mega-cap size (over $1B); ";
				}

				let safetyRating = "SAFE/STABLE";
				if (riskScore > 65) safetyRating = "HIGH RISK / SPECULATIVE";
				else if (riskScore > 35) safetyRating = "MODERATE RISK";

				coinContext = `
Active Coin Context:
- Name: ${coin.name} (${coin.symbol.toUpperCase()})
- Price (INR): ${priceInr.toLocaleString("en-IN", { style: "currency", currency: "INR" })}
- Price (USD): ${priceUsd.toLocaleString("en-US", { style: "currency", currency: "USD" })}
- 24h Change: ${priceChange24h.toFixed(2)}%
- Market Cap: $${marketCap.toLocaleString()} (Rank #${coin.market_cap_rank})
- 24h Volume: $${volume24h.toLocaleString()}
- Volatility Factor: ${volatility.toFixed(2)}%
- Liquidity Ratio: ${(liquidityRatio * 100).toFixed(2)}%
- Calculated Safety Rating: ${safetyRating} (Score: ${riskScore}/100)
- Risk Risk Factors: ${riskReason || "None"}
`;
			}
		} catch (error) {
			console.error("Error fetching coin context for chatbot:", error);
			coinContext = `Active Coin Context: Fetch failed for ID "${activeCoinId}".`;
		}
	}

	const systemInstruction = `
You are BitPulse AI, an advanced, interactive crypto analyst integrated into the BitPulse charts dashboard. 
You assist users with real-time data analysis, coin tracking, volatility checks, and safety/risk calculations.

Safety and Risk calculation criteria:
- Safe/Stable: Large/mega-caps (Market Cap > $1B) with low/moderate volatility (<8% daily change) and high liquidity (ratio > 3%).
- Moderate Risk: Mid-caps ($50M - $1B) or coins with volatility between 8% and 15%.
- High Risk / Speculative: Micro-caps (< $50M), low liquidity ratio (< 1%), or coins experiencing extreme volatility (>15% daily change).

Current context:
${coinContext || "No active coin page is selected. General dashboard is open."}

Please answer the user's questions in a helpful, analytical, and objective manner.
Formatting guidelines:
- Use bullet points, bold text, and code formatting where helpful.
- Keep responses relatively concise and focused on crypto data.
- Always include a small disclaimer at the very end of your response noting that this is not financial advice.
`;

	try {
		const genAI = new GoogleGenerativeAI(apiKey);
		const model = genAI.getGenerativeModel({
			model: "gemini-2.5-flash",
			systemInstruction,
		});

		// Map roles for Gemini API (uses 'user' and 'model')
		const formattedContents = messages.map((msg) => ({
			role: msg.role === "user" ? "user" : "model",
			parts: [{ text: msg.content }],
		}));

		const response = await model.generateContent({
			contents: formattedContents,
		});

		return response.response.text() || "I couldn't generate a response.";
	} catch (error: any) {
		console.error("Gemini API Error:", error);
		throw new Error(error?.message || "Failed to communicate with AI.");
	}
}
