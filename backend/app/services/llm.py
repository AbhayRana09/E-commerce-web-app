import json
from typing import List, Dict, Any, Optional
from google import genai
from google.genai import types

from app.core.config import settings
from app.schemas.chat import ChatMessage, ChatResponse, ProductRecommendationOut, OrderSummaryOut
from app.services.chat_tools import (
    get_store_catalog_summary,
    search_catalog_products,
    get_product_details_by_id,
    get_user_recent_orders,
    get_order_tracking_details,
)

def get_gemini_client() -> Optional[genai.Client]:
    """Instantiates the official Google GenAI client if API key is configured."""
    if not settings.GEMINI_API_KEY:
        return None
    return genai.Client(api_key=settings.GEMINI_API_KEY)


async def process_chat_message(
    messages: List[ChatMessage],
    scope: str,
    user_id: int,
    user_name: str,
    context_id: Optional[int] = None
) -> ChatResponse:
    """Processes customer query with domain-specific grounding (Catalog or Orders)."""
    client = get_gemini_client()
    latest_user_message = messages[-1].content if messages else ""

    # ====================================================
    # 1. CATALOG / SHOPPING ASSISTANT SCOPE
    # ====================================================
    if scope == "catalog":
        catalog_summary = await get_store_catalog_summary()
        
        # Search relevant products matching the query
        db_matched_products = await search_catalog_products(
            query=latest_user_message,
            limit=5
        )
        
        # If focusing on a specific product detail
        focused_product = None
        if context_id:
            focused_product = await get_product_details_by_id(context_id)

        system_instruction = f"""
You are the AI Shopping & Product Recommendation Assistant for our E-Commerce Store.
Customer Name: {user_name}

CATALOG INVENTORY CONTEXT:
{catalog_summary}

RELEVANT MATCHING PRODUCTS IN STORE DATABASE:
{json.dumps(db_matched_products, indent=2)}

FOCUSED PRODUCT (IF APPLICABLE):
{json.dumps(focused_product, indent=2) if focused_product else "None"}

STRICT GUIDELINES:
1. ONLY recommend products that exist in our database. NEVER invent or hallucinate items, prices, or brands not in our inventory.
2. If the user asks about product recommendations, highlight 1-3 matching products from the list above with their exact name, price, rating, and in-stock status.
3. If no matching product is found, politely explain what categories and items we currently offer.
4. Keep answers friendly, concise, and helpful.
"""

        # Format prompt history for Gemini
        conversation_prompt = "\n".join([f"{m.role.upper()}: {m.content}" for m in messages])

        if client:
            try:
                response = client.models.generate_content(
                    model=settings.GEMINI_MODEL,
                    contents=conversation_prompt,
                    config=types.GenerateContentConfig(
                        system_instruction=system_instruction,
                        temperature=settings.GEMINI_TEMPERATURE,
                        max_output_tokens=settings.GEMINI_MAX_OUTPUT_TOKENS
                    )
                )
                ai_reply = response.text or "I found these recommendations for you from our store."
            except Exception as e:
                ai_reply = f"Here are the top matching products from our store for your search: '{latest_user_message}'"
        else:
            ai_reply = "AI Assistant (Demo Mode): Here are matching items from our store catalog:"

        # Convert matched DB products to structured output for UI preview cards
        recommendations = [
            ProductRecommendationOut(
                id=p["id"],
                name=p["name"],
                slug=p["slug"],
                price=p["price"],
                image_url=p.get("image_url"),
                category_name=p.get("category_name"),
                average_rating=p.get("average_rating", 0.0),
                in_stock=p.get("in_stock", True)
            )
            for p in db_matched_products
        ] if db_matched_products else None

        return ChatResponse(
            reply=ai_reply,
            scope="catalog",
            recommended_products=recommendations
        )

    # ====================================================
    # 2. MY ORDERS ASSISTANT SCOPE
    # ====================================================
    else:
        user_orders = await get_user_recent_orders(user_id=user_id, limit=5)
        
        focused_tracking = None
        if context_id:
            focused_tracking = await get_order_tracking_details(order_id=context_id, user_id=user_id)

        system_instruction = f"""
You are the AI Order & Tracking Assistant for our E-Commerce Store.
Customer Name: {user_name} (User ID: {user_id})

CUSTOMER'S ACTUAL RECENT ORDERS:
{json.dumps(user_orders, indent=2)}

SPECIFIC ORDER TRACKING DETAILS:
{json.dumps(focused_tracking, indent=2) if focused_tracking else "None"}

LIFECYCLE STATUSES EXPLANATION:
- CONFIRMED: Payment received, order placed.
- PROCESSING: Order being packed at warehouse (takes 1-2 days).
- SHIPPED: Order in transit with delivery carrier (takes 2-4 days).
- DELIVERED: Package arrived at customer address.
- CANCELLED: Order was cancelled.

STRICT GUIDELINES:
1. ONLY provide information regarding the customer's actual orders listed above.
2. Answer status, delivery estimates, items ordered, and total spending accurately based on real data.
3. If the user has 0 orders, inform them politely and encourage them to explore our catalog.
4. Keep responses supportive, reassuring, and concise.
"""

        conversation_prompt = "\n".join([f"{m.role.upper()}: {m.content}" for m in messages])

        if client:
            try:
                response = client.models.generate_content(
                    model=settings.GEMINI_MODEL,
                    contents=conversation_prompt,
                    config=types.GenerateContentConfig(
                        system_instruction=system_instruction,
                        temperature=settings.GEMINI_TEMPERATURE,
                        max_output_tokens=settings.GEMINI_MAX_OUTPUT_TOKENS
                    )
                )
                ai_reply = response.text or "Here is the summary of your orders."
            except Exception as e:
                ai_reply = f"Here is the status of your recent orders:"
        else:
            ai_reply = "AI Assistant (Demo Mode): Here are your recent order details:"

        # Convert user orders to structured badges for UI
        order_summaries = [
            OrderSummaryOut(
                id=o["id"],
                status=o["status"],
                total_amount=o["total_amount"],
                created_at=o["created_at"],
                items_count=o["items_count"],
                items_summary=o["items_summary"]
            )
            for o in user_orders
        ] if user_orders else None

        return ChatResponse(
            reply=ai_reply,
            scope="orders",
            order_summaries=order_summaries
        )
