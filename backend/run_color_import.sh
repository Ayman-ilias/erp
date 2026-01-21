#!/bin/bash

# Comprehensive Color Import Script for Docker
# This script runs the color import inside the Docker container

echo "🚀 Starting Comprehensive Color Import in Docker..."
echo "=================================================="

# Check if Excel file exists
if [ ! -f "../hm_colors.xlsx" ]; then
    echo "❌ Error: hm_colors.xlsx not found in project root"
    echo "Please ensure hm_colors.xlsx is in the project root directory"
    exit 1
fi

echo "✅ Found Excel file: ../hm_colors.xlsx"
echo "🐳 Running import inside Docker container..."

# Run the import script inside the Docker container
docker exec -it southern-erp_backend python import_comprehensive_colors.py ../hm_colors.xlsx

echo "=================================================="
echo "✅ Color import completed!"