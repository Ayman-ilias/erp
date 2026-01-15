"use client";

import * as React from "react";
import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { PlusCircle, Edit, Trash2, Search, X, Check, ChevronsUpDown } from "lucide-react";
import { samplesService } from "@/services/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const TNA_STATUSES = ["Pending", "In Progress", "Completed", "Delayed", "On Hold"];

export default function SampleTNAPage() {
  const [tnaRecords, setTnaRecords] = useState<any[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<any[]>([]);
  const [sampleRequests, setSampleRequests] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ search: "", status: "" });

  const [sampleOpen, setSampleOpen] = useState(false);
  const [sampleSearch, setSampleSearch] = useState("");

  const [formData, setFormData] = useState({
    sample_request_id: "",
    operation_sequence: "",
    operation_name: "",
    responsible_person: "",
    start_datetime: "",
    end_datetime: "",
    status: "Pending",
    remark: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [tnaRecords, filters, sampleRequests]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tnaData, requestsData] = await Promise.all([
        samplesService.tna.getAll(),
        samplesService.requests.getAll(),
      ]);
      setTnaRecords(Array.isArray(tnaData) ? tnaData : []);
      setSampleRequests(Array.isArray(requestsData) ? requestsData : []);
    } catch (error) {
      console.error("Failed to load data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...tnaRecords];
    if (filters.search) {
      const s = filters.search.toLowerCase();
      filtered = filtered.filter((t) => {
        const request = sampleRequests.find((r) => r.id === t.sample_request_id);
        return request?.sample_id?.toLowerCase().includes(s) ||
          t.operation_name?.toLowerCase().includes(s) ||
          t.responsible_person?.toLowerCase().includes(s);
      });
    }
    if (filters.status && filters.status !== "all") {
      filtered = filtered.filter((t) => t.status === filters.status);
    }
    setFilteredRecords(filtered);
  };

  const filteredSamples = useMemo(() => {
    if (!sampleSearch) return sampleRequests;
    return sampleRequests.filter((r) =>
      r.sample_id?.toLowerCase().includes(sampleSearch.toLowerCase()) ||
      r.sample_name?.toLowerCase().includes(sampleSearch.toLowerCase()) ||
      r.buyer_name?.toLowerCase().includes(sampleSearch.toLowerCase())
    );
  }, [sampleRequests, sampleSearch]);

  const handleSampleSelect = (requestId: string) => {
    setFormData({ ...formData, sample_request_id: requestId });
    setSampleOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        sample_request_id: parseInt(formData.sample_request_id),
        operation_sequence: formData.operation_sequence ? parseInt(formData.operation_sequence) : null,
        operation_name: formData.operation_name || null,
        responsible_person: formData.responsible_person || null,
        start_datetime: formData.start_datetime || null,
        end_datetime: formData.end_datetime || null,
        status: formData.status,
        remark: formData.remark || null,
      };

      if (editingItem) {
        await samplesService.tna.update(editingItem.id, data);
        toast.success("TNA updated successfully");
      } else {
        await samplesService.tna.create(data);
        toast.success("TNA created successfully");
      }

      setIsDialogOpen(false);
      resetForm();
      loadData();
    } catch (error: any) {
      toast.error(error?.message || "Failed to save TNA");
    }
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      sample_request_id: item.sample_request_id?.toString() || "",
      operation_sequence: item.operation_sequence?.toString() || "",
      operation_name: item.operation_name || "",
      responsible_person: item.responsible_person || "",
      start_datetime: item.start_datetime ? item.start_datetime.slice(0, 16) : "",
      end_datetime: item.end_datetime ? item.end_datetime.slice(0, 16) : "",
      status: item.status || "Pending",
      remark: item.remark || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this TNA record?")) {
      try {
        await samplesService.tna.delete(id);
        toast.success("TNA deleted successfully");
        loadData();
      } catch (error) {
        toast.error("Failed to delete TNA");
      }
    }
  };

  const resetForm = () => {
    setEditingItem(null);
    setFormData({
      sample_request_id: "", operation_sequence: "", operation_name: "",
      responsible_person: "", start_datetime: "", end_datetime: "",
      status: "Pending", remark: "",
    });
    setSampleSearch("");
  };

  const getRequestInfo = (requestId: number) => sampleRequests.find((r) => r.id === requestId);
  const selectedRequest = sampleRequests.find((r) => r.id.toString() === formData.sample_request_id);

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      "Pending": "bg-yellow-100 text-yellow-800",
      "In Progress": "bg-blue-100 text-blue-800",
      "Completed": "bg-green-100 text-green-800",
      "Delayed": "bg-red-100 text-red-800",
      "On Hold": "bg-gray-100 text-gray-800",
    };
    return <Badge className={colors[status] || ""}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sample TNA</h1>
          <p className="text-muted-foreground">Time and Action plan for sample operations</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button><PlusCircle className="mr-2 h-4 w-4" />Add TNA</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingItem ? "Edit" : "Add"} Sample TNA</DialogTitle>
              <DialogDescription>Define operation schedule for sample</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Sample Selection */}
              <div className="space-y-2">
                <Label>Sample ID *</Label>
                <Popover open={sampleOpen} onOpenChange={setSampleOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" className="w-full justify-between">
                      {selectedRequest ? `${selectedRequest.sample_id} - ${selectedRequest.sample_name}` : "Search & select sample..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[450px] p-0">
                    <Command>
                      <CommandInput placeholder="Search sample..." value={sampleSearch} onValueChange={setSampleSearch} />
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

              {/* Operation Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Operation # (Sequence)</Label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.operation_sequence}
                    onChange={(e) => setFormData({ ...formData, operation_sequence: e.target.value })}
                    placeholder="1, 2, 3..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Operation Name *</Label>
                  <Input
                    value={formData.operation_name}
                    onChange={(e) => setFormData({ ...formData, operation_name: e.target.value })}
                    placeholder="e.g., Knitting, Linking"
                    required
                  />
                </div>
              </div>

              {/* Person & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Responsible Person</Label>
                  <Input
                    value={formData.responsible_person}
                    onChange={(e) => setFormData({ ...formData, responsible_person: e.target.value })}
                    placeholder="Person name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status *</Label>
                  <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {TNA_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date & Time</Label>
                  <Input
                    type="datetime-local"
                    value={formData.start_datetime}
                    onChange={(e) => setFormData({ ...formData, start_datetime: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date & Time</Label>
                  <Input
                    type="datetime-local"
                    value={formData.end_datetime}
                    onChange={(e) => setFormData({ ...formData, end_datetime: e.target.value })}
                  />
                </div>
              </div>

              {/* Remark */}
              <div className="space-y-2">
                <Label>Remark</Label>
                <Textarea
                  value={formData.remark}
                  onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
                  rows={2}
                  placeholder="Additional notes..."
                />
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
            <Input placeholder="Search by Sample ID, Operation, Person..." value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} className="pl-9" />
          </div>
          <Select value={filters.status} onValueChange={(v) => setFilters({ ...filters, status: v })}>
            <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {TNA_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={() => setFilters({ search: "", status: "" })}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="mt-2 text-sm text-muted-foreground">
          Showing {filteredRecords.length} of {tnaRecords.length} TNA records
        </div>
      </Card>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sample ID</TableHead>
              <TableHead>Op #</TableHead>
              <TableHead>Operation Name</TableHead>
              <TableHead>Responsible Person</TableHead>
              <TableHead>Start Date & Time</TableHead>
              <TableHead>End Date & Time</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Remark</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRecords.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-muted-foreground">
                  {loading ? "Loading..." : "No TNA records found"}
                </TableCell>
              </TableRow>
            ) : (
              filteredRecords.map((item) => {
                const request = getRequestInfo(item.sample_request_id);
                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono">{request?.sample_id || "-"}</TableCell>
                    <TableCell>{item.operation_sequence || "-"}</TableCell>
                    <TableCell>{item.operation_name || "-"}</TableCell>
                    <TableCell>{item.responsible_person || "-"}</TableCell>
                    <TableCell>{item.start_datetime ? new Date(item.start_datetime).toLocaleString() : "-"}</TableCell>
                    <TableCell>{item.end_datetime ? new Date(item.end_datetime).toLocaleString() : "-"}</TableCell>
                    <TableCell>{getStatusBadge(item.status)}</TableCell>
                    <TableCell className="max-w-[150px] truncate" title={item.remark}>{item.remark || "-"}</TableCell>
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
