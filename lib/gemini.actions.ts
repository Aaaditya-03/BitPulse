"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { fetcher } from "@/lib/coingecko.actions";

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

			if (coin?.market_data) {
				const priceInr = coin.market_data.current_price.inr;
				const priceUsd = coin.market_data.current_price.usd;
				const priceChange24h =
					coin.market_data.price_change_percentage_24h_in_currency.usd || 0;
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
					riskReason +=
						"extremely low volume relative to market cap (low liquidity); ";
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
					riskReason +=
						"micro-cap size (under $50M), vulnerable to market manipulation; ";
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

Please answer the user's questions in a helpful, analytical, objective, and highly professional manner.

Dynamic Quote Integration:
You should frequently (in almost every response, unless it is a simple greetings or API key setup issue) weave in a relevant finance, investment, or cryptocurrency quote. Format the quote as a markdown blockquote (> "Quote text" - Author). Choose the quote that matches the theme of the user's query:

- For speculation, high-volatility, or high-risk assets:
  > "The individual investor should act consistently as an investor and not as a speculator." - Benjamin Graham
  > "It is not what you don't know that kills you, it's what you know for sure that just ain't so." - Mark Twain
  > "The stock market is filled with individuals who know the price of everything, but the value of nothing." - Philip Fisher

- For value investing, buying dips, or market fear / correction:
  > "Be fearful when others are greedy, and greedy when others are fearful." - Warren Buffett
  > "The time of maximum pessimism is the best time to buy, and the time of maximum optimism is the best time to sell." - John Templeton
  > "If you aren't willing to own a stock for ten years, don't even think about owning it for ten minutes." - Warren Buffett

- For technology, decentralization, blockchain, Bitcoin, and trustless protocols:
  > "If you don't believe it or don't get it, I don't have time to try to convince you, sorry." - Satoshi Nakamoto
  > "Whereas most technologies tend to automate workers on the periphery doing menial tasks, blockchains automate away the center. Instead of putting the taxi driver out of a job, blockchain puts Uber out of a job and lets the taxi drivers work with the customer directly." - Vitalik Buterin
  > "Bitcoin is a remarkable cryptographic achievement... The ability to create something which is not duplicable in the digital world has enormous value." - Eric Schmidt

- For patience, long-term focus, or HODLing:
  > "The stock market is a device for transferring money from the active to the patient." - Warren Buffett
  > "Waiting helps you as an investor, and a lot of people just can't stand to wait." - Charlie Munger
  > "It's not key to be right or wrong, it's key to make maximum money when you're right and minimize loss when you're wrong." - George Soros

- For general risk management, cash allocation, or hedging:
  > "Every day I assume every position I have is wrong." - Paul Tudor Jones
  > "If you don't evaluate your risk, the market will evaluate it for you." - Unknown
  > "Diversification is protection against ignorance. It makes little sense if you know what you are doing." - Warren Buffett

- For market euphoria, bubbles, or FOMO:
  > "I can calculate the motion of heavenly bodies, but not the madness of people." - Isaac Newton
  > "Bull markets are born on pessimism, grown on skepticism, mature on optimism and die on euphoria." - John Templeton

Formatting guidelines:
- Use bullet points, bold text, blockquotes, and code formatting where helpful.
- Keep responses relatively concise, data-driven, and focused on crypto details.
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
	} catch (error: unknown) {
		console.error("Gemini API Error:", error);
		const errorMessage =
			error instanceof Error ? error.message : "Failed to communicate with AI.";
		throw new Error(errorMessage);
	}
}
