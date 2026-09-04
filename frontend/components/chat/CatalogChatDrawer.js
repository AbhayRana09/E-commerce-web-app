"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { sendChatMessage } from "@/lib/chat";
import {
  Sparkles,
  Send,
  X,
  Bot,
  User as UserIcon,
  Star,
  ArrowRight,
  Loader2,
  ShoppingBag,
  RotateCcw
} from "lucide-react";

export default function CatalogChatDrawer() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `Hello ${user?.first_name || ""}! I am your AI Shopping Assistant. Ask me to find products, compare prices, or recommend top-rated items from our store catalog.`,
      recommended_products: null
    }
  ]);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      const handleKeyDown = (e) => {
        if (e.key === "Escape") {
          setIsOpen(false);
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [messages, isOpen]);

  // Only render for registered/logged-in users
  if (!user) {
    return null;
  }

  const handleSend = async (textToSend = null) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const userMessage = { role: "user", content: query };
    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInput("");
    setLoading(true);

    try {
      const formattedHistory = newHistory.map((m) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content
      }));

      const res = await sendChatMessage(formattedHistory, "catalog");

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: res.reply,
          recommended_products: res.recommended_products || null
        }
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: err.message || "Sorry, I couldn't process that request right now. Please try again.",
          recommended_products: null
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        role: "assistant",
        content: "Chat history cleared. What kind of products are you looking for today?",
        recommended_products: null
      }
    ]);
  };

  const samplePrompts = [
    "Recommend top-rated products",
    "Show items under $100",
    "What categories are available?"
  ];

  return (
    <>
      {/* 1. Floating Action Button (Only visible when chat is closed) */}
      {!isOpen && (
        <div className="fixed bottom-5 right-5 z-[9999] animate-in fade-in zoom-in-95 duration-150">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="group relative w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950 text-white flex items-center justify-center shadow-2xl hover:shadow-indigo-500/30 border border-slate-700/70 hover:border-indigo-400/80 hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer"
            aria-label="Open AI Shopping Assistant"
            title="Ask AI Shopping Assistant"
          >
            <Sparkles className="w-6 h-6 text-amber-300 animate-pulse" />
            {/* Online Green Indicator Dot */}
            <span className="absolute top-1 right-1 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full"></span>
          </button>
        </div>
      )}

      {/* 2. Floating Chat Window (Seamlessly replaces toggle button at bottom-5 right-5) */}
      {isOpen && (
        <div className="fixed bottom-5 right-5 z-[9999] w-[390px] sm:w-[410px] max-w-[calc(100vw-2.5rem)] h-[540px] max-h-[calc(100vh-2.5rem)] bg-white rounded-2xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden isolate animate-in fade-in slide-in-from-bottom-3 duration-200">
          
          {/* Header */}
          <div className="p-3.5 bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950 text-white flex items-center justify-between shadow-xs shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shrink-0">
                <Sparkles className="w-4 h-4 text-amber-300" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">
                  AI Shopping Assistant
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleClearHistory}
                title="Clear history"
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Chat Messages Thread */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 bg-slate-50">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}
              >
                <div className="flex items-start gap-2 max-w-[90%]">
                  {m.role === "assistant" && (
                    <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5 text-xs">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div
                    className={`rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                      m.role === "user"
                        ? "bg-indigo-600 text-white rounded-tr-xs shadow-xs"
                        : "bg-white text-slate-800 border border-slate-200 rounded-tl-xs shadow-xs"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{m.content}</p>

                    {/* Product Recommendation Cards */}
                    {m.recommended_products && m.recommended_products.length > 0 && (
                      <div className="mt-2.5 pt-2.5 border-t border-slate-100 space-y-1.5">
                        <div className="text-[10px] font-semibold tracking-wider uppercase text-indigo-600 flex items-center gap-1">
                          <ShoppingBag className="w-3 h-3" />
                          Store Recommendations
                        </div>
                        <div className="grid grid-cols-1 gap-1.5">
                          {m.recommended_products.map((prod) => (
                            <Link
                              key={prod.id}
                              href={`/products/${prod.slug || prod.id}`}
                              onClick={() => setIsOpen(false)}
                              className="group flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-indigo-50/70 border border-slate-200/80 hover:border-indigo-200 transition-all"
                            >
                              <div className="min-w-0 flex-1 pr-2">
                                <p className="text-[11px] font-semibold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                                  {prod.name}
                                </p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span className="text-[11px] font-bold text-slate-800">
                                    ${Number(prod.price).toFixed(2)}
                                  </span>
                                  {prod.average_rating > 0 && (
                                    <span className="flex items-center gap-0.5 text-[10px] text-amber-600 font-medium">
                                      <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                                      {prod.average_rating}
                                    </span>
                                  )}
                                  <span className={`text-[9px] font-medium px-1.5 py-0.2 rounded ${prod.in_stock ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}>
                                    {prod.in_stock ? "In Stock" : "Out"}
                                  </span>
                                </div>
                              </div>
                              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {m.role === "user" && (
                    <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center shrink-0 mt-0.5 text-xs">
                      <UserIcon className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-xs px-3 py-2 flex items-center gap-2 text-slate-500 text-xs shadow-xs">
                  <Loader2 className="w-3 h-3 animate-spin text-indigo-600" />
                  Searching store catalog...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Sample Quick Prompt Pills */}
          <div className="px-3 py-2 bg-white border-t border-slate-100 flex gap-1.5 overflow-x-auto shrink-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {samplePrompts.map((prompt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSend(prompt)}
                disabled={loading}
                className="shrink-0 text-[10px] font-medium px-2.5 py-1 rounded-full bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 transition-colors border border-slate-200/60 disabled:opacity-50 cursor-pointer"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <div className="p-2.5 bg-white border-t border-slate-100 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-1.5"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about products, prices..."
                disabled={loading}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="p-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 disabled:hover:bg-indigo-600 transition-colors shrink-0 shadow-xs cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

        </div>
      )}
    </>
  );
}
