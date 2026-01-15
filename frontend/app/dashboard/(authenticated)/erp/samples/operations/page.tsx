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
import { PlusCircle, Edit, Trash2, Search, X, Check, ChevronsUpDown, ListPlus } from "lucide-react";
import { samplesService } from "@/services/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { BulkOperationManager, useBulkOperations } from "@/services/bulk-operations";
import { BulkOperationProgress, BulkOperationManager as BulkOperationManagerComponent } from "@/components/ui/progress-indicator";

export default function AddOperationsForSamplePage() {
  const [sampleOperations, setSampleOperations] = useState<any[]>([]);
  const [filteredOperations, setFilteredOperations] = useState<any[]>([]);
  const [sampleRequests, setSampleRequests] = useState<any[]>([]);
  const [manufacturingOps, setManufacturingOps] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ search: "" });

  // Bulk operations management
  const { 
    operations: bulkOperations, 
    cancelOperation, 
    removeOperation, 
    executeBulkOperation 
  } = useBulkOperations();

  // Single add states
  const [sampleOpen, setSampleOpen] = useState(false);
  const [sampleSearch, setSampleSearch] = useState("");
  const [operationOpen, setOperationOpen] = useState(false);
  const [operationSearch, setOperationSearch] = useState("");

  // Bulk add states
  const [bulkSampleOpen, setBulkSampleOpen] = useState(false);
  const [bulkSampleSearch, setBulkSampleSearch] = useState("");
  const [bulkOperationSearch, setBulkOperationSearch] = useState("");
  const [selectedSampleId, setSelectedSampleId] = useState("");
  const [selectedOperationIds, setSelectedOperationIds] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    sample_request_id: "",
    operation_master_id: "",
    operation_type: "",
    operation_name: "",
    sequence_order: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [sampleOperations, filters, sampleRequests]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [opsData, requestsData, mfgOpsData] = await Promise.all([
        samplesService.sampleOperations.getAll(),
        samplesService.requests.getAll(),
        samplesService.manufacturingOperations.getAll(undefined, true),
      ]);
      setSampleOperations(Array.isArray(opsData) ? opsData : []);
      setSampleRequests(Array.isArray(requestsData) ? requestsData : []);
      setManufacturingOps(Array.isArray(mfgOpsData) ? mfgOpsData : []);
    } catch (error) {
      console.error("Failed to load data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...sampleOperations];
    if (filters.search) {
      const s = filters.search.toLowerCase();
      filtered = filtered.filter((op) => {
        const request = sampleRequests.find((r) => r.id === op.sample_request_id);
        return request?.sample_id?.toLowerCase().includes(s) ||
          request?.sample_name?.toLowerCase().includes(s) ||
          op.operation_name?.toLowerCase().includes(s) ||
          op.operation_type?.toLowerCase().includes(s);
      });
    }
    setFilteredOperations(filtered);
  };

  const filteredSamples = useMemo(() => {
    if (!sampleSearch) return sampleRequests;
    return sampleRequests.filter((r) =>
      r.sample_id?.toLowerCase().includes(sampleSearch.toLowerCase()) ||
      r.sample_name?.toLowerCase().includes(sampleSearch.toLowerCase()) ||
      r.buyer_name?.toLowerCase().includes(sampleSearch.toLowerCase())
    );
  }, [sampleRequests, sampleSearch]);

  const bulkFilteredSamples = useMemo(() => {
    if (!bulkSampleSearch) return sampleRequests;
    return sampleRequests.filter((r) =>
      r.sample_id?.toLowerCase().includes(bulkSampleSearch.toLowerCase()) ||
      r.sample_name?.toLowerCase().includes(bulkSampleSearch.toLowerCase()) ||
      r.buyer_name?.toLowerCase().includes(bulkSampleSearch.toLowerCase())
    );
  }, [sampleRequests, bulkSampleSearch]);

  const filteredMfgOps = useMemo(() => {
    if (!operationSearch) return manufacturingOps;
    return manufacturingOps.filter((op) =>
      op.operation_id?.toLowerCase().includes(operationSearch.toLowerCase()) ||
      op.operation_name?.toLowerCase().includes(operationSearch.toLowerCase()) ||
      op.operation_type?.toLowerCase().includes(operationSearch.toLowerCase())
    );
  }, [manufacturingOps, operationSearch]);

  const bulkFilteredMfgOps = useMemo(() => {
    if (!bulkOperationSearch) return manufacturingOps;
    return manufacturingOps.filter((op) =>
      op.operation_id?.toLowerCase().includes(bulkOperationSearch.toLowerCase()) ||
      op.operation_name?.toLowerCase().includes(bulkOperationSearch.toLowerCase()) ||
      op.operation_type?.toLowerCase().includes(bulkOperationSearch.toLowerCase())
    );
  }, [manufacturingOps, bulkOperationSearch]);

  // Get operations already linked to selected sample (for bulk add)
  const existingOperationIds = useMemo(() => {
    if (!selectedSampleId) return [];
    return sampleOperations
      .filter((op) => op.sample_request_id === parseInt(selectedSampleId))
      .map((op) => op.operation_master_id?.toString());
  }, [sampleOperations, selectedSampleId]);

  const handleSampleSelect = (requestId: string) => {
    setFormData({ ...formData, sample_request_id: requestId });
    setSampleOpen(false);
  };

  const handleOperationSelect = (opId: string) => {
    const op = manufacturingOps.find((o) => o.id.toString() === opId);
    if (op) {
      setFormData({
        ...formData,
        operation_master_id: opId,
        operation_type: op.operation_type || "",
        operation_name: op.operation_name || "",
      });
    }
    setOperationOpen(false);
  };

  const handleBulkSampleSelect = (requestId: string) => {
    setSelectedSampleId(requestId);
    setSelectedOperationIds([]);
    setBulkSampleOpen(false);
  };

  const handleOperationToggle = (opId: string) => {
    setSelectedOperationIds((prev) => {
      if (prev.includes(opId)) {
        return prev.filter((id) => id !== opId);
      } else {
        return [...prev, opId];
      }
    });
  };

  const handleSelectAll = () => {
    const availableOps = bulkFilteredMfgOps
      .filter((op) => !existingOperationIds.includes(op.id.toString()))
      .map((op) => op.id.toString());
    setSelectedOperationIds(availableOps);
  };

  const handleDeselectAll = () => {
    setSelectedOperationIds([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        sample_request_id: parseInt(formData.sample_request_id),
        operation_master_id: formData.operation_master_id ? parseInt(formData.operation_master_id) : null,
        operation_type: formData.operation_type || null,
        operation_name: formData.operation_name || null,
        sequence_order: formData.sequence_order ? parseInt(formData.sequence_order) : null,
      };

      if (editingItem) {
        await samplesService.sampleOperations.update(editingItem.id, data);
        toast.success("Operation updated successfully");
      } else {
        await samplesService.sampleOperations.create(data);
        toast.success("Operation added to sample successfully");
      }

      setIsDialogOpen(false);
      resetForm();
      loadData();
    } catch (error: any) {
      toast.error(error?.message || "Failed to save operation");
    }
  };

  const handleBulkSubmit = async () => {
    if (!selectedSampleId || selectedOperationIds.length === 0) {
      toast.error("Please select a sample and at least one operation");
      return;
    }

    try {
      const existingOps = sampleOperations.filter(
        (op) => op.sample_request_id === parseInt(selectedSampleId)
      );
      const startSequence = existingOps.length > 0
        ? Math.max(...existingOps.map((op) => op.sequence_order || 0)) + 1
        : 1;

      // Prepare bulk operation items
      const bulkItems = selectedOperationIds.map((opId, index) => {
        const op = manufacturingOps.find((o) => o.id.toString() === opId);
        return {
          id: `op_${opId}`,
          data: {
            sample_request_id: parseInt(selectedSampleId),
            operation_master_id: parseInt(opId),
            operation_type: op?.operation_type || null,
            operation_name: op?.operation_name || null,
            sequence_order: startSequence + index,
          },
          operation: () => samplesService.sampleOperations.create({
            sample_request_id: parseInt(selectedSampleId),
            operation_master_id: parseInt(opId),
            operation_type: op?.operation_type || null,
            operation_name: op?.operation_name || null,
            sequence_order: startSequence + index,
          })
        };
      });

      // Execute bulk operation with progress tracking
      const progress = await executeBulkOperation({
        operationName: `Adding ${selectedOperationIds.length} operations to sample`,
        items: bulkItems,
        concurrency: 3, // Process 3 operations at a time
        onComplete: (progress) => {
          const successCount = progress.completed - progress.failed;
          if (successCount > 0) {
            toast.success(`${successCount} operations added successfully`);
          }
          if (progress.failed > 0) {
            toast.error(`${progress.failed} operations failed to add`);
          }
          loadData();
        },
        onError: (progress) => {
          toast.error(`Bulk operation failed: ${progress.errors[0]?.error || 'Unknown error'}`);
        }
      });

      setIsBulkDialogOpen(false);
      resetBulkForm();
      
    } catch (error: any) {
      toast.error(error?.message || "Failed to add operations");
    }
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      sample_request_id: item.sample_request_id?.toString() || "",
      operation_master_id: item.operation_master_id?.toString() || "",
      operation_type: item.operation_type || "",
      operation_name: item.operation_name || "",
      sequence_order: item.sequence_order?.toString() || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to remove this operation from the sample?")) {
      try {
        await samplesService.sampleOperations.delete(id);
        toast.success("Operation removed successfully");
        loadData();
      } catch (error) {
        toast.error("Failed to remove operation");
      }
    }
  };

  const resetForm = () => {
    setEditingItem(null);
    setFormData({
      sample_request_id: "", operation_master_id: "", operation_type: "",
      operation_name: "", sequence_order: "",
    });
    setSampleSearch("");
    setOperationSearch("");
  };

  const resetBulkForm = () => {
    setSelectedSampleId("");
    setSelectedOperationIds([]);
    setBulkSampleSearch("");
    setBulkOperationSearch("");
  };

  const getRequestInfo = (requestId: number) => sampleRequests.find((r) => r.id === requestId);
  const selectedRequest = sampleRequests.find((r) => r.id.toString() === formData.sample_request_id);
  const selectedOperation = manufacturingOps.find((o) => o.id.toString() === formData.operation_master_id);
  const bulkSelectedRequest = sampleRequests.find((r) => r.id.toString() === selectedSampleId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Add Operations For Sample</h1>
          <p className="text-muted-foreground">Link manufacturing operations to specific samples</p>
        </div>
        <div className="flex gap-2">
          {/* Bulk Add Dialog */}
          <Dialog open={isBulkDialogOpen} onOpenChange={(open) => { setIsBulkDialogOpen(open); if (!open) resetBulkForm(); }}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <ListPlus className="mr-2 h-4 w-4" />
                Bulk Add Operations
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Bulk Add Operations to Sample</DialogTitle>
                <DialogDescription>Select multiple operations to add to a sample at once</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {/* Sample Selection */}
                <div className="space-y-2">
                  <Label>Sample ID (Search & Select) *</Label>
                  <Popover open={bulkSampleOpen} onOpenChange={setBulkSampleOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" role="combobox" className="w-full justify-between">
                        {bulkSelectedRequest ? `${bulkSelectedRequest.sample_id} - ${bulkSelectedRequest.sample_name} (${bulkSelectedRequest.buyer_name})` : "Search & select sample..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[600px] p-0">
                      <Command>
                        <CommandInput placeholder="Search sample ID, name, buyer..." value={bulkSampleSearch} onValueChange={setBulkSampleSearch} />
                        <CommandList>
                          <CommandEmpty>No sample found.</CommandEmpty>
                          <CommandGroup>
                            {bulkFilteredSamples.map((r) => (
                              <CommandItem key={r.id} value={r.id.toString()} onSelect={() => handleBulkSampleSelect(r.id.toString())}>
                                <Check className={cn("mr-2 h-4 w-4", selectedSampleId === r.id.toString() ? "opacity-100" : "opacity-0")} />
                                <span className="font-mono">{r.sample_id}</span>
                                <span className="mx-2">-</span>
                                <span>{r.sample_name}</span>
                                <span className="ml-2 text-muted-foreground">({r.buyer_name})</span>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                {selectedSampleId && (
                  <>
                    {/* Operations Selection */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Select Operations</Label>
                        <div className="flex gap-2">
                          <Button type="button" variant="outline" size="sm" onClick={handleSelectAll}>
                            Select All
                          </Button>
                          <Button type="button" variant="outline" size="sm" onClick={handleDeselectAll}>
                            Deselect All
                          </Button>
                        </div>
                      </div>
                      <Input
                        placeholder="Search operations..."
                        value={bulkOperationSearch}
                        onChange={(e) => setBulkOperationSearch(e.target.value)}
                      />
                      <div className="text-sm text-muted-foreground">
                        {selectedOperationIds.length} operation(s) selected
                      </div>
                    </div>

                    {/* Operations List with Checkboxes */}
                    <div className="border rounded-md max-h-[400px] overflow-y-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[50px]">Select</TableHead>
                            <TableHead>Operation ID</TableHead>
                            <TableHead>Operation Name</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Duration</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {bulkFilteredMfgOps.map((op) => {
                            const isAlreadyLinked = existingOperationIds.includes(op.id.toString());
                            const isSelected = selectedOperationIds.includes(op.id.toString());
                            return (
                              <TableRow
                                key={op.id}
                                className={cn(
                                  isAlreadyLinked && "opacity-50",
                                  isSelected && !isAlreadyLinked && "bg-primary/5"
                                )}
                              >
                                <TableCell>
                                  <Checkbox
                                    checked={isSelected}
                                    disabled={isAlreadyLinked}
                                    onCheckedChange={() => handleOperationToggle(op.id.toString())}
                                  />
                                </TableCell>
                                <TableCell className="font-mono">{op.operation_id}</TableCell>
                                <TableCell>{op.operation_name}</TableCell>
                                <TableCell>
                                  {op.operation_type ? (
                                    <Badge variant="outline">{op.operation_type}</Badge>
                                  ) : (
                                    <span className="text-muted-foreground">-</span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {op.standard_duration ? `${op.standard_duration} min` : "-"}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>

                    {existingOperationIds.length > 0 && (
                      <p className="text-sm text-muted-foreground">
                        Note: Grayed out operations are already linked to this sample.
                      </p>
                    )}
                  </>
                )}
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsBulkDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleBulkSubmit}
                  disabled={!selectedSampleId || selectedOperationIds.length === 0}
                >
                  Add {selectedOperationIds.length} Operation(s)
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Single Add Dialog */}
          <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button><PlusCircle className="mr-2 h-4 w-4" />Add Single Operation</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingItem ? "Edit" : "Add"} Operation for Sample</DialogTitle>
                <DialogDescription>Link an operation from Manufacturing Operations master to a sample</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Sample Selection */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2 space-y-2">
                    <Label>Sample ID (Search & Select) *</Label>
                    <Popover open={sampleOpen} onOpenChange={setSampleOpen}>
                      <PopoverTrigger asChild>
                        <Button variant="outline" role="combobox" className="w-full justify-between">
                          {selectedRequest ? `${selectedRequest.sample_id} - ${selectedRequest.sample_name}` : "Search & select sample..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[450px] p-0">
                        <Command>
                          <CommandInput placeholder="Search sample ID, name, buyer..." value={sampleSearch} onValueChange={setSampleSearch} />
                          <CommandList>
                            <CommandEmpty>No sample found.</CommandEmpty>
                            <CommandGroup>
                              {filteredSamples.map((r) => (
                                <CommandItem key={r.id} value={r.id.toString()} onSelect={() => handleSampleSelect(r.id.toString())}>
                                  <Check className={cn("mr-2 h-4 w-4", formData.sample_request_id === r.id.toString() ? "opacity-100" : "opacity-0")} />
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
                  <div className="space-y-2">
                    <Label>Buyer Name</Label>
                    <Input value={selectedRequest?.buyer_name || ""} disabled className="bg-muted" />
                  </div>
                </div>

                {/* Operation Selection */}
                <div className="space-y-2">
                  <Label>Operation ID (Search & Select) *</Label>
                  <Popover open={operationOpen} onOpenChange={setOperationOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" role="combobox" className="w-full justify-between">
                        {selectedOperation ? `${selectedOperation.operation_id} - ${selectedOperation.operation_name}` : "Search & select operation..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[500px] p-0">
                      <Command>
                        <CommandInput placeholder="Search operation ID, name, type..." value={operationSearch} onValueChange={setOperationSearch} />
                        <CommandList>
                          <CommandEmpty>No operation found.</CommandEmpty>
                          <CommandGroup>
                            {filteredMfgOps.map((op) => (
                              <CommandItem key={op.id} value={op.id.toString()} onSelect={() => handleOperationSelect(op.id.toString())}>
                                <Check className={cn("mr-2 h-4 w-4", formData.operation_master_id === op.id.toString() ? "opacity-100" : "opacity-0")} />
                                <span className="font-mono">{op.operation_id}</span>
                                <span className="mx-2">-</span>
                                <span>{op.operation_name}</span>
                                {op.operation_type && <Badge variant="outline" className="ml-2">{op.operation_type}</Badge>}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Auto-filled fields */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Operation Type</Label>
                    <Input value={formData.operation_type} disabled className="bg-muted" />
                  </div>
                  <div className="space-y-2">
                    <Label>Operation Name</Label>
                    <Input value={formData.operation_name} disabled className="bg-muted" />
                  </div>
                  <div className="space-y-2">
                    <Label>Sequence Order</Label>
                    <Input
                      type="number"
                      min="1"
                      value={formData.sequence_order}
                      onChange={(e) => setFormData({ ...formData, sequence_order: e.target.value })}
                      placeholder="e.g., 1, 2, 3..."
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
      </div>

      {/* Bulk Operations Progress */}
      {bulkOperations.length > 0 && (
        <BulkOperationManagerComponent
          operations={bulkOperations}
          onCancelOperation={cancelOperation}
          onCloseOperation={removeOperation}
        />
      )}

      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by Sample ID, Operation..." value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} className="pl-9" />
          </div>
          <Button variant="outline" size="icon" onClick={() => setFilters({ search: "" })}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="mt-2 text-sm text-muted-foreground">
          {(() => {
            const uniqueSamples = new Set(filteredOperations.map((op: any) => op.sample_request_id)).size;
            const totalSamples = new Set(sampleOperations.map((op: any) => op.sample_request_id)).size;
            return `Showing ${uniqueSamples} sample${uniqueSamples !== 1 ? 's' : ''} with ${filteredOperations.length} total operation${filteredOperations.length !== 1 ? 's' : ''}`;
          })()}
        </div>
      </Card>

      {/* Table - Grouped by Sample */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sample ID</TableHead>
              <TableHead>Sample Name</TableHead>
              <TableHead>Buyer</TableHead>
              <TableHead className="min-w-[300px]">Operations</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(() => {
              // Group operations by sample_request_id
              const groupedBySample = filteredOperations.reduce((acc: any, op: any) => {
                const key = op.sample_request_id;
                if (!acc[key]) {
                  acc[key] = [];
                }
                acc[key].push(op);
                return acc;
              }, {});

              const sampleIds = Object.keys(groupedBySample);

              if (sampleIds.length === 0) {
                return (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      {loading ? "Loading..." : "No operations linked to samples"}
                    </TableCell>
                  </TableRow>
                );
              }

              return sampleIds.map((sampleId) => {
                const operations = groupedBySample[sampleId]
                  .sort((a: any, b: any) => (a.sequence_order || 0) - (b.sequence_order || 0));
                const request = getRequestInfo(parseInt(sampleId));

                // Build operation sequence string with "->"
                const operationSequence = operations.map((op: any) => {
                  return op.operation_name || "Unknown";
                }).join(" -> ");

                return (
                  <TableRow key={sampleId}>
                    <TableCell className="font-mono font-medium">{request?.sample_id || "-"}</TableCell>
                    <TableCell>{request?.sample_name || "-"}</TableCell>
                    <TableCell>{request?.buyer_name || "-"}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap items-center gap-1">
                        {operations.map((op: any, index: number) => (
                          <span key={op.id} className="inline-flex items-center">
                            <Badge
                              variant="secondary"
                              className="cursor-pointer hover:bg-primary/20"
                              onClick={() => handleEdit(op)}
                            >
                              {op.operation_name || "Unknown"}
                            </Badge>
                            {index < operations.length - 1 && (
                              <span className="mx-1 text-muted-foreground font-bold">→</span>
                            )}
                          </span>
                        ))}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {operations.length} operation{operations.length > 1 ? "s" : ""} in sequence
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedSampleId(sampleId);
                            setSelectedOperationIds([]);
                            setIsBulkDialogOpen(true);
                          }}
                        >
                          <PlusCircle className="h-4 w-4 mr-1" />
                          Add
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => {
                            if (confirm(`Delete all ${operations.length} operations for this sample?`)) {
                              Promise.all(operations.map((op: any) =>
                                samplesService.sampleOperations.delete(op.id)
                              )).then(() => {
                                toast.success("All operations removed");
                                loadData();
                              }).catch(() => {
                                toast.error("Failed to remove some operations");
                              });
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              });
            })()}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
