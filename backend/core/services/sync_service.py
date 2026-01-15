"""
Shared synchronization service for syncing data between modules
Eliminates code duplication between merchandiser and samples modules
"""
from typing import Dict, Any, Optional, List
from sqlalchemy.orm import Session
from core.logging import setup_logging
from core.database import SessionLocalMerchandiser, SessionLocalSamples
from core.services.buyer_service import BuyerService

logger = setup_logging()


class SyncService:
    """Service for syncing data between SampleRequest and SamplePrimaryInfo"""
    
    @staticmethod
    def sync_sample_request_to_primary_info(
        sample_request_id: int,
        update_data: Dict[str, Any],
        samples_db: Session
    ) -> bool:
        """
        Sync SampleRequest updates to SamplePrimaryInfo in merchandiser database
        
        Args:
            sample_request_id: ID of the SampleRequest
            update_data: Dictionary of fields to update
            samples_db: Samples database session
            
        Returns:
            True if sync successful, False otherwise
        """
        try:
            from modules.samples.models.sample import SampleRequest
            from modules.merchandiser.models.merchandiser import SamplePrimaryInfo
            
            # Get the sample request
            request = samples_db.query(SampleRequest).filter(
                SampleRequest.id == sample_request_id
            ).first()
            
            if not request:
                logger.warning(f"SampleRequest {sample_request_id} not found for sync")
                return False
            
            # Open merchandiser database session
            merchandiser_db = SessionLocalMerchandiser()
            try:
                sample_primary = merchandiser_db.query(SamplePrimaryInfo).filter(
                    SamplePrimaryInfo.sample_id == request.sample_id
                ).first()
                
                if not sample_primary:
                    logger.info(f"No matching SamplePrimaryInfo found for sample_id {request.sample_id}")
                    return False
                
                # Sync buyer information
                if 'buyer_id' in update_data:
                    buyer_service = BuyerService()
                    buyer_name = None
                    try:
                        buyer_info = buyer_service.get_by_id(update_data['buyer_id'])
                        if buyer_info:
                            buyer_name = buyer_info.get("buyer_name")
                    except (KeyError, ValueError, AttributeError) as buyer_error:
                        logger.warning(f"Could not fetch buyer name for buyer_id {update_data['buyer_id']}: {buyer_error}")
                    
                    if buyer_name:
                        sample_primary.buyer_name = buyer_name
                    sample_primary.buyer_id = update_data['buyer_id']
                
                # Sync all other fields
                SyncService._sync_fields_to_primary_info(sample_primary, update_data, request)
                
                merchandiser_db.commit()
                logger.info(f"✅ Successfully synced SampleRequest {sample_request_id} to SamplePrimaryInfo")
                return True
                
            except Exception as commit_error:
                merchandiser_db.rollback()
                logger.error(f"Failed to commit sync to merchandiser: {commit_error}", exc_info=True)
                return False
            finally:
                merchandiser_db.close()
                
        except Exception as sync_error:
            logger.error(f"Error syncing SampleRequest to SamplePrimaryInfo: {sync_error}", exc_info=True)
            return False
    
    @staticmethod
    def sync_primary_info_to_sample_request(
        sample_primary_id: int,
        update_data: Dict[str, Any],
        merchandiser_db: Session
    ) -> bool:
        """
        Sync SamplePrimaryInfo updates to SampleRequest in samples database
        
        Args:
            sample_primary_id: ID of the SamplePrimaryInfo
            update_data: Dictionary of fields to update
            merchandiser_db: Merchandiser database session
            
        Returns:
            True if sync successful, False otherwise
        """
        try:
            from modules.merchandiser.models.merchandiser import SamplePrimaryInfo
            from modules.samples.models.sample import SampleRequest
            
            # Get the sample primary info
            sample_primary = merchandiser_db.query(SamplePrimaryInfo).filter(
                SamplePrimaryInfo.id == sample_primary_id
            ).first()
            
            if not sample_primary:
                logger.warning(f"SamplePrimaryInfo {sample_primary_id} not found for sync")
                return False
            
            # Open samples database session
            samples_db = SessionLocalSamples()
            try:
                sample_request = samples_db.query(SampleRequest).filter(
                    SampleRequest.sample_id == sample_primary.sample_id
                ).first()
                
                if not sample_request:
                    logger.info(f"No matching SampleRequest found for sample_id {sample_primary.sample_id}")
                    return False
                
                # Sync all fields
                SyncService._sync_fields_to_sample_request(sample_request, update_data, sample_primary)
                
                samples_db.commit()
                logger.info(f"✅ Successfully synced SamplePrimaryInfo {sample_primary_id} to SampleRequest")
                return True
                
            except Exception as commit_error:
                samples_db.rollback()
                logger.error(f"Failed to commit sync to samples: {commit_error}", exc_info=True)
                return False
            finally:
                samples_db.close()
                
        except Exception as sync_error:
            logger.error(f"Error syncing SamplePrimaryInfo to SampleRequest: {sync_error}", exc_info=True)
            return False
    
    @staticmethod
    def _sync_fields_to_primary_info(
        sample_primary: Any,
        update_data: Dict[str, Any],
        request: Any
    ) -> None:
        """Helper to sync fields from SampleRequest to SamplePrimaryInfo"""
        # Basic fields
        field_mappings = {
            'sample_name': 'sample_name',
            'item': 'item',
            'gauge': 'gauge',
            'sample_category': 'sample_category',
            'color_name': 'color_name',
            'size_name': 'size_name',
            'yarn_details': 'yarn_details',
            'trims_details': 'trims_details',
            'yarn_handover_date': 'yarn_handover_date',
            'trims_handover_date': 'trims_handover_date',
            'required_date': 'required_date',
            'request_pcs': 'request_pcs',
        }
        
        for update_key, primary_key in field_mappings.items():
            if update_key in update_data:
                setattr(sample_primary, primary_key, update_data[update_key])
        
        # Special handling for ply (int -> string)
        if 'ply' in update_data:
            sample_primary.ply = str(update_data['ply']) if update_data['ply'] is not None else None
        
        # Array fields
        if 'color_ids' in update_data:
            sample_primary.color_ids = update_data['color_ids']
            if update_data['color_ids'] and len(update_data['color_ids']) > 0:
                sample_primary.color_id = str(update_data['color_ids'][0])
        
        if 'size_ids' in update_data:
            sample_primary.size_ids = update_data['size_ids']
            if update_data['size_ids'] and len(update_data['size_ids']) > 0:
                sample_primary.size_id = update_data['size_ids'][0]
        
        if 'yarn_ids' in update_data:
            sample_primary.yarn_ids = update_data['yarn_ids']
            if update_data['yarn_ids'] and len(update_data['yarn_ids']) > 0:
                sample_primary.yarn_id = update_data['yarn_ids'][0]
        elif 'yarn_id' in update_data and 'yarn_ids' not in update_data:
            sample_primary.yarn_id = update_data['yarn_id']
            if update_data['yarn_id']:
                sample_primary.yarn_ids = [update_data['yarn_id']]
        
        if 'trims_ids' in update_data:
            sample_primary.trims_ids = update_data['trims_ids']
        
        # Decorative part (string -> JSON array)
        if 'decorative_part' in update_data:
            decorative_part = update_data['decorative_part']
            if isinstance(decorative_part, str):
                sample_primary.decorative_part = [
                    p.strip() for p in decorative_part.split(',') if p.strip()
                ] if decorative_part else None
            elif isinstance(decorative_part, list):
                sample_primary.decorative_part = decorative_part
            else:
                sample_primary.decorative_part = None
        
        # Additional instruction (string -> JSON array)
        if 'additional_instruction' in update_data:
            additional_instruction = update_data['additional_instruction']
            if isinstance(additional_instruction, str):
                lines = additional_instruction.split('\n')
                instructions = []
                for line in lines:
                    trimmed = line.strip()
                    if not trimmed:
                        continue
                    done = trimmed.startswith('✓')
                    instruction_text = trimmed[1:].strip() if done else trimmed
                    instructions.append({'instruction': instruction_text, 'done': done})
                sample_primary.additional_instruction = instructions if instructions else None
            elif isinstance(additional_instruction, list):
                sample_primary.additional_instruction = additional_instruction
            else:
                sample_primary.additional_instruction = None
        
        # Techpack files (separate fields -> JSON array)
        if 'techpack_url' in update_data or 'techpack_filename' in update_data:
            techpack_url = update_data.get('techpack_url') or request.techpack_url
            techpack_filename = update_data.get('techpack_filename') or request.techpack_filename
            if techpack_url or techpack_filename:
                sample_primary.techpack_files = [{
                    'url': techpack_url or '',
                    'filename': techpack_filename or '',
                    'type': 'file'
                }]
            else:
                sample_primary.techpack_files = None
    
    @staticmethod
    def _sync_fields_to_sample_request(
        sample_request: Any,
        update_data: Dict[str, Any],
        sample_primary: Any
    ) -> None:
        """Helper to sync fields from SamplePrimaryInfo to SampleRequest"""
        # Basic fields
        field_mappings = {
            'sample_name': 'sample_name',
            'item': 'item',
            'gauge': 'gauge',
            'sample_category': 'sample_category',
            'color_name': 'color_name',
            'size_name': 'size_name',
            'yarn_details': 'yarn_details',
            'trims_details': 'trims_details',
            'yarn_handover_date': 'yarn_handover_date',
            'trims_handover_date': 'trims_handover_date',
            'required_date': 'required_date',
            'request_pcs': 'request_pcs',
        }
        
        for primary_key, request_key in field_mappings.items():
            if primary_key in update_data:
                setattr(sample_request, request_key, update_data[primary_key])
        
        # Special handling for ply (string -> int)
        if 'ply' in update_data:
            try:
                sample_request.ply = int(update_data['ply']) if update_data['ply'] else None
            except (ValueError, TypeError):
                pass
        
        # Array fields
        if 'color_ids' in update_data:
            sample_request.color_ids = update_data['color_ids']
        
        if 'size_ids' in update_data:
            sample_request.size_ids = update_data['size_ids']
        
        if 'yarn_ids' in update_data:
            sample_request.yarn_ids = update_data['yarn_ids']
            if update_data['yarn_ids'] and len(update_data['yarn_ids']) > 0:
                sample_request.yarn_id = update_data['yarn_ids'][0]
        elif 'yarn_id' in update_data and 'yarn_ids' not in update_data:
            sample_request.yarn_id = update_data['yarn_id']
            if update_data['yarn_id']:
                sample_request.yarn_ids = [update_data['yarn_id']]
        
        if 'trims_ids' in update_data:
            sample_request.trims_ids = update_data['trims_ids']
        
        # Decorative part (JSON array -> string)
        if 'decorative_part' in update_data:
            decorative_part = update_data['decorative_part']
            if isinstance(decorative_part, list):
                sample_request.decorative_part = ", ".join(decorative_part) if decorative_part else None
            elif decorative_part is not None:
                sample_request.decorative_part = str(decorative_part)
            else:
                sample_request.decorative_part = None
        
        # Additional instruction (JSON array -> string)
        if 'additional_instruction' in update_data:
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
        
        # Techpack files (JSON array -> separate fields)
        if 'techpack_files' in update_data:
            techpack_files = update_data['techpack_files']
            if isinstance(techpack_files, list) and len(techpack_files) > 0:
                first_file = techpack_files[0]
                if isinstance(first_file, dict):
                    sample_request.techpack_url = first_file.get('url')
                    sample_request.techpack_filename = first_file.get('filename')
            else:
                sample_request.techpack_url = None
                sample_request.techpack_filename = None
