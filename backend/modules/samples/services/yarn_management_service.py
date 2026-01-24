"""
Yarn Management Service for Sample Development
Handles yarn creation and management within sample development workflow
"""

from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
import logging
import json

from core.database import SessionLocalMerchandiser, SessionLocalSamples
from modules.merchandiser.models.merchandiser import YarnDetail
from modules.merchandiser.schemas.merchandiser import YarnDetailCreate, YarnCompositionDetail
from modules.samples.models.sample import SampleRequest

logger = logging.getLogger(__name__)


class YarnManagementServiceError(Exception):
    """Custom exception for yarn management service errors"""
    pass


class YarnManagementService:
    """
    Service for managing yarn creation and integration in sample development.
    
    This service handles:
    - Creating new yarns from sample development forms
    - Auto-generating yarn IDs
    - Updating sample request with yarn details
    - Managing yarn composition data
    """
    
    @staticmethod
    def generate_yarn_id(yarn_name: str, db_merchandiser: Session) -> str:
        """
        Generate unique yarn ID based on yarn name.
        
        Args:
            yarn_name: The yarn name to base the ID on
            db_merchandiser: Database session for merchandiser DB
            
        Returns:
            Unique yarn ID in format YARN_NAME_001
        """
        # Clean yarn name for ID generation
        base_name = yarn_name.upper().replace(" ", "_")[:10]
        
        counter = 1
        while True:
            yarn_id = f"{base_name}_{counter:03d}"
            existing = db_merchandiser.query(YarnDetail).filter(
                YarnDetail.yarn_id == yarn_id
            ).first()
            if not existing:
                return yarn_id
            counter += 1
    
    @staticmethod
    def create_yarn_from_sample(
        yarn_data: Dict[str, Any],
        sample_id: str,
        db_merchandiser: Session,
        db_samples: Session
    ) -> YarnDetail:
        """
        Create a new yarn from sample development form.
        
        Args:
            yarn_data: Dictionary containing yarn information
            sample_id: The sample ID this yarn is associated with
            db_merchandiser: Database session for merchandiser DB
            db_samples: Database session for samples DB
            
        Returns:
            Created YarnDetail instance
            
        Raises:
            YarnManagementServiceError: If yarn creation fails
        """
        try:
            # Auto-generate yarn_id if not provided
            if not yarn_data.get('yarn_id'):
                yarn_data['yarn_id'] = YarnManagementService.generate_yarn_id(
                    yarn_data['yarn_name'], db_merchandiser
                )
            
            # Process yarn composition details if provided
            if yarn_data.get('yarn_composition_details'):
                composition_details = yarn_data['yarn_composition_details']
                if isinstance(composition_details, list):
                    # Validate composition details
                    total_percentage = sum(item.get('percentage', 0) for item in composition_details)
                    if abs(total_percentage - 100.0) > 0.01:
                        raise YarnManagementServiceError(
                            f"Yarn composition percentages must total 100%, got {total_percentage}%"
                        )
                    
                    # Generate summary composition string
                    composition_summary = ", ".join([
                        f"{item['material']} {item['percentage']}%"
                        for item in composition_details
                    ])
                    yarn_data['yarn_composition'] = composition_summary
            
            # Create yarn detail
            yarn_create = YarnDetailCreate(**yarn_data)
            db_yarn = YarnDetail(**yarn_create.model_dump())
            
            db_merchandiser.add(db_yarn)
            db_merchandiser.commit()
            db_merchandiser.refresh(db_yarn)
            
            logger.info(f"Created yarn: {db_yarn.yarn_id} for sample: {sample_id}")
            
            # Update sample request with new yarn
            YarnManagementService.update_sample_yarn_info(
                sample_id, db_yarn, db_samples
            )
            
            return db_yarn
            
        except IntegrityError as e:
            db_merchandiser.rollback()
            logger.error(f"Yarn creation failed due to integrity error: {str(e)}")
            raise YarnManagementServiceError(f"Yarn ID already exists or constraint violation")
        except Exception as e:
            db_merchandiser.rollback()
            logger.error(f"Yarn creation failed: {str(e)}")
            raise YarnManagementServiceError(f"Failed to create yarn: {str(e)}")
    
    @staticmethod
    def update_sample_yarn_info(
        sample_id: str,
        yarn_detail: YarnDetail,
        db_samples: Session
    ):
        """
        Update sample request with yarn information.
        
        Args:
            sample_id: The sample ID to update
            yarn_detail: The yarn detail to add
            db_samples: Database session for samples DB
        """
        try:
            sample = db_samples.query(SampleRequest).filter(
                SampleRequest.sample_id == sample_id
            ).first()
            
            if not sample:
                logger.warning(f"Sample not found: {sample_id}")
                return
            
            # Update yarn_ids array (if the field exists)
            if hasattr(sample, 'yarn_ids'):
                current_yarn_ids = sample.yarn_ids or []
                if yarn_detail.yarn_id not in current_yarn_ids:
                    current_yarn_ids.append(yarn_detail.yarn_id)
                    sample.yarn_ids = current_yarn_ids
            
            # Update primary yarn_id (if the field exists)
            if hasattr(sample, 'yarn_id') and not sample.yarn_id:
                sample.yarn_id = yarn_detail.yarn_id
            
            # Update yarn details cache (if the field exists)
            if hasattr(sample, 'yarn_details'):
                yarn_cache = {
                    "yarn_id": yarn_detail.yarn_id,
                    "yarn_name": yarn_detail.yarn_name,
                    "yarn_composition": yarn_detail.yarn_composition,
                    "yarn_count": yarn_detail.yarn_count,
                    "count_system": yarn_detail.count_system,
                    "yarn_type": yarn_detail.yarn_type,
                    "color": yarn_detail.color,
                    "uom": yarn_detail.uom
                }
                
                current_yarn_details = sample.yarn_details or "[]"
                try:
                    yarn_details_list = json.loads(current_yarn_details) if isinstance(current_yarn_details, str) else current_yarn_details
                except:
                    yarn_details_list = []
                
                # Add or update yarn in cache
                existing_index = next(
                    (i for i, item in enumerate(yarn_details_list) 
                     if item.get('yarn_id') == yarn_detail.yarn_id), 
                    None
                )
                
                if existing_index is not None:
                    yarn_details_list[existing_index] = yarn_cache
                else:
                    yarn_details_list.append(yarn_cache)
                
                sample.yarn_details = json.dumps(yarn_details_list)
            
            # Update count field (if the field exists)
            if hasattr(sample, 'count') and hasattr(sample, 'yarn_id') and sample.yarn_id == yarn_detail.yarn_id:
                sample.count = yarn_detail.yarn_count
            
            db_samples.commit()
            logger.info(f"Updated sample {sample_id} with yarn {yarn_detail.yarn_id}")
            
        except Exception as e:
            db_samples.rollback()
            logger.error(f"Failed to update sample yarn info: {str(e)}")
            raise YarnManagementServiceError(f"Failed to update sample: {str(e)}")
    
    @staticmethod
    def get_yarns_for_sample(sample_id: str, db_samples: Session, db_merchandiser: Session) -> List[Dict[str, Any]]:
        """
        Get all yarns associated with a sample.
        
        Args:
            sample_id: The sample ID
            db_samples: Database session for samples DB
            db_merchandiser: Database session for merchandiser DB
            
        Returns:
            List of yarn details with full information
        """
        try:
            sample = db_samples.query(SampleRequest).filter(
                SampleRequest.sample_id == sample_id
            ).first()
            
            if not sample:
                return []
            
            # Try to get yarn_ids from sample if the field exists
            yarn_ids = []
            if hasattr(sample, 'yarn_ids') and sample.yarn_ids:
                yarn_ids = sample.yarn_ids
            elif hasattr(sample, 'yarn_id') and sample.yarn_id:
                yarn_ids = [sample.yarn_id]
            
            if not yarn_ids:
                return []
            
            yarns = []
            for yarn_id in yarn_ids:
                yarn_detail = db_merchandiser.query(YarnDetail).filter(
                    YarnDetail.yarn_id == yarn_id
                ).first()
                
                if yarn_detail:
                    yarn_dict = {
                        "id": yarn_detail.id,
                        "yarn_id": yarn_detail.yarn_id,
                        "yarn_name": yarn_detail.yarn_name,
                        "yarn_composition": yarn_detail.yarn_composition,
                        "yarn_composition_details": yarn_detail.yarn_composition_details,
                        "blend_ratio": yarn_detail.blend_ratio,
                        "yarn_count": yarn_detail.yarn_count,
                        "count_system": yarn_detail.count_system,
                        "yarn_type": yarn_detail.yarn_type,
                        "yarn_form": yarn_detail.yarn_form,
                        "tpi": yarn_detail.tpi,
                        "yarn_finish": yarn_detail.yarn_finish,
                        "color": yarn_detail.color,
                        "dye_type": yarn_detail.dye_type,
                        "uom": yarn_detail.uom,
                        "remarks": yarn_detail.remarks,
                        "created_at": yarn_detail.created_at,
                        "updated_at": yarn_detail.updated_at
                    }
                    yarns.append(yarn_dict)
            
            return yarns
            
        except Exception as e:
            logger.error(f"Failed to get yarns for sample {sample_id}: {str(e)}")
            return []
    
    @staticmethod
    def validate_yarn_composition(composition_details: List[Dict[str, Any]]) -> bool:
        """
        Validate yarn composition details.
        
        Args:
            composition_details: List of composition items with material and percentage
            
        Returns:
            True if valid, False otherwise
        """
        if not composition_details:
            return True
        
        try:
            total_percentage = sum(item.get('percentage', 0) for item in composition_details)
            return abs(total_percentage - 100.0) <= 0.01
        except:
            return False