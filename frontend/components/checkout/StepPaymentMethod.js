"use client";

import { formatCurrency } from "@/lib/formatters";

export default function StepPaymentMethod({
  paymentMethod,
  setPaymentMethod,
  paymentError,
  finalTotal,
  processingOrder,
  onPlaceOrder,
  onBack,
}) {
  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
      <div className="pb-5 border-b border-slate-800">
        <h2 className="text-xl sm:text-2xl font-extrabold text-white">Select Payment Method</h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Choose your preferred payment method and complete your order securely.
        </p>
      </div>

      {/* Error Notice if payment failed */}
      {paymentError && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 text-xs sm:text-sm text-red-300 flex items-start gap-3">
          <span className="text-lg">⚠️</span>
          <div>
            <span className="font-bold text-red-200 block">Payment Unsuccessful</span>
            <p className="mt-0.5 leading-relaxed">{paymentError}</p>
          </div>
        </div>
      )}

      {/* Payment Methods Options */}
      <div className="space-y-4">
        {/* Method 1: Credit / Debit Card */}
        <div
          onClick={() => setPaymentMethod("MOCK_CARD")}
          className={`p-5 rounded-3xl border transition cursor-pointer ${
            paymentMethod === "MOCK_CARD"
              ? "bg-indigo-950/30 border-indigo-500 shadow-xl shadow-indigo-600/10 ring-1 ring-indigo-500/50"
              : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <input
                type="radio"
                name="paymentMethod"
                checked={paymentMethod === "MOCK_CARD"}
                onChange={() => setPaymentMethod("MOCK_CARD")}
                className="text-indigo-600 focus:ring-0 w-4 h-4 cursor-pointer"
              />
              <div>
                <span className="text-sm font-bold text-white block">Credit / Debit Card</span>
                <span className="text-xs text-slate-400">Pay with Visa, Mastercard, RuPay & American Express</span>
              </div>
            </div>
            <span className="text-xl">💳</span>
          </div>

          {paymentMethod === "MOCK_CARD" && (
            <div className="mt-5 pt-4 border-t border-slate-800/80 grid grid-cols-2 gap-4 text-xs sm:text-sm">
              <div className="col-span-2">
                <label className="text-xs font-semibold text-slate-400 block mb-1.5">Card Number</label>
                <input
                  type="text"
                  readOnly
                  value="•••• •••• •••• 4242 (Visa Platinum)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-300 font-mono text-xs sm:text-sm cursor-default"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1.5">Expiration Date</label>
                <input
                  type="text"
                  readOnly
                  value="12 / 28"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-300 font-mono text-xs sm:text-sm cursor-default"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1.5">CVV</label>
                <input
                  type="text"
                  readOnly
                  value="•••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-300 font-mono text-xs sm:text-sm cursor-default"
                />
              </div>
            </div>
          )}
        </div>

        {/* Method 2: UPI / QR Code */}
        <div
          onClick={() => setPaymentMethod("MOCK_UPI")}
          className={`p-5 rounded-3xl border transition cursor-pointer ${
            paymentMethod === "MOCK_UPI"
              ? "bg-indigo-950/30 border-indigo-500 shadow-xl shadow-indigo-600/10 ring-1 ring-indigo-500/50"
              : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <input
                type="radio"
                name="paymentMethod"
                checked={paymentMethod === "MOCK_UPI"}
                onChange={() => setPaymentMethod("MOCK_UPI")}
                className="text-indigo-600 focus:ring-0 w-4 h-4 cursor-pointer"
              />
              <div>
                <span className="text-sm font-bold text-white block">UPI / QR Code</span>
                <span className="text-xs text-slate-400">Instant pay with Google Pay, PhonePe, Paytm, BHIM & UPI Apps</span>
              </div>
            </div>
            <span className="text-xl">📱</span>
          </div>
        </div>

        {/* Method 3: Cash on Delivery (COD) */}
        <div
          onClick={() => setPaymentMethod("COD")}
          className={`p-5 rounded-3xl border transition cursor-pointer ${
            paymentMethod === "COD"
              ? "bg-indigo-950/30 border-indigo-500 shadow-xl shadow-indigo-600/10 ring-1 ring-indigo-500/50"
              : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <input
                type="radio"
                name="paymentMethod"
                checked={paymentMethod === "COD"}
                onChange={() => setPaymentMethod("COD")}
                className="text-indigo-600 focus:ring-0 w-4 h-4 cursor-pointer"
              />
              <div>
                <span className="text-sm font-bold text-white block">Cash on Delivery (COD)</span>
                <span className="text-xs text-slate-400">Pay with cash or UPI scan upon doorstep delivery</span>
              </div>
            </div>
            <span className="text-xl">💵</span>
          </div>
        </div>
      </div>

      {/* Action Controls */}
      <div className="bg-slate-950/90 border border-slate-800 rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-slate-200">Amount Payable</span>
          <span className="text-2xl font-extrabold text-white font-mono">
            {formatCurrency(finalTotal)}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3.5 pt-2">
          <button
            type="button"
            disabled={processingOrder}
            onClick={() => onPlaceOrder(true)}
            className="w-full sm:flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-bold py-3.5 px-6 rounded-2xl transition shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 cursor-pointer"
          >
            {processingOrder ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Processing Order...</span>
              </>
            ) : (
              <span>✓ Complete Order & Pay Now</span>
            )}
          </button>

          {paymentMethod !== "COD" && (
            <button
              type="button"
              disabled={processingOrder}
              onClick={() => onPlaceOrder(false)}
              className="w-full sm:w-auto bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-semibold py-3.5 px-4 rounded-2xl transition cursor-pointer"
              title="Simulate payment decline and retry prompt"
            >
              Payment Decline ✕
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={onBack}
          className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs sm:text-sm font-semibold px-5 py-3 rounded-xl transition cursor-pointer"
        >
          &larr; Back to Order Review
        </button>
      </div>
    </div>
  );
}
