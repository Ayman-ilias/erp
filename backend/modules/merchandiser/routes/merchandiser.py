"""
Merchandiser Department Routes
Complete REST API endpoints for all merchandising operations
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional
from core.database import get_db_merchandiser
from modules.merchandiser.models.merchandiser import (
    YarnDetail, FabricDetail, TrimsDetail, AccessoriesDetail,
    FinishedGoodDetail, PackingGoodDetail, SizeChart,
    SamplePrimaryInfo, SampleTNAColorWise, SampleStatus,
    StyleCreation, StyleBasicInfo, StyleMaterialLink,
    StyleColor, StyleSize, StyleVariant, CMCalculation
)
from modules.merchandiser.schemas.merchandiser import (
    # Yarn schemas
    YarnDetailCreate, YarnDetailUpdate, YarnDetailResponse,
    # Fabric schemas
    FabricDetailCreate, FabricDetailUpdate, FabricDetailResponse,
    # Trims schemas
    TrimsDetailCreate, TrimsDetailUpdate, TrimsDetailResponse,
    # Accessories schemas
    AccessoriesDetailCreate, AccessoriesDetailUpdate, AccessoriesDetailResponse,
    # Finished Good schemas
    FinishedGoodDetailCreate, FinishedGoodDetailUpdate, FinishedGoodDetailResponse,
    # Packing Good schemas
    PackingGoodDetailCreate, PackingGoodDetailUpdate, PackingGoodDetailResponse,
    # Size Chart schemas
    SizeChartCreate, SizeChartUpdate, SizeChartResponse,
    # Sample schemas
    SamplePrimaryInfoCreate, SamplePrimaryInfoUpdate, SamplePrimaryInfoResponse,
    SampleTNAColorWiseCreate, SampleTNAColorWiseUpdate, SampleTNAColorWiseResponse,
    SampleStatusCreate, SampleStatusUpdate, SampleStatusResponse,
    # Style schemas
    StyleCreationCreate, StyleCreationUpdate, StyleCreationResponse,
    StyleBasicInfoCreate, StyleBasicInfoUpdate, StyleBasicInfoResponse,
    StyleMaterialLinkCreate, StyleMaterialLinkUpdate, StyleMaterialLinkResponse,
    StyleColorCreate, StyleColorUpdate, StyleColorResponse,
    StyleSizeCreate, StyleSizeUpdate, StyleSizeResponse,
    StyleVariantCreate, StyleVariantUpdate, StyleVariantResponse, StyleVariantAutoGenerate,
    # CM schemas
    CMCalculationCreate, CMCalculationUpdate, CMCalculationResponse,
)

router = APIRouter(tags=["Merchandiser"])


# ============================================================================
# ROOT MERCHANDISER ENDPOINT
# ============================================================================

@router.get("/")
async def merchandiser_root():
    """
    Merchandiser Module Root - Overview of all available endpoints
    """
    return {
        "message": "Merchandiser Department API",
        "version": "1.0.0",
        "available_endpoints": {
            "materials": {
                "yarn": "/merchandiser/yarn",
                "fabric": "/merchandiser/fabric",
                "trims": "/merchandiser/trims",
                "accessories": "/merchandiser/accessories",
                "finished_good": "/merchandiser/finished-good",
                "packing_good": "/merchandiser/packing-good",
            },
            "size_chart": "/merchandiser/size-chart",
            "samples": {
                "primary_info": "/merchandiser/sample-primary",
                "tna": "/merchandiser/sample-tna",
                "status": "/merchandiser/sample-status",
            },
            "styles": {
                "creation": "/merchandiser/style-creation",
                "basic_info": "/merchandiser/style-basic-info",
                "materials": "/merchandiser/style-material-link",
                "colors": "/merchandiser/style-color",
                "sizes": "/merchandiser/style-size",
                "variants": "/merchandiser/style-variant",
                "auto_generate_variants": "/merchandiser/style-variant/auto-generate",
            },
            "costing": {
                "cm_calculation": "/merchandiser/cm-calculation",
            },
        },
        "documentation": "/docs",
    }


# ============================================================================
# YARN DETAILS ROUTES
# ============================================================================

@router.post("/yarn", response_model=YarnDetailResponse, status_code=status.HTTP_201_CREATED)
async def create_yarn_detail(
    yarn: YarnDetailCreate,
    db: Session = Depends(get_db_merchandiser)
):
    """Create a new yarn detail"""
    # Check if yarn_id already exists
    existing = db.query(YarnDetail).filter(YarnDetail.yarn_id == yarn.yarn_id).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Yarn ID '{yarn.yarn_id}' already exists"
        )
    
    db_yarn = YarnDetail(**yarn.model_dump())
    db.add(db_yarn)
    db.commit()
    db.refresh(db_yarn)
    return db_yarn


@router.get("/yarn", response_model=List[YarnDetailResponse])
async def get_all_yarn_details(
    skip: int = 0,
    limit: Optional[int] = None,
    db: Session = Depends(get_db_merchandiser)
):
    """Get all yarn details"""
    yarns = db.query(YarnDetail).offset(skip).limit(limit).all()
    return yarns


@router.get("/yarn/{yarn_id}", response_model=YarnDetailResponse)
async def get_yarn_detail(
    yarn_id: str,
    db: Session = Depends(get_db_merchandiser)
):
    """Get a specific yarn detail by yarn_id"""
    yarn = db.query(YarnDetail).filter(YarnDetail.yarn_id == yarn_id).first()
    if not yarn:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Yarn ID '{yarn_id}' not found"
        )
    return yarn


@router.put("/yarn/{yarn_id}", response_model=YarnDetailResponse)
async def update_yarn_detail(
    yarn_id: str,
    yarn_update: YarnDetailUpdate,
    db: Session = Depends(get_db_merchandiser)
):
    """Update a yarn detail"""
    db_yarn = db.query(YarnDetail).filter(YarnDetail.yarn_id == yarn_id).first()
    if not db_yarn:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Yarn ID '{yarn_id}' not found"
        )
    
    update_data = yarn_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_yarn, field, value)
    
    db.commit()
    db.refresh(db_yarn)
    return db_yarn


@router.delete("/yarn/{yarn_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_yarn_detail(
    yarn_id: str,
    db: Session = Depends(get_db_merchandiser)
):
    """Delete a yarn detail"""
    db_yarn = db.query(YarnDetail).filter(YarnDetail.yarn_id == yarn_id).first()
    if not db_yarn:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Yarn ID '{yarn_id}' not found"
        )
    
    db.delete(db_yarn)
    db.commit()
    return None


# ============================================================================
# FABRIC DETAILS ROUTES
# ============================================================================

@router.post("/fabric", response_model=FabricDetailResponse, status_code=status.HTTP_201_CREATED)
async def create_fabric_detail(
    fabric: FabricDetailCreate,
    db: Session = Depends(get_db_merchandiser)
):
    """Create a new fabric detail"""
    existing = db.query(FabricDetail).filter(FabricDetail.fabric_id == fabric.fabric_id).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Fabric ID '{fabric.fabric_id}' already exists"
        )
    
    db_fabric = FabricDetail(**fabric.model_dump())
    db.add(db_fabric)
    db.commit()
    db.refresh(db_fabric)
    return db_fabric


@router.get("/fabric", response_model=List[FabricDetailResponse])
async def get_all_fabric_details(
    skip: int = 0,
    limit: Optional[int] = None,
    db: Session = Depends(get_db_merchandiser)
):
    """Get all fabric details"""
    fabrics = db.query(FabricDetail).offset(skip).limit(limit).all()
    return fabrics


@router.get("/fabric/{fabric_id}", response_model=FabricDetailResponse)
async def get_fabric_detail(
    fabric_id: str,
    db: Session = Depends(get_db_merchandiser)
):
    """Get a specific fabric detail"""
    fabric = db.query(FabricDetail).filter(FabricDetail.fabric_id == fabric_id).first()
    if not fabric:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Fabric ID '{fabric_id}' not found"
        )
    return fabric


@router.put("/fabric/{fabric_id}", response_model=FabricDetailResponse)
async def update_fabric_detail(
    fabric_id: str,
    fabric_update: FabricDetailUpdate,
    db: Session = Depends(get_db_merchandiser)
):
    """Update a fabric detail"""
    db_fabric = db.query(FabricDetail).filter(FabricDetail.fabric_id == fabric_id).first()
    if not db_fabric:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Fabric ID '{fabric_id}' not found"
        )
    
    update_data = fabric_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_fabric, field, value)
    
    db.commit()
    db.refresh(db_fabric)
    return db_fabric


@router.delete("/fabric/{fabric_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_fabric_detail(
    fabric_id: str,
    db: Session = Depends(get_db_merchandiser)
):
    """Delete a fabric detail"""
    db_fabric = db.query(FabricDetail).filter(FabricDetail.fabric_id == fabric_id).first()
    if not db_fabric:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Fabric ID '{fabric_id}' not found"
        )
    
    db.delete(db_fabric)
    db.commit()
    return None


# ============================================================================
# TRIMS DETAILS ROUTES
# ============================================================================

@router.post("/trims", response_model=TrimsDetailResponse, status_code=status.HTTP_201_CREATED)
async def create_trims_detail(
    trims: TrimsDetailCreate,
    db: Session = Depends(get_db_merchandiser)
):
    """Create a new trims detail"""
    existing = db.query(TrimsDetail).filter(TrimsDetail.product_id == trims.product_id).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Product ID '{trims.product_id}' already exists"
        )
    
    db_trims = TrimsDetail(**trims.model_dump())
    db.add(db_trims)
    db.commit()
    db.refresh(db_trims)
    return db_trims


@router.get("/trims", response_model=List[TrimsDetailResponse])
async def get_all_trims_details(
    skip: int = 0,
    limit: Optional[int] = None,
    db: Session = Depends(get_db_merchandiser)
):
    """Get all trims details"""
    query = db.query(TrimsDetail).order_by(desc(TrimsDetail.created_at))
    if limit:
        query = query.limit(limit)
    if skip:
        query = query.offset(skip)
    trims = query.all()
    return trims


@router.get("/trims/{product_id}", response_model=TrimsDetailResponse)
async def get_trims_detail(
    product_id: str,
    db: Session = Depends(get_db_merchandiser)
):
    """Get a specific trims detail"""
    trims = db.query(TrimsDetail).filter(TrimsDetail.product_id == product_id).first()
    if not trims:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product ID '{product_id}' not found"
        )
    return trims


@router.put("/trims/{product_id}", response_model=TrimsDetailResponse)
async def update_trims_detail(
    product_id: str,
    trims_update: TrimsDetailUpdate,
    db: Session = Depends(get_db_merchandiser)
):
    """Update a trims detail"""
    db_trims = db.query(TrimsDetail).filter(TrimsDetail.product_id == product_id).first()
    if not db_trims:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product ID '{product_id}' not found"
        )
    
    update_data = trims_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_trims, field, value)
    
    db.commit()
    db.refresh(db_trims)
    return db_trims


@router.delete("/trims/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_trims_detail(
    product_id: str,
    db: Session = Depends(get_db_merchandiser)
):
    """Delete a trims detail"""
    db_trims = db.query(TrimsDetail).filter(TrimsDetail.product_id == product_id).first()
    if not db_trims:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product ID '{product_id}' not found"
        )
    
    db.delete(db_trims)
    db.commit()
    return None


# ============================================================================
# ACCESSORIES DETAILS ROUTES
# ============================================================================

@router.post("/accessories", response_model=AccessoriesDetailResponse, status_code=status.HTTP_201_CREATED)
async def create_accessories_detail(
    accessories: AccessoriesDetailCreate,
    db: Session = Depends(get_db_merchandiser)
):
    """Create a new accessories detail"""
    existing = db.query(AccessoriesDetail).filter(AccessoriesDetail.product_id == accessories.product_id).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Product ID '{accessories.product_id}' already exists"
        )
    
    db_accessories = AccessoriesDetail(**accessories.model_dump())
    db.add(db_accessories)
    db.commit()
    db.refresh(db_accessories)
    return db_accessories


@router.get("/accessories", response_model=List[AccessoriesDetailResponse])
async def get_all_accessories_details(
    skip: int = 0,
    limit: Optional[int] = None,
    db: Session = Depends(get_db_merchandiser)
):
    """Get all accessories details"""
    query = db.query(AccessoriesDetail).order_by(desc(AccessoriesDetail.created_at))
    if limit:
        query = query.limit(limit)
    if skip:
        query = query.offset(skip)
    accessories = query.all()
    return accessories


@router.get("/accessories/{product_id}", response_model=AccessoriesDetailResponse)
async def get_accessories_detail(
    product_id: str,
    db: Session = Depends(get_db_merchandiser)
):
    """Get a specific accessories detail"""
    accessories = db.query(AccessoriesDetail).filter(AccessoriesDetail.product_id == product_id).first()
    if not accessories:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product ID '{product_id}' not found"
        )
    return accessories


@router.put("/accessories/{product_id}", response_model=AccessoriesDetailResponse)
async def update_accessories_detail(
    product_id: str,
    accessories_update: AccessoriesDetailUpdate,
    db: Session = Depends(get_db_merchandiser)
):
    """Update an accessories detail"""
    db_accessories = db.query(AccessoriesDetail).filter(AccessoriesDetail.product_id == product_id).first()
    if not db_accessories:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product ID '{product_id}' not found"
        )
    
    update_data = accessories_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_accessories, field, value)
    
    db.commit()
    db.refresh(db_accessories)
    return db_accessories


@router.delete("/accessories/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_accessories_detail(
    product_id: str,
    db: Session = Depends(get_db_merchandiser)
):
    """Delete an accessories detail"""
    db_accessories = db.query(AccessoriesDetail).filter(AccessoriesDetail.product_id == product_id).first()
    if not db_accessories:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product ID '{product_id}' not found"
        )
    
    db.delete(db_accessories)
    db.commit()
    return None


# ============================================================================
# FINISHED GOOD DETAILS ROUTES
# ============================================================================

@router.post("/finished-good", response_model=FinishedGoodDetailResponse, status_code=status.HTTP_201_CREATED)
async def create_finished_good_detail(
    finished_good: FinishedGoodDetailCreate,
    db: Session = Depends(get_db_merchandiser)
):
    """Create a new finished good detail"""
    existing = db.query(FinishedGoodDetail).filter(FinishedGoodDetail.product_id == finished_good.product_id).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Product ID '{finished_good.product_id}' already exists"
        )
    
    db_finished_good = FinishedGoodDetail(**finished_good.model_dump())
    db.add(db_finished_good)
    db.commit()
    db.refresh(db_finished_good)
    return db_finished_good


@router.get("/finished-good", response_model=List[FinishedGoodDetailResponse])
async def get_all_finished_good_details(
    skip: int = 0,
    limit: Optional[int] = None,
    db: Session = Depends(get_db_merchandiser)
):
    """Get all finished good details"""
    query = db.query(FinishedGoodDetail).order_by(desc(FinishedGoodDetail.created_at))
    if limit:
        query = query.limit(limit)
    if skip:
        query = query.offset(skip)
    finished_goods = query.all()
    return finished_goods


@router.get("/finished-good/{product_id}", response_model=FinishedGoodDetailResponse)
async def get_finished_good_detail(
    product_id: str,
    db: Session = Depends(get_db_merchandiser)
):
    """Get a specific finished good detail"""
    finished_good = db.query(FinishedGoodDetail).filter(FinishedGoodDetail.product_id == product_id).first()
    if not finished_good:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product ID '{product_id}' not found"
        )
    return finished_good


@router.put("/finished-good/{product_id}", response_model=FinishedGoodDetailResponse)
async def update_finished_good_detail(
    product_id: str,
    finished_good_update: FinishedGoodDetailUpdate,
    db: Session = Depends(get_db_merchandiser)
):
    """Update a finished good detail"""
    db_finished_good = db.query(FinishedGoodDetail).filter(FinishedGoodDetail.product_id == product_id).first()
    if not db_finished_good:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product ID '{product_id}' not found"
        )
    
    update_data = finished_good_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_finished_good, field, value)
    
    db.commit()
    db.refresh(db_finished_good)
    return db_finished_good


@router.delete("/finished-good/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_finished_good_detail(
    product_id: str,
    db: Session = Depends(get_db_merchandiser)
):
    """Delete a finished good detail"""
    db_finished_good = db.query(FinishedGoodDetail).filter(FinishedGoodDetail.product_id == product_id).first()
    if not db_finished_good:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product ID '{product_id}' not found"
        )
    
    db.delete(db_finished_good)
    db.commit()
    return None


# ============================================================================
# PACKING GOOD DETAILS ROUTES
# ============================================================================

@router.post("/packing-good", response_model=PackingGoodDetailResponse, status_code=status.HTTP_201_CREATED)
async def create_packing_good_detail(
    packing_good: PackingGoodDetailCreate,
    db: Session = Depends(get_db_merchandiser)
):
    """Create a new packing good detail"""
    existing = db.query(PackingGoodDetail).filter(PackingGoodDetail.product_id == packing_good.product_id).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Product ID '{packing_good.product_id}' already exists"
        )
    
    # Prepare data, ensuring carton dimensions are properly handled
    packing_data = packing_good.model_dump()
    
    # Convert carton dimensions to float or None
    for field in ['carton_length', 'carton_width', 'carton_height', 'carton_weight']:
        if field in packing_data and packing_data[field] is not None:
            try:
                packing_data[field] = float(packing_data[field]) if packing_data[field] != '' else None
            except (ValueError, TypeError):
                packing_data[field] = None
    
    db_packing_good = PackingGoodDetail(**packing_data)
    db.add(db_packing_good)
    db.commit()
    db.refresh(db_packing_good)
    return db_packing_good


@router.get("/packing-good", response_model=List[PackingGoodDetailResponse])
async def get_all_packing_good_details(
    skip: int = 0,
    limit: Optional[int] = None,
    db: Session = Depends(get_db_merchandiser)
):
    """Get all packing good details"""
    query = db.query(PackingGoodDetail).order_by(desc(PackingGoodDetail.created_at))
    if limit:
        query = query.limit(limit)
    if skip:
        query = query.offset(skip)
    packing_goods = query.all()
    return packing_goods


@router.get("/packing-good/{product_id}", response_model=PackingGoodDetailResponse)
async def get_packing_good_detail(
    product_id: str,
    db: Session = Depends(get_db_merchandiser)
):
    """Get a specific packing good detail"""
    packing_good = db.query(PackingGoodDetail).filter(PackingGoodDetail.product_id == product_id).first()
    if not packing_good:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product ID '{product_id}' not found"
        )
    return packing_good


@router.put("/packing-good/{product_id}", response_model=PackingGoodDetailResponse)
async def update_packing_good_detail(
    product_id: str,
    packing_good_update: PackingGoodDetailUpdate,
    db: Session = Depends(get_db_merchandiser)
):
    """Update a packing good detail"""
    db_packing_good = db.query(PackingGoodDetail).filter(PackingGoodDetail.product_id == product_id).first()
    if not db_packing_good:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product ID '{product_id}' not found"
        )
    
    update_data = packing_good_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_packing_good, field, value)
    
    db.commit()
    db.refresh(db_packing_good)
    return db_packing_good


@router.delete("/packing-good/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_packing_good_detail(
    product_id: str,
    db: Session = Depends(get_db_merchandiser)
):
    """Delete a packing good detail"""
    db_packing_good = db.query(PackingGoodDetail).filter(PackingGoodDetail.product_id == product_id).first()
    if not db_packing_good:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product ID '{product_id}' not found"
        )
    
    db.delete(db_packing_good)
    db.commit()
    return None


# ============================================================================
# SIZE CHART ROUTES
# ============================================================================

@router.post("/size-chart", response_model=SizeChartResponse, status_code=status.HTTP_201_CREATED)
async def create_size_chart(
    size_chart: SizeChartCreate,
    db: Session = Depends(get_db_merchandiser)
):
    """Create a new size chart"""
    existing = db.query(SizeChart).filter(SizeChart.size_id == size_chart.size_id).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Size ID '{size_chart.size_id}' already exists"
        )
    
    db_size_chart = SizeChart(**size_chart.model_dump())
    db.add(db_size_chart)
    db.commit()
    db.refresh(db_size_chart)
    return db_size_chart


@router.get("/size-chart", response_model=List[SizeChartResponse])
async def get_all_size_charts(
    skip: int = 0,
    limit: Optional[int] = None,
    db: Session = Depends(get_db_merchandiser)
):
    """Get all size charts"""
    size_charts = db.query(SizeChart).offset(skip).limit(limit).all()
    return size_charts


@router.get("/size-chart/{size_id}", response_model=SizeChartResponse)
async def get_size_chart(
    size_id: str,
    db: Session = Depends(get_db_merchandiser)
):
    """Get a specific size chart"""
    size_chart = db.query(SizeChart).filter(SizeChart.size_id == size_id).first()
    if not size_chart:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Size ID '{size_id}' not found"
        )
    return size_chart


@router.put("/size-chart/{size_id}", response_model=SizeChartResponse)
async def update_size_chart(
    size_id: str,
    size_chart_update: SizeChartUpdate,
    db: Session = Depends(get_db_merchandiser)
):
    """Update a size chart"""
    db_size_chart = db.query(SizeChart).filter(SizeChart.size_id == size_id).first()
    if not db_size_chart:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Size ID '{size_id}' not found"
        )
    
    update_data = size_chart_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_size_chart, field, value)
    
    db.commit()
    db.refresh(db_size_chart)
    return db_size_chart


@router.delete("/size-chart/{size_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_size_chart(
    size_id: str,
    db: Session = Depends(get_db_merchandiser)
):
    """Delete a size chart"""
    db_size_chart = db.query(SizeChart).filter(SizeChart.size_id == size_id).first()
    if not db_size_chart:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Size ID '{size_id}' not found"
        )
    
    db.delete(db_size_chart)
    db.commit()
    return None


# ============================================================================
# SAMPLE PRIMARY INFO ROUTES
# ============================================================================

@router.post("/sample-primary", response_model=SamplePrimaryInfoResponse, status_code=status.HTTP_201_CREATED)
async def create_sample_primary_info(
    sample_data: SamplePrimaryInfoCreate,
    db: Session = Depends(get_db_merchandiser)
):
    """Create a new sample request (merchandising creates sample requests that go to sample department)"""
    import re
    
    # Generate sample_id if not provided: SMP-Name-A001 format
    if not sample_data.sample_id:
        # Get sample name and format it (uppercase, remove special chars, max 20 chars)
        name_part = re.sub(r'[^A-Z0-9]', '', sample_data.sample_name.upper())[:20] or "SAMPLE"
        
        # Find the highest existing sample_id for this name pattern
        existing_samples = db.query(SamplePrimaryInfo).filter(
            SamplePrimaryInfo.sample_id.like(f"SMP-{name_part}-%")
        ).all()
        
        # Extract letter and number from existing IDs
        max_letter = 'A'
        max_num = 0
        for sample in existing_samples:
            match = re.match(rf'SMP-{re.escape(name_part)}-([A-Z])(\d{{3}})', sample.sample_id)
            if match:
                letter = match.group(1)
                num = int(match.group(2))
                if letter > max_letter or (letter == max_letter and num > max_num):
                    max_letter = letter
                    max_num = num
        
        # Increment
        if max_num >= 999:
            # Move to next letter
            max_letter = chr(ord(max_letter) + 1)
            max_num = 1
        else:
            max_num += 1
        
        sample_data.sample_id = f"SMP-{name_part}-{max_letter}{max_num:03d}"
    
    # Create the sample primary info
    db_sample = SamplePrimaryInfo(**sample_data.model_dump())
    db.add(db_sample)
    db.commit()
    db.refresh(db_sample)
    
    return db_sample


@router.post("/sample-primary/sync-to-samples", status_code=status.HTTP_200_OK)
async def sync_samples_to_samples_db(db: Session = Depends(get_db_merchandiser)):
    """Sync all existing SamplePrimaryInfo records to SampleRequest in samples database"""
    from core.database import SessionLocalSamples
    from modules.samples.models.sample import SampleRequest
    from core.services.buyer_service import BuyerService
    
    all_samples = db.query(SamplePrimaryInfo).all()
    synced_count = 0
    skipped_count = 0
    
    samples_db = SessionLocalSamples()
    try:
        buyer_service = BuyerService()
        for sample in all_samples:
            # Check if SampleRequest already exists
            existing_request = samples_db.query(SampleRequest).filter(
                SampleRequest.sample_id == sample.sample_id
            ).first()
            
            if existing_request:
                skipped_count += 1
                continue
            
            # Get buyer name
            buyer_name = None
            try:
                buyer_info = buyer_service.get_by_id(sample.buyer_id)
                if buyer_info:
                    buyer_name = buyer_info.get("buyer_name")
            except (KeyError, ValueError, AttributeError) as buyer_error:
                logger.warning(f"Could not fetch buyer name for buyer_id {sample.buyer_id}: {buyer_error}")
                pass
            
            import json
            
            # Handle yarn_ids - keep as JSON array (SampleRequest model supports JSON)
            yarn_ids_json = sample.yarn_ids
            if isinstance(yarn_ids_json, str):
                try:
                    yarn_ids_json = json.loads(yarn_ids_json)
                except (json.JSONDecodeError, TypeError):
                    yarn_ids_json = []
            # Also set yarn_id (first one) for backward compatibility
            yarn_id = yarn_ids_json[0] if yarn_ids_json and len(yarn_ids_json) > 0 else (sample.yarn_id or None)
            
            # Handle trims_ids - keep as JSON (SampleRequest model supports JSON)
            trims_ids_json = sample.trims_ids
            if isinstance(trims_ids_json, str):
                try:
                    trims_ids_json = json.loads(trims_ids_json)
                except (json.JSONDecodeError, TypeError):
                    trims_ids_json = []
            
            # Handle color_ids - keep as JSON array
            color_ids_json = sample.color_ids
            if isinstance(color_ids_json, str):
                try:
                    color_ids_json = json.loads(color_ids_json)
                except (json.JSONDecodeError, TypeError):
                    color_ids_json = []
            # Also set color_id (first one) for backward compatibility
            color_id = color_ids_json[0] if color_ids_json and len(color_ids_json) > 0 else (sample.color_id or None)
            
            # Handle size_ids - keep as JSON array
            size_ids_json = sample.size_ids
            if isinstance(size_ids_json, str):
                try:
                    size_ids_json = json.loads(size_ids_json)
                except (json.JSONDecodeError, TypeError):
                    size_ids_json = []
            # Also set size_id (first one) for backward compatibility
            size_id = size_ids_json[0] if size_ids_json and len(size_ids_json) > 0 else (sample.size_id or None)
            
            # Map ply (convert string to int if possible)
            ply_value = None
            if sample.ply:
                try:
                    ply_value = int(sample.ply)
                except (ValueError, TypeError):
                    pass
            
            # Handle decorative_part - keep as JSON array (SampleRequest model supports JSON)
            decorative_part_json = sample.decorative_part
            if isinstance(decorative_part_json, str):
                try:
                    decorative_part_json = json.loads(decorative_part_json)
                except (json.JSONDecodeError, TypeError):
                    # If not valid JSON, treat as comma-separated string
                    decorative_part_json = [s.strip() for s in decorative_part_json.split(',')] if decorative_part_json else []
            # Also create comma-separated string for backward compatibility (decorative_part is String in SampleRequest)
            decorative_part_str = ", ".join(decorative_part_json) if decorative_part_json and isinstance(decorative_part_json, list) else (str(decorative_part_json) if decorative_part_json else None)
            
            # additional_instruction: JSON array of objects -> newline-separated string
            additional_instruction_str = None
            if sample.additional_instruction:
                if isinstance(sample.additional_instruction, list):
                    instructions = []
                    for inst in sample.additional_instruction:
                        if isinstance(inst, dict):
                            instruction_text = inst.get('instruction', '')
                            done_marker = "✓" if inst.get('done', False) else ""
                            instructions.append(f"{done_marker} {instruction_text}".strip())
                        else:
                            instructions.append(str(inst))
                    additional_instruction_str = "\n".join(instructions) if instructions else None
                else:
                    additional_instruction_str = str(sample.additional_instruction)
            
            # techpack_files: JSON array -> use first file's url/filename
            techpack_url = None
            techpack_filename = None
            if sample.techpack_files:
                if isinstance(sample.techpack_files, list) and len(sample.techpack_files) > 0:
                    first_file = sample.techpack_files[0]
                    if isinstance(first_file, dict):
                        techpack_url = first_file.get('url')
                        techpack_filename = first_file.get('filename')
            
            # Build color_name and size_name from arrays if not set
            color_name_final = sample.color_name
            if not color_name_final and color_ids_json:
                # Try to get color names from color IDs (would need color service)
                color_name_final = None  # Will be set by frontend if needed
            
            size_name_final = sample.size_name
            if not size_name_final and size_ids_json:
                # Try to get size names from size IDs (would need size service)
                size_name_final = None  # Will be set by frontend if needed
            
            # Create SampleRequest with all matching fields
            sample_request = SampleRequest(
                sample_id=sample.sample_id,
                buyer_id=sample.buyer_id,
                buyer_name=buyer_name or sample.buyer_name,
                sample_name=sample.sample_name,
                item=sample.item,
                gauge=sample.gauge,
                ply=ply_value,
                sample_category=sample.sample_category,
                color_ids=color_ids_json,  # All color IDs
                color_name=color_name_final or sample.color_name,
                size_ids=size_ids_json,  # All size IDs
                size_name=size_name_final or sample.size_name,
                yarn_ids=yarn_ids_json,  # All yarn IDs
                yarn_id=yarn_id,  # First yarn ID for backward compatibility
                yarn_details=sample.yarn_details,
                trims_ids=trims_ids_json,
                trims_details=sample.trims_details,
                decorative_part=decorative_part_str,  # Comma-separated string (backward compatibility)
                decorative_details=None,  # Removed field
                yarn_handover_date=sample.yarn_handover_date,
                trims_handover_date=sample.trims_handover_date,
                required_date=sample.required_date,
                request_pcs=sample.request_pcs,
                additional_instruction=additional_instruction_str,  # Converted from JSON array to string
                techpack_url=techpack_url,  # From first techpack file
                techpack_filename=techpack_filename,  # From first techpack file
                current_status="Pending"
            )
            samples_db.add(sample_request)
            synced_count += 1
        
        samples_db.commit()
    finally:
        samples_db.close()
    
    return {
        "message": f"Sync completed: {synced_count} samples synced, {skipped_count} already existed"
    }


@router.get("/sample-primary", response_model=List[SamplePrimaryInfoResponse])
async def get_all_sample_primary_info(
    skip: int = 0,
    limit: Optional[int] = None,
    db: Session = Depends(get_db_merchandiser)
):
    """Get all sample primary info, sorted by created_at descending (newest first)"""
    try:
        samples = db.query(SamplePrimaryInfo).order_by(SamplePrimaryInfo.created_at.desc()).offset(skip).limit(limit).all()
        return samples or []
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Error fetching sample primary info: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch samples: {str(e)}"
        )


@router.get("/sample-primary/{sample_id}", response_model=SamplePrimaryInfoResponse)
async def get_sample_primary_info(
    sample_id: str,
    db: Session = Depends(get_db_merchandiser)
):
    """Get a specific sample primary info"""
    sample = db.query(SamplePrimaryInfo).filter(SamplePrimaryInfo.sample_id == sample_id).first()
    if not sample:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Sample ID '{sample_id}' not found"
        )
    return sample


@router.put("/sample-primary/{sample_id}", response_model=SamplePrimaryInfoResponse)
async def update_sample_primary_info(
    sample_id: str,
    sample_update: SamplePrimaryInfoUpdate,
    db: Session = Depends(get_db_merchandiser)
):
    """Update a sample primary info and sync changes to SampleRequest in samples database"""
    from core.database import SessionLocalSamples
    from modules.samples.models.sample import SampleRequest
    from core.services.buyer_service import BuyerService
    
    db_sample = db.query(SamplePrimaryInfo).filter(SamplePrimaryInfo.sample_id == sample_id).first()
    if not db_sample:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Sample ID '{sample_id}' not found"
        )
    
    update_data = sample_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_sample, field, value)
    
    db.commit()
    db.refresh(db_sample)
    
    # Sync update to SampleRequest in samples database
    try:
        samples_db = SessionLocalSamples()
        try:
            sample_request = samples_db.query(SampleRequest).filter(
                SampleRequest.sample_id == sample_id
            ).first()
            
            if sample_request:
                # Get buyer name if buyer_id changed
                if 'buyer_id' in update_data:
                    buyer_service = BuyerService()
                    buyer_name = None
                    try:
                        buyer_info = buyer_service.get_by_id(update_data['buyer_id'])
                        if buyer_info:
                            buyer_name = buyer_info.get("buyer_name")
                    except (KeyError, ValueError, AttributeError) as buyer_error:
                        logger.warning(f"Could not fetch buyer name for buyer_id {update_data['buyer_id']}: {buyer_error}")
                        pass
                    if buyer_name:
                        sample_request.buyer_name = buyer_name
                    sample_request.buyer_id = update_data['buyer_id']
                
                # Update all matching fields
                if 'sample_name' in update_data:
                    sample_request.sample_name = update_data['sample_name']
                if 'item' in update_data:
                    sample_request.item = update_data['item']
                if 'gauge' in update_data:
                    sample_request.gauge = update_data['gauge']
                if 'ply' in update_data:
                    try:
                        sample_request.ply = int(update_data['ply']) if update_data['ply'] else None
                    except (ValueError, TypeError):
                        pass
                if 'sample_category' in update_data:
                    sample_request.sample_category = update_data['sample_category']
                if 'color_ids' in update_data:
                    # SamplePrimaryInfo has color_ids as JSON array, SampleRequest also has it as JSON
                    sample_request.color_ids = update_data['color_ids']
                    # Also set color_name if not provided
                    if 'color_name' not in update_data and update_data['color_ids']:
                        # Will be set by frontend if needed
                        pass
                if 'color_name' in update_data:
                    sample_request.color_name = update_data['color_name']
                if 'size_ids' in update_data:
                    # SamplePrimaryInfo has size_ids as JSON array, SampleRequest also has it as JSON
                    sample_request.size_ids = update_data['size_ids']
                    # Also set size_name if not provided
                    if 'size_name' not in update_data and update_data['size_ids']:
                        # Will be set by frontend if needed
                        pass
                if 'size_name' in update_data:
                    sample_request.size_name = update_data['size_name']
                if 'yarn_ids' in update_data:
                    # SamplePrimaryInfo has yarn_ids as JSON array, SampleRequest also has it as JSON
                    sample_request.yarn_ids = update_data['yarn_ids']
                    # Also set yarn_id (first one) for backward compatibility
                    yarn_id = update_data['yarn_ids'][0] if update_data['yarn_ids'] and len(update_data['yarn_ids']) > 0 else None
                    sample_request.yarn_id = yarn_id
                if 'yarn_id' in update_data:
                    sample_request.yarn_id = update_data['yarn_id']
                    # Also update yarn_ids array if yarn_id is set (but yarn_ids takes precedence)
                    if 'yarn_ids' not in update_data and update_data['yarn_id']:
                        sample_request.yarn_ids = [update_data['yarn_id']]
                if 'yarn_details' in update_data:
                    sample_request.yarn_details = update_data['yarn_details']
                if 'trims_ids' in update_data:
                    sample_request.trims_ids = update_data['trims_ids']
                if 'trims_details' in update_data:
                    sample_request.trims_details = update_data['trims_details']
                if 'decorative_part' in update_data:
                    # Convert JSON array to comma-separated string for samples database
                    decorative_part = update_data['decorative_part']
                    if isinstance(decorative_part, list):
                        sample_request.decorative_part = ", ".join(decorative_part) if decorative_part else None
                    elif decorative_part is not None:
                        sample_request.decorative_part = str(decorative_part)
                    else:
                        sample_request.decorative_part = None
                # decorative_details field removed
                if 'yarn_handover_date' in update_data:
                    sample_request.yarn_handover_date = update_data['yarn_handover_date']
                if 'trims_handover_date' in update_data:
                    sample_request.trims_handover_date = update_data['trims_handover_date']
                if 'required_date' in update_data:
                    sample_request.required_date = update_data['required_date']
                if 'request_pcs' in update_data:
                    sample_request.request_pcs = update_data['request_pcs']
                if 'additional_instruction' in update_data:
                    # Convert JSON array of objects to newline-separated string for samples database
                    additional_instruction = update_data['additional_instruction']
                    if isinstance(additional_instruction, list):
                        instructions = []
                        for inst in additional_instruction:
                            if isinstance(inst, dict):
                                instruction_text = inst.get('instruction', '')
                                done_marker = "✓" if inst.get('done', False) else ""
                                instructions.append(f"{done_marker} {instruction_text}".strip())
                            else:
                                instructions.append(str(inst))
                        sample_request.additional_instruction = "\n".join(instructions) if instructions else None
                    elif additional_instruction is not None:
                        sample_request.additional_instruction = str(additional_instruction)
                    else:
                        sample_request.additional_instruction = None
                if 'techpack_files' in update_data:
                    # Convert JSON array to first file's url/filename for samples database
                    techpack_files = update_data['techpack_files']
                    if isinstance(techpack_files, list) and len(techpack_files) > 0:
                        first_file = techpack_files[0]
                        if isinstance(first_file, dict):
                            sample_request.techpack_url = first_file.get('url')
                            sample_request.techpack_filename = first_file.get('filename')
                    else:
                        sample_request.techpack_url = None
                        sample_request.techpack_filename = None
                
                samples_db.commit()
        finally:
            samples_db.close()
    except Exception as e:
        # Log error but don't fail the merchandiser update
        import logging
        logger = logging.getLogger(__name__)
        logger.warning(f"Failed to sync sample update to samples database: {str(e)}")
    
    return db_sample


@router.delete("/sample-primary/{sample_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_sample_primary_info(
    sample_id: str,
    db: Session = Depends(get_db_merchandiser)
):
    """Delete a sample primary info"""
    db_sample = db.query(SamplePrimaryInfo).filter(SamplePrimaryInfo.sample_id == sample_id).first()
    if not db_sample:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Sample ID '{sample_id}' not found"
        )
    
    db.delete(db_sample)
    db.commit()
    return None


# ============================================================================
# SAMPLE TNA COLOR WISE ROUTES
# ============================================================================

@router.post("/sample-tna", response_model=SampleTNAColorWiseResponse, status_code=status.HTTP_201_CREATED)
async def create_sample_tna(
    sample_tna: SampleTNAColorWiseCreate,
    db: Session = Depends(get_db_merchandiser)
):
    """Create a new sample TNA"""
    db_sample_tna = SampleTNAColorWise(**sample_tna.model_dump())
    db.add(db_sample_tna)
    db.commit()
    db.refresh(db_sample_tna)
    return db_sample_tna


@router.get("/sample-tna", response_model=List[SampleTNAColorWiseResponse])
async def get_all_sample_tna(
    sample_id: Optional[str] = None,
    skip: int = 0,
    limit: Optional[int] = None,
    db: Session = Depends(get_db_merchandiser)
):
    """Get all sample TNA records, optionally filtered by sample_id"""
    query = db.query(SampleTNAColorWise)
    if sample_id:
        query = query.filter(SampleTNAColorWise.sample_id == sample_id)
    
    sample_tnas = query.offset(skip).limit(limit).all()
    return sample_tnas


@router.get("/sample-tna/{id}", response_model=SampleTNAColorWiseResponse)
async def get_sample_tna(
    id: int,
    db: Session = Depends(get_db_merchandiser)
):
    """Get a specific sample TNA"""
    sample_tna = db.query(SampleTNAColorWise).filter(SampleTNAColorWise.id == id).first()
    if not sample_tna:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Sample TNA ID '{id}' not found"
        )
    return sample_tna


@router.put("/sample-tna/{id}", response_model=SampleTNAColorWiseResponse)
async def update_sample_tna(
    id: int,
    sample_tna_update: SampleTNAColorWiseUpdate,
    db: Session = Depends(get_db_merchandiser)
):
    """Update a sample TNA"""
    db_sample_tna = db.query(SampleTNAColorWise).filter(SampleTNAColorWise.id == id).first()
    if not db_sample_tna:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Sample TNA ID '{id}' not found"
        )
    
    update_data = sample_tna_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_sample_tna, field, value)
    
    db.commit()
    db.refresh(db_sample_tna)
    return db_sample_tna


@router.delete("/sample-tna/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_sample_tna(
    id: int,
    db: Session = Depends(get_db_merchandiser)
):
    """Delete a sample TNA"""
    db_sample_tna = db.query(SampleTNAColorWise).filter(SampleTNAColorWise.id == id).first()
    if not db_sample_tna:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Sample TNA ID '{id}' not found"
        )
    
    db.delete(db_sample_tna)
    db.commit()
    return None


# ============================================================================
# SAMPLE STATUS ROUTES
# ============================================================================

# POST endpoint removed - Merchandiser cannot create new status records
# Status records are created by Sample Department
# Merchandiser can only update existing status records via PUT endpoint

@router.get("/sample-status", response_model=List[SampleStatusResponse])
async def get_all_sample_status(
    sample_id: Optional[str] = None,
    skip: int = 0,
    limit: Optional[int] = None,
    db: Session = Depends(get_db_merchandiser)
):
    """Get all sample status records from merchandiser database, with fallback to samples database"""
    from core.database import SessionLocalSamples
    from modules.samples.models.sample import SampleStatus as SamplesSampleStatus, SampleRequest
    from core.logging import setup_logging
    
    logger = setup_logging()
    
    # First, try to get from merchandiser database
    query = db.query(SampleStatus)
    if sample_id:
        query = query.filter(SampleStatus.sample_id == sample_id)
    
    sample_statuses = query.order_by(SampleStatus.created_at.desc()).offset(skip).limit(limit).all()
    
    # If no records found in merchandiser database, try to sync from samples database
    if not sample_statuses:
        logger.info(f"No sample status records found in merchandiser database. Checking samples database...")
        try:
            samples_db = SessionLocalSamples()
            try:
                # Get all status records from samples database
                samples_query = samples_db.query(SamplesSampleStatus)
                if sample_id:
                    # Find SampleRequest by sample_id to get sample_request_id
                    sample_request = samples_db.query(SampleRequest).filter(
                        SampleRequest.sample_id == sample_id
                    ).first()
                    if sample_request:
                        samples_query = samples_query.filter(
                            SamplesSampleStatus.sample_request_id == sample_request.id
                        )
                    else:
                        samples_query = samples_query.filter(False)  # No results
                
                samples_statuses = samples_query.order_by(SamplesSampleStatus.created_at.desc()).offset(skip).limit(limit).all()
                
                if samples_statuses:
                    logger.info(f"Found {len(samples_statuses)} status records in samples database. Syncing to merchandiser...")
                    # Sync each status record to merchandiser database
                    for samples_status in samples_statuses:
                        # Get the sample_id from SampleRequest
                        sample_request = samples_db.query(SampleRequest).filter(
                            SampleRequest.id == samples_status.sample_request_id
                        ).first()
                        
                        if sample_request:
                            # Check if already exists in merchandiser
                            existing = db.query(SampleStatus).filter(
                                SampleStatus.sample_id == sample_request.sample_id
                            ).order_by(SampleStatus.created_at.desc()).first()
                            
                            if not existing:
                                # Create in merchandiser database
                                new_status = SampleStatus(
                                    sample_id=sample_request.sample_id,
                                    status_by_sample=samples_status.status_by_sample,
                                    status_from_merchandiser=samples_status.status_from_merchandiser,
                                    notes=samples_status.notes,
                                    updated_by=samples_status.updated_by
                                )
                                db.add(new_status)
                                logger.info(f"Synced status record for sample_id {sample_request.sample_id} from samples to merchandiser")
                    
                    db.commit()
                    
                    # Re-query merchandiser database after sync
                    query = db.query(SampleStatus)
                    if sample_id:
                        query = query.filter(SampleStatus.sample_id == sample_id)
                    sample_statuses = query.order_by(SampleStatus.created_at.desc()).offset(skip).limit(limit).all()
                    logger.info(f"After sync, found {len(sample_statuses)} status records in merchandiser database")
            finally:
                samples_db.close()
        except Exception as sync_error:
            logger.error(f"Failed to sync from samples database: {str(sync_error)}", exc_info=True)
            # Continue and return what we have (empty list)
    
    return sample_statuses


@router.get("/sample-status/{id}", response_model=SampleStatusResponse)
async def get_sample_status(
    id: int,
    db: Session = Depends(get_db_merchandiser)
):
    """Get a specific sample status"""
    sample_status = db.query(SampleStatus).filter(SampleStatus.id == id).first()
    if not sample_status:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Sample Status ID '{id}' not found"
        )
    return sample_status


@router.put("/sample-status/{id}", response_model=SampleStatusResponse)
async def update_sample_status(
    id: int,
    sample_status_update: SampleStatusUpdate,
    db: Session = Depends(get_db_merchandiser)
):
    """Update a sample status and auto-sync to samples module"""
    from core.database import SessionLocalSamples
    from modules.samples.models.sample import SampleRequest, SampleStatus as SamplesSampleStatus
    from core.logging import setup_logging
    
    logger = setup_logging()
    
    try:
        logger.info(f"Received update request for sample status ID: {id}")
        logger.info(f"Update data: {sample_status_update.model_dump()}")
        
        db_sample_status = db.query(SampleStatus).filter(SampleStatus.id == id).first()
        if not db_sample_status:
            logger.error(f"Sample Status ID '{id}' not found")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Sample Status ID '{id}' not found"
            )
        
        # Store sample_id before update (in case it changes, though it shouldn't)
        sample_id = db_sample_status.sample_id
        logger.info(f"Updating sample status for sample_id: {sample_id}")
        
        # Update merchandiser status - only allow updating merchandiser-specific fields
        update_data = sample_status_update.model_dump(exclude_unset=True)
        logger.info(f"Update data (exclude_unset=True): {update_data}")
        
        # Merchandiser cannot change status_by_sample - only status_from_merchandiser, notes, updated_by
        allowed_fields = ['status_from_merchandiser', 'notes', 'updated_by']
        has_updates = False
        for field, value in update_data.items():
            if field in allowed_fields:
                # Convert empty strings to None for consistency
                if value == "":
                    value = None
                setattr(db_sample_status, field, value)
                has_updates = True
                logger.info(f"Setting {field} = {value}")
            elif field == 'status_by_sample':
                # Silently ignore attempts to change status_by_sample
                logger.warning(f"Attempt to change status_by_sample ignored for sample_id {sample_id}")
        
        if not has_updates:
            logger.warning(f"No valid fields to update for sample status ID {id}")
            # Still return the existing record
            db.refresh(db_sample_status)
            return db_sample_status
    
        try:
            db.commit()
            logger.info(f"Successfully committed update for sample status ID {id}")
            db.refresh(db_sample_status)
            logger.info(f"Refreshed sample status object: id={db_sample_status.id}, sample_id={db_sample_status.sample_id}")
        except Exception as commit_error:
            db.rollback()
            logger.error(f"Failed to commit sample status update in merchandiser database: {str(commit_error)}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to update sample status: {str(commit_error)}"
            )
        
        # Auto-sync to samples module
        try:
            samples_db = SessionLocalSamples()
            try:
                # Find the corresponding SampleRequest by sample_id
                sample_request = samples_db.query(SampleRequest).filter(
                    SampleRequest.sample_id == sample_id
                ).first()
                
                if sample_request:
                    # Find or create corresponding SampleStatus in samples module
                    # Try to find existing status record for this sample (get the most recent one)
                    existing_status = samples_db.query(SamplesSampleStatus).filter(
                        SamplesSampleStatus.sample_request_id == sample_request.id
                    ).order_by(SamplesSampleStatus.created_at.desc()).first()
                    
                    if existing_status:
                        # Update existing status record - update all fields that were provided
                        has_changes = False
                        if 'status_from_merchandiser' in update_data:
                            existing_status.status_from_merchandiser = update_data['status_from_merchandiser']
                            has_changes = True
                        if 'notes' in update_data:
                            existing_status.notes = update_data['notes']
                            has_changes = True
                        if 'updated_by' in update_data:
                            existing_status.updated_by = update_data['updated_by']
                            has_changes = True
                        if 'expecting_end_date' in update_data:
                            existing_status.expecting_end_date = update_data['expecting_end_date']
                            has_changes = True
                        
                        if has_changes:
                            try:
                                samples_db.commit()
                                samples_db.refresh(existing_status)
                                logger.info(f"Updated existing SampleStatus in samples module for sample_id {sample_id}")
                            except Exception as commit_error:
                                samples_db.rollback()
                                logger.error(f"Failed to commit status update in samples database: {str(commit_error)}", exc_info=True)
                                # Don't fail the request - merchandiser update succeeded
                        else:
                            logger.info(f"No changes to sync for sample_id {sample_id}")
                    else:
                        # Create new status record in samples module
                        new_status = SamplesSampleStatus(
                            sample_request_id=sample_request.id,
                            status_from_merchandiser=update_data.get('status_from_merchandiser'),
                            notes=update_data.get('notes'),
                            updated_by=update_data.get('updated_by')
                            # Note: expecting_end_date is set by samples department, not merchandiser
                        )
                        samples_db.add(new_status)
                        try:
                            samples_db.commit()
                            samples_db.refresh(new_status)
                            logger.info(f"Created new SampleStatus in samples module for sample_id {sample_id}")
                        except Exception as commit_error:
                            samples_db.rollback()
                            logger.error(f"Failed to create status in samples database: {str(commit_error)}", exc_info=True)
                            # Don't fail the request - merchandiser update succeeded
                    
                    # Update current_status on SampleRequest if status_from_merchandiser is set and not empty
                    if 'status_from_merchandiser' in update_data and update_data.get('status_from_merchandiser'):
                        sample_request.current_status = update_data['status_from_merchandiser']
                        try:
                            samples_db.commit()
                            logger.info(f"Updated SampleRequest.current_status to '{update_data['status_from_merchandiser']}' for sample_id {sample_id}")
                        except Exception as commit_error:
                            samples_db.rollback()
                            logger.error(f"Failed to update SampleRequest.current_status: {str(commit_error)}", exc_info=True)
                            # Don't fail the request - merchandiser update succeeded
                        
                    logger.info(f"✅ Successfully synced sample status update for sample_id {sample_id} to samples module")
                else:
                    logger.warning(f"SampleRequest not found for sample_id {sample_id} in samples database - sync skipped")
            finally:
                samples_db.close()
        except Exception as e:
            logger.error(f"Failed to sync sample status to samples module for sample_id {sample_id}: {str(e)}", exc_info=True)
            # Don't fail the request if sync fails - merchandiser update succeeded
        
        # Ensure the object is properly refreshed and all fields are accessible
        try:
            db.refresh(db_sample_status)
        except Exception as refresh_error:
            logger.warning(f"Failed to refresh sample status after update: {str(refresh_error)}", exc_info=True)
            # Continue anyway - the object should still be valid
        
        # Send notification to sample department
        try:
            from core.notification_service import send_notification_to_department
            send_notification_to_department(
                title="Sample Status Updated",
                message=f"Sample status for {sample_id} has been updated by Merchandising Department",
                target_department="sample_department",
                notification_type="info",
                related_entity_type="sample_status",
                related_entity_id=sample_id
            )
        except Exception as notif_error:
            logger.warning(f"Failed to send notification: {str(notif_error)}", exc_info=True)
            # Don't fail the request if notification fails
        
        # Return the updated status - FastAPI will handle serialization
        return db_sample_status
    
    except HTTPException:
        # Re-raise HTTP exceptions (like 404)
        raise
    except Exception as e:
        logger.error(f"Unexpected error in update_sample_status: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred: {str(e)}"
        )


@router.post("/sample-status/sync-from-samples", status_code=status.HTTP_200_OK)
async def sync_sample_status_from_samples(db: Session = Depends(get_db_merchandiser)):
    """Sync all sample status records from samples database to merchandiser database"""
    from core.database import SessionLocalSamples
    from modules.samples.models.sample import SampleStatus as SamplesSampleStatus, SampleRequest
    from core.logging import setup_logging
    
    logger = setup_logging()
    
    synced_count = 0
    updated_count = 0
    skipped_count = 0
    
    try:
        samples_db = SessionLocalSamples()
        try:
            # Get all status records from samples database
            samples_statuses = samples_db.query(SamplesSampleStatus).order_by(
                SamplesSampleStatus.created_at.desc()
            ).all()
            
            logger.info(f"Found {len(samples_statuses)} status records in samples database. Syncing to merchandiser...")
            
            for samples_status in samples_statuses:
                # Get the sample_id from SampleRequest
                sample_request = samples_db.query(SampleRequest).filter(
                    SampleRequest.id == samples_status.sample_request_id
                ).first()
                
                if sample_request:
                    # Check if already exists in merchandiser (by sample_id and created_at to match the record)
                    existing = db.query(SampleStatus).filter(
                        SampleStatus.sample_id == sample_request.sample_id
                    ).order_by(SampleStatus.created_at.desc()).first()
                    
                    if existing:
                        # Update existing record - always update status_by_sample from samples (merchandiser can't change it)
                        # Only update status_by_sample, notes, updated_by from samples
                        # Don't overwrite status_from_merchandiser (that comes from merchandiser)
                        needs_update = False
                        if existing.status_by_sample != samples_status.status_by_sample:
                            existing.status_by_sample = samples_status.status_by_sample
                            needs_update = True
                        if existing.notes != samples_status.notes:
                            existing.notes = samples_status.notes
                            needs_update = True
                        if samples_status.updated_by and existing.updated_by != samples_status.updated_by:
                            # Only update updated_by if it's from samples (when status_by_sample is set)
                            if samples_status.status_by_sample:
                                existing.updated_by = samples_status.updated_by
                                needs_update = True
                        
                        if needs_update:
                            try:
                                db.commit()
                                updated_count += 1
                                logger.info(f"Updated status record for sample_id {sample_request.sample_id}")
                            except Exception as commit_error:
                                db.rollback()
                                logger.error(f"Failed to commit status update for sample_id {sample_request.sample_id}: {str(commit_error)}", exc_info=True)
                                skipped_count += 1
                        else:
                            skipped_count += 1
                    else:
                        # Create new record in merchandiser database
                        new_status = SampleStatus(
                            sample_id=sample_request.sample_id,
                            status_by_sample=samples_status.status_by_sample,
                            status_from_merchandiser=samples_status.status_from_merchandiser,
                            notes=samples_status.notes,
                            updated_by=samples_status.updated_by
                        )
                        db.add(new_status)
                        synced_count += 1
                        logger.info(f"Synced status record for sample_id {sample_request.sample_id} from samples to merchandiser")
            
            db.commit()
            logger.info(f"Sync completed: {synced_count} created, {updated_count} updated, {skipped_count} skipped")
        finally:
            samples_db.close()
    except Exception as sync_error:
        db.rollback()
        logger.error(f"Failed to sync sample status from samples database: {str(sync_error)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to sync: {str(sync_error)}"
        )
    
    return {
        "message": f"Sync completed: {synced_count} created, {updated_count} updated, {skipped_count} skipped",
        "synced": synced_count,
        "updated": updated_count,
        "skipped": skipped_count
    }


@router.delete("/sample-status/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_sample_status(
    id: int,
    db: Session = Depends(get_db_merchandiser)
):
    """Delete a sample status"""
    db_sample_status = db.query(SampleStatus).filter(SampleStatus.id == id).first()
    if not db_sample_status:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Sample Status ID '{id}' not found"
        )
    
    db.delete(db_sample_status)
    db.commit()
    return None


# ============================================================================
# STYLE CREATION ROUTES
# ============================================================================

@router.post("/style-creation", response_model=StyleCreationResponse, status_code=status.HTTP_201_CREATED)
async def create_style(
    style: StyleCreationCreate,
    db: Session = Depends(get_db_merchandiser)
):
    """Create a new style from sample"""
    existing = db.query(StyleCreation).filter(StyleCreation.style_id == style.style_id).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Style ID '{style.style_id}' already exists"
        )
    
    db_style = StyleCreation(**style.model_dump())
    db.add(db_style)
    db.commit()
    db.refresh(db_style)
    return db_style


@router.get("/style-creation", response_model=List[StyleCreationResponse])
async def get_all_styles(
    skip: int = 0,
    limit: Optional[int] = None,
    db: Session = Depends(get_db_merchandiser)
):
    """Get all style creations"""
    styles = db.query(StyleCreation).offset(skip).limit(limit).all()
    return styles


@router.get("/style-creation/{style_id}", response_model=StyleCreationResponse)
async def get_style(
    style_id: str,
    db: Session = Depends(get_db_merchandiser)
):
    """Get a specific style"""
    style = db.query(StyleCreation).filter(StyleCreation.style_id == style_id).first()
    if not style:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Style ID '{style_id}' not found"
        )
    return style


@router.put("/style-creation/{style_id}", response_model=StyleCreationResponse)
async def update_style(
    style_id: str,
    style_update: StyleCreationUpdate,
    db: Session = Depends(get_db_merchandiser)
):
    """Update a style"""
    db_style = db.query(StyleCreation).filter(StyleCreation.style_id == style_id).first()
    if not db_style:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Style ID '{style_id}' not found"
        )
    
    update_data = style_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_style, field, value)
    
    db.commit()
    db.refresh(db_style)
    return db_style


@router.delete("/style-creation/{style_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_style(
    style_id: str,
    db: Session = Depends(get_db_merchandiser)
):
    """Delete a style"""
    db_style = db.query(StyleCreation).filter(StyleCreation.style_id == style_id).first()
    if not db_style:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Style ID '{style_id}' not found"
        )
    
    db.delete(db_style)
    db.commit()
    return None


# ============================================================================
# STYLE BASIC INFO ROUTES
# ============================================================================

@router.post("/style-basic-info", response_model=StyleBasicInfoResponse, status_code=status.HTTP_201_CREATED)
async def create_style_basic_info(
    style_info: StyleBasicInfoCreate,
    db: Session = Depends(get_db_merchandiser)
):
    """Create style basic info"""
    existing = db.query(StyleBasicInfo).filter(StyleBasicInfo.style_id == style_info.style_id).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Style basic info for '{style_info.style_id}' already exists"
        )
    
    db_style_info = StyleBasicInfo(**style_info.model_dump())
    db.add(db_style_info)
    db.commit()
    db.refresh(db_style_info)
    return db_style_info


@router.get("/style-basic-info", response_model=List[StyleBasicInfoResponse])
async def get_all_style_basic_info(
    skip: int = 0,
    limit: Optional[int] = None,
    db: Session = Depends(get_db_merchandiser)
):
    """Get all style basic info"""
    style_infos = db.query(StyleBasicInfo).offset(skip).limit(limit).all()
    return style_infos


@router.get("/style-basic-info/{style_id}", response_model=StyleBasicInfoResponse)
async def get_style_basic_info(
    style_id: str,
    db: Session = Depends(get_db_merchandiser)
):
    """Get style basic info"""
    style_info = db.query(StyleBasicInfo).filter(StyleBasicInfo.style_id == style_id).first()
    if not style_info:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Style basic info for '{style_id}' not found"
        )
    return style_info


@router.put("/style-basic-info/{style_id}", response_model=StyleBasicInfoResponse)
async def update_style_basic_info(
    style_id: str,
    style_info_update: StyleBasicInfoUpdate,
    db: Session = Depends(get_db_merchandiser)
):
    """Update style basic info"""
    db_style_info = db.query(StyleBasicInfo).filter(StyleBasicInfo.style_id == style_id).first()
    if not db_style_info:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Style basic info for '{style_id}' not found"
        )
    
    update_data = style_info_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_style_info, field, value)
    
    db.commit()
    db.refresh(db_style_info)
    return db_style_info


@router.delete("/style-basic-info/{style_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_style_basic_info(
    style_id: str,
    db: Session = Depends(get_db_merchandiser)
):
    """Delete style basic info"""
    db_style_info = db.query(StyleBasicInfo).filter(StyleBasicInfo.style_id == style_id).first()
    if not db_style_info:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Style basic info for '{style_id}' not found"
        )
    
    db.delete(db_style_info)
    db.commit()
    return None


# ============================================================================
# STYLE MATERIAL LINK ROUTES
# ============================================================================

@router.post("/style-material-link", response_model=StyleMaterialLinkResponse, status_code=status.HTTP_201_CREATED)
async def create_style_material_link(
    material_link: StyleMaterialLinkCreate,
    db: Session = Depends(get_db_merchandiser)
):
    """Link material to style"""
    existing = db.query(StyleMaterialLink).filter(
        StyleMaterialLink.style_material_id == material_link.style_material_id
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Style Material ID '{material_link.style_material_id}' already exists"
        )
    
    # Auto-calculate amount
    data = material_link.model_dump()
    if data.get('required_quantity') and data.get('price_per_unit'):
        data['amount'] = data['required_quantity'] * data['price_per_unit']
    
    db_material_link = StyleMaterialLink(**data)
    db.add(db_material_link)
    db.commit()
    db.refresh(db_material_link)
    return db_material_link


@router.get("/style-material-link", response_model=List[StyleMaterialLinkResponse])
async def get_all_style_material_links(
    style_id: Optional[str] = None,
    skip: int = 0,
    limit: Optional[int] = None,
    db: Session = Depends(get_db_merchandiser)
):
    """Get all style material links"""
    query = db.query(StyleMaterialLink)
    if style_id:
        query = query.filter(StyleMaterialLink.style_id == style_id)
    
    material_links = query.offset(skip).limit(limit).all()
    return material_links


@router.get("/style-material-link/{style_material_id}", response_model=StyleMaterialLinkResponse)
async def get_style_material_link(
    style_material_id: str,
    db: Session = Depends(get_db_merchandiser)
):
    """Get a specific style material link"""
    material_link = db.query(StyleMaterialLink).filter(
        StyleMaterialLink.style_material_id == style_material_id
    ).first()
    if not material_link:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Style Material ID '{style_material_id}' not found"
        )
    return material_link


@router.put("/style-material-link/{style_material_id}", response_model=StyleMaterialLinkResponse)
async def update_style_material_link(
    style_material_id: str,
    material_link_update: StyleMaterialLinkUpdate,
    db: Session = Depends(get_db_merchandiser)
):
    """Update style material link"""
    db_material_link = db.query(StyleMaterialLink).filter(
        StyleMaterialLink.style_material_id == style_material_id
    ).first()
    if not db_material_link:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Style Material ID '{style_material_id}' not found"
        )
    
    update_data = material_link_update.model_dump(exclude_unset=True)
    
    # Auto-calculate amount if quantity or price changes
    if 'required_quantity' in update_data or 'price_per_unit' in update_data:
        qty = update_data.get('required_quantity', db_material_link.required_quantity)
        price = update_data.get('price_per_unit', db_material_link.price_per_unit)
        if qty and price:
            update_data['amount'] = qty * price
    
    for field, value in update_data.items():
        setattr(db_material_link, field, value)
    
    db.commit()
    db.refresh(db_material_link)
    return db_material_link


@router.delete("/style-material-link/{style_material_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_style_material_link(
    style_material_id: str,
    db: Session = Depends(get_db_merchandiser)
):
    """Delete style material link"""
    db_material_link = db.query(StyleMaterialLink).filter(
        StyleMaterialLink.style_material_id == style_material_id
    ).first()
    if not db_material_link:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Style Material ID '{style_material_id}' not found"
        )
    
    db.delete(db_material_link)
    db.commit()
    return None


# ============================================================================
# STYLE COLOR ROUTES
# ============================================================================

@router.post("/style-color", response_model=StyleColorResponse, status_code=status.HTTP_201_CREATED)
async def create_style_color(
    style_color: StyleColorCreate,
    db: Session = Depends(get_db_merchandiser)
):
    """Add color to style"""
    db_style_color = StyleColor(**style_color.model_dump())
    db.add(db_style_color)
    db.commit()
    db.refresh(db_style_color)
    return db_style_color


@router.get("/style-color", response_model=List[StyleColorResponse])
async def get_all_style_colors(
    style_id: Optional[str] = None,
    skip: int = 0,
    limit: Optional[int] = None,
    db: Session = Depends(get_db_merchandiser)
):
    """Get all style colors"""
    query = db.query(StyleColor)
    if style_id:
        query = query.filter(StyleColor.style_id == style_id)
    
    style_colors = query.offset(skip).limit(limit).all()
    return style_colors


@router.get("/style-color/{id}", response_model=StyleColorResponse)
async def get_style_color(
    id: int,
    db: Session = Depends(get_db_merchandiser)
):
    """Get a specific style color"""
    style_color = db.query(StyleColor).filter(StyleColor.id == id).first()
    if not style_color:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Style Color ID '{id}' not found"
        )
    return style_color


@router.put("/style-color/{id}", response_model=StyleColorResponse)
async def update_style_color(
    id: int,
    style_color_update: StyleColorUpdate,
    db: Session = Depends(get_db_merchandiser)
):
    """Update style color"""
    db_style_color = db.query(StyleColor).filter(StyleColor.id == id).first()
    if not db_style_color:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Style Color ID '{id}' not found"
        )
    
    update_data = style_color_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_style_color, field, value)
    
    db.commit()
    db.refresh(db_style_color)
    return db_style_color


@router.delete("/style-color/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_style_color(
    id: int,
    db: Session = Depends(get_db_merchandiser)
):
    """Delete style color"""
    db_style_color = db.query(StyleColor).filter(StyleColor.id == id).first()
    if not db_style_color:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Style Color ID '{id}' not found"
        )
    
    db.delete(db_style_color)
    db.commit()
    return None


# ============================================================================
# STYLE SIZE ROUTES
# ============================================================================

@router.post("/style-size", response_model=StyleSizeResponse, status_code=status.HTTP_201_CREATED)
async def create_style_size(
    style_size: StyleSizeCreate,
    db: Session = Depends(get_db_merchandiser)
):
    """Add size to style"""
    db_style_size = StyleSize(**style_size.model_dump())
    db.add(db_style_size)
    db.commit()
    db.refresh(db_style_size)
    return db_style_size


@router.get("/style-size", response_model=List[StyleSizeResponse])
async def get_all_style_sizes(
    style_id: Optional[str] = None,
    skip: int = 0,
    limit: Optional[int] = None,
    db: Session = Depends(get_db_merchandiser)
):
    """Get all style sizes"""
    query = db.query(StyleSize)
    if style_id:
        query = query.filter(StyleSize.style_id == style_id)
    
    style_sizes = query.offset(skip).limit(limit).all()
    return style_sizes


@router.get("/style-size/{id}", response_model=StyleSizeResponse)
async def get_style_size(
    id: int,
    db: Session = Depends(get_db_merchandiser)
):
    """Get a specific style size"""
    style_size = db.query(StyleSize).filter(StyleSize.id == id).first()
    if not style_size:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Style Size ID '{id}' not found"
        )
    return style_size


@router.put("/style-size/{id}", response_model=StyleSizeResponse)
async def update_style_size(
    id: int,
    style_size_update: StyleSizeUpdate,
    db: Session = Depends(get_db_merchandiser)
):
    """Update style size"""
    db_style_size = db.query(StyleSize).filter(StyleSize.id == id).first()
    if not db_style_size:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Style Size ID '{id}' not found"
        )
    
    update_data = style_size_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_style_size, field, value)
    
    db.commit()
    db.refresh(db_style_size)
    return db_style_size


@router.delete("/style-size/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_style_size(
    id: int,
    db: Session = Depends(get_db_merchandiser)
):
    """Delete style size"""
    db_style_size = db.query(StyleSize).filter(StyleSize.id == id).first()
    if not db_style_size:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Style Size ID '{id}' not found"
        )
    
    db.delete(db_style_size)
    db.commit()
    return None


# ============================================================================
# STYLE VARIANT ROUTES (AUTO-GENERATION)
# ============================================================================

@router.post("/style-variant/auto-generate", response_model=List[StyleVariantResponse])
async def auto_generate_style_variants(
    request: StyleVariantAutoGenerate,
    db: Session = Depends(get_db_merchandiser)
):
    """
    Automatically generate style variants based on Colors × Sizes
    This creates all possible combinations
    """
    style_id = request.style_id
    
    # Get all colors for this style
    colors = db.query(StyleColor).filter(StyleColor.style_id == style_id).all()
    # Get all sizes for this style
    sizes = db.query(StyleSize).filter(StyleSize.style_id == style_id).all()
    
    if not colors:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"No colors found for style '{style_id}'. Add colors first."
        )
    
    if not sizes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"No sizes found for style '{style_id}'. Add sizes first."
        )
    
    # Generate all combinations
    variants = []
    for color in colors:
        for size in sizes:
            # Check if variant already exists
            existing = db.query(StyleVariant).filter(
                StyleVariant.style_id == style_id,
                StyleVariant.color_id == color.color_id,
                StyleVariant.size_id == size.size_id
            ).first()
            
            if not existing:
                # Generate unique variant ID
                style_variant_id = f"{style_id}-{color.color_id}-{size.size_id}"
                
                variant = StyleVariant(
                    style_variant_id=style_variant_id,
                    style_id=style_id,
                    color_id=color.color_id,
                    size_id=size.size_id,
                    color_name=color.color_name,
                    size_name=size.size_name,
                    variant_name=f"{color.color_name} / {size.size_name}",
                    is_active=True
                )
                db.add(variant)
                variants.append(variant)
    
    if variants:
        db.commit()
        for variant in variants:
            db.refresh(variant)
    
    return variants


@router.post("/style-variant", response_model=StyleVariantResponse, status_code=status.HTTP_201_CREATED)
async def create_style_variant(
    style_variant: StyleVariantCreate,
    db: Session = Depends(get_db_merchandiser)
):
    """Create a style variant manually"""
    existing = db.query(StyleVariant).filter(
        StyleVariant.style_variant_id == style_variant.style_variant_id
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Style Variant ID '{style_variant.style_variant_id}' already exists"
        )
    
    db_style_variant = StyleVariant(**style_variant.model_dump())
    db.add(db_style_variant)
    db.commit()
    db.refresh(db_style_variant)
    return db_style_variant


@router.get("/style-variant", response_model=List[StyleVariantResponse])
async def get_all_style_variants(
    style_id: Optional[str] = None,
    skip: int = 0,
    limit: Optional[int] = None,
    db: Session = Depends(get_db_merchandiser)
):
    """Get all style variants"""
    query = db.query(StyleVariant)
    if style_id:
        query = query.filter(StyleVariant.style_id == style_id)
    
    style_variants = query.offset(skip).limit(limit).all()
    return style_variants


@router.get("/style-variant/{style_variant_id}", response_model=StyleVariantResponse)
async def get_style_variant(
    style_variant_id: str,
    db: Session = Depends(get_db_merchandiser)
):
    """Get a specific style variant"""
    style_variant = db.query(StyleVariant).filter(
        StyleVariant.style_variant_id == style_variant_id
    ).first()
    if not style_variant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Style Variant ID '{style_variant_id}' not found"
        )
    return style_variant


@router.put("/style-variant/{style_variant_id}", response_model=StyleVariantResponse)
async def update_style_variant(
    style_variant_id: str,
    style_variant_update: StyleVariantUpdate,
    db: Session = Depends(get_db_merchandiser)
):
    """Update style variant (editable)"""
    db_style_variant = db.query(StyleVariant).filter(
        StyleVariant.style_variant_id == style_variant_id
    ).first()
    if not db_style_variant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Style Variant ID '{style_variant_id}' not found"
        )
    
    update_data = style_variant_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_style_variant, field, value)
    
    db.commit()
    db.refresh(db_style_variant)
    return db_style_variant


@router.delete("/style-variant/{style_variant_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_style_variant(
    style_variant_id: str,
    db: Session = Depends(get_db_merchandiser)
):
    """Delete style variant"""
    db_style_variant = db.query(StyleVariant).filter(
        StyleVariant.style_variant_id == style_variant_id
    ).first()
    if not db_style_variant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Style Variant ID '{style_variant_id}' not found"
        )
    
    db.delete(db_style_variant)
    db.commit()
    return None


# ============================================================================
# CM CALCULATION ROUTES
# ============================================================================

@router.post("/cm-calculation", response_model=CMCalculationResponse, status_code=status.HTTP_201_CREATED)
async def create_cm_calculation(
    cm_calc: CMCalculationCreate,
    db: Session = Depends(get_db_merchandiser)
):
    """Create CM calculation"""
    existing = db.query(CMCalculation).filter(CMCalculation.cm_id == cm_calc.cm_id).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"CM ID '{cm_calc.cm_id}' already exists"
        )
    
    # Auto-calculate production cost if SMV and per minute value provided
    data = cm_calc.model_dump()
    if data.get('average_knitting_minute') and data.get('per_minute_value'):
        data['production_cost'] = data['average_knitting_minute'] * data['per_minute_value']
    
    # Calculate total CM
    total_cm = 0.0
    if data.get('total_material_cost'):
        total_cm += data['total_material_cost']
    if data.get('production_cost'):
        total_cm += data['production_cost']
    if data.get('overhead_cost'):
        total_cm += data['overhead_cost']
    if data.get('testing_cost'):
        total_cm += data['testing_cost']
    if data.get('commercial_cost'):
        total_cm += data['commercial_cost']
    
    data['total_cm'] = total_cm
    
    db_cm_calc = CMCalculation(**data)
    db.add(db_cm_calc)
    db.commit()
    db.refresh(db_cm_calc)
    return db_cm_calc


@router.get("/cm-calculation", response_model=List[CMCalculationResponse])
async def get_all_cm_calculations(
    style_id: Optional[str] = None,
    skip: int = 0,
    limit: Optional[int] = None,
    db: Session = Depends(get_db_merchandiser)
):
    """Get all CM calculations"""
    query = db.query(CMCalculation)
    if style_id:
        query = query.filter(CMCalculation.style_id == style_id)
    
    cm_calcs = query.offset(skip).limit(limit).all()
    return cm_calcs


@router.get("/cm-calculation/{cm_id}", response_model=CMCalculationResponse)
async def get_cm_calculation(
    cm_id: str,
    db: Session = Depends(get_db_merchandiser)
):
    """Get a specific CM calculation"""
    cm_calc = db.query(CMCalculation).filter(CMCalculation.cm_id == cm_id).first()
    if not cm_calc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"CM ID '{cm_id}' not found"
        )
    return cm_calc


@router.put("/cm-calculation/{cm_id}", response_model=CMCalculationResponse)
async def update_cm_calculation(
    cm_id: str,
    cm_calc_update: CMCalculationUpdate,
    db: Session = Depends(get_db_merchandiser)
):
    """Update CM calculation"""
    db_cm_calc = db.query(CMCalculation).filter(CMCalculation.cm_id == cm_id).first()
    if not db_cm_calc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"CM ID '{cm_id}' not found"
        )
    
    update_data = cm_calc_update.model_dump(exclude_unset=True)
    
    # Recalculate production cost if SMV or per minute value changes
    if 'average_knitting_minute' in update_data or 'per_minute_value' in update_data:
        smv = update_data.get('average_knitting_minute', db_cm_calc.average_knitting_minute)
        pmv = update_data.get('per_minute_value', db_cm_calc.per_minute_value)
        if smv and pmv:
            update_data['production_cost'] = smv * pmv
    
    # Recalculate total CM
    total_cm = 0.0
    material_cost = update_data.get('total_material_cost', db_cm_calc.total_material_cost)
    production_cost = update_data.get('production_cost', db_cm_calc.production_cost)
    overhead = update_data.get('overhead_cost', db_cm_calc.overhead_cost)
    testing = update_data.get('testing_cost', db_cm_calc.testing_cost)
    commercial = update_data.get('commercial_cost', db_cm_calc.commercial_cost)
    
    if material_cost:
        total_cm += material_cost
    if production_cost:
        total_cm += production_cost
    if overhead:
        total_cm += overhead
    if testing:
        total_cm += testing
    if commercial:
        total_cm += commercial
    
    update_data['total_cm'] = total_cm
    
    for field, value in update_data.items():
        setattr(db_cm_calc, field, value)
    
    db.commit()
    db.refresh(db_cm_calc)
    return db_cm_calc


@router.delete("/cm-calculation/{cm_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_cm_calculation(
    cm_id: str,
    db: Session = Depends(get_db_merchandiser)
):
    """Delete CM calculation"""
    db_cm_calc = db.query(CMCalculation).filter(CMCalculation.cm_id == cm_id).first()
    if not db_cm_calc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"CM ID '{cm_id}' not found"
        )
    
    db.delete(db_cm_calc)
    db.commit()
    return None
