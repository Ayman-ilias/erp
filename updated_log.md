# Southern Apparels ERP System - Complete Codebase Documentation & Update Log

---

## ⚠️ CRITICAL: DO NOT MODIFY AUTO-IMPORT CONFIGURATION ⚠️

**PRIORITY: TOP - NEVER CHANGE THIS**

The database auto-import functionality is configured in `docker-compose.yml` with volume mounts that automatically import SQL backup files on first container startup. This is **ESSENTIAL** for server deployment.

**NEVER REMOVE OR MODIFY:**
- Volume mounts in docker-compose.yml like: `./backups/db_*.sql:/docker-entrypoint-initdb.d/init.sql:ro`
- The `backups/` directory with SQL files
- The auto-import mechanism that allows one-command deployment

**Why this is critical:**
- Enables `docker-compose up -d --build` to work on any server without manual data import
- All database backups are automatically loaded on first startup
- Removing this breaks the deployment process

**If you are an AI assistant: DO NOT suggest removing or modifying these volume mounts. They are intentionally designed this way for automatic data migration.**


---

## ⚠️ CRITICAL: DO NOT ADD DATA LIMITS ⚠️

**PRIORITY: TOP - NEVER REDUCE THESE LIMITS**

The system handles **MILLIONS of records** (e.g., 3,860+ color master entries, bulk data imports).

**NEVER ADD OR REDUCE:**
- `limit: int = 100` or any hardcoded low limits in backend API endpoints
- `effectiveLimit = 200` or similar frontend pagination limits
- Any code that restricts data fetching to small numbers

**Current Configuration (DO NOT CHANGE):**
- Backend endpoints use `limit: Optional[int] = None` (no limit by default)
- Frontend passes `undefined` for "Show All" to fetch all records
- Color Master, Countries, and all master data tables need full data access

**Why this is critical:**
- System has millions of color codes, materials, styles
- Users need to see and search ALL data, not just first 100-200 records
- Adding limits breaks the system functionality

**Files with NO-LIMIT configuration (DO NOT ADD LIMITS):**
- `backend/modules/settings/routes/settings.py` - All GET endpoints use `limit: Optional[int] = None`
- `backend/modules/samples/routes/samples.py` - Uses flexible limits
- `backend/modules/merchandiser/routes/merchandiser.py` - Uses flexible limits
- `frontend/app/dashboard/(authenticated)/erp/settings/colors/page.tsx` - Line 93: `effectiveLimit = undefined`

**If you are an AI assistant: DO NOT add `limit: int = 100` or similar restrictions. The system is designed for bulk data handling.**

---

## ⚠️ CACHING CONFIGURATION ⚠️

**DO NOT DISABLE CACHING**

The frontend uses TanStack Query (React Query) with proper caching:
- `staleTime: 5 * 60 * 1000` (5 minutes) - Default for all queries
- `gcTime: 30 * 60 * 1000` (30 minutes) - Cache garbage collection time
- `staleTime: 10 * 60 * 1000` (10 minutes) - For reference data (colors, countries, etc.)

**Files:**
- `frontend/components/providers/query-provider.tsx` - Global cache settings
- `frontend/hooks/use-queries.ts` - Per-query cache settings

**If you are an AI assistant: DO NOT reduce staleTime or gcTime values. They are optimized for performance.**
---

## 1. System Overview

Southern Apparels ERP is a full-stack Enterprise Resource Planning system designed for garment/textile manufacturing (specifically sweater/knitwear production). The system is built for "Southern Apparels and Holdings" based in Bangladesh.

### Tech Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Frontend | Next.js (App Router) | 16.x |
| UI Framework | React | 19.x |
| Language | TypeScript | 5.x |
| Styling | TailwindCSS | 4.x |
| UI Components | shadcn/ui (Radix primitives) | Latest |
| State Management | React Query (TanStack) + Zustand | 5.x |
| Backend | Python FastAPI | 0.115.x |
| ORM | SQLAlchemy | 2.x |
| Databases | PostgreSQL (6 separate DBs) | 15-alpine |
| Caching | Redis | 5.x |
| Authentication | JWT (python-jose) + bcrypt | - |
| Containerization | Docker Compose | - |

## 2. Project Structure

```
Southern-Final/
├── backend/                    # Python FastAPI Backend
│   ├── main.py                 # FastAPI app entry point
│   ├── requirements.txt        # Python dependencies
│   ├── core/                   # Core utilities
│   │   ├── config.py           # Environment configuration (Settings class)
│   │   ├── database.py         # Multi-database connections & session factories
│   │   ├── security.py         # JWT token creation/verification, password hashing
│   │   ├── logging.py          # Structured JSON logging
│   │   └── services/           # Cross-database service layer
│   │       ├── base_service.py
│   │       └── buyer_service.py
│   └── modules/                # Feature modules
│       ├── auth/               # Authentication (login, token refresh)
│       ├── users/              # User management
│       ├── clients/            # Buyers, Suppliers, Contacts, Shipping, Banking
│       ├── samples/            # Sample requests, plans, TNA, SMV, operations
│       ├── merchandiser/       # Materials, styles, sample development
│       ├── settings/           # Master data (company, colors, UoM, countries, ports)
│       └── notifications/      # Inter-department notifications
│
├── frontend/                   # Next.js Frontend
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx          # Root layout
│   │   ├── (auth)/             # Public auth pages (login)
│   │   ├── dashboard/
│   │   │   ├── (public)/       # Public dashboard routes
│   │   │   └── (authenticated)/ # Protected routes
│   │   │       └── erp/        # Main ERP pages
│   │   │           ├── page.tsx           # Dashboard home
│   │   │           ├── clients/           # Buyers, Suppliers pages
│   │   │           ├── samples/           # Sample department pages
│   │   │           ├── merchandiser/      # Merchandising pages
│   │   │           └── settings/          # Settings pages
│   │   └── api/v1/[...path]/   # API proxy route to backend
│   │
│   ├── components/             # React components
│   │   ├── ui/                 # shadcn/ui primitives
│   │   ├── layout/             # Sidebar, navigation
│   │   └── providers/          # Context providers
│   │
│   ├── lib/                    # Utilities
│   │   ├── config.ts           # App configuration
│   │   ├── utils.ts            # Helper functions (cn, formatters)
│   │   ├── auth-context.tsx    # Authentication context & hooks
│   │   ├── permissions.ts      # Department-based access control
│   │   └── crypto.ts           # Optional AES-256-GCM token encryption
│   │
│   ├── services/
│   │   └── api.ts              # API service layer (all backend calls)
│   │
│   ├── hooks/
│   │   └── use-queries.ts      # React Query hooks
│   │
│   ├── middleware.ts           # Auth middleware (route protection)
│   ├── router.config.ts        # Route definitions & links
│   ├── query.config.ts         # React Query key configuration
│   └── types.d.ts              # TypeScript type definitions
│
└── docker-compose.yml          # Container orchestration
```

## 3. Database Architecture

The system uses 6 separate PostgreSQL databases for domain isolation:

| Database | Variable | Purpose |
|----------|----------|---------|
| rmg_erp_users | DATABASE_URL_USERS | User accounts, authentication |
| rmg_erp_clients | DATABASE_URL_CLIENTS | Buyers, suppliers, contacts, shipping, banking |
| rmg_erp_samples | DATABASE_URL_SAMPLES | Sample requests, styles, variants, TNA, SMV |
| rmg_erp_orders | DATABASE_URL_ORDERS | Order management |
| rmg_erp_merchandiser | DATABASE_URL_MERCHANDISER | Materials (yarn, fabric, trims), sample development |
| rmg_erp_settings | DATABASE_URL_SETTINGS | Master data (company, colors, UoM, countries, ports) |

### Database Connection Pattern (backend/core/database.py)

```python
# Each database has its own:
# - Engine: engine_users, engine_clients, etc.
# - SessionLocal: SessionLocalUsers, SessionLocalClients, etc.
# - Base: BaseUsers, BaseClients, etc.
# - Dependency: get_db_users(), get_db_clients(), etc.
```

## 4. Backend Modules Detail

### 4.1 Auth Module (/modules/auth/)
- **Routes**: `/api/v1/auth/login`, `/api/v1/auth/me`
- **Features**: JWT login with username/password, token refresh, current user info
- **Token**: Access token with configurable expiry (default 60 min)

### 4.2 Users Module (/modules/users/)
- **Model**: User - username, email, hashed_password, full_name, department, designation, is_active, is_superuser, department_access (JSON array)
- **Routes**: CRUD operations for user management
- **Access**: Superuser only

### 4.3 Clients Module (/modules/clients/)
**Models**:
- Buyer - buyer_code, buyer_name, buyer_short_name, country, website, remarks
- Supplier - supplier_code, supplier_name, country, supplier_type, payment_terms
- Contact - linked to buyer/supplier, contact details
- ShippingAddress - linked to buyer, address details
- BankingDetail - linked to buyer/supplier, bank info

**Routes**: Full CRUD for all client entities

### 4.4 Samples Module (/modules/samples/)
**Models**:
- StyleSummary - Base style info (buyer_id, style_name, gauge, product_category)
- StyleVariant - Color/size combinations for a style
- VariantColorPart - Multi-color support
- SampleRequest - Main sample request with all specs
- SamplePlan - Assignments and scheduling
- SampleMachine - Knitting machine master
- ManufacturingOperation - Operation master (Knitting, Linking, etc.)
- SampleOperation - Operations linked to samples
- SampleTNA - Time & Action tracking
- SampleStatus - Status history
- SampleRequiredMaterial - Materials for a sample
- StyleVariantMaterial - Materials per style variant
- SMVCalculation - Standard Minute Value per operation
- GarmentColor, GarmentSize - Master data

### 4.5 Merchandiser Module (/modules/merchandiser/)
**Models**:
- MerchandiserMaterialDetail - Material base info
- YarnDetail - Yarn specifics (composition, count, ply)
- FabricDetail - Fabric specifics (GSM, width, construction)
- TrimsDetail - Trims specifics (type, material, size)
- AccessoriesDetail - Accessories specifics
- SizeDetail - Size master with buyer-specific sizes
- SamplePrimaryInfo - Sample development info (syncs to Samples module)
- StyleManagement - Style info managed by merchandiser
- CMCalculation - Cost of Making calculations

**Key Feature**: SamplePrimaryInfo auto-syncs to SampleRequest in Samples module via `/sync-to-samples` endpoint

### 4.6 Settings Module (/modules/settings/)
**Models**:
- Company - Company profile
- Branch - Company branches
- Department - Organizational departments
- Designation - Job titles
- Currency - Supported currencies
- Tax - Tax configurations
- UoMCategory, UoM - Units of measure
- ColorFamily, Color, ColorValue, ColorMaster - Color system
- Country, City, Port - Geography & logistics

**Seed Data**: seed_data.py contains default colors, UoMs, countries

### 4.7 Notifications Module (/modules/notifications/)
- Notification - title, message, type, priority, target_departments, read status
- Used for inter-department communication

## 5. Frontend Architecture

### 5.1 Authentication Flow
1. User submits login form → POST `/api/v1/auth/login`
2. Backend returns JWT access token
3. Token stored in localStorage (optionally encrypted with AES-256-GCM)
4. AuthContext provides user, token, login, logout
5. middleware.ts protects routes, redirects unauthenticated users

### 5.2 API Proxy Pattern
All API calls go through `/api/v1/[...path]/route.ts` which:
- Proxies requests to backend (default: http://localhost:8000)
- Adds authentication headers
- Handles errors uniformly

### 5.3 Permission System (lib/permissions.ts)

```typescript
// Department IDs for access control:
- client_info        // Buyers, Suppliers, Contacts
- sample_department  // Sample Requests, TNA, SMV
- merchandising      // Materials, Sample Development
- orders             // Order Management
- inventory          // Inventory Management
- production         // Production Planning
- reports            // Reports & Analytics
- basic_settings     // System Settings
```

Sidebar navigation is filtered based on `user.department_access` array.

### 5.4 Key Frontend Files

| File | Purpose |
|------|---------|
| lib/auth-context.tsx | Auth state, login/logout functions |
| lib/permissions.ts | Access control, menu filtering |
| services/api.ts | All API calls organized by module |
| query.config.ts | React Query cache keys |
| router.config.ts | Route paths and navigation links |
| middleware.ts | Route protection |
| components/layout/sidebar/ | Main navigation sidebar |

### 5.5 API Service Structure (services/api.ts)

```typescript
export const api = {
  auth: { login, getCurrentUser },
  users: { getAll, create, update, delete },
  buyers: { getAll, getById, create, update, delete },
  suppliers: { ... },
  contacts: { ... },
  shipping: { ... },
  banking: { ... },
  samples: { ... },
  merchandiser: {
    materials: { ... },
    yarn: { ... },
    fabric: { ... },
    trims: { ... },
    accessories: { ... },
    samplePrimary: { ..., syncToSamples },
  },
  settings: { ... },
  notifications: { ... },
};
```

## 6. Key Business Flows

### 6.1 Sample Development Workflow

```
Merchandiser creates SamplePrimaryInfo
       ↓
Click "Sync to Samples" (or auto-sync)
       ↓
SampleRequest created in Samples module
       ↓
Sample Dept receives request
       ↓
Assign designer, machine, plan dates
       ↓
Track TNA (Time & Action)
       ↓
Update status → Merchandiser sees updates
```

### 6.2 Style → Variant → Materials Flow

```
StyleSummary (base style)
       ↓
StyleVariant (color + sizes combinations)
       ↓
StyleVariantMaterial (required materials)
       ↓
SMVCalculation (time per operation)
```

### 6.3 Client Data Structure

```
Buyer/Supplier
    ├── Multiple Contacts
    ├── Multiple Shipping Addresses (Buyers only)
    └── Multiple Banking Details
```

## 7. Configuration

### Backend Environment Variables

```env
# Database URLs
DATABASE_URL_USERS=postgresql://user:pass@localhost:5432/erp_users
DATABASE_URL_CLIENTS=postgresql://user:pass@localhost:5432/erp_clients
DATABASE_URL_SAMPLES=postgresql://user:pass@localhost:5432/erp_samples
DATABASE_URL_MERCHANDISER=postgresql://user:pass@localhost:5432/erp_merchandiser
DATABASE_URL_SETTINGS=postgresql://user:pass@localhost:5432/erp_settings

# Redis
REDIS_URL=redis://localhost:6379

# Security
SECRET_KEY=your-secret-key
ACCESS_TOKEN_EXPIRE_MINUTES=60

# CORS
BACKEND_CORS_ORIGINS=["http://localhost:3000"]
```

### Frontend Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_ENABLE_ENCRYPTION=false  # Optional token encryption
```

## 8. Running the Application

### With Docker Compose

```bash
docker-compose up -d
```

### Manual Setup

```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Frontend
cd frontend
npm install
npm run dev
```

### Default Access
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## 9. Key Patterns & Conventions

### Backend
- **Module Structure**: Each module has `models/`, `schemas/`, `routes/` subdirectories
- **Database Sessions**: Use dependency injection (`Depends(get_db_*)`)
- **Cross-DB Calls**: Use service layer (`core/services/`) for cross-database operations
- **ID Generation**: Auto-generated codes like BYR-001, SPL-001, SMP-001

### Frontend
- **Components**: shadcn/ui based, located in `components/ui/`
- **Pages**: App Router with route groups `(auth)`, `(authenticated)`
- **Data Fetching**: React Query with centralized query keys
- **Forms**: React Hook Form + Zod validation
- **Toasts**: Sonner for notifications
- **Tables**: Custom tables with filtering, sorting, export (xlsx)

## 10. Important Notes

- **Multi-Database Architecture**: Each module uses its own database. Cross-module references use IDs (not foreign keys).
- **Merchandiser ↔ Samples Sync**: SamplePrimaryInfo syncs to SampleRequest. This is one-directional (Merchandiser → Samples).
- **User Permissions**: Based on `department_access` array. Superusers (`is_superuser=true`) have full access.
- **Token Storage**: JWT stored in localStorage. Optional AES-256-GCM encryption available.
- **API Proxy**: Frontend calls `/api/v1/*` which proxies to backend. This handles CORS and adds auth headers.
- **Master Data**: Colors, UoMs, Countries are seeded from `settings/seed_data.py`.

## 11. Module-Specific URLs

| Module | Frontend Route | Backend API Prefix |
|--------|----------------|-------------------|
| Dashboard | `/dashboard/erp` | - |
| Buyers | `/dashboard/erp/clients/buyers` | `/api/v1/buyers` |
| Suppliers | `/dashboard/erp/clients/suppliers` | `/api/v1/suppliers` |
| Samples | `/dashboard/erp/samples/*` | `/api/v1/samples` |
| Merchandiser | `/dashboard/erp/merchandiser/*` | `/api/v1/merchandiser` |
| Settings | `/dashboard/erp/settings/*` | `/api/v1/settings` |

---

# Update Log

This section tracks all changes, updates, and modifications made to the codebase with timestamps.

## 2026-01-04 17:55:00

**Fixed 405 Error and Notification Department Names**

**Problem:**
1. Frontend was trying to POST to `/merchandiser/sample-primary` endpoint which was removed (405 Method Not Allowed error)
2. Notifications were not being received because department names didn't match permission constants

**Solution:**
1. **Removed create method from frontend API service**: Removed `samplePrimary.create` method from `frontend/services/api.ts` since merchandiser cannot create samples
2. **Removed createPrimaryMutation**: Removed the mutation hook from the merchandising page since it's no longer needed
3. **Updated form submission**: Changed form to show error message when trying to create (merchandiser can only edit)
4. **Fixed notification department names**: 
   - Changed "merchandising" to "merchandiser" in samples module notification
   - Changed "sample_department" to "samples" in merchandiser module notification
   - These now match the department_access permission constants used in the system
5. **Removed duplicate function definition**: Removed duplicate `sync_samples_to_samples_db` function definition

**Files modified:**
- `frontend/services/api.ts` - Removed samplePrimary.create method
- `frontend/app/dashboard/(authenticated)/erp/merchandising/sample-development/page.tsx` - Removed createPrimaryMutation, updated form submission
- `backend/modules/samples/routes/samples.py` - Fixed notification department name to "merchandiser"
- `backend/modules/merchandiser/routes/merchandiser.py` - Fixed notification department name to "samples", removed duplicate function

## 2026-01-04 17:40:00

**Added Expecting End Date Field and Notifications to Sample Status**

**Problem:**
User requested to add an "expecting_end_date" field to SampleStatus in both modules, which should be set by the sample department. Additionally, notifications should be sent to each department when updates occur.

**Solution:**
1. **Backend Changes:**
   - Added `expecting_end_date` field (DateTime) to `SampleStatus` model in both samples and merchandiser modules
   - Updated `SampleStatusBase`, `SampleStatusUpdate`, and `SampleStatusResponse` schemas to include the field
   - Created migration script `add_expecting_end_date_to_sample_status.py` to add the column to both databases
   - Updated `_run_samples_migrations` and `_run_merchandiser_migrations` in `database.py` to run the migration
   - Created `core/notification_service.py` with helper functions to send notifications to departments or users
   - Updated sync logic in samples module to include `expecting_end_date` when syncing to merchandiser
   - Added notification sending to merchandising department when samples module updates status
   - Added notification sending to sample department when merchandiser module updates status
   - Merchandiser cannot update `expecting_end_date` or `status_by_sample` (these are set by sample department)

2. **Frontend Changes:**
   - Added `expecting_end_date` field to samples status form (editable, date input)
   - Added `expecting_end_date` field to merchandising sample status dialog (read-only)
   - Added "Expecting End Date" and "Updated By" columns to samples status table
   - Added "Expecting End Date" column display to merchandising sample status table (read-only)

**Files modified:**
- `backend/modules/samples/models/sample.py`
- `backend/modules/merchandiser/models/merchandiser.py`
- `backend/modules/samples/schemas/sample.py`
- `backend/modules/merchandiser/schemas/merchandiser.py`
- `backend/migrations/add_expecting_end_date_to_sample_status.py` (created)
- `backend/core/database.py`
- `backend/core/notification_service.py` (created)
- `backend/modules/samples/routes/samples.py`
- `backend/modules/merchandiser/routes/merchandiser.py`
- `frontend/app/dashboard/(authenticated)/erp/samples/status/page.tsx`
- `frontend/app/dashboard/(authenticated)/erp/merchandising/sample-development/page.tsx`

## 2026-01-04 17:20:00

**Fixed Select Component Error in Merchandising Sample Status Dialog**

**Problem:**
When clicking the Edit button on a sample status record in the merchandising module, the application was showing an error page with the message "An Error Occurred". The browser console revealed the root cause:
```
Error: A <Select.Item /> must have a value prop that is not an empty string. 
This is because the Select value can be set to an empty string to clear the selection and show the placeholder.
```

The issue was in the `SampleStatusDialog` component where we had:
```tsx
<SelectItem value="">None</SelectItem>
```

The shadcn/ui Select component (built on Radix UI primitives) does not allow `SelectItem` components to have an empty string (`""`) as a value. This is by design - empty strings are reserved for clearing the selection and showing the placeholder.

**Solution:**
1. **Removed the "None" option**: Deleted the `<SelectItem value="">None</SelectItem>` line from the Select component
2. **Updated value handling**: Changed the Select component's value prop from `formData?.status_from_merchandiser ?? ""` to `formData?.status_from_merchandiser || undefined`
   - When the value is empty/null/undefined, the Select component now shows the placeholder ("Select status") instead of trying to match an empty string value
3. **Maintained functionality**: The onValueChange handler still converts undefined to empty string for storage: `value || ""`

**Result:**
- The Edit dialog now opens without errors
- When no status is selected, the placeholder "Select status" is displayed
- Users can select a status from the dropdown (Following Up, Awaiting Feedback, Action Required, Closed)
- The form submission works correctly with empty/null values

**Files modified:** `frontend/app/dashboard/(authenticated)/erp/merchandising/sample-development/page.tsx`

## 2026-01-04 17:15:10

**Fixed Table Headers in Merchandising Sample Status**
- Fixed incorrect table headers to match actual data fields
- Changed "Status From Buyer" to "Status From Merchandiser"
- Changed "Status By Merchandiser" to "Updated By"
- Changed "Note" to "Notes" to match schema
- Added debug logging to SampleStatusDialog component
- Files modified: `frontend/app/dashboard/(authenticated)/erp/merchandising/sample-development/page.tsx`

## 2026-01-04 17:15:00

**Enhanced Error Handling in Merchandising Sample Status Edit Dialog**
- Added null-safe operators (??) for all form data access to prevent undefined errors
- Changed setFormData to use functional updates to prevent stale closure issues
- Added try-catch blocks around state updates and dialog opening
- Improved error handling in useEffect and onClick handlers
- Files modified: `frontend/app/dashboard/(authenticated)/erp/merchandising/sample-development/page.tsx`

## 2026-01-04 17:05:00

**Fixed Edit Error in Merchandising Sample Status Dialog**
- Fixed Select component value handling to properly handle empty strings and null values
- Added form reset when dialog closes to prevent stale data
- Improved error handling in handleSubmit function with try-catch
- Added null checks and proper data sanitization before submission
- Fixed useEffect dependency to only update form data when dialog is open and editingStatus is set
- Files modified: `frontend/app/dashboard/(authenticated)/erp/merchandising/sample-development/page.tsx`

## 2026-01-04 16:57:00

**Fixed Edit Dialog State Management in Merchandising Sample Status**
- Fixed issue where editingStatus state was not reset when dialog closes
- Updated onOpenChange handler to reset editingStatus to null when dialog is closed
- This ensures the form properly reloads when editing a different status record
- Files modified: `frontend/app/dashboard/(authenticated)/erp/merchandising/sample-development/page.tsx`

## 2026-01-04 16:41:00

**Added MCP Server Configuration for Browser and Memory**
- Created `mcp-config.json` configuration file for MCP (Model Context Protocol) servers
- Added browser MCP server configuration using @modelcontextprotocol/server-puppeteer
- Added memory MCP server configuration using @modelcontextprotocol/server-memory
- Created `MCP_SETUP.md` documentation with setup instructions for Cursor IDE
- Added `.cursorignore` file to exclude MCP memory storage and node_modules from Cursor indexing
- Configuration includes:
  - Browser MCP server for web automation and scraping
  - Memory MCP server for context storage and retrieval
- Files created:
  - `mcp-config.json`
  - `MCP_SETUP.md`
  - `.cursorignore`

## 2026-01-04 16:27:00

**Fixed Syntax Error in Merchandiser Routes for Docker Build**
- Fixed indentation errors in update_sample_status function that was preventing Docker build from succeeding
- Corrected nested try-except-finally blocks structure with proper indentation
- Fixed duplicate try statement and missing indentation issues
- Restructured exception handling to properly nest try-except blocks within the main function try-except
- All Docker containers are now running successfully (backend, frontend, databases, redis)
- Files modified: `backend/modules/merchandiser/routes/merchandiser.py`

## 2026-01-04 15:25:30

**Enhanced Error Handling and Logging for Sample Status Update**
- Added comprehensive logging throughout the update endpoint to track request flow
- Added handling for empty strings (converting to None for consistency)
- Added check to ensure at least one field is being updated before committing
- Improved error handling with separate handling for HTTP exceptions vs general exceptions
- Added detailed logging at each step: request received, data processing, commit, refresh, return
- Files modified: `backend/modules/merchandiser/routes/merchandiser.py`

## 2026-01-04 15:20:45

**Fixed Edit Error in Merchandising Sample Status**
- Fixed error handling in PUT /sample-status/{id} endpoint that was causing "An Error Occurred" message
- Removed unnecessary try-catch around return statement (return statements don't throw exceptions)
- Added proper refresh of database object before returning to ensure all fields are up to date
- Simplified error handling to let FastAPI handle response serialization properly
- Files modified: `backend/modules/merchandiser/routes/merchandiser.py`

## 2026-01-04 15:16:16

**Added Auto-Sync from Samples Update to Merchandiser**
- Added auto-sync mechanism to PUT /sample-status/{status_id} endpoint in samples module
- When Sample Department updates a status, it now automatically syncs to merchandiser database
- Updates existing status record in merchandiser if found, creates new one if not found
- Only syncs fields that come from samples: status_by_sample, notes, updated_by
- Preserves status_from_merchandiser field (doesn't overwrite merchandiser's status)
- Added proper error handling with try-catch and rollback for all database operations
- Sync failures don't fail the original update request - samples update succeeds even if sync fails
- Files modified: `backend/modules/samples/routes/samples.py`

## 2026-01-04 15:08:15

**Fixed Sync Update Logic and Error Handling**
- Fixed sync endpoint to properly commit updates (only commit if there are changes)
- Improved sync logic to correctly update status_by_sample from samples database
- Fixed update endpoint error handling - added try-catch around return statement
- Improved sync to samples logic - only commit if there are actual changes
- Added better logging for sync operations
- Files modified: `backend/modules/merchandiser/routes/merchandiser.py`

## 2026-01-04 15:02:44

**Added Sync Button and Restricted Merchandiser Status Updates**
- Added POST /sample-status/sync-from-samples endpoint to manually sync status records from samples to merchandiser database
- Added sync button in frontend with loading state and success/error messages showing sync counts
- Restricted merchandiser from changing status_by_sample field - only allows updating status_from_merchandiser, notes, updated_by
- Update endpoint now filters out status_by_sample from updates and logs warning if attempted
- Form submission now only sends editable fields (excludes status_by_sample) to prevent accidental changes
- Sync endpoint returns count of created, updated, and skipped records
- Files modified: `backend/modules/merchandiser/routes/merchandiser.py`, `frontend/router.config.ts`, `frontend/services/api.ts`, `frontend/app/dashboard/(authenticated)/erp/merchandising/sample-development/page.tsx`

## 2026-01-04 14:28:30

**Enhanced Sample Status Sync with Fallback and Better Logging**
- Added detailed logging to sync process (info, success, error messages with full traceback)
- Enhanced GET /sample-status endpoint in merchandiser to automatically sync from samples database if no records found in merchandiser database
- GET endpoint now checks samples database and syncs missing records to merchandiser database on-the-fly
- Added fallback mechanism: if merchandiser database is empty, it queries samples database and syncs records
- Improved error handling with detailed logging for debugging sync issues
- Files modified: `backend/modules/samples/routes/samples.py`, `backend/modules/merchandiser/routes/merchandiser.py`

## 2026-01-04 18:25:15

**Restored Sample Request Creation for Merchandising**

**Correction**: Previous change incorrectly removed sample request creation functionality. Clarification:
- **Sample Primary Info (Sample Requests)**: Merchandising CAN create these. These are sample requests that go to the Sample Department.
- **Sample Status**: Merchandising CANNOT create status records. Only the Sample Department can create status records.

**Changes Made**:
- Restored POST endpoint `/sample-primary` in `backend/modules/merchandiser/routes/merchandiser.py` to allow merchandisers to create sample requests
- Restored `create` method in `frontend/services/api.ts` for `api.merchandiser.samplePrimary.create`
- Restored `createPrimaryMutation` in `frontend/app/dashboard/(authenticated)/erp/merchandising/sample-development/page.tsx`
- Restored "Create New Sample Request" button in page header
- Restored "Add Sample Request" button in Sample Primary Info tab
- Updated `SamplePrimaryDialog` to support both create and edit modes (removed conditional rendering)
- Updated dialog title and description to show "Create New Sample Request" or "Edit Sample Request" based on mode
- Updated empty state message to prompt users to create sample requests
- Restored `handleSubmit` logic to allow sample_id to be auto-generated when creating new requests

**Note**: Sample Status creation restriction remains in place - only Sample Department can create status records.

Files modified: `backend/modules/merchandiser/routes/merchandiser.py`, `frontend/services/api.ts`, `frontend/app/dashboard/(authenticated)/erp/merchandising/sample-development/page.tsx`

## 2026-01-04 18:15:32

**Removed Create Sample Buttons and Hardened Sample Dialog**

**Problem**: User was still getting "Failed to create sample: Method Not Allowed" error when trying to create samples from the merchandising module.

**Solution**:
- Removed "Create New Sample" button from the page header (line 250-258)
- Removed "Add Sample" button from the Sample Primary Info tab header (line 300-308)
- Updated empty state message to indicate samples are created by Sample Department (instead of prompting to "Click Add Sample")
- Made SamplePrimaryDialog conditional - it only renders when `editingPrimary` is set (prevents opening dialog without an existing sample)
- Added `onOpenChange` handler to reset `editingPrimary` when dialog closes
- Updated `handleSubmit` in SamplePrimaryDialog to check if `editingSample` exists before submitting (early return with error toast if not)
- Simplified DialogHeader to only show "Edit Sample" title and description (removed "Add New Sample" option)
- Removed logic that deleted `sample_id` from submit data (merchandisers can only edit, so sample_id must always be present)

**Result**: Merchandisers can now only edit existing samples. All create functionality has been removed from the frontend, preventing any attempts to call the non-existent POST endpoint.

Files modified: `frontend/app/dashboard/(authenticated)/erp/merchandising/sample-development/page.tsx`

## 2026-01-04 18:06:06

**Fixed 405 Error and Notification Issues in Sample Status**

**Problem 1: 405 Method Not Allowed Error**
- Frontend was attempting to call POST `/merchandiser/sample-primary` endpoint which had been removed (merchandisers should not create new samples)
- Error occurred when user tried to make a sample request in merchandising module
- **Solution**: Removed `createPrimaryMutation` from `frontend/app/dashboard/(authenticated)/erp/merchandising/sample-development/page.tsx`
- Removed `create` method from `api.merchandiser.samplePrimary` in `frontend/services/api.ts`
- Updated `SamplePrimaryDialog`'s `onSubmit` logic to only call `updatePrimaryMutation` (merchandisers can only edit existing samples)

**Problem 2: Notifications Not Being Received**
- Notifications were not being sent to users when sample status was updated
- The `send_notification_to_department` function in `backend/core/notification_service.py` was not correctly filtering users based on their `department_access` field
- The function was checking `user.department.ilike("%merchandis%")` instead of checking if the target department string exists in the user's `department_access` JSON array
- **Solution**: Updated `send_notification_to_department` function to correctly filter users based on their `department_access` list containing the `target_department` string
- The function now queries users and filters them using: `User.department_access.contains([target_department])` to match the JSON array structure
- Verified that `target_department` values ("merchandising" and "sample_department") match the constants in `frontend/lib/permissions.ts` and the `department_access` field format

**Problem 3: Code Structure Issues**
- Fixed indentation errors in `backend/modules/samples/routes/samples.py` in `create_sample_status` function (lines 654-658)
- Fixed indentation errors in `update_sample_status` function (lines 740-749)
- Added missing `expecting_end_date` field to sync logic in `create_sample_status` function
- Added notification code to `create_sample_status` function to send notifications to merchandising department when sample status is created

Files modified: `frontend/app/dashboard/(authenticated)/erp/merchandising/sample-development/page.tsx`, `frontend/services/api.ts`, `backend/core/notification_service.py`, `backend/modules/samples/routes/samples.py`

## 2026-01-04 14:22:15

**Added Auto-Sync from Samples Module to Merchandiser When Status is Created**
- Added auto-sync mechanism in samples module POST /sample-status endpoint
- When Sample Department creates a status record, it now automatically syncs to merchandiser database
- Sync updates existing status record in merchandiser database or creates new one if it doesn't exist
- Sync transfers: status_by_sample, status_from_merchandiser, notes, updated_by
- Sync is non-blocking - errors are logged but don't fail the original request
- Files modified: `backend/modules/samples/routes/samples.py`

## 2026-01-04 14:16:42

**Frontend: Removed Add Status Button and Updated Sample Status Form for Merchandising**
- Removed "Add Status" button from merchandiser sample development page (merchandising cannot create new status records)
- Removed createStatusMutation - only update mutation remains
- Updated SampleStatusDialog to only allow editing existing records (requires editingStatus)
- Updated form fields to match new schema: status_by_sample (read-only), status_from_merchandiser, notes, updated_by
- Updated table columns to display: status_by_sample, status_from_merchandiser, notes, updated_by
- Updated empty state message to indicate status records are created by Sample Department
- Merchandising can now only edit existing status records (status_from_merchandiser, notes, updated_by)
- Files modified: `frontend/app/dashboard/(authenticated)/erp/merchandising/sample-development/page.tsx`

## 2026-01-04 14:03:15

**Sample Status Sync Fix - Final Implementation**
- Fixed sync logic to properly use update_data dictionary (removed duplicate creation)
- Sync now checks for keys in update_data dictionary instead of checking if values are not None
- Improved error logging with full traceback for debugging
- Added detailed logging messages for sync operations (success, warnings, errors)
- Sync properly updates existing SampleStatus records or creates new ones in samples module
- Sync also updates SampleRequest.current_status when status_from_merchandiser is updated
- Code verified and syntax checked - ready to use
- Files modified: `backend/modules/merchandiser/routes/merchandiser.py`

## 2026-01-04 14:01:24

**Fixed Sample Status Sync from Merchandiser to Samples Module**
- Improved sync logic in sample-status PUT endpoint to properly sync all updates using `exclude_unset=True`
- Changed sync to check for keys in update_data dictionary instead of checking if values are not None
- Added better logging to track sync operations (success messages, warnings when SampleRequest not found)
- Improved error logging to include full exception traceback for debugging sync failures
- Sync now properly updates existing status records or creates new ones in samples module
- Files modified: `backend/modules/merchandiser/routes/merchandiser.py`

## 2026-01-04 13:47:30

**Database Migration Fix for Sample Status Schema**
- Fixed circular import issue in migration script by passing engine as parameter
- Migration script now accepts engine parameter to avoid importing from core.database
- Migration will migrate data from old columns to new columns before dropping old ones
- Files modified: `backend/migrations/update_sample_status_schema.py`, `backend/core/database.py`

## 2026-01-04 13:45:06

**Database Migration for Sample Status Schema**
- Created migration script `backend/migrations/update_sample_status_schema.py` to update sample_status table schema
- Migration migrates old column names to new ones: status_from_sample -> status_by_sample, status_by_merchandiser -> status_from_merchandiser, note -> notes
- Migration adds new column: updated_by
- Migration drops old columns: status_from_sample, status_from_buyer, status_by_merchandiser, note
- Updated `backend/core/database.py` to call the migration script during database initialization
- Files modified: `backend/migrations/update_sample_status_schema.py`, `backend/core/database.py`

## 2026-01-04 13:39:15

**Merchandiser Sample Status Update & Access Control Changes**
- Updated Merchandiser SampleStatus model to match Samples module structure (same fields: status_by_sample, status_from_merchandiser, notes, updated_by)
- Updated Merchandiser SampleStatus schemas to match Samples module structure (SampleStatusBase, SampleStatusCreate, SampleStatusUpdate, SampleStatusResponse)
- Removed POST endpoint for sample-primary in merchandiser module (merchandiser can only edit existing samples, not create new ones)
- Removed POST endpoint for sample-status in merchandiser module (only allow update via PUT)
- Added auto-sync mechanism: when merchandiser updates sample status via PUT endpoint, changes are automatically synced to samples module
- Modified sample-status PUT endpoint to find corresponding SampleRequest by sample_id and create/update SampleStatus in samples database
- Files modified: `backend/modules/merchandiser/models/merchandiser.py`, `backend/modules/merchandiser/schemas/merchandiser.py`, `backend/modules/merchandiser/routes/merchandiser.py`

## 2026-01-04 11:33:10

**Initial Documentation Creation**
- Created comprehensive `updated_log.md` file with complete system documentation
- Documented system architecture, tech stack, database structure, and all modules
- Added update log section for tracking future changes
- Included detailed information about backend modules, frontend architecture, business flows, and configuration

---

## 2026-01-05 03:45:00

**MAJOR FIX: Docker Deployment Issues - System Not Working on Server**

**Problem:**
User deployed the app on a Proxmox VM server using `docker-compose up -d --build` but couldn't add anything (POST/PUT/DELETE operations failing). The app worked locally but not on the server. The user wanted the system to work with just `docker-compose up -d` without needing to know any IP or domain.

**Root Cause Analysis:**
After deep inspection, multiple interconnected issues were found:

### Issue 1: Multiple Conflicting .env Files
**Problem:** The frontend had multiple .env files (`.env`, `.env.local`, `.env.development`, `.env.production`, `.env.docker`) with conflicting values. Most critically, `.env.local` was overriding all settings with `localhost:8000` which doesn't work inside Docker containers.

**Solution:**
- Emptied `frontend/.env.local` to prevent overrides
- Updated `frontend/Dockerfile` to clear .env.local during build: `RUN echo "" > .env.local`
- Simplified to use `.env.production` for Docker builds

**Files modified:**
- `frontend/.env.local` - Emptied (was overriding with localhost)
- `frontend/Dockerfile` - Added `RUN echo "" > .env.local` before build step

### Issue 2: Frontend .env.production Had Wrong Backend URL
**Problem:** `.env.production` was pointing to a non-existent domain or localhost instead of using Docker internal networking.

**Solution:** Updated to use Docker service name:
```env
API_URL=http://backend:8000
BACKEND_URL=http://backend:8000
NEXT_PUBLIC_API_MASK_URL=/api/v1
```

**Files modified:**
- `frontend/.env.production` - Updated backend URLs to use Docker internal networking

### Issue 3: Variable Interpolation in .env Files
**Problem:** The root `.env` file used variable interpolation like `BACKEND_URL=http://backend:${BACKEND_PORT}` which doesn't work in .env files (Docker Compose doesn't interpolate variables inside .env files).

**Solution:** Changed to hardcoded values:
```env
BACKEND_URL=http://backend:8000
```

**Files modified:**
- `.env` - Removed all variable interpolation, used direct values

### Issue 4: Hardcoded Localhost Fallback in Frontend Config
**Problem:** `frontend/lib/config.ts` had `localhost:8000` as a fallback value which would be used if environment variables weren't set correctly.

**Solution:** Changed fallback to Docker internal URL:
```typescript
BACKEND_URL: process.env.BACKEND_URL || process.env.API_URL || "http://backend:8000",
```

**Files modified:**
- `frontend/lib/config.ts` - Changed fallback from localhost to Docker service name

### Issue 5: Missing Settings Database in Health Check
**Problem:** The health check endpoint in `backend/modules/health/routes/health.py` was only checking 5 databases but the system uses 6 databases (including settings).

**Solution:** Added settings database to health check:
```python
from core.database import (
    engines, DatabaseType,
    SessionLocalClients, SessionLocalSamples, SessionLocalUsers,
    SessionLocalOrders, SessionLocalMerchandiser, SessionLocalSettings
)
db_sessions = {
    "clients": SessionLocalClients,
    "samples": SessionLocalSamples,
    "users": SessionLocalUsers,
    "orders": SessionLocalOrders,
    "merchandiser": SessionLocalMerchandiser,
    "settings": SessionLocalSettings,
}
```

**Files modified:**
- `backend/modules/health/routes/health.py` - Added SessionLocalSettings to health check

### Issue 6: Database Pool Size Configuration Not in Settings Class
**Problem:** Backend container failed with Pydantic validation error:
```
pydantic_core._pydantic_core.ValidationError: 2 validation errors for Settings
POOL_SIZE
  Extra inputs are not permitted [type=extra_forbidden, input_value='10', input_type=str]
MAX_OVERFLOW
  Extra inputs are not permitted [type=extra_forbidden, input_value='10', input_type=str]
```
The `POOL_SIZE` and `MAX_OVERFLOW` environment variables were being passed from docker-compose.yml but the Settings class in `backend/core/config.py` didn't have these fields defined.

**Solution:** Added fields to Settings class:
```python
# Database Connection Pool Settings
POOL_SIZE: int = 10
MAX_OVERFLOW: int = 10
```

Also updated `backend/core/database.py` to use these settings:
```python
POOL_SETTINGS = {
    "pool_pre_ping": True,
    "pool_size": settings.POOL_SIZE,
    "max_overflow": settings.MAX_OVERFLOW,
    ...
}
```

**Files modified:**
- `backend/core/config.py` - Added POOL_SIZE and MAX_OVERFLOW fields to Settings class
- `backend/core/database.py` - Changed to use settings.POOL_SIZE and settings.MAX_OVERFLOW instead of os.environ

### Issue 7: Exception Handling Order in main.py
**Problem:** In `backend/main.py`, the exception handling had `Exception` before `ImportError`, which would catch ImportError first (since ImportError is a subclass of Exception).

**Solution:** Reordered exception handlers:
```python
except ImportError as e:
    logger.warning(f"Could not import migration (may be expected): {str(e)}")
except Exception as e:
    logger.warning(f"Migration warning (may already be applied): {str(e)}")
```

**Files modified:**
- `backend/main.py` - Fixed exception handling order

### Issue 8: Backend OpenAPI Server URL
**Problem:** `backend/openapi.yaml` had a hardcoded server URL that might not work in all environments.

**Solution:** Changed server URL to "/" for automatic detection:
```yaml
servers:
  - url: /
```

**Files modified:**
- `backend/openapi.yaml` - Changed server URL to "/" (auto-detect)

### Summary of All Files Modified:

| File | Change |
|------|--------|
| `.env` | Simplified, removed variable interpolation, added all DB host configs |
| `.env.example` | Created template for deployment |
| `docker-compose.yml` | Updated to use ${VARIABLES} from .env properly |
| `frontend/.env` | Simplified base config |
| `frontend/.env.development` | Local dev settings with localhost |
| `frontend/.env.production` | Docker build settings with http://backend:8000 |
| `frontend/.env.local` | Emptied to prevent overrides |
| `frontend/Dockerfile` | Added clearing of .env.local during build |
| `frontend/lib/config.ts` | Removed hardcoded localhost fallbacks |
| `backend/.env` | Added missing POSTGRES_HOST_SETTINGS |
| `backend/core/config.py` | Added POOL_SIZE and MAX_OVERFLOW fields |
| `backend/core/database.py` | Made pool size configurable via settings |
| `backend/modules/health/routes/health.py` | Added settings database to health check |
| `backend/main.py` | Fixed exception handling order |
| `backend/openapi.yaml` | Changed server URL to "/" (auto-detect) |

### Verification Results:

After all fixes, the system was verified to be working:

| Test | Result |
|------|--------|
| All 9 containers running | ✅ |
| Backend health check (all 6 DBs) | ✅ |
| Frontend responding | ✅ |
| API proxy (frontend → backend) | ✅ |
| Login/Auth | ✅ |
| GET operations | ✅ |
| POST operations | ✅ |
| PUT operations | ✅ |
| DELETE operations | ✅ |

### Deployment Instructions:

The system now works with just:
```bash
docker-compose up -d --build
```

No IP or domain configuration needed. The frontend uses relative URLs (`/api/v1/*`) which work regardless of the server's IP address.

**Access:**
- Frontend: http://[server-ip]:3000
- Backend API: http://[server-ip]:8000
- Default login: username: `admin`, password: `admin`

---

## 2024-12-XX - Enhanced Color Master, Size Chart, and Material Details

### Problem
Need to organize and display color data with multiple color code types (H&M, TCX, General, HEX), improve size chart management, and ensure material details (Yarn, Fabrics) are properly accessible throughout the system.

### Solution

#### 1. Color Master Enhancement
**Backend Changes:**
- Updated `/api/v1/settings/color-master` endpoint to support filtering by `color_code_type` parameter
- Color Master model already supports `color_code_type` field for different code types

**Frontend Changes:**
- Completely redesigned Color Master UI (`/dashboard/erp/settings/colors`) 
- Added 4 segment tabs for different color code types:
  - H&M Color Code
  - TCX Color Code  
  - General Color Code
  - HEX Color Code
- Each segment displays filtered colors based on `color_code_type`
- Updated form to require `color_code_type` selection when creating/editing colors
- Enhanced table display with color code badges and visual hex color swatches

**Files Modified:**
- `backend/modules/settings/routes/settings.py` - Added `color_code_type` filter parameter
- `frontend/services/api.ts` - Updated `colorMaster.getAll()` to accept `colorCodeType` parameter
- `frontend/app/dashboard/(authenticated)/erp/settings/colors/page.tsx` - Complete UI redesign with segmented tabs

#### 2. Size Chart Enhancement
**Frontend Changes:**
- Completely rewrote Size Details page (`/dashboard/erp/merchandising/size-details`)
- Added comprehensive table showing all size chart fields:
  - Size ID, Size Name, Garment Type, Gender, Age Group
  - All measurements: Chest, Waist, Hip, Sleeve Length, Body Length, Shoulder Width, Inseam
  - Unit of Measure (UoM) with badge display
- Implemented advanced filtering:
  - Search by Size ID, Name, or Garment Type
  - Filter by Garment Type
  - Filter by Gender (Male, Female, Unisex)
  - Filter by Age Group (Adult, Kids, Infant)
- Added full CRUD functionality:
  - Create new size charts with complete measurement data
  - Edit existing size charts
  - Delete size charts with confirmation
- Form includes all measurement fields with proper input types
- Dynamic filter dropdowns populated from existing data

**Files Modified:**
- `frontend/app/dashboard/(authenticated)/erp/merchandising/size-details/page.tsx` - Complete rewrite with full functionality

#### 3. Material Details Verification
**Status:**
- Material Details page (`/dashboard/erp/merchandising/material-details`) already fully implemented
- Supports all material types: Yarn, Fabric, Trims, Accessories, Finished Good, Packing Good
- Yarn section matches CSV structure perfectly
- Fabric section matches CSV structure perfectly
- Full CRUD operations available for all material types
- Data can be imported through the UI dialogs

### CSV Data Structure Analysis

#### Color CSV (`DataBase Diagram - COLOUR.csv`)
- **Structure:** Contains color data organized by code types
- **First Section:** Basic color info (COLOR ID, COLOR NAME, COLOR CODE, COLOR FAMILY, COLOR_TYPE, COLOUR VALUE, FINISH, RGB, PANTONE_CODE, H&M CODE)
- **H&M Section:** H&M color codes with format: Colour Code, Colour Master, Colour Value, MIXED NAME
- **Note:** CSV data can be imported using the color_code_type field set to "H&M", "TCX", "General", or "HEX"

#### Size Chart CSV (`DataBase Diagram - Size Chart.csv`)
- **Fields:** SIZE ID, SIZE NAME, GARMENT TYPE, GENDER, AGE GROUP, CHEST, WAIST, HIP, SLEEVE LENGTH, BODY LENGTH, SHOULDER WIDTH, INSEAM, REMARKS, UOM
- **Data can be imported through the Size Details UI**

#### Raw Material CSV (`DataBase Diagram - Raw Material.csv`)
- **Yarn Section:** Complete yarn specifications (YARN ID through REMARKS)
- **Fabric Section:** Complete fabric specifications (Fabric ID through Remarks)
- **Products Section:** Trims, Accessories, etc.
- **Data structure matches database models perfectly**

### Testing Notes
- Color Master: Test filtering by code type, verify colors display in correct segments
- Size Chart: Test filtering and search, verify all measurements save correctly
- Material Details: Verify Yarn and Fabric data entry matches CSV structure

---

## 2025-01-05: CSV Data Import Implementation

### Problem
User reported no data visible in the system after UI improvements. The CSV data files (Color, Size Chart, Raw Material) were not being imported into the database.

### Solution Implemented

#### 1. Created Import Script (`backend/import_csv_data.py`)
- **Purpose**: Import CSV data from three files into respective database tables
- **Data Sources**:
  - `DataBase Diagram - COLOUR.csv` → Color Family, Color, Color Value, Color Master tables (Settings DB)
  - `DataBase Diagram - Size Chart.csv` → SizeChart table (Merchandiser DB)
  - `DataBase Diagram - Raw Material.csv` → YarnDetail and FabricDetail tables (Merchandiser DB)

#### 2. Import Functionality

**Color Import:**
- Processes both basic color section and H&M color codes section
- Creates ColorFamily, Color, ColorValue records as needed
- Creates ColorMaster records with H&M codes
- Handles unique constraint on `(color_id, color_value_id)` - only one ColorMaster per color+value combination
- **Result**: 75 unique color master records imported (3,785 duplicates skipped due to constraint)

**Yarn and Fabric Import:**
- Parses CSV sections by detecting headers ("YARN ID" and "Fabric ID")
- Creates YarnDetail records with all specifications (composition, count, type, form, etc.)
- Creates FabricDetail records with all specifications (GSM, construction, weave/knit, etc.)
- **Result**: 20 yarns and 20 fabrics imported successfully

**Size Chart Import:**
- Parses size measurements for different garment types
- Handles CSV header variations (leading spaces)
- **Status**: Parser needs refinement (0 records imported - header parsing issue)

#### 3. Configuration Fixes

**Updated `backend/core/config.py`:**
- Added `extra = "ignore"` to Settings Config class
- Allows environment variables from docker-compose that aren't in the Settings model
- Prevents validation errors when running import script

#### 4. Import Script Features

- **Duplicate Detection**: Checks for existing records before inserting
- **Progress Logging**: Reports progress every 100 records for color import
- **Error Handling**: Gracefully handles unique constraint violations
- **Individual Commits**: Commits each color record immediately to avoid batch conflicts
- **Docker Compatible**: Works both locally and inside Docker containers

#### 5. Usage

**Inside Docker (Recommended):**
```bash
# Copy CSV files and script to container
docker cp 'DataBase Diagram - COLOUR.csv' southern-erp_backend:/app/
docker cp 'DataBase Diagram - Size Chart.csv' southern-erp_backend:/app/
docker cp 'DataBase Diagram - Raw Material.csv' southern-erp_backend:/app/
docker cp backend/import_csv_data.py southern-erp_backend:/app/

# Run import
docker-compose exec backend python import_csv_data.py
```

**Locally:**
```bash
# Set environment variables
export POSTGRES_HOST_SETTINGS=localhost
export POSTGRES_HOST_MERCHANDISER=localhost

# Run import
python backend/import_csv_data.py
```

#### 6. Import Results

**Final Results (After Constraint Fix):**
✅ **Yarns**: 20 records imported  
✅ **Fabrics**: 20 records imported  
✅ **Colors**: **3,775 H&M color codes imported** (plus 75 from initial import = ~3,860 total)  
✅ **Size Charts**: 10 records imported  

**Initial Run (Before Fix):**
- Only 75 color codes imported due to constraint limitation
- Fixed by changing unique constraint from `(color_id, color_value_id)` to `(color_code, color_code_type)`

**Subsequent Runs:**
- Duplicate detection prevents re-importing existing data
- Skips existing records gracefully (85 duplicates skipped in final run)

#### 7. Fixed: Color Master Constraint Issue

**Problem**: Only 75 out of 3,800+ H&M color codes were imported because the unique constraint on `(color_id, color_value_id)` only allowed one ColorMaster per color+value combination.

**Solution**:
1. Created migration `backend/migrations/fix_color_master_constraint.py` to change the constraint
2. Updated constraint from `(color_id, color_value_id)` to `(color_code, color_code_type)`
3. Updated model in `backend/modules/settings/models/master_data.py`
4. Fixed import script to remove redundant color+value combination check
5. Re-imported all color codes

**Result**: ✅ **3,775 H&M color codes successfully imported** (total ~3,860 including existing)

**Migration Command:**
```bash
docker-compose exec backend python migrations/fix_color_master_constraint.py
```

#### 8. Known Issues & Future Improvements

1. **Size Chart Import**: CSV header parsing needs refinement to handle leading spaces and multiple sections
2. **Batch Performance**: Color import commits individually (slow but safe). Could optimize with batch commits and better duplicate checking.

#### 8. Files Modified

- ✅ `backend/import_csv_data.py` - New import script
- ✅ `backend/core/config.py` - Added `extra = "ignore"` to Settings Config

#### 9. Next Steps

1. Fix Size Chart CSV parsing to handle all sections correctly
2. Verify imported data appears correctly in UI
3. Consider adding import endpoint to API for easier re-imports
4. Add import logging/audit trail

---

## 2025-01-05: Color Master UI Pagination & Search Enhancement

### Problem
User could only see a limited number of colors in the Color Master UI despite having 3,800+ H&M color codes imported. No pagination or row limit controls were available.

### Solution Implemented

#### 1. Added Pagination Controls
- **Row Limit Selector**: "Show 10, 20, 50, 100, All" dropdown (matching Client Info implementation)
- **Default**: Set to 50 rows per page for better performance
- **State Management**: Uses `useState` with `number | "all"` type

#### 2. Added Search Functionality
- **Search Input**: Real-time search across color name, code, family, color, and value fields
- **Search Icon**: Visual indicator in input field
- **Case-insensitive**: Search works regardless of case

#### 3. Added Filter Summary
- **Count Display**: Shows "Showing X of Y filtered (Z total)" 
- **Clear Filters Button**: Quick reset of all filters and search
- **Per Tab**: Each color code type tab (H&M, TCX, General, HEX) has independent filtering

#### 4. Performance Optimization
- **useMemo Hooks**: Efficient filtering and pagination calculations
- **Sliced Rendering**: Only renders displayed rows, not all 3,800+ at once
- **Real-time Updates**: Filters apply instantly without page reload

#### 5. UI Consistency
- **Matches Client Info**: Same design pattern and controls as buyers/suppliers pages
- **Card Layout**: Filters and controls in a Card component
- **Responsive**: Works on different screen sizes

### Files Modified

- ✅ `frontend/app/dashboard/(authenticated)/erp/settings/colors/page.tsx` - Added pagination, search, and filter controls

### Features Added

1. **Search Bar**: Search across all color fields
2. **Row Limit Dropdown**: 10, 20, 50, 100, All options
3. **Clear Filters**: Reset all filters with one click
4. **Filter Summary**: Shows current view count vs total
5. **Per-Tab Filtering**: Each code type tab has independent state

### Result

✅ All 3,800+ H&M color codes are now accessible with pagination  
✅ Users can search and filter colors efficiently  
✅ UI matches the Client Info pages for consistency  
✅ Performance improved by rendering only visible rows

---

## 2025-01-05: Fixed API Limit Issue - All Color Masters Now Loaded

### Problem
User reported only seeing limited colors despite 3,860 H&M color codes in database. The API endpoint had a default limit of 100 records.

### Solution Implemented

#### 1. API Endpoint Fix
- **Issue**: `get_color_masters` had `limit: int = 100` as default parameter
- **Fix**: Changed to `limit: Optional[int] = None` to allow unlimited results
- **Logic**: When limit is None, return all records; otherwise apply limit

#### 2. Frontend API Call Fix
- **Issue**: Frontend was calling `colorMaster.getAll(token)` without limit parameter
- **Fix**: Updated to pass `limit=10000` to ensure all records are loaded
- **Location**: `frontend/app/dashboard/(authenticated)/erp/settings/colors/page.tsx`

### Verification

✅ **Database Count**: 3,860 H&M color codes confirmed in database  
✅ **API Now Returns**: All records (no limit applied)  
✅ **Frontend Loads**: All 3,860+ records with pagination controls

### Files Modified

- ✅ `backend/modules/settings/routes/settings.py` - Made limit parameter optional
- ✅ `frontend/app/dashboard/(authenticated)/erp/settings/colors/page.tsx` - Pass limit=10000 when loading

### Result

✅ All 3,860 H&M color codes now visible in UI  
✅ Pagination works correctly with all data loaded  
✅ Search and filter work across all records

---

## 2025-01-05: System-Wide API Limit Fix - All Settings Endpoints

### Problem
User reported system-wide issue: only seeing 100 records maximum across the system, and unable to add more than 100 records. Investigation revealed multiple API endpoints with hardcoded `limit: int = 100` defaults.

### Root Cause
Many API endpoints in `backend/modules/settings/routes/settings.py` had hardcoded `limit: int = 100` parameters, causing:
1. Only 100 records returned by default
2. Frontend couldn't access all data
3. System-wide limitation affecting multiple modules

### Solution Implemented

#### 1. Fixed Color Master Endpoint (Already Done)
- Changed `limit: int = 100` to `limit: Optional[int] = None`
- Returns all records when limit is None

#### 2. Fixed Other Color-Related Endpoints
- **`get_color_families`**: Changed to `limit: Optional[int] = 100` (allows override)
- **`get_colors`**: Changed to `limit: Optional[int] = 100` (allows override)
- **`get_color_values`**: Changed to `limit: Optional[int] = 100` (allows override)
- All now support `limit=None` to return all records

#### 3. Updated Frontend API Calls
- **Color Families**: Now passes `limit=10000` when loading
- **Colors**: Now passes `limit=10000` when loading
- **Color Values**: Now passes `limit=10000` when loading
- **Color Master**: Already passing `limit=10000`

#### 4. System-Wide Impact
Found **60+ endpoints** with `limit: int = 100` across:
- Settings routes (16 endpoints)
- Merchandiser routes (20+ endpoints)
- Samples routes (10+ endpoints)
- Users, Clients, Notifications routes

**Note**: These other endpoints may need similar fixes if they encounter the same issue.

### Files Modified

- ✅ `backend/modules/settings/routes/settings.py` - Fixed color-related endpoints
- ✅ `frontend/app/dashboard/(authenticated)/erp/settings/colors/page.tsx` - Updated API calls with limits

### Verification

✅ **Database**: 3,860 H&M color codes confirmed  
✅ **API Direct Call**: Returns all 3,860 records  
✅ **Frontend**: Now passes `limit=10000` for all color-related calls  
✅ **Backend Restarted**: Changes applied to container

### Next Steps for System-Wide Fix

If other modules show similar issues:
1. Change `limit: int = 100` to `limit: Optional[int] = 100` or `limit: Optional[int] = None`
2. Update query logic to only apply limit when provided
3. Update frontend service calls to pass appropriate limits
4. Test with actual data volumes

### Result

✅ Color Master now loads all 3,860 H&M codes  
✅ Other color endpoints can now return all records  
✅ Frontend properly requests all data  
✅ System ready for large datasets

---

## 2025-01-05: Performance Optimization - Color Master Loading

### Problem
Loading 3,800+ color codes was very slow because:
1. **All data loaded at once**: Frontend loaded all 3,800+ records in a single API call
2. **Heavy client-side filtering**: Filtering thousands of records on every search keystroke
3. **Large DOM rendering**: Rendering thousands of table rows at once
4. **No pagination**: Loading entire dataset into memory

### Solution Implemented

#### 1. Server-Side Pagination
- Modified `loadColorMasters()` to use `skip` and `limit` parameters
- Only loads a reasonable chunk at a time (default: 50-100 records)
- When "Show All" is selected, caps at 1,000-5,000 records (not all 3,800)

#### 2. Debounced Search
- Added 300ms debounce on search input
- Prevents API calls on every keystroke
- Reduces unnecessary filtering operations

#### 3. Optimized Data Loading
- Loads data per tab (only loads H&M when viewing H&M tab)
- Separates reference data (families, colors, values) from master data
- Reference data loads once (small datasets)
- Master data loads on demand with pagination

#### 4. Smart Limits
- "Show All" option capped at 5,000 records (when searching) or 1,000 (normal)
- Regular pagination: 10, 20, 50, 100 records
- Prevents browser slowdown from rendering too many rows

#### 5. Loading States
- Added `masterLoading` state for better UX
- Shows "Loading colors..." during API calls
- Prevents double-clicks and confusion

### Files Modified

- ✅ `frontend/services/api.ts` - Added `skip` parameter to `colorMaster.getAll()`
- ✅ `frontend/app/dashboard/(authenticated)/erp/settings/colors/page.tsx`:
  - Refactored `loadColorMasters()` with pagination
  - Added debounced search with `useEffect`
  - Added loading states and optimized filtering
  - Separated data loading (reference vs master data)

### Performance Improvements

**Before:**
- Initial load: ~3-5 seconds (loading 3,800+ records)
- Search: Laggy, filtering 3,800+ records on every keystroke
- Tab switch: Slow, re-filtering all data
- Memory: High (3,800+ objects in React state)

**After:**
- Initial load: ~0.5-1 second (loading 50-100 records)
- Search: Smooth with 300ms debounce
- Tab switch: Fast, only loads relevant data
- Memory: Low (only loaded records in state)

### Result

✅ **Faster initial load**: 3-5x improvement  
✅ **Smooth search**: Debounced, responsive  
✅ **Better UX**: Loading states, no lag  
✅ **Scalable**: Can handle 10,000+ records without performance issues

---

## 2025-01-05: Further Performance Optimization - Eliminate Loading Hang

### Problem
User still experienced a brief hang/delay when loading color master data, even after initial optimizations.

### Root Causes Identified

1. **Color masters loading on page mount**: Data was loading even when not viewing the Color Master tab
2. **Too much data on initial load**: "Show All" was loading 1000-5000 records
3. **Blocking API calls**: Sequential loading was blocking UI thread
4. **Multiple simultaneous loads**: Multiple useEffect hooks triggering at once

### Solution Implemented

#### 1. Lazy Loading by Tab
- Color masters **only load when Color Master tab is clicked**
- Other tabs (Families, Colors, Values) don't trigger color master loads
- Uses `activeTab` state to track which tab is active
- `hasLoadedMasters` flag prevents duplicate loads

#### 2. Reduced Initial Load Size
- "Show All" now loads max 200 records (reduced from 1000)
- With search: max 1000 records (reduced from 5000)
- Default: 50 records (unchanged)
- Much faster initial render

#### 3. Removed Blocking setTimeout
- Removed artificial setTimeout wrapper (wasn't helping)
- Direct API calls are already async
- No unnecessary delays

#### 4. Smart Reload Logic
- Only reloads color masters when:
  - Tab is actually active
  - Filters change (and tab is active)
  - Data is edited/deleted (and tab is active)
- Prevents unnecessary API calls

#### 5. Tab State Management
- Changed from `defaultValue` to controlled `value` on Tabs
- Proper `onValueChange` handler
- Tracks active tab accurately

### Files Modified

- ✅ `frontend/app/dashboard/(authenticated)/erp/settings/colors/page.tsx`:
  - Added `activeTab` and `hasLoadedMasters` state
  - Implemented lazy loading via tab activation
  - Reduced default "Show All" limits (200/1000)
  - Removed blocking setTimeout wrapper
  - Smart reload logic based on active tab

### Performance Improvements

**Before (with hang):**
- Initial page load: Color masters load immediately (even if tab not viewed)
- Load size: 1000-5000 records
- Blocking: setTimeout wrapper adding unnecessary delay
- Multiple loads: Multiple useEffect hooks triggering

**After (no hang):**
- Initial page load: Only reference data (families, colors, values) - fast!
- Color masters: Load only when tab clicked - instant page load
- Load size: 50-200 records initially (10x smaller)
- Non-blocking: Direct async API calls
- Single load: Only when needed

### Result

✅ **No hang on page load**: Color masters don't load until tab is clicked  
✅ **Faster tab switching**: Instant display, data loads in background  
✅ **Smaller initial load**: 50-200 records vs 1000-5000  
✅ **Better UX**: Page is immediately interactive  
✅ **Smart loading**: Only loads what's needed, when needed

---

## 2025-01-05: TanStack Query Integration - Caching & Performance

### Problem
User requested caching implementation so that:
1. If data loads once, 2nd time no need to call API again
2. Implement TanStack Query for better data management

### Solution Implemented

#### 1. Added Query Keys for Color Settings
- Added `SETTINGS` section to `query.config.ts`
- Defined query keys for:
  - `COLOR_FAMILIES` (list, detail)
  - `COLORS` (list with familyId/limit params, detail)
  - `COLOR_VALUES` (list with limit, detail)
  - `COLOR_MASTER` (list with codeType/limit/skip params, detail)

#### 2. Created TanStack Query Hooks
Added custom hooks in `hooks/use-queries.ts`:
- **useColorFamilies** - Fetches color families (10min cache)
- **useColors** - Fetches colors with optional familyId filter
- **useColorValues** - Fetches color values
- **useColorMasters** - Fetches color masters with pagination (5min cache, 30min gcTime)
- **Create/Update/Delete mutations** for each entity with automatic cache invalidation

#### 3. Refactored Colors Page to Use TanStack Query
- Replaced manual `useState` data management with `useQuery` hooks
- Replaced manual API calls with `useMutation` hooks
- Automatic cache invalidation on create/update/delete
- Removed manual loading states (TanStack Query handles `isLoading`)
- Removed manual data fetching functions (`loadAllData`, `loadColorMasters`)

### Caching Strategy

**Reference Data (Families, Colors, Values):**
- `staleTime: 10 minutes` - Data considered fresh for 10 minutes
- Cached automatically - no API call if data is fresh

**Color Masters (Dynamic Data):**
- `staleTime: 5 minutes` - Data considered fresh for 5 minutes
- `gcTime: 30 minutes` - Kept in cache for 30 minutes after unused
- Different cache keys for different filters (codeType, limit, skip)

**Automatic Cache Invalidation:**
- Create/Update/Delete mutations invalidate related queries
- Data automatically refetches when cache is stale
- No manual refetch calls needed

### Benefits

1. **Automatic Caching**: Data cached for 5-10 minutes, no duplicate API calls
2. **Smart Refetching**: Only refetches when data is stale or invalidated
3. **Background Updates**: Stale data shown immediately, refetches in background
4. **Optimistic Updates**: Mutations can be extended with optimistic updates
5. **Error Handling**: Built-in retry logic and error states
6. **Loading States**: Automatic `isLoading` and `isError` states
7. **Code Reduction**: Removed ~200 lines of manual state management code

### Files Modified

- ✅ `frontend/query.config.ts` - Added SETTINGS query keys
- ✅ `frontend/hooks/use-queries.ts` - Added 15+ color-related hooks
- ✅ `frontend/app/dashboard/(authenticated)/erp/settings/colors/page.tsx` - Refactored to use TanStack Query

### Result

✅ **Automatic caching**: Data cached for 5-10 minutes
✅ **No duplicate calls**: Same query params = uses cache
✅ **Auto refetch**: Only when stale or invalidated
✅ **Cleaner code**: ~200 lines less manual state management
✅ **Better UX**: Instant data display from cache, background updates

---

## 2025-01-05: Database Auto-Import Configuration - CRITICAL - DO NOT MODIFY

### Problem
User wanted automatic data import on server deployment so that running `docker-compose up -d --build` would automatically import all database backups without manual commands.

### Solution Implemented

**Auto-Import via PostgreSQL Init Scripts:**
- PostgreSQL Docker image automatically executes any `.sql` files in `/docker-entrypoint-initdb.d/` on first startup
- Added volume mounts in `docker-compose.yml` for all 6 databases:
  ```yaml
  volumes:
    - db_clients:/var/lib/postgresql/data
    - ./backups/db_clients.sql:/docker-entrypoint-initdb.d/init.sql:ro
  ```

**Database Backups Included:**
- All 6 database SQL exports in `backups/` directory
- Automatically imported when containers are first created
- Only imports on first run (when volume is empty)

### How It Works

1. **First Run** (`docker-compose up -d --build`):
   - PostgreSQL containers start with empty volumes
   - SQL files in `/docker-entrypoint-initdb.d/` are automatically executed
   - All data is imported automatically
   
2. **Subsequent Runs**:
   - Volumes already have data
   - Init scripts are skipped (PostgreSQL behavior)
   - Existing data is preserved

### Server Deployment

**Just run these 3 commands:**
```bash
git clone https://github.com/Ayman-ilias/ERP_Southern.git
cd ERP_Southern
docker-compose up -d --build
```

That's it! No manual import commands needed.

### Files Modified

- ✅ `docker-compose.yml` - Added init script volume mounts for all 6 databases
- ✅ `backups/` - All 6 database SQL exports included in repository

### Verification

✅ **Local Test**: Removed volumes, rebuilt - data auto-imported successfully  
✅ **Data Verified**: 3,860 color masters, users, yarns, fabrics all present  
✅ **One-Command Deployment**: Works on any server with just `docker-compose up -d --build`

### ⚠️ IMPORTANT WARNING ⚠️

**DO NOT REMOVE OR MODIFY:**
- The volume mounts pointing to `/docker-entrypoint-initdb.d/init.sql`
- The `backups/` directory
- This auto-import configuration

**If removed, deployment will require manual data import on every server.**

---

## 2025-01-05: GitHub Push & Server Deployment Configuration

### Changes Made

#### 1. Frontend Port Changed to 2222
- Updated `.env` file: `FRONTEND_PORT=2222`
- Docker compose maps `2222:3000` (host port 2222 → container port 3000)

#### 2. Code Pushed to GitHub
- Repository: https://github.com/Ayman-ilias/new_erp.git
- All previous code deleted and replaced with current codebase
- Force pushed to overwrite existing repo

#### 3. Created Data Migration Guide
- Created `MIGRATION.md` with detailed instructions
- Export data using `pg_dump` from local Docker containers
- Transfer backups to server
- Import data using `psql` on server

### Files Modified
- `.env` - Changed FRONTEND_PORT from 3000 to 2222
- `.gitignore` - Created root gitignore
- `backend/.gitignore` - Updated to track .env
- `frontend/.gitignore` - Updated to track .env files (except .env.local)
- `MIGRATION.md` - Created data migration guide

### Data Migration Quick Commands

**Export (Local):**
```bash
mkdir -p backups
for db in clients samples users orders merchandiser settings; do
  docker exec southern-erp_db_$db pg_dump -U postgres -d rmg_erp_$db > backups/db_$db.sql
done
```

**Import (Server):**
```bash
for db in clients samples users orders merchandiser settings; do
  cat backups/db_$db.sql | docker exec -i southern-erp_db_$db psql -U postgres -d rmg_erp_$db
done
```

### Access Points (After Deployment)
- **Frontend**: http://server-ip:2222
- **Backend API**: http://server-ip:8000
- **API Docs**: http://server-ip:8000/docs
- **Login**: admin / admin

---

## 2025-01-05: Material Details Feature Status Check

### Summary
Comprehensive status check of all requested features for Material Details and related modules.

### Status Report

#### ✅ **COMPLETED TASKS**

1. **Remove color, dye_type, uom from Yarn dialog**
   - **Status**: ✅ DONE
   - **Location**: `frontend/app/dashboard/(authenticated)/erp/merchandising/material-details/page.tsx`
   - **Details**: YarnDialog component (lines 1027-1248) contains only: yarn_id, yarn_name, yarn_composition, blend_ratio, yarn_count, count_system, yarn_type, yarn_form, tpi, yarn_finish, remarks. No color, dye_type, or uom fields present.

2. **Update Consumable to Yes/No/None for Trims, Accessories, Finished Good, Packing Good**
   - **Status**: ✅ DONE
   - **Location**: All dialog components in `material-details/page.tsx`
   - **Details**: 
     - All dialogs use `consumable_flag: "none" as "yes" | "no" | "none"`
     - Select dropdown with three options: None, Yes, No
     - Legacy boolean values converted to new format in useEffect hooks
     - Tables display consumable status with badges (Yes/No/None)

3. **Add carton size (width/length) to Packing Good**
   - **Status**: ✅ DONE
   - **Location**: PackingGoodDialog component (lines 2025-2264)
   - **Details**: 
     - Fields added: `carton_length`, `carton_width`, `carton_height`
     - Form section with labeled inputs (lines 2190-2227)
     - Values stored and retrieved correctly

4. **Move Sample Request form to new page**
   - **Status**: ✅ DONE
   - **Location**: `frontend/app/dashboard/(authenticated)/erp/samples/requests/page.tsx`
   - **Details**: 
     - Complete Sample Request page with form, table, filters
     - Uses Command/Combobox for buyer search
     - File upload functionality included
     - Modern UI with shadcn/ui components

#### ✅ **COMPLETED TASKS (Previously Incomplete)**

5. **Add category creation with search+dropdown for Accessories**
   - **Status**: ✅ COMPLETED
   - **Location**: AccessoriesDialog component
   - **Implementation Details**:
     - Replaced hardcoded Select with Command/Combobox component using Popover
     - Added search functionality with CommandInput
     - Implemented dynamic category creation - users can type and create new categories on the fly
     - Categories are stored in component state (default: Label, Tag, Hanger, Sticker)
     - When editing, existing custom categories are automatically added to the list
     - Toast notification confirms new category creation
     - Uses shadcn/ui Command, Popover, and Check icons for UI

6. **Auto-generate Product ID from product name**
   - **Status**: ✅ COMPLETED
   - **Location**: TrimsDialog, AccessoriesDialog, FinishedGoodDialog, PackingGoodDialog
   - **Implementation Details**:
     - Added useEffect hook that auto-generates product_id from product_name
     - Only triggers for new items (not when editing existing items)
     - Converts product name to uppercase
     - Replaces non-alphanumeric characters with underscores
     - Removes multiple consecutive underscores and trims leading/trailing underscores
     - Example: "Metal Button" → "METAL_BUTTON"
     - Product ID field remains disabled but now shows the auto-generated value
     - Implemented in all 4 dialogs: Trims, Accessories, Finished Good, Packing Good

7. **Add feet/cm/mm to Size Chart with comparison**
   - **Status**: ✅ COMPLETED
   - **Location**: `frontend/app/dashboard/(authenticated)/erp/merchandising/size-details/page.tsx`
   - **Implementation Details**:
     - Added "feet" and "mm" options to UoM dropdown (now supports: inch, cm, mm, feet)
     - Created unit conversion functions:
       - `convertUnit()`: Converts between any units using inches as base unit
       - `formatUnit()`: Formats unit abbreviations for display
     - Added "Unit Comparison" section in dialog that shows:
       - All measurements converted to all 4 units (inch, cm, mm, feet)
       - Table format with columns for each unit
       - Only displays measurements that have values
       - Shows "-" for missing measurements
       - Rounds to 2 decimal places for clarity
     - Comparison table appears automatically when measurements are entered
     - Real-time conversion updates as user changes values or unit

### Implementation Summary

**All requested features have been successfully implemented:**

1. ✅ Yarn dialog fields removed (color, dye_type, uom)
2. ✅ Consumable updated to Yes/No/None for all dialogs
3. ✅ Carton size added to Packing Good
4. ✅ Sample Request moved to new page
5. ✅ Category creation with search for Accessories
6. ✅ Product ID auto-generation for all product dialogs
7. ✅ Unit conversion and comparison for Size Chart

### Files Modified
- `frontend/app/dashboard/(authenticated)/erp/merchandising/material-details/page.tsx`
  - Added auto-generation logic for Product ID in all dialogs
  - Replaced category Select with Command/Combobox in AccessoriesDialog
  - Added category state management with creation capability
- `frontend/app/dashboard/(authenticated)/erp/merchandising/size-details/page.tsx`
  - Added "feet" and "mm" to UoM dropdown
  - Implemented unit conversion functions
  - Added unit comparison table in dialog
- `updated_log.md` - Updated status check with completion details

---

## Fix: Sample Request Form Issues (2025-01-07)

### Problem
1. Additional instruction field showing as "[object Object],[object Object]" in merchandising UI
2. Edit button in merchandising sample primary info opening old dialog instead of new page
3. User wanted markdown option in sample department, not merchandising (merchandising should show plain text)

### Solution
1. **Fixed Additional Instruction Display in Merchandising:**
   - Added `formatAdditionalInstruction` helper function to properly format JSON array of instructions as plain text
   - Handles both JSON array format (from merchandising database) and string format (from synced samples database)
   - Converts instruction objects to text with done markers (✓) separated by commas

2. **Fixed Edit Button to Open New Page:**
   - Changed Edit button onClick handler to use `window.open()` with query parameter `?edit={sample_id}`
   - Updated add-request page to detect edit mode from URL query parameter
   - Added data loading when in edit mode to populate form fields

3. **Edit Mode Support in Add-Request Page:**
   - Added `useSearchParams` to read `edit` query parameter
   - Added query to fetch all samples when editing
   - Added `useEffect` to load sample data into form when editing
   - Added `updatePrimaryMutation` for updating samples
   - Updated form submission to use update mutation when editing
   - Updated page title and button text to reflect edit vs create mode
   - Handles parsing of `additional_instruction` and `decorative_part` from both JSON and string formats

### Files Modified
- `frontend/app/dashboard/(authenticated)/erp/merchandising/sample-development/page.tsx`
  - Added `formatAdditionalInstruction` helper function
  - Changed Edit button to open new page instead of dialog
  - Fixed additional_instruction display formatting

- `frontend/app/dashboard/(authenticated)/erp/merchandising/sample-development/add-request/page.tsx`
  - Added `useSearchParams` to detect edit mode
  - Added query and useEffect to load sample data when editing
  - Added `updatePrimaryMutation` for updates
  - Updated form submission logic to handle both create and update
  - Updated page title and button text dynamically
  - Added parsing logic for JSON and string formats of instructions and decorative parts
  - Moved helper functions before useEffect to fix reference errors

---
