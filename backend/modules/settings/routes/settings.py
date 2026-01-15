from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import List, Optional
import os
import uuid
from core.database import get_db_settings
from core.logging import setup_logging

from ..models import (
    CompanyProfile, Branch, Department,
    Role, Permission, RolePermission,
    Currency, ChartOfAccounts, Tax,
    UoMCategory, UoM,
    ColorFamily, Color, ColorValue, ColorMaster,
    Country, City, Port,
    Warehouse, DocumentNumbering, FiscalYear, PerMinuteValue
)
from ..schemas import (
    CompanyProfileUpdate, CompanyProfileResponse,
    BranchCreate, BranchUpdate, BranchResponse,
    DepartmentCreate, DepartmentUpdate, DepartmentResponse,
    RoleCreate, RoleUpdate, RoleResponse,
    PermissionCreate, PermissionResponse,
    RolePermissionCreate, RolePermissionResponse,
    CurrencyCreate, CurrencyUpdate, CurrencyResponse,
    ChartOfAccountsCreate, ChartOfAccountsUpdate, ChartOfAccountsResponse,
    TaxCreate, TaxUpdate, TaxResponse,
    UoMCategoryCreate, UoMCategoryUpdate, UoMCategoryResponse, UoMCategoryWithUnits,
    UoMCreate, UoMUpdate, UoMResponse, UoMWithCategory,
    UoMConversionRequest, UoMConversionResponse,
    UoMValidationRequest, UoMValidationResponse, UoMForSelector,
    ColorFamilyCreate, ColorFamilyUpdate, ColorFamilyResponse,
    ColorCreate, ColorUpdate, ColorResponse,
    ColorValueCreate, ColorValueUpdate, ColorValueResponse,
    ColorMasterCreate, ColorMasterUpdate, ColorMasterResponse,
    CountryCreate, CountryUpdate, CountryResponse,
    CityCreate, CityUpdate, CityResponse,
    PortCreate, PortUpdate, PortResponse,
    WarehouseCreate, WarehouseUpdate, WarehouseResponse,
    DocumentNumberingCreate, DocumentNumberingUpdate, DocumentNumberingResponse,
    FiscalYearCreate, FiscalYearUpdate, FiscalYearResponse,
    PerMinuteValueCreate, PerMinuteValueUpdate, PerMinuteValueResponse
)

logger = setup_logging()
router = APIRouter()


# ==================== COMPANY PROFILE ====================

@router.get("/company-profile", response_model=CompanyProfileResponse)
def get_company_profile(db: Session = Depends(get_db_settings)):
    """Get company profile (creates default if not exists)"""
    profile = db.query(CompanyProfile).first()
    if not profile:
        profile = CompanyProfile(company_name="My Company")
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile


@router.post("/company-profile/upload-logo", status_code=status.HTTP_200_OK)
async def upload_company_logo(
    file: UploadFile = File(...),
    db: Session = Depends(get_db_settings)
):
    """Upload company logo (PNG, JPG)"""
    try:
        # Validate file type
        allowed_extensions = {'.png', '.jpg', '.jpeg'}
        file_extension = os.path.splitext(file.filename)[1].lower()
        if file_extension not in allowed_extensions:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid file type. Allowed types: PNG, JPG, JPEG"
            )
        
        # Create uploads directory if it doesn't exist
        upload_dir = "uploads/company_logos"
        os.makedirs(upload_dir, exist_ok=True)
        
        # Generate unique filename
        unique_filename = f"company_logo_{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(upload_dir, unique_filename)
        
        # Save file
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # Update company profile with logo URL
        profile = db.query(CompanyProfile).first()
        if not profile:
            profile = CompanyProfile(company_name="My Company")
            db.add(profile)
            db.commit()
            db.refresh(profile)
        
        # Store relative path that can be served via static files
        # Static mount is at /api/v1/static with directory "uploads"
        # So files in uploads/company_logos/ are accessible at /api/v1/static/company_logos/
        logo_url = f"/api/v1/static/company_logos/{unique_filename}"
        profile.logo_url = logo_url
        db.commit()
        db.refresh(profile)
        
        return {
            "message": "Logo uploaded successfully",
            "logo_url": logo_url,
            "filename": unique_filename
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error uploading company logo: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload logo: {str(e)}"
        )


@router.put("/company-profile", response_model=CompanyProfileResponse)
def update_company_profile(data: CompanyProfileUpdate, db: Session = Depends(get_db_settings)):
    """Update company profile"""
    try:
        profile = db.query(CompanyProfile).first()
        if not profile:
            profile = CompanyProfile(company_name="My Company")
            db.add(profile)
            db.commit()
            db.refresh(profile)

        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(profile, key, value)

        db.commit()
        db.refresh(profile)
        return profile
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating company profile: {e}")
        raise HTTPException(status_code=500, detail="Failed to update company profile")


# ==================== BRANCHES ====================

@router.post("/branches", response_model=BranchResponse, status_code=status.HTTP_201_CREATED)
def create_branch(data: BranchCreate, db: Session = Depends(get_db_settings)):
    """Create a new branch"""
    try:
        existing = db.query(Branch).filter(Branch.branch_code == data.branch_code).first()
        if existing:
            raise HTTPException(status_code=400, detail="Branch code already exists")

        branch = Branch(**data.model_dump())
        db.add(branch)
        db.commit()
        db.refresh(branch)
        return branch
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating branch: {e}")
        raise HTTPException(status_code=500, detail="Failed to create branch")


@router.get("/branches", response_model=List[BranchResponse])
def get_branches(skip: int = 0, limit: Optional[int] = None, is_active: Optional[bool] = None, db: Session = Depends(get_db_settings)):
    """Get all branches"""
    query = db.query(Branch)
    if is_active is not None:
        query = query.filter(Branch.is_active == is_active)
    return query.order_by(Branch.id.desc()).offset(skip).limit(limit).all()


@router.get("/branches/{branch_id}", response_model=BranchResponse)
def get_branch(branch_id: int, db: Session = Depends(get_db_settings)):
    """Get a specific branch"""
    branch = db.query(Branch).filter(Branch.id == branch_id).first()
    if not branch:
        raise HTTPException(status_code=404, detail="Branch not found")
    return branch


@router.put("/branches/{branch_id}", response_model=BranchResponse)
def update_branch(branch_id: int, data: BranchUpdate, db: Session = Depends(get_db_settings)):
    """Update a branch"""
    try:
        branch = db.query(Branch).filter(Branch.id == branch_id).first()
        if not branch:
            raise HTTPException(status_code=404, detail="Branch not found")

        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(branch, key, value)

        db.commit()
        db.refresh(branch)
        return branch
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating branch: {e}")
        raise HTTPException(status_code=500, detail="Failed to update branch")


@router.delete("/branches/{branch_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_branch(branch_id: int, db: Session = Depends(get_db_settings)):
    """Delete a branch"""
    try:
        branch = db.query(Branch).filter(Branch.id == branch_id).first()
        if not branch:
            raise HTTPException(status_code=404, detail="Branch not found")

        db.delete(branch)
        db.commit()
        return None
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error deleting branch: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete branch")


# ==================== DEPARTMENTS ====================

@router.post("/departments", response_model=DepartmentResponse, status_code=status.HTTP_201_CREATED)
def create_department(data: DepartmentCreate, db: Session = Depends(get_db_settings)):
    """Create a new department"""
    try:
        existing = db.query(Department).filter(Department.department_code == data.department_code).first()
        if existing:
            raise HTTPException(status_code=400, detail="Department code already exists")

        department = Department(**data.model_dump())
        db.add(department)
        db.commit()
        db.refresh(department)
        return department
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating department: {e}")
        raise HTTPException(status_code=500, detail="Failed to create department")


@router.get("/departments", response_model=List[DepartmentResponse])
def get_departments(skip: int = 0, limit: Optional[int] = None, is_active: Optional[bool] = None, db: Session = Depends(get_db_settings)):
    """Get all departments"""
    query = db.query(Department)
    if is_active is not None:
        query = query.filter(Department.is_active == is_active)
    return query.order_by(Department.id.desc()).offset(skip).limit(limit).all()


@router.get("/departments/{department_id}", response_model=DepartmentResponse)
def get_department(department_id: int, db: Session = Depends(get_db_settings)):
    """Get a specific department"""
    department = db.query(Department).filter(Department.id == department_id).first()
    if not department:
        raise HTTPException(status_code=404, detail="Department not found")
    return department


@router.put("/departments/{department_id}", response_model=DepartmentResponse)
def update_department(department_id: int, data: DepartmentUpdate, db: Session = Depends(get_db_settings)):
    """Update a department"""
    try:
        department = db.query(Department).filter(Department.id == department_id).first()
        if not department:
            raise HTTPException(status_code=404, detail="Department not found")

        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(department, key, value)

        db.commit()
        db.refresh(department)
        return department
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating department: {e}")
        raise HTTPException(status_code=500, detail="Failed to update department")


@router.delete("/departments/{department_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_department(department_id: int, db: Session = Depends(get_db_settings)):
    """Delete a department"""
    try:
        department = db.query(Department).filter(Department.id == department_id).first()
        if not department:
            raise HTTPException(status_code=404, detail="Department not found")

        db.delete(department)
        db.commit()
        return None
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error deleting department: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete department")


# ==================== ROLES ====================

@router.post("/roles", response_model=RoleResponse, status_code=status.HTTP_201_CREATED)
def create_role(data: RoleCreate, db: Session = Depends(get_db_settings)):
    """Create a new role"""
    try:
        existing = db.query(Role).filter(Role.role_code == data.role_code).first()
        if existing:
            raise HTTPException(status_code=400, detail="Role code already exists")

        role = Role(**data.model_dump())
        db.add(role)
        db.commit()
        db.refresh(role)
        return role
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating role: {e}")
        raise HTTPException(status_code=500, detail="Failed to create role")


@router.get("/roles", response_model=List[RoleResponse])
def get_roles(skip: int = 0, limit: Optional[int] = None, is_active: Optional[bool] = None, db: Session = Depends(get_db_settings)):
    """Get all roles"""
    query = db.query(Role)
    if is_active is not None:
        query = query.filter(Role.is_active == is_active)
    return query.order_by(Role.id.desc()).offset(skip).limit(limit).all()


@router.get("/roles/{role_id}", response_model=RoleResponse)
def get_role(role_id: int, db: Session = Depends(get_db_settings)):
    """Get a specific role"""
    role = db.query(Role).filter(Role.id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    return role


@router.put("/roles/{role_id}", response_model=RoleResponse)
def update_role(role_id: int, data: RoleUpdate, db: Session = Depends(get_db_settings)):
    """Update a role"""
    try:
        role = db.query(Role).filter(Role.id == role_id).first()
        if not role:
            raise HTTPException(status_code=404, detail="Role not found")

        if role.is_system_role:
            raise HTTPException(status_code=400, detail="Cannot modify system role")

        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(role, key, value)

        db.commit()
        db.refresh(role)
        return role
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating role: {e}")
        raise HTTPException(status_code=500, detail="Failed to update role")


@router.delete("/roles/{role_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_role(role_id: int, db: Session = Depends(get_db_settings)):
    """Delete a role"""
    try:
        role = db.query(Role).filter(Role.id == role_id).first()
        if not role:
            raise HTTPException(status_code=404, detail="Role not found")

        if role.is_system_role:
            raise HTTPException(status_code=400, detail="Cannot delete system role")

        db.delete(role)
        db.commit()
        return None
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error deleting role: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete role")


# ==================== ROLE PERMISSIONS ====================

@router.get("/roles/{role_id}/permissions", response_model=List[RolePermissionResponse])
def get_role_permissions(role_id: int, db: Session = Depends(get_db_settings)):
    """Get all permissions assigned to a role"""
    role = db.query(Role).filter(Role.id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")

    return db.query(RolePermission).filter(RolePermission.role_id == role_id).all()


@router.post("/roles/{role_id}/permissions", response_model=RolePermissionResponse, status_code=status.HTTP_201_CREATED)
def assign_permission_to_role(role_id: int, data: RolePermissionCreate, db: Session = Depends(get_db_settings)):
    """Assign a permission to a role"""
    try:
        role = db.query(Role).filter(Role.id == role_id).first()
        if not role:
            raise HTTPException(status_code=404, detail="Role not found")

        permission = db.query(Permission).filter(Permission.id == data.permission_id).first()
        if not permission:
            raise HTTPException(status_code=404, detail="Permission not found")

        existing = db.query(RolePermission).filter(
            RolePermission.role_id == role_id,
            RolePermission.permission_id == data.permission_id
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="Permission already assigned to this role")

        role_permission = RolePermission(role_id=role_id, permission_id=data.permission_id)
        db.add(role_permission)
        db.commit()
        db.refresh(role_permission)
        return role_permission
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error assigning permission to role: {e}")
        raise HTTPException(status_code=500, detail="Failed to assign permission")


@router.delete("/roles/{role_id}/permissions/{permission_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_permission_from_role(role_id: int, permission_id: int, db: Session = Depends(get_db_settings)):
    """Remove a permission from a role"""
    try:
        role_permission = db.query(RolePermission).filter(
            RolePermission.role_id == role_id,
            RolePermission.permission_id == permission_id
        ).first()
        if not role_permission:
            raise HTTPException(status_code=404, detail="Permission not assigned to this role")

        db.delete(role_permission)
        db.commit()
        return None
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error removing permission from role: {e}")
        raise HTTPException(status_code=500, detail="Failed to remove permission")


# ==================== PERMISSIONS ====================

@router.get("/permissions", response_model=List[PermissionResponse])
def get_permissions(module: Optional[str] = None, db: Session = Depends(get_db_settings)):
    """Get all permissions"""
    query = db.query(Permission)
    if module:
        query = query.filter(Permission.module == module)
    return query.order_by(Permission.module, Permission.action).all()


@router.post("/permissions", response_model=PermissionResponse, status_code=status.HTTP_201_CREATED)
def create_permission(data: PermissionCreate, db: Session = Depends(get_db_settings)):
    """Create a new permission"""
    try:
        existing = db.query(Permission).filter(Permission.permission_code == data.permission_code).first()
        if existing:
            raise HTTPException(status_code=400, detail="Permission code already exists")

        permission = Permission(**data.model_dump())
        db.add(permission)
        db.commit()
        db.refresh(permission)
        return permission
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating permission: {e}")
        raise HTTPException(status_code=500, detail="Failed to create permission")


# ==================== CURRENCIES ====================

@router.post("/currencies", response_model=CurrencyResponse, status_code=status.HTTP_201_CREATED)
def create_currency(data: CurrencyCreate, db: Session = Depends(get_db_settings)):
    """Create a new currency"""
    try:
        existing = db.query(Currency).filter(Currency.currency_code == data.currency_code).first()
        if existing:
            raise HTTPException(status_code=400, detail="Currency code already exists")

        currency = Currency(**data.model_dump())
        db.add(currency)
        db.commit()
        db.refresh(currency)
        return currency
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating currency: {e}")
        raise HTTPException(status_code=500, detail="Failed to create currency")


@router.get("/currencies", response_model=List[CurrencyResponse])
def get_currencies(skip: int = 0, limit: Optional[int] = None, is_active: Optional[bool] = None, db: Session = Depends(get_db_settings)):
    """Get all currencies"""
    query = db.query(Currency)
    if is_active is not None:
        query = query.filter(Currency.is_active == is_active)
    return query.order_by(Currency.currency_code).offset(skip).limit(limit).all()


@router.get("/currencies/{currency_id}", response_model=CurrencyResponse)
def get_currency(currency_id: int, db: Session = Depends(get_db_settings)):
    """Get a specific currency"""
    currency = db.query(Currency).filter(Currency.id == currency_id).first()
    if not currency:
        raise HTTPException(status_code=404, detail="Currency not found")
    return currency


@router.put("/currencies/{currency_id}", response_model=CurrencyResponse)
def update_currency(currency_id: int, data: CurrencyUpdate, db: Session = Depends(get_db_settings)):
    """Update a currency"""
    try:
        currency = db.query(Currency).filter(Currency.id == currency_id).first()
        if not currency:
            raise HTTPException(status_code=404, detail="Currency not found")

        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(currency, key, value)

        db.commit()
        db.refresh(currency)
        return currency
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating currency: {e}")
        raise HTTPException(status_code=500, detail="Failed to update currency")


@router.delete("/currencies/{currency_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_currency(currency_id: int, db: Session = Depends(get_db_settings)):
    """Delete a currency"""
    try:
        currency = db.query(Currency).filter(Currency.id == currency_id).first()
        if not currency:
            raise HTTPException(status_code=404, detail="Currency not found")

        db.delete(currency)
        db.commit()
        return None
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error deleting currency: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete currency")


# ==================== TAXES ====================

@router.post("/taxes", response_model=TaxResponse, status_code=status.HTTP_201_CREATED)
def create_tax(data: TaxCreate, db: Session = Depends(get_db_settings)):
    """Create a new tax"""
    try:
        existing = db.query(Tax).filter(Tax.tax_code == data.tax_code).first()
        if existing:
            raise HTTPException(status_code=400, detail="Tax code already exists")

        tax = Tax(**data.model_dump())
        db.add(tax)
        db.commit()
        db.refresh(tax)
        return tax
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating tax: {e}")
        raise HTTPException(status_code=500, detail="Failed to create tax")


@router.get("/taxes", response_model=List[TaxResponse])
def get_taxes(skip: int = 0, limit: Optional[int] = None, is_active: Optional[bool] = None, db: Session = Depends(get_db_settings)):
    """Get all taxes"""
    query = db.query(Tax)
    if is_active is not None:
        query = query.filter(Tax.is_active == is_active)
    return query.order_by(Tax.id.desc()).offset(skip).limit(limit).all()


@router.get("/taxes/{tax_id}", response_model=TaxResponse)
def get_tax(tax_id: int, db: Session = Depends(get_db_settings)):
    """Get a specific tax"""
    tax = db.query(Tax).filter(Tax.id == tax_id).first()
    if not tax:
        raise HTTPException(status_code=404, detail="Tax not found")
    return tax


@router.put("/taxes/{tax_id}", response_model=TaxResponse)
def update_tax(tax_id: int, data: TaxUpdate, db: Session = Depends(get_db_settings)):
    """Update a tax"""
    try:
        tax = db.query(Tax).filter(Tax.id == tax_id).first()
        if not tax:
            raise HTTPException(status_code=404, detail="Tax not found")

        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(tax, key, value)

        db.commit()
        db.refresh(tax)
        return tax
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating tax: {e}")
        raise HTTPException(status_code=500, detail="Failed to update tax")


@router.delete("/taxes/{tax_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_tax(tax_id: int, db: Session = Depends(get_db_settings)):
    """Delete a tax"""
    try:
        tax = db.query(Tax).filter(Tax.id == tax_id).first()
        if not tax:
            raise HTTPException(status_code=404, detail="Tax not found")

        db.delete(tax)
        db.commit()
        return None
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error deleting tax: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete tax")


# ==================== UOM CATEGORIES ====================

@router.post("/uom-categories", response_model=UoMCategoryResponse, status_code=status.HTTP_201_CREATED)
def create_uom_category(data: UoMCategoryCreate, db: Session = Depends(get_db_settings)):
    """Create a new UoM category"""
    try:
        existing = db.query(UoMCategory).filter(UoMCategory.uom_category == data.uom_category).first()
        if existing:
            raise HTTPException(status_code=400, detail="UoM category already exists")

        category = UoMCategory(**data.model_dump())
        db.add(category)
        db.commit()
        db.refresh(category)
        return category
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating UoM category: {e}")
        raise HTTPException(status_code=500, detail="Failed to create UoM category")


@router.get("/uom-categories", response_model=List[UoMCategoryResponse])
def get_uom_categories(skip: int = 0, limit: Optional[int] = None, is_active: Optional[bool] = None, db: Session = Depends(get_db_settings)):
    """Get all UoM categories"""
    query = db.query(UoMCategory)
    if is_active is not None:
        query = query.filter(UoMCategory.is_active == is_active)
    return query.order_by(UoMCategory.uom_category).offset(skip).limit(limit).all()


@router.get("/uom-categories/{category_id}", response_model=UoMCategoryResponse)
def get_uom_category(category_id: int, db: Session = Depends(get_db_settings)):
    """Get a specific UoM category"""
    category = db.query(UoMCategory).filter(UoMCategory.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="UoM category not found")
    return category


@router.put("/uom-categories/{category_id}", response_model=UoMCategoryResponse)
def update_uom_category(category_id: int, data: UoMCategoryUpdate, db: Session = Depends(get_db_settings)):
    """Update a UoM category"""
    try:
        category = db.query(UoMCategory).filter(UoMCategory.id == category_id).first()
        if not category:
            raise HTTPException(status_code=404, detail="UoM category not found")

        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(category, key, value)

        db.commit()
        db.refresh(category)
        return category
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating UoM category: {e}")
        raise HTTPException(status_code=500, detail="Failed to update UoM category")


@router.delete("/uom-categories/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_uom_category(category_id: int, db: Session = Depends(get_db_settings)):
    """Delete a UoM category"""
    try:
        category = db.query(UoMCategory).filter(UoMCategory.id == category_id).first()
        if not category:
            raise HTTPException(status_code=404, detail="UoM category not found")

        db.delete(category)
        db.commit()
        return None
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error deleting UoM category: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete UoM category")


# ==================== UOM ====================

@router.post("/uom", response_model=UoMResponse, status_code=status.HTTP_201_CREATED)
def create_uom(data: UoMCreate, db: Session = Depends(get_db_settings)):
    """Create a new UoM"""
    try:
        uom = UoM(**data.model_dump())
        db.add(uom)
        db.commit()
        db.refresh(uom)
        return uom
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating UoM: {e}")
        raise HTTPException(status_code=500, detail="Failed to create UoM")


@router.get("/uom", response_model=List[UoMResponse])
def get_uoms(skip: int = 0, limit: Optional[int] = None, category_id: Optional[int] = None, is_active: Optional[bool] = None, db: Session = Depends(get_db_settings)):
    """Get all UoMs"""
    query = db.query(UoM)
    if category_id:
        query = query.filter(UoM.category_id == category_id)
    if is_active is not None:
        query = query.filter(UoM.is_active == is_active)
    return query.order_by(UoM.sort_order, UoM.name).offset(skip).limit(limit).all()


@router.get("/uom/for-selector", response_model=List[UoMForSelector])
def get_uoms_for_selector(
    category_id: Optional[int] = None,
    category_name: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db_settings)
):
    """Optimized endpoint for UOM selector component - returns simplified UoM data"""
    query = db.query(UoM).filter(UoM.is_active == True)

    # Filter by category ID or name
    if category_id:
        query = query.filter(UoM.category_id == category_id)
    elif category_name:
        # Find categories matching the name (case-insensitive)
        categories = db.query(UoMCategory).filter(
            UoMCategory.uom_category.ilike(f"%{category_name}%"),
            UoMCategory.is_active == True
        ).all()
        if categories:
            category_ids = [c.id for c in categories]
            query = query.filter(UoM.category_id.in_(category_ids))

    # Apply search filter
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (UoM.name.ilike(search_term)) |
            (UoM.symbol.ilike(search_term)) |
            (UoM.display_name.ilike(search_term))
        )

    uoms = query.order_by(UoM.sort_order, UoM.name).all()

    # Build result with category names
    result = []
    for uom in uoms:
        category = db.query(UoMCategory).filter(UoMCategory.id == uom.category_id).first()
        result.append(UoMForSelector(
            id=uom.id,
            name=uom.name,
            symbol=uom.symbol,
            display_name=uom.display_name,
            category_id=uom.category_id,
            category_name=category.uom_category if category else None,
            is_base=uom.is_base
        ))

    return result


@router.get("/uom/{uom_id}", response_model=UoMResponse)
def get_uom(uom_id: int, db: Session = Depends(get_db_settings)):
    """Get a specific UoM"""
    uom = db.query(UoM).filter(UoM.id == uom_id).first()
    if not uom:
        raise HTTPException(status_code=404, detail="UoM not found")
    return uom


@router.put("/uom/{uom_id}", response_model=UoMResponse)
def update_uom(uom_id: int, data: UoMUpdate, db: Session = Depends(get_db_settings)):
    """Update a UoM"""
    try:
        uom = db.query(UoM).filter(UoM.id == uom_id).first()
        if not uom:
            raise HTTPException(status_code=404, detail="UoM not found")

        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(uom, key, value)

        db.commit()
        db.refresh(uom)
        return uom
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating UoM: {e}")
        raise HTTPException(status_code=500, detail="Failed to update UoM")


@router.delete("/uom/{uom_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_uom(uom_id: int, db: Session = Depends(get_db_settings)):
    """Delete a UoM"""
    try:
        uom = db.query(UoM).filter(UoM.id == uom_id).first()
        if not uom:
            raise HTTPException(status_code=404, detail="UoM not found")

        db.delete(uom)
        db.commit()
        return None
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error deleting UoM: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete UoM")


# ==================== UOM ENHANCED ENDPOINTS ====================

@router.get("/uom-categories/with-counts", response_model=List[UoMCategoryWithUnits])
def get_uom_categories_with_counts(is_active: Optional[bool] = None, db: Session = Depends(get_db_settings)):
    """Get all UoM categories with unit counts for dashboard display"""
    query = db.query(UoMCategory)
    if is_active is not None:
        query = query.filter(UoMCategory.is_active == is_active)

    categories = query.order_by(UoMCategory.sort_order, UoMCategory.uom_category).all()

    result = []
    for cat in categories:
        # Count units in this category
        unit_count = db.query(UoM).filter(UoM.category_id == cat.id, UoM.is_active == True).count()
        # Find base unit
        base_unit_obj = db.query(UoM).filter(UoM.category_id == cat.id, UoM.is_base == True).first()
        base_unit = base_unit_obj.symbol if base_unit_obj else None

        result.append(UoMCategoryWithUnits(
            id=cat.id,
            uom_category=cat.uom_category,
            uom_id=cat.uom_id,
            uom_name=cat.uom_name,
            uom_description=cat.uom_description,
            icon=cat.icon,
            industry_use=cat.industry_use,
            sort_order=cat.sort_order,
            is_active=cat.is_active,
            created_at=cat.created_at,
            updated_at=cat.updated_at,
            unit_count=unit_count,
            base_unit=base_unit
        ))

    return result


@router.post("/uom/convert", response_model=UoMConversionResponse)
def convert_uom(request: UoMConversionRequest, db: Session = Depends(get_db_settings)):
    """Convert a value between two compatible UoMs (must be in same category)"""
    from_uom = db.query(UoM).filter(UoM.id == request.from_uom_id).first()
    if not from_uom:
        raise HTTPException(status_code=404, detail="Source UoM not found")

    to_uom = db.query(UoM).filter(UoM.id == request.to_uom_id).first()
    if not to_uom:
        raise HTTPException(status_code=404, detail="Target UoM not found")

    # Check if both UoMs are in the same category
    if from_uom.category_id != to_uom.category_id:
        raise HTTPException(status_code=400, detail="Cannot convert between different UoM categories")

    # Convert: first to base unit, then to target unit
    # value_in_base = value * from_conversion_to_base
    # result = value_in_base / to_conversion_to_base
    from decimal import Decimal
    
    # Use new conversion_to_base field if available, fallback to factor
    from_factor = Decimal(str(from_uom.conversion_to_base)) if hasattr(from_uom, 'conversion_to_base') and from_uom.conversion_to_base else (Decimal(str(from_uom.factor)) if from_uom.factor else Decimal("1"))
    to_factor = Decimal(str(to_uom.conversion_to_base)) if hasattr(to_uom, 'conversion_to_base') and to_uom.conversion_to_base else (Decimal(str(to_uom.factor)) if to_uom.factor else Decimal("1"))

    value_in_base = request.value * from_factor
    result = value_in_base / to_factor
    conversion_factor = from_factor / to_factor

    return UoMConversionResponse(
        from_uom=from_uom.symbol,
        to_uom=to_uom.symbol,
        from_value=request.value,
        to_value=round(result, to_uom.decimal_places or 2),
        conversion_factor=conversion_factor,
        formula=f"1 {from_uom.symbol} = {conversion_factor} {to_uom.symbol}"
    )


@router.get("/uom/compatible/{uom_id}", response_model=List[UoMResponse])
def get_compatible_uoms(uom_id: int, db: Session = Depends(get_db_settings)):
    """Get all UoMs compatible for conversion with given UoM (same category)"""
    uom = db.query(UoM).filter(UoM.id == uom_id).first()
    if not uom:
        raise HTTPException(status_code=404, detail="UoM not found")

    # Return all active UoMs in the same category (excluding the source UoM)
    compatible = db.query(UoM).filter(
        UoM.category_id == uom.category_id,
        UoM.is_active == True,
        UoM.id != uom_id
    ).order_by(UoM.sort_order, UoM.name).all()

    return compatible


@router.post("/uom/validate-symbol", response_model=UoMValidationResponse)
def validate_uom_symbol(request: UoMValidationRequest, db: Session = Depends(get_db_settings)):
    """Check if a UoM symbol is unique within a category"""
    query = db.query(UoM).filter(
        UoM.category_id == request.category_id,
        UoM.symbol == request.symbol
    )

    # Exclude the current UoM if editing
    if request.exclude_id:
        query = query.filter(UoM.id != request.exclude_id)

    existing = query.first()

    if existing:
        return UoMValidationResponse(
            is_valid=False,
            message=f"Symbol '{request.symbol}' already exists in this category"
        )

    return UoMValidationResponse(is_valid=True, message="Symbol is available")


@router.get("/uom/search", response_model=List[UoMWithCategory])
def search_uoms(
    q: str,
    category_id: Optional[int] = None,
    is_active: Optional[bool] = True,
    limit: int = 50,
    db: Session = Depends(get_db_settings)
):
    """Search UoMs by name, symbol, or display name"""
    search_term = f"%{q}%"
    query = db.query(UoM).filter(
        (UoM.name.ilike(search_term)) |
        (UoM.symbol.ilike(search_term)) |
        (UoM.display_name.ilike(search_term))
    )

    if category_id:
        query = query.filter(UoM.category_id == category_id)
    if is_active is not None:
        query = query.filter(UoM.is_active == is_active)

    uoms = query.order_by(UoM.sort_order, UoM.name).limit(limit).all()

    # Add category name to each result
    result = []
    for uom in uoms:
        category = db.query(UoMCategory).filter(UoMCategory.id == uom.category_id).first()
        result.append(UoMWithCategory(
            id=uom.id,
            category_id=uom.category_id,
            name=uom.name,
            symbol=uom.symbol,
            factor=uom.factor,
            is_base=uom.is_base,
            is_active=uom.is_active,
            remarks=uom.remarks,
            display_name=uom.display_name,
            is_si_unit=uom.is_si_unit,
            common_usage=uom.common_usage,
            decimal_places=uom.decimal_places,
            sort_order=uom.sort_order,
            created_at=uom.created_at,
            updated_at=uom.updated_at,
            category_name=category.uom_category if category else None
        ))

    return result


# ==================== COLOR FAMILIES ====================

@router.post("/color-families", response_model=ColorFamilyResponse, status_code=status.HTTP_201_CREATED)
def create_color_family(data: ColorFamilyCreate, db: Session = Depends(get_db_settings)):
    """Create a new color family"""
    try:
        existing = db.query(ColorFamily).filter(ColorFamily.color_family == data.color_family).first()
        if existing:
            raise HTTPException(status_code=400, detail="Color family already exists")

        color_family = ColorFamily(**data.model_dump())
        db.add(color_family)
        db.commit()
        db.refresh(color_family)
        return color_family
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating color family: {e}")
        raise HTTPException(status_code=500, detail="Failed to create color family")


@router.get("/color-families", response_model=List[ColorFamilyResponse])
def get_color_families(skip: int = 0, limit: Optional[int] = 100, is_active: Optional[bool] = None, db: Session = Depends(get_db_settings)):
    """Get all color families"""
    query = db.query(ColorFamily)
    if is_active is not None:
        query = query.filter(ColorFamily.is_active == is_active)
    query = query.order_by(ColorFamily.sort_order, ColorFamily.color_family).offset(skip)
    if limit is not None:
        query = query.limit(limit)
    return query.all()


@router.get("/color-families/{family_id}", response_model=ColorFamilyResponse)
def get_color_family(family_id: int, db: Session = Depends(get_db_settings)):
    """Get a specific color family"""
    family = db.query(ColorFamily).filter(ColorFamily.id == family_id).first()
    if not family:
        raise HTTPException(status_code=404, detail="Color family not found")
    return family


@router.put("/color-families/{family_id}", response_model=ColorFamilyResponse)
def update_color_family(family_id: int, data: ColorFamilyUpdate, db: Session = Depends(get_db_settings)):
    """Update a color family"""
    try:
        family = db.query(ColorFamily).filter(ColorFamily.id == family_id).first()
        if not family:
            raise HTTPException(status_code=404, detail="Color family not found")

        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(family, key, value)

        db.commit()
        db.refresh(family)
        return family
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating color family: {e}")
        raise HTTPException(status_code=500, detail="Failed to update color family")


@router.delete("/color-families/{family_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_color_family(family_id: int, db: Session = Depends(get_db_settings)):
    """Delete a color family"""
    try:
        family = db.query(ColorFamily).filter(ColorFamily.id == family_id).first()
        if not family:
            raise HTTPException(status_code=404, detail="Color family not found")

        db.delete(family)
        db.commit()
        return None
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error deleting color family: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete color family")


# ==================== COLORS ====================

@router.post("/colors", response_model=ColorResponse, status_code=status.HTTP_201_CREATED)
def create_color(data: ColorCreate, db: Session = Depends(get_db_settings)):
    """Create a new color"""
    try:
        color = Color(**data.model_dump())
        db.add(color)
        db.commit()
        db.refresh(color)
        return color
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating color: {e}")
        raise HTTPException(status_code=500, detail="Failed to create color")


@router.get("/colors", response_model=List[ColorResponse])
def get_colors(skip: int = 0, limit: Optional[int] = 100, color_family_id: Optional[int] = None, is_active: Optional[bool] = None, db: Session = Depends(get_db_settings)):
    """Get all colors"""
    query = db.query(Color)
    if color_family_id:
        query = query.filter(Color.color_family_id == color_family_id)
    if is_active is not None:
        query = query.filter(Color.is_active == is_active)
    query = query.order_by(Color.color).offset(skip)
    if limit is not None:
        query = query.limit(limit)
    return query.all()


@router.get("/colors/{color_id}", response_model=ColorResponse)
def get_color(color_id: int, db: Session = Depends(get_db_settings)):
    """Get a specific color"""
    color = db.query(Color).filter(Color.id == color_id).first()
    if not color:
        raise HTTPException(status_code=404, detail="Color not found")
    return color


@router.put("/colors/{color_id}", response_model=ColorResponse)
def update_color(color_id: int, data: ColorUpdate, db: Session = Depends(get_db_settings)):
    """Update a color"""
    try:
        color = db.query(Color).filter(Color.id == color_id).first()
        if not color:
            raise HTTPException(status_code=404, detail="Color not found")

        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(color, key, value)

        db.commit()
        db.refresh(color)
        return color
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating color: {e}")
        raise HTTPException(status_code=500, detail="Failed to update color")


@router.delete("/colors/{color_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_color(color_id: int, db: Session = Depends(get_db_settings)):
    """Delete a color"""
    try:
        color = db.query(Color).filter(Color.id == color_id).first()
        if not color:
            raise HTTPException(status_code=404, detail="Color not found")

        db.delete(color)
        db.commit()
        return None
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error deleting color: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete color")


# ==================== COLOR VALUES ====================

@router.post("/color-values", response_model=ColorValueResponse, status_code=status.HTTP_201_CREATED)
def create_color_value(data: ColorValueCreate, db: Session = Depends(get_db_settings)):
    """Create a new color value"""
    try:
        existing = db.query(ColorValue).filter(ColorValue.color_value_code == data.color_value_code).first()
        if existing:
            raise HTTPException(status_code=400, detail="Color value code already exists")

        color_value = ColorValue(**data.model_dump())
        db.add(color_value)
        db.commit()
        db.refresh(color_value)
        return color_value
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating color value: {e}")
        raise HTTPException(status_code=500, detail="Failed to create color value")


@router.get("/color-values", response_model=List[ColorValueResponse])
def get_color_values(skip: int = 0, limit: Optional[int] = 100, is_active: Optional[bool] = None, db: Session = Depends(get_db_settings)):
    """Get all color values"""
    query = db.query(ColorValue)
    if is_active is not None:
        query = query.filter(ColorValue.is_active == is_active)
    query = query.order_by(ColorValue.sort_order).offset(skip)
    if limit is not None:
        query = query.limit(limit)
    return query.all()


@router.get("/color-values/{value_id}", response_model=ColorValueResponse)
def get_color_value(value_id: int, db: Session = Depends(get_db_settings)):
    """Get a specific color value"""
    value = db.query(ColorValue).filter(ColorValue.id == value_id).first()
    if not value:
        raise HTTPException(status_code=404, detail="Color value not found")
    return value


@router.put("/color-values/{value_id}", response_model=ColorValueResponse)
def update_color_value(value_id: int, data: ColorValueUpdate, db: Session = Depends(get_db_settings)):
    """Update a color value"""
    try:
        value = db.query(ColorValue).filter(ColorValue.id == value_id).first()
        if not value:
            raise HTTPException(status_code=404, detail="Color value not found")

        update_data = data.model_dump(exclude_unset=True)
        for key, value_data in update_data.items():
            setattr(value, key, value_data)

        db.commit()
        db.refresh(value)
        return value
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating color value: {e}")
        raise HTTPException(status_code=500, detail="Failed to update color value")


@router.delete("/color-values/{value_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_color_value(value_id: int, db: Session = Depends(get_db_settings)):
    """Delete a color value"""
    try:
        value = db.query(ColorValue).filter(ColorValue.id == value_id).first()
        if not value:
            raise HTTPException(status_code=404, detail="Color value not found")

        db.delete(value)
        db.commit()
        return None
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error deleting color value: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete color value")


# ==================== COLOR MASTER ====================

@router.post("/color-master", response_model=ColorMasterResponse, status_code=status.HTTP_201_CREATED)
def create_color_master(data: ColorMasterCreate, db: Session = Depends(get_db_settings)):
    """Create a new color master entry"""
    try:
        color_master = ColorMaster(**data.model_dump())
        db.add(color_master)
        db.commit()
        db.refresh(color_master)
        return color_master
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating color master: {e}")
        raise HTTPException(status_code=500, detail="Failed to create color master")


@router.get("/color-master", response_model=List[ColorMasterResponse])
def get_color_masters(skip: int = 0, limit: Optional[int] = None, color_family_id: Optional[int] = None, color_code_type: Optional[str] = None, is_active: Optional[bool] = None, db: Session = Depends(get_db_settings)):
    """Get all color master entries"""
    query = db.query(ColorMaster)
    if color_family_id:
        query = query.filter(ColorMaster.color_family_id == color_family_id)
    if color_code_type:
        query = query.filter(ColorMaster.color_code_type == color_code_type)
    if is_active is not None:
        query = query.filter(ColorMaster.is_active == is_active)
    query = query.order_by(ColorMaster.color_name).offset(skip)
    # If limit is None, return all records. Otherwise apply limit.
    if limit is not None:
        query = query.limit(limit)
    return query.all()


@router.get("/color-master/{master_id}", response_model=ColorMasterResponse)
def get_color_master(master_id: int, db: Session = Depends(get_db_settings)):
    """Get a specific color master entry"""
    master = db.query(ColorMaster).filter(ColorMaster.id == master_id).first()
    if not master:
        raise HTTPException(status_code=404, detail="Color master not found")
    return master


@router.put("/color-master/{master_id}", response_model=ColorMasterResponse)
def update_color_master(master_id: int, data: ColorMasterUpdate, db: Session = Depends(get_db_settings)):
    """Update a color master entry"""
    try:
        master = db.query(ColorMaster).filter(ColorMaster.id == master_id).first()
        if not master:
            raise HTTPException(status_code=404, detail="Color master not found")

        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(master, key, value)

        db.commit()
        db.refresh(master)
        return master
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating color master: {e}")
        raise HTTPException(status_code=500, detail="Failed to update color master")


@router.delete("/color-master/{master_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_color_master(master_id: int, db: Session = Depends(get_db_settings)):
    """Delete a color master entry"""
    try:
        master = db.query(ColorMaster).filter(ColorMaster.id == master_id).first()
        if not master:
            raise HTTPException(status_code=404, detail="Color master not found")

        db.delete(master)
        db.commit()
        return None
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error deleting color master: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete color master")


@router.post("/color-master/seed-tcx")
def seed_tcx_colors(db: Session = Depends(get_db_settings)):
    """
    Seed comprehensive Pantone TCX color codes into Color Master
    This will add all TCX colors with their codes, hex values, and map them to appropriate color families
    """
    try:
        from .seed_tcx_colors import COMPREHENSIVE_TCX_COLORS
        
        # Get or create color families
        family_map = {}
        for family_name in ["RED", "PINK", "ORANGE", "YELLOW", "GREEN", "BLUE", "PURPLE", "BROWN", "NEUTRAL", "BEIGE", "BLACK", "WHITE", "GREY"]:
            family = db.query(ColorFamily).filter(ColorFamily.color_family == family_name).first()
            if not family:
                # Create family if it doesn't exist
                family = ColorFamily(
                    color_family=family_name,
                    color_family_code=family_name[:3],
                    color_family_code_type="INTERNAL",
                    is_active=True
                )
                db.add(family)
                db.flush()
            family_map[family_name] = family.id
        
        # Get or create base colors for each family
        color_map = {}
        for family_name, family_id in family_map.items():
            # Get or create a base color for this family
            base_color_name = family_name.title()
            color = db.query(Color).filter(
                Color.color == base_color_name,
                Color.color_family_id == family_id
            ).first()
            
            if not color:
                color = Color(
                    color=base_color_name,
                    color_family_id=family_id,
                    color_code=family_name[:3],
                    color_code_type="INTERNAL",
                    is_active=True
                )
                db.add(color)
                db.flush()
            color_map[family_name] = color.id
        
        inserted = 0
        updated = 0
        skipped = 0
        
        # Process each TCX color
        for color_name, tcx_code, hex_code, family_name in COMPREHENSIVE_TCX_COLORS:
            try:
                family_id = family_map.get(family_name)
                color_id = color_map.get(family_name)
                
                if not family_id or not color_id:
                    logger.warning(f"Skipping {color_name} - family {family_name} not found")
                    skipped += 1
                    continue
                
                # Check if TCX color already exists
                existing = db.query(ColorMaster).filter(
                    ColorMaster.color_code == tcx_code,
                    ColorMaster.color_code_type == "TCX"
                ).first()
                
                if existing:
                    # Update existing
                    existing.color_name = color_name
                    existing.hex_value = hex_code
                    existing.is_active = True
                    existing.color_id = color_id
                    existing.color_family_id = family_id
                    existing.remarks = f"Pantone TCX {tcx_code}"
                    updated += 1
                else:
                    # Create new - use merge to handle potential duplicates
                    try:
                        new_master = ColorMaster(
                            color_id=color_id,
                            color_family_id=family_id,
                            color_value_id=None,  # TCX colors don't have intensity values
                            color_name=color_name,
                            color_code_type="TCX",
                            color_code=tcx_code,
                            hex_value=hex_code,
                            is_active=True,
                            remarks=f"Pantone TCX {tcx_code}"
                        )
                        db.add(new_master)
                        db.flush()  # Flush to catch integrity errors early
                        inserted += 1
                    except IntegrityError as e:
                        # If duplicate, update instead
                        db.rollback()
                        existing = db.query(ColorMaster).filter(
                            ColorMaster.color_code == tcx_code,
                            ColorMaster.color_code_type == "TCX"
                        ).first()
                        if existing:
                            existing.color_name = color_name
                            existing.hex_value = hex_code
                            existing.is_active = True
                            existing.color_id = color_id
                            existing.color_family_id = family_id
                            existing.remarks = f"Pantone TCX {tcx_code}"
                            updated += 1
                        else:
                            skipped += 1
                        continue
                
                # Commit in batches to avoid transaction issues
                if (inserted + updated) % 50 == 0:
                    db.commit()
                    
            except IntegrityError as e:
                # Handle unique constraint violations
                db.rollback()
                # Try to update the existing record
                existing = db.query(ColorMaster).filter(
                    ColorMaster.color_code == tcx_code,
                    ColorMaster.color_code_type == "TCX"
                ).first()
                if existing:
                    existing.color_name = color_name
                    existing.hex_value = hex_code
                    existing.is_active = True
                    existing.color_id = color_id
                    existing.color_family_id = family_id
                    existing.remarks = f"Pantone TCX {tcx_code}"
                    updated += 1
                else:
                    logger.warning(f"Failed to process TCX color {color_name} ({tcx_code}): {e}")
                    skipped += 1
                continue
            except Exception as e:
                db.rollback()
                logger.warning(f"Failed to process TCX color {color_name} ({tcx_code}): {e}")
                skipped += 1
                continue
        
        # Final commit
        try:
            db.commit()
        except IntegrityError as e:
            db.rollback()
            logger.error(f"Final commit failed: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to commit TCX colors: {str(e)}")
        
        # Get total count
        total_tcx = db.query(ColorMaster).filter(
            ColorMaster.color_code_type == "TCX",
            ColorMaster.is_active == True
        ).count()
        
        return {
            "message": "TCX colors seeded successfully",
            "inserted": inserted,
            "updated": updated,
            "skipped": skipped,
            "total_tcx_colors": total_tcx
        }
        
    except Exception as e:
        db.rollback()
        logger.error(f"Error seeding TCX colors: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to seed TCX colors: {str(e)}")


# ==================== COUNTRIES ====================

@router.post("/countries", response_model=CountryResponse, status_code=status.HTTP_201_CREATED)
def create_country(data: CountryCreate, db: Session = Depends(get_db_settings)):
    """Create a new country"""
    try:
        existing = db.query(Country).filter(Country.country_id == data.country_id).first()
        if existing:
            raise HTTPException(status_code=400, detail="Country ID already exists")

        country = Country(**data.model_dump())
        db.add(country)
        db.commit()
        db.refresh(country)
        return country
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating country: {e}")
        raise HTTPException(status_code=500, detail="Failed to create country")


@router.get("/countries", response_model=List[CountryResponse])
def get_countries(skip: int = 0, limit: Optional[int] = None, is_active: Optional[bool] = None, db: Session = Depends(get_db_settings)):
    """Get all countries"""
    query = db.query(Country)
    if is_active is not None:
        query = query.filter(Country.is_active == is_active)
    return query.order_by(Country.country_name).offset(skip).limit(limit).all()


@router.get("/countries/{country_pk}", response_model=CountryResponse)
def get_country(country_pk: int, db: Session = Depends(get_db_settings)):
    """Get a specific country"""
    country = db.query(Country).filter(Country.id == country_pk).first()
    if not country:
        raise HTTPException(status_code=404, detail="Country not found")
    return country


@router.put("/countries/{country_pk}", response_model=CountryResponse)
def update_country(country_pk: int, data: CountryUpdate, db: Session = Depends(get_db_settings)):
    """Update a country"""
    try:
        country = db.query(Country).filter(Country.id == country_pk).first()
        if not country:
            raise HTTPException(status_code=404, detail="Country not found")

        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(country, key, value)

        db.commit()
        db.refresh(country)
        return country
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating country: {e}")
        raise HTTPException(status_code=500, detail="Failed to update country")


@router.delete("/countries/{country_pk}", status_code=status.HTTP_204_NO_CONTENT)
def delete_country(country_pk: int, db: Session = Depends(get_db_settings)):
    """Delete a country"""
    try:
        country = db.query(Country).filter(Country.id == country_pk).first()
        if not country:
            raise HTTPException(status_code=404, detail="Country not found")

        db.delete(country)
        db.commit()
        return None
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error deleting country: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete country")


# ==================== CITIES ====================

@router.post("/cities", response_model=CityResponse, status_code=status.HTTP_201_CREATED)
def create_city(data: CityCreate, db: Session = Depends(get_db_settings)):
    """Create a new city"""
    try:
        existing = db.query(City).filter(City.city_id == data.city_id).first()
        if existing:
            raise HTTPException(status_code=400, detail="City ID already exists")

        city = City(**data.model_dump())
        db.add(city)
        db.commit()
        db.refresh(city)
        return city
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating city: {e}")
        raise HTTPException(status_code=500, detail="Failed to create city")


@router.get("/cities", response_model=List[CityResponse])
def get_cities(skip: int = 0, limit: Optional[int] = None, country_id: Optional[int] = None, is_active: Optional[bool] = None, db: Session = Depends(get_db_settings)):
    """Get all cities"""
    query = db.query(City)
    if country_id:
        query = query.filter(City.country_id == country_id)
    if is_active is not None:
        query = query.filter(City.is_active == is_active)
    return query.order_by(City.city_name).offset(skip).limit(limit).all()


@router.get("/cities/{city_pk}", response_model=CityResponse)
def get_city(city_pk: int, db: Session = Depends(get_db_settings)):
    """Get a specific city"""
    city = db.query(City).filter(City.id == city_pk).first()
    if not city:
        raise HTTPException(status_code=404, detail="City not found")
    return city


@router.put("/cities/{city_pk}", response_model=CityResponse)
def update_city(city_pk: int, data: CityUpdate, db: Session = Depends(get_db_settings)):
    """Update a city"""
    try:
        city = db.query(City).filter(City.id == city_pk).first()
        if not city:
            raise HTTPException(status_code=404, detail="City not found")

        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(city, key, value)

        db.commit()
        db.refresh(city)
        return city
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating city: {e}")
        raise HTTPException(status_code=500, detail="Failed to update city")


@router.delete("/cities/{city_pk}", status_code=status.HTTP_204_NO_CONTENT)
def delete_city(city_pk: int, db: Session = Depends(get_db_settings)):
    """Delete a city"""
    try:
        city = db.query(City).filter(City.id == city_pk).first()
        if not city:
            raise HTTPException(status_code=404, detail="City not found")

        db.delete(city)
        db.commit()
        return None
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error deleting city: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete city")


# ==================== PORTS ====================

@router.post("/ports", response_model=PortResponse, status_code=status.HTTP_201_CREATED)
def create_port(data: PortCreate, db: Session = Depends(get_db_settings)):
    """Create a new port"""
    try:
        existing = db.query(Port).filter(Port.locode == data.locode).first()
        if existing:
            raise HTTPException(status_code=400, detail="Port LOCODE already exists")

        port = Port(**data.model_dump())
        db.add(port)
        db.commit()
        db.refresh(port)
        return port
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating port: {e}")
        raise HTTPException(status_code=500, detail="Failed to create port")


@router.get("/ports", response_model=List[PortResponse])
def get_ports(skip: int = 0, limit: Optional[int] = None, country_id: Optional[int] = None, is_active: Optional[bool] = None, db: Session = Depends(get_db_settings)):
    """Get all ports"""
    query = db.query(Port)
    if country_id:
        query = query.filter(Port.country_id == country_id)
    if is_active is not None:
        query = query.filter(Port.is_active == is_active)
    return query.order_by(Port.port_name).offset(skip).limit(limit).all()


@router.get("/ports/{port_id}", response_model=PortResponse)
def get_port(port_id: int, db: Session = Depends(get_db_settings)):
    """Get a specific port"""
    port = db.query(Port).filter(Port.id == port_id).first()
    if not port:
        raise HTTPException(status_code=404, detail="Port not found")
    return port


@router.put("/ports/{port_id}", response_model=PortResponse)
def update_port(port_id: int, data: PortUpdate, db: Session = Depends(get_db_settings)):
    """Update a port"""
    try:
        port = db.query(Port).filter(Port.id == port_id).first()
        if not port:
            raise HTTPException(status_code=404, detail="Port not found")

        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(port, key, value)

        db.commit()
        db.refresh(port)
        return port
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating port: {e}")
        raise HTTPException(status_code=500, detail="Failed to update port")


@router.delete("/ports/{port_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_port(port_id: int, db: Session = Depends(get_db_settings)):
    """Delete a port"""
    try:
        port = db.query(Port).filter(Port.id == port_id).first()
        if not port:
            raise HTTPException(status_code=404, detail="Port not found")

        db.delete(port)
        db.commit()
        return None
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error deleting port: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete port")


# ==================== WAREHOUSES ====================

@router.post("/warehouses", response_model=WarehouseResponse, status_code=status.HTTP_201_CREATED)
def create_warehouse(data: WarehouseCreate, db: Session = Depends(get_db_settings)):
    """Create a new warehouse"""
    try:
        existing = db.query(Warehouse).filter(Warehouse.warehouse_code == data.warehouse_code).first()
        if existing:
            raise HTTPException(status_code=400, detail="Warehouse code already exists")

        warehouse = Warehouse(**data.model_dump())
        db.add(warehouse)
        db.commit()
        db.refresh(warehouse)
        return warehouse
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating warehouse: {e}")
        raise HTTPException(status_code=500, detail="Failed to create warehouse")


@router.get("/warehouses", response_model=List[WarehouseResponse])
def get_warehouses(skip: int = 0, limit: Optional[int] = None, is_active: Optional[bool] = None, db: Session = Depends(get_db_settings)):
    """Get all warehouses"""
    query = db.query(Warehouse)
    if is_active is not None:
        query = query.filter(Warehouse.is_active == is_active)
    return query.order_by(Warehouse.warehouse_name).offset(skip).limit(limit).all()


@router.get("/warehouses/{warehouse_id}", response_model=WarehouseResponse)
def get_warehouse(warehouse_id: int, db: Session = Depends(get_db_settings)):
    """Get a specific warehouse"""
    warehouse = db.query(Warehouse).filter(Warehouse.id == warehouse_id).first()
    if not warehouse:
        raise HTTPException(status_code=404, detail="Warehouse not found")
    return warehouse


@router.put("/warehouses/{warehouse_id}", response_model=WarehouseResponse)
def update_warehouse(warehouse_id: int, data: WarehouseUpdate, db: Session = Depends(get_db_settings)):
    """Update a warehouse"""
    try:
        warehouse = db.query(Warehouse).filter(Warehouse.id == warehouse_id).first()
        if not warehouse:
            raise HTTPException(status_code=404, detail="Warehouse not found")

        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(warehouse, key, value)

        db.commit()
        db.refresh(warehouse)
        return warehouse
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating warehouse: {e}")
        raise HTTPException(status_code=500, detail="Failed to update warehouse")


@router.delete("/warehouses/{warehouse_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_warehouse(warehouse_id: int, db: Session = Depends(get_db_settings)):
    """Delete a warehouse"""
    try:
        warehouse = db.query(Warehouse).filter(Warehouse.id == warehouse_id).first()
        if not warehouse:
            raise HTTPException(status_code=404, detail="Warehouse not found")

        db.delete(warehouse)
        db.commit()
        return None
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error deleting warehouse: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete warehouse")


# ==================== DOCUMENT NUMBERING ====================

@router.post("/document-numbering", response_model=DocumentNumberingResponse, status_code=status.HTTP_201_CREATED)
def create_document_numbering(data: DocumentNumberingCreate, db: Session = Depends(get_db_settings)):
    """Create a new document numbering config"""
    try:
        existing = db.query(DocumentNumbering).filter(DocumentNumbering.document_type == data.document_type).first()
        if existing:
            raise HTTPException(status_code=400, detail="Document type already exists")

        doc_numbering = DocumentNumbering(**data.model_dump())
        db.add(doc_numbering)
        db.commit()
        db.refresh(doc_numbering)
        return doc_numbering
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating document numbering: {e}")
        raise HTTPException(status_code=500, detail="Failed to create document numbering")


@router.get("/document-numbering", response_model=List[DocumentNumberingResponse])
def get_document_numberings(skip: int = 0, limit: Optional[int] = None, is_active: Optional[bool] = None, db: Session = Depends(get_db_settings)):
    """Get all document numbering configs"""
    query = db.query(DocumentNumbering)
    if is_active is not None:
        query = query.filter(DocumentNumbering.is_active == is_active)
    return query.order_by(DocumentNumbering.document_type).offset(skip).limit(limit).all()


@router.get("/document-numbering/{doc_id}", response_model=DocumentNumberingResponse)
def get_document_numbering(doc_id: int, db: Session = Depends(get_db_settings)):
    """Get a specific document numbering config"""
    doc = db.query(DocumentNumbering).filter(DocumentNumbering.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document numbering not found")
    return doc


@router.put("/document-numbering/{doc_id}", response_model=DocumentNumberingResponse)
def update_document_numbering(doc_id: int, data: DocumentNumberingUpdate, db: Session = Depends(get_db_settings)):
    """Update a document numbering config"""
    try:
        doc = db.query(DocumentNumbering).filter(DocumentNumbering.id == doc_id).first()
        if not doc:
            raise HTTPException(status_code=404, detail="Document numbering not found")

        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(doc, key, value)

        db.commit()
        db.refresh(doc)
        return doc
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating document numbering: {e}")
        raise HTTPException(status_code=500, detail="Failed to update document numbering")


@router.delete("/document-numbering/{doc_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_document_numbering(doc_id: int, db: Session = Depends(get_db_settings)):
    """Delete a document numbering config"""
    try:
        doc = db.query(DocumentNumbering).filter(DocumentNumbering.id == doc_id).first()
        if not doc:
            raise HTTPException(status_code=404, detail="Document numbering not found")

        db.delete(doc)
        db.commit()
        return None
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error deleting document numbering: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete document numbering")


@router.get("/document-numbering/next")
def get_next_document_number(
    document_type: str,
    branch_id: Optional[int] = None,
    db: Session = Depends(get_db_settings)
):
    """Get the next document number for a given document type"""
    try:
        query = db.query(DocumentNumbering).filter(
            DocumentNumbering.document_type == document_type,
            DocumentNumbering.is_active == True
        )

        if branch_id:
            query = query.filter(DocumentNumbering.branch_wise == True)

        doc = query.first()
        if not doc:
            raise HTTPException(status_code=404, detail=f"Document numbering not found for type: {document_type}")

        # Generate the next number
        next_num = doc.current_number + 1
        padded_num = str(next_num).zfill(doc.number_length or 5)

        # Build the formatted number
        formatted = ""
        if doc.prefix:
            formatted += doc.prefix
        formatted += padded_num
        if doc.suffix:
            formatted += doc.suffix

        return {
            "document_type": document_type,
            "next_number": next_num,
            "formatted_number": formatted,
            "sample_format": doc.sample_format
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting next document number: {e}")
        raise HTTPException(status_code=500, detail="Failed to get next document number")


# ==================== FISCAL YEARS ====================

@router.post("/fiscal-years", response_model=FiscalYearResponse, status_code=status.HTTP_201_CREATED)
def create_fiscal_year(data: FiscalYearCreate, db: Session = Depends(get_db_settings)):
    """Create a new fiscal year"""
    try:
        existing = db.query(FiscalYear).filter(FiscalYear.fiscal_year_code == data.fiscal_year_code).first()
        if existing:
            raise HTTPException(status_code=400, detail="Fiscal year code already exists")

        fiscal_year = FiscalYear(**data.model_dump())
        db.add(fiscal_year)
        db.commit()
        db.refresh(fiscal_year)
        return fiscal_year
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating fiscal year: {e}")
        raise HTTPException(status_code=500, detail="Failed to create fiscal year")


@router.get("/fiscal-years", response_model=List[FiscalYearResponse])
def get_fiscal_years(skip: int = 0, limit: Optional[int] = None, db: Session = Depends(get_db_settings)):
    """Get all fiscal years"""
    return db.query(FiscalYear).order_by(FiscalYear.start_date.desc()).offset(skip).limit(limit).all()


@router.get("/fiscal-years/{fy_id}", response_model=FiscalYearResponse)
def get_fiscal_year(fy_id: int, db: Session = Depends(get_db_settings)):
    """Get a specific fiscal year"""
    fy = db.query(FiscalYear).filter(FiscalYear.id == fy_id).first()
    if not fy:
        raise HTTPException(status_code=404, detail="Fiscal year not found")
    return fy


@router.put("/fiscal-years/{fy_id}", response_model=FiscalYearResponse)
def update_fiscal_year(fy_id: int, data: FiscalYearUpdate, db: Session = Depends(get_db_settings)):
    """Update a fiscal year"""
    try:
        fy = db.query(FiscalYear).filter(FiscalYear.id == fy_id).first()
        if not fy:
            raise HTTPException(status_code=404, detail="Fiscal year not found")

        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(fy, key, value)

        db.commit()
        db.refresh(fy)
        return fy
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating fiscal year: {e}")
        raise HTTPException(status_code=500, detail="Failed to update fiscal year")


@router.delete("/fiscal-years/{fy_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_fiscal_year(fy_id: int, db: Session = Depends(get_db_settings)):
    """Delete a fiscal year"""
    try:
        fy = db.query(FiscalYear).filter(FiscalYear.id == fy_id).first()
        if not fy:
            raise HTTPException(status_code=404, detail="Fiscal year not found")

        if fy.is_closed:
            raise HTTPException(status_code=400, detail="Cannot delete a closed fiscal year")

        db.delete(fy)
        db.commit()
        return None
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error deleting fiscal year: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete fiscal year")


# ==================== PER MINUTE VALUE ====================

@router.post("/per-minute-value", response_model=PerMinuteValueResponse, status_code=status.HTTP_201_CREATED)
def create_per_minute_value(data: PerMinuteValueCreate, db: Session = Depends(get_db_settings)):
    """Create a new per minute value"""
    try:
        # If setting as current, deactivate all other current values
        if data.is_current:
            db.query(PerMinuteValue).filter(PerMinuteValue.is_current == True).update({"is_current": False})

        pmv = PerMinuteValue(**data.model_dump())
        db.add(pmv)
        db.commit()
        db.refresh(pmv)
        return pmv
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating per minute value: {e}")
        raise HTTPException(status_code=500, detail="Failed to create per minute value")


@router.get("/per-minute-value", response_model=List[PerMinuteValueResponse])
def get_per_minute_values(skip: int = 0, limit: Optional[int] = None, db: Session = Depends(get_db_settings)):
    """Get all per minute values"""
    return db.query(PerMinuteValue).order_by(PerMinuteValue.effective_from.desc()).offset(skip).limit(limit).all()


@router.get("/per-minute-value/current", response_model=PerMinuteValueResponse)
def get_current_per_minute_value(db: Session = Depends(get_db_settings)):
    """Get the current per minute value"""
    pmv = db.query(PerMinuteValue).filter(PerMinuteValue.is_current == True).first()
    if not pmv:
        raise HTTPException(status_code=404, detail="No current per minute value set")
    return pmv


@router.get("/per-minute-value/{pmv_id}", response_model=PerMinuteValueResponse)
def get_per_minute_value(pmv_id: int, db: Session = Depends(get_db_settings)):
    """Get a specific per minute value"""
    pmv = db.query(PerMinuteValue).filter(PerMinuteValue.id == pmv_id).first()
    if not pmv:
        raise HTTPException(status_code=404, detail="Per minute value not found")
    return pmv


@router.put("/per-minute-value/{pmv_id}", response_model=PerMinuteValueResponse)
def update_per_minute_value(pmv_id: int, data: PerMinuteValueUpdate, db: Session = Depends(get_db_settings)):
    """Update a per minute value"""
    try:
        pmv = db.query(PerMinuteValue).filter(PerMinuteValue.id == pmv_id).first()
        if not pmv:
            raise HTTPException(status_code=404, detail="Per minute value not found")

        update_data = data.model_dump(exclude_unset=True)

        # If setting as current, deactivate all other current values
        if update_data.get("is_current") == True:
            db.query(PerMinuteValue).filter(
                PerMinuteValue.is_current == True,
                PerMinuteValue.id != pmv_id
            ).update({"is_current": False})

        for key, value in update_data.items():
            setattr(pmv, key, value)

        db.commit()
        db.refresh(pmv)
        return pmv
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating per minute value: {e}")
        raise HTTPException(status_code=500, detail="Failed to update per minute value")


@router.delete("/per-minute-value/{pmv_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_per_minute_value(pmv_id: int, db: Session = Depends(get_db_settings)):
    """Delete a per minute value"""
    try:
        pmv = db.query(PerMinuteValue).filter(PerMinuteValue.id == pmv_id).first()
        if not pmv:
            raise HTTPException(status_code=404, detail="Per minute value not found")

        db.delete(pmv)
        db.commit()
        return None
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error deleting per minute value: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete per minute value")


# ==================== CHART OF ACCOUNTS ====================

@router.post("/chart-of-accounts", response_model=ChartOfAccountsResponse, status_code=status.HTTP_201_CREATED)
def create_chart_of_accounts(data: ChartOfAccountsCreate, db: Session = Depends(get_db_settings)):
    """Create a new chart of accounts entry"""
    try:
        existing = db.query(ChartOfAccounts).filter(ChartOfAccounts.account_code == data.account_code).first()
        if existing:
            raise HTTPException(status_code=400, detail="Account code already exists")

        account = ChartOfAccounts(**data.model_dump())
        db.add(account)
        db.commit()
        db.refresh(account)
        return account
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating chart of accounts: {e}")
        raise HTTPException(status_code=500, detail="Failed to create chart of accounts")


@router.get("/chart-of-accounts", response_model=List[ChartOfAccountsResponse])
def get_chart_of_accounts(skip: int = 0, limit: Optional[int] = None, account_type: Optional[str] = None, is_active: Optional[bool] = None, db: Session = Depends(get_db_settings)):
    """Get all chart of accounts entries"""
    query = db.query(ChartOfAccounts)
    if account_type:
        query = query.filter(ChartOfAccounts.account_type == account_type)
    if is_active is not None:
        query = query.filter(ChartOfAccounts.is_active == is_active)
    return query.order_by(ChartOfAccounts.account_code).offset(skip).limit(limit).all()


@router.get("/chart-of-accounts/{account_id}", response_model=ChartOfAccountsResponse)
def get_chart_of_account(account_id: int, db: Session = Depends(get_db_settings)):
    """Get a specific chart of accounts entry"""
    account = db.query(ChartOfAccounts).filter(ChartOfAccounts.id == account_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    return account


@router.put("/chart-of-accounts/{account_id}", response_model=ChartOfAccountsResponse)
def update_chart_of_accounts(account_id: int, data: ChartOfAccountsUpdate, db: Session = Depends(get_db_settings)):
    """Update a chart of accounts entry"""
    try:
        account = db.query(ChartOfAccounts).filter(ChartOfAccounts.id == account_id).first()
        if not account:
            raise HTTPException(status_code=404, detail="Account not found")

        if account.is_system_account:
            raise HTTPException(status_code=400, detail="Cannot modify system account")

        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(account, key, value)

        db.commit()
        db.refresh(account)
        return account
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating chart of accounts: {e}")
        raise HTTPException(status_code=500, detail="Failed to update chart of accounts")


@router.delete("/chart-of-accounts/{account_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_chart_of_accounts(account_id: int, db: Session = Depends(get_db_settings)):
    """Delete a chart of accounts entry"""
    try:
        account = db.query(ChartOfAccounts).filter(ChartOfAccounts.id == account_id).first()
        if not account:
            raise HTTPException(status_code=404, detail="Account not found")

        if account.is_system_account:
            raise HTTPException(status_code=400, detail="Cannot delete system account")

        db.delete(account)
        db.commit()
        return None
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error deleting chart of accounts: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete chart of accounts")


# ==================== SEED DATA ====================

@router.post("/seed", status_code=status.HTTP_201_CREATED)
def seed_settings_data(db: Session = Depends(get_db_settings)):
    """Seed initial data for settings module (colors, UoM, countries)"""
    from ..seed_data import (
        COLOR_FAMILIES, COLOR_VALUES, COLORS,
        UOM_CATEGORIES, COUNTRIES, CITIES, PORTS
    )

    results = {
        "color_families": 0,
        "color_values": 0,
        "colors": 0,
        "uom_categories": 0,
        "uom": 0,
        "countries": 0,
        "cities": 0,
        "ports": 0,
    }

    try:
        # Seed Color Families
        for cf_data in COLOR_FAMILIES:
            existing = db.query(ColorFamily).filter(ColorFamily.color_family == cf_data["color_family"]).first()
            if not existing:
                cf = ColorFamily(**cf_data)
                db.add(cf)
                results["color_families"] += 1
        db.commit()

        # Seed Color Values
        for cv_data in COLOR_VALUES:
            existing = db.query(ColorValue).filter(ColorValue.color_value_code == cv_data["color_value_code"]).first()
            if not existing:
                cv = ColorValue(**cv_data)
                db.add(cv)
                results["color_values"] += 1
        db.commit()

        # Seed Colors (need to map color_family name to ID)
        color_families = {cf.color_family: cf.id for cf in db.query(ColorFamily).all()}
        for c_data in COLORS:
            # Create a copy to avoid mutating the original seed data
            color_data = c_data.copy()
            family_name = color_data.pop("color_family")
            family_id = color_families.get(family_name)
            existing = db.query(Color).filter(Color.color == color_data["color"]).first()
            if not existing and family_id:
                c = Color(color_family_id=family_id, **color_data)
                db.add(c)
                results["colors"] += 1
        db.commit()

        # Seed UoM Categories and Units
        for cat_data in UOM_CATEGORIES:
            existing = db.query(UoMCategory).filter(UoMCategory.uom_category == cat_data["category"]).first()
            if not existing:
                cat = UoMCategory(
                    uom_category=cat_data["category"],
                    uom_id=cat_data.get("uom_id"),
                    uom_name=cat_data["category"],  # Use category name as uom_name (required field)
                    uom_description=cat_data.get("description"),
                    icon=cat_data.get("icon"),
                    industry_use=cat_data.get("industry_use"),
                    sort_order=cat_data.get("sort_order", 0)
                )
                db.add(cat)
                db.commit()
                db.refresh(cat)
                results["uom_categories"] += 1

                # Add units for this category
                for unit_data in cat_data["units"]:
                    uom = UoM(
                        category_id=cat.id,
                        name=unit_data["name"],
                        symbol=unit_data["symbol"],
                        factor=unit_data["factor"],
                        is_base=unit_data["is_base"],
                        display_name=unit_data.get("display_name"),
                        is_si_unit=unit_data.get("is_si_unit", False),
                        common_usage=unit_data.get("common_usage"),
                        decimal_places=unit_data.get("decimal_places", 2),
                        sort_order=unit_data.get("sort_order", 0)
                    )
                    db.add(uom)
                    results["uom"] += 1
                db.commit()
            else:
                # Category exists, update new fields if they're empty
                if not existing.icon and cat_data.get("icon"):
                    existing.icon = cat_data.get("icon")
                    existing.industry_use = cat_data.get("industry_use")
                    existing.sort_order = cat_data.get("sort_order", 0)
                    db.commit()

                # Check if units need to be added
                for unit_data in cat_data["units"]:
                    existing_unit = db.query(UoM).filter(
                        UoM.category_id == existing.id
                    ).filter(
                        UoM.symbol == unit_data["symbol"]
                    ).first()
                    if not existing_unit:
                        uom = UoM(
                            category_id=existing.id,
                            name=unit_data["name"],
                            symbol=unit_data["symbol"],
                            factor=unit_data["factor"],
                            is_base=unit_data["is_base"],
                            display_name=unit_data.get("display_name"),
                            is_si_unit=unit_data.get("is_si_unit", False),
                            common_usage=unit_data.get("common_usage"),
                            decimal_places=unit_data.get("decimal_places", 2),
                            sort_order=unit_data.get("sort_order", 0)
                        )
                        db.add(uom)
                        results["uom"] += 1
                    else:
                        # Update existing unit with new fields if they're empty
                        if not existing_unit.display_name and unit_data.get("display_name"):
                            existing_unit.display_name = unit_data.get("display_name")
                            existing_unit.is_si_unit = unit_data.get("is_si_unit", False)
                            existing_unit.common_usage = unit_data.get("common_usage")
                            existing_unit.decimal_places = unit_data.get("decimal_places", 2)
                            existing_unit.sort_order = unit_data.get("sort_order", 0)
                db.commit()

        # Seed Countries
        for country_data in COUNTRIES:
            existing = db.query(Country).filter(Country.country_id == country_data["country_id"]).first()
            if not existing:
                country = Country(**country_data)
                db.add(country)
                results["countries"] += 1
        db.commit()

        # Seed Cities (need to map country_id string to actual country ID)
        countries = {c.country_id: c.id for c in db.query(Country).all()}
        for city_data in CITIES:
            existing = db.query(City).filter(City.city_id == city_data["city_id"]).first()
            if not existing:
                country_pk = countries.get(city_data["country_id"])
                if country_pk:
                    city = City(
                        city_id=city_data["city_id"],
                        city_name=city_data["city_name"],
                        country_id=country_pk,
                        state_province=city_data.get("state_province")
                    )
                    db.add(city)
                    results["cities"] += 1
        db.commit()

        # Seed Ports
        cities = {c.city_id: c.id for c in db.query(City).all()}
        for port_data in PORTS:
            existing = db.query(Port).filter(Port.locode == port_data["locode"]).first()
            if not existing:
                country_pk = countries.get(port_data["country_id"])
                city_pk = cities.get(port_data.get("city_id")) if port_data.get("city_id") else None
                if country_pk:
                    port = Port(
                        locode=port_data["locode"],
                        port_name=port_data["port_name"],
                        country_id=country_pk,
                        city_id=city_pk,
                        function=port_data.get("function"),
                        status=port_data.get("status")
                    )
                    db.add(port)
                    results["ports"] += 1
        db.commit()

        logger.info(f"Seed data completed: {results}")
        return {"message": "Seed data completed successfully", "results": results}

    except Exception as e:
        db.rollback()
        logger.error(f"Error seeding data: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to seed data: {str(e)}")
