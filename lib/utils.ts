import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines multiple tailwind classes into a single string.
 * @param inputs - Array of class values to be combined.
 * @returns A single merged class string.
 */
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

/**
 * Formats a numeric value as a currency string.
 * @param value - The numerical value to format.
 * @param digits - The number of decimal digits to display (default is 2).
 * @param currency - The currency code, e.g., 'USD' (default is 'USD').
 * @param showSymbol - Whether to display the currency symbol (default is true).
 * @returns A formatted currency string.
 */
export function formatCurrency(
	value: number | null | undefined,
	digits?: number,
	currency?: string,
	showSymbol?: boolean,
) {
	if (value === null || value === undefined || isNaN(value)) {
		return showSymbol !== false ? "$0.00" : "0.00";
	}

	if (showSymbol === undefined || showSymbol === true) {
		return value.toLocaleString(undefined, {
			style: "currency",
			currency: currency?.toUpperCase() || "USD",
			minimumFractionDigits: digits ?? 2,
			maximumFractionDigits: digits ?? 2,
		});
	}
	return value.toLocaleString(undefined, {
		minimumFractionDigits: digits ?? 2,
		maximumFractionDigits: digits ?? 2,
	});
}

/**
 * Formats a numeric change value as a percentage string.
 * @param change - The numerical change value to format.
 * @returns A formatted percentage string, e.g., "1.5%".
 */
export function formatPercentage(change: number | null | undefined): string {
	if (change === null || change === undefined || isNaN(change)) {
		return "0.0%";
	}
	const formattedChange = change.toFixed(1);
	return `${formattedChange}%`;
}

/**
 * Determines the appropriate styling classes and icon for a trending value.
 * @param value - The numeric trend value.
 * @returns An object containing text, background, and icon classes based on the trend direction.
 */
export function trendingClasses(value: number) {
	const isTrendingUp = value > 0;

	return {
		textClass: isTrendingUp ? "text-green-400" : "text-red-400",
		bgClass: isTrendingUp ? "bg-green-500/10" : "bg-red-500/10",
		iconClass: isTrendingUp ? "icon-up" : "icon-down",
	};
}
