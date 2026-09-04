from fastapi import APIRouter, Depends, HTTPException, status
from app.dependencies.auth import get_current_user
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.llm import process_chat_message

router = APIRouter(prefix="/api/chat", tags=["AI Chatbot"])

@router.post("", response_model=ChatResponse)
async def chat_endpoint(
    payload: ChatRequest,
    current_user=Depends(get_current_user)
):
    """
    AI Chatbot endpoint:
    - Restricted strictly to registered/logged-in users.
    - Handles 'catalog' scope (product recommendations) and 'orders' scope (order tracking).
    """
    try:
        user_full_name = f"{current_user.first_name} {current_user.last_name}".strip() or "Valued Customer"
        
        response = await process_chat_message(
            messages=payload.messages,
            scope=payload.scope,
            user_id=current_user.id,
            user_name=user_full_name,
            context_id=payload.context_id
        )
        return response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Chat processing failed: {str(e)}"
        )
