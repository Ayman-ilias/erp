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
import { PlusCircle, Edit, Trash2, Shield, Search, LayoutGrid, List, Ruler, Scale, Hash, Layers, Waypoints, Package as PackageIcon, Square, Beaker, Clock, HelpCircle } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import {
  useUoMCategories,
  useUoMCategoriesWithCounts,
  useUoMs,
  useCreateUoMCategory,
  useUpdateUoMCategory,
  useDeleteUoMCategory,
  useCreateUoM,
  useUpdateUoM,
  useDeleteUoM,
  useValidateUoMSymbol,
  type UoMCategory,
  type UoMCategoryWithUnits,
  type UoM,
} from "@/hooks/use-uom";
import { UoMCategoryCard } from "@/components/uom/uom-category-card";
import { UoMConversionCalculator } from "@/components/uom/uom-conversion-calculator";

// Icon mapping for categories
const iconMap: Record<string, React.ElementType> = {
  Ruler: Ruler,
  Scale: Scale,
  Hash: Hash,
  Layers: Layers,
  Waypoints: Waypoints,
  Package: PackageIcon,
  Square: Square,
  Beaker: Beaker,
  Clock: Clock,
};

const iconOptions = [
  { value: "Ruler", label: "Ruler (Length)" },
  { value: "Scale", label: "Scale (Weight)" },
  { value: "Hash", label: "Hash (Quantity)" },
  { value: "Layers", label: "Layers (Density)" },
  { value: "Waypoints", label: "Waypoints (Yarn)" },
  { value: "Package", label: "Package (Packaging)" },
  { value: "Square", label: "Square (Area)" },
  { value: "Beaker", label: "Beaker (Volume)" },
  { value: "Clock", label: "Clock (Time)" },
];

export default function UoMPage() {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Dialog states
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isUnitDialogOpen, setIsUnitDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<UoMCategory | null>(null);
  const [editingUnit, setEditingUnit] = useState<UoM | null>(null);

  // Form states
  const [categoryFormData, setCategoryFormData] = useState({
    uom_category: "",
    uom_id: "",
    uom_name: "",
    uom_description: "",
    icon: "",
    industry_use: "",
    sort_order: 0,
    is_active: true,
  });

  const [unitFormData, setUnitFormData] = useState({
    category_id: "",
    name: "",
    symbol: "",
    factor: "1.0",
    is_base: false,
    is_active: true,
    display_name: "",
    is_si_unit: false,
    common_usage: "",
    decimal_places: 2,
    sort_order: 0,
  });

  const [symbolError, setSymbolError] = useState<string | null>(null);

  // Queries
  const { data: categories = [], isLoading: categoriesLoading } = useUoMCategories();
  const { data: categoriesWithCounts = [], isLoading: countsLoading } = useUoMCategoriesWithCounts(true);
  const { data: units = [], isLoading: unitsLoading } = useUoMs();

  // Mutations
  const createCategoryMutation = useCreateUoMCategory();
  const updateCategoryMutation = useUpdateUoMCategory();
  const deleteCategoryMutation = useDeleteUoMCategory();
  const createUnitMutation = useCreateUoM();
  const updateUnitMutation = useUpdateUoM();
  const deleteUnitMutation = useDeleteUoM();
  const validateSymbolMutation = useValidateUoMSymbol();

  // Filter units based on search and category
  const filteredUnits = useMemo(() => {
    let filtered = units as UoM[];

    if (categoryFilter && categoryFilter !== "all") {
      const catId = parseInt(categoryFilter);
      filtered = filtered.filter((u) => u.category_id === catId);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.name.toLowerCase().includes(term) ||
          u.symbol.toLowerCase().includes(term) ||
          (u.display_name?.toLowerCase().includes(term))
      );
    }

    return filtered;
  }, [units, categoryFilter, searchTerm]);

  // Get category name by ID
  const getCategoryName = (categoryId: number) => {
    const cat = (categories as UoMCategory[]).find((c) => c.id === categoryId);
    return cat?.uom_category || "Unknown";
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

  const handleEditCategory = (item: UoMCategory) => {
    setEditingCategory(item);
    setCategoryFormData({
      uom_category: item.uom_category || "",
      uom_id: item.uom_id || "",
      uom_name: item.uom_name || "",
      uom_description: item.uom_description || "",
      icon: item.icon || "",
      industry_use: item.industry_use || "",
      sort_order: item.sort_order || 0,
      is_active: item.is_active !== false,
    });
    setIsCategoryDialogOpen(true);
  };

  const handleDeleteCategory = async (id: number) => {
    if (confirm("Are you sure you want to delete this category? All related units will also be affected.")) {
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
      uom_category: "",
      uom_id: "",
      uom_name: "",
      uom_description: "",
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
        factor: parseFloat(unitFormData.factor),
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

  const handleEditUnit = (item: UoM) => {
    setEditingUnit(item);
    setUnitFormData({
      category_id: item.category_id?.toString() || "",
      name: item.name || "",
      symbol: item.symbol || "",
      factor: item.factor?.toString() || "1.0",
      is_base: item.is_base || false,
      is_active: item.is_active !== false,
      display_name: item.display_name || "",
      is_si_unit: item.is_si_unit || false,
      common_usage: item.common_usage || "",
      decimal_places: item.decimal_places || 2,
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
      factor: "1.0",
      is_base: false,
      is_active: true,
      display_name: "",
      is_si_unit: false,
      common_usage: "",
      decimal_places: 2,
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
  const handleCategoryCardClick = (category: UoMCategoryWithUnits) => {
    setSelectedCategoryId(category.id);
    setCategoryFilter(category.id.toString());
    setActiveTab("units");
  };

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
        <h1 className="text-3xl font-bold">Units of Measure</h1>
        <p className="text-muted-foreground">
          Manage measurement categories, units, and conversions for the garment industry
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
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
          <TabsTrigger value="converter" className="gap-2">
            <Scale className="h-4 w-4" />
            Converter
          </TabsTrigger>
        </TabsList>

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
              <span>{(categoriesWithCounts as UoMCategoryWithUnits[]).length} categories</span>
              <span>{(units as UoM[]).length} total units</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {countsLoading ? (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                Loading categories...
              </div>
            ) : (
              (categoriesWithCounts as UoMCategoryWithUnits[]).map((cat) => (
                <UoMCategoryCard
                  key={cat.id}
                  category={cat}
                  onClick={() => handleCategoryCardClick(cat)}
                  isSelected={selectedCategoryId === cat.id}
                />
              ))
            )}
          </div>

          {/* Quick Converter */}
          <div className="mt-6">
            <UoMConversionCalculator className="max-w-md" />
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
                      ? "Update UoM category information"
                      : "Create a new UoM category for the garment industry"}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCategorySubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="uom_category">Category Name *</Label>
                        <Input
                          id="uom_category"
                          value={categoryFormData.uom_category}
                          onChange={(e) =>
                            setCategoryFormData({ ...categoryFormData, uom_category: e.target.value })
                          }
                          placeholder="e.g., Length"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="uom_id">Category ID</Label>
                        <Input
                          id="uom_id"
                          value={categoryFormData.uom_id}
                          onChange={(e) =>
                            setCategoryFormData({ ...categoryFormData, uom_id: e.target.value.toUpperCase() })
                          }
                          placeholder="e.g., LEN"
                          maxLength={10}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
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
                      <div className="space-y-2">
                        <Label htmlFor="sort_order">Sort Order</Label>
                        <Input
                          id="sort_order"
                          type="number"
                          value={categoryFormData.sort_order}
                          onChange={(e) =>
                            setCategoryFormData({ ...categoryFormData, sort_order: parseInt(e.target.value) || 0 })
                          }
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
                      <Label htmlFor="uom_description">Description</Label>
                      <Input
                        id="uom_description"
                        value={categoryFormData.uom_description}
                        onChange={(e) =>
                          setCategoryFormData({ ...categoryFormData, uom_description: e.target.value })
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
                  <TableHead>Category ID</TableHead>
                  <TableHead>Category Name</TableHead>
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
                ) : (categories as UoMCategory[]).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No categories found. Add your first category.
                    </TableCell>
                  </TableRow>
                ) : (
                  (categories as UoMCategory[]).map((item) => {
                    const IconComponent = item.icon ? iconMap[item.icon] || HelpCircle : HelpCircle;
                    return (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="p-2 bg-primary/10 rounded w-fit">
                            <IconComponent className="h-4 w-4 text-primary" />
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{item.uom_id || "-"}</TableCell>
                        <TableCell>{item.uom_category}</TableCell>
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
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search units..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-[250px]"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {(categories as UoMCategory[]).map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {cat.uom_category}
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
              <DialogContent className="max-w-lg">
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
                          {(categories as UoMCategory[]).map((cat) => (
                            <SelectItem key={cat.id} value={cat.id.toString()}>
                              {cat.uom_category}
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
                          placeholder="e.g., Meter"
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
                          placeholder="e.g., m"
                          required
                          className={symbolError ? "border-destructive" : ""}
                        />
                        {symbolError && (
                          <p className="text-xs text-destructive">{symbolError}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="display_name">Display Name</Label>
                      <Input
                        id="display_name"
                        value={unitFormData.display_name}
                        onChange={(e) =>
                          setUnitFormData({ ...unitFormData, display_name: e.target.value })
                        }
                        placeholder="e.g., Meter (m)"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="unit_factor">Conversion Factor *</Label>
                        <Input
                          id="unit_factor"
                          type="number"
                          step="0.000001"
                          value={unitFormData.factor}
                          onChange={(e) =>
                            setUnitFormData({ ...unitFormData, factor: e.target.value })
                          }
                          required
                        />
                        <p className="text-xs text-muted-foreground">
                          Relative to base unit (base = 1.0)
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="decimal_places">Decimal Places</Label>
                        <Input
                          id="decimal_places"
                          type="number"
                          min="0"
                          max="10"
                          value={unitFormData.decimal_places}
                          onChange={(e) =>
                            setUnitFormData({ ...unitFormData, decimal_places: parseInt(e.target.value) || 2 })
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="common_usage">Common Usage</Label>
                      <Input
                        id="common_usage"
                        value={unitFormData.common_usage}
                        onChange={(e) =>
                          setUnitFormData({ ...unitFormData, common_usage: e.target.value })
                        }
                        placeholder="e.g., Fabric measurement"
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
                          id="is_si_unit"
                          checked={unitFormData.is_si_unit}
                          onCheckedChange={(checked) =>
                            setUnitFormData({ ...unitFormData, is_si_unit: !!checked })
                          }
                        />
                        <Label htmlFor="is_si_unit" className="cursor-pointer">
                          SI Unit
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

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Symbol</TableHead>
                  <TableHead>Factor</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {unitsLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : filteredUnits.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      {searchTerm || categoryFilter !== "all"
                        ? "No units found matching your filters."
                        : "No units found. Add your first unit."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUnits.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{getCategoryName(item.category_id)}</TableCell>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>
                        <code className="px-1.5 py-0.5 bg-muted rounded text-sm">{item.symbol}</code>
                      </TableCell>
                      <TableCell>{parseFloat(item.factor?.toString() || "1").toFixed(6)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {item.is_base && <Badge variant="secondary">Base</Badge>}
                          {item.is_si_unit && <Badge variant="outline">SI</Badge>}
                        </div>
                      </TableCell>
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
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Converter Tab */}
        <TabsContent value="converter" className="space-y-4">
          <div className="max-w-2xl">
            <UoMConversionCalculator />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
