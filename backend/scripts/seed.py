from typing import Any, cast
import asyncio
import sys
import os
import re

# Add parent directory to path so app modules can be imported
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import db

def generate_slug(text: str) -> str:
    slug = text.lower().strip()
    slug = re.sub(r'[^\w\s-]', '', slug)
    slug = re.sub(r'[\s_-]+', '-', slug)
    return slug

async def seed_database():
    print("[INFO] Connecting to PostgreSQL database...")
    await db.connect()

    print("[CLEAN] Cleaning existing catalog data...")
    # Delete dependent catalog and cart/order item data without removing users or addresses
    await db.review.delete_many()
    await db.wishlist.delete_many()
    await db.orderitem.delete_many()
    await db.order.delete_many()
    await db.cartitem.delete_many()
    await db.product.delete_many()
    await db.category.delete_many()

    print("[CATEGORIES] Seeding Categories...")
    cat_electronics = await db.category.create(
        data=cast(Any, {
            "name": "Electronics",
            "slug": "electronics",
            "description": "High-tech audio, screens, and personal computing gear.",
        })
    )

    cat_apparel = await db.category.create(
        data=cast(Any, {
            "name": "Apparel & Clothing",
            "slug": "apparel-clothing",
            "description": "Comfortable, premium daily wear and outerwear.",
        })
    )

    cat_footwear = await db.category.create(
        data=cast(Any, {
            "name": "Footwear",
            "slug": "footwear",
            "description": "Everyday sneakers, athletic runners, and leather boots.",
        })
    )

    cat_home = await db.category.create(
        data=cast(Any, {
            "name": "Home & Living",
            "slug": "home-living",
            "description": "Curated lifestyle accents, kitchenware, and room essentials.",
        })
    )

    cat_accessories = await db.category.create(
        data=cast(Any, {
            "name": "Accessories & Bags",
            "slug": "accessories-bags",
            "description": "Everyday carry wallets, insulated bottles, and travel packs.",
        })
    )

    print("[PRODUCTS] Seeding Products...")
    products_data: list[dict[str, Any]] = [
        # Electronics
        {
            "category_id": cat_electronics.id,
            "name": "Wireless Noise-Cancelling Headphones",
            "price": 199.99,
            "stock_quantity": 30,
            "image_url": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
            "description": "Over-ear wireless headphones with active noise cancellation, 35-hour battery life, and crystal-clear audio drivers.",
        },
        {
            "category_id": cat_electronics.id,
            "name": "RGB Mechanical Gaming Keyboard",
            "price": 89.99,
            "stock_quantity": 45,
            "image_url": "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80",
            "description": "Tactile mechanical switches with customizable per-key RGB backlighting and durable aircraft-grade aluminum frame.",
        },
        {
            "category_id": cat_electronics.id,
            "name": "Portable Waterproof Bluetooth Speaker",
            "price": 59.99,
            "stock_quantity": 60,
            "image_url": "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&q=80",
            "description": "360-degree immersive sound, IPX7 waterproof rating, and 12-hour continuous playtime for indoor and outdoor adventures.",
        },
        {
            "category_id": cat_electronics.id,
            "name": "Ultra-Slim 4K UHD Smart Monitor",
            "price": 349.99,
            "stock_quantity": 0,  # Demonstrating out of stock
            "image_url": "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80",
            "description": "27-inch 4K IPS display with HDR10 support, ultra-thin bezels, and USB-C connectivity with 65W power delivery.",
        },

        # Apparel
        {
            "category_id": cat_apparel.id,
            "name": "Classic Washed Denim Jacket",
            "price": 79.50,
            "stock_quantity": 25,
            "image_url": "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&q=80",
            "description": "Timeless vintage wash denim jacket made from 100% durable cotton with dual chest pockets and relaxed comfort fit.",
        },
        {
            "category_id": cat_apparel.id,
            "name": "Organic Heavyweight Cotton Hoodie",
            "price": 64.00,
            "stock_quantity": 40,
            "image_url": "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&q=80",
            "description": "Ultra-soft brushed fleece interior with double-lined hood and sturdy kangaroo pouch pocket.",
        },
        {
            "category_id": cat_apparel.id,
            "name": "Breathable Crewneck T-Shirt 3-Pack",
            "price": 38.00,
            "stock_quantity": 80,
            "image_url": "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&q=80",
            "description": "Everyday premium combed cotton crewneck t-shirts in classic neutral tones.",
        },

        # Footwear
        {
            "category_id": cat_footwear.id,
            "name": "Lightweight Cloud-Cushion Running Shoes",
            "price": 119.00,
            "stock_quantity": 35,
            "image_url": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
            "description": "Engineered mesh upper with responsive foam midsole for superior energy return on road runs and gym workouts.",
        },
        {
            "category_id": cat_footwear.id,
            "name": "Full-Grain Leather Chelsea Boots",
            "price": 149.00,
            "stock_quantity": 20,
            "image_url": "https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=800&q=80",
            "description": "Handcrafted full-grain leather boots with elastic side gussets and weather-resistant rubber lug soles.",
        },
        {
            "category_id": cat_footwear.id,
            "name": "Minimalist Canvas Low-Top Sneakers",
            "price": 49.99,
            "stock_quantity": 50,
            "image_url": "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800&q=80",
            "description": "Casual low-profile skate-inspired sneakers with vulcanized rubber sole and breathable canvas upper.",
        },

        # Home & Living
        {
            "category_id": cat_home.id,
            "name": "Handmade Ceramic Pour-Over Coffee Set",
            "price": 42.00,
            "stock_quantity": 28,
            "image_url": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&q=80",
            "description": "Artisanal stoneware dripper and serving carafe for barista-quality slow-brewed morning coffee.",
        },
        {
            "category_id": cat_home.id,
            "name": "Ultrasonic Aroma Essential Oil Diffuser",
            "price": 32.50,
            "stock_quantity": 55,
            "image_url": "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&q=80",
            "description": "Whisper-quiet cool mist humidifier with natural wood grain finish and ambient soft LED lighting.",
        },

        # Accessories
        {
            "category_id": cat_accessories.id,
            "name": "Water-Resistant Commuter Backpack 20L",
            "price": 75.00,
            "stock_quantity": 40,
            "image_url": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80",
            "description": "Weatherproof matte ballistic nylon backpack with padded 16-inch laptop compartment and hidden passport pocket.",
        },
        {
            "category_id": cat_accessories.id,
            "name": "RFID-Blocking Slim Leather Cardholder",
            "price": 24.99,
            "stock_quantity": 70,
            "image_url": "https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&q=80",
            "description": "Ultra-thin genuine cowhide wallet with 6 card slots, center cash pocket, and RFID scanning protection.",
        },
        {
            "category_id": cat_accessories.id,
            "name": "Vacuum Insulated Stainless Steel Flask (32oz)",
            "price": 28.00,
            "stock_quantity": 65,
            "image_url": "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&q=80",
            "description": "Double-wall vacuum insulation keeps liquids ice-cold for 24 hours or piping hot for 12 hours. BPA-free lid.",
        },
    ]

    created_products = []
    for item in products_data:
        slug = generate_slug(str(item["name"]))
        prod = await db.product.create(
            data=cast(Any, {
                "category_id": item["category_id"],
                "name": item["name"],
                "slug": slug,
                "description": item["description"],
                "price": item["price"],
                "stock_quantity": item["stock_quantity"],
                "is_active": True,
                "image_url": item["image_url"],
            })
        )
        created_products.append(prod)

    print("\n[SUCCESS] Database Seeding Completed Successfully!")
    print("--------------------------------------------------")
    print(f"[*] Categories Seeded: 5 categories")
    print(f"[*] Products Seeded: {len(created_products)} items across 5 categories")
    print("--------------------------------------------------")

    await db.disconnect()

if __name__ == "__main__":
    asyncio.run(seed_database())
