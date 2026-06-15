"use client";

import {
	ArrowRight,
	Bot,
	Check,
	Copy,
	ExternalLink,
	MessageSquare,
	Quote,
	Send,
	Settings,
	Sparkles,
	User,
	X,
} from "lucide-react";
import { useParams, usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { type ChatMessage, sendChatMessage } from "@/lib/gemini.actions";

export default function Chatbot() {
	const params = useParams();
	const pathname = usePathname();
	const messagesEndRef = useRef<HTMLDivElement | null>(null);

	const [isOpen, setIsOpen] = useState(false);
	const [messages, setMessages] = useState<ChatMessage[]>([
		{
			role: "model",
			content:
				"Hello! I am BitPulse AI, your interactive crypto assistant. I can analyze price trends, calculate risk metrics, track volatility, and evaluate whether a coin is safe or speculative to trade.\n\nHow can I help you today?",
		},
	]);
	const [input, setInput] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [showSettings, setShowSettings] = useState(false);
	const [userApiKey, setUserApiKey] = useState("");
	const [_apiKeyStatus, setApiKeyStatus] = useState<"not_set" | "set">(
		"not_set",
	);

	// Auto-scroll to bottom of chat
	const scrollToBottom = useCallback(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, []);

	useEffect(() => {
		if (isOpen) {
			scrollToBottom();
		}
	}, [isOpen, scrollToBottom]);

	// Load local storage API key if exists
	useEffect(() => {
		const storedKey = localStorage.getItem("BITPULSE_GEMINI_KEY");
		if (storedKey) {
			setUserApiKey(storedKey);
			setApiKeyStatus("set");
		}
	}, []);

	// Active coin ID from URL path (e.g. /coin/ethereum -> ethereum)
	const getActiveCoinId = (): string | null => {
		if (params?.id) return params.id as string;
		if (pathname?.startsWith("/coin/")) {
			const parts = pathname.split("/");
			return parts[2] || null;
		}
		return null;
	};

	const activeCoinId = getActiveCoinId();

	const handleSaveKey = () => {
		if (userApiKey.trim()) {
			localStorage.setItem("BITPULSE_GEMINI_KEY", userApiKey.trim());
			setApiKeyStatus("set");
		} else {
			localStorage.removeItem("BITPULSE_GEMINI_KEY");
			setApiKeyStatus("not_set");
		}
		setShowSettings(false);
	};

	const handleSend = async (textToSend: string) => {
		const messageText = textToSend || input;
		if (!messageText.trim() || isLoading) return;

		setInput("");
		const userMsg: ChatMessage = { role: "user", content: messageText };
		setMessages((prev) => [...prev, userMsg]);
		setIsLoading(true);

		try {
			const response = await sendChatMessage(
				[...messages, userMsg],
				activeCoinId || null,
				userApiKey || null,
			);

			setMessages((prev) => [...prev, { role: "model", content: response }]);
		} catch (error: unknown) {
			console.error("Chat error:", error);
			const err = error as { message?: string };
			if (err?.message === "MISSING_API_KEY") {
				setMessages((prev) => [
					...prev,
					{
						role: "model",
						content:
							"⚠️ **Gemini API Key is not set.**\n\nTo interact with the chatbot, please configure a Gemini API key. Click the ⚙️ Settings icon at the top right of this chat window to set up your key locally, or configure `GEMINI_API_KEY` in the server's `.env.local` file.",
					},
				]);
			} else {
				setMessages((prev) => [
					...prev,
					{
						role: "model",
						content:
							"⚠️ **Failed to connect with AI.** Please make sure your API key is correct or check the server status.",
					},
				]);
			}
		} finally {
			setIsLoading(false);
		}
	};

	// Suggestions based on active page
	const suggestions = activeCoinId
		? [
				`Is ${activeCoinId.toUpperCase()} risky to trade today?`,
				`Show volatility analysis for ${activeCoinId.toUpperCase()}`,
				"What criteria makes a coin safe?",
			]
		: [
				"Is BTC risky to trade today?",
				"Which coins are currently safe?",
				"Explain liquidity ratio risk.",
			];

	return (
		<div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
			{/* Chat window */}
			{isOpen && (
				<div className="w-[360px] sm:w-[420px] h-[550px] mb-4 bg-dark-600/90 backdrop-blur-xl border border-purple-500/20 rounded-2xl shadow-[0_10px_40px_-10px_rgba(168,85,247,0.3)] flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
					{/* Header */}
					<div className="px-5 py-4 bg-gradient-to-r from-purple-900/60 to-dark-600 border-b border-purple-500/20 flex items-center justify-between">
						<div className="flex items-center gap-2.5">
							<div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-500/20">
								<Sparkles className="w-4 h-4 animate-pulse" />
							</div>
							<div>
								<h3 className="font-semibold text-[15px] text-white flex items-center gap-1.5 leading-none">
									BitPulse AI
									{activeCoinId && (
										<span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-200">
											{activeCoinId} Context
										</span>
									)}
								</h3>
								<span className="text-[10px] text-purple-200/50">
									Interactive Risk Analyst
								</span>
							</div>
						</div>
						<div className="flex items-center gap-2">
							<button
								onClick={() => setShowSettings(!showSettings)}
								className="p-1.5 rounded-lg text-purple-200/60 hover:text-purple-100 hover:bg-white/5 transition-all"
								title="Chat Settings / API Key"
								type="button"
							>
								<Settings className="w-4.5 h-4.5" />
							</button>
							<button
								onClick={() => setIsOpen(false)}
								className="p-1.5 rounded-lg text-purple-200/60 hover:text-purple-100 hover:bg-white/5 transition-all"
								type="button"
							>
								<X className="w-4.5 h-4.5" />
							</button>
						</div>
					</div>

					{/* Settings View */}
					{showSettings ? (
						<div className="flex-1 p-5 bg-dark-600 flex flex-col gap-4 text-purple-100 animate-in fade-in duration-200">
							<h4 className="font-medium text-sm flex items-center gap-2">
								<Settings className="w-4 h-4 text-purple-400" />
								Configure Gemini API Key
							</h4>
							<p className="text-xs text-purple-200/60 leading-relaxed">
								To power the chatbot, set a Gemini API Key. Your key is stored
								locally in your browser's local storage and is never saved on
								any external server.
							</p>

							<div className="flex flex-col gap-1.5">
								<label
									htmlFor="gemini-api-key"
									className="text-[11px] text-purple-200/40 uppercase tracking-wider font-semibold"
								>
									Gemini API Key
								</label>
								<input
									id="gemini-api-key"
									type="password"
									value={userApiKey}
									onChange={(e) => setUserApiKey(e.target.value)}
									placeholder="AIzaSy..."
									className="w-full px-3 py-2 bg-dark-800 border border-purple-500/20 rounded-lg text-sm text-purple-100 focus:outline-none focus:border-purple-500/50"
								/>
							</div>

							<div className="mt-auto flex gap-2">
								<button
									onClick={() => setShowSettings(false)}
									className="flex-1 py-2 bg-white/5 text-purple-200 text-xs rounded-lg hover:bg-white/10 transition-all font-medium"
									type="button"
								>
									Cancel
								</button>
								<button
									onClick={handleSaveKey}
									className="flex-1 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-xs rounded-lg hover:brightness-110 shadow-lg shadow-purple-500/20 transition-all font-medium"
									type="button"
								>
									Save Settings
								</button>
							</div>
						</div>
					) : (
						<>
							{/* Messages Panel */}
							<div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 scrollbar-thin scrollbar-thumb-purple-500/10">
								{messages.map((msg, index) => (
									<div
										// biome-ignore lint/suspicious/noArrayIndexKey: indices are stable since messages are only appended
										key={index}
										className={`flex gap-2.5 max-w-[85%] animate-in fade-in slide-in-from-bottom-2 duration-300 ${
											msg.role === "user" ? "ml-auto flex-row-reverse" : ""
										}`}
									>
										<div
											className={`w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0 shadow-md ${
												msg.role === "user"
													? "bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-purple-500/10"
													: "bg-dark-800 border border-purple-500/10 text-purple-300"
											}`}
										>
											{msg.role === "user" ? (
												<User className="w-3.5 h-3.5" />
											) : (
												<Bot className="w-3.5 h-3.5" />
											)}
										</div>
										<div
											className={`px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed shadow-lg ${
												msg.role === "user"
													? "bg-gradient-to-br from-purple-600 to-indigo-650 text-white rounded-tr-none border border-purple-500/20 shadow-purple-600/10"
													: "bg-dark-800/85 backdrop-blur-sm border border-purple-500/15 hover:border-purple-500/30 text-purple-100 rounded-tl-none transition-all duration-300"
											}`}
										>
											{parseMarkdown(msg.content)}
										</div>
									</div>
								))}

								{/* Thinking Loader */}
								{isLoading && (
									<div className="flex gap-2.5 max-w-[85%]">
										<div className="w-7 h-7 rounded-full bg-dark-800 border border-purple-500/10 flex items-center justify-center text-purple-300 shrink-0">
											<Bot className="w-3.5 h-3.5" />
										</div>
										<div className="px-4 py-3 bg-dark-800/50 border border-purple-500/5 text-purple-300 rounded-2xl rounded-tl-none flex items-center gap-1.5">
											<span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" />
											<span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce delay-100" />
											<span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce delay-200" />
										</div>
									</div>
								)}
								<div ref={messagesEndRef} />
							</div>

							{/* Suggestions view (show only when input is empty and not loading) */}
							{!input.trim() && !isLoading && (
								<div className="px-5 py-2 flex flex-wrap gap-1.5 border-t border-purple-500/5 bg-white/[0.01]">
									{suggestions.map((sug) => (
										<button
											key={sug}
											onClick={() => handleSend(sug)}
											className="text-[11px] px-2.5 py-1 rounded-full bg-dark-800/80 border border-purple-500/10 hover:border-purple-500/30 text-purple-200/80 hover:text-purple-100 transition-all text-left flex items-center gap-1"
											type="button"
										>
											<ArrowRight className="w-2.5 h-2.5 text-purple-400" />
											{sug}
										</button>
									))}
								</div>
							)}

							{/* Chat Input */}
							<form
								onSubmit={(e) => {
									e.preventDefault();
									handleSend("");
								}}
								className="p-3 border-t border-purple-500/20 bg-dark-800/40 flex items-center gap-2"
							>
								<input
									type="text"
									value={input}
									onChange={(e) => setInput(e.target.value)}
									placeholder={
										activeCoinId
											? `Ask about ${activeCoinId.toUpperCase()}...`
											: "Ask anything about crypto safety..."
									}
									className="flex-1 px-4 py-2 bg-dark-800 border border-purple-500/10 rounded-xl text-[13px] text-purple-100 placeholder-purple-200/30 focus:outline-none focus:border-purple-500/30 transition-all"
								/>
								<button
									type="submit"
									disabled={!input.trim() || isLoading}
									className="p-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white disabled:opacity-50 hover:brightness-110 shadow-lg shadow-purple-500/10 transition-all shrink-0"
								>
									<Send className="w-4.5 h-4.5" />
								</button>
							</form>
						</>
					)}
				</div>
			)}

			{/* Floating Trigger Bubble */}
			<button
				onClick={() => setIsOpen(!isOpen)}
				className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-xl hover:scale-105 shadow-purple-500/20 active:scale-95 transition-all relative group"
				type="button"
			>
				{isOpen ? (
					<X className="w-6 h-6 animate-in spin-in-90 duration-300" />
				) : (
					<>
						<MessageSquare className="w-6 h-6" />
						<div className="absolute inset-0 rounded-full border border-purple-500/30 animate-ping opacity-60 scale-105" />
					</>
				)}
				{/* Tooltip on hover */}
				{!isOpen && (
					<div className="absolute right-16 px-3 py-1.5 rounded-lg bg-dark-700 border border-purple-500/10 text-purple-100 text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 duration-300 pointer-events-none shadow-lg">
						Chat with BitPulse AI ⚡
					</div>
				)}
			</button>
		</div>
	);
}

// A custom CodeBlock component with copy to clipboard functionality
interface CodeBlockProps {
	code: string;
	language?: string;
}

function CodeBlock({ code, language }: CodeBlockProps) {
	const [copied, setCopied] = useState(false);

	const handleCopy = () => {
		navigator.clipboard.writeText(code);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<div className="my-3 rounded-xl bg-purple-950/40 border border-purple-500/10 overflow-hidden font-mono text-[11px] leading-relaxed">
			<div className="flex items-center justify-between px-4 py-1.5 bg-purple-950/60 border-b border-purple-500/10 text-[10px] text-purple-300 font-sans font-medium uppercase tracking-wider select-none">
				<span>{language || "code"}</span>
				<button
					onClick={handleCopy}
					className="flex items-center gap-1 text-purple-400 hover:text-purple-200 transition-colors cursor-pointer"
					type="button"
				>
					{copied ? (
						<>
							<Check className="w-3 h-3" />
							<span>Copied!</span>
						</>
					) : (
						<>
							<Copy className="w-3 h-3" />
							<span>Copy</span>
						</>
					)}
				</button>
			</div>
			<pre className="p-4 overflow-x-auto scrollbar-thin scrollbar-thumb-purple-500/10 whitespace-pre">
				<code className="text-purple-100">{code}</code>
			</pre>
		</div>
	);
}

interface MarkdownBlock {
	type: "paragraph" | "heading" | "list" | "blockquote" | "code" | "table";
	content?: string;
	listItems?: string[];
	listType?: "ordered" | "unordered";
	level?: number;
	language?: string;
	tableHeaders?: string[];
	tableRows?: string[][];
}

function parseMarkdownToBlocks(text: string): MarkdownBlock[] {
	const lines = text.split("\n");
	const blocks: MarkdownBlock[] = [];
	let i = 0;

	while (i < lines.length) {
		const line = lines[i];

		// 1. Code Block
		if (line.trim().startsWith("```")) {
			const lang = line.trim().substring(3).trim();
			const codeLines: string[] = [];
			i++;
			while (i < lines.length && !lines[i].trim().startsWith("```")) {
				codeLines.push(lines[i]);
				i++;
			}
			// Skip the closing ```
			if (i < lines.length) i++;
			blocks.push({
				type: "code",
				content: codeLines.join("\n"),
				language: lang || "code",
			});
			continue;
		}

		// 2. Blockquotes
		if (line.trim().startsWith(">")) {
			const quoteLines: string[] = [];
			while (i < lines.length && lines[i].trim().startsWith(">")) {
				quoteLines.push(lines[i].trim().replace(/^>\s*/, ""));
				i++;
			}
			blocks.push({
				type: "blockquote",
				content: quoteLines.join("\n"),
			});
			continue;
		}

		// 3. Tables
		if (line.trim().startsWith("|") && line.trim().endsWith("|")) {
			const rawRows: string[][] = [];
			while (
				i < lines.length &&
				lines[i].trim().startsWith("|") &&
				lines[i].trim().endsWith("|")
			) {
				const cells = lines[i]
					.trim()
					.split("|")
					.slice(1, -1)
					.map((c) => c.trim());
				rawRows.push(cells);
				i++;
			}

			const filteredRows = rawRows.filter((row) => {
				return !row.every((cell) => cell.match(/^-+$/) || cell === "");
			});

			if (filteredRows.length > 0) {
				const headers = filteredRows[0];
				const rows = filteredRows.slice(1);
				blocks.push({
					type: "table",
					tableHeaders: headers,
					tableRows: rows,
				});
			}
			continue;
		}

		// 4. Headings
		if (line.trim().startsWith("#")) {
			const match = line.trim().match(/^(#{1,6})\s+(.*)$/);
			if (match) {
				blocks.push({
					type: "heading",
					level: match[1].length,
					content: match[2],
				});
				i++;
				continue;
			}
		}

		// 5. Unordered List Items
		if (line.trim().startsWith("* ") || line.trim().startsWith("- ")) {
			const items: string[] = [];
			while (
				i < lines.length &&
				(lines[i].trim().startsWith("* ") || lines[i].trim().startsWith("- "))
			) {
				items.push(lines[i].trim().replace(/^[*-]\s*/, ""));
				i++;
			}
			blocks.push({
				type: "list",
				listType: "unordered",
				listItems: items,
			});
			continue;
		}

		// 6. Ordered List Items
		if (line.trim().match(/^\d+\.\s+/)) {
			const items: string[] = [];
			while (i < lines.length && lines[i].trim().match(/^\d+\.\s+/)) {
				items.push(lines[i].trim().replace(/^\d+\.\s*/, ""));
				i++;
			}
			blocks.push({
				type: "list",
				listType: "ordered",
				listItems: items,
			});
			continue;
		}

		// 7. Paragraph or blank line
		if (line.trim() === "") {
			i++;
			continue;
		}

		const paragraphLines: string[] = [];
		while (
			i < lines.length &&
			lines[i].trim() !== "" &&
			!lines[i].trim().startsWith("```") &&
			!lines[i].trim().startsWith(">") &&
			!(lines[i].trim().startsWith("|") && lines[i].trim().endsWith("|")) &&
			!lines[i].trim().startsWith("#") &&
			!lines[i].trim().startsWith("* ") &&
			!lines[i].trim().startsWith("- ") &&
			!lines[i].trim().match(/^\d+\.\s+/)
		) {
			paragraphLines.push(lines[i]);
			i++;
		}

		blocks.push({
			type: "paragraph",
			content: paragraphLines.join("\n"),
		});
	}

	return blocks;
}

function parseMarkdown(text: string) {
	const blocks = parseMarkdownToBlocks(text);

	return blocks.map((block, index) => {
		if (block.type === "code") {
			return (
				<CodeBlock
					// biome-ignore lint/suspicious/noArrayIndexKey: stable index
					key={index}
					code={block.content || ""}
					language={block.language}
				/>
			);
		}

		if (block.type === "blockquote") {
			const contentLines = block.content?.split("\n") || [];
			let author = "";
			let quoteText = "";

			const lastLine = contentLines[contentLines.length - 1]?.trim() || "";
			if (lastLine.startsWith("-") || lastLine.startsWith("—")) {
				author = lastLine.replace(/^[-—]\s*/, "");
				quoteText = contentLines.slice(0, -1).join("\n");
			} else {
				quoteText = block.content || "";
			}

			return (
				<div
					// biome-ignore lint/suspicious/noArrayIndexKey: stable index
					key={index}
					className="my-3.5 pl-4 border-l-2 border-purple-500 bg-purple-950/25 py-3 pr-3.5 rounded-r-xl relative overflow-hidden group border border-purple-500/10 shadow-[inset_0_1px_10px_rgba(168,85,247,0.05)]"
				>
					<div className="absolute top-2.5 right-2.5 text-purple-500/10 group-hover:text-purple-500/20 transition-colors pointer-events-none">
						<Quote className="w-8 h-8 rotate-180" />
					</div>
					<p className="text-[12px] italic text-purple-200/95 leading-relaxed font-serif">
						{parseInlineMarkdown(quoteText)}
					</p>
					{author && (
						<p className="text-[10px] text-right mt-2 text-purple-400 font-sans tracking-wide font-medium uppercase">
							— {author}
						</p>
					)}
				</div>
			);
		}

		if (block.type === "table") {
			return (
				<div
					// biome-ignore lint/suspicious/noArrayIndexKey: stable index
					key={index}
					className="my-3 overflow-x-auto rounded-xl border border-purple-500/10 bg-purple-950/10 backdrop-blur-sm"
				>
					<table className="w-full text-[12px] text-left border-collapse">
						<thead>
							<tr className="bg-purple-950/65 border-b border-purple-500/15 text-[11px] uppercase tracking-wider text-purple-200">
								{block.tableHeaders?.map((header, headIdx) => (
									<th
										// biome-ignore lint/suspicious/noArrayIndexKey: table headers are static and safe to index
										key={headIdx}
										className="px-4 py-2 font-semibold text-purple-300 border-r border-purple-500/5 last:border-r-0"
									>
										{parseInlineMarkdown(header)}
									</th>
								))}
							</tr>
						</thead>
						<tbody className="divide-y divide-purple-500/5">
							{block.tableRows?.map((row, rowIdx) => (
								<tr
									// biome-ignore lint/suspicious/noArrayIndexKey: row indexing is stable for static rendering
									key={rowIdx}
									className="hover:bg-white/[0.02] even:bg-white/[0.01] transition-colors"
								>
									{row.map((cell, cellIdx) => (
										<td
											// biome-ignore lint/suspicious/noArrayIndexKey: cell indexing is stable for static rendering
											key={cellIdx}
											className="px-4 py-2.5 border-r border-purple-500/5 text-purple-100/90 last:border-r-0 font-medium"
										>
											{parseInlineMarkdown(cell)}
										</td>
									))}
								</tr>
							))}
						</tbody>
					</table>
				</div>
			);
		}

		if (block.type === "heading") {
			const HeadingTag =
				`h${Math.min(6, block.level || 3)}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
			const classNames =
				block.level === 1
					? "text-base font-bold text-white mt-4 mb-2 pb-1 border-b border-purple-500/20"
					: block.level === 2
						? "text-sm font-semibold text-white mt-3.5 mb-2 pb-0.5 border-b border-purple-500/10"
						: "text-xs font-semibold text-purple-300 mt-3 mb-1.5 uppercase tracking-wide";

			return (
				<HeadingTag
					// biome-ignore lint/suspicious/noArrayIndexKey: stable index
					key={index}
					className={classNames}
				>
					{parseInlineMarkdown(block.content || "")}
				</HeadingTag>
			);
		}

		if (block.type === "list") {
			if (block.listType === "unordered") {
				return (
					<ul
						// biome-ignore lint/suspicious/noArrayIndexKey: stable index
						key={index}
						className="list-disc pl-5 my-2.5 space-y-1.5 text-purple-200/90 text-[13px]"
					>
						{block.listItems?.map((item, itemIdx) => (
							// biome-ignore lint/suspicious/noArrayIndexKey: stable index
							<li key={itemIdx}>{parseInlineMarkdown(item)}</li>
						))}
					</ul>
				);
			}
			return (
				<ol
					// biome-ignore lint/suspicious/noArrayIndexKey: stable index
					key={index}
					className="list-decimal pl-5 my-2.5 space-y-1.5 text-purple-200/90 text-[13px]"
				>
					{block.listItems?.map((item, itemIdx) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: stable index
						<li key={itemIdx}>{parseInlineMarkdown(item)}</li>
					))}
				</ol>
			);
		}

		return (
			<p
				// biome-ignore lint/suspicious/noArrayIndexKey: stable index
				key={index}
				className="my-2 text-purple-100 text-[13px] leading-relaxed last:mb-0"
			>
				{parseInlineMarkdown(block.content || "")}
			</p>
		);
	});
}

function parseInlineMarkdown(text: string): React.ReactNode {
	const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
	const parts: { type: "text" | "link"; text: string; url?: string }[] = [];

	let lastIndex = 0;
	let match: RegExpExecArray | null;
	// biome-ignore lint/suspicious/noAssignInExpressions: standard regex loop
	while ((match = linkRegex.exec(text)) !== null) {
		const matchIndex = match.index;
		if (matchIndex > lastIndex) {
			parts.push({ type: "text", text: text.substring(lastIndex, matchIndex) });
		}
		parts.push({ type: "link", text: match[1], url: match[2] });
		lastIndex = linkRegex.lastIndex;
	}
	if (lastIndex < text.length) {
		parts.push({ type: "text", text: text.substring(lastIndex) });
	}

	return parts.map((part, index) => {
		if (part.type === "link" && part.url) {
			const isExternal =
				part.url.startsWith("http") || part.url.startsWith("//");
			return (
				<a
					// biome-ignore lint/suspicious/noArrayIndexKey: stable index
					key={index}
					href={part.url}
					target={isExternal ? "_blank" : undefined}
					rel={isExternal ? "noopener noreferrer" : undefined}
					className="text-purple-400 hover:text-purple-300 hover:underline inline-flex items-center gap-0.5 transition-colors font-medium"
				>
					{part.text}
					{isExternal && (
						<ExternalLink className="w-3 h-3 text-purple-400/60 inline" />
					)}
				</a>
			);
		}

		const formatText = part.text;
		const boldParts = formatText.split(/(\*\*.*?\*\*)/g);
		return boldParts.map((bPart, bIndex) => {
			const bKey = `${index}-${bIndex}`;
			if (bPart.startsWith("**") && bPart.endsWith("**")) {
				const innerBold = bPart.substring(2, bPart.length - 2);
				return (
					<strong key={bKey} className="font-bold text-white">
						{parseDeepInline(innerBold, bKey)}
					</strong>
				);
			}
			return parseDeepInline(bPart, bKey);
		});
	});
}

function parseDeepInline(text: string, parentKey: string): React.ReactNode {
	const codeParts = text.split(/(`.*?`)/g);
	return codeParts.map((cPart, cIndex) => {
		const cKey = `${parentKey}-${cIndex}`;
		if (cPart.startsWith("`") && cPart.endsWith("`")) {
			return (
				<code
					key={cKey}
					className="px-1 py-0.5 rounded bg-purple-950/60 border border-purple-500/20 text-purple-300 font-mono text-[11px]"
				>
					{cPart.substring(1, cPart.length - 1)}
				</code>
			);
		}
		const italicParts = cPart.split(/(\*.*?\*)/g);
		return italicParts.map((iPart, iIndex) => {
			const iKey = `${cKey}-${iIndex}`;
			if (iPart.startsWith("*") && iPart.endsWith("*")) {
				return (
					<em key={iKey} className="italic text-purple-200/90 font-serif">
						{iPart.substring(1, iPart.length - 1)}
					</em>
				);
			}
			return iPart;
		});
	});
}
