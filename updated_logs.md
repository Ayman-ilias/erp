# Updated Logs - UOM System Redesign

## Date: 2026-01-07

### Summary
Complete redesign of the Unit of Measure (UOM) system for garments/textile industry with database-driven units, category-based organization, unit conversion, and system-wide integration.

---

## Backend Changes

### 1. Database Models Updated
**File:** `backend/modules/settings/models/master_data.py`

**UoMCategory Model - New Fields:**
- `icon` (String) - Lucide icon name for category
- `industry_use` (String) - Description of industry usage
- `sort_order` (Integer) - Display ordering

**UoM Model - New Fields:**
- `display_name` (String) - Formatted display name
- `is_si_unit` (Boolean) - Whether unit is SI standard
- `common_usage` (String) - Common usage description
- `decimal_places` (Integer) - Decimal precision
- `sort_order` (Integer) - Display ordering

### 2. Pydantic Schemas Updated
**File:** `backend/modules/settings/schemas/master_data.py`

**New Schemas Added:**
- `UoMCategoryWithUnits` - Category with unit count and base unit
- `UoMWithCategory` - UOM with category information
- `UoMConversionRequest` - Conversion request payload
- `UoMConversionResponse` - Conversion result with formula
- `UoMValidationRequest` - Symbol validation request
- `UoMValidationResponse` - Validation result
- `UoMForSelector` - Optimized for dropdown selectors

### 3. API Endpoints Added
**File:** `backend/modules/settings/routes/settings.py`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/uom-categories/with-counts` | GET | Dashboard data with unit counts |
| `/uom/convert` | POST | Convert between units |
| `/uom/compatible/{uom_id}` | GET | Get compatible units for conversion |
| `/uom/validate-symbol` | POST | Check symbol uniqueness |
| `/uom/search` | GET | Search units by name/symbol |
| `/uom/for-selector` | GET | Optimized for dropdown selectors |

### 4. Seed Data Updated
**File:** `backend/modules/settings/seed_data.py`

**9 Garment Industry Categories:**
1. **Length** - Fabric rolls, ribbons, trims (m, cm, mm, in, ft, yd, km)
2. **Weight** - Yarn, fabric, materials (kg, g, mg, lb, oz, MT)
3. **Quantity** - Buttons, zippers, labels (pcs, dz, gr, gg, pr, set, pk)
4. **Textile Density** - Fabric GSM, denim weight (gsm, oz/yd², g/m²)
5. **Yarn Count** - Yarn fineness (den, tex, dtex, Ne, Nm)
6. **Packaging** - Thread cones, fabric rolls (roll, cone, spool, hank, bale, ctn, box, bdl, bag)
7. **Area** - Leather hides, fabric yardage (m², cm², ft², yd², in²)
8. **Volume** - Dyes, chemicals (L, mL, m³, gal)
9. **Time** - SMV, production time (min, sec, hr, day)

---

## Frontend Changes

### 1. API Service Updated
**File:** `frontend/services/api.ts`

**New Methods in `settingsService.uomCategories`:**
- `getAllWithCounts(token, isActive?)` - Get categories with unit counts

**New Methods in `settingsService.uom`:**
- `convert(data, token)` - Convert between units
- `getCompatible(uomId, token)` - Get compatible units
- `validateSymbol(data, token)` - Validate symbol uniqueness
- `search(query, token, categoryId?, limit?)` - Search units
- `getForSelector(token, categoryId?, categoryName?)` - Get for selector

### 2. Query Configuration Updated
**File:** `frontend/query.config.ts`

**New Query Keys:**
- `UOM_CATEGORIES.LIST_WITH_COUNTS`
- `UOM.COMPATIBLE(uomId)`
- `UOM.FOR_SELECTOR(categoryId, categoryName)`
- `UOM.SEARCH(query, categoryId)`

### 3. React Query Hooks Created
**File:** `frontend/hooks/use-uom.ts` (NEW)

**Hooks:**
- `useUoMCategories(limit?)` - Get all categories
- `useUoMCategoriesWithCounts(isActive?)` - Get categories with counts
- `useUoMCategory(id)` - Get single category
- `useCreateUoMCategory()` - Create category
- `useUpdateUoMCategory()` - Update category
- `useDeleteUoMCategory()` - Delete category
- `useUoMs(categoryId?, limit?)` - Get all units
- `useUoM(id)` - Get single unit
- `useCreateUoM()` - Create unit
- `useUpdateUoM()` - Update unit
- `useDeleteUoM()` - Delete unit
- `useCompatibleUoMs(uomId)` - Get compatible units
- `useConvertUoM()` - Convert between units
- `useValidateUoMSymbol()` - Validate symbol
- `useUoMsForSelector(categoryId?, categoryName?)` - Get for selector
- `useSearchUoMs(query, categoryId?, limit?)` - Search units

**Type Definitions:**
- `UoMCategory`
- `UoMCategoryWithUnits`
- `UoM`
- `UoMForSelector`
- `UoMConversionResult`

### 4. UOM Components Created
**Directory:** `frontend/components/uom/`

#### uom-category-card.tsx (NEW)
- Visual card component with icon
- Shows unit count and base unit
- Edit/delete actions

#### uom-selector.tsx (NEW - Enhanced)
- Searchable combobox interface
- Category icons (Ruler, Scale, Hash, Layers, Package, Square, Beaker, Clock, Waypoints)
- Grouped by category
- "BASE" badge for base units
- Category filtering support
- Returns symbol for backward compatibility

#### uom-conversion-calculator.tsx (NEW - Fixed)
- Only shows convertible categories (Length, Weight, Quantity, Textile Density, Area, Volume, Time)
- Excludes Packaging and Yarn Count (non-convertible)
- Real-time conversion
- Copy result to clipboard
- Shows conversion formula

### 5. UOM Settings Page Redesigned
**File:** `frontend/app/dashboard/(authenticated)/erp/settings/uom/page.tsx`

**4-Tab Interface:**
1. **Dashboard** - Visual category cards with icons and counts
2. **Categories** - Category management with CRUD
3. **Units** - Unit management with search/filter
4. **Converter** - Unit conversion calculator

**Features:**
- Real-time symbol validation
- Search and filter functionality
- Category-based grouping
- Full CRUD operations

### 6. Material Details Page Updated
**File:** `frontend/app/dashboard/(authenticated)/erp/merchandising/material-details/page.tsx`

**UOM Selector Integration in 6 Dialogs:**
| Dialog | Category Filter |
|--------|----------------|
| YarnDialog | Weight, Packaging |
| FabricDialog | Weight, Length, Packaging |
| TrimsDialog | Quantity, Length |
| AccessoriesDialog | Quantity |
| FinishedGoodDialog | Quantity |
| PackingGoodDialog | Quantity, Packaging |

### 7. Add Material Page Updated
**File:** `frontend/app/dashboard/(authenticated)/erp/samples/add-material/page.tsx`

- Replaced legacy `uomUnits` hardcoded array
- Now uses database-driven `UoMSelector` component
- Searchable with category grouping

---

## Files Changed Summary

### Backend
| File | Change Type |
|------|-------------|
| `backend/modules/settings/models/master_data.py` | Modified |
| `backend/modules/settings/schemas/master_data.py` | Modified |
| `backend/modules/settings/routes/settings.py` | Modified |
| `backend/modules/settings/seed_data.py` | Modified |

### Frontend
| File | Change Type |
|------|-------------|
| `frontend/services/api.ts` | Modified |
| `frontend/query.config.ts` | Modified |
| `frontend/hooks/use-uom.ts` | **New** |
| `frontend/components/uom/uom-category-card.tsx` | **New** |
| `frontend/components/uom/uom-selector.tsx` | **New** |
| `frontend/components/uom/uom-conversion-calculator.tsx` | **New** |
| `frontend/app/dashboard/(authenticated)/erp/settings/uom/page.tsx` | Rewritten |
| `frontend/app/dashboard/(authenticated)/erp/merchandising/material-details/page.tsx` | Modified |
| `frontend/app/dashboard/(authenticated)/erp/samples/add-material/page.tsx` | Modified |

---

## Key Features

### 1. Centralized UOM Database
- All UOMs managed from single database
- Prevents duplicate units
- Prevents non-existent UOM usage

### 2. Category-Based Organization
- 9 garment-industry specific categories
- Each category has icon and description
- Units grouped logically

### 3. Unit Conversion
- Factor-based conversion system
- Convert to base unit first, then to target
- Only meaningful conversions allowed

### 4. System-Wide Integration
- UOM Selector component reusable across all pages
- Category filtering for context-specific units
- Backward compatible with string-based storage

### 5. User-Friendly UI
- Searchable combobox selector
- Category icons for visual identification
- BASE badge for reference units
- Real-time validation

---

## Legacy Files (Deprecated)

**File:** `frontend/lib/uom-units.ts`
- Hardcoded UOM array
- No longer used after integration
- Can be removed in future cleanup

---

## Testing Notes

1. **Conversion Calculator** - Only Length, Weight, Quantity, Textile Density, Area, Volume, Time categories are shown
2. **UOM Selector** - All 9 categories available, filterable by props
3. **Material Details** - Each dialog shows relevant UOM categories only
4. **Add Material** - Now fetches UOMs from database instead of hardcoded list

---

## Access URLs

- **Frontend:** http://localhost:2222
- **Backend API:** http://localhost:8000
- **UOM Settings:** http://localhost:2222/dashboard/erp/settings/uom
- **Material Details:** http://localhost:2222/dashboard/erp/merchandising/material-details

---

## API Endpoints (Verified Working)

Base URL: `http://localhost:8000/api/v1/settings`

| Endpoint | Method | Test Result |
|----------|--------|-------------|
| `/uom-categories` | GET | Returns 9 categories with icons |
| `/uom` | GET | Returns all units with details |
| `/uom/convert` | POST | Converts 1m = 1.09yd correctly |
| `/uom-categories/with-counts` | GET | Returns categories with unit counts |
| `/uom/for-selector` | GET | Returns optimized selector data |

---

## Verification Status

- Backend APIs: **Working**
- Frontend Container: **Running** (http://localhost:2222)
- Database Seeding: **Complete** (9 categories, 55+ units)
