"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { PlusCircle, Edit, Trash2, Search, X, Check, ChevronsUpDown } from "lucide-react";
import { ExportButton } from "@/components/export-button";
import type { ExportColumn } from "@/lib/export-utils";
import { toast } from "sonner";
import { api } from "@/services/api";
import { Card } from "@/components/ui/card";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { UoMSelector } from "@/components/uom/uom-selector";

export default function AddMaterialPage() {
  const [materials, setMaterials] = useState<any[]>([]);
  const [filteredMaterials, setFilteredMaterials] = useState<any[]>([]);
  const [displayedMaterials, setDisplayedMaterials] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<any>(null);
  const [rowLimit, setRowLimit] = useState<number | "all">(50);
  const [filters, setFilters] = useState({
    search: "",
    category: "",
  });
  const [formData, setFormData] = useState({
    material_name: "",
    uom: "",
    material_category: "",
    description: "",
  });
  const [openCategoryPopover, setOpenCategoryPopover] = useState(false);
  const [categorySearchValue, setCategorySearchValue] = useState("");

  useEffect(() => {
    loadMaterials();
  }, []);

  const loadMaterials = async () => {
    try {
      const data = await api.materials.getAll();
      setMaterials(data);
    } catch (error) {
      toast.error("Failed to load materials");
      console.error(error);
    }
  };

  // Apply filters
  useEffect(() => {
    let result = materials;

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (m: any) =>
          m.material_name?.toLowerCase().includes(searchLower) ||
          m.uom?.toLowerCase().includes(searchLower) ||
          m.material_category?.toLowerCase().includes(searchLower)
      );
    }

    // Category filter
    if (filters.category && filters.category !== "all") {
      result = result.filter((m: any) => m.material_category === filters.category);
    }

    setFilteredMaterials(result);
  }, [materials, filters]);

  // Apply row limit
  useEffect(() => {
    if (rowLimit === "all") {
      setDisplayedMaterials(filteredMaterials);
    } else {
      setDisplayedMaterials(filteredMaterials.slice(0, rowLimit));
    }
  }, [filteredMaterials, rowLimit]);

  const clearFilters = () => setFilters({ search: "", category: "" });

  const uniqueCategories = [
    ...new Set(materials.map((m: any) => m.material_category).filter(Boolean)),
  ].sort();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingMaterial) {
        await api.materials.update(editingMaterial.id, formData);
        toast.success("Material updated successfully");
      } else {
        await api.materials.create(formData);
        toast.success("Material created successfully");
      }
      setIsDialogOpen(false);
      resetForm();
      loadMaterials();
    } catch (error: any) {
      toast.error(error.message || "Failed to save material");
      console.error(error);
    }
  };

  const handleEdit = (material: any) => {
    setEditingMaterial(material);
    setFormData(material);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this material?")) {
      try {
        await api.materials.delete(id);
        toast.success("Material deleted successfully");
        loadMaterials();
      } catch (error) {
        toast.error("Failed to delete material");
        console.error(error);
      }
    }
  };

  const resetForm = () => {
    setEditingMaterial(null);
    setFormData({
      material_name: "",
      uom: "",
      material_category: "",
      description: "",
    });
    setOpenCategoryPopover(false);
    setCategorySearchValue("");
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  // Export columns configuration
  const exportColumns: ExportColumn[] = [
    { key: "material_name", header: "Material Name" },
    { key: "uom", header: "UOM" },
    { key: "material_category", header: "Category" },
    { key: "description", header: "Description" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Material Master</h1>
          <p className="text-muted-foreground">
            Manage material information for required materials
          </p>
        </div>
        <div className="flex gap-2">
          <ExportButton
            data={filteredMaterials}
            columns={exportColumns}
            filename="materials"
            sheetName="Materials"
          />
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <Button onClick={() => setIsDialogOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Material
            </Button>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingMaterial ? "Edit Material" : "Add New Material"}
              </DialogTitle>
              <DialogDescription>
                {editingMaterial
                  ? "Update material information"
                  : "Enter material details to add to the system"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="material_name">Material Name *</Label>
                    <Input
                      id="material_name"
                      value={formData.material_name}
                      onChange={(e) =>
                        setFormData({ ...formData, material_name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="uom">UOM (Unit of Measurement) *</Label>
                    <UoMSelector
                      value={formData.uom}
                      onChange={(value) => setFormData({ ...formData, uom: value })}
                      placeholder="Select UOM"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="material_category">Material Category</Label>
                    <Popover open={openCategoryPopover} onOpenChange={setOpenCategoryPopover}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={openCategoryPopover}
                          className="w-full justify-between"
                        >
                          {formData.material_category || "Search and select category..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput
                            placeholder="Search category..."
                            value={categorySearchValue}
                            onValueChange={setCategorySearchValue}
                          />
                          <CommandList>
                            <CommandEmpty>
                              <div className="p-2">
                                <p className="text-sm text-muted-foreground mb-2">No category found.</p>
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    if (categorySearchValue.trim()) {
                                      setFormData({ ...formData, material_category: categorySearchValue.trim() });
                                      setOpenCategoryPopover(false);
                                      setCategorySearchValue("");
                                      toast.success(`New category "${categorySearchValue.trim()}" will be saved`);
                                    }
                                  }}
                                  className="w-full"
                                >
                                  Add &quot;{categorySearchValue}&quot;
                                </Button>
                              </div>
                            </CommandEmpty>
                            <CommandGroup>
                              {uniqueCategories.map((category: string) => (
                                <CommandItem
                                  key={category}
                                  value={category}
                                  onSelect={() => {
                                    setFormData({ ...formData, material_category: category });
                                    setOpenCategoryPopover(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      formData.material_category === category ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  {category}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingMaterial ? "Update" : "Create"} Material
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search materials..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-9"
              />
            </div>
          </div>
          <Select
            value={filters.category}
            onValueChange={(value) => setFilters({ ...filters, category: value })}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {uniqueCategories.map((category: string) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={rowLimit.toString()}
            onValueChange={(value) =>
              setRowLimit(value === "all" ? "all" : parseInt(value))
            }
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">Show 10</SelectItem>
              <SelectItem value="25">Show 25</SelectItem>
              <SelectItem value="50">Show 50</SelectItem>
              <SelectItem value="all">Show All</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            onClick={clearFilters}
            title="Clear filters"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="mt-2 text-sm text-muted-foreground">
          Showing {displayedMaterials.length} of {filteredMaterials.length} filtered (
          {materials.length} total) materials
        </div>
      </Card>

      {/* Table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Material Name</TableHead>
              <TableHead>UOM</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayedMaterials.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  {materials.length === 0
                    ? "No materials found. Add your first material to get started."
                    : "No materials match your filters. Try adjusting your search criteria."}
                </TableCell>
              </TableRow>
            ) : (
              displayedMaterials.map((material: any) => (
                <TableRow key={material.id}>
                  <TableCell className="font-medium">
                    {material.material_name}
                  </TableCell>
                  <TableCell>{material.uom}</TableCell>
                  <TableCell>{material.material_category || "-"}</TableCell>
                  <TableCell>{material.description || "-"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(material)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(material.id)}
                      >
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
    </div>
  );
}
