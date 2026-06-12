"use client";

import {
	CandlestickSeries,
	createChart,
	type IChartApi,
	type ISeriesApi,
	LineSeries,
	type MouseEventParams,
	type Time,
} from "lightweight-charts";
import type React from "react";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import {
	getCandlestickConfig,
	getChartConfig,
	LIVE_INTERVAL_BUTTONS,
	PERIOD_BUTTONS,
	PERIOD_CONFIG,
} from "@/constants";
import { fetcher } from "@/lib/coingecko.actions";
import {
	calculateEMA,
	calculateSMA,
	convertOHLCData,
	formatCurrency,
} from "@/lib/utils";

type LiveInterval = "off" | "30s" | "1m" | "5m";

interface CandlestickChartProps {
	data?: OHLCData[];
	liveOhlcv?: OHLCData | null;
	coinId: string;
	height?: number;
	children?: React.ReactNode;
	mode?: "historical" | "live";
	initialPeriod?: Period;
	liveInterval?: LiveInterval;
	setLiveInterval?: (interval: LiveInterval) => void;
}

const CandlestickChart = ({
	children,
	data,
	coinId,
	height = 360,
	initialPeriod = "daily",
	liveOhlcv = null,
	mode = "historical",
}: CandlestickChartProps) => {
	const chartContainerRef = useRef<HTMLDivElement | null>(null);
	const chartRef = useRef<IChartApi | null>(null);
	const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
	const prevOhlcDataLength = useRef<number>(data?.length || 0);
	const legendRef = useRef<HTMLDivElement | null>(null);

	const [period, setPeriod] = useState(initialPeriod);
	const [ohlcData, setOhlcData] = useState<OHLCData[]>(data ?? []);
	const [isPending, startTransition] = useTransition();

	// Indicators State
	const [indicators, setIndicators] = useState({
		sma9: false,
		sma21: false,
		ema9: false,
		ema21: false,
	});

	// Polling State
	const [localLiveInterval, setLocalLiveInterval] =
		useState<LiveInterval>("off");

	const indicatorsRef = useRef(indicators);
	useEffect(() => {
		indicatorsRef.current = indicators;
	}, [indicators]);

	// Fetch historical data
	const fetchOHLCData = async (selectedPeriod: Period) => {
		try {
			const { days } = PERIOD_CONFIG[selectedPeriod];

			const newData = await fetcher<OHLCData[]>(`/coins/${coinId}/ohlc`, {
				vs_currency: "usd",
				days,
				precision: "full",
			});

			startTransition(() => {
				setOhlcData(newData ?? []);
			});
		} catch (e) {
			console.error("Failed to fetch OHLCData", e);
		}
	};

	const handlePeriodChange = (newPeriod: Period) => {
		if (newPeriod === period) return;
		setPeriod(newPeriod);
		fetchOHLCData(newPeriod);
	};

	// Client-side Polling
	useEffect(() => {
		if (localLiveInterval === "off") return;

		const intervalMs =
			localLiveInterval === "30s"
				? 30000
				: localLiveInterval === "1m"
					? 60000
					: 300000;

		const pollData = async () => {
			try {
				const { days } = PERIOD_CONFIG[period];
				const newData = await fetcher<OHLCData[]>(`/coins/${coinId}/ohlc`, {
					vs_currency: "usd",
					days,
					precision: "full",
				});
				if (newData && newData.length > 0) {
					setOhlcData(newData);
				}
			} catch (e) {
				console.error("Failed to poll live data:", e);
			}
		};

		const intervalId = setInterval(pollData, intervalMs);
		return () => clearInterval(intervalId);
	}, [localLiveInterval, coinId, period]);

	// Helper to merge history and live data points
	const getMergedData = useCallback((): OHLCData[] => {
		const convertedToSeconds = ohlcData.map(
			(item) =>
				[
					Math.floor(item[0] / 1000),
					item[1],
					item[2],
					item[3],
					item[4],
				] as OHLCData,
		);

		let merged: OHLCData[];

		if (liveOhlcv) {
			const liveTimestamp = liveOhlcv[0];
			const lastHistoricalCandle =
				convertedToSeconds[convertedToSeconds.length - 1];

			if (lastHistoricalCandle && lastHistoricalCandle[0] === liveTimestamp) {
				merged = [...convertedToSeconds.slice(0, -1), liveOhlcv];
			} else {
				merged = [...convertedToSeconds, liveOhlcv];
			}
		} else {
			merged = convertedToSeconds;
		}

		merged.sort((a, b) => a[0] - b[0]);
		return merged;
	}, [ohlcData, liveOhlcv]);

	// Create and mount Chart
	useEffect(() => {
		const container = chartContainerRef.current;
		if (!container) return;

		const showTime = ["daily", "weekly", "monthly"].includes(period);

		const chart = createChart(container, {
			...getChartConfig(height, showTime),
			width: container.clientWidth,
		});
		const series = chart.addSeries(CandlestickSeries, getCandlestickConfig());

		const merged = getMergedData();
		series.setData(convertOHLCData(merged));
		chart.timeScale().fitContent();

		chartRef.current = chart;
		candleSeriesRef.current = series;

		// Subscribe to crosshair movement to render zero-latency dynamic legend
		const handleCrosshairMove = (param: MouseEventParams<Time>) => {
			const legendEl = legendRef.current;
			if (!legendEl) return;

			if (
				param.point === undefined ||
				!param.time ||
				param.point.x < 0 ||
				param.point.x > container.clientWidth ||
				param.point.y < 0 ||
				param.point.y > height
			) {
				legendEl.innerHTML = "";
				return;
			}

			const candleData = param.seriesData.get(series) as
				| { open: number; high: number; low: number; close: number }
				| undefined;
			if (!candleData) {
				legendEl.innerHTML = "";
				return;
			}

			const currentInd = indicatorsRef.current;
			let html = `
				<div class="flex flex-wrap gap-x-4 gap-y-1 text-xs text-purple-200/50">
					<span>O: <strong class="text-white">${formatCurrency(candleData.open)}</strong></span>
					<span>H: <strong class="text-white">${formatCurrency(candleData.high)}</strong></span>
					<span>L: <strong class="text-white">${formatCurrency(candleData.low)}</strong></span>
					<span>C: <strong class="text-white">${formatCurrency(candleData.close)}</strong></span>
			`;

			if (currentInd.sma9 && sma9SeriesRef.current) {
				const val = param.seriesData.get(sma9SeriesRef.current) as
					| { value: number }
					| undefined;
				if (val)
					html += `<span>SMA 9: <strong style="color: #a855f7">${formatCurrency(val.value)}</strong></span>`;
			}
			if (currentInd.sma21 && sma21SeriesRef.current) {
				const val = param.seriesData.get(sma21SeriesRef.current) as
					| { value: number }
					| undefined;
				if (val)
					html += `<span>SMA 21: <strong style="color: #eab308">${formatCurrency(val.value)}</strong></span>`;
			}
			if (currentInd.ema9 && ema9SeriesRef.current) {
				const val = param.seriesData.get(ema9SeriesRef.current) as
					| { value: number }
					| undefined;
				if (val)
					html += `<span>EMA 9: <strong style="color: #06b6d4">${formatCurrency(val.value)}</strong></span>`;
			}
			if (currentInd.ema21 && ema21SeriesRef.current) {
				const val = param.seriesData.get(ema21SeriesRef.current) as
					| { value: number }
					| undefined;
				if (val)
					html += `<span>EMA 21: <strong style="color: #ef4444">${formatCurrency(val.value)}</strong></span>`;
			}

			html += `</div>`;
			legendEl.innerHTML = html;
		};

		chart.subscribeCrosshairMove(handleCrosshairMove);

		const observer = new ResizeObserver((entries) => {
			if (!entries.length) return;
			chart.applyOptions({ width: entries[0].contentRect.width });
		});
		observer.observe(container);

		return () => {
			observer.disconnect();
			chart.unsubscribeCrosshairMove(handleCrosshairMove);
			chart.remove();
			chartRef.current = null;
			candleSeriesRef.current = null;
			sma9SeriesRef.current = null;
			sma21SeriesRef.current = null;
			ema9SeriesRef.current = null;
			ema21SeriesRef.current = null;
		};
	}, [height, period, getMergedData]);

	// Update historical & live data
	useEffect(() => {
		if (!candleSeriesRef.current) return;

		const merged = getMergedData();
		const converted = convertOHLCData(merged);
		candleSeriesRef.current.setData(converted);

		const dataChanged = prevOhlcDataLength.current !== ohlcData.length;

		if (dataChanged || mode === "historical") {
			chartRef.current?.timeScale().fitContent();
			prevOhlcDataLength.current = ohlcData.length;
		}
	}, [ohlcData, mode, getMergedData]);

	// Manage SMA/EMA Indicators Line Series overlays
	const sma9SeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
	const sma21SeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
	const ema9SeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
	const ema21SeriesRef = useRef<ISeriesApi<"Line"> | null>(null);

	useEffect(() => {
		const chart = chartRef.current;
		if (!chart) return;

		const merged = getMergedData();

		const manageLineSeries = (
			enabled: boolean,
			seriesRef: React.MutableRefObject<ISeriesApi<"Line"> | null>,
			color: string,
			title: string,
			calculateFn: (data: OHLCData[]) => { time: Time; value: number }[],
		) => {
			if (enabled) {
				const lineData = calculateFn(merged);
				if (!seriesRef.current) {
					seriesRef.current = chart.addSeries(LineSeries, {
						color,
						lineWidth: 2,
						title,
						priceLineVisible: false,
						lastValueVisible: false,
					});
				}
				seriesRef.current.setData(lineData);
			} else {
				if (seriesRef.current) {
					try {
						chart.removeSeries(seriesRef.current);
					} catch (_e) {
						// Safe ignore if chart is already dismantled
					}
					seriesRef.current = null;
				}
			}
		};

		manageLineSeries(indicators.sma9, sma9SeriesRef, "#a855f7", "SMA 9", (d) =>
			calculateSMA(d, 9),
		);
		manageLineSeries(
			indicators.sma21,
			sma21SeriesRef,
			"#eab308",
			"SMA 21",
			(d) => calculateSMA(d, 21),
		);
		manageLineSeries(indicators.ema9, ema9SeriesRef, "#06b6d4", "EMA 9", (d) =>
			calculateEMA(d, 9),
		);
		manageLineSeries(
			indicators.ema21,
			ema21SeriesRef,
			"#ef4444",
			"EMA 21",
			(d) => calculateEMA(d, 21),
		);
	}, [indicators, getMergedData]);

	return (
		<div id="candlestick-chart">
			<div className="chart-header flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
				<div className="flex-1">{children}</div>

				<div className="flex flex-wrap items-center gap-3">
					{/* Indicators Toggles */}
					<div className="button-group flex items-center gap-1.5 bg-dark-500/40 p-1 rounded-xl border border-purple-500/5">
						<span className="text-[11px] font-semibold text-purple-200/40 uppercase tracking-wider px-2">
							Indicators
						</span>
						<button
							type="button"
							className={
								indicators.sma9 ? "config-button-active" : "config-button"
							}
							onClick={() =>
								setIndicators((prev) => ({ ...prev, sma9: !prev.sma9 }))
							}
						>
							SMA 9
						</button>
						<button
							type="button"
							className={
								indicators.sma21 ? "config-button-active" : "config-button"
							}
							onClick={() =>
								setIndicators((prev) => ({ ...prev, sma21: !prev.sma21 }))
							}
						>
							SMA 21
						</button>
						<button
							type="button"
							className={
								indicators.ema9 ? "config-button-active" : "config-button"
							}
							onClick={() =>
								setIndicators((prev) => ({ ...prev, ema9: !prev.ema9 }))
							}
						>
							EMA 9
						</button>
						<button
							type="button"
							className={
								indicators.ema21 ? "config-button-active" : "config-button"
							}
							onClick={() =>
								setIndicators((prev) => ({ ...prev, ema21: !prev.ema21 }))
							}
						>
							EMA 21
						</button>
					</div>

					{/* Period buttons */}
					<div className="button-group flex items-center gap-1 bg-dark-500/40 p-1 rounded-xl border border-purple-500/5">
						{PERIOD_BUTTONS.map(({ value, label }) => (
							<button
								key={value}
								type="button"
								className={
									period === value ? "config-button-active" : "config-button"
								}
								onClick={() => handlePeriodChange(value)}
								disabled={isPending}
							>
								{label}
							</button>
						))}
					</div>

					{/* Live polling selector */}
					<div className="button-group flex items-center gap-1.5 bg-dark-500/40 p-1 rounded-xl border border-purple-500/5">
						{localLiveInterval !== "off" && (
							<span className="flex items-center gap-1.5 text-[10px] text-green-400 font-semibold px-2 py-0.5 bg-green-500/10 rounded-lg animate-pulse shrink-0">
								<span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-md shadow-green-500/50" />
								Live
							</span>
						)}
						{LIVE_INTERVAL_BUTTONS.map(({ value, label }) => (
							<button
								key={value}
								type="button"
								className={
									localLiveInterval === value
										? "config-button-active"
										: "config-button"
								}
								onClick={() => setLocalLiveInterval(value)}
							>
								{label}
							</button>
						))}
					</div>
				</div>
			</div>

			{/* Interactive Legend Box */}
			<div
				ref={legendRef}
				className="h-6 mt-2 mb-1 flex items-center justify-start"
			/>

			<div ref={chartContainerRef} className="chart mt-2" style={{ height }} />
		</div>
	);
};

export default CandlestickChart;
