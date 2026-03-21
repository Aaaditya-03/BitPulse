"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

/**
 * The main application header component, containing the logo and navigation links.
 * @returns The rendered Header component.
 */
const Header = () => {
	const pathname = usePathname();

	return (
		<header>
			<div className="main-container inner">
				<Link href="/">
					<Image src="/logo.svg" alt="BitPulse logo" width={132} height={40} />
				</Link>

				<nav>
					<Link
						href="/"
						className={cn("nav-link", {
							"is-active": pathname === "/",
							"is-home": true,
						})}
					>
						Home
					</Link>

					<p>Search Modal</p>

					<Link
						href="/coins"
						className={cn("nav-link", {
							"is-active": pathname === "/coins",
						})}
					>
						All Coins
					</Link>
				</nav>
			</div>
		</header>
	);
};

export default Header;
