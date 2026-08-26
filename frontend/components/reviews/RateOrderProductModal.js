"use client";

import { useState, useEffect } from "react";
import StarRating from "./StarRating";
import {
  createProductReview,
  updateProductReview,
} from "@/lib/reviews";
import { useToast } from "@/context/ToastContext";
import { X, CheckCircle2, Send, Star, ShoppingBag } from "lucide-react";

export default function RateOrderProductModal({
  isOpen,
  onClose,
  product,
  existingReview,
  onReviewSubmitted,
}) {
  const { showToast } = useToast();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating || 0);
      setComment(existingReview.comment || "");
    } else {
      setRating(0);
      setComment("");
    }
  }, [existingReview, isOpen]);

  if (!isOpen || !product) return null;

  const isEditing = Boolean(existingReview?.id);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating || rating < 1 || rating > 5) {
      showToast("Please select a star rating (1 to 5 stars).", "error");
      return;
    }

    try {
      setSubmitting(true);
      if (isEditing) {
        await updateProductReview(existingReview.id, {
          rating,
          comment: comment.trim() || undefined,
        });
        showToast("Your review has been updated successfully!", "success");
      } else {
        await createProductReview(product.id, {
          rating,
          comment: comment.trim() || undefined,
        });
        showToast("Thank you! Your review has been submitted.", "success");
      }

      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
      onClose();
    } catch (err) {
      showToast(err.message || "Failed to submit review", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <div className="bg-[#F7F5F0] border border-[#DDD6C8] rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 bg-[#ECE8DF] border-b border-[#DDD6C8] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#1E3A5F] text-white flex items-center justify-center shadow-xs">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[#2C2A29]">
                {isEditing ? "Edit Your Review" : "Rate & Review Product"}
              </h3>
              <p className="text-[11px] text-stone-500 font-mono">
                Verified Purchase Rating
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#FFFFFF] hover:bg-[#ECE8DF] text-stone-600 flex items-center justify-center transition border border-[#D8D4CE] cursor-pointer shadow-xs"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Product Summary Card */}
          <div className="flex items-center gap-3.5 p-3.5 bg-[#FFFFFF] rounded-2xl border border-[#DDD6C8] shadow-xs">
            <div className="w-14 h-14 rounded-xl bg-[#F7F5F0] border border-[#E5E1D8] overflow-hidden shrink-0">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-stone-400">
                  <ShoppingBag className="w-5 h-5 text-stone-400" />
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h4 className="text-xs sm:text-sm font-bold text-[#2C2A29] line-clamp-1">
                {product.name}
              </h4>
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3" />
                  Delivered Purchase
                </span>
              </div>
            </div>
          </div>

          {/* Rating Selector */}
          <div className="space-y-2 bg-[#FFFFFF] p-4 rounded-2xl border border-[#DDD6C8] shadow-xs">
            <label className="block text-xs font-bold text-[#2C2A29]">
              Overall Rating <span className="text-rose-500">*</span>
            </label>
            <StarRating
              rating={rating}
              onRatingChange={setRating}
              showLabel
              size="w-7 h-7"
            />
          </div>

          {/* Written Feedback Textarea */}
          <div className="space-y-1.5 bg-[#FFFFFF] p-4 rounded-2xl border border-[#DDD6C8] shadow-xs">
            <label className="block text-xs font-bold text-[#2C2A29]">
              Written Review (Optional)
            </label>
            <textarea
              rows={4}
              maxLength={1000}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What did you like or dislike? How was the quality, material, or fit?"
              className="w-full text-xs text-stone-800 bg-[#F7F5F0] border border-[#DDD6C8] rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] transition resize-none min-w-0"
            />
            <div className="flex justify-end text-[10px] text-stone-400 font-mono">
              {comment.length} / 1000
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-[#FFFFFF] hover:bg-[#ECE8DF] text-stone-700 text-xs font-semibold px-4 py-2.5 rounded-xl border border-[#D8D4CE] transition cursor-pointer shadow-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-[#1E3A5F] hover:bg-[#152843] disabled:opacity-50 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>
                {submitting
                  ? "Saving..."
                  : isEditing
                    ? "Update Review"
                    : "Submit Review"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
