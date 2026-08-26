"use client";

import { useState } from "react";
import { Star } from "lucide-react";

const RATING_LABELS = {
  1: "Poor",
  2: "Fair",
  3: "Good",
  4: "Very Good",
  5: "Excellent",
};

export default function StarRating({
  rating = 0,
  onRatingChange,
  readOnly = false,
  size = "w-5 h-5",
  showLabel = false,
}) {
  const [hoverRating, setHoverRating] = useState(0);

  const activeRating = hoverRating || rating;

  return (
    <div className="inline-flex items-center gap-2">
      <div
        className={`flex items-center gap-1 ${
          !readOnly ? "cursor-pointer" : ""
        }`}
        onMouseLeave={() => !readOnly && setHoverRating(0)}
      >
        {[1, 2, 3, 4, 5].map((starValue) => {
          const isFilled = starValue <= activeRating;
          return (
            <button
              key={starValue}
              type="button"
              disabled={readOnly}
              onClick={() => onRatingChange && onRatingChange(starValue)}
              onMouseEnter={() => !readOnly && setHoverRating(starValue)}
              className={`p-0.5 transition-transform ${
                !readOnly
                  ? "hover:scale-125 focus:outline-none cursor-pointer"
                  : "cursor-default"
              }`}
              aria-label={`${starValue} Stars`}
            >
              <Star
                className={`${size} transition-colors ${
                  isFilled
                    ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_2px_rgba(251,191,36,0.5)]"
                    : "fill-stone-200 text-stone-300"
                }`}
              />
            </button>
          );
        })}
      </div>

      {showLabel && (
        <span
          className={`text-xs min-w-[100px] transition-colors ${
            activeRating > 0
              ? "font-bold text-[#2C2A29]"
              : "text-stone-400 italic font-medium"
          }`}
        >
          {RATING_LABELS[activeRating]
            ? `${activeRating} - ${RATING_LABELS[activeRating]}`
            : "Click to rate"}
        </span>
      )}
    </div>
  );
}
