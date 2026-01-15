"use client";

import * as React from "react";
import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { PlusCircle, Edit, Trash2, Search, X, Check, ChevronsUpDown, Plus } from "lucide-react";
import { samplesService, api } from "@/services/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const MATERIAL_CATEGORIES = [
  { id: "yarn", label: "Yarn", idField: "yarn_id", nameField: "yarn_name" },
  { id: "fabric", label: "Fabric", idField: "fabric_id", nameField: "fabric_name" },
  { id: "trims", label: "Trims", idField: "product_id", nameField: "product_name" },
  { id: "accessories", label: "Accessories", idField: "product_id", nameField: "product_name" },
  { id: "finished_goods", label: "Finished Goods", idField: "product_id", nameField: "product_name" },
  { id: "packing_goods", label: "Packing Goods", idField: "product_id", nameField: "product_name" },
];

interface MaterialEntry {
  id: string;
  category: string;
  product_id: string;
  product_db_id: number;
  product_name: string;
  sub_category: string;
  required_quantity: string;
  uom: string;
}

export default function SampleRequiredMaterialPage() {
  const [materials, setMaterials] = useState<any[]>([]);
  const [filteredMaterials, setFilteredMaterials] = useState<any[]>([]);
  const [sampleRequests, setSampleRequests] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ search: "" });

  const [sampleOpen, setSampleOpen] = useState(false);
  const [sampleSearch, setSampleSearch] = useState("");
  const [selectedSampleId, setSelectedSampleId] = useState("");

  // Category checkboxes
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Material entries for each category
  const [materialEntries, setMaterialEntries] = useState<MaterialEntry[]>([]);

  // Product selection popovers
  const [openPopovers, setOpenPopovers] = useState<Record<string, boolean>>({});
  const [productSearches, setProductSearches] = useState<Record<string, string>>({});

  // Products loaded from each category endpoint
  const [categoryProducts, setCategoryProducts] = useState<Record<string, any[]>>({
    yarn: [],
    fabric: [],
    trims: [],
    accessories: [],
    finished_goods: [],
    packing_goods: [],
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [materials, filters, sampleRequests]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [materialsData, requestsData] = await Promise.all([
        samplesService.sampleMaterials.getAll(),
        samplesService.requests.getAll(),
      ]);
      setMaterials(Array.isArray(materialsData) ? materialsData : []);
      setSampleRequests(Array.isArray(requestsData) ? requestsData : []);
    } catch (error) {
      console.error("Failed to load data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  // Load products for a specific category when checkbox is selected
  const loadCategoryProducts = async (categoryId: string) => {
    try {
      let products: any[] = [];
      switch (categoryId) {
        case "yarn":
          products = await api.merchandiser.yarn.getAll().catch(() => []);
          break;
        case "fabric":
          products = await api.merchandiser.fabric.getAll().catch(() => []);
          break;
        case "trims":
          products = await api.merchandiser.trims.getAll().catch(() => []);
          break;
        case "accessories":
          products = await api.merchandiser.accessories.getAll().catch(() => []);
          break;
        case "finished_goods":
          products = await api.merchandiser.finishedGood.getAll().catch(() => []);
          break;
        case "packing_goods":
          products = await api.merchandiser.packingGood.getAll().catch(() => []);
          break;
      }
      setCategoryProducts((prev) => ({
        ...prev,
        [categoryId]: Array.isArray(products) ? products : [],
      }));
    } catch (error) {
      console.error(`Failed to load ${categoryId} products:`, error);
    }
  };

  const applyFilters = () => {
    let filtered = [...materials];
    if (filters.search) {
      const s = filters.search.toLowerCase();
      filtered = filtered.filter((m) => {
        const request = sampleRequests.find((r) => r.id === m.sample_request_id);
        return request?.sample_id?.toLowerCase().includes(s) ||
          request?.sample_name?.toLowerCase().includes(s) ||
          m.product_name?.toLowerCase().includes(s) ||
          m.product_id?.toLowerCase().includes(s);
      });
    }
    setFilteredMaterials(filtered);
  };

  const filteredSamples = useMemo(() => {
    if (!sampleSearch) return sampleRequests;
    return sampleRequests.filter((r) =>
      r.sample_id?.toLowerCase().includes(sampleSearch.toLowerCase()) ||
      r.sample_name?.toLowerCase().includes(sampleSearch.toLowerCase()) ||
      r.buyer_name?.toLowerCase().includes(sampleSearch.toLowerCase())
    );
  }, [sampleRequests, sampleSearch]);

  // Get products for a category with search filtering
  const getFilteredProducts = (categoryId: string, searchTerm: string) => {
    const products = categoryProducts[categoryId] || [];
    const categoryConfig = MATERIAL_CATEGORIES.find((c) => c.id === categoryId);

    if (!searchTerm) return products;

    return products.filter((p) => {
      const idField = categoryConfig?.idField || "product_id";
      const nameField = categoryConfig?.nameField || "product_name";
      return p[idField]?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p[nameField]?.toLowerCase().includes(searchTerm.toLowerCase());
    });
  };

  const handleSampleSelect = (requestId: string) => {
    setSelectedSampleId(requestId);
    setSampleOpen(false);
  };

  const handleCategoryToggle = async (categoryId: string) => {
    if (selectedCategories.includes(categoryId)) {
      // Remove category and its entries
      setMaterialEntries((entries) => entries.filter((e) => e.category !== categoryId));
      setSelectedCategories((prev) => prev.filter((c) => c !== categoryId));
    } else {
      // Load products for this category if not already loaded
      if (categoryProducts[categoryId].length === 0) {
        await loadCategoryProducts(categoryId);
      }

      // Add category with one empty entry
      const newEntry: MaterialEntry = {
        id: `${categoryId}-${Date.now()}`,
        category: categoryId,
        product_id: "",
        product_db_id: 0,
        product_name: "",
        sub_category: "",
        required_quantity: "",
        uom: "",
      };
      setMaterialEntries((entries) => [...entries, newEntry]);
      setSelectedCategories((prev) => [...prev, categoryId]);
    }
  };

  const handleSelectAll = async (checked: boolean) => {
    if (checked) {
      const allCategoryIds = MATERIAL_CATEGORIES.map((c) => c.id);
      setSelectedCategories(allCategoryIds);

      // Load all category products
      await Promise.all(allCategoryIds.map((id) => loadCategoryProducts(id)));

      // Add one entry for each category
      const newEntries = allCategoryIds.map((categoryId) => ({
        id: `${categoryId}-${Date.now()}`,
        category: categoryId,
        product_id: "",
        product_db_id: 0,
        product_name: "",
        sub_category: "",
        required_quantity: "",
        uom: "",
      }));
      setMaterialEntries(newEntries);
    } else {
      setSelectedCategories([]);
      setMaterialEntries([]);
    }
  };

  const handleProductSelect = (entryId: string, categoryId: string, productDbId: string) => {
    const products = categoryProducts[categoryId] || [];
    const product = products.find((p) => p.id.toString() === productDbId);
    const categoryConfig = MATERIAL_CATEGORIES.find((c) => c.id === categoryId);

    if (product && categoryConfig) {
      const idField = categoryConfig.idField;
      const nameField = categoryConfig.nameField;

      setMaterialEntries((entries) =>
        entries.map((entry) =>
          entry.id === entryId
            ? {
                ...entry,
                product_db_id: product.id,
                product_id: product[idField] || product.id.toString(),
                product_name: product[nameField] || "",
                sub_category: product.sub_category || product.category || "",
                uom: product.uom || product.unit || "",
              }
            : entry
        )
      );
    }
    setOpenPopovers((prev) => ({ ...prev, [entryId]: false }));
  };

  const handleQuantityChange = (entryId: string, quantity: string) => {
    setMaterialEntries((entries) =>
      entries.map((entry) =>
        entry.id === entryId ? { ...entry, required_quantity: quantity } : entry
      )
    );
  };

  const addMaterialEntry = async (category: string) => {
    // Ensure products are loaded
    if (categoryProducts[category].length === 0) {
      await loadCategoryProducts(category);
    }

    const newEntry: MaterialEntry = {
      id: `${category}-${Date.now()}`,
      category,
      product_id: "",
      product_db_id: 0,
      product_name: "",
      sub_category: "",
      required_quantity: "",
      uom: "",
    };
    setMaterialEntries((entries) => [...entries, newEntry]);
  };

  const removeMaterialEntry = (entryId: string) => {
    setMaterialEntries((entries) => entries.filter((e) => e.id !== entryId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedSampleId) {
      toast.error("Please select a sample");
      return;
    }

    const validEntries = materialEntries.filter((e) => e.product_id && e.required_quantity);
    if (validEntries.length === 0) {
      toast.error("Please add at least one material with quantity");
      return;
    }

    try {
      // Save all material entries
      for (const entry of validEntries) {
        const data = {
          sample_request_id: parseInt(selectedSampleId),
          product_category: MATERIAL_CATEGORIES.find((c) => c.id === entry.category)?.label || entry.category,
          product_id: entry.product_id,
          product_name: entry.product_name,
          category: entry.category,
          sub_category: entry.sub_category,
          required_quantity: parseFloat(entry.required_quantity),
          uom: entry.uom,
          remarks: null,
        };

        if (editingItem) {
          await samplesService.sampleMaterials.update(editingItem.id, data);
        } else {
          await samplesService.sampleMaterials.create(data);
        }
      }

      toast.success(`${validEntries.length} material(s) added successfully`);
      setIsDialogOpen(false);
      resetForm();
      loadData();
    } catch (error: any) {
      toast.error(error?.message || "Failed to save materials");
    }
  };

  const handleEdit = async (item: any) => {
    setEditingItem(item);
    setSelectedSampleId(item.sample_request_id?.toString() || "");

    // Set the category based on the item
    const categoryId = item.category || "yarn";
    setSelectedCategories([categoryId]);

    // Load products for this category
    await loadCategoryProducts(categoryId);

    setMaterialEntries([{
      id: `edit-${item.id}`,
      category: categoryId,
      product_id: item.product_id || "",
      product_db_id: 0,
      product_name: item.product_name || "",
      sub_category: item.sub_category || "",
      required_quantity: item.required_quantity?.toString() || "",
      uom: item.uom || "",
    }]);

    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this material?")) {
      try {
        await samplesService.sampleMaterials.delete(id);
        toast.success("Material deleted successfully");
        loadData();
      } catch (error) {
        toast.error("Failed to delete material");
      }
    }
  };

  const resetForm = () => {
    setEditingItem(null);
    setSelectedSampleId("");
    setSelectedCategories([]);
    setMaterialEntries([]);
    setSampleSearch("");
    setProductSearches({});
    setOpenPopovers({});
  };

  const getRequestInfo = (requestId: number) => sampleRequests.find((r) => r.id === requestId);
  const selectedRequest = sampleRequests.find((r) => r.id.toString() === selectedSampleId);

  const getCategoryLabel = (categoryId: string) => {
    return MATERIAL_CATEGORIES.find((c) => c.id === categoryId)?.label || categoryId;
  };

  const getCategoryConfig = (categoryId: string) => {
    return MATERIAL_CATEGORIES.find((c) => c.id === categoryId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Add Sample Material</h1>
          <p className="text-muted-foreground">Add materials required for each sample from Material Details</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button><PlusCircle className="mr-2 h-4 w-4" />Add Material</Button>
          </DialogTrigger>
          <DialogContent 
            className="max-h-[90vh] overflow-y-auto !p-6" 
            style={{ 
              maxWidth: 'calc(100vw - 4rem)', 
              width: 'calc(100vw - 4rem)',
              minWidth: '1400px'
            }}
          >
            <DialogHeader>
              <DialogTitle>{editingItem ? "Edit" : "Add"} Sample Material</DialogTitle>
              <DialogDescription>Select material categories and add products from Material Details</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Sample Selection */}
              <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(5, minmax(0, 1fr))' }}>
                <div className="col-span-3 space-y-2">
                  <Label className="text-sm font-medium">Sample ID *</Label>
                  <Popover open={sampleOpen} onOpenChange={setSampleOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" role="combobox" className="w-full justify-between h-10">
                        {selectedRequest ? `${selectedRequest.sample_id} - ${selectedRequest.sample_name}` : "Search & select sample..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[500px] p-0">
                      <Command>
                        <CommandInput placeholder="Search sample..." value={sampleSearch} onValueChange={setSampleSearch} />
                        <CommandList>
                          <CommandEmpty>No sample found.</CommandEmpty>
                          <CommandGroup>
                            {filteredSamples.map((r) => (
                              <CommandItem key={r.id} value={r.id.toString()} onSelect={() => handleSampleSelect(r.id.toString())}>
                                <Check className={cn("mr-2 h-4 w-4", selectedSampleId === r.id.toString() ? "opacity-100" : "opacity-0")} />
                                <span className="font-mono">{r.sample_id}</span>
                                <span className="mx-2">-</span>
                                <span>{r.sample_name}</span>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="col-span-2 space-y-2">
                  <Label className="text-sm font-medium">Buyer Name</Label>
                  <Input value={selectedRequest?.buyer_name || ""} disabled className="bg-muted h-10" />
                </div>
              </div>

              {/* Category Checkboxes */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Select Material Categories</Label>
                <div className="flex flex-wrap gap-4 p-4 border rounded-lg bg-muted/30">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="select-all"
                      checked={selectedCategories.length === MATERIAL_CATEGORIES.length}
                      onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
                    />
                    <label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
                      Select All
                    </label>
                  </div>
                  <div className="w-px h-6 bg-border" />
                  {MATERIAL_CATEGORIES.map((category) => (
                    <div key={category.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={category.id}
                        checked={selectedCategories.includes(category.id)}
                        onCheckedChange={() => handleCategoryToggle(category.id)}
                      />
                      <label htmlFor={category.id} className="text-sm font-medium cursor-pointer">
                        {category.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Material Entries by Category */}
              {selectedCategories.length > 0 && (
                <div className="space-y-4">
                  {selectedCategories.map((categoryId) => {
                    const categoryEntries = materialEntries.filter((e) => e.category === categoryId);
                    const categoryLabel = getCategoryLabel(categoryId);
                    const categoryConfig = getCategoryConfig(categoryId);
                    const products = categoryProducts[categoryId] || [];

                    return (
                      <Card key={categoryId} className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-lg">{categoryLabel}</h4>
                            <p className="text-xs text-muted-foreground">{products.length} items available</p>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addMaterialEntry(categoryId)}
                          >
                            <Plus className="h-4 w-4 mr-1" /> Add {categoryLabel}
                          </Button>
                        </div>

                        {categoryEntries.map((entry) => (
                          <div key={entry.id} className="grid grid-cols-12 gap-3 mb-3 p-3 bg-background border rounded-md items-end">
                            {/* Product Selection */}
                            <div className="col-span-3 space-y-2">
                              <Label className="text-sm font-medium">{categoryLabel} ID</Label>
                              <Popover
                                open={openPopovers[entry.id] || false}
                                onOpenChange={(open) => setOpenPopovers((prev) => ({ ...prev, [entry.id]: open }))}
                              >
                                <PopoverTrigger asChild>
                                  <Button variant="outline" role="combobox" className="w-full justify-between h-10">
                                    {entry.product_id ? `${entry.product_id}` : `Select ${categoryLabel}...`}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[400px] p-0">
                                  <Command>
                                    <CommandInput
                                      placeholder={`Search ${categoryLabel}...`}
                                      value={productSearches[entry.id] || ""}
                                      onValueChange={(v) => setProductSearches((prev) => ({ ...prev, [entry.id]: v }))}
                                    />
                                    <CommandList>
                                      <CommandEmpty>No {categoryLabel.toLowerCase()} found in Material Details. Add them first in Merchandising.</CommandEmpty>
                                      <CommandGroup>
                                        {getFilteredProducts(categoryId, productSearches[entry.id] || "").map((p) => {
                                          const idField = categoryConfig?.idField || "product_id";
                                          const nameField = categoryConfig?.nameField || "product_name";
                                          return (
                                            <CommandItem
                                              key={p.id}
                                              value={p.id.toString()}
                                              onSelect={() => handleProductSelect(entry.id, categoryId, p.id.toString())}
                                            >
                                              <Check className={cn("mr-2 h-4 w-4", entry.product_db_id === p.id ? "opacity-100" : "opacity-0")} />
                                              <span className="font-mono">{p[idField]}</span>
                                              <span className="mx-2">-</span>
                                              <span>{p[nameField]}</span>
                                              <Badge variant="outline" className="ml-2 text-xs">{p.uom || p.unit || "-"}</Badge>
                                            </CommandItem>
                                          );
                                        })}
                                      </CommandGroup>
                                    </CommandList>
                                  </Command>
                                </PopoverContent>
                              </Popover>
                            </div>

                            {/* Product Name (auto-filled) */}
                            <div className="col-span-4 space-y-2">
                              <Label className="text-sm font-medium">Product Name</Label>
                              <Input value={entry.product_name} disabled className="bg-muted h-10" />
                            </div>

                            {/* Sub-Category (auto-filled) */}
                            <div className="col-span-2 space-y-2">
                              <Label className="text-sm font-medium">Sub-Category</Label>
                              <Input value={entry.sub_category} disabled className="bg-muted h-10" />
                            </div>

                            {/* Required Quantity */}
                            <div className="col-span-1 space-y-2">
                              <Label className="text-sm font-medium">Qty *</Label>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                value={entry.required_quantity}
                                onChange={(e) => handleQuantityChange(entry.id, e.target.value)}
                                className="h-10"
                              />
                            </div>

                            {/* UoM (auto-filled) */}
                            <div className="col-span-1 space-y-2">
                              <Label className="text-sm font-medium">UoM</Label>
                              <Input value={entry.uom} disabled className="bg-muted h-10" />
                            </div>

                            {/* Remove Button */}
                            <div className="col-span-1">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeMaterialEntry(entry.id)}
                                className="text-destructive h-10"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}

                        {categoryEntries.length === 0 && (
                          <p className="text-sm text-muted-foreground">No {categoryLabel.toLowerCase()} added yet. Click the button above to add.</p>
                        )}
                      </Card>
                    );
                  })}
                </div>
              )}

              {selectedCategories.length === 0 && (
                <div className="text-center py-8 text-muted-foreground border rounded-lg border-dashed">
                  Select one or more material categories above to add products
                </div>
              )}

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={materialEntries.filter((e) => e.product_id && e.required_quantity).length === 0}>
                  {editingItem ? "Update" : `Add ${materialEntries.filter((e) => e.product_id && e.required_quantity).length} Material(s)`}
                </Button>
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
            <Input placeholder="Search by Sample ID, Product..." value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} className="pl-9" />
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
              <TableHead>Sample ID</TableHead>
              <TableHead>Sample Name</TableHead>
              <TableHead>Buyer</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Product ID</TableHead>
              <TableHead>Product Name</TableHead>
              <TableHead>Sub-Category</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead>UoM</TableHead>
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
                const request = getRequestInfo(item.sample_request_id);
                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono">{request?.sample_id || "-"}</TableCell>
                    <TableCell>{request?.sample_name || "-"}</TableCell>
                    <TableCell>{request?.buyer_name || "-"}</TableCell>
                    <TableCell><Badge variant="outline">{item.product_category || item.category || "-"}</Badge></TableCell>
                    <TableCell className="font-mono">{item.product_id || "-"}</TableCell>
                    <TableCell>{item.product_name || "-"}</TableCell>
                    <TableCell>{item.sub_category || "-"}</TableCell>
                    <TableCell>{item.required_quantity || "-"}</TableCell>
                    <TableCell>{item.uom || "-"}</TableCell>
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
