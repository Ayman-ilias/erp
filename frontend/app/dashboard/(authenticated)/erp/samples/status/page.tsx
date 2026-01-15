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

const SAMPLE_STATUSES = [
  "Pending",
  "In Progress",
  "Completed",
  "On Hold",
  "Cancelled",
  "Waiting for Material",
  "Under Review",
  "Approved",
  "Rejected",
];

const MERCHANDISER_STATUSES = [
  "Pending Review",
  "Under Evaluation",
  "Approved",
  "Rejected",
  "Revision Required",
  "Sent to Buyer",
  "Buyer Approved",
  "Buyer Rejected",
];

export default function SampleStatusPage() {
  const [statusRecords, setStatusRecords] = useState<any[]>([]);
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
    status_by_sample: "",
    status_from_merchandiser: "",
    notes: "",
    updated_by: "",
    expecting_end_date: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [statusRecords, filters, sampleRequests]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statusData, requestsData] = await Promise.all([
        samplesService.status.getAll(),
        samplesService.requests.getAll(),
      ]);
      setStatusRecords(Array.isArray(statusData) ? statusData : []);
      setSampleRequests(Array.isArray(requestsData) ? requestsData : []);
    } catch (error) {
      console.error("Failed to load data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...statusRecords];
    if (filters.search) {
      const s = filters.search.toLowerCase();
      filtered = filtered.filter((st) => {
        const request = sampleRequests.find((r) => r.id === st.sample_request_id);
        return request?.sample_id?.toLowerCase().includes(s) ||
          st.status_by_sample?.toLowerCase().includes(s) ||
          st.status_from_merchandiser?.toLowerCase().includes(s);
      });
    }
    if (filters.status && filters.status !== "all") {
      filtered = filtered.filter((st) => st.status_by_sample === filters.status);
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
        status_by_sample: formData.status_by_sample || null,
        status_from_merchandiser: formData.status_from_merchandiser || null,
        notes: formData.notes || null,
        updated_by: formData.updated_by || null,
        expecting_end_date: formData.expecting_end_date ? new Date(formData.expecting_end_date).toISOString() : null,
      };

      if (editingItem) {
        await samplesService.status.update(editingItem.id, data);
        toast.success("Status updated successfully");
      } else {
        await samplesService.status.create(data);
        toast.success("Status created successfully");
      }

      setIsDialogOpen(false);
      resetForm();
      loadData();
    } catch (error: any) {
      toast.error(error?.message || "Failed to save status");
    }
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    const formatDate = (date: string | Date | null | undefined) => {
      if (!date) return "";
      const d = typeof date === "string" ? new Date(date) : date;
      return d.toISOString().split("T")[0];
    };
    setFormData({
      sample_request_id: item.sample_request_id?.toString() || "",
      status_by_sample: item.status_by_sample || "",
      status_from_merchandiser: item.status_from_merchandiser || "",
      notes: item.notes || "",
      updated_by: item.updated_by || "",
      expecting_end_date: formatDate(item.expecting_end_date),
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this status record?")) {
      try {
        await samplesService.status.delete(id);
        toast.success("Status deleted successfully");
        loadData();
      } catch (error) {
        toast.error("Failed to delete status");
      }
    }
  };

  const resetForm = () => {
    setEditingItem(null);
    setFormData({
      sample_request_id: "", status_by_sample: "",
      status_from_merchandiser: "", notes: "",
      updated_by: "", expecting_end_date: "",
    });
    setSampleSearch("");
  };

  const getRequestInfo = (requestId: number) => sampleRequests.find((r) => r.id === requestId);
  const selectedRequest = sampleRequests.find((r) => r.id.toString() === formData.sample_request_id);

  const getStatusBadge = (status: string, type: "sample" | "merchandiser") => {
    const sampleColors: Record<string, string> = {
      "Pending": "bg-yellow-100 text-yellow-800",
      "In Progress": "bg-blue-100 text-blue-800",
      "Completed": "bg-green-100 text-green-800",
      "On Hold": "bg-gray-100 text-gray-800",
      "Cancelled": "bg-red-100 text-red-800",
      "Waiting for Material": "bg-orange-100 text-orange-800",
      "Under Review": "bg-purple-100 text-purple-800",
      "Approved": "bg-green-100 text-green-800",
      "Rejected": "bg-red-100 text-red-800",
    };
    const merchColors: Record<string, string> = {
      "Pending Review": "bg-yellow-100 text-yellow-800",
      "Under Evaluation": "bg-blue-100 text-blue-800",
      "Approved": "bg-green-100 text-green-800",
      "Rejected": "bg-red-100 text-red-800",
      "Revision Required": "bg-orange-100 text-orange-800",
      "Sent to Buyer": "bg-purple-100 text-purple-800",
      "Buyer Approved": "bg-green-100 text-green-800",
      "Buyer Rejected": "bg-red-100 text-red-800",
    };
    const colors = type === "sample" ? sampleColors : merchColors;
    return <Badge className={colors[status] || ""}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sample Status</h1>
          <p className="text-muted-foreground">Track sample and merchandiser status</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button><PlusCircle className="mr-2 h-4 w-4" />Add Status</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingItem ? "Edit" : "Add"} Sample Status</DialogTitle>
              <DialogDescription>Update sample and merchandiser status</DialogDescription>
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
                  <PopoverContent className="w-[400px] p-0">
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

              {/* Status Fields */}
              <div className="space-y-2">
                <Label>Status By Sample *</Label>
                <Select value={formData.status_by_sample} onValueChange={(v) => setFormData({ ...formData, status_by_sample: v })}>
                  <SelectTrigger><SelectValue placeholder="Select sample status" /></SelectTrigger>
                  <SelectContent>
                    {SAMPLE_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Status from Merchandiser</Label>
                <Select value={formData.status_from_merchandiser} onValueChange={(v) => setFormData({ ...formData, status_from_merchandiser: v })}>
                  <SelectTrigger><SelectValue placeholder="Select merchandiser status" /></SelectTrigger>
                  <SelectContent>
                    {MERCHANDISER_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  placeholder="Additional notes..."
                />
              </div>

              <div className="space-y-2">
                <Label>Updated By</Label>
                <Input
                  value={formData.updated_by}
                  onChange={(e) => setFormData({ ...formData, updated_by: e.target.value })}
                  placeholder="Your name or ID"
                />
              </div>

              <div className="space-y-2">
                <Label>Expecting End Date</Label>
                <Input
                  type="date"
                  value={formData.expecting_end_date}
                  onChange={(e) => setFormData({ ...formData, expecting_end_date: e.target.value })}
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
            <Input placeholder="Search by Sample ID, Status..." value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} className="pl-9" />
          </div>
          <Select value={filters.status} onValueChange={(v) => setFilters({ ...filters, status: v })}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Sample Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {SAMPLE_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={() => setFilters({ search: "", status: "" })}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="mt-2 text-sm text-muted-foreground">
          Showing {filteredRecords.length} of {statusRecords.length} status records
        </div>
      </Card>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sample ID</TableHead>
              <TableHead>Status By Sample</TableHead>
              <TableHead>Status from Merchandiser</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead>Expecting End Date</TableHead>
              <TableHead>Updated By</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRecords.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground">
                  {loading ? "Loading..." : "No status records found"}
                </TableCell>
              </TableRow>
            ) : (
              filteredRecords.map((item) => {
                const request = getRequestInfo(item.sample_request_id);
                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono">{request?.sample_id || "-"}</TableCell>
                    <TableCell>{item.status_by_sample ? getStatusBadge(item.status_by_sample, "sample") : "-"}</TableCell>
                    <TableCell>{item.status_from_merchandiser ? getStatusBadge(item.status_from_merchandiser, "merchandiser") : "-"}</TableCell>
                    <TableCell className="max-w-[200px] truncate" title={item.notes}>{item.notes || "-"}</TableCell>
                    <TableCell>{item.expecting_end_date ? new Date(item.expecting_end_date).toLocaleDateString() : "-"}</TableCell>
                    <TableCell>{item.updated_by || "-"}</TableCell>
                    <TableCell>{item.updated_at ? new Date(item.updated_at).toLocaleDateString() : "-"}</TableCell>
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
