import asyncio
import sys
import os

# Add parent directory to path so we can import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from typing import Any, cast
from prisma import Prisma
from app.core.security import hash_password

async def main():
    print("=" * 50)
    print("  E-Commerce Platform - Admin Account Setup")
    print("=" * 50)

    db = Prisma()
    await db.connect()

    try:
        email = input("Enter Admin Email (e.g. admin@example.com): ").strip().lower()
        if not email or "@" not in email:
            print("[ERROR] Invalid email format.")
            return

        existing_user = await db.user.find_unique(where={"email": email})

        if existing_user:
            print(f"\nUser '{email}' found in database (Current Role: {existing_user.role}).")
            confirm = input("Do you want to promote this user to ADMIN? (y/n): ").strip().lower()
            if confirm == "y":
                updated = await db.user.update(
                    where={"email": email},
                    data=cast(Any, {"role": "ADMIN", "is_verified": True})
                )
                print(f"[SUCCESS] User '{email}' has been successfully promoted to ADMIN!")
            else:
                print("Operation cancelled.")
        else:
            first_name = input("Enter First Name: ").strip() or "Admin"
            last_name = input("Enter Last Name: ").strip() or "User"
            password = input("Enter Password (min 8 chars): ").strip()

            if len(password) < 8:
                print("[ERROR] Password must be at least 8 characters.")
                return

            hashed = hash_password(password)

            new_admin = await db.user.create(
                data=cast(Any, {
                    "email": email,
                    "password_hash": hashed,
                    "first_name": first_name,
                    "last_name": last_name,
                    "role": "ADMIN",
                    "is_verified": True,
                })
            )

            # Ensure cart exists
            await db.cart.create(data={"user_id": new_admin.id})

            print(f"\n[SUCCESS] Admin user '{email}' created successfully with ADMIN privileges!")

    except Exception as e:
        print(f"[ERROR] Error setting up admin: {e}")
    finally:
        await db.disconnect()

if __name__ == "__main__":
    asyncio.run(main())
