# Database Backup Documentation

## Backup Information

### Latest Backup: samples_backup_20260116_194641.dump

**Created**: January 16, 2026 at 19:46:41
**Database**: rmg_erp_samples (samples database)
**Format**: PostgreSQL custom format (.dump)
**Size**: 118,588 bytes (~116 KB)
**Total Rows**: 5 sample requests

### Backup Contents

The backup includes the complete `sample_requests` table with:
- All 5 sample request records
- Current schema with JSONB columns:
  - `decorative_part` (JSONB) - Already migrated
  - `additional_instruction` (JSONB) - Already migrated
- All indexes and constraints
- Foreign key relationships

### Current Schema State

**Note**: The `decorative_part` and `additional_instruction` columns are already in JSONB format, indicating the migration may have been run previously.

```sql
Column: decorative_part
Type: jsonb
Nullable: Yes

Column: additional_instruction  
Type: jsonb
Nullable: Yes
```

## How to Restore

### Option 1: Restore to Docker Container

```bash
# Copy backup into container
docker cp backend/migrations/backups/samples_backup_20260116_194641.dump southern-erp_db_samples:/tmp/

# Restore the backup
docker exec southern-erp_db_samples pg_restore -U postgres -d rmg_erp_samples -c /tmp/samples_backup_20260116_194641.dump
```

### Option 2: Restore with Clean Database

```bash
# Drop and recreate database (WARNING: This deletes all data!)
docker exec southern-erp_db_samples psql -U postgres -c "DROP DATABASE IF EXISTS rmg_erp_samples;"
docker exec southern-erp_db_samples psql -U postgres -c "CREATE DATABASE rmg_erp_samples;"

# Restore backup
docker cp backend/migrations/backups/samples_backup_20260116_194641.dump southern-erp_db_samples:/tmp/
docker exec southern-erp_db_samples pg_restore -U postgres -d rmg_erp_samples /tmp/samples_backup_20260116_194641.dump
```

### Option 3: Restore Specific Table Only

```bash
# Restore only sample_requests table
docker cp backend/migrations/backups/samples_backup_20260116_194641.dump southern-erp_db_samples:/tmp/
docker exec southern-erp_db_samples pg_restore -U postgres -d rmg_erp_samples -t sample_requests /tmp/samples_backup_20260116_194641.dump
```

## Verification After Restore

```bash
# Check row count
docker exec southern-erp_db_samples psql -U postgres -d rmg_erp_samples -c "SELECT COUNT(*) FROM sample_requests;"

# Check schema
docker exec southern-erp_db_samples psql -U postgres -d rmg_erp_samples -c "\d sample_requests"

# View sample data
docker exec southern-erp_db_samples psql -U postgres -d rmg_erp_samples -c "SELECT id, decorative_part, additional_instruction FROM sample_requests LIMIT 5;"
```

## Backup Strategy

### When to Create Backups

1. **Before migrations** - Always backup before schema changes
2. **Before major updates** - Backup before significant data modifications
3. **Regular schedule** - Consider daily/weekly backups for production

### Backup Naming Convention

Format: `samples_backup_YYYYMMDD_HHMMSS.dump`

Example: `samples_backup_20260116_194641.dump`

### Backup Location

All backups are stored in: `backend/migrations/backups/`

This directory is included in the repository for easy access but should be added to `.gitignore` for production environments with large backups.

## Important Notes

1. **Custom Format**: The backup uses PostgreSQL custom format (-F c), which is compressed and allows selective restoration
2. **Docker Container**: The backup was created from the Docker container `southern-erp_db_samples`
3. **Database Name**: The database name is `rmg_erp_samples`
4. **User**: PostgreSQL user is `postgres`
5. **Port**: The container exposes port 5433 externally (maps to 5432 internally)

## Troubleshooting

### If restore fails with "already exists" errors:

Use the `-c` flag to clean (drop) existing objects:
```bash
docker exec southern-erp_db_samples pg_restore -U postgres -d rmg_erp_samples -c /tmp/samples_backup_20260116_194641.dump
```

### If you need to see what's in the backup:

```bash
docker exec southern-erp_db_samples pg_restore --list /tmp/samples_backup_20260116_194641.dump
```

### If you need to restore without dropping existing data:

Use the `--data-only` flag:
```bash
docker exec southern-erp_db_samples pg_restore -U postgres -d rmg_erp_samples --data-only /tmp/samples_backup_20260116_194641.dump
```

## Related Files

- Migration script: `backend/migrations/fix_decorative_part_additional_instruction_schema_v2.py`
- Migration review: `backend/migrations/MIGRATION_REVIEW_fix_decorative_part_additional_instruction_schema.md`
- Spec location: `.kiro/specs/sample-schema-validation-fix/`
