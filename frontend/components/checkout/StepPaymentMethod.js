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
    <div className="bg-[#ECE8DF] border border-[#DDD6C8] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
      <div className="pb-5 border-b border-[#DDD6C8]">
        <h2 className="text-xl sm:text-2xl font-extrabold text-[#2C2A29]">Select Payment Method</h2>
        <p className="text-xs sm:text-sm text-stone-600 mt-1">
          Choose your preferred payment method and complete your order securely.
        </p>
      </div>

      {/* Error Notice if payment failed */}
      {paymentError && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-xs sm:text-sm text-red-700 flex items-start gap-3">
          <span className="text-lg">⚠️</span>
          <div>
            <span className="font-bold text-red-800 block">Payment Unsuccessful</span>
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
              ? "bg-[#FFFFFF] border-[#1E3A5F] shadow-xs ring-1 ring-[#1E3A5F]"
              : "bg-[#FFFFFF] border-[#D8D4CE] hover:border-stone-400"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <input
                type="radio"
                name="paymentMethod"
                checked={paymentMethod === "MOCK_CARD"}
                onChange={() => setPaymentMethod("MOCK_CARD")}
                className="text-[#1E3A5F] focus:ring-0 w-4 h-4 cursor-pointer"
              />
              <div>
                <span className="text-sm font-bold text-[#2C2A29] block">Credit / Debit Card</span>
                <span className="text-xs text-stone-500">Pay with Visa, Mastercard, RuPay & American Express</span>
              </div>
            </div>
            <span className="text-xl">💳</span>
          </div>

          {paymentMethod === "MOCK_CARD" && (
            <div className="mt-5 pt-4 border-t border-[#DDD6C8] grid grid-cols-2 gap-4 text-xs sm:text-sm">
              <div className="col-span-2">
                <label className="text-xs font-semibold text-stone-700 block mb-1.5">Card Number</label>
                <input
                  type="text"
                  readOnly
                  value="•••• •••• •••• 4242 (Visa Platinum)"
                  className="w-full bg-[#FFFFFF] border border-[#D8D4CE] rounded-xl px-4 py-2.5 text-[#2C2A29] font-mono text-xs sm:text-sm cursor-default shadow-xs"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1.5">Expiration Date</label>
                <input
                  type="text"
                  readOnly
                  value="12 / 28"
                  className="w-full bg-[#FFFFFF] border border-[#D8D4CE] rounded-xl px-4 py-2.5 text-[#2C2A29] font-mono text-xs sm:text-sm cursor-default shadow-xs"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1.5">CVV</label>
                <input
                  type="text"
                  readOnly
                  value="•••"
                  className="w-full bg-[#FFFFFF] border border-[#D8D4CE] rounded-xl px-4 py-2.5 text-[#2C2A29] font-mono text-xs sm:text-sm cursor-default shadow-xs"
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
              ? "bg-[#FFFFFF] border-[#1E3A5F] shadow-xs ring-1 ring-[#1E3A5F]"
              : "bg-[#FFFFFF] border-[#D8D4CE] hover:border-stone-400"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <input
                type="radio"
                name="paymentMethod"
                checked={paymentMethod === "MOCK_UPI"}
                onChange={() => setPaymentMethod("MOCK_UPI")}
                className="text-[#1E3A5F] focus:ring-0 w-4 h-4 cursor-pointer"
              />
              <div>
                <span className="text-sm font-bold text-[#2C2A29] block">UPI / QR Code</span>
                <span className="text-xs text-stone-500">Instant pay with Google Pay, PhonePe, Paytm, BHIM & UPI Apps</span>
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
              ? "bg-[#FFFFFF] border-[#1E3A5F] shadow-xs ring-1 ring-[#1E3A5F]"
              : "bg-[#FFFFFF] border-[#D8D4CE] hover:border-stone-400"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <input
                type="radio"
                name="paymentMethod"
                checked={paymentMethod === "COD"}
                onChange={() => setPaymentMethod("COD")}
                className="text-[#1E3A5F] focus:ring-0 w-4 h-4 cursor-pointer"
              />
              <div>
                <span className="text-sm font-bold text-[#2C2A29] block">Cash on Delivery (COD)</span>
                <span className="text-xs text-stone-500">Pay with cash or UPI scan upon doorstep delivery</span>
              </div>
            </div>
            <span className="text-xl">💵</span>
          </div>
        </div>
      </div>

      {/* Action Controls */}
      <div className="bg-[#FFFFFF] border border-[#D8D4CE] rounded-3xl p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-stone-800">Amount Payable</span>
          <span className="text-2xl font-extrabold text-[#2C2A29] font-mono">
            {formatCurrency(finalTotal)}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3.5 pt-2">
          <button
            type="button"
            disabled={processingOrder}
            onClick={() => onPlaceOrder(true)}
            className="w-full sm:flex-1 bg-[#1E3A5F] hover:bg-[#152843] disabled:opacity-50 text-white text-sm font-bold py-3.5 px-6 rounded-2xl transition shadow-xs flex items-center justify-center gap-2 cursor-pointer"
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
              className="w-full sm:w-auto bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-semibold py-3.5 px-4 rounded-2xl transition cursor-pointer"
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
          className="bg-[#FFFFFF] hover:bg-[#ECE8DF] text-[#2C2A29] border border-[#D8D4CE] text-xs sm:text-sm font-semibold px-5 py-3 rounded-xl transition cursor-pointer shadow-xs"
        >
          &larr; Back to Order Review
        </button>
      </div>
    </div>
  );
}
