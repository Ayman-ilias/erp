from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


# Order Create Schema
class OrderCreate(BaseModel):
    # Required Basic Information
    order_no: str = Field(..., description="Unique order number")
    style_name: str = Field(..., description="Style name")
    buyer_id: int = Field(..., description="Buyer ID reference")
    style_id: int = Field(..., description="Style ID reference")
    
    # Optional Basic Information
    season: Optional[str] = Field(None, description="Season (e.g., Spring/Summer 2025)")
    order_category: Optional[str] = Field(None, description="Order category")
    sales_contract: Optional[str] = Field(None, description="Sales contract number")
    scl_po: Optional[str] = Field(None, description="SCL PO number")
    fob: Optional[float] = Field(None, description="FOB price")
    note: Optional[str] = Field(None, description="Additional notes")
    
    # Additional fields
    product_category: Optional[str] = None
    style_description: Optional[str] = None
    gauge: Optional[str] = None
    is_set: Optional[bool] = False
    order_quantity: Optional[int] = None
    unit_price: Optional[float] = None
    total_value: Optional[float] = None
    order_date: Optional[datetime] = None
    delivery_date: Optional[datetime] = None
    shipment_date: Optional[datetime] = None
    order_status: Optional[str] = None

    class Config:
        from_attributes = True


# Order Update Schema
class OrderUpdate(BaseModel):
    order_no: Optional[str] = None
    style_name: Optional[str] = None
    buyer_id: Optional[int] = None
    style_id: Optional[int] = None
    season: Optional[str] = None
    order_category: Optional[str] = None
    sales_contract: Optional[str] = None
    scl_po: Optional[str] = None
    fob: Optional[float] = None
    note: Optional[str] = None
    product_category: Optional[str] = None
    style_description: Optional[str] = None
    gauge: Optional[str] = None
    is_set: Optional[bool] = None
    order_quantity: Optional[int] = None
    unit_price: Optional[float] = None
    total_value: Optional[float] = None
    order_date: Optional[datetime] = None
    delivery_date: Optional[datetime] = None
    shipment_date: Optional[datetime] = None
    order_status: Optional[str] = None

    class Config:
        from_attributes = True


# Order Response Schema
class OrderResponse(BaseModel):
    id: int
    order_no: str
    style_name: str
    buyer_id: int
    style_id: int
    season: Optional[str] = None
    order_category: Optional[str] = None
    sales_contract: Optional[str] = None
    scl_po: Optional[str] = None
    fob: Optional[float] = None
    note: Optional[str] = None
    product_category: Optional[str] = None
    style_description: Optional[str] = None
    gauge: Optional[str] = None
    is_set: bool = False
    order_quantity: Optional[int] = None
    unit_price: Optional[float] = None
    total_value: Optional[float] = None
    order_date: Optional[datetime] = None
    delivery_date: Optional[datetime] = None
    shipment_date: Optional[datetime] = None
    order_status: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
