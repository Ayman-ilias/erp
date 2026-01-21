@echo off
REM Comprehensive Color Import Script for Docker (Windows)
REM This script runs the color import inside the Docker container

echo 🚀 Starting Comprehensive Color Import in Docker...
echo ==================================================

REM Check if Excel file exists
if not exist "..\hm_colors.xlsx" (
    echo ❌ Error: hm_colors.xlsx not found in project root
    echo Please ensure hm_colors.xlsx is in the project root directory
    exit /b 1
)

echo ✅ Found Excel file: ..\hm_colors.xlsx
echo 🐳 Running import inside Docker container...

REM Run the import script inside the Docker container
docker exec -it southern-erp_backend python import_comprehensive_colors.py ../hm_colors.xlsx

echo ==================================================
echo ✅ Color import completed!