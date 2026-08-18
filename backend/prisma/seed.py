import asyncio
import re
from prisma import Prisma

def generate_slug(text: str) -> str:
    slug = text.lower().strip()
    slug = re.sub(r'[^\w\s-]', '', slug)
    slug = re.sub(r'[\s_-]+', '-', slug)
    return slug

SAMPLE_CATEGORIES = [
    {
        "name": "Electronics",
        "description": "Latest gadgets, smartphones, laptops, and smart home devices."
    },
    {
        "name": "Fashion & Apparel",
        "description": "Trendy clothing, footwear, and stylish accessories."
    },
    {
        "name": "Home & Kitchen",
        "description": "Modern furniture, decor, cookware, and essential appliances."
    },
    {
        "name": "Fitness & Outdoor",
        "description": "Gear, activewear, and equipment for health and adventure."
    }
]

SAMPLE_PRODUCTS = [
    # Electronics
    {
        "category_name": "Electronics",
        "name": "Wireless Noise-Canceling Headphones",
        "description": "Premium over-ear headphones with active noise cancellation, 30-hour battery life, and crystal-clear acoustic precision.",
        "price": 299.99,
        "stock_quantity": 45,
        "image_url": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80"
    },
    {
        "category_name": "Electronics",
        "name": "Ultra-Slim Smart Watch Series 7",
        "description": "Track your fitness, heart rate, and notifications with a vibrant OLED touchscreen and 50m water resistance.",
        "price": 199.50,
        "stock_quantity": 30,
        "image_url": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80"
    },
    {
        "category_name": "Electronics",
        "name": "Ergonomic Mechanical Keyboard",
        "description": "Tactile RGB mechanical keyboard with custom hot-swappable switches and durable PBT keycaps.",
        "price": 129.00,
        "stock_quantity": 25,
        "image_url": "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80"
    },
    {
        "category_name": "Electronics",
        "name": "Portable Bluetooth Speaker",
        "description": "Waterproof 360-degree sound speaker featuring deep bass performance and a 12-hour continuous playback battery.",
        "price": 79.99,
        "stock_quantity": 60,
        "image_url": "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&q=80"
    },

    # Fashion
    {
        "category_name": "Fashion & Apparel",
        "name": "Classic Leather Denim Jacket",
        "description": "Timeless unisex jacket crafted from premium organic cotton denim with subtle vintage finishing.",
        "price": 89.95,
        "stock_quantity": 50,
        "image_url": "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80"
    },
    {
        "category_name": "Fashion & Apparel",
        "name": "Minimalist Urban Sneakers",
        "description": "Lightweight breathable sneakers designed for all-day comfort, featuring cushioned memory foam insoles.",
        "price": 119.00,
        "stock_quantity": 40,
        "image_url": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80"
    },
    {
        "category_name": "Fashion & Apparel",
        "name": "Polarized UV Sunglasses",
        "description": "Sleek frame sunglasses with anti-glare polarized lenses offering 100% UV400 protection.",
        "price": 49.99,
        "stock_quantity": 75,
        "image_url": "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80"
    },

    # Home & Kitchen
    {
        "category_name": "Home & Kitchen",
        "name": "Smart Espresso & Coffee Maker",
        "description": "15-bar Italian pump espresso machine with integrated milk frother and programmable temperature controls.",
        "price": 249.99,
        "stock_quantity": 20,
        "image_url": "https://images.unsplash.com/photo-1517668808822-9ebe02f2a678?w=800&q=80"
    },
    {
        "category_name": "Home & Kitchen",
        "name": "Ceramic Essential Oil Diffuser",
        "description": "Aesthetic ultrasonic aroma diffuser with ambient LED lighting and quiet mist dispersion.",
        "price": 34.99,
        "stock_quantity": 100,
        "image_url": "https://images.unsplash.com/photo-1602928321679-560bb453f190?w=800&q=80"
    },

    # Fitness & Outdoor
    {
        "category_name": "Fitness & Outdoor",
        "name": "Non-Slip Eco Yoga Mat",
        "description": "High-density TPE yoga mat with alignment grid lines, extra cushioning, and carrying strap included.",
        "price": 42.50,
        "stock_quantity": 65,
        "image_url": "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80"
    },
    {
        "category_name": "Fitness & Outdoor",
        "name": "Insulated Stainless Steel Bottle",
        "description": "Double-wall vacuum insulated water bottle keeping beverages cold for 24 hours or hot for 12 hours.",
        "price": 27.99,
        "stock_quantity": 120,
        "image_url": "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&q=80"
    }
]

async def main():
    db = Prisma()
    await db.connect()
    print("[SEED] Connected to database.")

    category_map = {}

    for cat_data in SAMPLE_CATEGORIES:
        slug = generate_slug(cat_data["name"])
        existing = await db.category.find_unique(where={"slug": slug})
        if not existing:
            cat = await db.category.create(
                data={
                    "name": cat_data["name"],
                    "slug": slug,
                    "description": cat_data["description"]
                }
            )
            print(f"[SEED] Created category: {cat.name}")
            category_map[cat.name] = cat.id
        else:
            print(f"[SEED] Category exists: {existing.name}")
            category_map[existing.name] = existing.id

    for prod_data in SAMPLE_PRODUCTS:
        cat_id = category_map.get(prod_data["category_name"])
        if not cat_id:
            continue

        slug = generate_slug(prod_data["name"])
        existing = await db.product.find_unique(where={"slug": slug})
        if not existing:
            prod = await db.product.create(
                data={
                    "category_id": cat_id,
                    "name": prod_data["name"],
                    "slug": slug,
                    "description": prod_data["description"],
                    "price": prod_data["price"],
                    "stock_quantity": prod_data["stock_quantity"],
                    "image_url": prod_data["image_url"],
                    "is_active": True
                }
            )
            print(f"[SEED] Created product: {prod.name}")
        else:
            print(f"[SEED] Product exists: {existing.name}")

    await db.disconnect()
    print("[SEED] Seeding completed successfully!")

if __name__ == "__main__":
    asyncio.run(main())
