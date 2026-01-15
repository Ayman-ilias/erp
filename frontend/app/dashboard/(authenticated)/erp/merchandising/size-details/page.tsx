"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Loader2, Shirt, User, Users, Sparkles } from "lucide-react";
import { api, sizeChartService } from "@/services/api";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/auth-context";

// Measurement field definitions for each garment type
const MEASUREMENT_FIELDS = {
  Sweater: [
    { key: "chest_bust", label: "Chest/Bust", required: true },
    { key: "body_length", label: "Body Length", required: true },
    { key: "sleeve_length", label: "Sleeve Length", required: true },
    { key: "shoulder_width", label: "Shoulder Width", required: false },
    { key: "waist", label: "Waist", required: false },
    { key: "hem_width", label: "Hem Width", required: false },
    { key: "neck_collar_width", label: "Neck/Collar Width", required: false },
    { key: "cuff_width", label: "Cuff Width", required: false },
  ],
  Pants: [
    { key: "waist", label: "Waist", required: true },
    { key: "hip", label: "Hip", required: true },
    { key: "inseam", label: "Inseam", required: true },
    { key: "thigh", label: "Thigh", required: false },
    { key: "knee", label: "Knee", required: false },
    { key: "leg_opening", label: "Leg Opening/Hem", required: false },
    { key: "front_rise", label: "Front Rise", required: false },
    { key: "back_rise", label: "Back Rise", required: false },
  ],
  Jacket: [
    { key: "chest_bust", label: "Chest/Bust", required: true },
    { key: "body_length", label: "Body Length", required: true },
    { key: "shoulder_width", label: "Shoulder Width", required: true },
    { key: "sleeve_length", label: "Sleeve Length", required: false },
    { key: "waist", label: "Waist", required: false },
    { key: "hip", label: "Hip", required: false },
    { key: "cuff_opening", label: "Cuff/Sleeve Opening", required: false },
    { key: "collar_neck", label: "Collar/Neck", required: false },
  ],
  Hat: [
    { key: "head_circumference", label: "Head Circumference", required: true },
    { key: "height_crown", label: "Height/Crown", required: false },
    { key: "brim_width", label: "Brim/Visor Width", required: false },
  ],
  Gloves: [
    { key: "hand_circumference", label: "Hand Circumference", required: true },
    { key: "hand_length", label: "Hand Length", required: true },
    { key: "wrist_opening", label: "Wrist Opening", required: false },
  ],
  Muffler: [
    { key: "length", label: "Length", required: true },
    { key: "width", label: "Width", required: true },
    { key: "hem_width", label: "Hem Width", required: false },
  ],
};

const SIZE_NAMES = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL", "5XL"];

export default function SizeDetailsNewPage() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSize, setEditingSize] = useState<any>(null);
  
  // Tab states
  const [selectedProfile, setSelectedProfile] = useState<string>("general");
  const [selectedGender, setSelectedGender] = useState<string>("Male");
  const [selectedProductType, setSelectedProductType] = useState<number | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<string>("cm");

  // Fetch product types and profiles
  const { data: productTypes = [], isLoading: loadingTypes } = useQuery({
    queryKey: ["productTypes"],
    queryFn: () => sizeChartService.getProductTypes(),
  });

  const { data: profiles = [], isLoading: loadingProfiles } = useQuery({
    queryKey: ["sizeChartProfiles"],
    queryFn: () => sizeChartService.getProfiles(),
  });

  // Get current profile ID
  const currentProfile = profiles.find((p: any) => 
    p.profile_name.toLowerCase() === selectedProfile.toLowerCase()
  );
  const currentProfileId = currentProfile?.id;

  // Fetch sizes based on current selections
  const { data: sizesData = [], isLoading, refetch } = useQuery({
    queryKey: ["sizeChart", currentProfileId, selectedProductType, selectedGender],
    queryFn: () => sizeChartService.getAll(currentProfileId, selectedProductType || undefined),
    enabled: !!currentProfileId && !!selectedProductType,
  });

  // Filter by gender client-side
  const filteredSizes = sizesData.filter((s: any) => {
    if (!s.gender || s.gender === "Unisex") return true;
    return s.gender === selectedGender;
  });

  const [formData, setFormData] = useState<any>({
    size_id: "",
    size_name: "",
    gender: "Male",
    remarks: "",
    // Dynamic measurement fields will be added based on product type
  });
  
  // Reset form when product type changes
  useEffect(() => {
    if (selectedProductType && !editingSize) {
      const selectedType = productTypes.find((pt: any) => pt.id === selectedProductType);
      const fields = MEASUREMENT_FIELDS[selectedType?.type_name as keyof typeof MEASUREMENT_FIELDS] || [];
      const resetData: any = {
        size_id: "",
        size_name: "",
        gender: selectedGender,
        remarks: "",
      };
      fields.forEach(field => {
        resetData[field.key] = "";
      });
      setFormData(resetData);
    }
  }, [selectedProductType, selectedGender, productTypes, editingSize]);

  const resetForm = () => {
    // Reset all form fields including measurement fields
    const resetData: any = {
      size_id: "",
      size_name: "",
      gender: selectedGender,
      remarks: "",
    };
    
    // Reset all measurement fields based on current product type
    if (selectedProductType) {
      const selectedType = productTypes.find((pt: any) => pt.id === selectedProductType);
      const fields = MEASUREMENT_FIELDS[selectedType?.type_name as keyof typeof MEASUREMENT_FIELDS] || [];
      fields.forEach(field => {
        resetData[field.key] = "";
      });
    }
    
    setFormData(resetData);
    setEditingSize(null);
    setDialogOpen(false);
  };

  const handleEdit = (size: any) => {
    setEditingSize(size);
    // Load measurements from the measurements object
    const formDataWithMeasurements: any = {
      size_id: size.auto_generated_id || "",
      size_name: size.size_name,
      gender: size.gender || selectedGender,
      remarks: size.remarks || "",
    };
    
    // Load measurements from the measurements object
    if (size.measurements && typeof size.measurements === 'object') {
      Object.keys(size.measurements).forEach(key => {
        formDataWithMeasurements[key] = size.measurements[key];
      });
    }
    
    setFormData(formDataWithMeasurements);
    setDialogOpen(true);
  };

  const generateAutoId = async () => {
    if (!currentProfileId || !selectedProductType) {
      toast.error("Please select profile and product type first");
      return;
    }

    try {
      if (!token) {
        toast.error("Authentication required");
        return;
      }
      
      const response = await fetch(`/api/v1/size-charts/generate-id?profile_id=${currentProfileId}&gender=${selectedGender}&product_type_id=${selectedProductType}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to generate ID");
      }
      
      const data = await response.json();
      setFormData({ ...formData, size_id: data.size_id });
      toast.success("ID generated successfully");
    } catch (error: any) {
      console.error("Generate ID error:", error);
      toast.error(error?.message || "Failed to generate ID");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentProfileId || !selectedProductType) {
      toast.error("Please select profile and product type");
      return;
    }

    if (!formData.size_name) {
      toast.error("Please select a size name");
      return;
    }

    const selectedType = productTypes.find((pt: any) => pt.id === selectedProductType);
    const fields = MEASUREMENT_FIELDS[selectedType?.type_name as keyof typeof MEASUREMENT_FIELDS] || [];

    // Build measurements object with only relevant fields (keep original field names)
    const measurements: any = {};
    fields.forEach(field => {
      const value = formData[field.key];
      if (value !== undefined && value !== null && value !== "") {
        measurements[field.key] = parseFloat(value) || 0;
      }
    });

    // Get size order from SIZE_NAMES array
    const sizeOrder = SIZE_NAMES.indexOf(formData.size_name);
    if (sizeOrder === -1) {
      toast.error("Invalid size name");
      return;
    }

    // Build payload for samples module (size_chart_master table)
    const payload: any = {
      profile_id: currentProfileId,
      product_type_id: selectedProductType,
      size_name: formData.size_name,
      size_order: sizeOrder,
      measurements: measurements,
      gender: selectedGender,
    };
    
    // Include auto-generated ID if it was generated
    if (formData.size_id) {
      payload.auto_generated_id = formData.size_id;
    }

    try {
      if (editingSize) {
        await sizeChartService.update(editingSize.id, payload);
        toast.success("Size chart updated successfully");
      } else {
        await sizeChartService.create(payload);
        toast.success("Size chart created successfully");
      }
      queryClient.invalidateQueries({ queryKey: ["sizeChart"] });
      resetForm();
    } catch (error: any) {
      console.error("Size chart save error:", error);
      toast.error(error?.detail || error?.message || "Failed to save size chart");
    }
  };

  const handleDelete = async (sizeId: number) => {
    if (!confirm("Are you sure you want to delete this size chart?")) return;

    try {
      await sizeChartService.delete(sizeId);
      toast.success("Size chart deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["sizeChart"] });
    } catch (error: any) {
      console.error("Delete error:", error);
      toast.error(error?.detail || error?.message || "Failed to delete size chart");
    }
  };

  // Get current product type config
  const currentProductType = productTypes.find((pt: any) => pt.id === selectedProductType);
  const currentFields = currentProductType 
    ? MEASUREMENT_FIELDS[currentProductType.type_name as keyof typeof MEASUREMENT_FIELDS] || []
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Size Chart Management</h1>
          <p className="text-muted-foreground">
            Manage size charts by brand, gender, and product type
          </p>
        </div>
      </div>

      {/* Main Tabs: Regional/Brand Profiles */}
      <Tabs value={selectedProfile} onValueChange={setSelectedProfile}>
        <TabsList className="grid w-full grid-cols-4 h-12">
          <TabsTrigger value="general" className="text-base">
            <Shirt className="mr-2 h-5 w-5" />
            General
          </TabsTrigger>
          <TabsTrigger value="h&m" className="text-base">
            <Shirt className="mr-2 h-5 w-5" />
            H&M
          </TabsTrigger>
          <TabsTrigger value="zara" className="text-base">
            <Shirt className="mr-2 h-5 w-5" />
            ZARA
          </TabsTrigger>
          <TabsTrigger value="primark" className="text-base">
            <Shirt className="mr-2 h-5 w-5" />
            Primark
          </TabsTrigger>
        </TabsList>

        {["general", "h&m", "zara", "primark"].map((profile) => (
          <TabsContent key={profile} value={profile} className="mt-6">
            {/* Gender Tabs */}
            <Tabs value={selectedGender} onValueChange={setSelectedGender}>
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="Male">
                  <User className="mr-2 h-4 w-4" />
                  Male
                </TabsTrigger>
                <TabsTrigger value="Female">
                  <Users className="mr-2 h-4 w-4" />
                  Female
                </TabsTrigger>
              </TabsList>

              {["Male", "Female"].map((gender) => (
                <TabsContent key={gender} value={gender} className="mt-6">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="capitalize">
                            {profile} - {gender} Size Charts
                          </CardTitle>
                          <CardDescription>
                            Define size measurements for different garment types
                          </CardDescription>
                        </div>
                        <Dialog open={dialogOpen} onOpenChange={(open) => {
                          setDialogOpen(open);
                          if (!open) {
                            resetForm();
                          }
                        }}>
                          <DialogTrigger asChild>
                            <Button onClick={() => {
                              resetForm();
                              setDialogOpen(true);
                            }}>
                              <Plus className="mr-2 h-4 w-4" />
                              New Size Chart
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>
                                {editingSize ? "Edit" : "Create"} Size Chart
                              </DialogTitle>
                              <DialogDescription>
                                Profile: {profile.toUpperCase()} | Gender: {gender}
                              </DialogDescription>
                            </DialogHeader>

                            <form onSubmit={handleSubmit} className="space-y-6">
                              {/* Basic Info */}
                              <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                  <Label>Product Type *</Label>
                                  <Select
                                    value={selectedProductType?.toString() || ""}
                                    onValueChange={(value) => {
                                      setSelectedProductType(parseInt(value));
                                      // Reset measurement fields when product type changes
                                      if (!editingSize) {
                                        const newType = productTypes.find((pt: any) => pt.id === parseInt(value));
                                        const newFields = MEASUREMENT_FIELDS[newType?.type_name as keyof typeof MEASUREMENT_FIELDS] || [];
                                        const updatedFormData: any = { ...formData };
                                        // Clear old measurement fields
                                        Object.keys(updatedFormData).forEach(key => {
                                          if (key !== 'size_id' && key !== 'size_name' && key !== 'gender' && key !== 'remarks') {
                                            delete updatedFormData[key];
                                          }
                                        });
                                        // Initialize new measurement fields
                                        newFields.forEach(field => {
                                          updatedFormData[field.key] = "";
                                        });
                                        setFormData(updatedFormData);
                                      }
                                    }}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {productTypes.map((type: any) => (
                                        <SelectItem key={type.id} value={type.id.toString()}>
                                          {type.type_name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div className="space-y-2">
                                  <Label>Size Name *</Label>
                                  <Select
                                    value={formData.size_name}
                                    onValueChange={(value) => setFormData({ ...formData, size_name: value })}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select size" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {SIZE_NAMES.map((size) => (
                                        <SelectItem key={size} value={size}>
                                          {size}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div className="space-y-2">
                                  <Label>Size ID {!editingSize && "(Auto-generated)"}</Label>
                                  <div className="flex gap-2">
                                    <Input
                                      value={formData.size_id || ""}
                                      onChange={(e) => setFormData({ ...formData, size_id: e.target.value })}
                                      placeholder="SC-HM-M-SW-001"
                                      className="flex-1"
                                      readOnly={!!editingSize}
                                      disabled={!!editingSize}
                                    />
                                    {!editingSize && (
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        onClick={generateAutoId}
                                        title="Auto-generate ID"
                                        disabled={!currentProfileId || !selectedProductType}
                                      >
                                        <Sparkles className="h-4 w-4" />
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="grid grid-cols-4 gap-4">
                                <div className="space-y-2">
                                  <Label>Unit</Label>
                                  <Select value={selectedUnit} onValueChange={setSelectedUnit}>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="cm">Centimeter (cm)</SelectItem>
                                      <SelectItem value="mm">Millimeter (mm)</SelectItem>
                                      <SelectItem value="inch">Inch (in)</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>

                              {/* Dynamic Measurement Fields */}
                              {selectedProductType && currentFields.length > 0 && (
                                <>
                                  <div className="border-t pt-4">
                                    <h3 className="text-lg font-semibold mb-4">
                                      {currentProductType?.type_name} Measurements
                                    </h3>
                                    <div className="grid grid-cols-4 gap-4">
                                      {currentFields.map((field: any) => (
                                        <div key={field.key} className="space-y-2">
                                          <Label>
                                            {field.label}
                                            {field.required && <span className="text-destructive ml-1">*</span>}
                                          </Label>
                                          <Input
                                            type="number"
                                            step="0.01"
                                            value={formData[field.key] || ""}
                                            onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                                            required={field.required}
                                            placeholder={`in ${selectedUnit}`}
                                          />
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </>
                              )}

                              {/* Remarks */}
                              <div className="space-y-2">
                                <Label>Remarks</Label>
                                <Textarea
                                  value={formData.remarks || ""}
                                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                                  placeholder="Additional notes..."
                                  rows={2}
                                />
                              </div>

                              <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => {
                                  resetForm();
                                  setDialogOpen(false);
                                }}>
                                  Cancel
                                </Button>
                                <Button type="submit" disabled={!selectedProductType || !formData.size_name}>
                                  {editingSize ? "Update" : "Create"} Size Chart
                                </Button>
                              </DialogFooter>
                            </form>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardHeader>

                    <CardContent>
                      {/* Product Type Selector */}
                      <div className="mb-6 space-y-4">
                        <div className="flex items-center gap-4">
                          <div className="flex-1 max-w-xs">
                            <Label>Select Product Type</Label>
                            <Select
                              value={selectedProductType?.toString() || ""}
                              onValueChange={(value) => setSelectedProductType(parseInt(value))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Choose garment type..." />
                              </SelectTrigger>
                              <SelectContent>
                                {productTypes.map((type: any) => (
                                  <SelectItem key={type.id} value={type.id.toString()}>
                                    {type.type_name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          {selectedProductType && (
                            <div className="flex gap-2 items-end">
                              <div>
                                <Label>Unit</Label>
                                <Select value={selectedUnit} onValueChange={setSelectedUnit}>
                                  <SelectTrigger className="w-[120px]">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="cm">cm</SelectItem>
                                    <SelectItem value="mm">mm</SelectItem>
                                    <SelectItem value="inch">inch</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          )}
                        </div>

                        {selectedProductType && (
                          <Badge variant="outline" className="text-sm">
                            <Shirt className="mr-2 h-4 w-4" />
                            {currentProductType?.type_name} - {currentFields.length} measurements
                          </Badge>
                        )}
                      </div>

                      {/* Size Charts Table */}
                      {selectedProductType ? (
                        isLoading ? (
                          <div className="flex justify-center items-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                          </div>
                        ) : filteredSizes.length === 0 ? (
                          <div className="text-center py-12 text-muted-foreground">
                            No size charts found for {currentProductType?.type_name} - {gender}
                            <br />
                            <Button
                              variant="link"
                              onClick={() => {
                                resetForm();
                                setDialogOpen(true);
                              }}
                              className="mt-2"
                            >
                              Create your first size chart
                            </Button>
                          </div>
                        ) : (
                          <div className="rounded-md border">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Size ID</TableHead>
                                  <TableHead>Size Name</TableHead>
                                  <TableHead>Gender</TableHead>
                                  {currentFields.slice(0, 4).map((field: any) => (
                                    <TableHead key={field.key}>
                                      {field.label} ({selectedUnit})
                                    </TableHead>
                                  ))}
                                  <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {filteredSizes.map((size: any) => (
                                  <TableRow key={size.id}>
                                    <TableCell className="font-mono">{size.auto_generated_id || `SC-${size.profile_id}-${size.product_type_id}-${size.size_name}`}</TableCell>
                                    <TableCell><Badge>{size.size_name}</Badge></TableCell>
                                    <TableCell>
                                      <Badge variant="outline">{size.gender || "Unisex"}</Badge>
                                    </TableCell>
                                    {currentFields.slice(0, 4).map((field: any) => {
                                      // Get measurement value from measurements object
                                      const measurementValue = size.measurements && typeof size.measurements === 'object' 
                                        ? size.measurements[field.key] 
                                        : null;
                                      return (
                                        <TableCell key={field.key}>
                                          {measurementValue !== null && measurementValue !== undefined 
                                            ? `${measurementValue} ${selectedUnit}` 
                                            : "-"}
                                        </TableCell>
                                      );
                                    })}
                                    <TableCell className="text-right">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleEdit(size)}
                                        title="Edit"
                                      >
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDelete(size.id)}
                                        title="Delete"
                                      >
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        )
                      ) : (
                        <div className="text-center py-12 text-muted-foreground">
                          <Shirt className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>Select a product type to view or create size charts</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
