from typing import Optional, List, Any, cast
from fastapi import APIRouter, Depends, HTTPException, status
from app.database import db
from app.dependencies.auth import get_current_user, get_optional_user, require_admin
from app.schemas.review import (
    ReviewCreate,
    ReviewUpdate,
    ReviewOut,
    ProductReviewResponse,
    StarBreakdown,
)

router = APIRouter(prefix="/api/reviews", tags=["Reviews"])


@router.get("/product/{product_id}", response_model=ProductReviewResponse)
async def get_product_reviews(
    product_id: int,
    current_user=Depends(get_optional_user)
):
    """
    Fetch comprehensive review statistics, star rating breakdown,
    and all user reviews for a specific product.
    """
    # 1. Verify product exists
    product = await db.product.find_unique(where={"id": product_id})
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

    # 2. Fetch all reviews for this product with user details
    reviews = await db.review.find_many(
        where=cast(Any, {"product_id": product_id}),
        include=cast(Any, {"user": True}),
        order=cast(Any, {"created_at": "desc"})
    )

    total_reviews = len(reviews)
    breakdown = StarBreakdown()
    total_rating_sum = 0

    user_review = None

    for rev in reviews:
        total_rating_sum += rev.rating
        if rev.rating == 5:
            breakdown.star_5 += 1
        elif rev.rating == 4:
            breakdown.star_4 += 1
        elif rev.rating == 3:
            breakdown.star_3 += 1
        elif rev.rating == 2:
            breakdown.star_2 += 1
        elif rev.rating == 1:
            breakdown.star_1 += 1

        if current_user and rev.user_id == current_user.id:
            user_review = rev

    average_rating = round(total_rating_sum / total_reviews, 1) if total_reviews > 0 else 0.0

    # 3. Check purchase history & review eligibility if user is logged in
    has_purchased = False
    can_review = False

    if current_user:
        # Check if user has a DELIVERED order containing this product
        purchased_item = await db.orderitem.find_first(
            where=cast(Any, {
                "product_id": product_id,
                "order": {
                    "user_id": current_user.id,
                    "status": "DELIVERED"
                }
            })
        )
        if purchased_item:
            has_purchased = True

        # User can review ONLY IF they have purchased & received delivery, and have not yet reviewed
        user_role = str(getattr(current_user.role, "value", current_user.role))
        is_admin = user_role == "ADMIN"
        if (has_purchased or is_admin) and user_review is None:
            can_review = True

    return {
        "average_rating": average_rating,
        "total_reviews": total_reviews,
        "breakdown": breakdown,
        "can_review": can_review,
        "has_purchased": has_purchased,
        "user_review": user_review,
        "reviews": reviews
    }


@router.post("/product/{product_id}", response_model=ReviewOut, status_code=status.HTTP_201_CREATED)
async def create_product_review(
    product_id: int,
    payload: ReviewCreate,
    current_user=Depends(get_current_user)
):
    """Create a new product review for the authenticated customer (Delivered orders only)."""
    product = await db.product.find_unique(where={"id": product_id})
    if not product or not product.is_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found or unavailable"
        )

    user_role = str(getattr(current_user.role, "value", current_user.role))
    is_admin = user_role == "ADMIN"

    # Strictly verify purchase and delivery for customers
    if not is_admin:
        purchased_item = await db.orderitem.find_first(
            where=cast(Any, {
                "product_id": product_id,
                "order": {
                    "user_id": current_user.id,
                    "status": "DELIVERED"
                }
            })
        )
        if not purchased_item:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only rate and review products that have been purchased and delivered to your address."
            )

    # Check if review already exists from this user
    existing_review = await db.review.find_unique(
        where={
            "user_id_product_id": {
                "user_id": current_user.id,
                "product_id": product_id
            }
        }
    )
    if existing_review:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already reviewed this product. You can update your existing review."
        )

    comment_text = payload.comment.strip() if payload.comment and payload.comment.strip() else None

    new_review = await db.review.create(
        data=cast(Any, {
            "user_id": current_user.id,
            "product_id": product_id,
            "rating": payload.rating,
            "comment": comment_text
        }),
        include=cast(Any, {"user": True})
    )

    return new_review


@router.put("/{review_id}", response_model=ReviewOut)
async def update_review(
    review_id: int,
    payload: ReviewUpdate,
    current_user=Depends(get_current_user)
):
    """Update an existing review (by reviewer or admin)."""
    review = await db.review.find_unique(where={"id": review_id})
    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found"
        )

    user_role = str(getattr(current_user.role, "value", current_user.role))
    if user_role != "ADMIN" and review.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to edit this review"
        )

    update_data: dict[str, Any] = {}
    if payload.rating is not None:
        update_data["rating"] = payload.rating
    if payload.comment is not None:
        update_data["comment"] = payload.comment.strip() if payload.comment.strip() else None

    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields provided to update"
        )

    updated_review = await db.review.update(
        where={"id": review_id},
        data=cast(Any, update_data),
        include=cast(Any, {"user": True})
    )

    return updated_review


@router.delete("/{review_id}")
async def delete_review(
    review_id: int,
    current_user=Depends(get_current_user)
):
    """Delete a review (by reviewer or admin)."""
    review = await db.review.find_unique(where={"id": review_id})
    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found"
        )

    user_role = str(getattr(current_user.role, "value", current_user.role))
    if user_role != "ADMIN" and review.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to delete this review"
        )

    await db.review.delete(where={"id": review_id})

    return {"message": "Review deleted successfully", "id": review_id}


@router.get("/my", response_model=List[ReviewOut])
async def get_my_reviews(current_user=Depends(get_current_user)):
    """Fetch all reviews submitted by the authenticated customer."""
    reviews = await db.review.find_many(
        where=cast(Any, {"user_id": current_user.id}),
        include=cast(Any, {"user": True}),
        order=cast(Any, {"created_at": "desc"})
    )
    return reviews


@router.get("/admin/all", response_model=List[ReviewOut])
async def get_all_reviews_admin(current_admin=Depends(require_admin)):
    """Fetch all reviews for administration management."""
    reviews = await db.review.find_many(
        include=cast(Any, {"user": True}),
        order=cast(Any, {"created_at": "desc"})
    )
    return reviews
