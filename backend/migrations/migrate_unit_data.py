"""
Migration Script: Migrate Unit Data

This script migrates plain text unit values (uom, weight_uom) to unit_id references
in the Unit Conversion System.

Affected tables:
- material_master: uom -> unit_id
- sample_required_materials: uom -> unit_id
- style_variant_materials: uom -> unit_id, weight_uom -> weight_unit_id

Requirements: 2.1, 2.3, 2.4, 2.5

Usage:
    python backend/migrations/migrate_unit_data.py
"""

import sys
import os
from pathlib import Path

# Add backend directory to path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from sqlalchemy import text
from core.database import SessionLocalSamples, SessionLocalUnits
from modules.materials.services.unit_mapping_service import get_unit_mapping_service
import logging
from datetime import datetime
from typing import Dict, List, Tuple, Optional

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class UnitDataMigration:
    """
    Handles migration of plain text unit values to unit_id references.
    """
    
    def __init__(self):
        self.db_samples = SessionLocalSamples()
        self.db_units = SessionLocalUnits()
        self.mapping_service = get_unit_mapping_service()
        
        # Statistics
        self.stats = {
            'material_master': {'total': 0, 'updated': 0, 'unmapped': 0, 'unmapped_units': []},
            'sample_required_materials': {'total': 0, 'updated': 0, 'unmapped': 0, 'unmapped_units': []},
            'style_variant_materials': {
                'total': 0,
                'unit_id_updated': 0,
                'weight_unit_id_updated': 0,
                'unit_id_unmapped': 0,
                'weight_unit_id_unmapped': 0,
                'unmapped_units': [],
                'unmapped_weight_units': []
            }
        }
    
    def __enter__(self):
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        """Close database sessions on exit."""
        self.db_samples.close()
        self.db_units.close()
    
    def get_distinct_units(self, table_name: str, column_name: str) -> List[str]:
        """
        Get all distinct unit values from a table column.
        
        Args:
            table_name: Name of the table
            column_name: Name of the column containing unit text
        
        Returns:
            List of distinct unit text values (excluding NULL and empty strings)
        """
        logger.info(f"Querying distinct {column_name} values from {table_name}...")
        
        query = text(f"""
            SELECT DISTINCT {column_name}
            FROM {table_name}
            WHERE {column_name} IS NOT NULL
            AND TRIM({column_name}) != ''
            ORDER BY {column_name}
        """)
        
        result = self.db_samples.execute(query)
        distinct_values = [row[0] for row in result]
        
        logger.info(f"Found {len(distinct_values)} distinct {column_name} values in {table_name}")
        return distinct_values
    
    def create_unit_mapping(self, unit_texts: List[str]) -> Dict[str, Optional[int]]:
        """
        Create mapping from plain text units to unit_id values.
        
        Args:
            unit_texts: List of plain text unit strings
        
        Returns:
            Dictionary mapping unit text -> unit_id (or None if unmapped)
        """
        logger.info(f"Creating unit mapping for {len(unit_texts)} distinct units...")
        
        # Use batch mapping for efficiency
        mapping = self.mapping_service.batch_map_texts_to_unit_ids(
            unit_texts,
            self.db_units
        )
        
        # Log mapping statistics
        mapped_count = sum(1 for unit_id in mapping.values() if unit_id is not None)
        unmapped_count = len(unit_texts) - mapped_count
        
        logger.info(f"Mapping complete: {mapped_count} mapped, {unmapped_count} unmapped")
        
        # Log unmapped units
        if unmapped_count > 0:
            unmapped_units = [text for text, unit_id in mapping.items() if unit_id is None]
            logger.warning(f"Unmapped units: {unmapped_units}")
        
        return mapping
    
    def migrate_material_master(self) -> None:
        """
        Migrate material_master table: uom -> unit_id
        """
        logger.info("=" * 80)
        logger.info("Migrating material_master table...")
        logger.info("=" * 80)
        
        # Get distinct uom values
        distinct_uoms = self.get_distinct_units('material_master', 'uom')
        
        if not distinct_uoms:
            logger.info("No uom values to migrate in material_master")
            return
        
        # Create mapping
        uom_mapping = self.create_unit_mapping(distinct_uoms)
        
        # Get total count
        count_query = text("SELECT COUNT(*) FROM material_master WHERE uom IS NOT NULL")
        total_count = self.db_samples.execute(count_query).scalar()
        self.stats['material_master']['total'] = total_count
        
        logger.info(f"Updating {total_count} records in material_master...")
        
        # Update records for each mapped unit
        updated_count = 0
        unmapped_units = []
        
        for uom_text, unit_id in uom_mapping.items():
            if unit_id is not None:
                # Update records with this uom value
                update_query = text("""
                    UPDATE material_master
                    SET unit_id = :unit_id
                    WHERE uom = :uom_text
                    AND unit_id IS NULL
                """)
                
                result = self.db_samples.execute(
                    update_query,
                    {'unit_id': unit_id, 'uom_text': uom_text}
                )
                
                rows_updated = result.rowcount
                updated_count += rows_updated
                
                logger.info(f"  Updated {rows_updated} records: '{uom_text}' -> unit_id={unit_id}")
            else:
                # Log unmapped unit with record details
                unmapped_units.append(uom_text)
                
                # Get sample records with this unmapped unit
                sample_query = text("""
                    SELECT id, material_name, uom
                    FROM material_master
                    WHERE uom = :uom_text
                    LIMIT 5
                """)
                
                sample_records = self.db_samples.execute(
                    sample_query,
                    {'uom_text': uom_text}
                ).fetchall()
                
                logger.warning(f"  Unmapped unit: '{uom_text}'")
                for record in sample_records:
                    logger.warning(f"    - Record ID {record[0]}: {record[1]} ({record[2]})")
        
        # Commit changes
        self.db_samples.commit()
        
        # Update statistics
        self.stats['material_master']['updated'] = updated_count
        self.stats['material_master']['unmapped'] = len(unmapped_units)
        self.stats['material_master']['unmapped_units'] = unmapped_units
        
        logger.info(f"material_master migration complete: {updated_count}/{total_count} records updated")
    
    def migrate_sample_required_materials(self) -> None:
        """
        Migrate sample_required_materials table: uom -> unit_id
        """
        logger.info("=" * 80)
        logger.info("Migrating sample_required_materials table...")
        logger.info("=" * 80)
        
        # Get distinct uom values
        distinct_uoms = self.get_distinct_units('sample_required_materials', 'uom')
        
        if not distinct_uoms:
            logger.info("No uom values to migrate in sample_required_materials")
            return
        
        # Create mapping
        uom_mapping = self.create_unit_mapping(distinct_uoms)
        
        # Get total count
        count_query = text("SELECT COUNT(*) FROM sample_required_materials WHERE uom IS NOT NULL")
        total_count = self.db_samples.execute(count_query).scalar()
        self.stats['sample_required_materials']['total'] = total_count
        
        logger.info(f"Updating {total_count} records in sample_required_materials...")
        
        # Update records for each mapped unit
        updated_count = 0
        unmapped_units = []
        
        for uom_text, unit_id in uom_mapping.items():
            if unit_id is not None:
                # Update records with this uom value
                update_query = text("""
                    UPDATE sample_required_materials
                    SET unit_id = :unit_id
                    WHERE uom = :uom_text
                    AND unit_id IS NULL
                """)
                
                result = self.db_samples.execute(
                    update_query,
                    {'unit_id': unit_id, 'uom_text': uom_text}
                )
                
                rows_updated = result.rowcount
                updated_count += rows_updated
                
                logger.info(f"  Updated {rows_updated} records: '{uom_text}' -> unit_id={unit_id}")
            else:
                # Log unmapped unit with record details
                unmapped_units.append(uom_text)
                
                # Get sample records with this unmapped unit
                sample_query = text("""
                    SELECT id, sample_request_id, product_name, required_quantity, uom
                    FROM sample_required_materials
                    WHERE uom = :uom_text
                    LIMIT 5
                """)
                
                sample_records = self.db_samples.execute(
                    sample_query,
                    {'uom_text': uom_text}
                ).fetchall()
                
                logger.warning(f"  Unmapped unit: '{uom_text}'")
                for record in sample_records:
                    logger.warning(f"    - Record ID {record[0]}, Sample {record[1]}: {record[2]} - {record[3]} {record[4]}")
        
        # Commit changes
        self.db_samples.commit()
        
        # Update statistics
        self.stats['sample_required_materials']['updated'] = updated_count
        self.stats['sample_required_materials']['unmapped'] = len(unmapped_units)
        self.stats['sample_required_materials']['unmapped_units'] = unmapped_units
        
        logger.info(f"sample_required_materials migration complete: {updated_count}/{total_count} records updated")
    
    def migrate_style_variant_materials(self) -> None:
        """
        Migrate style_variant_materials table: uom -> unit_id, weight_uom -> weight_unit_id
        """
        logger.info("=" * 80)
        logger.info("Migrating style_variant_materials table...")
        logger.info("=" * 80)
        
        # Get distinct uom values
        distinct_uoms = self.get_distinct_units('style_variant_materials', 'uom')
        distinct_weight_uoms = self.get_distinct_units('style_variant_materials', 'weight_uom')
        
        # Get total count
        count_query = text("SELECT COUNT(*) FROM style_variant_materials")
        total_count = self.db_samples.execute(count_query).scalar()
        self.stats['style_variant_materials']['total'] = total_count
        
        # Migrate uom -> unit_id
        if distinct_uoms:
            logger.info(f"Migrating uom field ({len(distinct_uoms)} distinct values)...")
            uom_mapping = self.create_unit_mapping(distinct_uoms)
            
            unit_id_updated = 0
            unmapped_units = []
            
            for uom_text, unit_id in uom_mapping.items():
                if unit_id is not None:
                    update_query = text("""
                        UPDATE style_variant_materials
                        SET unit_id = :unit_id
                        WHERE uom = :uom_text
                        AND unit_id IS NULL
                    """)
                    
                    result = self.db_samples.execute(
                        update_query,
                        {'unit_id': unit_id, 'uom_text': uom_text}
                    )
                    
                    rows_updated = result.rowcount
                    unit_id_updated += rows_updated
                    
                    logger.info(f"  Updated {rows_updated} records: uom '{uom_text}' -> unit_id={unit_id}")
                else:
                    unmapped_units.append(uom_text)
                    
                    # Get sample records
                    sample_query = text("""
                        SELECT id, style_variant_id, product_name, required_quantity, uom
                        FROM style_variant_materials
                        WHERE uom = :uom_text
                        LIMIT 5
                    """)
                    
                    sample_records = self.db_samples.execute(
                        sample_query,
                        {'uom_text': uom_text}
                    ).fetchall()
                    
                    logger.warning(f"  Unmapped uom: '{uom_text}'")
                    for record in sample_records:
                        logger.warning(f"    - Record ID {record[0]}, Variant {record[1]}: {record[2]} - {record[3]} {record[4]}")
            
            self.stats['style_variant_materials']['unit_id_updated'] = unit_id_updated
            self.stats['style_variant_materials']['unit_id_unmapped'] = len(unmapped_units)
            self.stats['style_variant_materials']['unmapped_units'] = unmapped_units
        
        # Migrate weight_uom -> weight_unit_id
        if distinct_weight_uoms:
            logger.info(f"Migrating weight_uom field ({len(distinct_weight_uoms)} distinct values)...")
            weight_uom_mapping = self.create_unit_mapping(distinct_weight_uoms)
            
            weight_unit_id_updated = 0
            unmapped_weight_units = []
            
            for weight_uom_text, unit_id in weight_uom_mapping.items():
                if unit_id is not None:
                    update_query = text("""
                        UPDATE style_variant_materials
                        SET weight_unit_id = :unit_id
                        WHERE weight_uom = :weight_uom_text
                        AND weight_unit_id IS NULL
                    """)
                    
                    result = self.db_samples.execute(
                        update_query,
                        {'unit_id': unit_id, 'weight_uom_text': weight_uom_text}
                    )
                    
                    rows_updated = result.rowcount
                    weight_unit_id_updated += rows_updated
                    
                    logger.info(f"  Updated {rows_updated} records: weight_uom '{weight_uom_text}' -> weight_unit_id={unit_id}")
                else:
                    unmapped_weight_units.append(weight_uom_text)
                    
                    # Get sample records
                    sample_query = text("""
                        SELECT id, style_variant_id, product_name, weight, weight_uom
                        FROM style_variant_materials
                        WHERE weight_uom = :weight_uom_text
                        LIMIT 5
                    """)
                    
                    sample_records = self.db_samples.execute(
                        sample_query,
                        {'weight_uom_text': weight_uom_text}
                    ).fetchall()
                    
                    logger.warning(f"  Unmapped weight_uom: '{weight_uom_text}'")
                    for record in sample_records:
                        logger.warning(f"    - Record ID {record[0]}, Variant {record[1]}: {record[2]} - {record[3]} {record[4]}")
            
            self.stats['style_variant_materials']['weight_unit_id_updated'] = weight_unit_id_updated
            self.stats['style_variant_materials']['weight_unit_id_unmapped'] = len(unmapped_weight_units)
            self.stats['style_variant_materials']['unmapped_weight_units'] = unmapped_weight_units
        
        # Commit changes
        self.db_samples.commit()
        
        logger.info(f"style_variant_materials migration complete:")
        logger.info(f"  - unit_id: {self.stats['style_variant_materials']['unit_id_updated']} records updated")
        logger.info(f"  - weight_unit_id: {self.stats['style_variant_materials']['weight_unit_id_updated']} records updated")
    
    def verify_migration(self) -> bool:
        """
        Verify that all records have non-null unit_id after migration.
        
        Returns:
            True if all records have unit_id, False otherwise
        """
        logger.info("=" * 80)
        logger.info("Verifying migration...")
        logger.info("=" * 80)
        
        all_valid = True
        
        # Check material_master
        null_count_query = text("""
            SELECT COUNT(*)
            FROM material_master
            WHERE uom IS NOT NULL
            AND unit_id IS NULL
        """)
        null_count = self.db_samples.execute(null_count_query).scalar()
        
        if null_count > 0:
            logger.error(f"material_master: {null_count} records still have NULL unit_id")
            all_valid = False
        else:
            logger.info("material_master: All records have valid unit_id ✓")
        
        # Check sample_required_materials
        null_count_query = text("""
            SELECT COUNT(*)
            FROM sample_required_materials
            WHERE uom IS NOT NULL
            AND unit_id IS NULL
        """)
        null_count = self.db_samples.execute(null_count_query).scalar()
        
        if null_count > 0:
            logger.error(f"sample_required_materials: {null_count} records still have NULL unit_id")
            all_valid = False
        else:
            logger.info("sample_required_materials: All records have valid unit_id ✓")
        
        # Check style_variant_materials (unit_id)
        null_count_query = text("""
            SELECT COUNT(*)
            FROM style_variant_materials
            WHERE uom IS NOT NULL
            AND unit_id IS NULL
        """)
        null_count = self.db_samples.execute(null_count_query).scalar()
        
        if null_count > 0:
            logger.error(f"style_variant_materials: {null_count} records still have NULL unit_id")
            all_valid = False
        else:
            logger.info("style_variant_materials: All records have valid unit_id ✓")
        
        # Check style_variant_materials (weight_unit_id)
        null_count_query = text("""
            SELECT COUNT(*)
            FROM style_variant_materials
            WHERE weight_uom IS NOT NULL
            AND weight_unit_id IS NULL
        """)
        null_count = self.db_samples.execute(null_count_query).scalar()
        
        if null_count > 0:
            logger.error(f"style_variant_materials: {null_count} records still have NULL weight_unit_id")
            all_valid = False
        else:
            logger.info("style_variant_materials: All records have valid weight_unit_id ✓")
        
        return all_valid
    
    def print_summary(self) -> None:
        """
        Print migration summary statistics.
        """
        logger.info("=" * 80)
        logger.info("MIGRATION SUMMARY")
        logger.info("=" * 80)
        
        # material_master
        mm_stats = self.stats['material_master']
        logger.info(f"\nmaterial_master:")
        logger.info(f"  Total records: {mm_stats['total']}")
        logger.info(f"  Updated: {mm_stats['updated']}")
        logger.info(f"  Unmapped: {mm_stats['unmapped']}")
        if mm_stats['unmapped_units']:
            logger.info(f"  Unmapped units: {mm_stats['unmapped_units']}")
        
        # sample_required_materials
        srm_stats = self.stats['sample_required_materials']
        logger.info(f"\nsample_required_materials:")
        logger.info(f"  Total records: {srm_stats['total']}")
        logger.info(f"  Updated: {srm_stats['updated']}")
        logger.info(f"  Unmapped: {srm_stats['unmapped']}")
        if srm_stats['unmapped_units']:
            logger.info(f"  Unmapped units: {srm_stats['unmapped_units']}")
        
        # style_variant_materials
        svm_stats = self.stats['style_variant_materials']
        logger.info(f"\nstyle_variant_materials:")
        logger.info(f"  Total records: {svm_stats['total']}")
        logger.info(f"  unit_id updated: {svm_stats['unit_id_updated']}")
        logger.info(f"  weight_unit_id updated: {svm_stats['weight_unit_id_updated']}")
        logger.info(f"  unit_id unmapped: {svm_stats['unit_id_unmapped']}")
        logger.info(f"  weight_unit_id unmapped: {svm_stats['weight_unit_id_unmapped']}")
        if svm_stats['unmapped_units']:
            logger.info(f"  Unmapped units: {svm_stats['unmapped_units']}")
        if svm_stats['unmapped_weight_units']:
            logger.info(f"  Unmapped weight units: {svm_stats['unmapped_weight_units']}")
        
        # Total
        total_updated = (
            mm_stats['updated'] +
            srm_stats['updated'] +
            svm_stats['unit_id_updated'] +
            svm_stats['weight_unit_id_updated']
        )
        total_unmapped = (
            mm_stats['unmapped'] +
            srm_stats['unmapped'] +
            svm_stats['unit_id_unmapped'] +
            svm_stats['weight_unit_id_unmapped']
        )
        
        logger.info(f"\nTOTAL:")
        logger.info(f"  Records updated: {total_updated}")
        logger.info(f"  Unmapped units: {total_unmapped}")
        
        logger.info("=" * 80)
    
    def run(self) -> bool:
        """
        Run the complete migration process.
        
        Returns:
            True if migration successful, False otherwise
        """
        try:
            logger.info("Starting unit data migration...")
            logger.info(f"Timestamp: {datetime.now().isoformat()}")
            
            # Migrate each table
            self.migrate_material_master()
            self.migrate_sample_required_materials()
            self.migrate_style_variant_materials()
            
            # Verify migration
            verification_passed = self.verify_migration()
            
            # Print summary
            self.print_summary()
            
            if verification_passed:
                logger.info("✓ Migration completed successfully!")
                return True
            else:
                logger.error("✗ Migration completed with errors - some records still have NULL unit_id")
                logger.error("Please review the unmapped units and manually correct them")
                return False
                
        except Exception as e:
            logger.error(f"Migration failed with error: {e}", exc_info=True)
            self.db_samples.rollback()
            return False


def main():
    """
    Main entry point for the migration script.
    """
    logger.info("=" * 80)
    logger.info("UNIT DATA MIGRATION SCRIPT")
    logger.info("=" * 80)
    
    # Run migration
    with UnitDataMigration() as migration:
        success = migration.run()
    
    # Exit with appropriate code
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
