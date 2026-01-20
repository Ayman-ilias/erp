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
import { SearchableSelect, type SelectOption } from "@/components/ui/searchable-select";
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
import { MeasurementSpecInput, type MeasurementSpec } from "@/components/size-master/measurement-spec-input";

// Gender options with colors for badges
const genderOptionsWithColors: { value: GenderEnum; label: string; color: string }[] = [
  { value: "Male", label: "Male", color: "bg-blue-100 text-blue-800" },
  { value: "Female", label: "Female", color: "bg-pink-100 text-pink-800" },
  { value: "Unisex", label: "Unisex", color: "bg-purple-100 text-purple-800" },
  { value: "Kids Boy", label: "Kids Boy", color: "bg-blue-50 text-blue-700" },
  { value: "Kids Girl", label: "Kids Girl", color: "bg-pink-50 text-pink-700" },
  { value: "Kids Unisex", label: "Kids Unisex", color: "bg-purple-50 text-purple-700" },
  { value: "Infant", label: "Infant", color: "bg-yellow-100 text-yellow-800" },
  { value: "Toddler", label: "Toddler", color: "bg-green-100 text-green-800" },
];

// Default Gender options for SearchableSelect
const defaultGenderOptions: SelectOption[] = [
  { value: "Male", label: "Male", description: "Adult male sizing" },
  { value: "Female", label: "Female", description: "Adult female sizing" },
  { value: "Unisex", label: "Unisex", description: "Gender-neutral sizing" },
  { value: "Kids Boy", label: "Kids Boy", description: "Children's boy sizing" },
  { value: "Kids Girl", label: "Kids Girl", description: "Children's girl sizing" },
  { value: "Kids Unisex", label: "Kids Unisex", description: "Children's unisex sizing" },
  { value: "Infant", label: "Infant", description: "0-12 months" },
  { value: "Toddler", label: "Toddler", description: "1-3 years" },
];

// Default Fit type options for SearchableSelect
const defaultFitTypeOptions: SelectOption[] = [
  { value: "Regular", label: "Regular", description: "Standard fit" },
  { value: "Slim", label: "Slim", description: "Fitted cut" },
  { value: "Relaxed", label: "Relaxed", description: "Comfortable loose fit" },
  { value: "Oversized", label: "Oversized", description: "Extra room throughout" },
  { value: "Fitted", label: "Fitted", description: "Body-hugging fit" },
  { value: "Loose", label: "Loose", description: "Generous room" },
  { value: "Athletic", label: "Athletic", description: "Sports performance fit" },
  { value: "Tapered", label: "Tapered", description: "Narrowing toward bottom" },
  { value: "Skinny", label: "Skinny", description: "Very tight fit" },
  { value: "Wide", label: "Wide", description: "Extra wide cut" },
];

// Default Age group options for SearchableSelect
const defaultAgeGroupOptions: SelectOption[] = [
  { value: "Newborn (0-3 months)", label: "Newborn", description: "0-3 months" },
  { value: "Infant (3-12 months)", label: "Infant", description: "3-12 months" },
  { value: "Toddler (1-3 years)", label: "Toddler", description: "1-3 years" },
  { value: "Kids (4-12 years)", label: "Kids", description: "4-12 years" },
  { value: "Teen (13-17 years)", label: "Teen", description: "13-17 years" },
  { value: "Adult (18+)", label: "Adult", description: "18 and over" },
  { value: "All Ages", label: "All Ages", description: "Universal sizing" },
];

// Default Size name options for SearchableSelect
const defaultSizeNameOptions: SelectOption[] = [
  { value: "XXS", label: "XXS", description: "Extra Extra Small" },
  { value: "XS", label: "XS", description: "Extra Small" },
  { value: "S", label: "S", description: "Small" },
  { value: "M", label: "M", description: "Medium" },
  { value: "L", label: "L", description: "Large" },
  { value: "XL", label: "XL", description: "Extra Large" },
  { value: "XXL", label: "XXL", description: "2X Large" },
  { value: "XXXL", label: "XXXL", description: "3X Large" },
  { value: "4XL", label: "4XL", description: "4X Large" },
  { value: "5XL", label: "5XL", description: "5X Large" },
  { value: "ONE SIZE", label: "ONE SIZE", description: "Universal fit" },
  { value: "0", label: "0", description: "Numeric size 0" },
  { value: "2", label: "2", description: "Numeric size 2" },
  { value: "4", label: "4", description: "Numeric size 4" },
  { value: "6", label: "6", description: "Numeric size 6" },
  { value: "8", label: "8", description: "Numeric size 8" },
  { value: "10", label: "10", description: "Numeric size 10" },
  { value: "12", label: "12", description: "Numeric size 12" },
  { value: "14", label: "14", description: "Numeric size 14" },
  { value: "16", label: "16", description: "Numeric size 16" },
];

// Legacy filter options (for backward compatibility with filters)
const genderFilterOptions = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
  { value: "Unisex", label: "Unisex" },
];

const ageGroupFilterOptions = [
  { value: "Adult (18+)", label: "Adult" },
  { value: "Teen (13-17 years)", label: "Teen" },
  { value: "Kids (4-12 years)", label: "Kids" },
  { value: "Toddler (1-3 years)", label: "Toddler" },
  { value: "Infant (3-12 months)", label: "Infant" },
];

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

  // Custom options state (for user-added values)
  const [customSizeNames, setCustomSizeNames] = useState<SelectOption[]>([]);
  const [customGenders, setCustomGenders] = useState<SelectOption[]>([]);
  const [customAgeGroups, setCustomAgeGroups] = useState<SelectOption[]>([]);
  const [customFitTypes, setCustomFitTypes] = useState<SelectOption[]>([]);

  // Combined options (defaults + custom)
  const sizeNameOptions = useMemo(() => [...defaultSizeNameOptions, ...customSizeNames], [customSizeNames]);
  const genderOptions = useMemo(() => [...defaultGenderOptions, ...customGenders], [customGenders]);
  const ageGroupOptions = useMemo(() => [...defaultAgeGroupOptions, ...customAgeGroups], [customAgeGroups]);
  const fitTypeOptions = useMemo(() => [...defaultFitTypeOptions, ...customFitTypes], [customFitTypes]);

  // Size form
  const [sizeFormData, setSizeFormData] = useState({
    garment_type_id: 0,
    size_name: "",
    size_label: "",
    gender: "Unisex" as GenderEnum,
    age_group: "Adult (18+)" as AgeGroupEnum,
    fit_type: "Regular" as FitTypeEnum,
    size_order: 0,
    description: "",
    is_active: true,
  });

  // Measurement specifications state
  const [measurementSpecs, setMeasurementSpecs] = useState<MeasurementSpec[]>([]);

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
  const { data: garmentMeasurementSpecs = [] } = useGarmentTypeMeasurements(selectedGarmentTypeId || 0);

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
    const option = genderOptionsWithColors.find(o => o.value === gender);
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
      // Prepare measurement data for creation (without server-generated fields)
      const measurements = measurementSpecs
        .filter(spec => spec.measurement_name && spec.value)
        .map(spec => ({
          measurement_name: spec.measurement_name,
          measurement_code: spec.measurement_code || spec.measurement_name.toUpperCase().replace(/\s+/g, '_'),
          value_cm: parseFloat(spec.value),
          unit_symbol: spec.unit_symbol,
          unit_name: spec.unit_name,
          tolerance_plus: spec.tolerance_plus || 1.0,
          tolerance_minus: spec.tolerance_minus || 1.0,
          notes: spec.notes || "",
          display_order: spec.display_order || 0,
          is_custom: spec.is_custom || false,
          measurement_spec_id: spec.measurement_spec_id,
          original_value: spec.original_value || parseFloat(spec.value),
          original_unit: spec.original_unit || spec.unit_symbol,
        }));

      // Define proper types for create and update operations
      type CreateSizeData = Omit<Partial<SizeMaster>, 'measurements'> & {
        measurements?: Array<{
          measurement_name: string;
          measurement_code: string;
          value_cm: number;
          unit_symbol: string;
          unit_name: string;
          tolerance_plus: number;
          tolerance_minus: number;
          notes: string;
          display_order: number;
          is_custom: boolean;
          measurement_spec_id?: number;
          original_value: number;
          original_unit: string;
        }>;
      };

      if (editingSize) {
        // For updates, we don't send measurements in the main payload
        const updateData: Partial<SizeMaster> = {
          ...sizeFormData,
          garment_type_id: sizeFormData.garment_type_id || undefined,
        };
        await updateSizeMutation.mutateAsync({ id: editingSize.id, data: updateData });
        toast.success("Size updated successfully");
      } else {
        const createData: CreateSizeData = {
          ...sizeFormData,
          garment_type_id: sizeFormData.garment_type_id || undefined,
          measurements: measurements,
        };
        await createSizeMutation.mutateAsync(createData as Partial<SizeMaster>);
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

    // Convert existing measurements to MeasurementSpec format
    const existingMeasurements: MeasurementSpec[] = (item.measurements || []).map(m => ({
      id: m.id,
      measurement_name: m.measurement_name,
      measurement_code: m.measurement_code,
      value: m.value_cm?.toString() || "",
      unit_symbol: m.unit_symbol || "cm",
      unit_name: m.unit_name || "Centimeter",
      tolerance_plus: m.tolerance_plus,
      tolerance_minus: m.tolerance_minus,
      notes: m.notes || "",
      display_order: m.display_order || 0,
      is_custom: m.is_custom || false,
      measurement_spec_id: m.measurement_spec_id,
      original_value: m.original_value,
      original_unit: m.original_unit,
    }));
    setMeasurementSpecs(existingMeasurements);

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
      age_group: "Adult (18+)",
      fit_type: "Regular",
      size_order: 0,
      description: "",
      is_active: true,
    });
    setSelectedGarmentTypeId(null);
    setMeasurementSpecs([]);
  };

  // Handlers for adding new custom options
  const handleAddSizeName = (value: string) => {
    const newOption: SelectOption = { value, label: value, description: "Custom size" };
    setCustomSizeNames(prev => [...prev, newOption]);
    setSizeFormData(prev => ({ ...prev, size_name: value }));
    toast.success(`Added new size name: ${value}`);
  };

  const handleAddGender = (value: string) => {
    const newOption: SelectOption = { value, label: value, description: "Custom gender category" };
    setCustomGenders(prev => [...prev, newOption]);
    setSizeFormData(prev => ({ ...prev, gender: value as GenderEnum }));
    toast.success(`Added new gender: ${value}`);
  };

  const handleAddAgeGroup = (value: string) => {
    const newOption: SelectOption = { value, label: value, description: "Custom age group" };
    setCustomAgeGroups(prev => [...prev, newOption]);
    setSizeFormData(prev => ({ ...prev, age_group: value as AgeGroupEnum }));
    toast.success(`Added new age group: ${value}`);
  };

  const handleAddFitType = (value: string) => {
    const newOption: SelectOption = { value, label: value, description: "Custom fit type" };
    setCustomFitTypes(prev => [...prev, newOption]);
    setSizeFormData(prev => ({ ...prev, fit_type: value as FitTypeEnum }));
    toast.success(`Added new fit type: ${value}`);
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
                  {genderFilterOptions.map((opt) => (
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
                  {ageGroupFilterOptions.map((opt) => (
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

                    {sizeFormData.garment_type_id > 0 && (
                      <MeasurementSpecInput
                        measurements={measurementSpecs}
                        onMeasurementsChange={setMeasurementSpecs}
                        predefinedMeasurements={(garmentMeasurementSpecs as GarmentMeasurementSpec[]).map(spec => spec.measurement_name)}
                        disabled={createSizeMutation.isPending || updateSizeMutation.isPending}
                      />
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="size_name">Size Name *</Label>
                        <SearchableSelect
                          options={sizeNameOptions}
                          value={sizeFormData.size_name}
                          onValueChange={(v) =>
                            setSizeFormData({ ...sizeFormData, size_name: v })
                          }
                          placeholder="Select or add size"
                          searchPlaceholder="Search sizes..."
                          emptyMessage="No sizes found"
                          allowAddNew={true}
                          onAddNew={handleAddSizeName}
                          addNewLabel="Add Custom Size"
                          addNewPlaceholder="Enter size name (e.g., 3XL, 38)"
                        />
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
                        <SearchableSelect
                          options={genderOptions}
                          value={sizeFormData.gender}
                          onValueChange={(v) =>
                            setSizeFormData({ ...sizeFormData, gender: v as GenderEnum })
                          }
                          placeholder="Select gender"
                          searchPlaceholder="Search..."
                          emptyMessage="No match found"
                          allowAddNew={true}
                          onAddNew={handleAddGender}
                          addNewLabel="Add Custom Gender"
                          addNewPlaceholder="Enter gender category"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="age_group">Age Group *</Label>
                        <SearchableSelect
                          options={ageGroupOptions}
                          value={sizeFormData.age_group}
                          onValueChange={(v) =>
                            setSizeFormData({ ...sizeFormData, age_group: v as AgeGroupEnum })
                          }
                          placeholder="Select age group"
                          searchPlaceholder="Search..."
                          emptyMessage="No match found"
                          allowAddNew={true}
                          onAddNew={handleAddAgeGroup}
                          addNewLabel="Add Custom Age Group"
                          addNewPlaceholder="Enter age group"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="fit_type">Fit Type</Label>
                        <SearchableSelect
                          options={fitTypeOptions}
                          value={sizeFormData.fit_type}
                          onValueChange={(v) =>
                            setSizeFormData({ ...sizeFormData, fit_type: v as FitTypeEnum })
                          }
                          placeholder="Select fit"
                          searchPlaceholder="Search..."
                          emptyMessage="No match found"
                          allowAddNew={true}
                          onAddNew={handleAddFitType}
                          addNewLabel="Add Custom Fit Type"
                          addNewPlaceholder="Enter fit type"
                        />
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
                    {(garmentMeasurementSpecs as GarmentMeasurementSpec[]).map((spec) => (
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
