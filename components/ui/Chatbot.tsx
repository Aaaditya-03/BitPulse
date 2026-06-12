"use client";

import {
	ArrowRight,
	Bot,
	MessageSquare,
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
										className={`flex gap-2.5 max-w-[85%] ${
											msg.role === "user" ? "ml-auto flex-row-reverse" : ""
										}`}
									>
										<div
											className={`w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0 ${
												msg.role === "user"
													? "bg-purple-600 text-white"
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
											className={`px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed whitespace-pre-line ${
												msg.role === "user"
													? "bg-purple-600/90 text-white rounded-tr-none shadow-sm shadow-purple-600/10"
													: "bg-dark-800 border border-purple-500/5 text-purple-100 rounded-tl-none"
											}`}
										>
											{msg.content}
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
