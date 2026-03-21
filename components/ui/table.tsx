"use client";

import type * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Main container for a table component.
 * @param props - The table HTML element properties.
 * @returns The wrapped table element.
 */
function Table({ className, ...props }: React.ComponentProps<"table">) {
	return (
		<div
			data-slot="table-container"
			className="relative w-full overflow-x-auto"
		>
			<table
				data-slot="table"
				className={cn("w-full caption-bottom text-sm", className)}
				{...props}
			/>
		</div>
	);
}

/**
 * Table header component.
 * @param props - The table header HTML element properties.
 * @returns The table header element.
 */
function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
	return (
		<thead
			data-slot="table-header"
			className={cn("[&_tr]:border-b", className)}
			{...props}
		/>
	);
}

/**
 * Table body component.
 * @param props - The table body HTML element properties.
 * @returns The table body element.
 */
function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
	return (
		<tbody
			data-slot="table-body"
			className={cn("[&_tr:last-child]:border-0", className)}
			{...props}
		/>
	);
}

/**
 * Table footer component.
 * @param props - The table footer HTML element properties.
 * @returns The table footer element.
 */
function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
	return (
		<tfoot
			data-slot="table-footer"
			className={cn(
				"border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
				className,
			)}
			{...props}
		/>
	);
}

/**
 * Table row component.
 * @param props - The table row HTML element properties.
 * @returns The table row element.
 */
function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
	return (
		<tr
			data-slot="table-row"
			className={cn(
				"border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
				className,
			)}
			{...props}
		/>
	);
}

/**
 * Table header cell component.
 * @param props - The table header cell HTML element properties.
 * @returns The table header cell element.
 */
function TableHead({ className, ...props }: React.ComponentProps<"th">) {
	return (
		<th
			data-slot="table-head"
			className={cn(
				"h-10 px-2 text-left align-middle font-medium whitespace-nowrap text-foreground [&:has([role=checkbox])]:pr-0",
				className,
			)}
			{...props}
		/>
	);
}

/**
 * Table data cell component.
 * @param props - The table data cell HTML element properties.
 * @returns The table data cell element.
 */
function TableCell({ className, ...props }: React.ComponentProps<"td">) {
	return (
		<td
			data-slot="table-cell"
			className={cn(
				"p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0",
				className,
			)}
			{...props}
		/>
	);
}

/**
 * Table caption component.
 * @param props - The table caption HTML element properties.
 * @returns The table caption element.
 */
function TableCaption({
	className,
	...props
}: React.ComponentProps<"caption">) {
	return (
		<caption
			data-slot="table-caption"
			className={cn("mt-4 text-sm text-muted-foreground", className)}
			{...props}
		/>
	);
}

export {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableFooter,
	TableHead,
	TableHeader,
	TableRow,
};
