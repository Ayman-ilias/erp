"use client";

import * as React from "react";
import { useState, useMemo, useEffect } from "react";
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
  PlusCircle, Edit, Trash2, Shield, Search, Ruler, Users, Maximize2,
  ChevronDown, ChevronRight, Info, Shirt, Settings
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import {
  // Garment Types
  useGarmentTypes,
  useGarmentTypesForSelector,
  useGarmentTypeMeasurements,
  useCreateGarmentType,
  useAddGarmentTypeMeasurement,
  // Sizes
  useSizes,
  useCreateSize,
  useUpdateSize,
  useDeleteSize,
  useAddSizeMeasurement,
  // Types
  type GarmentType,
  type GarmentMeasurementSpec,
  type SizeMaster,
  type SizeMeasurement,
  type GenderEnum,
  type FitTypeEnum,
  type AgeGroupEnum,
} from "@/hooks/use-sizecolor";

// Gender options
const genderOptions: { value: GenderEnum; label: string; color: string }[] = [
  { value: "Male", label: "Male", color: "bg-blue-100 text-blue-800" },
  { value: "Female", label: "Female", color: "bg-pink-100 text-pink-800" },
  { value: "Unisex", label: "Unisex", color: "bg-purple-100 text-purple-800" },
];

// Fit type options
const fitTypeOptions: { value: FitTypeEnum; label: string }[] = [
  { value: "Regular", label: "Regular" },
  { value: "Slim", label: "Slim" },
  { value: "Relaxed", label: "Relaxed" },
  { value: "Oversized", label: "Oversized" },
  { value: "Fitted", label: "Fitted" },
  { value: "Loose", label: "Loose" },
  { value: "Athletic", label: "Athletic" },
  { value: "Tapered", label: "Tapered" },
];

// Age group options
const ageGroupOptions: { value: AgeGroupEnum; label: string }[] = [
  { value: "Adult", label: "Adult" },
  { value: "Teen", label: "Teen" },
  { value: "Kids", label: "Kids" },
  { value: "Toddler", label: "Toddler" },
  { value: "Infant", label: "Infant" },
];

// Standard size names
const sizeNames = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL", "4XL", "5XL"];

export default function SizeMasterPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("sizes");

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [garmentTypeFilter, setGarmentTypeFilter] = useState<string>("all");
  const [genderFilter, setGenderFilter] = useState<string>("all");
  const [ageGroupFilter, setAgeGroupFilter] = useState<string>("all");
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  // Dialog states
  const [isSizeDialogOpen, setIsSizeDialogOpen] = useState(false);
  const [isGarmentTypeDialogOpen, setIsGarmentTypeDialogOpen] = useState(false);
  const [isMeasurementDialogOpen, setIsMeasurementDialogOpen] = useState(false);
  const [editingSize, setEditingSize] = useState<SizeMaster | null>(null);
  const [selectedSizeForMeasurement, setSelectedSizeForMeasurement] = useState<SizeMaster | null>(null);
  const [selectedGarmentTypeId, setSelectedGarmentTypeId] = useState<number | null>(null);

  // Size form
  const [sizeFormData, setSizeFormData] = useState({
    garment_type_id: 0,
    size_name: "",
    size_label: "",
    gender: "Unisex" as GenderEnum,
    age_group: "Adult" as AgeGroupEnum,
    fit_type: "Regular" as FitTypeEnum,
    size_order: 0,
    description: "",
    is_active: true,
  });

  // Garment type form
  const [garmentTypeFormData, setGarmentTypeFormData] = useState({
    name: "",
    code: "",
    category: "",
    description: "",
  });

  // Measurement form
  const [measurementFormData, setMeasurementFormData] = useState({
    measurement_spec_id: 0,
    value_cm: "",
    tolerance_plus: "1.0",
    tolerance_minus: "1.0",
    notes: "",
  });

  // Queries
  const { data: garmentTypesData = [], isLoading: garmentTypesLoading } = useGarmentTypes();
  const { data: garmentTypesForSelector = [] } = useGarmentTypesForSelector();

  const garmentTypes = garmentTypesData as GarmentType[];
  const garmentTypesSelector = garmentTypesForSelector as { id: number; name: string; code: string; category: string }[];

  const { data: sizesData = [], isLoading: sizesLoading } = useSizes(
    garmentTypeFilter !== "all" ? parseInt(garmentTypeFilter) : undefined,
    genderFilter !== "all" ? genderFilter : undefined,
    ageGroupFilter !== "all" ? ageGroupFilter : undefined
  );
  const sizes = sizesData as SizeMaster[];

  // Get measurement specs for selected garment type
  const { data: measurementSpecs = [] } = useGarmentTypeMeasurements(selectedGarmentTypeId || 0);

  // Mutations
  const createGarmentTypeMutation = useCreateGarmentType();
  const addGarmentMeasurementMutation = useAddGarmentTypeMeasurement();
  const createSizeMutation = useCreateSize();
  const updateSizeMutation = useUpdateSize();
  const deleteSizeMutation = useDeleteSize();
  const addSizeMeasurementMutation = useAddSizeMeasurement();

  // Load measurement specs when garment type is selected in size form
  useEffect(() => {
    if (sizeFormData.garment_type_id) {
      setSelectedGarmentTypeId(sizeFormData.garment_type_id);
    }
  }, [sizeFormData.garment_type_id]);

  // Filter sizes
  const filteredSizes = useMemo(() => {
    let filtered = sizes;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.size_code.toLowerCase().includes(term) ||
          s.size_name.toLowerCase().includes(term) ||
          (s.size_label?.toLowerCase().includes(term)) ||
          (s.description?.toLowerCase().includes(term))
      );
    }
    return filtered;
  }, [sizes, searchTerm]);

  // Get gender badge color
  const getGenderBadge = (gender: GenderEnum) => {
    const option = genderOptions.find(o => o.value === gender);
    return option || { label: gender, color: "bg-gray-100 text-gray-800" };
  };

  // Toggle row expansion
  const toggleRowExpansion = (id: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  // Size handlers
  const handleSizeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        ...sizeFormData,
        garment_type_id: sizeFormData.garment_type_id || undefined,
      };

      if (editingSize) {
        await updateSizeMutation.mutateAsync({ id: editingSize.id, data });
        toast.success("Size updated successfully");
      } else {
        await createSizeMutation.mutateAsync(data);
        toast.success("Size created successfully");
      }
      setIsSizeDialogOpen(false);
      resetSizeForm();
    } catch (error: any) {
      toast.error(error?.message || "Failed to save size");
    }
  };

  const handleEditSize = (item: SizeMaster) => {
    setEditingSize(item);
    setSizeFormData({
      garment_type_id: item.garment_type_id,
      size_name: item.size_name,
      size_label: item.size_label || "",
      gender: item.gender,
      age_group: item.age_group,
      fit_type: item.fit_type || "Regular",
      size_order: item.size_order,
      description: item.description || "",
      is_active: item.is_active,
    });
    setIsSizeDialogOpen(true);
  };

  const handleDeleteSize = async (id: number) => {
    if (confirm("Are you sure you want to delete this size?")) {
      try {
        await deleteSizeMutation.mutateAsync(id);
        toast.success("Size deleted successfully");
      } catch (error: any) {
        toast.error(error?.message || "Failed to delete size");
      }
    }
  };

  const resetSizeForm = () => {
    setEditingSize(null);
    setSizeFormData({
      garment_type_id: 0,
      size_name: "",
      size_label: "",
      gender: "Unisex",
      age_group: "Adult",
      fit_type: "Regular",
      size_order: 0,
      description: "",
      is_active: true,
    });
    setSelectedGarmentTypeId(null);
  };

  // Garment type handlers
  const handleGarmentTypeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createGarmentTypeMutation.mutateAsync(garmentTypeFormData);
      toast.success("Garment type created successfully");
      setIsGarmentTypeDialogOpen(false);
      resetGarmentTypeForm();
    } catch (error: any) {
      toast.error(error?.message || "Failed to create garment type");
    }
  };

  const resetGarmentTypeForm = () => {
    setGarmentTypeFormData({
      name: "",
      code: "",
      category: "",
      description: "",
    });
  };

  // Measurement handlers
  const handleMeasurementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSizeForMeasurement) return;

    try {
      const data = {
        measurement_spec_id: measurementFormData.measurement_spec_id,
        value_cm: parseFloat(measurementFormData.value_cm),
        tolerance_plus: parseFloat(measurementFormData.tolerance_plus),
        tolerance_minus: parseFloat(measurementFormData.tolerance_minus),
        notes: measurementFormData.notes || undefined,
      };

      await addSizeMeasurementMutation.mutateAsync({
        sizeId: selectedSizeForMeasurement.id,
        data,
      });
      toast.success("Measurement added successfully");
      setIsMeasurementDialogOpen(false);
      resetMeasurementForm();
    } catch (error: any) {
      toast.error(error?.message || "Failed to add measurement");
    }
  };

  const handleAddMeasurement = (size: SizeMaster) => {
    setSelectedSizeForMeasurement(size);
    setSelectedGarmentTypeId(size.garment_type_id);
    setIsMeasurementDialogOpen(true);
  };

  const resetMeasurementForm = () => {
    setSelectedSizeForMeasurement(null);
    setMeasurementFormData({
      measurement_spec_id: 0,
      value_cm: "",
      tolerance_plus: "1.0",
      tolerance_minus: "1.0",
      notes: "",
    });
  };

  // Group sizes by garment type for dashboard
  const sizesByGarment = useMemo(() => {
    const grouped: Record<string, { count: number; genders: Set<string>; garmentTypeId: number }> = {};
    sizes.forEach(size => {
      const garmentType = size.garment_type;
      const key = garmentType?.name || "Unknown";
      if (!grouped[key]) {
        grouped[key] = { count: 0, genders: new Set(), garmentTypeId: size.garment_type_id };
      }
      grouped[key].count++;
      grouped[key].genders.add(size.gender);
    });
    return grouped;
  }, [sizes]);

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
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Maximize2 className="h-8 w-8" />
          Size Master
        </h1>
        <p className="text-muted-foreground">
          Manage sizes with garment-type-based measurement specifications
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 lg:w-[500px]">
          <TabsTrigger value="dashboard" className="gap-2">
            <Users className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="sizes" className="gap-2">
            <Ruler className="h-4 w-4" />
            Sizes
          </TabsTrigger>
          <TabsTrigger value="garment-types" className="gap-2">
            <Shirt className="h-4 w-4" />
            Garment Types
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ruler className="h-5 w-5" />
                  Total Sizes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{sizes.length}</div>
                <p className="text-sm text-muted-foreground">Size definitions with measurements</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shirt className="h-5 w-5" />
                  Garment Types
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{garmentTypes.length}</div>
                <p className="text-sm text-muted-foreground">With measurement specifications</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Object.entries(sizesByGarment).map(([garmentType, data]) => (
              <Card
                key={garmentType}
                className="cursor-pointer transition-all hover:shadow-md"
                onClick={() => {
                  setGarmentTypeFilter(String(data.garmentTypeId));
                  setActiveTab("sizes");
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="p-2 bg-primary/10 rounded">
                      <Shirt className="h-5 w-5 text-primary" />
                    </div>
                    <Badge variant="secondary">{data.count} sizes</Badge>
                  </div>
                  <h3 className="font-semibold mt-3">{garmentType}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {Array.from(data.genders).join(", ")}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                How It Works
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="p-3 bg-muted rounded">
                  <h4 className="font-semibold mb-1">1. Garment Types</h4>
                  <p className="text-muted-foreground">
                    Define garment types (Sweater, T-Shirt, etc.) with their required measurements
                  </p>
                </div>
                <div className="p-3 bg-muted rounded">
                  <h4 className="font-semibold mb-1">2. Measurement Specs</h4>
                  <p className="text-muted-foreground">
                    Each garment type has specific measurements (Chest, Length, Sleeve, etc.)
                  </p>
                </div>
                <div className="p-3 bg-muted rounded">
                  <h4 className="font-semibold mb-1">3. Sizes</h4>
                  <p className="text-muted-foreground">
                    Create sizes (S, M, L) and fill in values for each measurement spec
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sizes Tab */}
        <TabsContent value="sizes" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search sizes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-[200px]"
                />
              </div>
              <Select value={garmentTypeFilter} onValueChange={setGarmentTypeFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Garment Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Garments</SelectItem>
                  {garmentTypesSelector.map((gt) => (
                    <SelectItem key={gt.id} value={String(gt.id)}>
                      {gt.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={genderFilter} onValueChange={setGenderFilter}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Genders</SelectItem>
                  {genderOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={ageGroupFilter} onValueChange={setAgeGroupFilter}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Age Group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ages</SelectItem>
                  {ageGroupOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Dialog
              open={isSizeDialogOpen}
              onOpenChange={(open) => {
                setIsSizeDialogOpen(open);
                if (!open) resetSizeForm();
              }}
            >
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Size
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingSize ? "Edit Size" : "Add New Size"}</DialogTitle>
                  <DialogDescription>
                    Select a garment type to load its measurement specifications
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSizeSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="garment_type_id">Garment Type *</Label>
                      <Select
                        value={String(sizeFormData.garment_type_id || "")}
                        onValueChange={(v) =>
                          setSizeFormData({ ...sizeFormData, garment_type_id: parseInt(v) })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select garment type" />
                        </SelectTrigger>
                        <SelectContent>
                          {garmentTypesSelector.map((gt) => (
                            <SelectItem key={gt.id} value={String(gt.id)}>
                              {gt.name} ({gt.category})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {sizeFormData.garment_type_id > 0 && (measurementSpecs as GarmentMeasurementSpec[]).length > 0 && (
                      <div className="p-3 bg-muted rounded">
                        <h4 className="text-sm font-medium mb-2">Measurements for this garment:</h4>
                        <div className="flex flex-wrap gap-1">
                          {(measurementSpecs as GarmentMeasurementSpec[]).map((spec) => (
                            <Badge key={spec.id} variant="outline" className="text-xs">
                              {spec.measurement_name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="size_name">Size Name *</Label>
                        <Select
                          value={sizeFormData.size_name}
                          onValueChange={(v) =>
                            setSizeFormData({ ...sizeFormData, size_name: v })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select size" />
                          </SelectTrigger>
                          <SelectContent>
                            {sizeNames.map((size) => (
                              <SelectItem key={size} value={size}>
                                {size}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="size_label">Display Label</Label>
                        <Input
                          id="size_label"
                          value={sizeFormData.size_label}
                          onChange={(e) =>
                            setSizeFormData({ ...sizeFormData, size_label: e.target.value })
                          }
                          placeholder="e.g., Medium"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="gender">Gender *</Label>
                        <Select
                          value={sizeFormData.gender}
                          onValueChange={(v: GenderEnum) =>
                            setSizeFormData({ ...sizeFormData, gender: v })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {genderOptions.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="age_group">Age Group *</Label>
                        <Select
                          value={sizeFormData.age_group}
                          onValueChange={(v: AgeGroupEnum) =>
                            setSizeFormData({ ...sizeFormData, age_group: v })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ageGroupOptions.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="fit_type">Fit Type</Label>
                        <Select
                          value={sizeFormData.fit_type}
                          onValueChange={(v: FitTypeEnum) =>
                            setSizeFormData({ ...sizeFormData, fit_type: v })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {fitTypeOptions.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={sizeFormData.description}
                        onChange={(e) =>
                          setSizeFormData({ ...sizeFormData, description: e.target.value })
                        }
                        placeholder="Additional notes"
                        rows={2}
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="is_active"
                        checked={sizeFormData.is_active}
                        onCheckedChange={(checked) =>
                          setSizeFormData({ ...sizeFormData, is_active: !!checked })
                        }
                      />
                      <Label htmlFor="is_active" className="cursor-pointer">Active</Label>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={createSizeMutation.isPending || updateSizeMutation.isPending}>
                      {editingSize ? "Update" : "Create"} Size
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="text-sm text-muted-foreground">
            Showing {filteredSizes.length} of {sizes.length} sizes
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10"></TableHead>
                  <TableHead>Size Code</TableHead>
                  <TableHead>Garment</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Fit</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sizesLoading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : filteredSizes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground">
                      {searchTerm || garmentTypeFilter !== "all" || genderFilter !== "all"
                        ? "No sizes found matching your filters."
                        : "No sizes yet. Add your first size."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSizes.map((item) => {
                    const genderBadge = getGenderBadge(item.gender);
                    const isExpanded = expandedRows.has(item.id);
                    const hasMeasurements = item.measurements && item.measurements.length > 0;

                    return (
                      <React.Fragment key={item.id}>
                        <TableRow className={isExpanded ? "border-b-0" : ""}>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => toggleRowExpansion(item.id)}
                              disabled={!hasMeasurements}
                            >
                              {isExpanded ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </Button>
                          </TableCell>
                          <TableCell>
                            <code className="px-1.5 py-0.5 bg-muted rounded text-sm font-mono">
                              {item.size_code}
                            </code>
                          </TableCell>
                          <TableCell>{item.garment_type?.name || "-"}</TableCell>
                          <TableCell className="font-medium">
                            {item.size_name}
                            {item.size_label && (
                              <span className="text-muted-foreground ml-1">({item.size_label})</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge className={genderBadge.color} variant="secondary">
                              {genderBadge.label}
                            </Badge>
                          </TableCell>
                          <TableCell>{item.age_group}</TableCell>
                          <TableCell>{item.fit_type || "Regular"}</TableCell>
                          <TableCell>
                            <Badge variant={item.is_active ? "default" : "secondary"}>
                              {item.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleAddMeasurement(item)}
                                title="Add Measurement"
                              >
                                <Ruler className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleEditSize(item)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDeleteSize(item.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                        {isExpanded && hasMeasurements && (
                          <TableRow>
                            <TableCell colSpan={9} className="bg-muted/30 p-4">
                              <div className="text-sm">
                                <h4 className="font-semibold mb-2">Measurements</h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                  {item.measurements?.map((m) => (
                                    <div key={m.id} className="bg-background p-2 rounded border">
                                      <div className="font-medium">
                                        {m.measurement_spec?.measurement_name || "Unknown"}
                                      </div>
                                      <div className="text-muted-foreground">
                                        {m.value_cm} cm
                                        <span className="text-xs ml-1">
                                          (+{m.tolerance_plus}/-{m.tolerance_minus})
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Garment Types Tab */}
        <TabsContent value="garment-types" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold">Garment Types</h2>
              <p className="text-sm text-muted-foreground">
                Each garment type has specific measurement specifications
              </p>
            </div>

            <Dialog
              open={isGarmentTypeDialogOpen}
              onOpenChange={(open) => {
                setIsGarmentTypeDialogOpen(open);
                if (!open) resetGarmentTypeForm();
              }}
            >
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Garment Type
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add Garment Type</DialogTitle>
                  <DialogDescription>
                    Create a new garment type with measurement specifications
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleGarmentTypeSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="gt_name">Name *</Label>
                        <Input
                          id="gt_name"
                          value={garmentTypeFormData.name}
                          onChange={(e) =>
                            setGarmentTypeFormData({ ...garmentTypeFormData, name: e.target.value })
                          }
                          placeholder="e.g., Sweater"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="gt_code">Code *</Label>
                        <Input
                          id="gt_code"
                          value={garmentTypeFormData.code}
                          onChange={(e) =>
                            setGarmentTypeFormData({ ...garmentTypeFormData, code: e.target.value.toUpperCase() })
                          }
                          placeholder="e.g., SWT"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gt_category">Category *</Label>
                      <Input
                        id="gt_category"
                        value={garmentTypeFormData.category}
                        onChange={(e) =>
                          setGarmentTypeFormData({ ...garmentTypeFormData, category: e.target.value })
                        }
                        placeholder="e.g., Tops, Bottoms, Accessories"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gt_description">Description</Label>
                      <Textarea
                        id="gt_description"
                        value={garmentTypeFormData.description}
                        onChange={(e) =>
                          setGarmentTypeFormData({ ...garmentTypeFormData, description: e.target.value })
                        }
                        placeholder="Optional description"
                        rows={2}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={createGarmentTypeMutation.isPending}>
                      Create Garment Type
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {garmentTypesLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : garmentTypes.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No garment types yet. Add your first garment type to get started.
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {garmentTypes.map((gt) => (
                <Card key={gt.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{gt.name}</CardTitle>
                        <CardDescription>
                          <code className="text-xs">{gt.code}</code> - {gt.category}
                        </CardDescription>
                      </div>
                      <Badge variant="outline">
                        {gt.measurement_specs?.length || 0} specs
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {gt.measurement_specs && gt.measurement_specs.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {gt.measurement_specs.map((spec) => (
                          <Badge key={spec.id} variant="secondary" className="text-xs">
                            {spec.measurement_name}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No measurements defined</p>
                    )}
                    {gt.description && (
                      <p className="text-sm text-muted-foreground mt-2">{gt.description}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Add Measurement Dialog */}
      <Dialog
        open={isMeasurementDialogOpen}
        onOpenChange={(open) => {
          setIsMeasurementDialogOpen(open);
          if (!open) resetMeasurementForm();
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Measurement</DialogTitle>
            <DialogDescription>
              Add a measurement to {selectedSizeForMeasurement?.size_code}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleMeasurementSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="measurement_spec_id">Measurement *</Label>
                <Select
                  value={String(measurementFormData.measurement_spec_id || "")}
                  onValueChange={(v) =>
                    setMeasurementFormData({ ...measurementFormData, measurement_spec_id: parseInt(v) })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select measurement" />
                  </SelectTrigger>
                  <SelectContent>
                    {(measurementSpecs as GarmentMeasurementSpec[]).map((spec) => (
                      <SelectItem key={spec.id} value={String(spec.id)}>
                        {spec.measurement_name} ({spec.measurement_code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="value_cm">Value (cm) *</Label>
                  <Input
                    id="value_cm"
                    type="number"
                    step="0.1"
                    value={measurementFormData.value_cm}
                    onChange={(e) =>
                      setMeasurementFormData({ ...measurementFormData, value_cm: e.target.value })
                    }
                    placeholder="96"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tolerance_plus">+ Tol</Label>
                  <Input
                    id="tolerance_plus"
                    type="number"
                    step="0.1"
                    value={measurementFormData.tolerance_plus}
                    onChange={(e) =>
                      setMeasurementFormData({ ...measurementFormData, tolerance_plus: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tolerance_minus">- Tol</Label>
                  <Input
                    id="tolerance_minus"
                    type="number"
                    step="0.1"
                    value={measurementFormData.tolerance_minus}
                    onChange={(e) =>
                      setMeasurementFormData({ ...measurementFormData, tolerance_minus: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="m_notes">Notes</Label>
                <Input
                  id="m_notes"
                  value={measurementFormData.notes}
                  onChange={(e) =>
                    setMeasurementFormData({ ...measurementFormData, notes: e.target.value })
                  }
                  placeholder="Optional notes"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={addSizeMeasurementMutation.isPending}>
                Add Measurement
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
