"use client";

import { ArrowLeft } from "lucide-react";

export default function StepPaymentMethod({
  paymentMethod,
  setPaymentMethod,
  paymentError,
  onBack,
}) {
  return (
    <div className="bg-[#ECE8DF] border border-[#DDD6C8] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
      <div className="pb-5 border-b border-[#DDD6C8] flex items-center gap-3">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="w-10 h-10 rounded-2xl bg-[#FFFFFF] hover:bg-[#ECE8DF] text-[#2C2A29] border border-[#D8D4CE] flex items-center justify-center transition shadow-xs cursor-pointer shrink-0"
            title="Back to Order Summary"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#2C2A29]">Select Payment Method</h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Choose your preferred payment method and complete your order securely.
          </p>
        </div>
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
    </div>
  );
}
