import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Chatbot from "@/components/ui/Chatbot";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "BitPulse - Crypto Screener & Terminal",
	description:
		"Crypto Screener App with a built-in High-Frequency Terminal & Dashboard",
};

/**
 * The root layout component that wraps all pages in the application.
 * @param props - Component properties.
 * @param props.children - The child components to render inside the layout.
 * @returns The main HTML structure of the app.
 */
export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" className="dark">
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				<Header />
				{children}
				<Footer />
				<Chatbot />
			</body>
		</html>
	);
}
