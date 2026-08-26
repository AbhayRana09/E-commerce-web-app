"use client";

import { useState, useEffect, useCallback } from "react";
import { getProductReviews, deleteProductReview } from "@/lib/reviews";
import { useToast } from "@/context/ToastContext";
import StarRating from "@/components/reviews/StarRating";
import {
  X,
  Star,
  Trash2,
  MessageSquare,
  AlertCircle,
  Calendar,
} from "lucide-react";

export default function ProductReviewsModal({
  isOpen,
  onClose,
  product,
  onReviewDeleted,
}) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [reviewsData, setReviewsData] = useState({
    average_rating: 0.0,
    total_reviews: 0,
    breakdown: { star_5: 0, star_4: 0, star_3: 0, star_2: 0, star_1: 0 },
    reviews: [],
  });

  const [filterRating, setFilterRating] = useState("all");
  const [deletingId, setDeletingId] = useState(null);

  const loadReviews = useCallback(async () => {
    if (!product?.id) return;
    try {
      setLoading(true);
      const data = await getProductReviews(product.id);
      setReviewsData(data);
    } catch (err) {
      showToast(err.message || "Failed to load product reviews", "error");
    } finally {
      setLoading(false);
    }
  }, [product?.id, showToast]);

  useEffect(() => {
    if (isOpen && product?.id) {
      loadReviews();
    }
  }, [isOpen, product?.id, loadReviews]);

  if (!isOpen || !product) return null;

  // Direct Instant Delete Action (No Alert / No Modal)
  const handleDelete = async (reviewId) => {
    try {
      setDeletingId(reviewId);
      await deleteProductReview(reviewId);
      showToast("Review deleted successfully.", "success");
      await loadReviews();
      if (onReviewDeleted) onReviewDeleted();
    } catch (err) {
      showToast(err.message || "Failed to delete review", "error");
    } finally {
      setDeletingId(null);
    }
  };

  const { average_rating, total_reviews, reviews } = reviewsData;

  const filteredReviews = reviews.filter((r) => {
    if (filterRating === "all") return true;
    return r.rating === parseInt(filterRating, 10);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <div className="bg-[#F7F5F0] border border-[#DDD6C8] rounded-3xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-6 bg-[#ECE8DF] border-b border-[#DDD6C8] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1E3A5F] text-white flex items-center justify-center shadow-xs shrink-0">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#2C2A29] line-clamp-1">
                  Product Reviews: {product.name}
                </h3>
              </div>
              <p className="text-xs text-stone-500 font-mono">
                Average Rating: {average_rating > 0 ? average_rating.toFixed(1) : "0.0"} ★ ({total_reviews} total reviews)
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

        {/* Filter Bar */}
        <div className="px-6 py-3 bg-[#FFFFFF] border-b border-[#E5E1D8] flex items-center justify-between gap-3 shrink-0 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-600">
            <span>Filter Rating:</span>
            {["all", "5", "4", "3", "2", "1"].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setFilterRating(val)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  filterRating === val
                    ? "bg-[#1E3A5F] text-white shadow-xs"
                    : "bg-[#F7F5F0] hover:bg-stone-200 text-stone-700 border border-[#DDD6C8]"
                }`}
              >
                {val === "all" ? "All" : `${val} ★`}
              </button>
            ))}
          </div>

          <span className="text-xs text-stone-500 font-mono">
            Showing {filteredReviews.length} of {total_reviews}
          </span>
        </div>

        {/* Modal Body / Reviews Feed */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-3 border-[#1E3A5F] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredReviews.length === 0 ? (
            <div className="text-center py-16 bg-[#FFFFFF] rounded-2xl border border-[#DDD6C8]">
              <AlertCircle className="w-8 h-8 text-stone-400 mx-auto mb-2" />
              <p className="text-xs font-semibold text-stone-700">
                {filterRating === "all"
                  ? "No customer reviews exist for this product yet."
                  : `No reviews found with ${filterRating} stars.`}
              </p>
            </div>
          ) : (
            filteredReviews.map((review) => {
              const reviewerName = review.user
                ? `${review.user.first_name} ${review.user.last_name}`
                : "Customer";
              const reviewerEmail = review.user?.email || "N/A";
              const isDeletingThis = deletingId === review.id;

              return (
                <div
                  key={review.id}
                  className="bg-[#FFFFFF] border border-[#DDD6C8] rounded-2xl p-4 shadow-xs space-y-2.5 transition hover:border-[#1E3A5F]/40"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-stone-100 border border-[#DDD6C8] flex items-center justify-center text-xs font-bold text-stone-700">
                        {review.user?.first_name?.[0] || "U"}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#2C2A29]">
                            {reviewerName}
                          </span>
                          <span className="text-[11px] text-stone-500 font-mono">
                            ({reviewerEmail})
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-stone-400 font-mono mt-0.5">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {new Date(review.created_at).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <StarRating rating={review.rating} readOnly size="w-3.5 h-3.5" />
                      <button
                        type="button"
                        disabled={isDeletingThis}
                        onClick={() => handleDelete(review.id)}
                        className="bg-rose-50 hover:bg-rose-100 disabled:opacity-50 text-rose-700 text-xs font-semibold px-2.5 py-1 rounded-lg border border-rose-200 transition cursor-pointer flex items-center gap-1 shadow-xs"
                        title="Delete this review"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>{isDeletingThis ? "Deleting..." : "Delete"}</span>
                      </button>
                    </div>
                  </div>

                  {review.comment ? (
                    <p className="text-xs text-stone-700 leading-relaxed whitespace-pre-line break-words [overflow-wrap:anywhere] bg-[#F7F5F0] p-3 rounded-xl border border-[#E5E1D8]">
                      {review.comment}
                    </p>
                  ) : (
                    <p className="text-[11px] text-stone-400 italic">
                      No written comment.
                    </p>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#ECE8DF] border-t border-[#DDD6C8] flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="bg-[#FFFFFF] hover:bg-[#ECE8DF] text-[#2C2A29] text-xs font-semibold px-5 py-2.5 rounded-xl border border-[#D8D4CE] transition cursor-pointer shadow-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
