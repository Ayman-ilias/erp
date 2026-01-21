"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, ArrowLeft, Loader2, Edit, Trash2, Check, ChevronsUpDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { api } from "@/services/api";
import { toast } from "sonner";
import { UnitSelector } from "@/components/uom/UnitSelector";
import { InlineConverter } from "@/components/uom/InlineConverter";
import { UnitDisplay } from "@/components/uom/UnitDisplay";
import { SearchableDropdown } from "@/components/ui/searchable-dropdown";
import { cn } from "@/lib/utils";

// Helper function to generate product ID: PRODUCTNAME_CAT_0001
// Serial number is global and always incrementing (not dependent on name/category)
const generateProductId = (productName: string, category: string, existingItems: any[] = []): string => {
  if (!productName) return "";
  
  // Format product name: uppercase, replace non-alphanumeric with underscore
  const namePart = productName
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
  
  // Get first 3 letters of category (or "XXX" if no category)
  const categoryPart = category && category.length >= 3
    ? category.toUpperCase().substring(0, 3)
    : "XXX";
  
  // Find the highest serial number across ALL items (global increment)
  let maxSerial = 0;
  const allItems = existingItems || [];
  
  allItems.forEach((item: any) => {
    if (item && item.product_id) {
      // Match pattern: anything ending with _#### (4 digits)
      const match = item.product_id.toUpperCase().match(/_(\d{4})$/);
      if (match) {
        const serial = parseInt(match[1], 10);
        if (!isNaN(serial) && serial > maxSerial) {
          maxSerial = serial;
        }
      }
    }
  });
  
  // Next serial is max + 1 (global increment)
  const nextSerial = maxSerial + 1;
  
  // Format serial as 4 digits
  const serialPart = String(nextSerial).padStart(4, "0");
  
  return `${namePart}_${categoryPart}_${serialPart}`;
};

export default function MaterialDetailsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("yarn");
  
  // Dialog states
  const [yarnDialogOpen, setYarnDialogOpen] = useState(false);
  const [fabricDialogOpen, setFabricDialogOpen] = useState(false);
  const [trimsDialogOpen, setTrimsDialogOpen] = useState(false);
  const [accessoriesDialogOpen, setAccessoriesDialogOpen] = useState(false);
  const [finishedGoodDialogOpen, setFinishedGoodDialogOpen] = useState(false);
  const [packingGoodDialogOpen, setPackingGoodDialogOpen] = useState(false);
  
  // Editing states
  const [editingYarn, setEditingYarn] = useState<any>(null);
  const [editingFabric, setEditingFabric] = useState<any>(null);
  const [editingTrims, setEditingTrims] = useState<any>(null);
  const [editingAccessories, setEditingAccessories] = useState<any>(null);
  const [editingFinishedGood, setEditingFinishedGood] = useState<any>(null);
  const [editingPackingGood, setEditingPackingGood] = useState<any>(null);

  // Fetch Yarn Data
  const { data: yarnData, isLoading: yarnLoading } = useQuery({
    queryKey: ["merchandiser", "yarn"],
    queryFn: () => api.merchandiser.yarn.getAll(),
  });

  // Fetch Fabric Data
  const { data: fabricData, isLoading: fabricLoading } = useQuery({
    queryKey: ["merchandiser", "fabric"],
    queryFn: () => api.merchandiser.fabric.getAll(),
  });

  // Fetch Trims Data
  const { data: trimsData, isLoading: trimsLoading } = useQuery({
    queryKey: ["merchandiser", "trims"],
    queryFn: () => api.merchandiser.trims.getAll(),
  });

  // Fetch Accessories Data
  const { data: accessoriesData, isLoading: accessoriesLoading } = useQuery({
    queryKey: ["merchandiser", "accessories"],
    queryFn: () => api.merchandiser.accessories.getAll(),
  });

  // Fetch Finished Good Data
  const { data: finishedGoodData, isLoading: finishedGoodLoading } = useQuery({
    queryKey: ["merchandiser", "finishedGood"],
    queryFn: () => api.merchandiser.finishedGood.getAll(),
  });

  // Fetch Packing Good Data
  const { data: packingGoodData, isLoading: packingGoodLoading } = useQuery({
    queryKey: ["merchandiser", "packingGood"],
    queryFn: () => api.merchandiser.packingGood.getAll(),
  });

  // ========== YARN MUTATIONS ==========
  const createYarnMutation = useMutation({
    mutationFn: (data: any) => api.merchandiser.yarn.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchandiser", "yarn"] });
      toast.success("Yarn created successfully");
      setYarnDialogOpen(false);
    },
    onError: () => toast.error("Failed to create yarn"),
  });

  const updateYarnMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      api.merchandiser.yarn.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchandiser", "yarn"] });
      toast.success("Yarn updated successfully");
      setYarnDialogOpen(false);
      setEditingYarn(null);
    },
    onError: () => toast.error("Failed to update yarn"),
  });

  const deleteYarnMutation = useMutation({
    mutationFn: (id: string) => api.merchandiser.yarn.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchandiser", "yarn"] });
      toast.success("Yarn deleted successfully");
    },
    onError: () => toast.error("Failed to delete yarn"),
  });

  // ========== FABRIC MUTATIONS ==========
  const createFabricMutation = useMutation({
    mutationFn: (data: any) => api.merchandiser.fabric.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchandiser", "fabric"] });
      toast.success("Fabric created successfully");
      setFabricDialogOpen(false);
    },
    onError: () => toast.error("Failed to create fabric"),
  });

  const updateFabricMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      api.merchandiser.fabric.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchandiser", "fabric"] });
      toast.success("Fabric updated successfully");
      setFabricDialogOpen(false);
      setEditingFabric(null);
    },
    onError: () => toast.error("Failed to update fabric"),
  });

  const deleteFabricMutation = useMutation({
    mutationFn: (id: string) => api.merchandiser.fabric.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchandiser", "fabric"] });
      toast.success("Fabric deleted successfully");
    },
    onError: () => toast.error("Failed to delete fabric"),
  });

  // ========== TRIMS MUTATIONS ==========
  const createTrimsMutation = useMutation({
    mutationFn: (data: any) => api.merchandiser.trims.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchandiser", "trims"] });
      toast.success("Trims created successfully");
      setTrimsDialogOpen(false);
    },
    onError: () => toast.error("Failed to create trims"),
  });

  const updateTrimsMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      api.merchandiser.trims.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchandiser", "trims"] });
      toast.success("Trims updated successfully");
      setTrimsDialogOpen(false);
      setEditingTrims(null);
    },
    onError: () => toast.error("Failed to update trims"),
  });

  const deleteTrimsMutation = useMutation({
    mutationFn: (id: string) => api.merchandiser.trims.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchandiser", "trims"] });
      toast.success("Trims deleted successfully");
    },
    onError: () => toast.error("Failed to delete trims"),
  });

  // ========== ACCESSORIES MUTATIONS ==========
  const createAccessoriesMutation = useMutation({
    mutationFn: (data: any) => api.merchandiser.accessories.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchandiser", "accessories"] });
      toast.success("Accessories created successfully");
      setAccessoriesDialogOpen(false);
    },
    onError: () => toast.error("Failed to create accessories"),
  });

  const updateAccessoriesMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      api.merchandiser.accessories.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchandiser", "accessories"] });
      toast.success("Accessories updated successfully");
      setAccessoriesDialogOpen(false);
      setEditingAccessories(null);
    },
    onError: () => toast.error("Failed to update accessories"),
  });

  const deleteAccessoriesMutation = useMutation({
    mutationFn: (id: string) => api.merchandiser.accessories.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchandiser", "accessories"] });
      toast.success("Accessories deleted successfully");
    },
    onError: () => toast.error("Failed to delete accessories"),
  });

  // ========== FINISHED GOOD MUTATIONS ==========
  const createFinishedGoodMutation = useMutation({
    mutationFn: (data: any) => api.merchandiser.finishedGood.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchandiser", "finishedGood"] });
      toast.success("Finished good created successfully");
      setFinishedGoodDialogOpen(false);
    },
    onError: () => toast.error("Failed to create finished good"),
  });

  const updateFinishedGoodMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      api.merchandiser.finishedGood.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchandiser", "finishedGood"] });
      toast.success("Finished good updated successfully");
      setFinishedGoodDialogOpen(false);
      setEditingFinishedGood(null);
    },
    onError: () => toast.error("Failed to update finished good"),
  });

  const deleteFinishedGoodMutation = useMutation({
    mutationFn: (id: string) => api.merchandiser.finishedGood.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchandiser", "finishedGood"] });
      toast.success("Finished good deleted successfully");
    },
    onError: () => toast.error("Failed to delete finished good"),
  });

  // ========== PACKING GOOD MUTATIONS ==========
  const createPackingGoodMutation = useMutation({
    mutationFn: (data: any) => api.merchandiser.packingGood.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchandiser", "packingGood"] });
      toast.success("Packing good created successfully");
      setPackingGoodDialogOpen(false);
    },
    onError: () => toast.error("Failed to create packing good"),
  });

  const updatePackingGoodMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      api.merchandiser.packingGood.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchandiser", "packingGood"] });
      toast.success("Packing good updated successfully");
      setPackingGoodDialogOpen(false);
      setEditingPackingGood(null);
    },
    onError: () => toast.error("Failed to update packing good"),
  });

  const deletePackingGoodMutation = useMutation({
    mutationFn: (id: string) => api.merchandiser.packingGood.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchandiser", "packingGood"] });
      toast.success("Packing good deleted successfully");
    },
    onError: () => toast.error("Failed to delete packing good"),
  });

  const handleDeleteYarn = (id: string) => {
    if (confirm("Are you sure you want to delete this yarn?")) {
      deleteYarnMutation.mutate(id);
    }
  };

  const handleDeleteFabric = (id: string) => {
    if (confirm("Are you sure you want to delete this fabric?")) {
      deleteFabricMutation.mutate(id);
    }
  };

  const handleDeleteTrims = (id: string) => {
    if (confirm("Are you sure you want to delete this trims?")) {
      deleteTrimsMutation.mutate(id);
    }
  };

  const handleDeleteAccessories = (id: string) => {
    if (confirm("Are you sure you want to delete this accessories?")) {
      deleteAccessoriesMutation.mutate(id);
    }
  };

  const handleDeleteFinishedGood = (id: string) => {
    if (confirm("Are you sure you want to delete this finished good?")) {
      deleteFinishedGoodMutation.mutate(id);
    }
  };

  const handleDeletePackingGood = (id: string) => {
    if (confirm("Are you sure you want to delete this packing good?")) {
      deletePackingGoodMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard/erp/merchandising")}
            className="mb-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Merchandising
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Material Details</h1>
          <p className="text-muted-foreground mt-2">
            Manage all types of materials used in production
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="yarn">
            Yarn
            {yarnData && (
              <Badge variant="secondary" className="ml-2">
                {yarnData.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="fabric">
            Fabric
            {fabricData && (
              <Badge variant="secondary" className="ml-2">
                {fabricData.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="trims">
            Trims
            {trimsData && (
              <Badge variant="secondary" className="ml-2">
                {trimsData.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="accessories">
            Accessories
            {accessoriesData && (
              <Badge variant="secondary" className="ml-2">
                {accessoriesData.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="finishedGood">
            Finished Good
            {finishedGoodData && (
              <Badge variant="secondary" className="ml-2">
                {finishedGoodData.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="packingGood">
            Packing Good
            {packingGoodData && (
              <Badge variant="secondary" className="ml-2">
                {packingGoodData.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* YARN TAB */}
        <TabsContent value="yarn">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Yarn Details</CardTitle>
                  <CardDescription>
                    View and manage yarn materials
                  </CardDescription>
                </div>
                <Button
                  onClick={() => {
                    setEditingYarn(null);
                    setYarnDialogOpen(true);
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Yarn
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {yarnLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : yarnData && yarnData.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Yarn ID</TableHead>
                      <TableHead>Yarn Name</TableHead>
                      <TableHead>Composition</TableHead>
                      <TableHead>Count</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Form</TableHead>
                      <TableHead>Finish</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {yarnData.map((yarn: any) => (
                      <TableRow key={yarn.id}>
                        <TableCell className="font-medium">{yarn.yarn_id}</TableCell>
                        <TableCell>{yarn.yarn_name}</TableCell>
                        <TableCell>{yarn.yarn_composition || "-"}</TableCell>
                        <TableCell>
                          {yarn.yarn_count} {yarn.count_system || ""}
                        </TableCell>
                        <TableCell>{yarn.yarn_type || "-"}</TableCell>
                        <TableCell>{yarn.yarn_form || "-"}</TableCell>
                        <TableCell>{yarn.yarn_finish || "-"}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingYarn(yarn);
                              setYarnDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteYarn(yarn.yarn_id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No yarn records found. Click "Add Yarn" to create one.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* FABRIC TAB */}
        <TabsContent value="fabric">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Fabric Details</CardTitle>
                  <CardDescription>
                    View and manage fabric materials
                  </CardDescription>
                </div>
                <Button
                  onClick={() => {
                    setEditingFabric(null);
                    setFabricDialogOpen(true);
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Fabric
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {fabricLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : fabricData && fabricData.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fabric ID</TableHead>
                      <TableHead>Fabric Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>GSM</TableHead>
                      <TableHead>Width</TableHead>
                      <TableHead>Composition</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fabricData.map((fabric: any) => (
                      <TableRow key={fabric.id}>
                        <TableCell className="font-medium">{fabric.fabric_id}</TableCell>
                        <TableCell>{fabric.fabric_name}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{fabric.category || "-"}</Badge>
                        </TableCell>
                        <TableCell>{fabric.type || "-"}</TableCell>
                        <TableCell>
                          {fabric.gsm && fabric.unit_id ? (
                            <span className="flex items-center gap-1">
                              {fabric.gsm}
                              <UnitDisplay 
                                unitId={fabric.unit_id} 
                                showFullName={false}
                                showUnitType={false}
                              />
                            </span>
                          ) : fabric.gsm ? (
                            `${fabric.gsm} GSM`
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell>{fabric.width || "-"}</TableCell>
                        <TableCell>{fabric.composition || "-"}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingFabric(fabric);
                              setFabricDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteFabric(fabric.fabric_id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No fabric records found. Click "Add Fabric" to create one.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TRIMS TAB */}
        <TabsContent value="trims">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Trims Details</CardTitle>
                  <CardDescription>
                    View and manage trims (buttons, zippers, etc.)
                  </CardDescription>
                </div>
                <Button
                  onClick={() => {
                    setEditingTrims(null);
                    setTrimsDialogOpen(true);
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Trims
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {trimsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : trimsData && trimsData.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product ID</TableHead>
                      <TableHead>Product Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Sub-Category</TableHead>
                      <TableHead>UoM</TableHead>
                      <TableHead>Consumable</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {trimsData.map((trims: any) => (
                      <TableRow key={trims.id}>
                        <TableCell className="font-medium">{trims.product_id}</TableCell>
                        <TableCell>{trims.product_name}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{trims.category || "-"}</Badge>
                        </TableCell>
                        <TableCell>{trims.sub_category || "-"}</TableCell>
                        <TableCell>
                          {trims.unit_id ? (
                            <UnitDisplay 
                              unitId={trims.unit_id} 
                              showFullName={false}
                              showUnitType={false}
                            />
                          ) : (
                            trims.uom || "-"
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            trims.consumable_flag === "yes" || trims.consumable_flag === true ? "default" :
                            trims.consumable_flag === "no" || trims.consumable_flag === false ? "secondary" : "outline"
                          }>
                            {trims.consumable_flag === "yes" || trims.consumable_flag === true ? "Yes" :
                             trims.consumable_flag === "no" || trims.consumable_flag === false ? "No" : "None"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingTrims(trims);
                              setTrimsDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteTrims(trims.product_id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No trims records found. Click "Add Trims" to create one.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ACCESSORIES TAB */}
        <TabsContent value="accessories">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Accessories Details</CardTitle>
                  <CardDescription>
                    View and manage accessories (labels, tags, etc.)
                  </CardDescription>
                </div>
                <Button
                  onClick={() => {
                    setEditingAccessories(null);
                    setAccessoriesDialogOpen(true);
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Accessories
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {accessoriesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : accessoriesData && accessoriesData.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product ID</TableHead>
                      <TableHead>Product Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Sub-Category</TableHead>
                      <TableHead>UoM</TableHead>
                      <TableHead>Consumable</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {accessoriesData.map((accessory: any) => (
                      <TableRow key={accessory.id}>
                        <TableCell className="font-medium">{accessory.product_id}</TableCell>
                        <TableCell>{accessory.product_name}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{accessory.category || "-"}</Badge>
                        </TableCell>
                        <TableCell>{accessory.sub_category || "-"}</TableCell>
                        <TableCell>
                          {accessory.unit_id ? (
                            <UnitDisplay 
                              unitId={accessory.unit_id} 
                              showFullName={false}
                              showUnitType={false}
                            />
                          ) : (
                            accessory.uom || "-"
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            accessory.consumable_flag === "yes" || accessory.consumable_flag === true ? "default" :
                            accessory.consumable_flag === "no" || accessory.consumable_flag === false ? "secondary" : "outline"
                          }>
                            {accessory.consumable_flag === "yes" || accessory.consumable_flag === true ? "Yes" :
                             accessory.consumable_flag === "no" || accessory.consumable_flag === false ? "No" : "None"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingAccessories(accessory);
                              setAccessoriesDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteAccessories(accessory.product_id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No accessories records found. Click "Add Accessories" to create one.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* FINISHED GOOD TAB */}
        <TabsContent value="finishedGood">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Finished Good Details</CardTitle>
                  <CardDescription>
                    View and manage finished garment products
                  </CardDescription>
                </div>
                <Button
                  onClick={() => {
                    setEditingFinishedGood(null);
                    setFinishedGoodDialogOpen(true);
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Finished Good
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {finishedGoodLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : finishedGoodData && finishedGoodData.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product ID</TableHead>
                      <TableHead>Product Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Sub-Category</TableHead>
                      <TableHead>UoM</TableHead>
                      <TableHead>Consumable</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {finishedGoodData.map((item: any) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.product_id}</TableCell>
                        <TableCell>{item.product_name}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{item.category || "-"}</Badge>
                        </TableCell>
                        <TableCell>{item.sub_category || "-"}</TableCell>
                        <TableCell>
                          {item.unit_id ? (
                            <UnitDisplay 
                              unitId={item.unit_id} 
                              showFullName={false}
                              showUnitType={false}
                            />
                          ) : (
                            item.uom || "-"
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            item.consumable_flag === "yes" || item.consumable_flag === true ? "default" :
                            item.consumable_flag === "no" || item.consumable_flag === false ? "secondary" : "outline"
                          }>
                            {item.consumable_flag === "yes" || item.consumable_flag === true ? "Yes" :
                             item.consumable_flag === "no" || item.consumable_flag === false ? "No" : "None"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingFinishedGood(item);
                              setFinishedGoodDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteFinishedGood(item.product_id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No finished good records found. Click "Add Finished Good" to create one.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* PACKING GOOD TAB */}
        <TabsContent value="packingGood">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Packing Good Details</CardTitle>
                  <CardDescription>
                    View and manage packing materials (cartons, poly bags, etc.)
                  </CardDescription>
                </div>
                <Button
                  onClick={() => {
                    setEditingPackingGood(null);
                    setPackingGoodDialogOpen(true);
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Packing Good
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {packingGoodLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : packingGoodData && packingGoodData.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product ID</TableHead>
                      <TableHead>Product Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Sub-Category</TableHead>
                      <TableHead>UoM</TableHead>
                      <TableHead>Consumable</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {packingGoodData.map((item: any) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.product_id}</TableCell>
                        <TableCell>{item.product_name}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{item.category || "-"}</Badge>
                        </TableCell>
                        <TableCell>{item.sub_category || "-"}</TableCell>
                        <TableCell>
                          {item.unit_id ? (
                            <UnitDisplay 
                              unitId={item.unit_id} 
                              showFullName={false}
                              showUnitType={false}
                            />
                          ) : (
                            item.uom || "-"
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            item.consumable_flag === "yes" || item.consumable_flag === true ? "default" :
                            item.consumable_flag === "no" || item.consumable_flag === false ? "secondary" : "outline"
                          }>
                            {item.consumable_flag === "yes" || item.consumable_flag === true ? "Yes" :
                             item.consumable_flag === "no" || item.consumable_flag === false ? "No" : "None"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingPackingGood(item);
                              setPackingGoodDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeletePackingGood(item.product_id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No packing good records found. Click "Add Packing Good" to create one.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* YARN DIALOG */}
      <YarnDialog
        open={yarnDialogOpen}
        onOpenChange={setYarnDialogOpen}
        editingYarn={editingYarn}
        onSubmit={(data) => {
          if (editingYarn) {
            updateYarnMutation.mutate({ id: editingYarn.yarn_id, data });
          } else {
            createYarnMutation.mutate(data);
          }
        }}
        isLoading={createYarnMutation.isPending || updateYarnMutation.isPending}
      />

      {/* FABRIC DIALOG */}
      <FabricDialog
        open={fabricDialogOpen}
        onOpenChange={setFabricDialogOpen}
        editingFabric={editingFabric}
        onSubmit={(data) => {
          if (editingFabric) {
            updateFabricMutation.mutate({ id: editingFabric.fabric_id, data });
          } else {
            createFabricMutation.mutate(data);
          }
        }}
        isLoading={createFabricMutation.isPending || updateFabricMutation.isPending}
      />

      {/* TRIMS DIALOG */}
      <TrimsDialog
        open={trimsDialogOpen}
        onOpenChange={setTrimsDialogOpen}
        editingTrims={editingTrims}
        existingItems={trimsData || []}
        onSubmit={(data) => {
          // Ensure consumable_flag defaults to "none" if not selected
          const consumableValue = data.consumable_flag || "none";
          const transformedData = {
            ...data,
            consumable_flag: consumableValue === "yes" ? true : false,
          };
          if (editingTrims) {
            updateTrimsMutation.mutate({ id: editingTrims.product_id, data: transformedData });
          } else {
            // Get latest data from query cache to ensure accurate serial number
            const cachedData = queryClient.getQueryData<any[]>(["merchandiser", "trims"]) || trimsData || [];
            const finalId = generateProductId(data.product_name, data.category || "", cachedData);
            createTrimsMutation.mutate({ ...transformedData, product_id: finalId });
          }
        }}
        isLoading={createTrimsMutation.isPending || updateTrimsMutation.isPending}
      />

      {/* ACCESSORIES DIALOG */}
      <AccessoriesDialog
        open={accessoriesDialogOpen}
        onOpenChange={setAccessoriesDialogOpen}
        editingAccessories={editingAccessories}
        existingItems={accessoriesData || []}
        onSubmit={(data) => {
          // Ensure consumable_flag defaults to "none" if not selected
          const consumableValue = data.consumable_flag || "none";
          if (editingAccessories) {
            // Transform consumable_flag from "yes"/"no"/"none" to boolean
            const transformedData = {
              ...data,
              consumable_flag: consumableValue === "yes" ? true : false,
            };
            updateAccessoriesMutation.mutate({ id: editingAccessories.product_id, data: transformedData });
          } else {
            // Get latest data from query cache to ensure accurate serial number
            const cachedData = queryClient.getQueryData<any[]>(["merchandiser", "accessories"]) || accessoriesData || [];
            const finalId = generateProductId(data.product_name, data.category || "", cachedData);
            // Transform consumable_flag from "yes"/"no"/"none" to boolean
            const transformedData = {
              ...data,
              product_id: finalId,
              consumable_flag: consumableValue === "yes" ? true : false,
            };
            createAccessoriesMutation.mutate(transformedData);
          }
        }}
        isLoading={createAccessoriesMutation.isPending || updateAccessoriesMutation.isPending}
      />

      {/* FINISHED GOOD DIALOG */}
      <FinishedGoodDialog
        open={finishedGoodDialogOpen}
        onOpenChange={setFinishedGoodDialogOpen}
        editingFinishedGood={editingFinishedGood}
        existingItems={finishedGoodData || []}
        onSubmit={(data) => {
          // Ensure consumable_flag defaults to "none" if not selected
          const consumableValue = data.consumable_flag || "none";
          if (editingFinishedGood) {
            // Transform consumable_flag from "yes"/"no"/"none" to boolean
            const transformedData = {
              ...data,
              consumable_flag: consumableValue === "yes" ? true : false,
            };
            updateFinishedGoodMutation.mutate({ id: editingFinishedGood.product_id, data: transformedData });
          } else {
            // Get latest data from query cache to ensure accurate serial number
            const cachedData = queryClient.getQueryData<any[]>(["merchandiser", "finishedGood"]) || finishedGoodData || [];
            const finalId = generateProductId(data.product_name, data.category || "", cachedData);
            // Transform consumable_flag from "yes"/"no"/"none" to boolean
            const transformedData = {
              ...data,
              product_id: finalId,
              consumable_flag: consumableValue === "yes" ? true : false,
            };
            createFinishedGoodMutation.mutate(transformedData);
          }
        }}
        isLoading={createFinishedGoodMutation.isPending || updateFinishedGoodMutation.isPending}
      />

      {/* PACKING GOOD DIALOG */}
      <PackingGoodDialog
        open={packingGoodDialogOpen}
        onOpenChange={setPackingGoodDialogOpen}
        editingPackingGood={editingPackingGood}
        existingItems={packingGoodData || []}
        onSubmit={(data) => {
          // Ensure consumable_flag defaults to "none" if not selected
          const consumableValue = data.consumable_flag || "none";
          if (editingPackingGood) {
            // Transform consumable_flag from "yes"/"no"/"none" to boolean
            // Also ensure carton dimensions are numbers or null
            const transformedData = {
              ...data,
              consumable_flag: consumableValue === "yes" ? true : false,
              carton_length: data.carton_length ? parseFloat(data.carton_length) : null,
              carton_width: data.carton_width ? parseFloat(data.carton_width) : null,
              carton_height: data.carton_height ? parseFloat(data.carton_height) : null,
              carton_weight: data.carton_weight ? parseFloat(data.carton_weight) : null,
            };
            updatePackingGoodMutation.mutate({ id: editingPackingGood.product_id, data: transformedData });
          } else {
            // Get latest data from query cache to ensure accurate serial number
            const cachedData = queryClient.getQueryData<any[]>(["merchandiser", "packingGood"]) || packingGoodData || [];
            const finalId = generateProductId(data.product_name, data.category || "", cachedData);
            // Transform consumable_flag from "yes"/"no"/"none" to boolean
            // Also ensure carton dimensions are numbers or null
            const transformedData = {
              ...data,
              product_id: finalId,
              consumable_flag: consumableValue === "yes" ? true : false,
              carton_length: data.carton_length ? parseFloat(data.carton_length) : null,
              carton_width: data.carton_width ? parseFloat(data.carton_width) : null,
              carton_height: data.carton_height ? parseFloat(data.carton_height) : null,
              carton_weight: data.carton_weight ? parseFloat(data.carton_weight) : null,
            };
            createPackingGoodMutation.mutate(transformedData);
          }
        }}
        isLoading={createPackingGoodMutation.isPending || updatePackingGoodMutation.isPending}
      />
    </div>
  );
}

// ========== YARN DIALOG COMPONENT ==========
function YarnDialog({
  open,
  onOpenChange,
  editingYarn,
  onSubmit,
  isLoading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingYarn: any;
  onSubmit: (data: any) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    yarn_id: "",
    yarn_name: "",
    yarn_composition: "",
    blend_ratio: "",
    yarn_count: "",
    count_system: "",
    yarn_type: "",
    yarn_form: "",
    tpi: "",
    yarn_finish: "",
    remarks: "",
  });

  // Update form when editing
  useEffect(() => {
    if (editingYarn) {
      setFormData({
        yarn_id: editingYarn.yarn_id || "",
        yarn_name: editingYarn.yarn_name || "",
        yarn_composition: editingYarn.yarn_composition || "",
        blend_ratio: editingYarn.blend_ratio || "",
        yarn_count: editingYarn.yarn_count || "",
        count_system: editingYarn.count_system || "",
        yarn_type: editingYarn.yarn_type || "",
        yarn_form: editingYarn.yarn_form || "",
        tpi: editingYarn.tpi || "",
        yarn_finish: editingYarn.yarn_finish || "",
        remarks: editingYarn.remarks || "",
      });
    } else {
      setFormData({
        yarn_id: "",
        yarn_name: "",
        yarn_composition: "",
        blend_ratio: "",
        yarn_count: "",
        count_system: "",
        yarn_type: "",
        yarn_form: "",
        tpi: "",
        yarn_finish: "",
        remarks: "",
      });
    }
  }, [editingYarn, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingYarn ? "Edit Yarn" : "Add New Yarn"}</DialogTitle>
          <DialogDescription>
            {editingYarn
              ? "Update the yarn details below"
              : "Fill in the details to create a new yarn record"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="yarn_id">Yarn ID (Auto-generated)</Label>
              <Input
                id="yarn_id"
                value={formData.yarn_id}
                onChange={(e) => setFormData({ ...formData, yarn_id: e.target.value })}
                placeholder="Will be auto-generated"
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="yarn_name">
                Yarn Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="yarn_name"
                value={formData.yarn_name}
                onChange={(e) => setFormData({ ...formData, yarn_name: e.target.value })}
                required
                placeholder="e.g., Cotton Combed 30s"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="yarn_composition">Yarn Composition</Label>
              <Input
                id="yarn_composition"
                value={formData.yarn_composition}
                onChange={(e) =>
                  setFormData({ ...formData, yarn_composition: e.target.value })
                }
                placeholder="e.g., 100% Cotton"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="blend_ratio">Blend Ratio</Label>
              <Input
                id="blend_ratio"
                value={formData.blend_ratio}
                onChange={(e) => setFormData({ ...formData, blend_ratio: e.target.value })}
                placeholder="e.g., 80/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="yarn_count">Yarn Count</Label>
              <Input
                id="yarn_count"
                value={formData.yarn_count}
                onChange={(e) => setFormData({ ...formData, yarn_count: e.target.value })}
                placeholder="e.g., 30s"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="count_system">Count System</Label>
              <Select
                value={formData.count_system}
                onValueChange={(value) =>
                  setFormData({ ...formData, count_system: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select system" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ne">Ne (English Count)</SelectItem>
                  <SelectItem value="Nm">Nm (Metric Count)</SelectItem>
                  <SelectItem value="Tex">Tex</SelectItem>
                  <SelectItem value="Denier">Denier</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="yarn_type">Yarn Type</Label>
              <Input
                id="yarn_type"
                value={formData.yarn_type}
                onChange={(e) => setFormData({ ...formData, yarn_type: e.target.value })}
                placeholder="e.g., Ring Spun"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="yarn_form">Yarn Form</Label>
              <Select
                value={formData.yarn_form}
                onValueChange={(value) => setFormData({ ...formData, yarn_form: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select form" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cone">Cone</SelectItem>
                  <SelectItem value="Hank">Hank</SelectItem>
                  <SelectItem value="Cheese">Cheese</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tpi">TPI (Twists Per Inch)</Label>
              <Input
                id="tpi"
                value={formData.tpi}
                onChange={(e) => setFormData({ ...formData, tpi: e.target.value })}
                placeholder="e.g., 12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="yarn_finish">Yarn Finish</Label>
              <Input
                id="yarn_finish"
                value={formData.yarn_finish}
                onChange={(e) => setFormData({ ...formData, yarn_finish: e.target.value })}
                placeholder="e.g., Mercerized"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="remarks">Remarks</Label>
            <Textarea
              id="remarks"
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              placeholder="Additional notes or remarks"
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {editingYarn ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>{editingYarn ? "Update" : "Create"} Yarn</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ========== FABRIC DIALOG COMPONENT (SIMPLIFIED) ==========
function FabricDialog({
  open,
  onOpenChange,
  editingFabric,
  onSubmit,
  isLoading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingFabric: any;
  onSubmit: (data: any) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    fabric_id: "",
    fabric_name: "",
    category: "",
    type: "",
    construction: "",
    weave_knit: "",
    gsm: "",
    gauge_epi: "",
    width: "",
    stretch: "",
    shrink: "",
    finish: "",
    composition: "",
    handfeel: "",
    unit_id: 0,
    remarks: "",
  });

  React.useEffect(() => {
    if (editingFabric) {
      setFormData({
        fabric_id: editingFabric.fabric_id || "",
        fabric_name: editingFabric.fabric_name || "",
        category: editingFabric.category || "",
        type: editingFabric.type || "",
        construction: editingFabric.construction || "",
        weave_knit: editingFabric.weave_knit || "",
        gsm: editingFabric.gsm || "",
        gauge_epi: editingFabric.gauge_epi || "",
        width: editingFabric.width || "",
        stretch: editingFabric.stretch || "",
        shrink: editingFabric.shrink || "",
        finish: editingFabric.finish || "",
        composition: editingFabric.composition || "",
        handfeel: editingFabric.handfeel || "",
        unit_id: editingFabric.unit_id || 0,
        remarks: editingFabric.remarks || "",
      });
    } else {
      setFormData({
        fabric_id: "",
        fabric_name: "",
        category: "",
        type: "",
        construction: "",
        weave_knit: "",
        gsm: "",
        gauge_epi: "",
        width: "",
        stretch: "",
        shrink: "",
        finish: "",
        composition: "",
        handfeel: "",
        unit_id: 0,
        remarks: "",
      });
    }
  }, [editingFabric, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate unit selection
    if (!formData.unit_id || formData.unit_id === 0) {
      toast.error("Please select a unit");
      return;
    }
    
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingFabric ? "Edit Fabric" : "Add New Fabric"}</DialogTitle>
          <DialogDescription>
            {editingFabric
              ? "Update the fabric details below"
              : "Fill in the details to create a new fabric record"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fabric_id">Fabric ID (Auto-generated)</Label>
              <Input
                id="fabric_id"
                value={formData.fabric_id}
                onChange={(e) => setFormData({ ...formData, fabric_id: e.target.value })}
                placeholder="Will be auto-generated"
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fabric_name">
                Fabric Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="fabric_name"
                value={formData.fabric_name}
                onChange={(e) => setFormData({ ...formData, fabric_name: e.target.value })}
                required
                placeholder="e.g., Single Jersey"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Knit">Knit</SelectItem>
                  <SelectItem value="Woven">Woven</SelectItem>
                  <SelectItem value="Non-woven">Non-woven</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Input
                id="type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                placeholder="e.g., Jersey, Rib, etc."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gsm">GSM</Label>
              <Input
                id="gsm"
                type="number"
                value={formData.gsm}
                onChange={(e) => setFormData({ ...formData, gsm: e.target.value })}
                placeholder="e.g., 180"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="width">Width</Label>
              <Input
                id="width"
                value={formData.width}
                onChange={(e) => setFormData({ ...formData, width: e.target.value })}
                placeholder="e.g., 72 inches"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="composition">Composition</Label>
              <Input
                id="composition"
                value={formData.composition}
                onChange={(e) => setFormData({ ...formData, composition: e.target.value })}
                placeholder="e.g., 100% Cotton"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit_id">
                Unit <span className="text-destructive">*</span>
              </Label>
              <div className="flex items-center gap-2">
                <UnitSelector
                  value={formData.unit_id}
                  onChange={(value) => setFormData({ ...formData, unit_id: value })}
                  categoryFilter="Weight"
                  placeholder="Select unit"
                  className="flex-1"
                />
                {formData.unit_id > 0 && formData.gsm && (
                  <InlineConverter
                    value={parseFloat(formData.gsm) || 0}
                    fromUnitId={formData.unit_id}
                    categoryName="Weight"
                  />
                )}
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="remarks">Remarks</Label>
            <Textarea
              id="remarks"
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              placeholder="Additional notes or remarks"
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {editingFabric ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>{editingFabric ? "Update" : "Create"} Fabric</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ========== TRIMS DIALOG (ENHANCED WITH SEARCHABLE DROPDOWNS) ==========
function TrimsDialog({
  open,
  onOpenChange,
  editingTrims,
  onSubmit,
  isLoading,
  existingItems = [],
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingTrims: any;
  onSubmit: (data: any) => void;
  isLoading: boolean;
  existingItems?: any[];
}) {
  const [formData, setFormData] = useState({
    product_id: "",
    product_name: "",
    category: "",
    sub_category: "",
    unit_id: 0,
    consumable_flag: "none" as "yes" | "no" | "none",
    remarks: "",
  });

  // Predefined options for dropdowns
  const [productNames] = useState<string[]>([
    "Metal Button", "Plastic Button", "Shell Button", "Wooden Button",
    "Zipper", "Invisible Zipper", "Metal Zipper", "Plastic Zipper",
    "Thread", "Polyester Thread", "Cotton Thread", "Nylon Thread",
    "Elastic", "Waistband Elastic", "Leg Elastic", "Arm Elastic",
    "Velcro", "Hook and Loop", "Snap Button", "Rivet",
    "Eyelet", "Grommet", "D-Ring", "Buckle"
  ]);

  const [categories] = useState<string[]>([
    "Button", "Zipper", "Thread", "Elastic", "Fastener",
    "Hardware", "Closure", "Reinforcement", "Decorative"
  ]);

  const [subCategories] = useState<string[]>([
    "2-hole", "4-hole", "Shank", "Snap", "Toggle",
    "Coil", "Invisible", "Metal Teeth", "Plastic Teeth",
    "Core Spun", "Textured", "Monofilament", "Multifilament",
    "Knitted", "Woven", "Braided", "Flat"
  ]);

  // Auto-generate Product ID from product name (only for new items)
  React.useEffect(() => {
    if (!editingTrims && formData.product_name) {
      const generatedId = generateProductId(formData.product_name, formData.category || "", existingItems);
      setFormData((prev) => ({ ...prev, product_id: generatedId }));
    }
  }, [formData.product_name, formData.category, editingTrims, existingItems]);

  React.useEffect(() => {
    if (editingTrims) {
      // Convert legacy boolean to new format
      let consumableValue: "yes" | "no" | "none" = "none";
      if (editingTrims.consumable_flag === true || editingTrims.consumable_flag === "yes") {
        consumableValue = "yes";
      } else if (editingTrims.consumable_flag === false || editingTrims.consumable_flag === "no") {
        consumableValue = "no";
      } else if (editingTrims.consumable_flag === "none") {
        consumableValue = "none";
      }
      setFormData({
        product_id: editingTrims.product_id || "",
        product_name: editingTrims.product_name || "",
        category: editingTrims.category || "",
        sub_category: editingTrims.sub_category || "",
        unit_id: editingTrims.unit_id || 0,
        consumable_flag: consumableValue,
        remarks: editingTrims.remarks || "",
      });
    } else {
      setFormData({
        product_id: "",
        product_name: "",
        category: "",
        sub_category: "",
        unit_id: 0,
        consumable_flag: "none",
        remarks: "",
      });
    }
  }, [editingTrims, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate unit selection
    if (!formData.unit_id || formData.unit_id === 0) {
      toast.error("Please select a unit");
      return;
    }
    
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{editingTrims ? "Edit Trims" : "Add New Trims"}</DialogTitle>
          <DialogDescription>
            {editingTrims
              ? "Update the trims details below"
              : "Fill in the details to create a new trims record"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="product_id">Product ID (Auto-generated)</Label>
              <Input
                id="product_id"
                value={formData.product_id}
                onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                placeholder="Will be auto-generated"
                disabled
              />
            </div>
            <SearchableDropdown
              label="Product Name"
              value={formData.product_name}
              onChange={(value) => setFormData({ ...formData, product_name: value })}
              options={productNames}
              placeholder="Select or type product name..."
              required
            />
            <SearchableDropdown
              label="Category"
              value={formData.category}
              onChange={(value) => setFormData({ ...formData, category: value })}
              options={categories}
              placeholder="Select or type category..."
            />
            <SearchableDropdown
              label="Sub-Category"
              value={formData.sub_category}
              onChange={(value) => setFormData({ ...formData, sub_category: value })}
              options={subCategories}
              placeholder="Select or type sub-category..."
            />
            <div className="space-y-2">
              <Label htmlFor="unit_id">
                Unit <span className="text-destructive">*</span>
              </Label>
              <div className="flex items-center gap-2">
                <UnitSelector
                  value={formData.unit_id}
                  onChange={(value) => setFormData({ ...formData, unit_id: value })}
                  placeholder="Select unit"
                  className="flex-1"
                />
                {formData.unit_id > 0 && (
                  <InlineConverter
                    value={1}
                    fromUnitId={formData.unit_id}
                    categoryName="Quantity"
                  />
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="consumable_flag">Consumable</Label>
              <Select
                value={formData.consumable_flag || "none"}
                onValueChange={(value: "yes" | "no" | "none") =>
                  setFormData({ ...formData, consumable_flag: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="remarks">Remarks</Label>
            <Textarea
              id="remarks"
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              placeholder="Additional notes or remarks"
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {editingTrims ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>{editingTrims ? "Update" : "Create"} Trims</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ========== ACCESSORIES DIALOG (ENHANCED WITH SEARCHABLE DROPDOWNS) ==========
function AccessoriesDialog({
  open,
  onOpenChange,
  editingAccessories,
  onSubmit,
  isLoading,
  existingItems = [],
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingAccessories: any;
  onSubmit: (data: any) => void;
  isLoading: boolean;
  existingItems?: any[];
}) {
  const [formData, setFormData] = useState({
    product_id: "",
    product_name: "",
    category: "",
    sub_category: "",
    unit_id: 0,
    consumable_flag: "none" as "yes" | "no" | "none",
    remarks: "",
  });
  
  // Predefined options for dropdowns
  const [productNames] = useState<string[]>([
    "Woven Label", "Printed Label", "Care Label", "Size Label",
    "Hang Tag", "Price Tag", "Swing Tag", "Barcode Tag",
    "Plastic Hanger", "Wire Hanger", "Wooden Hanger", "Clip Hanger",
    "Sticker", "Hologram Sticker", "Security Sticker", "Brand Sticker",
    "Poly Bag", "Paper Bag", "Gift Box", "Tissue Paper"
  ]);

  const [categories] = useState<string[]>([
    "Label", "Tag", "Hanger", "Sticker", "Packaging",
    "Branding", "Security", "Information", "Decoration"
  ]);

  const [subCategories] = useState<string[]>([
    "Main Label", "Care Label", "Size Label", "Brand Label",
    "Hang Tag", "Price Tag", "Swing Tag", "Security Tag",
    "Plastic", "Wire", "Wood", "Clip", "Padded",
    "Hologram", "Barcode", "QR Code", "RFID"
  ]);

  // Auto-generate Product ID from product name (only for new items)
  React.useEffect(() => {
    if (!editingAccessories && formData.product_name) {
      const generatedId = generateProductId(formData.product_name, formData.category || "", existingItems);
      setFormData((prev) => ({ ...prev, product_id: generatedId }));
    }
  }, [formData.product_name, formData.category, editingAccessories, existingItems]);

  React.useEffect(() => {
    if (editingAccessories) {
      // Convert legacy boolean to new format
      let consumableValue: "yes" | "no" | "none" = "none";
      if (editingAccessories.consumable_flag === true || editingAccessories.consumable_flag === "yes") {
        consumableValue = "yes";
      } else if (editingAccessories.consumable_flag === false || editingAccessories.consumable_flag === "no") {
        consumableValue = "no";
      } else if (editingAccessories.consumable_flag === "none") {
        consumableValue = "none";
      }
      
      setFormData({
        product_id: editingAccessories.product_id || "",
        product_name: editingAccessories.product_name || "",
        category: editingAccessories.category || "",
        sub_category: editingAccessories.sub_category || "",
        unit_id: editingAccessories.unit_id || 0,
        consumable_flag: consumableValue,
        remarks: editingAccessories.remarks || "",
      });
    } else {
      setFormData({
        product_id: "",
        product_name: "",
        category: "",
        sub_category: "",
        unit_id: 0,
        consumable_flag: "none",
        remarks: "",
      });
    }
  }, [editingAccessories, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate unit selection
    if (!formData.unit_id || formData.unit_id === 0) {
      toast.error("Please select a unit");
      return;
    }
    
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {editingAccessories ? "Edit Accessories" : "Add New Accessories"}
          </DialogTitle>
          <DialogDescription>
            {editingAccessories
              ? "Update the accessories details below"
              : "Fill in the details to create a new accessories record"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="product_id">Product ID (Auto-generated)</Label>
              <Input
                id="product_id"
                value={formData.product_id}
                onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                placeholder="Will be auto-generated"
                disabled
              />
            </div>
            <SearchableDropdown
              label="Product Name"
              value={formData.product_name}
              onChange={(value) => setFormData({ ...formData, product_name: value })}
              options={productNames}
              placeholder="Select or type product name..."
              required
            />
            <SearchableDropdown
              label="Category"
              value={formData.category}
              onChange={(value) => setFormData({ ...formData, category: value })}
              options={categories}
              placeholder="Select or type category..."
            />
            <SearchableDropdown
              label="Sub-Category"
              value={formData.sub_category}
              onChange={(value) => setFormData({ ...formData, sub_category: value })}
              options={subCategories}
              placeholder="Select or type sub-category..."
            />
            <div className="space-y-2">
              <Label htmlFor="unit_id">
                Unit <span className="text-destructive">*</span>
              </Label>
              <div className="flex items-center gap-2">
                <UnitSelector
                  value={formData.unit_id}
                  onChange={(value) => setFormData({ ...formData, unit_id: value })}
                  placeholder="Select unit"
                  className="flex-1"
                />
                {formData.unit_id > 0 && (
                  <InlineConverter
                    value={1}
                    fromUnitId={formData.unit_id}
                    categoryName="Quantity"
                  />
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="consumable_flag">Consumable</Label>
              <Select
                value={formData.consumable_flag || "none"}
                onValueChange={(value: "yes" | "no" | "none") =>
                  setFormData({ ...formData, consumable_flag: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="remarks">Remarks</Label>
            <Textarea
              id="remarks"
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              placeholder="Additional notes or remarks"
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {editingAccessories ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>{editingAccessories ? "Update" : "Create"} Accessories</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ========== FINISHED GOOD DIALOG (ENHANCED WITH SEARCHABLE DROPDOWNS) ==========
function FinishedGoodDialog({
  open,
  onOpenChange,
  editingFinishedGood,
  onSubmit,
  isLoading,
  existingItems = [],
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingFinishedGood: any;
  onSubmit: (data: any) => void;
  isLoading: boolean;
  existingItems?: any[];
}) {
  const [formData, setFormData] = useState({
    product_id: "",
    product_name: "",
    category: "",
    sub_category: "",
    unit_id: 0,
    consumable_flag: "none" as "yes" | "no" | "none",
    remarks: "",
  });

  // Predefined options for dropdowns
  const [productNames] = useState<string[]>([
    "T-Shirt Basic", "T-Shirt Premium", "Polo Shirt", "Tank Top",
    "Hoodie", "Sweatshirt", "Cardigan", "Blazer", "Jacket",
    "Jeans", "Chinos", "Cargo Pants", "Dress Pants", "Leggings",
    "Shorts", "Bermuda", "Skirt", "Dress", "Jumpsuit",
    "Underwear", "Socks", "Cap", "Hat", "Scarf"
  ]);

  const [categories] = useState<string[]>([
    "T-Shirt", "Polo", "Jacket", "Pants", "Shorts",
    "Dress", "Skirt", "Underwear", "Accessories", "Outerwear",
    "Activewear", "Sleepwear", "Formal", "Casual"
  ]);

  const [subCategories] = useState<string[]>([
    "Round Neck", "V-Neck", "Crew Neck", "Scoop Neck",
    "Long Sleeve", "Short Sleeve", "Sleeveless", "3/4 Sleeve",
    "Slim Fit", "Regular Fit", "Loose Fit", "Oversized",
    "High Waist", "Low Waist", "Mid Rise", "Bootcut", "Straight"
  ]);

  // Auto-generate Product ID from product name (only for new items)
  useEffect(() => {
    if (!editingFinishedGood && formData.product_name) {
      const generatedId = generateProductId(formData.product_name, formData.category || "", existingItems);
      setFormData((prev) => ({ ...prev, product_id: generatedId }));
    }
  }, [formData.product_name, formData.category, editingFinishedGood, existingItems]);

  useEffect(() => {
    if (editingFinishedGood) {
      // Convert legacy boolean to new format
      let consumableValue: "yes" | "no" | "none" = "none";
      if (editingFinishedGood.consumable_flag === true || editingFinishedGood.consumable_flag === "yes") {
        consumableValue = "yes";
      } else if (editingFinishedGood.consumable_flag === false || editingFinishedGood.consumable_flag === "no") {
        consumableValue = "no";
      } else if (editingFinishedGood.consumable_flag === "none") {
        consumableValue = "none";
      }
      setFormData({
        product_id: editingFinishedGood.product_id || "",
        product_name: editingFinishedGood.product_name || "",
        category: editingFinishedGood.category || "",
        sub_category: editingFinishedGood.sub_category || "",
        unit_id: editingFinishedGood.unit_id || 0,
        consumable_flag: consumableValue,
        remarks: editingFinishedGood.remarks || "",
      });
    } else {
      setFormData({
        product_id: "",
        product_name: "",
        category: "",
        sub_category: "",
        unit_id: 0,
        consumable_flag: "none",
        remarks: "",
      });
    }
  }, [editingFinishedGood, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate unit selection
    if (!formData.unit_id || formData.unit_id === 0) {
      toast.error("Please select a unit");
      return;
    }
    
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {editingFinishedGood ? "Edit Finished Good" : "Add New Finished Good"}
          </DialogTitle>
          <DialogDescription>
            {editingFinishedGood
              ? "Update the finished good details below"
              : "Fill in the details to create a new finished good record"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="product_id">Product ID (Auto-generated)</Label>
              <Input
                id="product_id"
                value={formData.product_id}
                onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                placeholder="Will be auto-generated"
                disabled
              />
            </div>
            <SearchableDropdown
              label="Product Name"
              value={formData.product_name}
              onChange={(value) => setFormData({ ...formData, product_name: value })}
              options={productNames}
              placeholder="Select or type product name..."
              required
            />
            <SearchableDropdown
              label="Category"
              value={formData.category}
              onChange={(value) => setFormData({ ...formData, category: value })}
              options={categories}
              placeholder="Select or type category..."
            />
            <SearchableDropdown
              label="Sub-Category"
              value={formData.sub_category}
              onChange={(value) => setFormData({ ...formData, sub_category: value })}
              options={subCategories}
              placeholder="Select or type sub-category..."
            />
            <div className="space-y-2">
              <Label htmlFor="unit_id">
                Unit <span className="text-destructive">*</span>
              </Label>
              <div className="flex items-center gap-2">
                <UnitSelector
                  value={formData.unit_id}
                  onChange={(value) => setFormData({ ...formData, unit_id: value })}
                  placeholder="Select unit"
                  className="flex-1"
                />
                {formData.unit_id > 0 && (
                  <InlineConverter
                    value={1}
                    fromUnitId={formData.unit_id}
                    categoryName="Quantity"
                  />
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="consumable_flag">Consumable</Label>
              <Select
                value={formData.consumable_flag || "none"}
                onValueChange={(value: "yes" | "no" | "none") =>
                  setFormData({ ...formData, consumable_flag: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="remarks">Remarks</Label>
            <Textarea
              id="remarks"
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              placeholder="Additional notes or remarks"
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {editingFinishedGood ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>{editingFinishedGood ? "Update" : "Create"} Finished Good</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ========== PACKING GOOD DIALOG (ENHANCED WITH SEARCHABLE DROPDOWNS) ==========
function PackingGoodDialog({
  open,
  onOpenChange,
  editingPackingGood,
  onSubmit,
  isLoading,
  existingItems = [],
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingPackingGood: any;
  onSubmit: (data: any) => void;
  isLoading: boolean;
  existingItems?: any[];
}) {
  const [formData, setFormData] = useState({
    product_id: "",
    product_name: "",
    category: "",
    sub_category: "",
    unit_id: 0,
    consumable_flag: "none" as "yes" | "no" | "none",
    carton_length: "",
    carton_width: "",
    carton_height: "",
    carton_weight: "",
    remarks: "",
  });

  // Predefined options for dropdowns
  const [productNames] = useState<string[]>([
    "Carton Box", "Master Carton", "Inner Box", "Display Box",
    "Poly Bag", "Zip Lock Bag", "Bubble Wrap", "Foam Sheet",
    "Tissue Paper", "Wrapping Paper", "Gift Paper", "Kraft Paper",
    "Sticker Label", "Shipping Label", "Barcode Label", "Warning Label",
    "Tape", "Packing Tape", "Double Sided Tape", "Masking Tape",
    "Bubble Mailer", "Padded Envelope", "Document Pouch"
  ]);

  const [categories] = useState<string[]>([
    "Carton", "Poly Bag", "Sticker", "Tissue Paper", "Tape",
    "Protective", "Envelope", "Label", "Wrapping", "Padding"
  ]);

  const [subCategories] = useState<string[]>([
    "5-ply", "3-ply", "7-ply", "Single Wall", "Double Wall",
    "LDPE", "HDPE", "Biodegradable", "Recyclable", "Anti-Static",
    "Self Adhesive", "Removable", "Permanent", "Waterproof",
    "Clear", "Colored", "Printed", "Plain", "Perforated"
  ]);

  // Auto-generate Product ID from product name (only for new items)
  useEffect(() => {
    if (!editingPackingGood && formData.product_name) {
      const generatedId = generateProductId(formData.product_name, formData.category || "", existingItems);
      setFormData((prev) => ({ ...prev, product_id: generatedId }));
    }
  }, [formData.product_name, formData.category, editingPackingGood, existingItems]);

  useEffect(() => {
    if (editingPackingGood) {
      // Convert legacy boolean to new format
      let consumableValue: "yes" | "no" | "none" = "none";
      if (editingPackingGood.consumable_flag === true || editingPackingGood.consumable_flag === "yes") {
        consumableValue = "yes";
      } else if (editingPackingGood.consumable_flag === false || editingPackingGood.consumable_flag === "no") {
        consumableValue = "no";
      } else if (editingPackingGood.consumable_flag === "none") {
        consumableValue = "none";
      }
      setFormData({
        product_id: editingPackingGood.product_id || "",
        product_name: editingPackingGood.product_name || "",
        category: editingPackingGood.category || "",
        sub_category: editingPackingGood.sub_category || "",
        unit_id: editingPackingGood.unit_id || 0,
        consumable_flag: consumableValue,
        carton_length: editingPackingGood.carton_length?.toString() || "",
        carton_width: editingPackingGood.carton_width?.toString() || "",
        carton_height: editingPackingGood.carton_height?.toString() || "",
        carton_weight: editingPackingGood.carton_weight?.toString() || "",
        remarks: editingPackingGood.remarks || "",
      });
    } else {
      setFormData({
        product_id: "",
        product_name: "",
        category: "",
        sub_category: "",
        unit_id: 0,
        consumable_flag: "none",
        carton_length: "",
        carton_width: "",
        carton_height: "",
        carton_weight: "",
        remarks: "",
      });
    }
  }, [editingPackingGood, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate unit selection
    if (!formData.unit_id || formData.unit_id === 0) {
      toast.error("Please select a unit");
      return;
    }
    
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {editingPackingGood ? "Edit Packing Good" : "Add New Packing Good"}
          </DialogTitle>
          <DialogDescription>
            {editingPackingGood
              ? "Update the packing good details below"
              : "Fill in the details to create a new packing good record"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="product_id">Product ID (Auto-generated)</Label>
              <Input
                id="product_id"
                value={formData.product_id}
                onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                placeholder="Will be auto-generated"
                disabled
              />
            </div>
            <SearchableDropdown
              label="Product Name"
              value={formData.product_name}
              onChange={(value) => setFormData({ ...formData, product_name: value })}
              options={productNames}
              placeholder="Select or type product name..."
              required
            />
            <SearchableDropdown
              label="Category"
              value={formData.category}
              onChange={(value) => setFormData({ ...formData, category: value })}
              options={categories}
              placeholder="Select or type category..."
            />
            <SearchableDropdown
              label="Sub-Category"
              value={formData.sub_category}
              onChange={(value) => setFormData({ ...formData, sub_category: value })}
              options={subCategories}
              placeholder="Select or type sub-category..."
            />
            <div className="space-y-2">
              <Label htmlFor="unit_id">
                Unit <span className="text-destructive">*</span>
              </Label>
              <div className="flex items-center gap-2">
                <UnitSelector
                  value={formData.unit_id}
                  onChange={(value) => setFormData({ ...formData, unit_id: value })}
                  placeholder="Select unit"
                  className="flex-1"
                />
                {formData.unit_id > 0 && (
                  <InlineConverter
                    value={1}
                    fromUnitId={formData.unit_id}
                    categoryName="Quantity"
                  />
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="consumable_flag">Consumable</Label>
              <Select
                value={formData.consumable_flag || "none"}
                onValueChange={(value: "yes" | "no" | "none") =>
                  setFormData({ ...formData, consumable_flag: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Carton Size & Weight Section */}
          <div className="border rounded-lg p-4 space-y-4">
            <Label className="text-base font-semibold">Carton Specifications</Label>
            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="carton_length">Length (cm)</Label>
                <Input
                  id="carton_length"
                  type="number"
                  step="0.1"
                  value={formData.carton_length}
                  onChange={(e) => setFormData({ ...formData, carton_length: e.target.value })}
                  placeholder="e.g., 60"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="carton_width">Width (cm)</Label>
                <Input
                  id="carton_width"
                  type="number"
                  step="0.1"
                  value={formData.carton_width}
                  onChange={(e) => setFormData({ ...formData, carton_width: e.target.value })}
                  placeholder="e.g., 40"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="carton_height">Height (cm)</Label>
                <Input
                  id="carton_height"
                  type="number"
                  step="0.1"
                  value={formData.carton_height}
                  onChange={(e) => setFormData({ ...formData, carton_height: e.target.value })}
                  placeholder="e.g., 30"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="carton_weight">Weight (kg)</Label>
                <Input
                  id="carton_weight"
                  type="number"
                  step="0.01"
                  value={formData.carton_weight}
                  onChange={(e) => setFormData({ ...formData, carton_weight: e.target.value })}
                  placeholder="e.g., 2.5"
                />
              </div>
            </div>
            {formData.carton_length && formData.carton_width && formData.carton_height && (
              <p className="text-sm text-muted-foreground">
                Volume: {(parseFloat(formData.carton_length) * parseFloat(formData.carton_width) * parseFloat(formData.carton_height) / 1000000).toFixed(4)} m³
                {formData.carton_weight && ` | Weight: ${formData.carton_weight} kg`}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="remarks">Remarks</Label>
            <Textarea
              id="remarks"
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              placeholder="Additional notes or remarks"
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {editingPackingGood ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>{editingPackingGood ? "Update" : "Create"} Packing Good</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
