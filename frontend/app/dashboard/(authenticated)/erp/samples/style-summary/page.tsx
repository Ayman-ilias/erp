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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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
import { PlusCircle, Edit, Trash2, Search, X } from "lucide-react";
import { ExportButton } from "@/components/export-button";
import type { ExportColumn } from "@/lib/export-utils";
import { api } from "@/services/api";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateTimeWithFallback, generateStyleId } from "@/services/utils";

export default function StyleSummaryPage() {
  const [styles, setStyles] = useState<any[]>([]);
  const [filteredStyles, setFilteredStyles] = useState<any[]>([]);
  const [buyers, setBuyers] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<any>(null);
  const [editingStyle, setEditingStyle] = useState<any>(null);
  const [filters, setFilters] = useState({
    search: "",
    buyer: "",
    gauge: "",
    category: "",
  });
  const [formData, setFormData] = useState({
    buyer_id: 0,
    style_name: "",
    style_id: "",
    product_category: "",
    product_type: "",
    customs_customer_group: "",
    type_of_construction: "",
    gauge: "",
    is_set: false,
    set_piece_count: null as number | null,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [stylesData, buyersData] = await Promise.all([
        api.styles.getAll(),
        api.buyers.getAll(),
      ]);
      setStyles(stylesData);
      setFilteredStyles(stylesData);
      setBuyers(buyersData);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load data");
    }
  };

  // Apply filters
  useEffect(() => {
    let result = [...styles];

    // Search filter
    if (filters.search && filters.search !== "all") {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (s: any) =>
          s.style_name?.toLowerCase().includes(searchLower) ||
          s.style_id?.toLowerCase().includes(searchLower) ||
          s.product_category?.toLowerCase().includes(searchLower)
      );
    }

    // Buyer filter
    if (filters.buyer && filters.buyer !== "all") {
      result = result.filter((s: any) => s.buyer_id.toString() === filters.buyer);
    }

    // Gauge filter
    if (filters.gauge && filters.gauge !== "all") {
      result = result.filter((s: any) => s.gauge === filters.gauge);
    }

    // Category filter
    if (filters.category && filters.category !== "all") {
      result = result.filter((s: any) => s.product_category === filters.category);
    }

    setFilteredStyles(result);
  }, [styles, filters]);

  const clearFilters = () => {
    setFilters({ search: "", buyer: "", gauge: "", category: "" });
  };

  const uniqueGauges = [...new Set(styles.map((s: any) => s.gauge).filter(Boolean))].sort();
  const uniqueCategories = [...new Set(styles.map((s: any) => s.product_category).filter(Boolean))].sort();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submitData = { ...formData };

      // Generate Style ID if empty
      if (!submitData.style_id) {
        submitData.style_id = await generateStyleId(submitData.style_name);
      }

      if (editingStyle) {
        await api.styles.update(editingStyle.id, submitData);
        toast.success("Style summary updated successfully");
      } else {
        await api.styles.create(submitData);
        toast.success("Style summary created successfully");
      }
      setIsDialogOpen(false);
      resetForm();
      loadData();
    } catch (error) {
      toast.error("Failed to save style summary");
      console.error(error);
    }
  };

  const handleEdit = (style: any) => {
    setEditingStyle(style);
    setFormData({
      buyer_id: style.buyer_id,
      style_name: style.style_name,
      style_id: style.style_id,
      product_category: style.product_category || "",
      product_type: style.product_type || "",
      customs_customer_group: style.customs_customer_group || "",
      type_of_construction: style.type_of_construction || "",
      gauge: style.gauge || "",
      is_set: style.is_set || false,
      set_piece_count: style.set_piece_count || null,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this style summary?")) {
      try {
        await api.styles.delete(id);
        toast.success("Style summary deleted successfully");
        loadData();
      } catch (error: any) {
        const errorMessage = error.message || "Failed to delete style summary";
        toast.error(errorMessage);
        console.error(error);
      }
    }
  };

  const resetForm = () => {
    setEditingStyle(null);
    setFormData({
      buyer_id: 0,
      style_name: "",
      style_id: "",
      product_category: "",
      product_type: "",
      customs_customer_group: "",
      type_of_construction: "",
      gauge: "",
      is_set: false,
      set_piece_count: null,
    });
  };

  // Export columns configuration
  const exportColumns: ExportColumn[] = [
    { key: "buyer_id", header: "Buyer", transform: (value) => buyers.find((b: any) => b.id === value)?.buyer_name || "-" },
    { key: "style_name", header: "Style Name" },
    { key: "style_id", header: "Style ID" },
    { key: "product_category", header: "Product Category" },
    { key: "product_type", header: "Product Type" },
    { key: "customs_customer_group", header: "Customs Customer Group" },
    { key: "type_of_construction", header: "Type of Construction" },
    { key: "gauge", header: "Gauge" },
    { key: "is_set", header: "Is Set", transform: (value) => value ? "Yes" : "No" },
    { key: "set_piece_count", header: "Set Piece Count" },
    { key: "created_at", header: "Created At", transform: (value) => formatDateTimeWithFallback(value) },
    { key: "updated_at", header: "Updated At", transform: (value) => formatDateTimeWithFallback(value) },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Style Summary</h1>
          <p className="text-muted-foreground">
            Manage style summaries and their specifications
          </p>
        </div>
        <div className="flex gap-2">
          <ExportButton
            data={filteredStyles}
            columns={exportColumns}
            filename="style-summary"
            sheetName="Style Summary"
          />
          <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Style Summary
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingStyle ? "Edit Style Summary" : "Add New Style Summary"}
              </DialogTitle>
              <DialogDescription>
                {editingStyle
                  ? "Update style summary information"
                  : "Enter style summary details"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="buyer">Buyer *</Label>
                  <Select
                    value={formData.buyer_id.toString()}
                    onValueChange={(value) =>
                      setFormData({ ...formData, buyer_id: parseInt(value) })
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a buyer" />
                    </SelectTrigger>
                    <SelectContent>
                      {buyers.map((buyer: any) => (
                        <SelectItem key={buyer.id} value={buyer.id.toString()}>
                          {buyer.buyer_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="style_name">Style Name *</Label>
                    <Input
                      id="style_name"
                      required
                      value={formData.style_name}
                      onChange={(e) =>
                        setFormData({ ...formData, style_name: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="style_id">
                      Style ID (Auto-generate if empty)
                    </Label>
                    <Input
                      id="style_id"
                      value={formData.style_id}
                      onChange={(e) =>
                        setFormData({ ...formData, style_id: e.target.value })
                      }
                      placeholder="Leave empty to auto-generate"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="product_category">Product Category</Label>
                    <Input
                      id="product_category"
                      value={formData.product_category}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          product_category: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="product_type">Product Type</Label>
                    <Input
                      id="product_type"
                      value={formData.product_type}
                      onChange={(e) =>
                        setFormData({ ...formData, product_type: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customs_customer_group">
                    Customs Customer Group
                  </Label>
                  <Input
                    id="customs_customer_group"
                    value={formData.customs_customer_group}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        customs_customer_group: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type_of_construction">
                      Type of Construction
                    </Label>
                    <Input
                      id="type_of_construction"
                      value={formData.type_of_construction}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          type_of_construction: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gauge">Gauge</Label>
                    <Select
                      value={formData.gauge}
                      onValueChange={(value) =>
                        setFormData({ ...formData, gauge: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select gauge" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3GG">3GG</SelectItem>
                        <SelectItem value="5GG">5GG</SelectItem>
                        <SelectItem value="7GG">7GG</SelectItem>
                        <SelectItem value="9GG">9GG</SelectItem>
                        <SelectItem value="12GG">12GG</SelectItem>
                        <SelectItem value="14GG">14GG</SelectItem>
                        <SelectItem value="Multi - 5GG/7GG">Multi - 5GG/7GG</SelectItem>
                        <SelectItem value="Multi - 12GG/14GG">Multi - 12GG/14GG</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4 border-t pt-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="is_set"
                      checked={formData.is_set}
                      onCheckedChange={(checked) =>
                        setFormData({
                          ...formData,
                          is_set: checked as boolean,
                          set_piece_count: checked ? formData.set_piece_count : null,
                        })
                      }
                    />
                    <Label
                      htmlFor="is_set"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Is this a set? (Multiple pieces like Top + Bottom)
                    </Label>
                  </div>

                  {formData.is_set && (
                    <div className="space-y-2 pl-6">
                      <Label htmlFor="set_piece_count">Number of Pieces in Set</Label>
                      <Select
                        value={formData.set_piece_count?.toString() || ""}
                        onValueChange={(value) =>
                          setFormData({
                            ...formData,
                            set_piece_count: parseInt(value),
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select number of pieces" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2">2 Pieces</SelectItem>
                          <SelectItem value="3">3 Pieces</SelectItem>
                          <SelectItem value="4">4 Pieces</SelectItem>
                          <SelectItem value="5">5 Pieces</SelectItem>
                          <SelectItem value="6">6 Pieces</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">
                  {editingStyle ? "Update" : "Create"} Style Summary
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
                placeholder="Search style name, ID, category..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-9"
              />
            </div>
          </div>
          <Select
            value={filters.buyer}
            onValueChange={(value) => setFilters({ ...filters, buyer: value })}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by Buyer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Buyers</SelectItem>
              {buyers.map((buyer: any) => (
                <SelectItem key={buyer.id} value={buyer.id.toString()}>
                  {buyer.buyer_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filters.gauge}
            onValueChange={(value) => setFilters({ ...filters, gauge: value })}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Gauge" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Gauges</SelectItem>
              {uniqueGauges.map((gauge: string) => (
                <SelectItem key={gauge} value={gauge}>
                  {gauge}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filters.category}
            onValueChange={(value) => setFilters({ ...filters, category: value })}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {uniqueCategories.map((cat: string) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={clearFilters} title="Clear filters">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="mt-2 text-sm text-muted-foreground">
          Showing {filteredStyles.length} of {styles.length} styles
        </div>
      </Card>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Buyer</TableHead>
              <TableHead>Style Name</TableHead>
              <TableHead>Style ID</TableHead>
              <TableHead>Product Category</TableHead>
              <TableHead>Product Type</TableHead>
              <TableHead>Gauge</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Updated At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStyles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center">
                  {styles.length === 0
                    ? "No style summaries found. Add your first style summary to get started."
                    : "No styles match your filters. Try adjusting your search criteria."}
                </TableCell>
              </TableRow>
            ) : (
              filteredStyles.map((style: any) => (
                <TableRow
                  key={style.id}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => {
                    setSelectedStyle(style);
                    setIsDetailDialogOpen(true);
                  }}
                >
                  <TableCell className="font-medium">
                    {buyers.find((b: any) => b.id === style.buyer_id)?.buyer_name ||
                      "-"}
                  </TableCell>
                  <TableCell>{style.style_name}</TableCell>
                  <TableCell>{style.style_id}</TableCell>
                  <TableCell>{style.product_category || "-"}</TableCell>
                  <TableCell>{style.product_type || "-"}</TableCell>
                  <TableCell>{style.gauge || "-"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDateTimeWithFallback(style.created_at)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDateTimeWithFallback(style.updated_at)}</TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(style)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(style.id)}
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

      {/* Detail View Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Style Summary Details</DialogTitle>
            <DialogDescription>
              Complete information for {selectedStyle?.style_name}
            </DialogDescription>
          </DialogHeader>
          {selectedStyle && (
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-muted-foreground">Buyer</Label>
                  <p className="text-base font-medium">
                    {buyers.find((b: any) => b.id === selectedStyle.buyer_id)?.buyer_name || "-"}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-muted-foreground">Style Name</Label>
                  <p className="text-base font-medium">{selectedStyle.style_name}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-muted-foreground">Style ID</Label>
                  <p className="text-base font-mono">{selectedStyle.style_id}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-muted-foreground">Product Category</Label>
                  <p className="text-base">{selectedStyle.product_category || "-"}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-muted-foreground">Product Type</Label>
                  <p className="text-base">{selectedStyle.product_type || "-"}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-muted-foreground">Customs Customer Group</Label>
                  <p className="text-base">{selectedStyle.customs_customer_group || "-"}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-muted-foreground">Type of Construction</Label>
                  <p className="text-base">{selectedStyle.type_of_construction || "-"}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-muted-foreground">Gauge</Label>
                  <p className="text-base">{selectedStyle.gauge || "-"}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-muted-foreground">Is Set</Label>
                  <div>
                    <Badge className={selectedStyle.is_set ? "bg-blue-500" : "bg-gray-400"}>
                      {selectedStyle.is_set ? "Yes" : "No"}
                    </Badge>
                  </div>
                </div>
                {selectedStyle.is_set && (
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-muted-foreground">Set Piece Count</Label>
                    <p className="text-base">{selectedStyle.set_piece_count || "-"}</p>
                  </div>
                )}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-muted-foreground">Created At</Label>
                  <p className="text-base">{formatDateTimeWithFallback(selectedStyle.created_at)}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-muted-foreground">Updated At</Label>
                  <p className="text-base">{formatDateTimeWithFallback(selectedStyle.updated_at)}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDetailDialogOpen(false);
                if (selectedStyle) {
                  handleEdit(selectedStyle);
                }
              }}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button onClick={() => setIsDetailDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
