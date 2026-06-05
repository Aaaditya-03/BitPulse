"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import HeaderSearch from "./HeaderSearch";
import { Home } from "lucide-react";

/**
 * The main application header component, containing the logo, interactive search, and navigation.
 * @returns The rendered Header component.
 */
const Header = () => {
	const pathname = usePathname();

	return (
		<header className="sticky top-0 z-40 w-full bg-dark-900/70 backdrop-blur-md border-b border-purple-500/10">
			<div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between gap-4">
				{/* Logo */}
				<Link href="/" className="flex items-center gap-2 shrink-0">
					<div className="relative hover:scale-[1.02] transition-transform duration-300">
						<Image src="/logo.svg" alt="BitPulse logo" width={132} height={40} />
					</div>
				</Link>

				{/* Center: Search Bar */}
				<div className="flex-1 max-w-md mx-auto flex justify-center">
					<HeaderSearch />
				</div>

				{/* Right: Navigation Links */}
				<nav className="flex items-center gap-2">
					<Link
						href="/"
						className={cn(
							"px-4 py-2 text-sm font-medium rounded-xl flex items-center gap-1.5 transition-all duration-300",
							pathname === "/"
								? "bg-purple-500/10 border border-purple-500/20 text-white"
								: "text-purple-100/60 hover:text-white hover:bg-white/5 border border-transparent",
						)}
					>
						<Home className="w-4 h-4" />
						<span className="hidden sm:inline">Home</span>
					</Link>
				</nav>
			</div>
		</header>
	);
};

export default Header;
