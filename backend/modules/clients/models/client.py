from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from core.database import BaseClients as Base


class BuyerType(Base):
    __tablename__ = "buyer_types"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True, index=True)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    buyers = relationship("Buyer", back_populates="buyer_type")


class Buyer(Base):
    __tablename__ = "buyers"

    id = Column(Integer, primary_key=True, index=True)
    buyer_name = Column(String, nullable=False, index=True)
    brand_name = Column(String, nullable=True)
    company_name = Column(String, nullable=False)
    head_office_country = Column(String, nullable=True)
    email = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    website = Column(String, nullable=True)
    tax_id = Column(String, nullable=True)
    rating = Column(Float, nullable=True)
    status = Column(String, nullable=True, default="active")  # active, inactive, on_hold
    buyer_type_id = Column(Integer, ForeignKey("buyer_types.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    buyer_type = relationship("BuyerType", back_populates="buyers", lazy="select")
    contacts = relationship("ContactPerson", back_populates="buyer", foreign_keys="ContactPerson.buyer_id")
    shipping_info = relationship("ShippingInfo", back_populates="buyer")


class Supplier(Base):
    __tablename__ = "suppliers"

    id = Column(Integer, primary_key=True, index=True)
    supplier_name = Column(String, nullable=False, index=True)
    company_name = Column(String, nullable=False)
    supplier_type = Column(String, nullable=True)  # Fabric, Trims, Accessories, Packaging
    contact_person = Column(String, nullable=True)
    email = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    country = Column(String, nullable=True)
    brand_name = Column(String, nullable=True)
    head_office_country = Column(String, nullable=True)
    website = Column(String, nullable=True)
    tax_id = Column(String, nullable=True)
    rating = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    contacts = relationship("ContactPerson", back_populates="supplier", foreign_keys="ContactPerson.supplier_id")


class ContactPerson(Base):
    __tablename__ = "contact_persons"

    id = Column(Integer, primary_key=True, index=True)
    contact_person_name = Column(String, nullable=False)
    company = Column(String, nullable=True)
    department = Column(String, nullable=True)
    designation = Column(String, nullable=True)
    phone_number = Column(String, nullable=True)
    corporate_mail = Column(String, nullable=True)
    country = Column(String, nullable=True)

    # Foreign keys
    buyer_id = Column(Integer, ForeignKey("buyers.id"), nullable=True)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    buyer = relationship("Buyer", back_populates="contacts", foreign_keys=[buyer_id])
    supplier = relationship("Supplier", back_populates="contacts", foreign_keys=[supplier_id])


class ShippingInfo(Base):
    __tablename__ = "shipping_info"

    id = Column(Integer, primary_key=True, index=True)
    buyer_id = Column(Integer, ForeignKey("buyers.id"), nullable=False)
    brand_name = Column(String, nullable=True)
    company_name = Column(String, nullable=True)
    destination_country = Column(String, nullable=True)
    destination_country_code = Column(String, nullable=True)
    destination_port = Column(String, nullable=True)
    place_of_delivery = Column(String, nullable=True)
    destination_code = Column(String, nullable=True)
    warehouse_no = Column(String, nullable=True)
    address = Column(Text, nullable=True)
    incoterm = Column(String, nullable=True)  # FOB, CIF, etc.
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    buyer = relationship("Buyer", back_populates="shipping_info")

    @property
    def buyer_name(self):
        return self.buyer.buyer_name if self.buyer else None


class BankingInfo(Base):
    __tablename__ = "banking_info"

    id = Column(Integer, primary_key=True, index=True)
    client_name = Column(String, nullable=False)
    country = Column(String, nullable=True)
    bank_name = Column(String, nullable=False)
    sort_code = Column(String, nullable=True)
    swift_code = Column(String, nullable=True)
    account_number = Column(String, nullable=False)
    currency = Column(String, nullable=True)
    account_type = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
