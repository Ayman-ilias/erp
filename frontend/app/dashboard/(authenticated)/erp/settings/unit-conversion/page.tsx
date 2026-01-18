"use client";

import * as React from "react";
import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PlusCircle, Edit, Trash2, Shield, Search, LayoutGrid, List,
  Ruler, Scale, Hash, Layers, Package as PackageIcon, Square, Beaker,
  Clock, HelpCircle, ArrowRightLeft, RefreshCw, Zap, Thermometer,
  Gauge, Droplet, Activity, Wrench, Radio, Database, Sun, Volume2, Truck
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import {
  useUnitCategories,
  useUnitCategoriesWithCounts,
  useUnits,
  useCreateUnitCategory,
  useUpdateUnitCategory,
  useDeleteUnitCategory,
  useCreateUnit,
  useUpdateUnit,
  useDeleteUnit,
  useValidateUnitSymbol,
  useConvertUnits,
  useUnitsForSelector,
  type UnitCategory,
  type UnitCategoryWithCount,
  type Unit,
  type UnitTypeEnum,
  type UnitForSelector,
} from "@/hooks/use-units";

// Icon mapping for categories
const iconMap: Record<string, React.ElementType> = {
  Ruler: Ruler,
  Scale: Scale,
  Hash: Hash,
  Layers: Layers,
  Package: PackageIcon,
  Square: Square,
  Beaker: Beaker,
  Clock: Clock,
  Thermometer: Thermometer,
  Gauge: Gauge,
  Droplet: Droplet,
  Activity: Activity,
  Zap: Zap,
  Wrench: Wrench,
  Radio: Radio,
  Database: Database,
  Sun: Sun,
  Volume: Volume2,
  Truck: Truck,
  Flow: Droplet,
  Force: Zap,
  Rotate: RefreshCw,
  Power: Zap,
  Bolt: Zap,
  Circle: RefreshCw,
  Waypoints: Layers,
  Grid: Hash,
  Coil: RefreshCw,
  Battery: Zap,
};

const iconOptions = [
  { value: "Ruler", label: "Ruler (Length)" },
  { value: "Scale", label: "Scale (Weight)" },
  { value: "Beaker", label: "Beaker (Volume)" },
  { value: "Thermometer", label: "Thermometer (Temperature)" },
  { value: "Square", label: "Square (Area)" },
  { value: "Hash", label: "Hash (Count)" },
  { value: "Gauge", label: "Gauge (Pressure)" },
  { value: "Droplet", label: "Droplet (Flow)" },
  { value: "Zap", label: "Zap (Energy/Power)" },
  { value: "Wrench", label: "Wrench (Torque)" },
  { value: "RefreshCw", label: "Rotate (Speed)" },
  { value: "Activity", label: "Activity (Current)" },
  { value: "Layers", label: "Layers (Textile)" },
  { value: "Package", label: "Package (Shipping)" },
  { value: "Radio", label: "Radio (Frequency)" },
  { value: "Database", label: "Database (Data)" },
  { value: "Sun", label: "Sun (Light)" },
  { value: "Volume", label: "Volume (Sound)" },
  { value: "Clock", label: "Clock (Time)" },
];

const unitTypeOptions: { value: UnitTypeEnum; label: string; color: string }[] = [
  { value: "SI", label: "SI (Metric)", color: "bg-blue-100 text-blue-800" },
  { value: "International", label: "International", color: "bg-green-100 text-green-800" },
  { value: "Desi", label: "Desi (South Asian)", color: "bg-orange-100 text-orange-800" },
  { value: "English", label: "English (Imperial)", color: "bg-purple-100 text-purple-800" },
  { value: "CGS", label: "CGS", color: "bg-gray-100 text-gray-800" },
  { value: "Other", label: "Other", color: "bg-slate-100 text-slate-800" },
];

export default function UnitConversionPage() {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState("converter");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [unitTypeFilter, setUnitTypeFilter] = useState<string>("all");

  // Converter state
  const [convertValue, setConvertValue] = useState<string>("1");
  const [fromUnit, setFromUnit] = useState<string>("");
  const [toUnit, setToUnit] = useState<string>("");
  const [converterCategory, setConverterCategory] = useState<string>("");
  const [conversionResult, setConversionResult] = useState<any>(null);

  // Dialog states
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isUnitDialogOpen, setIsUnitDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<UnitCategory | null>(null);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);

  // Form states
  const [categoryFormData, setCategoryFormData] = useState({
    name: "",
    description: "",
    base_unit_name: "",
    base_unit_symbol: "",
    icon: "",
    industry_use: "",
    sort_order: 0,
    is_active: true,
  });

  const [unitFormData, setUnitFormData] = useState({
    category_id: "",
    name: "",
    symbol: "",
    description: "",
    unit_type: "SI" as UnitTypeEnum,
    region: "",
    to_base_factor: "1",
    alternate_names: "",
    is_base: false,
    is_active: true,
    decimal_places: 6,
    sort_order: 0,
  });

  const [symbolError, setSymbolError] = useState<string | null>(null);

  // Queries
  const { data: categories = [], isLoading: categoriesLoading } = useUnitCategories();
  const { data: categoriesWithCounts = [], isLoading: countsLoading } = useUnitCategoriesWithCounts(true);
  const { data: units = [], isLoading: unitsLoading } = useUnits();
  const { data: selectorUnits = [] } = useUnitsForSelector(
    converterCategory ? parseInt(converterCategory) : undefined
  );

  // Mutations
  const createCategoryMutation = useCreateUnitCategory();
  const updateCategoryMutation = useUpdateUnitCategory();
  const deleteCategoryMutation = useDeleteUnitCategory();
  const createUnitMutation = useCreateUnit();
  const updateUnitMutation = useUpdateUnit();
  const deleteUnitMutation = useDeleteUnit();
  const validateSymbolMutation = useValidateUnitSymbol();
  const convertMutation = useConvertUnits();

  // Filter units based on search, category, and type
  const filteredUnits = useMemo(() => {
    let filtered = units as Unit[];

    if (categoryFilter && categoryFilter !== "all") {
      const catId = parseInt(categoryFilter);
      filtered = filtered.filter((u) => u.category_id === catId);
    }

    if (unitTypeFilter && unitTypeFilter !== "all") {
      filtered = filtered.filter((u) => u.unit_type === unitTypeFilter);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.name.toLowerCase().includes(term) ||
          u.symbol.toLowerCase().includes(term) ||
          (u.alternate_names?.toLowerCase().includes(term)) ||
          (u.region?.toLowerCase().includes(term))
      );
    }

    return filtered;
  }, [units, categoryFilter, unitTypeFilter, searchTerm]);

  // Get category name by ID
  const getCategoryName = (categoryId: number) => {
    const cat = (categories as UnitCategory[]).find((c) => c.id === categoryId);
    return cat?.name || "Unknown";
  };

  // Get unit type badge color
  const getUnitTypeBadge = (type: UnitTypeEnum) => {
    const option = unitTypeOptions.find(o => o.value === type);
    return option || { label: type, color: "bg-gray-100 text-gray-800" };
  };

  // Category handlers
  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingCategory) {
        await updateCategoryMutation.mutateAsync({
          id: editingCategory.id,
          data: categoryFormData,
        });
        toast.success("Category updated successfully");
      } else {
        await createCategoryMutation.mutateAsync(categoryFormData);
        toast.success("Category created successfully");
      }
      setIsCategoryDialogOpen(false);
      resetCategoryForm();
    } catch (error: any) {
      toast.error(error?.message || "Failed to save category");
    }
  };

  const handleEditCategory = (item: UnitCategory) => {
    setEditingCategory(item);
    setCategoryFormData({
      name: item.name || "",
      description: item.description || "",
      base_unit_name: item.base_unit_name || "",
      base_unit_symbol: item.base_unit_symbol || "",
      icon: item.icon || "",
      industry_use: item.industry_use || "",
      sort_order: item.sort_order || 0,
      is_active: item.is_active !== false,
    });
    setIsCategoryDialogOpen(true);
  };

  const handleDeleteCategory = async (id: number) => {
    if (confirm("Are you sure you want to delete this category? All related units will also be deleted.")) {
      try {
        await deleteCategoryMutation.mutateAsync(id);
        toast.success("Category deleted successfully");
      } catch (error: any) {
        toast.error(error?.message || "Failed to delete category");
      }
    }
  };

  const resetCategoryForm = () => {
    setEditingCategory(null);
    setCategoryFormData({
      name: "",
      description: "",
      base_unit_name: "",
      base_unit_symbol: "",
      icon: "",
      industry_use: "",
      sort_order: 0,
      is_active: true,
    });
  };

  // Unit handlers
  const handleUnitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (symbolError) {
      toast.error("Please fix the symbol error first");
      return;
    }

    try {
      const data = {
        ...unitFormData,
        category_id: parseInt(unitFormData.category_id),
        to_base_factor: parseFloat(unitFormData.to_base_factor),
      };

      if (editingUnit) {
        await updateUnitMutation.mutateAsync({
          id: editingUnit.id,
          data,
        });
        toast.success("Unit updated successfully");
      } else {
        await createUnitMutation.mutateAsync(data);
        toast.success("Unit created successfully");
      }
      setIsUnitDialogOpen(false);
      resetUnitForm();
    } catch (error: any) {
      toast.error(error?.message || "Failed to save unit");
    }
  };

  const handleEditUnit = (item: Unit) => {
    setEditingUnit(item);
    setUnitFormData({
      category_id: item.category_id?.toString() || "",
      name: item.name || "",
      symbol: item.symbol || "",
      description: item.description || "",
      unit_type: item.unit_type || "SI",
      region: item.region || "",
      to_base_factor: item.to_base_factor?.toString() || "1",
      alternate_names: item.alternate_names || "",
      is_base: item.is_base || false,
      is_active: item.is_active !== false,
      decimal_places: item.decimal_places || 6,
      sort_order: item.sort_order || 0,
    });
    setIsUnitDialogOpen(true);
  };

  const handleDeleteUnit = async (id: number) => {
    if (confirm("Are you sure you want to delete this unit?")) {
      try {
        await deleteUnitMutation.mutateAsync(id);
        toast.success("Unit deleted successfully");
      } catch (error: any) {
        toast.error(error?.message || "Failed to delete unit");
      }
    }
  };

  const resetUnitForm = () => {
    setEditingUnit(null);
    setSymbolError(null);
    setUnitFormData({
      category_id: "",
      name: "",
      symbol: "",
      description: "",
      unit_type: "SI",
      region: "",
      to_base_factor: "1",
      alternate_names: "",
      is_base: false,
      is_active: true,
      decimal_places: 6,
      sort_order: 0,
    });
  };

  // Validate symbol uniqueness
  const validateSymbol = async () => {
    if (!unitFormData.symbol || !unitFormData.category_id) {
      setSymbolError(null);
      return;
    }

    try {
      const result = await validateSymbolMutation.mutateAsync({
        symbol: unitFormData.symbol,
        category_id: parseInt(unitFormData.category_id),
        exclude_id: editingUnit?.id,
      });

      if (!result.is_valid) {
        setSymbolError(result.message || "Symbol already exists");
      } else {
        setSymbolError(null);
      }
    } catch {
      // Ignore validation errors
    }
  };

  // Debounced symbol validation
  useEffect(() => {
    const timer = setTimeout(validateSymbol, 500);
    return () => clearTimeout(timer);
  }, [unitFormData.symbol, unitFormData.category_id]);

  // Handle category card click
  const handleCategoryCardClick = (category: UnitCategoryWithCount) => {
    setSelectedCategoryId(category.id);
    setCategoryFilter(category.id.toString());
    setActiveTab("units");
  };

  // Conversion handler
  const handleConvert = async () => {
    if (!convertValue || !fromUnit || !toUnit) {
      toast.error("Please fill in all conversion fields");
      return;
    }

    try {
      const result = await convertMutation.mutateAsync({
        value: parseFloat(convertValue),
        from_unit_symbol: fromUnit,
        to_unit_symbol: toUnit,
      });
      setConversionResult(result);
    } catch (error: any) {
      toast.error(error?.message || "Conversion failed");
    }
  };

  // Swap units
  const handleSwapUnits = () => {
    const temp = fromUnit;
    setFromUnit(toUnit);
    setToUnit(temp);
    setConversionResult(null);
  };

  // Reset converter when category changes
  useEffect(() => {
    setFromUnit("");
    setToUnit("");
    setConversionResult(null);
  }, [converterCategory]);

  if (!user?.is_superuser) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="p-8 text-center">
          <Shield className="h-16 w-16 mx-auto mb-4 text-destructive" />
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">
            You need administrator privileges to access this page.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Unit Conversion System</h1>
        <p className="text-muted-foreground">
          Comprehensive unit management supporting SI, International, Desi, English, and CGS units for Bangladesh factory operations
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="converter" className="gap-2">
            <ArrowRightLeft className="h-4 w-4" />
            Converter
          </TabsTrigger>
          <TabsTrigger value="dashboard" className="gap-2">
            <LayoutGrid className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="categories" className="gap-2">
            <List className="h-4 w-4" />
            Categories
          </TabsTrigger>
          <TabsTrigger value="units" className="gap-2">
            <Ruler className="h-4 w-4" />
            Units
          </TabsTrigger>
        </TabsList>

        {/* Converter Tab */}
        <TabsContent value="converter" className="space-y-4">
          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowRightLeft className="h-5 w-5" />
                Real-Time Unit Converter
              </CardTitle>
              <CardDescription>
                Convert between any compatible units instantly
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Category Selection */}
              <div className="space-y-2">
                <Label>Select Category</Label>
                <Select value={converterCategory} onValueChange={setConverterCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a category..." />
                  </SelectTrigger>
                  <SelectContent>
                    {(categories as UnitCategory[]).map((cat) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {cat.name} ({cat.base_unit_symbol})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {converterCategory && (
                <>
                  {/* Value Input */}
                  <div className="space-y-2">
                    <Label>Value</Label>
                    <Input
                      type="number"
                      step="any"
                      value={convertValue}
                      onChange={(e) => {
                        setConvertValue(e.target.value);
                        setConversionResult(null);
                      }}
                      placeholder="Enter value..."
                      className="text-lg"
                    />
                  </div>

                  {/* From/To Units */}
                  <div className="flex items-end gap-4">
                    <div className="flex-1 space-y-2">
                      <Label>From</Label>
                      <Select value={fromUnit} onValueChange={(v) => { setFromUnit(v); setConversionResult(null); }}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select unit..." />
                        </SelectTrigger>
                        <SelectContent>
                          {(selectorUnits as UnitForSelector[]).map((u) => (
                            <SelectItem key={u.id} value={u.symbol}>
                              {u.display_name}
                              {u.is_base && <Badge variant="outline" className="ml-2 text-xs">Base</Badge>}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleSwapUnits}
                      disabled={!fromUnit || !toUnit}
                    >
                      <ArrowRightLeft className="h-4 w-4" />
                    </Button>

                    <div className="flex-1 space-y-2">
                      <Label>To</Label>
                      <Select value={toUnit} onValueChange={(v) => { setToUnit(v); setConversionResult(null); }}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select unit..." />
                        </SelectTrigger>
                        <SelectContent>
                          {(selectorUnits as UnitForSelector[])
                            .filter(u => u.symbol !== fromUnit)
                            .map((u) => (
                              <SelectItem key={u.id} value={u.symbol}>
                                {u.display_name}
                                {u.is_base && <Badge variant="outline" className="ml-2 text-xs">Base</Badge>}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Convert Button */}
                  <Button
                    onClick={handleConvert}
                    disabled={!convertValue || !fromUnit || !toUnit || convertMutation.isPending}
                    className="w-full"
                    size="lg"
                  >
                    {convertMutation.isPending ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <ArrowRightLeft className="h-4 w-4 mr-2" />
                    )}
                    Convert
                  </Button>

                  {/* Result */}
                  {conversionResult && (
                    <div className="p-4 bg-muted rounded-lg space-y-2">
                      <div className="text-center">
                        <span className="text-2xl font-bold text-primary">
                          {conversionResult.result}
                        </span>
                        <span className="text-lg ml-2">{conversionResult.to_unit}</span>
                      </div>
                      <p className="text-center text-sm text-muted-foreground">
                        {conversionResult.formula}
                      </p>
                      <div className="text-center text-xs text-muted-foreground">
                        Category: {conversionResult.category} | Base: {conversionResult.base_unit}
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Quick Reference */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Reference - Common Conversions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                <div className="p-3 bg-muted rounded">
                  <h4 className="font-semibold mb-2">Length</h4>
                  <p>1 meter = 3.28 feet = 39.37 inches</p>
                  <p>1 gaj = 0.9144 m (yard)</p>
                </div>
                <div className="p-3 bg-muted rounded">
                  <h4 className="font-semibold mb-2">Weight (Desi)</h4>
                  <p>1 tola = 11.664 grams</p>
                  <p>1 seer = 80 tola = 933 grams</p>
                  <p>1 maund = 40 seer = 37.32 kg</p>
                </div>
                <div className="p-3 bg-muted rounded">
                  <h4 className="font-semibold mb-2">Textile</h4>
                  <p>100 GSM = 2.95 oz/yd2</p>
                  <p>Ne 40 = 14.76 Tex</p>
                </div>
                <div className="p-3 bg-muted rounded">
                  <h4 className="font-semibold mb-2">Count</h4>
                  <p>1 dozen = 12 pieces</p>
                  <p>1 gross = 144 pieces</p>
                  <p>1 lakh = 100,000 pieces</p>
                </div>
                <div className="p-3 bg-muted rounded">
                  <h4 className="font-semibold mb-2">Shipping</h4>
                  <p>1 FEU = 2 TEU</p>
                  <p>1 TEU = 33 m3</p>
                </div>
                <div className="p-3 bg-muted rounded">
                  <h4 className="font-semibold mb-2">Electrical (BD)</h4>
                  <p>230V single-phase, 50 Hz</p>
                  <p>400V three-phase</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Category Overview</h2>
              <p className="text-sm text-muted-foreground">
                Click on a category to view its units
              </p>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{(categoriesWithCounts as UnitCategoryWithCount[]).length} categories</span>
              <span>{(units as Unit[]).length} total units</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {countsLoading ? (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                Loading categories...
              </div>
            ) : (
              (categoriesWithCounts as UnitCategoryWithCount[]).map((cat) => {
                const IconComponent = cat.icon ? iconMap[cat.icon] || HelpCircle : HelpCircle;
                return (
                  <Card
                    key={cat.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedCategoryId === cat.id ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() => handleCategoryCardClick(cat)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="p-2 bg-primary/10 rounded">
                          <IconComponent className="h-5 w-5 text-primary" />
                        </div>
                        <Badge variant="secondary">{cat.unit_count} units</Badge>
                      </div>
                      <h3 className="font-semibold mt-3">{cat.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Base: {cat.base_unit_symbol}
                      </p>
                      {cat.industry_use && (
                        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                          {cat.industry_use}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-4">
          <div className="flex justify-end">
            <Dialog
              open={isCategoryDialogOpen}
              onOpenChange={(open) => {
                setIsCategoryDialogOpen(open);
                if (!open) resetCategoryForm();
              }}
            >
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Category
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>
                    {editingCategory ? "Edit Category" : "Add New Category"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingCategory
                      ? "Update unit category information"
                      : "Create a new unit category"}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCategorySubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Category Name *</Label>
                        <Input
                          id="name"
                          value={categoryFormData.name}
                          onChange={(e) =>
                            setCategoryFormData({ ...categoryFormData, name: e.target.value })
                          }
                          placeholder="e.g., Length"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="icon">Icon</Label>
                        <Select
                          value={categoryFormData.icon}
                          onValueChange={(v) =>
                            setCategoryFormData({ ...categoryFormData, icon: v })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select icon" />
                          </SelectTrigger>
                          <SelectContent>
                            {iconOptions.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="base_unit_name">Base Unit Name *</Label>
                        <Input
                          id="base_unit_name"
                          value={categoryFormData.base_unit_name}
                          onChange={(e) =>
                            setCategoryFormData({ ...categoryFormData, base_unit_name: e.target.value })
                          }
                          placeholder="e.g., Meter"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="base_unit_symbol">Base Unit Symbol *</Label>
                        <Input
                          id="base_unit_symbol"
                          value={categoryFormData.base_unit_symbol}
                          onChange={(e) =>
                            setCategoryFormData({ ...categoryFormData, base_unit_symbol: e.target.value })
                          }
                          placeholder="e.g., m"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="industry_use">Industry Use</Label>
                      <Input
                        id="industry_use"
                        value={categoryFormData.industry_use}
                        onChange={(e) =>
                          setCategoryFormData({ ...categoryFormData, industry_use: e.target.value })
                        }
                        placeholder="e.g., Fabric rolls, ribbons, trims"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Input
                        id="description"
                        value={categoryFormData.description}
                        onChange={(e) =>
                          setCategoryFormData({ ...categoryFormData, description: e.target.value })
                        }
                        placeholder="Detailed description"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="cat_is_active"
                        checked={categoryFormData.is_active}
                        onCheckedChange={(checked) =>
                          setCategoryFormData({ ...categoryFormData, is_active: !!checked })
                        }
                      />
                      <Label htmlFor="cat_is_active" className="cursor-pointer">
                        Active
                      </Label>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending}>
                      {editingCategory ? "Update" : "Create"} Category
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Icon</TableHead>
                  <TableHead>Category Name</TableHead>
                  <TableHead>Base Unit</TableHead>
                  <TableHead>Industry Use</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categoriesLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : (categories as UnitCategory[]).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No categories found.
                    </TableCell>
                  </TableRow>
                ) : (
                  (categories as UnitCategory[]).map((item) => {
                    const IconComponent = item.icon ? iconMap[item.icon] || HelpCircle : HelpCircle;
                    return (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="p-2 bg-primary/10 rounded w-fit">
                            <IconComponent className="h-4 w-4 text-primary" />
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>
                          <code className="px-1.5 py-0.5 bg-muted rounded text-sm">
                            {item.base_unit_name} ({item.base_unit_symbol})
                          </code>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{item.industry_use || "-"}</TableCell>
                        <TableCell>
                          <Badge variant={item.is_active ? "default" : "secondary"}>
                            {item.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEditCategory(item)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteCategory(item.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Units Tab */}
        <TabsContent value="units" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search units..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-[200px]"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {(categories as UnitCategory[]).map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={unitTypeFilter} onValueChange={setUnitTypeFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {unitTypeOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Dialog
              open={isUnitDialogOpen}
              onOpenChange={(open) => {
                setIsUnitDialogOpen(open);
                if (!open) resetUnitForm();
              }}
            >
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Unit
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingUnit ? "Edit Unit" : "Add New Unit"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingUnit
                      ? "Update unit information"
                      : "Create a new unit of measure"}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleUnitSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="category_id">Category *</Label>
                      <Select
                        value={unitFormData.category_id}
                        onValueChange={(value) =>
                          setUnitFormData({ ...unitFormData, category_id: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {(categories as UnitCategory[]).map((cat) => (
                            <SelectItem key={cat.id} value={cat.id.toString()}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="unit_name">Unit Name *</Label>
                        <Input
                          id="unit_name"
                          value={unitFormData.name}
                          onChange={(e) =>
                            setUnitFormData({ ...unitFormData, name: e.target.value })
                          }
                          placeholder="e.g., Kilogram"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="unit_symbol">Symbol *</Label>
                        <Input
                          id="unit_symbol"
                          value={unitFormData.symbol}
                          onChange={(e) =>
                            setUnitFormData({ ...unitFormData, symbol: e.target.value })
                          }
                          placeholder="e.g., kg"
                          required
                          className={symbolError ? "border-destructive" : ""}
                        />
                        {symbolError && (
                          <p className="text-xs text-destructive">{symbolError}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="unit_type">Unit Type *</Label>
                        <Select
                          value={unitFormData.unit_type}
                          onValueChange={(value: UnitTypeEnum) =>
                            setUnitFormData({ ...unitFormData, unit_type: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {unitTypeOptions.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="region">Region</Label>
                        <Input
                          id="region"
                          value={unitFormData.region}
                          onChange={(e) =>
                            setUnitFormData({ ...unitFormData, region: e.target.value })
                          }
                          placeholder="e.g., South Asia, Bangladesh"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="to_base_factor">Conversion Factor *</Label>
                        <Input
                          id="to_base_factor"
                          type="number"
                          step="any"
                          value={unitFormData.to_base_factor}
                          onChange={(e) =>
                            setUnitFormData({ ...unitFormData, to_base_factor: e.target.value })
                          }
                          required
                        />
                        <p className="text-xs text-muted-foreground">
                          Factor to multiply to get base unit value
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="decimal_places">Decimal Places</Label>
                        <Input
                          id="decimal_places"
                          type="number"
                          min="0"
                          max="15"
                          value={unitFormData.decimal_places}
                          onChange={(e) =>
                            setUnitFormData({ ...unitFormData, decimal_places: parseInt(e.target.value) || 6 })
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="alternate_names">Alternate Names</Label>
                      <Input
                        id="alternate_names"
                        value={unitFormData.alternate_names}
                        onChange={(e) =>
                          setUnitFormData({ ...unitFormData, alternate_names: e.target.value })
                        }
                        placeholder="e.g., kilo, kilos (comma-separated)"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="unit_description">Description</Label>
                      <Input
                        id="unit_description"
                        value={unitFormData.description}
                        onChange={(e) =>
                          setUnitFormData({ ...unitFormData, description: e.target.value })
                        }
                        placeholder="Description of this unit"
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-6">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="is_base"
                          checked={unitFormData.is_base}
                          onCheckedChange={(checked) =>
                            setUnitFormData({ ...unitFormData, is_base: !!checked })
                          }
                        />
                        <Label htmlFor="is_base" className="cursor-pointer">
                          Base Unit
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="unit_is_active"
                          checked={unitFormData.is_active}
                          onCheckedChange={(checked) =>
                            setUnitFormData({ ...unitFormData, is_active: !!checked })
                          }
                        />
                        <Label htmlFor="unit_is_active" className="cursor-pointer">
                          Active
                        </Label>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={!!symbolError || createUnitMutation.isPending || updateUnitMutation.isPending}>
                      {editingUnit ? "Update" : "Create"} Unit
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="text-sm text-muted-foreground">
            Showing {filteredUnits.length} of {(units as Unit[]).length} units
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Symbol</TableHead>
                  <TableHead>Factor</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Region</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {unitsLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : filteredUnits.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground">
                      {searchTerm || categoryFilter !== "all" || unitTypeFilter !== "all"
                        ? "No units found matching your filters."
                        : "No units found."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUnits.map((item) => {
                    const typeBadge = getUnitTypeBadge(item.unit_type);
                    return (
                      <TableRow key={item.id}>
                        <TableCell>{getCategoryName(item.category_id)}</TableCell>
                        <TableCell className="font-medium">
                          {item.name}
                          {item.is_base && <Badge variant="outline" className="ml-2">Base</Badge>}
                        </TableCell>
                        <TableCell>
                          <code className="px-1.5 py-0.5 bg-muted rounded text-sm">{item.symbol}</code>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {parseFloat(item.to_base_factor?.toString() || "1").toFixed(6)}
                        </TableCell>
                        <TableCell>
                          <Badge className={typeBadge.color} variant="secondary">
                            {typeBadge.label}
                          </Badge>
                        </TableCell>
                        <TableCell>{item.region || "-"}</TableCell>
                        <TableCell>
                          <Badge variant={item.is_active ? "default" : "secondary"}>
                            {item.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEditUnit(item)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteUnit(item.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
