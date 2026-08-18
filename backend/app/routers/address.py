from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.database import db
from app.schemas.address import AddressCreate, AddressUpdate, AddressOut
from app.dependencies.auth import get_current_user
from prisma.models import User

router = APIRouter(prefix="/api/addresses", tags=["Addresses"])

@router.get("", response_model=List[AddressOut])
async def get_user_addresses(current_user: User = Depends(get_current_user)):
    """Fetch all saved addresses for the logged-in user."""
    addresses = await db.address.find_many(
        where={"user_id": current_user.id},
        order={"is_default": "desc"}
    )
    return addresses

@router.post("", response_model=AddressOut, status_code=status.HTTP_201_CREATED)
async def create_address(
    address_in: AddressCreate,
    current_user: User = Depends(get_current_user)
):
    """Add a new address for the logged-in user."""
    if address_in.is_default:
        await db.address.update_many(
            where={"user_id": current_user.id, "is_default": True},
            data={"is_default": False}
        )

    new_address = await db.address.create(
        data={
            "user_id": current_user.id,
            "street": address_in.street,
            "city": address_in.city,
            "state": address_in.state,
            "postal_code": address_in.postal_code,
            "country": address_in.country,
            "is_default": address_in.is_default or False
        }
    )
    return new_address

@router.put("/{address_id}", response_model=AddressOut)
async def update_address(
    address_id: int,
    address_in: AddressUpdate,
    current_user: User = Depends(get_current_user)
):
    """Update an existing address owned by the logged-in user."""
    address = await db.address.find_first(
        where={"id": address_id, "user_id": current_user.id}
    )
    if not address:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Address not found"
        )

    if address_in.is_default is True:
        await db.address.update_many(
            where={"user_id": current_user.id, "is_default": True},
            data={"is_default": False}
        )

    update_data = {k: v for k, v in address_in.model_dump(exclude_unset=True).items() if v is not None}

    updated_address = await db.address.update(
        where={"id": address_id},
        data=update_data
    )
    return updated_address

@router.delete("/{address_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_address(
    address_id: int,
    current_user: User = Depends(get_current_user)
):
    """Delete an address owned by the logged-in user."""
    address = await db.address.find_first(
        where={"id": address_id, "user_id": current_user.id}
    )
    if not address:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Address not found"
        )

    await db.address.delete(where={"id": address_id})
    return None

@router.patch("/{address_id}/default", response_model=AddressOut)
async def set_default_address(
    address_id: int,
    current_user: User = Depends(get_current_user)
):
    """Set a specific address as the user's default shipping address."""
    address = await db.address.find_first(
        where={"id": address_id, "user_id": current_user.id}
    )
    if not address:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Address not found"
        )

    await db.address.update_many(
        where={"user_id": current_user.id, "is_default": True},
        data={"is_default": False}
    )

    updated_address = await db.address.update(
        where={"id": address_id},
        data={"is_default": True}
    )
    return updated_address
