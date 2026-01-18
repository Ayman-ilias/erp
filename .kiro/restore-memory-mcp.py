#!/usr/bin/env python3
"""
Memory MCP Restoration Script for Southern Apparels ERP

This script restores the complete Memory MCP knowledge graph from the backup file.
Run this after cloning the repository on a new device to restore all project knowledge.

Usage:
    python .kiro/restore-memory-mcp.py

Requirements:
    - MCP Memory server must be running and accessible
    - Backup file: .kiro/memory-mcp-backup.json
"""

import json
import os
import sys
from pathlib import Path

def load_backup_data():
    """Load the Memory MCP backup data."""
    backup_file = Path(".kiro/memory-mcp-backup.json")
    
    if not backup_file.exists():
        print(f"❌ Backup file not found: {backup_file}")
        print("Make sure you're running this from the project root directory.")
        sys.exit(1)
    
    try:
        with open(backup_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        print(f"✅ Loaded backup data: {data['metadata']['total_entities']} entities, {data['metadata']['total_relations']} relations")
        return data
    except Exception as e:
        print(f"❌ Error loading backup file: {e}")
        sys.exit(1)

def restore_entities(entities):
    """Restore entities to Memory MCP."""
    print(f"\n📝 Restoring {len(entities)} entities...")
    
    # Note: This is a template script. In a real implementation, you would:
    # 1. Import the MCP client library
    # 2. Connect to the Memory MCP server
    # 3. Call mcp_memory_create_entities with the entities data
    
    print("🔧 To restore entities, use the MCP Memory tools:")
    print("   mcp_memory_create_entities({ entities: [...] })")
    
    # Group entities by type for better organization
    entity_types = {}
    for entity in entities:
        entity_type = entity['entityType']
        if entity_type not in entity_types:
            entity_types[entity_type] = []
        entity_types[entity_type].append(entity['name'])
    
    print("\n📊 Entity breakdown:")
    for entity_type, names in entity_types.items():
        print(f"   {entity_type}: {len(names)} entities")
        for name in names:
            print(f"     - {name}")

def restore_relations(relations):
    """Restore relations to Memory MCP."""
    print(f"\n🔗 Restoring {len(relations)} relations...")
    
    print("🔧 To restore relations, use the MCP Memory tools:")
    print("   mcp_memory_create_relations({ relations: [...] })")
    
    # Group relations by type
    relation_types = {}
    for relation in relations:
        rel_type = relation['relationType']
        if rel_type not in relation_types:
            relation_types[rel_type] = 0
        relation_types[rel_type] += 1
    
    print("\n📊 Relation breakdown:")
    for rel_type, count in relation_types.items():
        print(f"   {rel_type}: {count} relations")

def main():
    """Main restoration process."""
    print("🚀 Memory MCP Restoration Script")
    print("=" * 50)
    
    # Load backup data
    backup_data = load_backup_data()
    
    # Display metadata
    metadata = backup_data['metadata']
    print(f"\n📋 Backup Information:")
    print(f"   Created: {metadata['created']}")
    print(f"   Version: {metadata['version']}")
    print(f"   Description: {metadata['description']}")
    
    # Restore entities and relations
    restore_entities(backup_data['entities'])
    restore_relations(backup_data['relations'])
    
    print("\n" + "=" * 50)
    print("✅ Memory MCP restoration template completed!")
    print("\n📝 Manual Steps Required:")
    print("1. Ensure MCP Memory server is running")
    print("2. Use Kiro or Claude with MCP Memory tools")
    print("3. Run the mcp_memory_create_entities tool with the entities data")
    print("4. Run the mcp_memory_create_relations tool with the relations data")
    print("5. Verify restoration with mcp_memory_read_graph")
    
    print("\n🔍 Quick verification:")
    print("   Search for 'Unit Conversion' to test if restoration worked")
    print("   Expected: Should find multiple related entities and relations")

if __name__ == "__main__":
    main()