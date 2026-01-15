"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, ArrowLeft, Loader2, Edit, Trash2, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { api } from "@/services/api";
import { toast } from "sonner";

// ========== DIALOG COMPONENTS (Defined before main component for TypeScript) ==========

// ========== STYLE COLOR DIALOG ==========
function StyleColorDialog({
  open,
  onOpenChange,
  editingColor,
  styles,
  onSubmit,
  isLoading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingColor: any;
  styles: any[];
  onSubmit: (data: any) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    style_id: "",
    color_id: "",
    color_name: "",
    color_code_type: "",
    color_code: "",
  });

  useEffect(() => {
    if (editingColor) {
      setFormData({
        style_id: editingColor.style_id || "",
        color_id: editingColor.color_id || "",
        color_name: editingColor.color_name || "",
        color_code_type: editingColor.color_code_type || "",
        color_code: editingColor.color_code || "",
      });
    } else {
      setFormData({
        style_id: "",
        color_id: "",
        color_name: "",
        color_code_type: "",
        color_code: "",
      });
    }
  }, [editingColor, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{editingColor ? "Edit Color" : "Add Style Color"}</DialogTitle>
          <DialogDescription>
            Add or edit color information for a style
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="style_id">
                Style ID <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.style_id}
                onValueChange={(value) => setFormData({ ...formData, style_id: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select style" />
                </SelectTrigger>
                <SelectContent>
                  {styles.map((style: any) => (
                    <SelectItem key={style.style_id} value={style.style_id}>
                      {style.style_id} - {style.style_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="color_id">
                Color ID <span className="text-destructive">*</span>
              </Label>
              <Input
                id="color_id"
                value={formData.color_id}
                onChange={(e) => setFormData({ ...formData, color_id: e.target.value })}
                required
                placeholder="e.g., C001"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="color_name">
                Color Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="color_name"
                value={formData.color_name}
                onChange={(e) => setFormData({ ...formData, color_name: e.target.value })}
                required
                placeholder="e.g., Navy Blue"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="color_code_type">Color Code Type</Label>
              <Select
                value={formData.color_code_type}
                onValueChange={(value) => setFormData({ ...formData, color_code_type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pantone">Pantone</SelectItem>
                  <SelectItem value="RAL">RAL</SelectItem>
                  <SelectItem value="Custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="color_code">Color Code</Label>
              <Input
                id="color_code"
                value={formData.color_code}
                onChange={(e) => setFormData({ ...formData, color_code: e.target.value })}
                placeholder="e.g., 19-4052 TCX"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {editingColor ? "Updating..." : "Adding..."}
                </>
              ) : (
                <>{editingColor ? "Update" : "Add"} Color</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ========== STYLE SIZE DIALOG ==========
function StyleSizeDialog({
  open,
  onOpenChange,
  editingSize,
  styles,
  onSubmit,
  isLoading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingSize: any;
  styles: any[];
  onSubmit: (data: any) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    style_id: "",
    size_id: "",
    size_name: "",
  });

  useEffect(() => {
    if (editingSize) {
      setFormData({
        style_id: editingSize.style_id || "",
        size_id: editingSize.size_id || "",
        size_name: editingSize.size_name || "",
      });
    } else {
      setFormData({
        style_id: "",
        size_id: "",
        size_name: "",
      });
    }
  }, [editingSize, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{editingSize ? "Edit Size" : "Add Style Size"}</DialogTitle>
          <DialogDescription>
            Add or edit size information for a style
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="style_id">
                Style ID <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.style_id}
                onValueChange={(value) => setFormData({ ...formData, style_id: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select style" />
                </SelectTrigger>
                <SelectContent>
                  {styles.map((style: any) => (
                    <SelectItem key={style.style_id} value={style.style_id}>
                      {style.style_id} - {style.style_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="size_id">
                Size ID <span className="text-destructive">*</span>
              </Label>
              <Input
                id="size_id"
                value={formData.size_id}
                onChange={(e) => setFormData({ ...formData, size_id: e.target.value })}
                required
                placeholder="e.g., SZ001"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="size_name">
                Size Name <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.size_name}
                onValueChange={(value) => setFormData({ ...formData, size_name: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="XS">XS</SelectItem>
                  <SelectItem value="S">S</SelectItem>
                  <SelectItem value="M">M</SelectItem>
                  <SelectItem value="L">L</SelectItem>
                  <SelectItem value="XL">XL</SelectItem>
                  <SelectItem value="XXL">XXL</SelectItem>
                  <SelectItem value="2XL">2XL</SelectItem>
                  <SelectItem value="3XL">3XL</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {editingSize ? "Updating..." : "Adding..."}
                </>
              ) : (
                <>{editingSize ? "Update" : "Add"} Size</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ========== STYLE VARIANT DIALOG ==========
function StyleVariantDialog({
  open,
  onOpenChange,
  editingVariant,
  styles,
  colors,
  sizes,
  onSubmit,
  isLoading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingVariant: any;
  styles: any[];
  colors: any[];
  sizes: any[];
  onSubmit: (data: any) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    style_variant_id: "",
    style_id: "",
    color_id: "",
    size_id: "",
    variant_name: "",
    is_active: true,
  });

  useEffect(() => {
    if (editingVariant) {
      setFormData({
        style_variant_id: editingVariant.style_variant_id || "",
        style_id: editingVariant.style_id || "",
        color_id: editingVariant.color_id || "",
        size_id: editingVariant.size_id || "",
        variant_name: editingVariant.variant_name || "",
        is_active: editingVariant.is_active ?? true,
      });
    } else {
      setFormData({
        style_variant_id: "",
        style_id: "",
        color_id: "",
        size_id: "",
        variant_name: "",
        is_active: true,
      });
    }
  }, [editingVariant, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = {
      ...formData,
      style_variant_id: formData.style_variant_id || `SV-${Date.now()}`,
    };
    
    onSubmit(submitData);
  };

  // Filter colors and sizes by selected style
  const filteredColors = colors.filter((c: any) => c.style_id === formData.style_id);
  const filteredSizes = sizes.filter((s: any) => s.style_id === formData.style_id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{editingVariant ? "Edit Variant" : "Add Style Variant"}</DialogTitle>
          <DialogDescription>
            Create a style variant manually (or use Auto-Generate for all combinations)
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="style_id">
                Style ID <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.style_id}
                onValueChange={(value) => setFormData({ ...formData, style_id: value, color_id: "", size_id: "" })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select style" />
                </SelectTrigger>
                <SelectContent>
                  {styles.map((style: any) => (
                    <SelectItem key={style.style_id} value={style.style_id}>
                      {style.style_id} - {style.style_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="style_variant_id">Variant ID</Label>
              <Input
                id="style_variant_id"
                value={formData.style_variant_id}
                onChange={(e) => setFormData({ ...formData, style_variant_id: e.target.value })}
                placeholder="SV-XXXXX (auto-generated if empty)"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="color_id">
                Color <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.color_id}
                onValueChange={(value) => setFormData({ ...formData, color_id: value })}
                required
                disabled={!formData.style_id}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select color" />
                </SelectTrigger>
                <SelectContent>
                  {filteredColors.map((color: any) => (
                    <SelectItem key={color.color_id} value={color.color_id}>
                      {color.color_name} ({color.color_id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="size_id">
                Size <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.size_id}
                onValueChange={(value) => setFormData({ ...formData, size_id: value })}
                required
                disabled={!formData.style_id}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  {filteredSizes.map((size: any) => (
                    <SelectItem key={size.size_id} value={size.size_id}>
                      {size.size_name} ({size.size_id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="variant_name">Variant Name</Label>
              <Input
                id="variant_name"
                value={formData.variant_name}
                onChange={(e) => setFormData({ ...formData, variant_name: e.target.value })}
                placeholder="e.g., Navy Blue - Large"
              />
            </div>
            <div className="space-y-2 flex items-center">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="mr-2"
              />
              <Label htmlFor="is_active">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {editingVariant ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>{editingVariant ? "Update" : "Create"} Variant</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function StyleManagementPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("creation");

  // Dialog states
  const [creationDialogOpen, setCreationDialogOpen] = useState(false);
  const [basicInfoDialogOpen, setBasicInfoDialogOpen] = useState(false);
  const [materialLinkDialogOpen, setMaterialLinkDialogOpen] = useState(false);
  const [colorDialogOpen, setColorDialogOpen] = useState(false);
  const [sizeDialogOpen, setSizeDialogOpen] = useState(false);
  const [variantDialogOpen, setVariantDialogOpen] = useState(false);

  // Editing states
  const [editingCreation, setEditingCreation] = useState<any>(null);
  const [editingBasicInfo, setEditingBasicInfo] = useState<any>(null);
  const [editingMaterialLink, setEditingMaterialLink] = useState<any>(null);
  const [editingColor, setEditingColor] = useState<any>(null);
  const [editingSize, setEditingSize] = useState<any>(null);
  const [editingVariant, setEditingVariant] = useState<any>(null);
  const [selectedStyleId, setSelectedStyleId] = useState<string>("all");

  // ========== FETCH DATA FROM OTHER MODULES ==========
  // Fetch Buyers from Client Info
  const { data: buyersData } = useQuery({
    queryKey: ["buyers"],
    queryFn: () => api.buyers.getAll(),
  });

  // Create buyer lookup map
  const buyerMap = useMemo(() => {
    if (!buyersData) return {};
    return buyersData.reduce((acc: any, buyer: any) => {
      acc[buyer.id] = buyer;
      return acc;
    }, {});
  }, [buyersData]);

  // Fetch Samples
  const { data: samplesData } = useQuery({
    queryKey: ["merchandiser", "samplePrimary"],
    queryFn: () => api.merchandiser.samplePrimary.getAll(),
  });

  // Fetch Materials for linking
  const { data: yarnsData } = useQuery({
    queryKey: ["merchandiser", "yarn"],
    queryFn: () => api.merchandiser.yarn.getAll(),
  });

  const { data: fabricsData } = useQuery({
    queryKey: ["merchandiser", "fabric"],
    queryFn: () => api.merchandiser.fabric.getAll(),
  });

  const { data: trimsData } = useQuery({
    queryKey: ["merchandiser", "trims"],
    queryFn: () => api.merchandiser.trims.getAll(),
  });

  const { data: accessoriesData } = useQuery({
    queryKey: ["merchandiser", "accessories"],
    queryFn: () => api.merchandiser.accessories.getAll(),
  });

  // ========== FETCH MERCHANDISER STYLE DATA ==========
  // Fetch Style Creation
  const { data: creationData, isLoading: creationLoading } = useQuery({
    queryKey: ["merchandiser", "styleCreation"],
    queryFn: () => api.merchandiser.styleCreation.getAll(),
  });

  // Fetch Style Basic Info
  const { data: basicInfoData, isLoading: basicInfoLoading } = useQuery({
    queryKey: ["merchandiser", "styleBasicInfo"],
    queryFn: () => api.merchandiser.styleBasicInfo.getAll(),
  });

  // Fetch Style Material Links
  const { data: materialLinksData, isLoading: materialLinksLoading } = useQuery({
    queryKey: ["merchandiser", "styleMaterialLink"],
    queryFn: () => api.merchandiser.styleMaterialLink.getAll(),
  });

  // Fetch Style Colors
  const { data: colorsData, isLoading: colorsLoading } = useQuery({
    queryKey: ["merchandiser", "styleColor", selectedStyleId],
    queryFn: () => api.merchandiser.styleColor.getAll(selectedStyleId === "all" ? undefined : selectedStyleId),
  });

  // Fetch Style Sizes
  const { data: sizesData, isLoading: sizesLoading } = useQuery({
    queryKey: ["merchandiser", "styleSize", selectedStyleId],
    queryFn: () => api.merchandiser.styleSize.getAll(selectedStyleId === "all" ? undefined : selectedStyleId),
  });

  // Fetch Style Variants
  const { data: variantsData, isLoading: variantsLoading } = useQuery({
    queryKey: ["merchandiser", "styleVariants", selectedStyleId],
    queryFn: () => api.merchandiser.styleVariants.getAll(selectedStyleId === "all" ? undefined : selectedStyleId),
  });

  // ========== STYLE CREATION MUTATIONS ==========
  const createCreationMutation = useMutation({
    mutationFn: (data: any) => api.merchandiser.styleCreation.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchandiser", "styleCreation"] });
      toast.success("Style created successfully");
      setCreationDialogOpen(false);
      setEditingCreation(null);
    },
    onError: (error: any) => toast.error(`Failed to create style: ${error.message}`),
  });

  const updateCreationMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      api.merchandiser.styleCreation.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchandiser", "styleCreation"] });
      toast.success("Style updated successfully");
      setCreationDialogOpen(false);
      setEditingCreation(null);
    },
    onError: (error: any) => toast.error(`Failed to update style: ${error.message}`),
  });

  const deleteCreationMutation = useMutation({
    mutationFn: (styleId: string) => api.merchandiser.styleCreation.delete(styleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchandiser", "styleCreation"] });
      toast.success("Style deleted successfully");
    },
    onError: (error: any) => toast.error(`Failed to delete style: ${error.message}`),
  });

  // ========== STYLE BASIC INFO MUTATIONS ==========
  const createBasicInfoMutation = useMutation({
    mutationFn: (data: any) => api.merchandiser.styleBasicInfo.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchandiser", "styleBasicInfo"] });
      toast.success("Style basic info created successfully");
      setBasicInfoDialogOpen(false);
    },
    onError: () => toast.error("Failed to create style basic info"),
  });

  const updateBasicInfoMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      api.merchandiser.styleBasicInfo.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchandiser", "styleBasicInfo"] });
      toast.success("Style basic info updated successfully");
      setBasicInfoDialogOpen(false);
      setEditingBasicInfo(null);
    },
    onError: () => toast.error("Failed to update style basic info"),
  });

  const deleteBasicInfoMutation = useMutation({
    mutationFn: (id: string) => api.merchandiser.styleBasicInfo.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchandiser", "styleBasicInfo"] });
      toast.success("Style basic info deleted successfully");
    },
    onError: () => toast.error("Failed to delete style basic info"),
  });

  // ========== STYLE MATERIAL LINK MUTATIONS ==========
  const createMaterialLinkMutation = useMutation({
    mutationFn: (data: any) => api.merchandiser.styleMaterialLink.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchandiser", "styleMaterialLink"] });
      toast.success("Material linked successfully");
      setMaterialLinkDialogOpen(false);
    },
    onError: () => toast.error("Failed to link material"),
  });

  const updateMaterialLinkMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      api.merchandiser.styleMaterialLink.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchandiser", "styleMaterialLink"] });
      toast.success("Material link updated successfully");
      setMaterialLinkDialogOpen(false);
      setEditingMaterialLink(null);
    },
    onError: () => toast.error("Failed to update material link"),
  });

  const deleteMaterialLinkMutation = useMutation({
    mutationFn: (id: string) => api.merchandiser.styleMaterialLink.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchandiser", "styleMaterialLink"] });
      toast.success("Material link deleted successfully");
    },
    onError: () => toast.error("Failed to delete material link"),
  });

  const handleDeleteCreation = (styleId: string) => {
    if (confirm("Are you sure you want to delete this style?")) {
      deleteCreationMutation.mutate(styleId);
    }
  };

  const handleDeleteBasicInfo = (styleId: string) => {
    if (confirm("Are you sure you want to delete this style basic info?")) {
      deleteBasicInfoMutation.mutate(styleId);
    }
  };

  const handleDeleteMaterialLink = (linkId: string) => {
    if (confirm("Are you sure you want to delete this material link?")) {
      deleteMaterialLinkMutation.mutate(linkId);
    }
  };

  // ========== STYLE COLOR MUTATIONS ==========
  const createColorMutation = useMutation({
    mutationFn: (data: any) => api.merchandiser.styleColor.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchandiser", "styleColor"] });
      toast.success("Color added successfully");
      setColorDialogOpen(false);
      setEditingColor(null);
    },
    onError: (error: any) => toast.error(`Failed to add color: ${error.message}`),
  });

  const updateColorMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      api.merchandiser.styleColor.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchandiser", "styleColor"] });
      toast.success("Color updated successfully");
      setColorDialogOpen(false);
      setEditingColor(null);
    },
    onError: (error: any) => toast.error(`Failed to update color: ${error.message}`),
  });

  const deleteColorMutation = useMutation({
    mutationFn: (id: number) => api.merchandiser.styleColor.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchandiser", "styleColor"] });
      toast.success("Color deleted successfully");
    },
    onError: (error: any) => toast.error(`Failed to delete color: ${error.message}`),
  });

  // ========== STYLE SIZE MUTATIONS ==========
  const createSizeMutation = useMutation({
    mutationFn: (data: any) => api.merchandiser.styleSize.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchandiser", "styleSize"] });
      toast.success("Size added successfully");
      setSizeDialogOpen(false);
      setEditingSize(null);
    },
    onError: (error: any) => toast.error(`Failed to add size: ${error.message}`),
  });

  const updateSizeMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      api.merchandiser.styleSize.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchandiser", "styleSize"] });
      toast.success("Size updated successfully");
      setSizeDialogOpen(false);
      setEditingSize(null);
    },
    onError: (error: any) => toast.error(`Failed to update size: ${error.message}`),
  });

  const deleteSizeMutation = useMutation({
    mutationFn: (id: number) => api.merchandiser.styleSize.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchandiser", "styleSize"] });
      toast.success("Size deleted successfully");
    },
    onError: (error: any) => toast.error(`Failed to delete size: ${error.message}`),
  });

  // ========== STYLE VARIANT MUTATIONS ==========
  const createVariantMutation = useMutation({
    mutationFn: (data: any) => api.merchandiser.styleVariants.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchandiser", "styleVariants"] });
      toast.success("Variant created successfully");
      setVariantDialogOpen(false);
      setEditingVariant(null);
    },
    onError: (error: any) => toast.error(`Failed to create variant: ${error.message}`),
  });

  const updateVariantMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      api.merchandiser.styleVariants.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchandiser", "styleVariants"] });
      toast.success("Variant updated successfully");
      setVariantDialogOpen(false);
      setEditingVariant(null);
    },
    onError: (error: any) => toast.error(`Failed to update variant: ${error.message}`),
  });

  const deleteVariantMutation = useMutation({
    mutationFn: (id: string) => api.merchandiser.styleVariants.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchandiser", "styleVariants"] });
      toast.success("Variant deleted successfully");
    },
    onError: (error: any) => toast.error(`Failed to delete variant: ${error.message}`),
  });

  const autoGenerateVariantsMutation = useMutation({
    mutationFn: (styleId: string) => api.merchandiser.styleVariants.autoGenerate(styleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchandiser", "styleVariants"] });
      toast.success("Variants auto-generated successfully!");
    },
    onError: (error: any) => toast.error(`Failed to generate variants: ${error.message}`),
  });

  const handleDeleteColor = (id: number) => {
    if (confirm("Are you sure you want to delete this color?")) {
      deleteColorMutation.mutate(id);
    }
  };

  const handleDeleteSize = (id: number) => {
    if (confirm("Are you sure you want to delete this size?")) {
      deleteSizeMutation.mutate(id);
    }
  };

  const handleDeleteVariant = (id: string) => {
    if (confirm("Are you sure you want to delete this variant?")) {
      deleteVariantMutation.mutate(id);
    }
  };

  const handleAutoGenerateVariants = (styleId: string) => {
    if (confirm("This will generate all Color × Size combinations. Continue?")) {
      autoGenerateVariantsMutation.mutate(styleId);
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
          <h1 className="text-3xl font-bold tracking-tight">Style Management</h1>
          <p className="text-muted-foreground mt-2">
            Create and manage styles from samples with material details (BOM)
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingCreation(null);
            setCreationDialogOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Create New Style
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="creation">
            Style Creation
            {creationData && (
              <Badge variant="secondary" className="ml-2">
                {creationData.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="basic">
            Style Basic Info
            {basicInfoData && (
              <Badge variant="secondary" className="ml-2">
                {basicInfoData.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="materials">
            Material Details (BOM)
            {materialLinksData && (
              <Badge variant="secondary" className="ml-2">
                {materialLinksData.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="colors">
            Style Colors
            {colorsData && (
              <Badge variant="secondary" className="ml-2">
                {colorsData.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="sizes">
            Style Sizes
            {sizesData && (
              <Badge variant="secondary" className="ml-2">
                {sizesData.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="variants">
            Style Variants
            {variantsData && (
              <Badge variant="secondary" className="ml-2">
                {variantsData.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* STYLE CREATION TAB */}
        <TabsContent value="creation">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Style Creation from Sample</CardTitle>
                  <CardDescription>
                    Create production styles from approved samples
                  </CardDescription>
                </div>
                <Button
                  onClick={() => {
                    setEditingCreation(null);
                    setCreationDialogOpen(true);
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Style
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {creationLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : creationData && creationData.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Style ID</TableHead>
                      <TableHead>Style Name</TableHead>
                      <TableHead>Sample ID</TableHead>
                      <TableHead>Buyer Name</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {creationData.map((style: any) => (
                      <TableRow key={style.id}>
                        <TableCell className="font-medium">{style.style_id}</TableCell>
                        <TableCell>{style.style_name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{style.sample_id || "-"}</Badge>
                        </TableCell>
                        <TableCell>
                          {buyerMap[style.buyer_id]?.brand_name || `ID: ${style.buyer_id}`}
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingCreation(style);
                              setCreationDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteCreation(style.style_id)}
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
                  No styles found. Click "Add Style" to create one.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* STYLE BASIC INFO TAB */}
        <TabsContent value="basic">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Style Basic Information</CardTitle>
                  <CardDescription>
                    Detailed specifications for each style
                  </CardDescription>
                </div>
                <Button
                  onClick={() => {
                    setEditingBasicInfo(null);
                    setBasicInfoDialogOpen(true);
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Basic Info
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {basicInfoLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : basicInfoData && basicInfoData.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Style ID</TableHead>
                      <TableHead>Gauge</TableHead>
                      <TableHead>Gender</TableHead>
                      <TableHead>Product Type</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Specific Name</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {basicInfoData.map((info: any) => (
                      <TableRow key={info.id}>
                        <TableCell className="font-medium">{info.style_id}</TableCell>
                        <TableCell>{info.gauge || "-"}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{info.gender || "-"}</Badge>
                        </TableCell>
                        <TableCell>{info.product_type || "-"}</TableCell>
                        <TableCell>{info.product_category || "-"}</TableCell>
                        <TableCell>{info.specific_name || "-"}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingBasicInfo(info);
                              setBasicInfoDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteBasicInfo(info.style_id)}
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
                  No basic info records found. Click "Add Basic Info" to create one.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* MATERIAL DETAILS (BOM) TAB */}
        <TabsContent value="materials">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Style Material Details (BOM)</CardTitle>
                  <CardDescription>
                    Link materials (Yarn, Fabric, Trims, Accessories) to styles
                  </CardDescription>
                </div>
                <Button
                  onClick={() => {
                    setEditingMaterialLink(null);
                    setMaterialLinkDialogOpen(true);
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Link Material
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {materialLinksLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : materialLinksData && materialLinksData.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Style ID</TableHead>
                      <TableHead>Material Type</TableHead>
                      <TableHead>Material ID</TableHead>
                      <TableHead>Material Name</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {materialLinksData.map((link: any) => (
                      <TableRow key={link.id}>
                        <TableCell className="font-medium">{link.style_id}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{link.material_type || "-"}</Badge>
                        </TableCell>
                        <TableCell>{link.material_id || "-"}</TableCell>
                        <TableCell>{link.material_name || "-"}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingMaterialLink(link);
                              setMaterialLinkDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteMaterialLink(link.style_material_id)}
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
                  No material links found. Click "Link Material" to create one.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* STYLE COLORS TAB */}
        <TabsContent value="colors">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Style Colors</CardTitle>
                  <CardDescription>
                    Add colors to styles (can add multiple colors)
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Select value={selectedStyleId} onValueChange={setSelectedStyleId}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Filter by Style ID" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Styles</SelectItem>
                      {creationData?.map((style: any) => (
                        <SelectItem key={style.style_id} value={style.style_id}>
                          {style.style_id} - {style.style_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={() => {
                      setEditingColor(null);
                      setColorDialogOpen(true);
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Color
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {colorsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : colorsData && colorsData.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Style ID</TableHead>
                      <TableHead>Color ID</TableHead>
                      <TableHead>Color Name</TableHead>
                      <TableHead>Color Code Type</TableHead>
                      <TableHead>Color Code</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {colorsData.map((color: any) => (
                      <TableRow key={color.id}>
                        <TableCell className="font-medium">{color.style_id}</TableCell>
                        <TableCell>{color.color_id}</TableCell>
                        <TableCell>
                          <Badge>{color.color_name}</Badge>
                        </TableCell>
                        <TableCell>{color.color_code_type || "-"}</TableCell>
                        <TableCell>{color.color_code || "-"}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingColor(color);
                              setColorDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteColor(color.id)}
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
                  No colors found. Click "Add Color" to create one.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* STYLE SIZES TAB */}
        <TabsContent value="sizes">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Style Sizes</CardTitle>
                  <CardDescription>
                    Add sizes to styles (can add multiple sizes)
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Select value={selectedStyleId} onValueChange={setSelectedStyleId}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Filter by Style ID" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Styles</SelectItem>
                      {creationData?.map((style: any) => (
                        <SelectItem key={style.style_id} value={style.style_id}>
                          {style.style_id} - {style.style_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={() => {
                      setEditingSize(null);
                      setSizeDialogOpen(true);
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Size
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {sizesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : sizesData && sizesData.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Style ID</TableHead>
                      <TableHead>Size ID</TableHead>
                      <TableHead>Size Name</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sizesData.map((size: any) => (
                      <TableRow key={size.id}>
                        <TableCell className="font-medium">{size.style_id}</TableCell>
                        <TableCell>{size.size_id}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{size.size_name}</Badge>
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingSize(size);
                              setSizeDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteSize(size.id)}
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
                  No sizes found. Click "Add Size" to create one.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* STYLE VARIANTS TAB */}
        <TabsContent value="variants">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Style Variants</CardTitle>
                  <CardDescription>
                    Automatically generated from Colors × Sizes combinations
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Select value={selectedStyleId} onValueChange={setSelectedStyleId}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Filter by Style ID" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Styles</SelectItem>
                      {creationData?.map((style: any) => (
                        <SelectItem key={style.style_id} value={style.style_id}>
                          {style.style_id} - {style.style_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedStyleId && selectedStyleId !== "all" && (
                    <Button
                      variant="outline"
                      onClick={() => handleAutoGenerateVariants(selectedStyleId)}
                      disabled={autoGenerateVariantsMutation.isPending}
                    >
                      <Sparkles className="mr-2 h-4 w-4" />
                      {autoGenerateVariantsMutation.isPending ? "Generating..." : "Auto-Generate"}
                    </Button>
                  )}
                  <Button
                    onClick={() => {
                      setEditingVariant(null);
                      setVariantDialogOpen(true);
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Variant
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {variantsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : variantsData && variantsData.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Variant ID</TableHead>
                      <TableHead>Style ID</TableHead>
                      <TableHead>Color Name</TableHead>
                      <TableHead>Size Name</TableHead>
                      <TableHead>Variant Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {variantsData.map((variant: any) => (
                      <TableRow key={variant.id}>
                        <TableCell className="font-medium">{variant.style_variant_id}</TableCell>
                        <TableCell>{variant.style_id}</TableCell>
                        <TableCell>
                          <Badge>{variant.color_name || variant.color_id}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{variant.size_name || variant.size_id}</Badge>
                        </TableCell>
                        <TableCell>{variant.variant_name || "-"}</TableCell>
                        <TableCell>
                          <Badge variant={variant.is_active ? "default" : "secondary"}>
                            {variant.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingVariant(variant);
                              setVariantDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteVariant(variant.style_variant_id)}
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
                  No variants found. Add colors and sizes first, then click "Auto-Generate".
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* STYLE CREATION DIALOG */}
      <StyleCreationDialog
        open={creationDialogOpen}
        onOpenChange={setCreationDialogOpen}
        editingStyle={editingCreation}
        buyers={buyersData || []}
        samples={samplesData || []}
        onSubmit={(data) => {
          if (editingCreation) {
            updateCreationMutation.mutate({ id: editingCreation.style_id, data });
          } else {
            createCreationMutation.mutate(data);
          }
        }}
        isLoading={createCreationMutation.isPending || updateCreationMutation.isPending}
      />

      {/* STYLE BASIC INFO DIALOG */}
      <StyleBasicInfoDialog
        open={basicInfoDialogOpen}
        onOpenChange={setBasicInfoDialogOpen}
        editingBasicInfo={editingBasicInfo}
        onSubmit={(data) => {
          if (editingBasicInfo) {
            updateBasicInfoMutation.mutate({ id: editingBasicInfo.style_id, data });
          } else {
            createBasicInfoMutation.mutate(data);
          }
        }}
        isLoading={createBasicInfoMutation.isPending || updateBasicInfoMutation.isPending}
      />

      {/* MATERIAL LINK DIALOG */}
      <MaterialLinkDialog
        open={materialLinkDialogOpen}
        onOpenChange={setMaterialLinkDialogOpen}
        editingMaterialLink={editingMaterialLink}
        yarns={yarnsData || []}
        fabrics={fabricsData || []}
        trims={trimsData || []}
        accessories={accessoriesData || []}
        onSubmit={(data) => {
          if (editingMaterialLink) {
            updateMaterialLinkMutation.mutate({ id: editingMaterialLink.style_material_id, data });
          } else {
            createMaterialLinkMutation.mutate(data);
          }
        }}
        isLoading={createMaterialLinkMutation.isPending || updateMaterialLinkMutation.isPending}
      />

      {/* STYLE COLOR DIALOG */}
      <StyleColorDialog
        open={colorDialogOpen}
        onOpenChange={setColorDialogOpen}
        editingColor={editingColor}
        styles={creationData || []}
        onSubmit={(data) => {
          if (editingColor) {
            updateColorMutation.mutate({ id: editingColor.id, data });
          } else {
            createColorMutation.mutate(data);
          }
        }}
        isLoading={createColorMutation.isPending || updateColorMutation.isPending}
      />

      {/* STYLE SIZE DIALOG */}
      <StyleSizeDialog
        open={sizeDialogOpen}
        onOpenChange={setSizeDialogOpen}
        editingSize={editingSize}
        styles={creationData || []}
        onSubmit={(data) => {
          if (editingSize) {
            updateSizeMutation.mutate({ id: editingSize.id, data });
          } else {
            createSizeMutation.mutate(data);
          }
        }}
        isLoading={createSizeMutation.isPending || updateSizeMutation.isPending}
      />

      {/* STYLE VARIANT DIALOG */}
      <StyleVariantDialog
        open={variantDialogOpen}
        onOpenChange={setVariantDialogOpen}
        editingVariant={editingVariant}
        styles={creationData || []}
        colors={colorsData || []}
        sizes={sizesData || []}
        onSubmit={(data) => {
          if (editingVariant) {
            updateVariantMutation.mutate({ id: editingVariant.style_variant_id, data });
          } else {
            createVariantMutation.mutate(data);
          }
        }}
        isLoading={createVariantMutation.isPending || updateVariantMutation.isPending}
      />
    </div>
  );
}

// ========== STYLE CREATION DIALOG ==========
function StyleCreationDialog({
  open,
  onOpenChange,
  editingStyle,
  buyers,
  samples,
  onSubmit,
  isLoading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingStyle: any;
  buyers: any[];
  samples: any[];
  onSubmit: (data: any) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    style_id: "",
    style_name: "",
    sample_id: "",
    buyer_id: "",
  });

  useEffect(() => {
    if (editingStyle) {
      setFormData({
        style_id: editingStyle.style_id || "",
        style_name: editingStyle.style_name || "",
        sample_id: editingStyle.sample_id || "",
        buyer_id: String(editingStyle.buyer_id || ""),
      });
    } else {
      setFormData({
        style_id: "",
        style_name: "",
        sample_id: "",
        buyer_id: "",
      });
    }
  }, [editingStyle, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Auto-generate style_id if not editing
    const submitData = {
      ...formData,
      style_id: formData.style_id || `STY-${Date.now()}`,
      buyer_id: parseInt(formData.buyer_id),
    };
    
    onSubmit(submitData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{editingStyle ? "Edit Style" : "Create New Style"}</DialogTitle>
          <DialogDescription>
            Create a production style from an approved sample
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="style_id">Style ID (Auto-generated)</Label>
              <Input
                id="style_id"
                value={formData.style_id}
                placeholder="Will be auto-generated"
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="style_name">
                Style Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="style_name"
                value={formData.style_name}
                onChange={(e) => setFormData({ ...formData, style_name: e.target.value })}
                required
                placeholder="e.g., Basic T-Shirt Style"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sample_id">Sample (Source)</Label>
              <Select
                value={formData.sample_id}
                onValueChange={(value) => setFormData({ ...formData, sample_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select sample" />
                </SelectTrigger>
                <SelectContent>
                  {samples.map((sample: any) => (
                    <SelectItem key={sample.id} value={String(sample.id)}>
                      {sample.sample_name} ({sample.sample_id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="buyer_id">
                Buyer <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.buyer_id}
                onValueChange={(value) => setFormData({ ...formData, buyer_id: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select buyer from Client Info" />
                </SelectTrigger>
                <SelectContent>
                  {buyers.map((buyer: any) => (
                    <SelectItem key={buyer.id} value={String(buyer.id)}>
                      {buyer.brand_name} - {buyer.company_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {editingStyle ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>{editingStyle ? "Update" : "Create"} Style</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ========== STYLE BASIC INFO DIALOG ==========
function StyleBasicInfoDialog({
  open,
  onOpenChange,
  editingBasicInfo,
  onSubmit,
  isLoading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingBasicInfo: any;
  onSubmit: (data: any) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    style_id: "",
    gauge: "",
    gender: "",
    age_group: "",
    product_type: "",
    product_category: "",
    specific_name: "",
  });

  useEffect(() => {
    if (editingBasicInfo) {
      setFormData({
        style_id: editingBasicInfo.style_id || "",
        gauge: editingBasicInfo.gauge || "",
        gender: editingBasicInfo.gender || "",
        age_group: editingBasicInfo.age_group || "",
        product_type: editingBasicInfo.product_type || "",
        product_category: editingBasicInfo.product_category || "",
        specific_name: editingBasicInfo.specific_name || "",
      });
    } else {
      setFormData({
        style_id: "",
        gauge: "",
        gender: "",
        age_group: "",
        product_type: "",
        product_category: "",
        specific_name: "",
      });
    }
  }, [editingBasicInfo, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Auto-generate style_id if not editing
    const submitData = {
      ...formData,
      style_id: formData.style_id || `STY-${Date.now()}`,
    };
    
    onSubmit(submitData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {editingBasicInfo ? "Edit Basic Info" : "Add Style Basic Info"}
          </DialogTitle>
          <DialogDescription>
            Detailed specifications and categorization for the style
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="style_id">Style ID</Label>
              <Input
                id="style_id"
                value={formData.style_id}
                onChange={(e) => setFormData({ ...formData, style_id: e.target.value })}
                placeholder="STY-XXXXX (auto-generated if empty)"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gauge">Gauge</Label>
              <Input
                id="gauge"
                value={formData.gauge}
                onChange={(e) => setFormData({ ...formData, gauge: e.target.value })}
                placeholder="e.g., 24"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select
                value={formData.gender}
                onValueChange={(value) => setFormData({ ...formData, gender: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Unisex">Unisex</SelectItem>
                  <SelectItem value="Kids">Kids</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="age_group">Age Group</Label>
              <Select
                value={formData.age_group}
                onValueChange={(value) => setFormData({ ...formData, age_group: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select age group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Adult">Adult</SelectItem>
                  <SelectItem value="Youth">Youth</SelectItem>
                  <SelectItem value="Kids">Kids</SelectItem>
                  <SelectItem value="Infant">Infant</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="product_type">Product Type</Label>
              <Select
                value={formData.product_type}
                onValueChange={(value) => setFormData({ ...formData, product_type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="T-Shirt">T-Shirt</SelectItem>
                  <SelectItem value="Polo">Polo</SelectItem>
                  <SelectItem value="Jacket">Jacket</SelectItem>
                  <SelectItem value="Pants">Pants</SelectItem>
                  <SelectItem value="Shorts">Shorts</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="product_category">Product Category</Label>
              <Input
                id="product_category"
                value={formData.product_category}
                onChange={(e) =>
                  setFormData({ ...formData, product_category: e.target.value })
                }
                placeholder="e.g., Basic, Premium"
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="specific_name">Specific Name</Label>
              <Input
                id="specific_name"
                value={formData.specific_name}
                onChange={(e) => setFormData({ ...formData, specific_name: e.target.value })}
                placeholder="e.g., Round Neck Basic Tee"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {editingBasicInfo ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>{editingBasicInfo ? "Update" : "Create"} Basic Info</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ========== MATERIAL LINK DIALOG ==========
function MaterialLinkDialog({
  open,
  onOpenChange,
  editingMaterialLink,
  yarns,
  fabrics,
  trims,
  accessories,
  onSubmit,
  isLoading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingMaterialLink: any;
  yarns: any[];
  fabrics: any[];
  trims: any[];
  accessories: any[];
  onSubmit: (data: any) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    style_material_id: "",
    style_id: "",
    material_type: "",
    material_id: "",
    material_name: "", // For display only, not sent to backend
  });

  useEffect(() => {
    if (editingMaterialLink) {
      setFormData({
        style_material_id: editingMaterialLink.style_material_id || "",
        style_id: editingMaterialLink.style_id || "",
        material_type: editingMaterialLink.material_type || "",
        material_id: editingMaterialLink.material_id || "",
        material_name: editingMaterialLink.material_name || "",
      });
    } else {
      setFormData({
        style_material_id: "",
        style_id: "",
        material_type: "",
        material_id: "",
        material_name: "",
      });
    }
  }, [editingMaterialLink, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prepare data for backend
    const submitData = {
      style_material_id: formData.style_material_id || `SM-${Date.now()}`,
      style_id: formData.style_id || `STY-${Date.now()}`,
      material_type: formData.material_type,
      material_id: formData.material_id,
      // Don't send material_name to backend
    };
    
    onSubmit(submitData);
  };

  // Get available materials based on selected type
  const getMaterialsList = () => {
    switch (formData.material_type) {
      case "Yarn":
        return yarns;
      case "Fabric":
        return fabrics;
      case "Trims":
        return trims;
      case "Accessories":
        return accessories;
      default:
        return [];
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {editingMaterialLink ? "Edit Material Link" : "Link Material to Style"}
          </DialogTitle>
          <DialogDescription>
            Add materials from inventory to create a Bill of Materials (BOM)
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="style_id">Style ID</Label>
              <Input
                id="style_id"
                value={formData.style_id}
                onChange={(e) => setFormData({ ...formData, style_id: e.target.value })}
                placeholder="STY-XXXXX (auto-generated if empty)"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="material_type">
                Material Type <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.material_type}
                onValueChange={(value) =>
                  setFormData({ ...formData, material_type: value, material_id: "" })
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select material type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Yarn">Yarn</SelectItem>
                  <SelectItem value="Fabric">Fabric</SelectItem>
                  <SelectItem value="Trims">Trims</SelectItem>
                  <SelectItem value="Accessories">Accessories</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="material_id">
                Material <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.material_id}
                onValueChange={(value) => {
                  const materialsList = getMaterialsList();
                  const selectedMaterial = materialsList.find(
                    (m: any) => String(m.id) === value
                  );
                  setFormData({
                    ...formData,
                    material_id: value,
                    material_name:
                      selectedMaterial?.yarn_name ||
                      selectedMaterial?.fabric_name ||
                      selectedMaterial?.product_name ||
                      "",
                  });
                }}
                required
                disabled={!formData.material_type}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select material" />
                </SelectTrigger>
                <SelectContent>
                  {getMaterialsList().map((material: any) => (
                    <SelectItem key={material.id} value={String(material.id)}>
                      {material.yarn_name ||
                        material.fabric_name ||
                        material.product_name}{" "}
                      - {material.yarn_id || material.fabric_id || material.product_id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="material_name">Material Name (Auto-filled)</Label>
              <Input
                id="material_name"
                value={formData.material_name}
                disabled
                placeholder="Auto-filled from selected material"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {editingMaterialLink ? "Updating..." : "Linking..."}
                </>
              ) : (
                <>{editingMaterialLink ? "Update" : "Link"} Material</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
