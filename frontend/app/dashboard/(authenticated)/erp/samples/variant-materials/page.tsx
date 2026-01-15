"use client";

import * as React from "react";
import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { PlusCircle, Edit, Trash2, Search, X, Check, ChevronsUpDown } from "lucide-react";
import { samplesService, api } from "@/services/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function StyleVariantMaterialsPage() {
  const [materials, setMaterials] = useState<any[]>([]);
  const [filteredMaterials, setFilteredMaterials] = useState<any[]>([]);
  const [styleVariants, setStyleVariants] = useState<any[]>([]);
  const [productMaster, setProductMaster] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ search: "" });

  const [variantOpen, setVariantOpen] = useState(false);
  const [variantSearch, setVariantSearch] = useState("");
  const [productOpen, setProductOpen] = useState(false);
  const [productSearch, setProductSearch] = useState("");

  const [formData, setFormData] = useState({
    style_variant_id: "",
    style_material_id: "",
    product_category: "",
    sub_category: "",
    product_id: "",
    product_name: "",
    required_quantity: "",
    uom: "",
    weight: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [materials, filters, styleVariants]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [materialsData, variantsData, productsData] = await Promise.all([
        samplesService.variantMaterials.getAll(),
        api.styleVariants.getAll().catch(() => []),
        api.materials.getAll().catch(() => []),
      ]);
      setMaterials(Array.isArray(materialsData) ? materialsData : []);
      setStyleVariants(Array.isArray(variantsData) ? variantsData : []);
      setProductMaster(Array.isArray(productsData) ? productsData : []);
    } catch (error) {
      console.error("Failed to load data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...materials];
    if (filters.search) {
      const s = filters.search.toLowerCase();
      filtered = filtered.filter((m) => {
        const variant = styleVariants.find((v) => v.id === m.style_variant_id);
        return variant?.variant_code?.toLowerCase().includes(s) ||
          m.product_name?.toLowerCase().includes(s) ||
          m.product_id?.toLowerCase().includes(s);
      });
    }
    setFilteredMaterials(filtered);
  };

  const filteredVariants = useMemo(() => {
    if (!variantSearch) return styleVariants;
    return styleVariants.filter((v) =>
      v.variant_code?.toLowerCase().includes(variantSearch.toLowerCase()) ||
      v.colour_name?.toLowerCase().includes(variantSearch.toLowerCase()) ||
      v.piece_name?.toLowerCase().includes(variantSearch.toLowerCase())
    );
  }, [styleVariants, variantSearch]);

  const filteredProducts = useMemo(() => {
    if (!productSearch) return productMaster;
    return productMaster.filter((p) =>
      p.material_id?.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.material_name?.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.category?.toLowerCase().includes(productSearch.toLowerCase())
    );
  }, [productMaster, productSearch]);

  const handleVariantSelect = (variantId: string) => {
    setFormData({ ...formData, style_variant_id: variantId });
    setVariantOpen(false);
  };

  const handleProductSelect = (productId: string) => {
    const product = productMaster.find((p) => p.id.toString() === productId);
    if (product) {
      // Calculate auto weight based on product weight and quantity
      const productWeight = product.weight_per_unit || 0;
      const qty = parseFloat(formData.required_quantity) || 0;
      const autoWeight = (productWeight * qty).toFixed(3);

      setFormData({
        ...formData,
        product_id: product.material_id || product.id.toString(),
        product_name: product.material_name || "",
        product_category: product.category || "",
        sub_category: product.sub_category || "",
        uom: product.uom || "",
        weight: autoWeight,
      });
    }
    setProductOpen(false);
  };

  const calculateWeight = (qty: string) => {
    const product = productMaster.find((p) => p.material_id === formData.product_id || p.id.toString() === formData.product_id);
    if (product && product.weight_per_unit) {
      const weight = (product.weight_per_unit * parseFloat(qty || "0")).toFixed(3);
      setFormData({ ...formData, required_quantity: qty, weight });
    } else {
      setFormData({ ...formData, required_quantity: qty });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        style_variant_id: parseInt(formData.style_variant_id),
        style_material_id: formData.style_material_id || null,
        product_category: formData.product_category || null,
        sub_category: formData.sub_category || null,
        product_id: formData.product_id || null,
        product_name: formData.product_name || null,
        required_quantity: formData.required_quantity ? parseFloat(formData.required_quantity) : null,
        uom: formData.uom || null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
      };

      if (editingItem) {
        await samplesService.variantMaterials.update(editingItem.id, data);
        toast.success("Material updated successfully");
      } else {
        await samplesService.variantMaterials.create(data);
        toast.success("Material added successfully");
      }

      setIsDialogOpen(false);
      resetForm();
      loadData();
    } catch (error: any) {
      toast.error(error?.message || "Failed to save material");
    }
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      style_variant_id: item.style_variant_id?.toString() || "",
      style_material_id: item.style_material_id || "",
      product_category: item.product_category || "",
      sub_category: item.sub_category || "",
      product_id: item.product_id || "",
      product_name: item.product_name || "",
      required_quantity: item.required_quantity?.toString() || "",
      uom: item.uom || "",
      weight: item.weight?.toString() || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this material?")) {
      try {
        await samplesService.variantMaterials.delete(id);
        toast.success("Material deleted successfully");
        loadData();
      } catch (error) {
        toast.error("Failed to delete material");
      }
    }
  };

  const resetForm = () => {
    setEditingItem(null);
    setFormData({
      style_variant_id: "", style_material_id: "", product_category: "",
      sub_category: "", product_id: "", product_name: "",
      required_quantity: "", uom: "", weight: "",
    });
    setVariantSearch("");
    setProductSearch("");
  };

  const getVariantInfo = (variantId: number) => styleVariants.find((v) => v.id === variantId);
  const selectedVariant = styleVariants.find((v) => v.id.toString() === formData.style_variant_id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Required Material (Style Variant)</h1>
          <p className="text-muted-foreground">Add materials required for each style variant with auto weight calculation</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button><PlusCircle className="mr-2 h-4 w-4" />Add Material</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingItem ? "Edit" : "Add"} Style Variant Material</DialogTitle>
              <DialogDescription>Add required material with auto weight calculation</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Style Variant Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Style Variant ID (Search & Select) *</Label>
                  <Popover open={variantOpen} onOpenChange={setVariantOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" role="combobox" className="w-full justify-between">
                        {selectedVariant ? `${selectedVariant.variant_code || selectedVariant.id} - ${selectedVariant.colour_name}` : "Search variant..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0">
                      <Command>
                        <CommandInput placeholder="Search variant..." value={variantSearch} onValueChange={setVariantSearch} />
                        <CommandList>
                          <CommandEmpty>No variant found.</CommandEmpty>
                          <CommandGroup>
                            {filteredVariants.map((v) => (
                              <CommandItem key={v.id} value={v.id.toString()} onSelect={() => handleVariantSelect(v.id.toString())}>
                                <Check className={cn("mr-2 h-4 w-4", formData.style_variant_id === v.id.toString() ? "opacity-100" : "opacity-0")} />
                                <span className="font-mono">{v.variant_code || v.id}</span>
                                <span className="mx-2">-</span>
                                <span>{v.colour_name} {v.piece_name && `(${v.piece_name})`}</span>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label>Style Material ID</Label>
                  <Input
                    value={formData.style_material_id}
                    onChange={(e) => setFormData({ ...formData, style_material_id: e.target.value })}
                    placeholder="Optional reference ID"
                  />
                </div>
              </div>

              {/* Product Selection */}
              <div className="space-y-2">
                <Label>Product ID (Search & Select) *</Label>
                <Popover open={productOpen} onOpenChange={setProductOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" className="w-full justify-between">
                      {formData.product_id ? `${formData.product_id} - ${formData.product_name}` : "Search & select product..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[500px] p-0">
                    <Command>
                      <CommandInput placeholder="Search product ID, name, category..." value={productSearch} onValueChange={setProductSearch} />
                      <CommandList>
                        <CommandEmpty>No product found.</CommandEmpty>
                        <CommandGroup>
                          {filteredProducts.map((p) => (
                            <CommandItem key={p.id} value={p.id.toString()} onSelect={() => handleProductSelect(p.id.toString())}>
                              <Check className={cn("mr-2 h-4 w-4", formData.product_id === (p.material_id || p.id.toString()) ? "opacity-100" : "opacity-0")} />
                              <span className="font-mono">{p.material_id || p.id}</span>
                              <span className="mx-2">-</span>
                              <span>{p.material_name}</span>
                              <span className="ml-2 text-muted-foreground">({p.uom})</span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Auto-filled fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Product Category</Label>
                  <Input value={formData.product_category} disabled className="bg-muted" />
                </div>
                <div className="space-y-2">
                  <Label>Sub-Category</Label>
                  <Input value={formData.sub_category} disabled className="bg-muted" />
                </div>
              </div>

              {/* Quantity, UOM, Weight */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Required Quantity *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.required_quantity}
                    onChange={(e) => calculateWeight(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>UoM</Label>
                  <Input value={formData.uom} disabled className="bg-muted" />
                </div>
                <div className="space-y-2">
                  <Label>Weight (Auto Calculated)</Label>
                  <Input
                    value={formData.weight}
                    disabled
                    className="bg-muted font-medium"
                    placeholder="Auto-calculated"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit">{editingItem ? "Update" : "Add"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by Variant ID, Product..." value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} className="pl-9" />
          </div>
          <Button variant="outline" size="icon" onClick={() => setFilters({ search: "" })}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="mt-2 text-sm text-muted-foreground">
          Showing {filteredMaterials.length} of {materials.length} materials
        </div>
      </Card>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Style Variant ID</TableHead>
              <TableHead>Style Material ID</TableHead>
              <TableHead>Product Category</TableHead>
              <TableHead>Sub-Category</TableHead>
              <TableHead>Product ID</TableHead>
              <TableHead>Product Name</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead>UoM</TableHead>
              <TableHead>Weight</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMaterials.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center text-muted-foreground">
                  {loading ? "Loading..." : "No materials found"}
                </TableCell>
              </TableRow>
            ) : (
              filteredMaterials.map((item) => {
                const variant = getVariantInfo(item.style_variant_id);
                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono">{variant?.variant_code || item.style_variant_id}</TableCell>
                    <TableCell>{item.style_material_id || "-"}</TableCell>
                    <TableCell>{item.product_category || "-"}</TableCell>
                    <TableCell>{item.sub_category || "-"}</TableCell>
                    <TableCell className="font-mono">{item.product_id || "-"}</TableCell>
                    <TableCell>{item.product_name || "-"}</TableCell>
                    <TableCell>{item.required_quantity || "-"}</TableCell>
                    <TableCell>{item.uom || "-"}</TableCell>
                    <TableCell className="font-medium">{item.weight || "-"}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
