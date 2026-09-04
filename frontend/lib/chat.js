import api from "./api";

/**
 * Sends conversation messages to the AI Chatbot endpoint
 * @param {Array<{role: 'user' | 'assistant' | 'system', content: string}>} messages - Chat history
 * @param {'catalog' | 'orders'} scope - 'catalog' for product assistant or 'orders' for order tracking
 * @param {number|null} contextId - Optional product_id or order_id
 * @returns {Promise<{reply: string, scope: string, recommended_products?: Array, order_summaries?: Array}>}
 */
export async function sendChatMessage(messages, scope = "catalog", contextId = null) {
    return await api.post("/api/chat", {
        messages,
        scope,
        context_id: contextId,
    });
}
