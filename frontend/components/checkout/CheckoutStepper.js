"use client";

export default function CheckoutStepper({ currentStep, onStepClick, canNavigateToStep }) {
  return (
    <div className="bg-[#ECE8DF] border border-[#DDD6C8] rounded-3xl p-4 sm:p-5 shadow-xs">
      <div className="flex items-center justify-between max-w-2xl mx-auto">
        {/* Step 1 */}
        <button
          type="button"
          onClick={() => onStepClick(1)}
          className="flex items-center gap-2.5 group cursor-pointer focus:outline-none"
        >
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm transition ${
              currentStep >= 1
                ? "bg-[#1E3A5F] text-white shadow-xs"
                : "bg-[#FFFFFF] text-stone-400 border border-[#D8D4CE]"
            }`}
          >
            1
          </div>
          <span
            className={`text-xs sm:text-sm font-semibold hidden sm:inline ${
              currentStep >= 1 ? "text-[#2C2A29]" : "text-stone-500"
            }`}
          >
            Delivery Address
          </span>
        </button>

        <div
          className={`h-0.5 flex-1 mx-4 transition-colors ${
            currentStep >= 2 ? "bg-[#1E3A5F]" : "bg-[#DDD6C8]"
          }`}
        />

        {/* Step 2 */}
        <button
          type="button"
          onClick={() => canNavigateToStep(2) && onStepClick(2)}
          disabled={!canNavigateToStep(2)}
          className="flex items-center gap-2.5 group cursor-pointer focus:outline-none disabled:cursor-not-allowed"
        >
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm transition ${
              currentStep >= 2
                ? "bg-[#1E3A5F] text-white shadow-xs"
                : "bg-[#FFFFFF] text-stone-400 border border-[#D8D4CE]"
            }`}
          >
            2
          </div>
          <span
            className={`text-xs sm:text-sm font-semibold hidden sm:inline ${
              currentStep >= 2 ? "text-[#2C2A29]" : "text-stone-500"
            }`}
          >
            Review & Offers
          </span>
        </button>

        <div
          className={`h-0.5 flex-1 mx-4 transition-colors ${
            currentStep >= 3 ? "bg-[#1E3A5F]" : "bg-[#DDD6C8]"
          }`}
        />

        {/* Step 3 */}
        <button
          type="button"
          onClick={() => canNavigateToStep(3) && onStepClick(3)}
          disabled={!canNavigateToStep(3)}
          className="flex items-center gap-2.5 group cursor-pointer focus:outline-none disabled:cursor-not-allowed"
        >
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm transition ${
              currentStep === 3
                ? "bg-[#1E3A5F] text-white shadow-xs"
                : "bg-[#FFFFFF] text-stone-400 border border-[#D8D4CE]"
            }`}
          >
            3
          </div>
          <span
            className={`text-xs sm:text-sm font-semibold hidden sm:inline ${
              currentStep === 3 ? "text-[#2C2A29]" : "text-stone-500"
            }`}
          >
            Payment
          </span>
        </button>
      </div>
    </div>
  );
}
