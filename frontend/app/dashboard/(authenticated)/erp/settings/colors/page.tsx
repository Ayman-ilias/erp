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
import ColorMasterTabs from "./color-master-tabs";
import { PlusCircle, Edit, Trash2, Shield, Search, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { useQueryClient } from "@tanstack/react-query";
import { settingsService } from "@/services/api";
import {
  useColorFamilies,
  useColors,
  useColorValues,
  useColorMasters,
  useCreateColorFamily,
  useUpdateColorFamily,
  useDeleteColorFamily,
  useCreateColor,
  useUpdateColor,
  useDeleteColor,
  useCreateColorValue,
  useUpdateColorValue,
  useDeleteColorValue,
  useCreateColorMaster,
  useUpdateColorMaster,
  useDeleteColorMaster,
} from "@/hooks/use-queries";

export default function ColorsPage() {
  const { user, token } = useAuth();
  const queryClient = useQueryClient();
  
  // ============================================================================
  // TANSTACK QUERY: Data fetching with caching, auto-refetch, loading states
  // ============================================================================
  // Reference data (always loaded - cached for 10 minutes)
  const { data: familiesData, isLoading: familiesLoading } = useColorFamilies(token);
  const { data: colorsData, isLoading: colorsLoading } = useColors(token);
  const { data: valuesData, isLoading: valuesLoading } = useColorValues(token);
  
  const colorFamilies = Array.isArray(familiesData) ? familiesData : [];
  const colors = Array.isArray(colorsData) ? colorsData : [];
  const colorValues = Array.isArray(valuesData) ? valuesData : [];
  const loading = familiesLoading || colorsLoading || valuesLoading;
  
  // Pagination and filters for Color Master tab
  const [masterSearch, setMasterSearch] = useState("");
  const [masterCodeType, setMasterCodeType] = useState<string>("H&M"); // Default to H&M to match default tab
  const [activeCodeTab, setActiveCodeTab] = useState<string>("hnm"); // Track which code type tab is active
  const [masterRowLimit, setMasterRowLimit] = useState<number | "all">(50);
  const [masterPage, setMasterPage] = useState(0);
  
  // Track which tab is active
  const [activeTab, setActiveTab] = useState<string>("families");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  
  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(masterSearch);
    }, 400);
    return () => clearTimeout(timer);
  }, [masterSearch]);
  
  // Calculate effective limit and code type for Color Masters query
  const effectiveLimit = masterRowLimit === "all" ? undefined : masterRowLimit;
  const effectiveCodeType = masterCodeType || undefined; // Always use the selected code type
  const skip = masterPage * (typeof effectiveLimit === "number" ? effectiveLimit : 0);
  
  // Color Masters query - only enabled when tab is active
  const { data: mastersData, isLoading: masterLoading } = useColorMasters(
    token,
    effectiveCodeType,
    effectiveLimit,
    skip,
    activeTab === "master"
  );
  
  // Apply client-side search filtering to masters data
  const rawColorMasters = Array.isArray(mastersData) ? mastersData : [];
  const colorMasters = useMemo(() => {
    if (!debouncedSearch) return rawColorMasters;
    const searchLower = debouncedSearch.toLowerCase();
    return rawColorMasters.filter(
      (m: any) =>
        m.color_name?.toLowerCase().includes(searchLower) ||
        m.color_code?.toLowerCase().includes(searchLower) ||
        getFamilyName(m.color_family_id)?.toLowerCase().includes(searchLower) ||
        getColorName(m.color_id)?.toLowerCase().includes(searchLower) ||
        getValueName(m.color_value_id)?.toLowerCase().includes(searchLower)
    );
  }, [rawColorMasters, debouncedSearch, colorFamilies, colors, colorValues]);

  // Dialog states
  const [isFamilyDialogOpen, setIsFamilyDialogOpen] = useState(false);
  const [isColorDialogOpen, setIsColorDialogOpen] = useState(false);
  const [isValueDialogOpen, setIsValueDialogOpen] = useState(false);
  const [isMasterDialogOpen, setIsMasterDialogOpen] = useState(false);

  // Editing states
  const [editingFamily, setEditingFamily] = useState<any>(null);
  const [editingColor, setEditingColor] = useState<any>(null);
  const [editingValue, setEditingValue] = useState<any>(null);
  const [editingMaster, setEditingMaster] = useState<any>(null);

  // Form data
  const [familyFormData, setFamilyFormData] = useState({
    color_family: "",
    color_family_code: "",
    color_family_code_type: "",
    sort_order: 0,
    is_active: true,
  });

  const [colorFormData, setColorFormData] = useState({
    color: "",
    color_family_id: "",
    color_code: "",
    color_code_type: "",
    is_active: true,
  });

  const [valueFormData, setValueFormData] = useState({
    color_value_code: "",
    color_value_code_type: "",
    sort_order: 0,
    is_active: true,
  });

  const [masterFormData, setMasterFormData] = useState({
    color_id: "",
    color_family_id: "",
    color_value_id: "",
    color_name: "",
    color_code_type: "",
    color_code: "",
    hex_value: "",
    is_active: true,
  });

  // Helper functions (defined before useMemo that uses them)
  const getFamilyName = (id: number) => colorFamilies.find((f) => f.id === id)?.color_family || "-";
  const getColorName = (id: number) => colors.find((c) => c.id === id)?.color || "-";
  const getValueName = (id: number) => colorValues.find((v) => v.id === id)?.color_value_code || "-";
  
  // TanStack Query Mutations (defined after queries, before handlers)
  const createFamilyMutation = useCreateColorFamily();
  const updateFamilyMutation = useUpdateColorFamily();
  const deleteFamilyMutation = useDeleteColorFamily();
  const createColorMutation = useCreateColor();
  const updateColorMutation = useUpdateColor();
  const deleteColorMutation = useDeleteColor();
  const createValueMutation = useCreateColorValue();
  const updateValueMutation = useUpdateColorValue();
  const deleteValueMutation = useDeleteColorValue();
  const createMasterMutation = useCreateColorMaster();
  const updateMasterMutation = useUpdateColorMaster();
  const deleteMasterMutation = useDeleteColorMaster();

  // Color Family handlers
  const handleFamilySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    
    if (editingFamily) {
      updateFamilyMutation.mutate(
        { id: editingFamily.id, data: familyFormData, token },
        {
          onSuccess: () => {
            toast.success("Color family updated");
            setIsFamilyDialogOpen(false);
            resetFamilyForm();
          },
          onError: (error: any) => {
            toast.error(error?.message || "Failed to update color family");
          },
        }
      );
    } else {
      createFamilyMutation.mutate(
        { data: familyFormData, token },
        {
          onSuccess: () => {
            toast.success("Color family created");
            setIsFamilyDialogOpen(false);
            resetFamilyForm();
          },
          onError: (error: any) => {
            toast.error(error?.message || "Failed to create color family");
          },
        }
      );
    }
  };

  const handleEditFamily = (item: any) => {
    setEditingFamily(item);
    setFamilyFormData({
      color_family: item.color_family || "",
      color_family_code: item.color_family_code || "",
      color_family_code_type: item.color_family_code_type || "",
      sort_order: item.sort_order || 0,
      is_active: item.is_active !== false,
    });
    setIsFamilyDialogOpen(true);
  };

  const handleDeleteFamily = async (id: number) => {
    if (confirm("Delete this color family?") && token) {
      deleteFamilyMutation.mutate(
        { id, token },
        {
          onSuccess: () => {
            toast.success("Color family deleted");
          },
          onError: () => {
            toast.error("Failed to delete color family");
          },
        }
      );
    }
  };

  const resetFamilyForm = () => {
    setEditingFamily(null);
    setFamilyFormData({ color_family: "", color_family_code: "", color_family_code_type: "", sort_order: 0, is_active: true });
  };

  // Color handlers
  const handleColorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    
    const data = { ...colorFormData, color_family_id: parseInt(colorFormData.color_family_id) };
    
    if (editingColor) {
      updateColorMutation.mutate(
        { id: editingColor.id, data, token },
        {
          onSuccess: () => {
            toast.success("Color updated");
            setIsColorDialogOpen(false);
            resetColorForm();
          },
          onError: (error: any) => {
            toast.error(error?.message || "Failed to update color");
          },
        }
      );
    } else {
      createColorMutation.mutate(
        { data, token },
        {
          onSuccess: () => {
            toast.success("Color created");
            setIsColorDialogOpen(false);
            resetColorForm();
          },
          onError: (error: any) => {
            toast.error(error?.message || "Failed to create color");
          },
        }
      );
    }
  };

  const handleEditColor = (item: any) => {
    setEditingColor(item);
    setColorFormData({
      color: item.color || "",
      color_family_id: item.color_family_id?.toString() || "",
      color_code: item.color_code || "",
      color_code_type: item.color_code_type || "",
      is_active: item.is_active !== false,
    });
    setIsColorDialogOpen(true);
  };

  const handleDeleteColor = async (id: number) => {
    if (confirm("Delete this color?") && token) {
      deleteColorMutation.mutate(
        { id, token },
        {
          onSuccess: () => {
            toast.success("Color deleted");
          },
          onError: () => {
            toast.error("Failed to delete color");
          },
        }
      );
    }
  };

  const resetColorForm = () => {
    setEditingColor(null);
    setColorFormData({ color: "", color_family_id: "", color_code: "", color_code_type: "", is_active: true });
  };

  // Color Value handlers
  const handleValueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    
    if (editingValue) {
      updateValueMutation.mutate(
        { id: editingValue.id, data: valueFormData, token },
        {
          onSuccess: () => {
            toast.success("Color value updated");
            setIsValueDialogOpen(false);
            resetValueForm();
          },
          onError: (error: any) => {
            toast.error(error?.message || "Failed to update color value");
          },
        }
      );
    } else {
      createValueMutation.mutate(
        { data: valueFormData, token },
        {
          onSuccess: () => {
            toast.success("Color value created");
            setIsValueDialogOpen(false);
            resetValueForm();
          },
          onError: (error: any) => {
            toast.error(error?.message || "Failed to create color value");
          },
        }
      );
    }
  };

  const handleEditValue = (item: any) => {
    setEditingValue(item);
    setValueFormData({
      color_value_code: item.color_value_code || "",
      color_value_code_type: item.color_value_code_type || "",
      sort_order: item.sort_order || 0,
      is_active: item.is_active !== false,
    });
    setIsValueDialogOpen(true);
  };

  const handleDeleteValue = async (id: number) => {
    if (confirm("Delete this color value?") && token) {
      deleteValueMutation.mutate(
        { id, token },
        {
          onSuccess: () => {
            toast.success("Color value deleted");
          },
          onError: () => {
            toast.error("Failed to delete color value");
          },
        }
      );
    }
  };

  const resetValueForm = () => {
    setEditingValue(null);
    setValueFormData({ color_value_code: "", color_value_code_type: "", sort_order: 0, is_active: true });
  };

  // Color Master handlers
  const handleMasterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    
    const data = {
      ...masterFormData,
      color_id: masterFormData.color_id ? parseInt(masterFormData.color_id) : null,
      color_family_id: masterFormData.color_family_id ? parseInt(masterFormData.color_family_id) : null,
      color_value_id: masterFormData.color_value_id ? parseInt(masterFormData.color_value_id) : null,
    };
    
    if (editingMaster) {
      updateMasterMutation.mutate(
        { id: editingMaster.id, data, token },
        {
          onSuccess: () => {
            toast.success("Color master updated");
            setIsMasterDialogOpen(false);
            resetMasterForm();
          },
          onError: (error: any) => {
            toast.error(error?.message || "Failed to update color master");
          },
        }
      );
    } else {
      createMasterMutation.mutate(
        { data, token },
        {
          onSuccess: () => {
            toast.success("Color master created");
            setIsMasterDialogOpen(false);
            resetMasterForm();
          },
          onError: (error: any) => {
            toast.error(error?.message || "Failed to create color master");
          },
        }
      );
    }
  };

  const handleEditMaster = (item: any) => {
    setEditingMaster(item);
    setMasterFormData({
      color_id: item.color_id?.toString() || "",
      color_family_id: item.color_family_id?.toString() || "",
      color_value_id: item.color_value_id?.toString() || "",
      color_name: item.color_name || "",
      color_code_type: item.color_code_type || "",
      color_code: item.color_code || "",
      hex_value: item.hex_value || "",
      is_active: item.is_active !== false,
    });
    setIsMasterDialogOpen(true);
  };

  const handleDeleteMaster = async (id: number) => {
    if (confirm("Delete this color master entry?") && token) {
      deleteMasterMutation.mutate(
        { id, token },
        {
          onSuccess: () => {
            toast.success("Color master deleted");
          },
          onError: () => {
            toast.error("Failed to delete color master");
          },
        }
      );
    }
  };

  const resetMasterForm = () => {
    setEditingMaster(null);
    setMasterFormData({ color_id: "", color_family_id: "", color_value_id: "", color_name: "", color_code_type: "", color_code: "", hex_value: "", is_active: true });
  };

  // Helper functions already defined above

  // Filter Color Master data (already filtered server-side, only apply search if needed)
  const filteredColorMasters = useMemo(() => {
    // Data is already filtered by code type from server
    // If search is active, it's already filtered in loadColorMasters
    // So we just return the masters as-is (they're already filtered)
    return colorMasters;
  }, [colorMasters]);

  const displayedColorMasters = useMemo(() => {
    // Server-side pagination already limits the data
    // But if row limit is smaller than what we loaded, slice it
    if (masterRowLimit === "all") return filteredColorMasters;
    return filteredColorMasters.slice(0, masterRowLimit);
  }, [filteredColorMasters, masterRowLimit]);

  const clearMasterFilters = () => {
    setMasterSearch("");
    setMasterCodeType("H&M"); // Reset to default
    setActiveCodeTab("hnm"); // Reset tab to default
    setMasterRowLimit(50);
    setMasterPage(0);
    // TanStack Query will automatically refetch when query params change
  };

  if (!user?.is_superuser) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="p-8 text-center">
          <Shield className="h-16 w-16 mx-auto mb-4 text-destructive" />
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">You need administrator privileges.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Colour Master</h1>
        <p className="text-muted-foreground">Manage color families, colors, values, and master colors</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="families">Color Families</TabsTrigger>
          <TabsTrigger value="colors">Colors</TabsTrigger>
          <TabsTrigger value="values">Color Values</TabsTrigger>
          <TabsTrigger value="master">Color Master</TabsTrigger>
        </TabsList>

        {/* Color Families Tab */}
        <TabsContent value="families" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={isFamilyDialogOpen} onOpenChange={(open) => { setIsFamilyDialogOpen(open); if (!open) resetFamilyForm(); }}>
              <DialogTrigger asChild>
                <Button><PlusCircle className="mr-2 h-4 w-4" />Add Family</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingFamily ? "Edit" : "Add"} Color Family</DialogTitle>
                  <DialogDescription>Color families group related colors (e.g., BLACK, WHITE, BLUE)</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleFamilySubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Family Name *</Label>
                        <Input value={familyFormData.color_family} onChange={(e) => setFamilyFormData({ ...familyFormData, color_family: e.target.value })} placeholder="BLACK" required />
                      </div>
                      <div className="space-y-2">
                        <Label>Family Code</Label>
                        <Input value={familyFormData.color_family_code} onChange={(e) => setFamilyFormData({ ...familyFormData, color_family_code: e.target.value })} placeholder="BLK" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Code Type</Label>
                        <Input value={familyFormData.color_family_code_type} onChange={(e) => setFamilyFormData({ ...familyFormData, color_family_code_type: e.target.value })} placeholder="STANDARD" />
                      </div>
                      <div className="space-y-2">
                        <Label>Sort Order</Label>
                        <Input type="number" value={familyFormData.sort_order} onChange={(e) => setFamilyFormData({ ...familyFormData, sort_order: parseInt(e.target.value) || 0 })} />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="family_active" checked={familyFormData.is_active} onCheckedChange={(c) => setFamilyFormData({ ...familyFormData, is_active: !!c })} />
                      <Label htmlFor="family_active">Active</Label>
                    </div>
                  </div>
                  <DialogFooter><Button type="submit">{editingFamily ? "Update" : "Create"}</Button></DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Family</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Code Type</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {colorFamilies.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">{loading ? "Loading..." : "No color families"}</TableCell></TableRow>
                ) : (
                  colorFamilies.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.color_family}</TableCell>
                      <TableCell>{item.color_family_code || "-"}</TableCell>
                      <TableCell>{item.color_family_code_type || "-"}</TableCell>
                      <TableCell>{item.sort_order}</TableCell>
                      <TableCell><Badge variant={item.is_active ? "default" : "secondary"}>{item.is_active ? "Active" : "Inactive"}</Badge></TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleEditFamily(item)}><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteFamily(item.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Colors Tab */}
        <TabsContent value="colors" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={isColorDialogOpen} onOpenChange={(open) => { setIsColorDialogOpen(open); if (!open) resetColorForm(); }}>
              <DialogTrigger asChild>
                <Button><PlusCircle className="mr-2 h-4 w-4" />Add Color</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingColor ? "Edit" : "Add"} Color</DialogTitle>
                  <DialogDescription>Individual colors within families (e.g., NAVY BLUE, BEIGE)</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleColorSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label>Color Name *</Label>
                      <Input value={colorFormData.color} onChange={(e) => setColorFormData({ ...colorFormData, color: e.target.value })} placeholder="NAVY BLUE" required />
                    </div>
                    <div className="space-y-2">
                      <Label>Color Family *</Label>
                      <Select value={colorFormData.color_family_id} onValueChange={(v) => setColorFormData({ ...colorFormData, color_family_id: v })}>
                        <SelectTrigger><SelectValue placeholder="Select family" /></SelectTrigger>
                        <SelectContent>
                          {colorFamilies.map((f) => (<SelectItem key={f.id} value={f.id.toString()}>{f.color_family}</SelectItem>))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Color Code</Label>
                        <Input value={colorFormData.color_code} onChange={(e) => setColorFormData({ ...colorFormData, color_code: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>Code Type</Label>
                        <Input value={colorFormData.color_code_type} onChange={(e) => setColorFormData({ ...colorFormData, color_code_type: e.target.value })} />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="color_active" checked={colorFormData.is_active} onCheckedChange={(c) => setColorFormData({ ...colorFormData, is_active: !!c })} />
                      <Label htmlFor="color_active">Active</Label>
                    </div>
                  </div>
                  <DialogFooter><Button type="submit">{editingColor ? "Update" : "Create"}</Button></DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Color</TableHead>
                  <TableHead>Family</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {colors.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">{loading ? "Loading..." : "No colors"}</TableCell></TableRow>
                ) : (
                  colors.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.color}</TableCell>
                      <TableCell>{getFamilyName(item.color_family_id)}</TableCell>
                      <TableCell>{item.color_code || "-"}</TableCell>
                      <TableCell><Badge variant={item.is_active ? "default" : "secondary"}>{item.is_active ? "Active" : "Inactive"}</Badge></TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleEditColor(item)}><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteColor(item.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Color Values Tab */}
        <TabsContent value="values" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={isValueDialogOpen} onOpenChange={(open) => { setIsValueDialogOpen(open); if (!open) resetValueForm(); }}>
              <DialogTrigger asChild>
                <Button><PlusCircle className="mr-2 h-4 w-4" />Add Value</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingValue ? "Edit" : "Add"} Color Value</DialogTitle>
                  <DialogDescription>Color intensity/shade values (e.g., LIGHT, DARK, BRIGHT)</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleValueSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Value Code *</Label>
                        <Input value={valueFormData.color_value_code} onChange={(e) => setValueFormData({ ...valueFormData, color_value_code: e.target.value })} placeholder="LIGHT" required />
                      </div>
                      <div className="space-y-2">
                        <Label>Code Type</Label>
                        <Input value={valueFormData.color_value_code_type} onChange={(e) => setValueFormData({ ...valueFormData, color_value_code_type: e.target.value })} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Sort Order</Label>
                      <Input type="number" value={valueFormData.sort_order} onChange={(e) => setValueFormData({ ...valueFormData, sort_order: parseInt(e.target.value) || 0 })} />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="value_active" checked={valueFormData.is_active} onCheckedChange={(c) => setValueFormData({ ...valueFormData, is_active: !!c })} />
                      <Label htmlFor="value_active">Active</Label>
                    </div>
                  </div>
                  <DialogFooter><Button type="submit">{editingValue ? "Update" : "Create"}</Button></DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Value Code</TableHead>
                  <TableHead>Code Type</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {colorValues.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">{loading ? "Loading..." : "No color values"}</TableCell></TableRow>
                ) : (
                  colorValues.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.color_value_code}</TableCell>
                      <TableCell>{item.color_value_code_type || "-"}</TableCell>
                      <TableCell>{item.sort_order}</TableCell>
                      <TableCell><Badge variant={item.is_active ? "default" : "secondary"}>{item.is_active ? "Active" : "Inactive"}</Badge></TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleEditValue(item)}><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteValue(item.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Color Master Tab */}
        <TabsContent value="master" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Color Master</h3>
              <p className="text-sm text-muted-foreground">Manage colors organized by color code type</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={async () => {
                  if (!token) return;
                  if (!confirm("This will add all Pantone TCX color codes to the Color Master. Continue?")) return;
                  
                  try {
                    const response = await settingsService.colorMaster.seedTcx(token);
                    toast.success(`Successfully seeded TCX colors! Inserted: ${response.inserted}, Updated: ${response.updated}, Total: ${response.total_tcx_colors}`);
                    // Refetch color masters - invalidate all color master queries
                    queryClient.invalidateQueries({ 
                      predicate: (query) => {
                        const key = query.queryKey[0] as string;
                        return key.startsWith("settings-color-master");
                      }
                    });
                  } catch (error: any) {
                    toast.error(error?.message || "Failed to seed TCX colors");
                  }
                }}
              >
                <PlusCircle className="mr-2 h-4 w-4" />Seed TCX Colors
              </Button>
              <Dialog open={isMasterDialogOpen} onOpenChange={(open) => { setIsMasterDialogOpen(open); if (!open) resetMasterForm(); }}>
                <DialogTrigger asChild>
                  <Button><PlusCircle className="mr-2 h-4 w-4" />Add Master Color</Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>{editingMaster ? "Edit" : "Add"} Color Master</DialogTitle>
                    <DialogDescription>Complete color definitions combining family, color, and value</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleMasterSubmit}>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label>Color Name *</Label>
                        <Input value={masterFormData.color_name} onChange={(e) => setMasterFormData({ ...masterFormData, color_name: e.target.value })} placeholder="Light Navy Blue" required />
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Family</Label>
                          <Select value={masterFormData.color_family_id} onValueChange={(v) => setMasterFormData({ ...masterFormData, color_family_id: v })}>
                            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                            <SelectContent>
                              {colorFamilies.map((f) => (<SelectItem key={f.id} value={f.id.toString()}>{f.color_family}</SelectItem>))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Color</Label>
                          <Select value={masterFormData.color_id} onValueChange={(v) => setMasterFormData({ ...masterFormData, color_id: v })}>
                            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                            <SelectContent>
                              {colors.map((c) => (<SelectItem key={c.id} value={c.id.toString()}>{c.color}</SelectItem>))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Value</Label>
                          <Select value={masterFormData.color_value_id} onValueChange={(v) => setMasterFormData({ ...masterFormData, color_value_id: v })}>
                            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                            <SelectContent>
                              {colorValues.map((v) => (<SelectItem key={v.id} value={v.id.toString()}>{v.color_value_code}</SelectItem>))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Color Code Type *</Label>
                          <Select value={masterFormData.color_code_type} onValueChange={(v) => setMasterFormData({ ...masterFormData, color_code_type: v })} required>
                            <SelectTrigger><SelectValue placeholder="Select code type" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="H&M">H&M Color Code</SelectItem>
                              <SelectItem value="TCX">TCX Color Code</SelectItem>
                              <SelectItem value="General">General Color Code</SelectItem>
                              <SelectItem value="HEX">HEX Color Code</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Color Code</Label>
                          <Input value={masterFormData.color_code} onChange={(e) => setMasterFormData({ ...masterFormData, color_code: e.target.value })} placeholder="e.g., 32-207" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Hex Value</Label>
                        <div className="flex gap-2">
                          <Input value={masterFormData.hex_value} onChange={(e) => setMasterFormData({ ...masterFormData, hex_value: e.target.value })} placeholder="#000080" />
                          {masterFormData.hex_value && (
                            <div className="w-10 h-10 rounded border" style={{ backgroundColor: masterFormData.hex_value }} />
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="master_active" checked={masterFormData.is_active} onCheckedChange={(c) => setMasterFormData({ ...masterFormData, is_active: !!c })} />
                        <Label htmlFor="master_active">Active</Label>
                      </div>
                    </div>
                    <DialogFooter><Button type="submit">{editingMaster ? "Update" : "Create"}</Button></DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Color Code Type Segments */}
          <ColorMasterTabs
            colorMasters={colorMasters}
            masterLoading={masterLoading}
            masterSearch={masterSearch}
            setMasterSearch={setMasterSearch}
            masterRowLimit={masterRowLimit}
            setMasterRowLimit={setMasterRowLimit}
            activeCodeTab={activeCodeTab}
            setActiveCodeTab={setActiveCodeTab}
            setMasterCodeType={setMasterCodeType}
            setMasterPage={setMasterPage}
            clearMasterFilters={clearMasterFilters}
            getFamilyName={getFamilyName}
            getColorName={getColorName}
            getValueName={getValueName}
            handleEditMaster={handleEditMaster}
            handleDeleteMaster={handleDeleteMaster}
            token={token}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
