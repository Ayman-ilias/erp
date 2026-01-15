from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Boolean
from sqlalchemy.sql import func
from core.database import BaseOrders as Base


class OrderManagement(Base):
    __tablename__ = "order_management"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)

    # User-requested Order Basic Information fields
    order_no = Column(String, unique=True, nullable=False, index=True)  # Renamed from order_id
    style_name = Column(String, nullable=False)
    season = Column(String, nullable=True)  # New field
    order_category = Column(String, nullable=True)  # New field
    sales_contract = Column(String, nullable=True)  # New field
    scl_po = Column(String, nullable=True)  # New field (SCL PO)
    fob = Column(Float, nullable=True)  # New field (FOB price)
    note = Column(Text, nullable=True)  # New field

    # Cross-database references (no FK constraints)
    buyer_id = Column(Integer, nullable=False, index=True)  # No FK - clients DB
    style_id = Column(Integer, nullable=False, index=True)  # No FK - samples DB

    # Additional existing fields (kept for compatibility)
    product_category = Column(String, nullable=True)
    style_description = Column(Text, nullable=True)
    gauge = Column(String, nullable=True)
    is_set = Column(Boolean, default=False)

    # Order Details
    order_quantity = Column(Integer, nullable=True)
    unit_price = Column(Float, nullable=True)
    total_value = Column(Float, nullable=True)
    order_date = Column(DateTime(timezone=True), nullable=True)
    delivery_date = Column(DateTime(timezone=True), nullable=True)
    shipment_date = Column(DateTime(timezone=True), nullable=True)

    # Status
    order_status = Column(String, nullable=True)  # Received, In Production, Shipped, Completed, etc.

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
