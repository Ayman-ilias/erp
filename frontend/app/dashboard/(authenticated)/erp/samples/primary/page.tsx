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
import { API_LIMITS } from "@/lib/config";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { PlusCircle, Edit, Trash2, Search, X } from "lucide-react";
import { toast } from "sonner";

import { generateSampleId } from "@/services/utils";
import { api } from "@/services/api";

export default function SamplePrimaryInfoPage() {
  const [samples, setSamples] = useState<any[]>([]);
  const [filteredSamples, setFilteredSamples] = useState<any[]>([]);
  const [buyers, setBuyers] = useState<any[]>([]);
  const [styles, setStyles] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSample, setEditingSample] = useState<any>(null);
  const [filters, setFilters] = useState({
    search: "",
    buyer: "",
    sampleType: "",
    gauge: "",
  });
  const [formData, setFormData] = useState({
    sample_id: "",
    buyer_id: "",
    buyer_name: "",
    style_id: "",
    style_name: "",
    style_variant_id: "", // For dropdown selection
    sample_type: "Proto",
    sample_description: "",
    item: "",
    gauge: "",
    worksheet_rcv_date: "",
    notes: "",
  });

  useEffect(() => {
    loadSamples();
    loadBuyers();
    loadStyles();
  }, []);

  const loadSamples = async () => {
    try {
      const response = await fetch("/api/v1/samples");
      if (response.ok) {
        const data = await response.json();
        setSamples(Array.isArray(data) ? data : []);
        setFilteredSamples(Array.isArray(data) ? data : []);
      } else {
        setSamples([]);
        setFilteredSamples([]);
      }
    } catch (error) {
      console.error("Failed to load samples:", error);
      setSamples([]);
      setFilteredSamples([]);
    }
  };

  const loadBuyers = async () => {
    try {
      const response = await fetch("/api/v1/buyers");
      if (response.ok) {
        const data = await response.json();
        setBuyers(Array.isArray(data) ? data : []);
      } else {
        setBuyers([]);
      }
    } catch (error) {
      console.error("Failed to load buyers:", error);
      setBuyers([]);
    }
  };

  const loadStyles = async () => {
    try {
      // Load style summaries to show each style only once (not individual variants)
      const response = await fetch(`/api/v1/samples/styles?limit=${API_LIMITS.STYLES}`);
      if (response.ok) {
        const data = await response.json();
        setStyles(Array.isArray(data) ? data : []);
      } else {
        setStyles([]);
      }
    } catch (error) {
      console.error("Failed to load styles:", error);
      setStyles([]);
    }
  };

  // Apply filters
  useEffect(() => {
    let result = [...samples];

    // Search filter (sample ID, buyer, style)
    if (filters.search && filters.search !== "all") {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (sample: any) =>
          sample.sample_id?.toLowerCase().includes(searchLower) ||
          sample.buyer_name?.toLowerCase().includes(searchLower) ||
          sample.style_name?.toLowerCase().includes(searchLower) ||
          sample.sample_description?.toLowerCase().includes(searchLower)
      );
    }

    // Buyer filter
    if (filters.buyer && filters.buyer !== "all") {
      result = result.filter((sample: any) => sample.buyer_name === filters.buyer);
    }

    // Sample Type filter
    if (filters.sampleType && filters.sampleType !== "all") {
      result = result.filter((sample: any) => sample.sample_type === filters.sampleType);
    }

    // Gauge filter
    if (filters.gauge && filters.gauge !== "all") {
      result = result.filter((sample: any) => sample.gauge === filters.gauge);
    }

    setFilteredSamples(result);
  }, [samples, filters]);

  const clearFilters = () => {
    setFilters({ search: "", buyer: "", sampleType: "", gauge: "" });
  };

  // Get unique values for filters
  const uniqueBuyers = [...new Set(samples.map((s: any) => s.buyer_name).filter(Boolean))].sort();
  const uniqueSampleTypes = [...new Set(samples.map((s: any) => s.sample_type).filter(Boolean))].sort();
  const uniqueGauges = [...new Set(samples.map((s: any) => s.gauge).filter(Boolean))].sort();

  const handleBuyerChange = async (buyerId: string) => {
    const buyer = buyers.find((b) => b.id.toString() === buyerId);
    if (buyer) {
      // Auto-generate Sample ID
      const allSamples = await api.samples.getAll();
      const sampleId = await generateSampleId(buyer.buyer_name, Array.isArray(allSamples) ? allSamples : []);

      setFormData({
        ...formData,
        buyer_id: buyerId,
        buyer_name: buyer.buyer_name,
        sample_id: sampleId,
      });
    }
  };

  const handleStyleChange = async (styleId: string) => {
    // styleId represents style_summary_id
    const style = styles.find((s) => s.id.toString() === styleId);
    if (style) {
      // Get the first variant for this style to populate color/item/gauge
      // This is just for auto-filling - the sample will use style_summary_id
      try {
        const variantsResponse = await fetch(
          `/api/v1/samples/style-variants?style_summary_id=${styleId}&limit=1`
        );
        if (variantsResponse.ok) {
          const variants = await variantsResponse.json();
          const firstVariant = Array.isArray(variants) && variants.length > 0 ? variants[0] : null;
          
          setFormData({
            ...formData,
            style_id: styleId, // Use style_summary_id directly
            style_name: style.style_name, // Just the style name, no color
            style_variant_id: firstVariant?.id?.toString() || "", // Store first variant id if available
            item: style.product_category || firstVariant?.style_category || "",
            gauge: style.gauge || firstVariant?.gauge || "",
          });
        } else {
          // Fallback if variants fetch fails
          setFormData({
            ...formData,
            style_id: styleId,
            style_name: style.style_name,
            style_variant_id: "",
            item: style.product_category || "",
            gauge: style.gauge || "",
          });
        }
      } catch (error) {
        console.error("Failed to load style variant:", error);
        // Fallback
        setFormData({
          ...formData,
          style_id: styleId,
          style_name: style.style_name,
          style_variant_id: "",
          item: style.product_category || "",
          gauge: style.gauge || "",
        });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editingSample ? "PUT" : "POST";
      const url = editingSample
        ? `/api/v1/samples/${editingSample.id}`
        : "/api/v1/samples/";

      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      toast.success(
        editingSample
          ? "Sample updated successfully"
          : "Sample created successfully"
      );
      setIsDialogOpen(false);
      resetForm();
      loadSamples();
    } catch (error) {
      toast.error("Failed to save sample");
      console.error(error);
    }
  };

  const handleEdit = (sample: any) => {
    setEditingSample(sample);
    setFormData({
      ...sample,
      style_id: sample.style_id?.toString() || "", // Use style_id (style_summary_id) for editing
      style_variant_id: sample.style_variant_id || "", // Keep variant id if exists
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this sample?")) {
      try {
        await fetch(`/api/v1/samples/${id}`, {
          method: "DELETE",
        });
        toast.success("Sample deleted successfully");
        loadSamples();
      } catch (error) {
        toast.error("Failed to delete sample");
        console.error(error);
      }
    }
  };

  const resetForm = () => {
    setEditingSample(null);
    setFormData({
      sample_id: "",
      buyer_id: "",
      buyer_name: "",
      style_id: "",
      style_name: "",
      style_variant_id: "",
      sample_type: "Proto",
      sample_description: "",
      item: "",
      gauge: "",
      worksheet_rcv_date: "",
      notes: "",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sample Primary Info</h1>
          <p className="text-muted-foreground">
            Create and manage sample records with auto-generated Sample ID
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setIsDialogOpen(true);
          }}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Sample
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search sample ID, buyer, style, description..."
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
              {uniqueBuyers.map((buyer: string) => (
                <SelectItem key={buyer} value={buyer}>
                  {buyer}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filters.sampleType}
            onValueChange={(value) => setFilters({ ...filters, sampleType: value })}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sample Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {uniqueSampleTypes.map((type: string) => (
                <SelectItem key={type} value={type}>
                  {type}
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
          <Button variant="outline" size="icon" onClick={clearFilters} title="Clear filters">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="mt-2 text-sm text-muted-foreground">
          Showing {filteredSamples.length} of {samples.length} samples
        </div>
      </Card>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sample ID</TableHead>
              <TableHead>Buyer</TableHead>
              <TableHead>Style</TableHead>
              <TableHead>Sample Type</TableHead>
              <TableHead>Item</TableHead>
              <TableHead>Gauge</TableHead>
              <TableHead>Worksheet Rcv Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSamples.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground">
                  {samples.length === 0
                    ? "No samples found. Create your first sample to get started."
                    : "No samples match your filters. Try adjusting your search criteria."}
                </TableCell>
              </TableRow>
            ) : (
              filteredSamples.map((sample) => (
                <TableRow key={sample.id}>
                  <TableCell className="font-medium font-mono">{sample.sample_id}</TableCell>
                  <TableCell>{sample.buyer_name}</TableCell>
                  <TableCell>{sample.style_name}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700">
                      {sample.sample_type}
                    </span>
                  </TableCell>
                  <TableCell>{sample.item}</TableCell>
                  <TableCell>{sample.gauge}</TableCell>
                  <TableCell>{sample.worksheet_rcv_date}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(sample)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(sample.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingSample ? "Edit Sample" : "Add New Sample"}
            </DialogTitle>
            <DialogDescription>
              Sample ID will be auto-generated when you select a buyer
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Sample ID (Auto-Generated)</Label>
                <Input
                  value={formData.sample_id}
                  disabled
                  className="font-mono font-bold text-lg"
                  placeholder="Select buyer to generate..."
                />
                <p className="text-xs text-muted-foreground">
                  Format: BUY_YYYY_MM_001
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="buyer_id">Buyer</Label>
                  <Select
                    value={formData.buyer_id}
                    onValueChange={handleBuyerChange}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select buyer" />
                    </SelectTrigger>
                    <SelectContent>
                      {buyers.map((buyer) => (
                        <SelectItem key={buyer.id} value={buyer.id.toString()}>
                          {buyer.buyer_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="style_id">Style *</Label>
                  <Select
                    value={formData.style_id || undefined}
                    onValueChange={handleStyleChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select style" />
                    </SelectTrigger>
                    <SelectContent>
                      {styles.map((style) => (
                        <SelectItem key={style.id} value={style.id.toString()}>
                          {style.style_name} ({style.style_id})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {styles.length === 0 && (
                    <p className="text-xs text-destructive">No styles available. Please add a style first.</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="sample_type">Sample Type</Label>
                  <Select
                    value={formData.sample_type}
                    onValueChange={(value) =>
                      setFormData({ ...formData, sample_type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Proto">Proto</SelectItem>
                      <SelectItem value="Fit">Fit</SelectItem>
                      <SelectItem value="PP">PP (Pre-Production)</SelectItem>
                      <SelectItem value="SMS">SMS (Size Set)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="worksheet_rcv_date">Worksheet Rcv Date</Label>
                  <Input
                    id="worksheet_rcv_date"
                    type="date"
                    value={formData.worksheet_rcv_date}
                    onChange={(e) =>
                      setFormData({ ...formData, worksheet_rcv_date: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="sample_description">Sample Description</Label>
                <Input
                  id="sample_description"
                  value={formData.sample_description}
                  onChange={(e) =>
                    setFormData({ ...formData, sample_description: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Item (Auto from Style)</Label>
                  <Input
                    value={formData.item}
                    onChange={(e) =>
                      setFormData({ ...formData, item: e.target.value })
                    }
                  />
                </div>

                <div className="grid gap-2">
                  <Label>Gauge (Auto from Style)</Label>
                  <Input
                    value={formData.gauge}
                    onChange={(e) =>
                      setFormData({ ...formData, gauge: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingSample ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
