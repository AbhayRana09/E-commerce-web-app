"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { sendChatMessage } from "@/lib/chat";
import {
  Bot,
  Send,
  X,
  User as UserIcon,
  Package,
  Truck,
  RotateCcw,
  Loader2
} from "lucide-react";

export default function OrdersChatDrawer() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `Hello ${user?.first_name || ""}! I am your AI Orders Assistant. You can ask me to track your shipments, check order statuses, or summarize your recent purchases.`,
      order_summaries: null
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

      const res = await sendChatMessage(formattedHistory, "orders");

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: res.reply,
          order_summaries: res.order_summaries || null
        }
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: err.message || "Could not retrieve order details at this moment.",
          order_summaries: null
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
        content: "Chat history cleared. How can I help you with your orders today?",
        order_summaries: null
      }
    ]);
  };

  const samplePrompts = [
    "Where is my latest order?",
    "Which items have shipped?",
    "Summarize my recent orders"
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case "DELIVERED":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "SHIPPED":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "PROCESSING":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "CANCELLED":
        return "bg-rose-100 text-rose-800 border-rose-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  return (
    <>
      {/* 1. Floating Action Button (Only visible when chat is closed) */}
      {!isOpen && (
        <div className="fixed bottom-5 right-5 z-[9999] animate-in fade-in zoom-in-95 duration-150">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="group relative w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950 text-white flex items-center justify-center shadow-2xl hover:shadow-indigo-500/30 border border-slate-700/70 hover:border-indigo-400/80 hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer"
            aria-label="Open AI Orders Assistant"
            title="Track Orders AI"
          >
            <Truck className="w-6 h-6 text-indigo-300 animate-pulse" />
            {/* Online Blue Indicator Dot */}
            <span className="absolute top-1 right-1 w-3 h-3 bg-indigo-500 border-2 border-slate-900 rounded-full"></span>
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
                <Truck className="w-4 h-4 text-indigo-300" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">
                  Orders AI Assistant
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

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}
              >
                <div className="flex items-start gap-2 max-w-[90%]">
                  {m.role === "assistant" && (
                    <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      m.role === "user"
                        ? "bg-indigo-600 text-white rounded-tr-xs shadow-md shadow-indigo-600/10"
                        : "bg-white text-slate-800 border border-slate-200/80 rounded-tl-xs shadow-xs"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{m.content}</p>

                    {/* Structured Order Summaries */}
                    {m.order_summaries && m.order_summaries.length > 0 && (
                      <div className="mt-3.5 pt-3 border-t border-slate-100 space-y-2">
                        <div className="text-[11px] font-semibold tracking-wider uppercase text-slate-500 flex items-center gap-1">
                          <Package className="w-3.5 h-3.5 text-indigo-600" />
                          Recent Order Milestones
                        </div>
                        <div className="space-y-2">
                          {m.order_summaries.map((order) => (
                            <div
                              key={order.id}
                              className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1.5"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-900">
                                  Order #{order.id}
                                </span>
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(
                                    order.status
                                  )}`}
                                >
                                  {order.status}
                                </span>
                              </div>
                              <div className="text-xs text-slate-600 flex justify-between">
                                <span>Placed: {order.created_at}</span>
                                <span className="font-semibold text-slate-900">
                                  ${Number(order.total_amount).toFixed(2)}
                                </span>
                              </div>
                              {order.items_summary && (
                                <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-200/40 truncate">
                                  {order.items_summary.join(", ")}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {m.role === "user" && (
                    <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center shrink-0 mt-0.5">
                      <UserIcon className="w-4 h-4" />
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-start gap-2">
                <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-xs px-4 py-3 flex items-center gap-2 text-slate-500 text-xs shadow-xs">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                  Checking order records & milestones...
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

          {/* Input Box */}
          <div className="p-2.5 bg-white border-t border-slate-100 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about order tracking, status, delivery..."
                disabled={loading}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="p-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 disabled:hover:bg-indigo-600 transition-colors shrink-0 shadow-md shadow-indigo-600/20 cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

        </div>
      )}
    </>
  );
}
