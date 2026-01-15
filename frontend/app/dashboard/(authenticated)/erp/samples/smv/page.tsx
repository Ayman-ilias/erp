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
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { PlusCircle, Edit, Trash2, Search, X, Check, ChevronsUpDown, Calculator } from "lucide-react";
import { samplesService, api } from "@/services/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function SMVCalculationPage() {
  const [smvRecords, setSmvRecords] = useState<any[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<any[]>([]);
  const [styleVariants, setStyleVariants] = useState<any[]>([]);
  const [manufacturingOps, setManufacturingOps] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ search: "" });

  const [variantOpen, setVariantOpen] = useState(false);
  const [variantSearch, setVariantSearch] = useState("");
  const [operationOpen, setOperationOpen] = useState(false);
  const [operationSearch, setOperationSearch] = useState("");

  const [formData, setFormData] = useState({
    style_variant_id: "",
    operation_id: "",
    number_of_operations: "",
    duration_per_operation: "00:00:00",
    total_duration: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [smvRecords, filters, styleVariants]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [smvData, variantsData, opsData] = await Promise.all([
        samplesService.smv.getAll(),
        api.styleVariants.getAll().catch(() => []),
        samplesService.manufacturingOperations.getAll(undefined, true),
      ]);
      setSmvRecords(Array.isArray(smvData) ? smvData : []);
      setStyleVariants(Array.isArray(variantsData) ? variantsData : []);
      setManufacturingOps(Array.isArray(opsData) ? opsData : []);
    } catch (error) {
      console.error("Failed to load data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...smvRecords];
    if (filters.search) {
      const s = filters.search.toLowerCase();
      filtered = filtered.filter((r) => {
        const variant = styleVariants.find((v) => v.id === r.style_variant_id);
        const op = manufacturingOps.find((o) => o.id === r.operation_id);
        return variant?.variant_code?.toLowerCase().includes(s) ||
          op?.operation_name?.toLowerCase().includes(s);
      });
    }
    setFilteredRecords(filtered);
  };

  const filteredVariants = useMemo(() => {
    if (!variantSearch) return styleVariants;
    return styleVariants.filter((v) =>
      v.variant_code?.toLowerCase().includes(variantSearch.toLowerCase()) ||
      v.colour_name?.toLowerCase().includes(variantSearch.toLowerCase()) ||
      v.piece_name?.toLowerCase().includes(variantSearch.toLowerCase())
    );
  }, [styleVariants, variantSearch]);

  const filteredOps = useMemo(() => {
    if (!operationSearch) return manufacturingOps;
    return manufacturingOps.filter((op) =>
      op.operation_id?.toLowerCase().includes(operationSearch.toLowerCase()) ||
      op.operation_name?.toLowerCase().includes(operationSearch.toLowerCase()) ||
      op.operation_type?.toLowerCase().includes(operationSearch.toLowerCase())
    );
  }, [manufacturingOps, operationSearch]);

  // Convert HH:MM:SS to minutes
  const timeToMinutes = (timeStr: string): number => {
    const parts = timeStr.split(':').map((p) => parseInt(p) || 0);
    if (parts.length === 3) {
      const [hours, minutes, seconds] = parts;
      return hours * 60 + minutes + seconds / 60;
    }
    return 0;
  };

  // Calculate total duration
  const calculateTotalDuration = (numOps: string, duration: string) => {
    const n = parseFloat(numOps) || 0;
    const d = timeToMinutes(duration);
    const total = n * d;
    setFormData({
      ...formData,
      number_of_operations: numOps,
      duration_per_operation: duration,
      total_duration: total.toFixed(2),
    });
  };

  const handleVariantSelect = (variantId: string) => {
    setFormData({ ...formData, style_variant_id: variantId });
    setVariantOpen(false);
  };

  const handleOperationSelect = (opId: string) => {
    setFormData({ ...formData, operation_id: opId });
    setOperationOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        style_variant_id: parseInt(formData.style_variant_id),
        operation_id: formData.operation_id ? parseInt(formData.operation_id) : null,
        number_of_operations: formData.number_of_operations ? parseInt(formData.number_of_operations) : null,
        duration_per_operation: formData.duration_per_operation || null,
        total_duration: formData.total_duration || null,
      };

      if (editingItem) {
        await samplesService.smv.update(editingItem.id, data);
        toast.success("SMV updated successfully");
      } else {
        await samplesService.smv.create(data);
        toast.success("SMV created successfully");
      }

      setIsDialogOpen(false);
      resetForm();
      loadData();
    } catch (error: any) {
      toast.error(error?.message || "Failed to save SMV");
    }
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      style_variant_id: item.style_variant_id?.toString() || "",
      operation_id: item.operation_id?.toString() || "",
      number_of_operations: item.number_of_operations?.toString() || "",
      duration_per_operation: item.duration_per_operation || "00:00:00",
      total_duration: item.total_duration?.toString() || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this SMV record?")) {
      try {
        await samplesService.smv.delete(id);
        toast.success("SMV deleted successfully");
        loadData();
      } catch (error) {
        toast.error("Failed to delete SMV");
      }
    }
  };

  const resetForm = () => {
    setEditingItem(null);
    setFormData({
      style_variant_id: "", operation_id: "", number_of_operations: "",
      duration_per_operation: "00:00:00", total_duration: "",
    });
    setVariantSearch("");
    setOperationSearch("");
  };

  const getVariantInfo = (variantId: number) => styleVariants.find((v) => v.id === variantId);
  const getOperationInfo = (opId: number) => manufacturingOps.find((o) => o.id === opId);
  const selectedVariant = styleVariants.find((v) => v.id.toString() === formData.style_variant_id);
  const selectedOperation = manufacturingOps.find((o) => o.id.toString() === formData.operation_id);

  // Calculate total SMV for a variant
  const getTotalSMVForVariant = (variantId: number) => {
    const variantRecords = smvRecords.filter((r) => r.style_variant_id === variantId);
    return variantRecords.reduce((sum, r) => sum + (parseFloat(r.total_duration) || 0), 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">SMV Calculation</h1>
          <p className="text-muted-foreground">Calculate Standard Minute Value per Style Variant</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button><PlusCircle className="mr-2 h-4 w-4" />Add SMV</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingItem ? "Edit" : "Add"} SMV Calculation</DialogTitle>
              <DialogDescription>Calculate SMV for style variant operations</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Style Variant Selection */}
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
                              <span>{v.colour_name}</span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Operation Selection */}
              <div className="space-y-2">
                <Label>Operation ID (Search & Select)</Label>
                <Popover open={operationOpen} onOpenChange={setOperationOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" className="w-full justify-between">
                      {selectedOperation ? `${selectedOperation.operation_id} - ${selectedOperation.operation_name}` : "Search operation..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[400px] p-0">
                    <Command>
                      <CommandInput placeholder="Search operation..." value={operationSearch} onValueChange={setOperationSearch} />
                      <CommandList>
                        <CommandEmpty>No operation found.</CommandEmpty>
                        <CommandGroup>
                          {filteredOps.map((op) => (
                            <CommandItem key={op.id} value={op.id.toString()} onSelect={() => handleOperationSelect(op.id.toString())}>
                              <Check className={cn("mr-2 h-4 w-4", formData.operation_id === op.id.toString() ? "opacity-100" : "opacity-0")} />
                              <span className="font-mono">{op.operation_id}</span>
                              <span className="mx-2">-</span>
                              <span>{op.operation_name}</span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Number of Operations & Duration */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Number of Operations *</Label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.number_of_operations}
                    onChange={(e) => calculateTotalDuration(e.target.value, formData.duration_per_operation)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Duration (HH:MM:SS) *</Label>
                  <Input
                    type="text"
                    value={formData.duration_per_operation}
                    onChange={(e) => calculateTotalDuration(formData.number_of_operations, e.target.value)}
                    placeholder="00:00:00"
                    pattern="[0-9]{2}:[0-9]{2}:[0-9]{2}"
                    className="font-mono"
                    required
                  />
                </div>
              </div>

              {/* Total Duration */}
              <div className="space-y-2">
                <Label>Total Duration (in min)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={formData.total_duration}
                    disabled
                    className="bg-muted font-bold text-lg"
                  />
                  <Badge className="bg-green-600 text-lg px-3 py-1">
                    {formData.total_duration || "0"} min
                  </Badge>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit">
                  <Calculator className="mr-2 h-4 w-4" />
                  {editingItem ? "Update" : "Calculate & Save"}
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
            <Input placeholder="Search by Variant ID, Operation..." value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} className="pl-9" />
          </div>
          <Button variant="outline" size="icon" onClick={() => setFilters({ search: "" })}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="mt-2 text-sm text-muted-foreground">
          Showing {filteredRecords.length} of {smvRecords.length} SMV records
        </div>
      </Card>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Style Variant ID</TableHead>
              <TableHead>Operation ID</TableHead>
              <TableHead>Number of Operations</TableHead>
              <TableHead>Duration (HH:MM:SS)</TableHead>
              <TableHead>Total Duration (min)</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRecords.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  {loading ? "Loading..." : "No SMV records found"}
                </TableCell>
              </TableRow>
            ) : (
              filteredRecords.map((item) => {
                const variant = getVariantInfo(item.style_variant_id);
                const operation = getOperationInfo(item.operation_id);
                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono">{variant?.variant_code || item.style_variant_id}</TableCell>
                    <TableCell className="font-mono">{operation?.operation_id || item.operation_id}</TableCell>
                    <TableCell>{item.number_of_operations || "-"}</TableCell>
                    <TableCell className="font-mono">{item.duration_per_operation || "-"}</TableCell>
                    <TableCell>
                      <Badge className="bg-green-600">{item.total_duration || 0} min</Badge>
                    </TableCell>
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
