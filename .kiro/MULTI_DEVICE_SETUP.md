# Multi-Device Setup Guide for Southern Apparels ERP

This guide helps you set up the complete development environment on any device, including all MCP server data, Memory MCP knowledge, and project configurations.

## 🚀 Quick Setup (5 minutes)

### 1. Clone Repository
```bash
git clone https://github.com/Ayman-ilias/erp.git
cd erp
```

### 2. Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your database credentials
# Update DATABASE_*_URL variables for all 8 databases
```

### 3. Start Services
```bash
# Start all 8 PostgreSQL databases
docker-compose up -d

# Wait for databases to initialize (30 seconds)
# Run database migrations
cd backend
python init_data.py
```

### 4. Install Dependencies
```bash
# Backend
cd backend
pip install -r requirements.txt

# Frontend
cd ../frontend
npm install
```

## 🧠 Memory MCP Restoration

The Memory MCP contains all project knowledge, solutions, and patterns. This data is device-specific and needs to be restored.

### Automatic Restoration (Recommended)

1. **Ensure MCP Memory server is running** in Kiro/Claude
2. **Use the backup file**: `.kiro/memory-mcp-backup.json`
3. **Run restoration commands** in Kiro/Claude:

```javascript
// Load entities from backup
const backupData = JSON.parse(fs.readFileSync('.kiro/memory-mcp-backup.json', 'utf8'));

// Restore entities (run this command)
mcp_memory_create_entities({ entities: backupData.entities });

// Restore relations (run this command)
mcp_memory_create_relations({ relations: backupData.relations });

// Verify restoration
mcp_memory_read_graph();
```

### Manual Restoration (If needed)

1. **Run the restoration script**:
   ```bash
   python .kiro/restore-memory-mcp.py
   ```

2. **Follow the output instructions** to manually restore entities and relations

### Verification

Search for key entities to verify restoration:
```javascript
mcp_memory_search_nodes({ query: "Unit Conversion" });
mcp_memory_search_nodes({ query: "Size Color Master" });
mcp_memory_search_nodes({ query: "Database Architecture" });
```

Expected: Should find multiple entities with comprehensive implementation details.

## ⚙️ MCP Server Configuration

All MCP server configurations are included in the repository:

### Workspace-Level Config
- **File**: `.kiro/settings/mcp.json`
- **Servers**: memory, filesystem, fetch, puppeteer, perplexity
- **Auto-approve**: All tools configured for seamless operation

### User-Level Config (Optional)
- **Location**: `~/.kiro/settings/mcp.json`
- **Additional servers**: git, postgres, sqlite
- **Note**: Workspace config takes precedence

### Steering Rules
All steering rules are preserved in `.kiro/steering/`:
- `project-context.md` - Project overview and quick reference
- `memory-mcp-guide.md` - Memory MCP usage instructions
- `mcp-usage-rules.md` - MCP server usage rules
- `claude-code-integration.md` - Integration rules for AI agents

## 🗄️ Database Architecture

The project uses 8 PostgreSQL databases:

### Original 6 Databases
1. **db-clients** - Client and buyer information
2. **db-samples** - Sample requests and development
3. **db-users** - User management and authentication
4. **db-orders** - Order processing and tracking
5. **db-merchandiser** - Merchandising operations
6. **db-settings** - Company profiles, branches, configurations

### New Databases (Added)
7. **db-units** - Unit of Measurement system (30+ categories, 200+ units)
8. **db-sizecolor** - Size & Color Master system (Universal colors, H&M codes, garment types)

### Database URLs
Update these in your `.env` file:
```env
DATABASE_CLIENTS_URL=postgresql://user:pass@localhost:5432/db_clients
DATABASE_SAMPLES_URL=postgresql://user:pass@localhost:5432/db_samples
DATABASE_USERS_URL=postgresql://user:pass@localhost:5432/db_users
DATABASE_ORDERS_URL=postgresql://user:pass@localhost:5432/db_orders
DATABASE_MERCHANDISER_URL=postgresql://user:pass@localhost:5432/db_merchandiser
DATABASE_SETTINGS_URL=postgresql://user:pass@localhost:5432/db_settings
DATABASE_UNITS_URL=postgresql://user:pass@localhost:5432/db_units
DATABASE_SIZECOLOR_URL=postgresql://user:pass@localhost:5432/db_sizecolor
```

## 🧪 Testing Setup

### Frontend Testing
```bash
cd frontend
npm test                    # Run all tests
npm run test:unit          # Unit tests only
npm run test:integration   # Integration tests
npm run test:properties    # Property-based tests
```

### Backend Testing
```bash
cd backend
python -m pytest          # Run all tests
python test_units.py      # Unit conversion tests
python test_audit_*.py    # Audit system tests
```

## 📁 Key Directories

### Configuration
- `.kiro/settings/` - MCP server configurations
- `.kiro/steering/` - Steering rules and project context
- `.kiro/specs/` - Feature specifications and task lists

### Backend
- `backend/modules/units/` - Unit conversion system
- `backend/modules/sizecolor/` - Size & Color Master system
- `backend/migrations/` - Database migration scripts
- `backend/modules/materials/services/` - Material management services

### Frontend
- `frontend/components/uom/` - Unit of Measurement components
- `frontend/components/sizecolor/` - Size & Color components
- `frontend/src/test/` - Comprehensive test suites
- `frontend/hooks/` - Custom React hooks

## 🔍 Verification Checklist

After setup, verify these components work:

### ✅ Backend Services
- [ ] All 8 databases connect successfully
- [ ] Unit conversion API endpoints respond
- [ ] Size & Color API endpoints respond
- [ ] Migration scripts run without errors

### ✅ Frontend Components
- [ ] Unit selector loads units from API
- [ ] Inline converter performs conversions
- [ ] Color selector shows universal and H&M colors
- [ ] Size selector filters by garment type

### ✅ Memory MCP
- [ ] Search finds "Unit Conversion Integration"
- [ ] Search finds "Size & Color Master System"
- [ ] Search finds "Database Architecture"
- [ ] All 13 entities and 16 relations restored

### ✅ Error Handling
- [ ] UoM components show error states gracefully
- [ ] Retry mechanisms work for failed API calls
- [ ] Error boundaries catch component failures

## 🚨 Troubleshooting

### Database Connection Issues
1. Check Docker containers are running: `docker ps`
2. Verify database URLs in `.env`
3. Run migrations: `python backend/init_data.py`

### MCP Server Issues
1. Check `.kiro/settings/mcp.json` exists
2. Restart Kiro/Claude to reload MCP servers
3. Verify Memory MCP server is listed in MCP panel

### Memory MCP Restoration Issues
1. Ensure MCP Memory server is active
2. Check backup file exists: `.kiro/memory-mcp-backup.json`
3. Run restoration commands one at a time
4. Verify with `mcp_memory_read_graph()`

### Frontend Build Issues
1. Clear node_modules: `rm -rf node_modules package-lock.json`
2. Reinstall: `npm install`
3. Check Node.js version: `node --version` (should be 18+)

## 📞 Support

If you encounter issues:

1. **Check Memory MCP** first - search for solutions to common problems
2. **Review steering rules** in `.kiro/steering/` for project-specific guidance
3. **Check git history** for recent changes that might affect setup
4. **Run tests** to identify specific component failures

## 🎉 Success!

Once setup is complete, you'll have:
- ✅ Complete development environment
- ✅ All 8 databases with seed data
- ✅ Memory MCP with full project knowledge
- ✅ MCP servers configured and working
- ✅ Comprehensive test suites
- ✅ Error handling and debugging tools

The project is now ready for development on your new device!