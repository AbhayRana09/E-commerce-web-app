"use client";

import { useState, useEffect, useCallback } from "react";
import { getProductReviews, deleteProductReview } from "@/lib/reviews";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import StarRating from "./StarRating";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import RateOrderProductModal from "./RateOrderProductModal";
import {
  Star,
  CheckCircle2,
  Edit3,
  Trash2,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";

export default function ProductReviewsSection({ productId, productName }) {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [reviewData, setReviewData] = useState({
    average_rating: 0.0,
    total_reviews: 0,
    breakdown: { star_5: 0, star_4: 0, star_3: 0, star_2: 0, star_1: 0 },
    reviews: [],
  });

  // Filter state (e.g., 'all' or '5', '4', etc.)
  const [filterRating, setFilterRating] = useState("all");

  // Expanded review IDs for "Read More" toggle
  const [expandedReviewIds, setExpandedReviewIds] = useState({});

  // Edit & Delete modal states
  const [reviewToEdit, setReviewToEdit] = useState(null);
  const [reviewToDelete, setReviewToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const toggleExpand = (id) => {
    setExpandedReviewIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const loadReviews = useCallback(async () => {
    if (!productId) return;
    try {
      setLoading(true);
      const data = await getProductReviews(productId);
      setReviewData(data);
    } catch (err) {
      console.error("Failed to load reviews:", err);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  // Handle Delete Confirmation
  const handleConfirmDelete = async () => {
    if (!reviewToDelete) return;
    try {
      setDeleting(true);
      await deleteProductReview(reviewToDelete);
      showToast("Review deleted successfully.", "success");
      setReviewToDelete(null);
      await loadReviews();
    } catch (err) {
      showToast(err.message || "Failed to delete review", "error");
    } finally {
      setDeleting(false);
    }
  };

  const {
    average_rating,
    total_reviews,
    breakdown,
    reviews,
  } = reviewData;

  const filteredReviews = reviews.filter((r) => {
    if (filterRating === "all") return true;
    return r.rating === parseInt(filterRating, 10);
  });

  const getPercentage = (count) => {
    if (!total_reviews || total_reviews === 0) return 0;
    return Math.round((count / total_reviews) * 100);
  };

  if (loading) {
    return (
      <div className="bg-[#FFFFFF] border border-[#D8D4CE] rounded-3xl p-8 sm:p-10 shadow-xs animate-pulse space-y-6">
        <div className="h-6 bg-stone-200 rounded w-1/4"></div>
        <div className="h-32 bg-stone-100 rounded-2xl"></div>
        <div className="h-40 bg-stone-100 rounded-2xl"></div>
      </div>
    );
  }

  return (
    <div id="reviews-section" className="space-y-8 min-w-0">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DDD6C8] pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#2C2A29] flex items-center gap-2.5">
            <MessageSquare className="w-6 h-6 text-[#1E3A5F]" />
            <span>Ratings & Customer Reviews</span>
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Genuine ratings and feedback from verified purchasers of {productName || "this product"}.
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-stone-500 bg-[#ECE8DF] px-3 py-1.5 rounded-xl border border-[#DDD6C8]">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>100% Verified Buyer Reviews</span>
        </div>
      </div>

      {/* Ratings Overview & 5-Star Breakdown Grid */}
      <div className="bg-[#FFFFFF] border border-[#D8D4CE] rounded-3xl p-6 sm:p-8 shadow-xs grid grid-cols-1 md:grid-cols-12 gap-8 items-center min-w-0">
        {/* Left Column: Big Average Score */}
        <div className="md:col-span-4 flex flex-col items-center justify-center text-center p-6 bg-[#F7F5F0] rounded-2xl border border-[#E5E1D8]">
          <div className="text-4xl sm:text-5xl font-extrabold text-[#2C2A29] font-mono tracking-tight">
            {average_rating > 0 ? average_rating.toFixed(1) : "0.0"}
          </div>

          <div className="my-2.5">
            <StarRating rating={Math.round(average_rating)} readOnly size="w-5 h-5" />
          </div>

          <p className="text-xs text-stone-600 font-medium">
            Based on <strong className="text-[#2C2A29]">{total_reviews}</strong> verified {total_reviews === 1 ? "review" : "reviews"}
          </p>
        </div>

        {/* Right Column: 5-Star Progress Bars */}
        <div className="md:col-span-8 space-y-2.5">
          {[5, 4, 3, 2, 1].map((starNum) => {
            const count = breakdown?.[`star_${starNum}`] || 0;
            const pct = getPercentage(count);
            const isSelected = filterRating === String(starNum);

            return (
              <button
                key={starNum}
                type="button"
                onClick={() =>
                  setFilterRating((prev) => (prev === String(starNum) ? "all" : String(starNum)))
                }
                className={`w-full flex items-center gap-3 text-xs group cursor-pointer p-1 rounded-lg transition ${
                  isSelected ? "bg-amber-50/80 font-bold" : "hover:bg-stone-50"
                }`}
                title={`Filter by ${starNum} Stars`}
              >
                <div className="flex items-center gap-1 w-14 shrink-0 font-semibold text-stone-700">
                  <span>{starNum}</span>
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                </div>

                {/* Progress Bar Container */}
                <div className="flex-1 h-3 bg-stone-100 rounded-full overflow-hidden border border-[#E5E1D8] relative">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className="w-12 text-right font-mono text-[11px] text-stone-500 shrink-0">
                  {pct}% ({count})
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Customer Reviews Feed */}
      <div className="space-y-4 min-w-0">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-[#2C2A29] flex items-center gap-2">
            <span>Customer Feedback</span>
            {filterRating !== "all" && (
              <span className="text-xs font-semibold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full">
                Filtered: {filterRating} Stars
              </span>
            )}
          </h3>

          {filterRating !== "all" && (
            <button
              type="button"
              onClick={() => setFilterRating("all")}
              className="text-xs font-semibold text-[#1E3A5F] hover:underline cursor-pointer"
            >
              Clear Filter (Show All)
            </button>
          )}
        </div>

        {filteredReviews.length === 0 ? (
          <div className="text-center py-12 bg-[#FFFFFF] border border-[#D8D4CE] rounded-3xl p-6 space-y-2">
            <AlertCircle className="w-8 h-8 text-stone-400 mx-auto mb-1" />
            <p className="text-sm font-semibold text-[#2C2A29]">
              {filterRating === "all"
                ? "No reviews for this product yet."
                : `No reviews found with ${filterRating} stars.`}
            </p>
            <p className="text-xs text-stone-500 max-w-md mx-auto">
              Customers who have purchased this product will share their ratings and reviews here once their order is delivered.
            </p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {filteredReviews.map((review) => {
              const reviewerName = review.user
                ? `${review.user.first_name} ${review.user.last_name || ""}`.trim()
                : "Verified Customer";
              const isCurrentUserReview = user?.id && review.user_id === user.id;
              const isExpanded = Boolean(expandedReviewIds[review.id]);
              const isLongComment = (review.comment || "").length > 220;

              return (
                <div
                  key={review.id}
                  className="bg-[#FFFFFF] border border-[#D8D4CE] rounded-2xl p-5 shadow-xs space-y-3 transition hover:border-[#1E3A5F]/40 min-w-0"
                >
                  {/* Review Item Header */}
                  <div className="flex items-start justify-between gap-3 min-w-0">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-[#1E3A5F] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                        {reviewerName[0]?.toUpperCase() || "U"}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs sm:text-sm font-bold text-[#2C2A29] truncate">
                            {reviewerName}
                          </span>
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            Verified Purchase
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-stone-400 font-mono">
                          <span>
                            {new Date(review.created_at).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Star Rating & Action Icons (Edit / Delete) */}
                    <div className="flex items-center gap-2 shrink-0">
                      <StarRating rating={review.rating} readOnly size="w-3.5 h-3.5" />

                      <div className="flex items-center gap-1.5 ml-1">
                        {/* Edit Icon for Owner */}
                        {isCurrentUserReview && (
                          <button
                            type="button"
                            onClick={() => setReviewToEdit(review)}
                            className="inline-flex items-center justify-center p-1.5 rounded-lg text-[#1E3A5F] bg-[#ECE8DF] hover:bg-[#1E3A5F] hover:text-white border border-[#D8D4CE] transition shadow-xs cursor-pointer"
                            title="Edit Your Review"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Delete Icon for Owner / Admin */}
                        {(user?.role === "ADMIN" || isCurrentUserReview) && (
                          <button
                            type="button"
                            onClick={() => setReviewToDelete(review.id)}
                            className="inline-flex items-center justify-center p-1.5 rounded-lg text-red-600 bg-red-50 hover:bg-red-600 hover:text-white border border-red-200 transition shadow-xs cursor-pointer"
                            title="Delete Review"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Review Comment with Length Protection (Collapsible) */}
                  {review.comment && (
                    <div className="pt-1 min-w-0">
                      <div className="relative">
                        <p
                          className={`text-xs text-stone-700 leading-relaxed whitespace-pre-line break-words [overflow-wrap:anywhere] min-w-0 transition-all duration-200 ${
                            !isExpanded && isLongComment
                              ? "line-clamp-3 max-h-20 overflow-hidden"
                              : ""
                          }`}
                        >
                          {review.comment}
                        </p>

                        {!isExpanded && isLongComment && (
                          <div
                            aria-hidden="true"
                            className="absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none"
                          />
                        )}
                      </div>

                      {isLongComment && (
                        <div className="mt-1.5">
                          <button
                            type="button"
                            onClick={() => toggleExpand(review.id)}
                            className="text-[11px] font-semibold text-[#1E3A5F] hover:text-[#152843] flex items-center gap-1 transition cursor-pointer"
                          >
                            <span>{isExpanded ? "Show Less" : "Read More"}</span>
                            {isExpanded ? (
                              <ChevronUp className="w-3 h-3" />
                            ) : (
                              <ChevronDown className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Review Modal */}
      <RateOrderProductModal
        isOpen={Boolean(reviewToEdit)}
        onClose={() => setReviewToEdit(null)}
        product={{ id: productId, name: productName }}
        existingReview={reviewToEdit}
        onReviewSubmitted={loadReviews}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        open={Boolean(reviewToDelete)}
        onOpenChange={(open) => !open && setReviewToDelete(null)}
        title="Delete Review"
        message="Are you sure you want to permanently delete this review? This action cannot be undone."
        actionType="delete"
        submitting={deleting}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
