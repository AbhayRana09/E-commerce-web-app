from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import connect_db, disconnect_db
from app.routers.auth import router as auth_router
from app.routers.address import router as address_router
from app.routers.category import router as category_router
from app.routers.product import router as product_router
from app.routers.order import router as order_router
from app.routers.cart import router as cart_router
from app.routers.coupon import router as coupon_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manages app startup and shutdown events cleanly."""
    # Startup: Connect to PostgreSQL database
    await connect_db()
    print("[POSTGRES] Database connected via Prisma!")
    yield
    # Shutdown: Disconnect cleanly from PostgreSQL
    await disconnect_db()
    print("[POSTGRES] Database disconnected.")

app = FastAPI(
    title="E-Commerce REST API",
    description="E-Commerce Platform",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware (Allows Next.js frontend to talk to FastAPI backend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth_router)
app.include_router(address_router)
app.include_router(category_router)
app.include_router(product_router)
app.include_router(order_router)
app.include_router(cart_router)
app.include_router(coupon_router)

@app.get("/")
async def root():
    """Health check root endpoint."""
    return {"message": "Welcome to E-Commerce API", "status": "active"}
