"use client";

import * as React from "react";
import { useState, useEffect, useMemo, useRef } from "react";
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
import { Edit, Trash2, Search, X, Eye, Upload, Check, ChevronsUpDown, FileText, Info, RefreshCw, Plus, CheckCircle2, ExternalLink, Clock, AlertCircle, Zap } from "lucide-react";
import { samplesService, buyersService, api, workflowService, colorMasterService, sizeChartService, sizesService } from "@/services/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";

const SAMPLE_CATEGORIES = ["Proto", "Fit", "PP", "SMS", "TOP", "Salesman", "Photo Shoot", "Production"];

export default function SampleRequestPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<any[]>([]);
  const [buyers, setBuyers] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [viewingItem, setViewingItem] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ search: "", buyer: "", category: "" });
  const [buyerOpen, setBuyerOpen] = useState(false);
  const [buyerSearch, setBuyerSearch] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    buyer_id: "",
    buyer_name: "",
    sample_name: "",
    gauge: "",
    ply: "",
    yarn_id: "",
    yarn_ids: [] as string[],  // Array of yarn IDs
    yarn_details: "",
    trims_ids: "",
    trims_details: "",
    decorative_part: "",
    decorative_details: "",
    yarn_handover_date: "",
    trims_handover_date: "",
    required_date: "",
    item: "",
    request_pcs: "",
    sample_category: "Proto",
    priority: "normal",
    color_ids: [] as number[],
    size_ids: [] as string[],  // Array of size IDs (auto_generated_id)
    color_name: "", // Legacy field for backward compatibility
    size_name: "", // Legacy field for backward compatibility
    additional_instruction: "" as string | Array<{instruction: string, done: boolean}>,
    techpack_url: "",
    techpack_filename: "",
  });

  const [colors, setColors] = useState<any[]>([]);
  const [sizes, setSizes] = useState<any[]>([]);
  const [yarns, setYarns] = useState<any[]>([]);
  const [trims, setTrims] = useState<any[]>([]);
  const [yarnOpen, setYarnOpen] = useState(false);
  const [trimsOpen, setTrimsOpen] = useState(false);
  const [highPriorityOnly, setHighPriorityOnly] = useState(false);

  useEffect(() => {
    loadData();
    // Auto-sync every 30 seconds
    const interval = setInterval(() => {
      loadData();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Listen for messages from child windows to refresh data (bidirectional sync)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'SAMPLE_UPDATED') {
        // Refresh data when sample is updated from Merchandising
        loadData();
        toast.success("Sample data refreshed from Merchandising");
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  useEffect(() => {
    applyFilters();
  }, [requests, filters]);

  // Load colors and sizes when buyer changes
  useEffect(() => {
    if (formData.buyer_id) {
      loadColorsAndSizes(parseInt(formData.buyer_id));
    } else {
      setColors([]);
      setSizes([]);
    }
  }, [formData.buyer_id]);

  const loadColorsAndSizes = async (buyerId: number) => {
    try {
      // Load colors filtered by buyer (buyer-specific + general colors)
      const colorData = await colorMasterService.getAll(buyerId);
      setColors(Array.isArray(colorData) ? colorData : []);

      // Load all sizes (using existing sizes API)
      const sizeData = await sizesService.getAll("");
      setSizes(Array.isArray(sizeData) ? sizeData : []);
    } catch (error) {
      console.error("Failed to load colors/sizes:", error);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [reqData, buyerData, yarnData, trimsData] = await Promise.all([
        samplesService.requests.getAll().catch((err) => {
          console.error("Failed to load sample requests:", err);
          throw new Error(`Failed to load sample requests: ${err?.message || 'Unknown error'}`);
        }),
        buyersService.getAll().catch((err) => {
          console.error("Failed to load buyers:", err);
          throw new Error(`Failed to load buyers: ${err?.message || 'Unknown error'}`);
        }),
        api.merchandiser.yarn.getAll().catch(() => []),
        api.merchandiser.trims.getAll().catch(() => []),
      ]);
      setRequests(Array.isArray(reqData) ? reqData : []);
      setBuyers(Array.isArray(buyerData) ? buyerData : []);
      setYarns(Array.isArray(yarnData) ? yarnData : []);
      setTrims(Array.isArray(trimsData) ? trimsData : []);
    } catch (error: any) {
      console.error("Failed to load data:", error);
      const errorMessage = error?.message || "Failed to load data. Please check your connection and try again.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...requests];
    if (filters.search) {
      const s = filters.search.toLowerCase();
      filtered = filtered.filter((r) =>
        r.sample_id?.toLowerCase().includes(s) ||
        r.sample_name?.toLowerCase().includes(s) ||
        r.buyer_name?.toLowerCase().includes(s)
      );
    }
    if (filters.buyer && filters.buyer !== "all") {
      filtered = filtered.filter((r) => r.buyer_id?.toString() === filters.buyer);
    }
    if (filters.category && filters.category !== "all") {
      filtered = filtered.filter((r) => r.sample_category === filters.category);
    }
    if (highPriorityOnly) {
      filtered = filtered.filter((r) => r.priority === "urgent" || r.priority === "high");
    }

    // Sort by updated_at descending (newest first)
    filtered.sort((a, b) => {
      const dateA = new Date(a.updated_at || a.created_at || 0).getTime();
      const dateB = new Date(b.updated_at || b.created_at || 0).getTime();
      return dateB - dateA;
    });

    setFilteredRequests(filtered);
  };

  const filteredBuyers = useMemo(() => {
    if (!buyerSearch) return buyers;
    return buyers.filter((b) =>
      b.buyer_name?.toLowerCase().includes(buyerSearch.toLowerCase()) ||
      b.buyer_code?.toLowerCase().includes(buyerSearch.toLowerCase())
    );
  }, [buyers, buyerSearch]);

  const handleBuyerSelect = (buyerId: string) => {
    const buyer = buyers.find((b) => b.id.toString() === buyerId);
    setFormData({ ...formData, buyer_id: buyerId, buyer_name: buyer?.buyer_name || "" });
    setBuyerOpen(false);
  };

  // Handlers for multiple additional instructions
  const [newInstruction, setNewInstruction] = useState("");
  const addInstruction = () => {
    if (newInstruction.trim()) {
      setFormData({
        ...formData,
        additional_instruction: [...(Array.isArray(formData.additional_instruction) ? formData.additional_instruction : []), { instruction: newInstruction.trim(), done: false }],
      });
      setNewInstruction("");
    }
  };
  const removeInstruction = (index: number) => {
    if (Array.isArray(formData.additional_instruction)) {
      setFormData({
        ...formData,
        additional_instruction: formData.additional_instruction.filter((_, i) => i !== index),
      });
    }
  };
  const toggleInstructionDone = (index: number) => {
    if (Array.isArray(formData.additional_instruction)) {
      const updated = [...formData.additional_instruction];
      updated[index] = { ...updated[index], done: !updated[index].done };
      setFormData({ ...formData, additional_instruction: updated });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // For now, store as base64 data URL (in production, upload to server/S3)
      const reader = new FileReader();
      reader.onload = () => {
        setFormData({
          ...formData,
          techpack_url: reader.result as string,
          techpack_filename: file.name,
        });
        toast.success(`File "${file.name}" attached`);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const requestData = {
        buyer_id: parseInt(formData.buyer_id),
        buyer_name: formData.buyer_name,
        sample_name: formData.sample_name,
        gauge: formData.gauge || null,
        ply: formData.ply ? parseInt(formData.ply) : null,
        item: formData.item || null,
        yarn_id: formData.yarn_id || null,
        yarn_ids: formData.yarn_ids && formData.yarn_ids.length > 0 ? formData.yarn_ids : null,
        yarn_details: formData.yarn_details || null,
        trims_ids: formData.trims_ids ? formData.trims_ids.split(",").map((s) => s.trim()).filter(Boolean) : null,
        trims_details: formData.trims_details || null,
        decorative_part: formData.decorative_part ? [formData.decorative_part] : null,
        decorative_details: formData.decorative_details || null,
        yarn_handover_date: formData.yarn_handover_date ? new Date(formData.yarn_handover_date).toISOString() : null,
        trims_handover_date: formData.trims_handover_date ? new Date(formData.trims_handover_date).toISOString() : null,
        required_date: formData.required_date ? new Date(formData.required_date).toISOString() : null,
        request_pcs: formData.request_pcs ? parseInt(formData.request_pcs) : null,
        sample_category: formData.sample_category,
        priority: formData.priority || "normal",
        color_ids: formData.color_ids,
        size_ids: formData.size_ids,
        color_name: formData.color_ids.length > 0 ? colors.filter(c => formData.color_ids.includes(c.id)).map(c => c.color_name).join(", ") : null,
        size_name: formData.size_ids.length > 0 ? sizes.filter(s => formData.size_ids.includes(s.id)).map(s => s.size_name).join(", ") : null,
        additional_instruction: (() => {
          // Convert to array of strings for backend (samples DB expects List[str])
          if (!formData.additional_instruction) return null;
          if (typeof formData.additional_instruction === 'string') {
            return formData.additional_instruction.trim() ? [formData.additional_instruction] : null;
          }
          if (Array.isArray(formData.additional_instruction)) {
            if (formData.additional_instruction.length === 0) return null;
            return formData.additional_instruction.map((inst: any) => {
              if (typeof inst === 'string') return inst;
              if (inst.instruction) return inst.instruction;
              return String(inst);
            }).filter(Boolean);
          }
          return [String(formData.additional_instruction)];
        })(),
        techpack_url: formData.techpack_url || null,
        techpack_filename: formData.techpack_filename || null,
      };

      if (!editingItem) {
        toast.error("Cannot create new requests. Sample requests must be created in the Merchandising module.");
        return;
      }

      await samplesService.requests.update(editingItem.id, requestData);
      toast.success("Sample request updated successfully");

      setIsDialogOpen(false);
      resetForm();
      loadData();
    } catch (error: any) {
      toast.error(error?.message || "Failed to save sample request");
    }
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setIsDialogOpen(true);
    setFormData({
      buyer_id: item.buyer_id?.toString() || "",
      buyer_name: item.buyer_name || "",
      sample_name: item.sample_name || "",
      gauge: item.gauge || "",
      ply: item.ply?.toString() || "",
      item: item.item || "",
      yarn_id: item.yarn_id || "",
      yarn_ids: Array.isArray(item.yarn_ids) ? item.yarn_ids : (item.yarn_id ? [item.yarn_id] : []),
      yarn_details: item.yarn_details || "",
      trims_ids: Array.isArray(item.trims_ids) ? item.trims_ids.join(", ") : (item.trims_ids || ""),
      trims_details: item.trims_details || "",
      decorative_part: item.decorative_part || "",
      decorative_details: item.decorative_details || "",
      yarn_handover_date: item.yarn_handover_date?.split("T")[0] || "",
      trims_handover_date: item.trims_handover_date?.split("T")[0] || "",
      required_date: item.required_date?.split("T")[0] || "",
      request_pcs: item.request_pcs?.toString() || "",
      sample_category: item.sample_category || "Proto",
      priority: item.priority || "normal",
      color_ids: Array.isArray(item.color_ids) ? item.color_ids : (item.color_ids ? [item.color_ids] : []),
      size_ids: Array.isArray(item.size_ids) ? item.size_ids : (item.size_ids ? [item.size_ids] : []),
      color_name: item.color_name || "",
      size_name: item.size_name || "",
      additional_instruction: (() => {
        // Parse additional_instruction from string or JSON
        if (!item.additional_instruction) return [];
        if (typeof item.additional_instruction === 'string') {
          // Parse from newline-separated string with optional ✓ markers
          const lines = item.additional_instruction.split('\n');
          return lines.map((line: string) => {
            const trimmed = line.trim();
            if (!trimmed) return null;
            const done = trimmed.startsWith('✓');
            const instruction = done ? trimmed.substring(1).trim() : trimmed;
            return { instruction, done };
          }).filter((item: any) => item && item.instruction) as Array<{instruction: string, done: boolean}>;
        }
        if (Array.isArray(item.additional_instruction)) {
          return item.additional_instruction;
        }
        return [];
      })(),
      techpack_url: item.techpack_url || "",
      techpack_filename: item.techpack_filename || "",
    });
    setIsDialogOpen(true);
  };

  const handleView = (item: any) => {
    setViewingItem(item);
    setIsViewDialogOpen(true);
  };

  const handleSyncSamples = async () => {
    try {
      setLoading(true);
      const result = await api.merchandiser.samplePrimary.syncToSamples();
      toast.success(result?.message || "Samples synced successfully");
      loadData();
    } catch (error: any) {
      toast.error(error?.message || "Failed to sync samples");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this sample request?")) {
      try {
        await samplesService.requests.delete(id);
        toast.success("Sample request deleted successfully");
        loadData();
      } catch (error) {
        toast.error("Failed to delete sample request");
      }
    }
  };

  const resetForm = () => {
    setEditingItem(null);
    setFormData({
      buyer_id: "", buyer_name: "", sample_name: "", gauge: "", ply: "", item: "",
      yarn_id: "", yarn_ids: [], yarn_details: "", trims_ids: "", trims_details: "",
      decorative_part: "", decorative_details: "",
      yarn_handover_date: "", trims_handover_date: "", required_date: "", request_pcs: "",
      sample_category: "Proto", priority: "normal", color_ids: [], size_ids: [],
      color_name: "", size_name: "", additional_instruction: [],
      techpack_url: "", techpack_filename: "",
    });
    setBuyerSearch("");
  };

  const selectedBuyer = buyers.find((b) => b.id.toString() === formData.buyer_id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sample Request</h1>
          <p className="text-muted-foreground">
            View and edit sample requests received from Merchandiser. New requests are created in the Merchandising module.
          </p>
        </div>
      </div>

      {/* Info Banner */}
      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <div className="p-4 flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Sample requests are automatically synced from Merchandising
            </p>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
              New sample requests are created in the <strong>Merchandising → Sample Development</strong> module and automatically appear here.
              Click any request to view full details.
            </p>
          </div>
        </div>
      </Card>

      {/* Edit dialog removed - samples are read-only here, edit in Merchandising module */}

      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by Sample ID, Name, Buyer..." value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} className="pl-9" />
          </div>
          <Select value={filters.buyer} onValueChange={(v) => setFilters({ ...filters, buyer: v })}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Buyer" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Buyers</SelectItem>
              {buyers.map((b) => <SelectItem key={b.id} value={b.id.toString()}>{b.buyer_name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filters.category} onValueChange={(v) => setFilters({ ...filters, category: v })}>
            <SelectTrigger className="w-[150px]"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {SAMPLE_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2 px-3 py-2 border rounded-md bg-orange-50 dark:bg-orange-950">
            <Zap className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            <Label htmlFor="high-priority-filter" className="text-sm font-medium cursor-pointer whitespace-nowrap">
              High Priority Only
            </Label>
            <Switch
              id="high-priority-filter"
              checked={highPriorityOnly}
              onCheckedChange={setHighPriorityOnly}
            />
          </div>
          <Button variant="outline" size="icon" onClick={() => { setFilters({ search: "", buyer: "", category: "" }); setHighPriorityOnly(false); }}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="mt-2 text-sm text-muted-foreground">
          Showing {filteredRequests.length} of {requests.length} requests
          {highPriorityOnly && <span className="ml-2 text-orange-600 dark:text-orange-400 font-medium">(High Priority Filter Active)</span>}
        </div>
      </Card>

      {/* Simplified Table - Only show Date, Sample ID, Priority, Required Date */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date Created</TableHead>
              <TableHead>Sample ID</TableHead>
              <TableHead>Buyer</TableHead>
              <TableHead>Sample Name</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Required Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRequests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  {loading ? "Loading..." : "No sample requests found"}
                </TableCell>
              </TableRow>
            ) : (
              filteredRequests.map((item) => (
                <TableRow
                  key={item.id}
                  className={cn(
                    "cursor-pointer hover:bg-muted/50 transition-colors",
                    item.priority === 'urgent' && 'bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-950/30'
                  )}
                  onClick={() => handleView(item)}
                >
                  <TableCell className="font-medium">
                    {item.created_at ? new Date(item.created_at).toLocaleDateString() : "-"}
                  </TableCell>
                  <TableCell className="font-mono font-bold">
                    <div className="flex items-center gap-2">
                      {item.priority === 'urgent' && (
                        <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 animate-pulse" />
                      )}
                      {item.sample_id}
                    </div>
                  </TableCell>
                  <TableCell>{item.buyer_name}</TableCell>
                  <TableCell>{item.sample_name}</TableCell>
                  <TableCell>
                    <Badge variant={
                      item.priority === 'urgent' ? 'destructive' :
                      item.priority === 'high' ? 'default' :
                      item.priority === 'low' ? 'secondary' : 'outline'
                    } className={item.priority === 'urgent' ? 'animate-pulse' : ''}>
                      {item.priority === 'urgent' && <AlertCircle className="h-3 w-3 mr-1 inline" />}
                      {item.priority === 'high' && <Zap className="h-3 w-3 mr-1 inline" />}
                      {item.priority || 'normal'}
                    </Badge>
                  </TableCell>
                  <TableCell className={cn(
                    "font-medium",
                    item.priority === 'urgent' && "text-red-600 dark:text-red-400"
                  )}>
                    {item.required_date?.split("T")[0] || "-"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* View Dialog - Read-only with organized sections */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-3">
              Sample Request Details
              {viewingItem?.priority === 'urgent' && (
                <Badge variant="destructive" className="animate-pulse">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  URGENT
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription>
              Read-only view • Created from Merchandising module
            </DialogDescription>
          </DialogHeader>
          {viewingItem && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="bg-muted/30 rounded-lg p-4">
                <h4 className="font-semibold text-base mb-3 border-b pb-2">Basic Information</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Sample ID:</span>
                    <p className="font-mono font-bold text-base">{viewingItem.sample_id}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Buyer:</span>
                    <p className="font-medium">{viewingItem.buyer_name}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Sample Name:</span>
                    <p className="font-medium">{viewingItem.sample_name}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Item:</span>
                    <p className="font-medium">{viewingItem.item || "-"}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Category:</span>
                    <p><Badge variant="outline">{viewingItem.sample_category}</Badge></p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Priority:</span>
                    <p>
                      <Badge variant={
                        viewingItem.priority === 'urgent' ? 'destructive' :
                        viewingItem.priority === 'high' ? 'default' :
                        viewingItem.priority === 'low' ? 'secondary' : 'outline'
                      }>
                        {viewingItem.priority || 'normal'}
                      </Badge>
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Request Pieces:</span>
                    <p className="font-medium">{viewingItem.request_pcs || "-"}</p>
                  </div>
                </div>
              </div>

              {/* Specifications */}
              <div className="bg-muted/30 rounded-lg p-4">
                <h4 className="font-semibold text-base mb-3 border-b pb-2">Specifications</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Gauge:</span>
                    <p className="font-medium">{viewingItem.gauge || "-"}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">PLY:</span>
                    <p className="font-medium">{viewingItem.ply || "-"}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Colors:</span>
                    <p className="font-medium">{viewingItem.color_name || "-"}</p>
                  </div>
                  <div className="col-span-3">
                    <span className="text-muted-foreground">Sizes:</span>
                    <p className="font-medium">{viewingItem.size_name || "-"}</p>
                  </div>
                </div>
              </div>

              {/* Materials */}
              <div className="bg-muted/30 rounded-lg p-4">
                <h4 className="font-semibold text-base mb-3 border-b pb-2">Materials</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Yarn ID:</span>
                    <p className="font-medium">{viewingItem.yarn_id || "-"}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Trims IDs:</span>
                    <p className="font-medium">{viewingItem.trims_ids?.join(", ") || "-"}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Yarn Details:</span>
                    <p className="font-medium">{viewingItem.yarn_details || "-"}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Trims Details:</span>
                    <p className="font-medium">{viewingItem.trims_details || "-"}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Decorative Part:</span>
                    <p className="font-medium">{viewingItem.decorative_part || "-"}</p>
                  </div>
                </div>
              </div>

              {/* Important Dates */}
              <div className="bg-muted/30 rounded-lg p-4">
                <h4 className="font-semibold text-base mb-3 border-b pb-2">Important Dates</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Yarn Handover:</span>
                    <p className="font-medium">{viewingItem.yarn_handover_date?.split("T")[0] || "-"}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Trims Handover:</span>
                    <p className="font-medium">{viewingItem.trims_handover_date?.split("T")[0] || "-"}</p>
                  </div>
                  <div>
                    <span className={cn(
                      "text-muted-foreground",
                      viewingItem.priority === 'urgent' && "text-red-600 dark:text-red-400 font-semibold"
                    )}>
                      Required Date:
                    </span>
                    <p className={cn(
                      "font-medium",
                      viewingItem.priority === 'urgent' && "text-red-600 dark:text-red-400 font-bold text-lg"
                    )}>
                      {viewingItem.required_date?.split("T")[0] || "-"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              {viewingItem.additional_instruction && (
                <div className="bg-muted/30 rounded-lg p-4">
                  <h4 className="font-semibold text-base mb-3 border-b pb-2">Additional Instructions</h4>
                  <div className="text-sm whitespace-pre-wrap">{viewingItem.additional_instruction}</div>
                </div>
              )}

              {/* Techpack Files */}
              {viewingItem.techpack_filename && (
                <div className="bg-muted/30 rounded-lg p-4">
                  <h4 className="font-semibold text-base mb-3 border-b pb-2">Techpack Files</h4>
                  <Button variant="outline" onClick={() => window.open(viewingItem.techpack_url, '_blank')}>
                    <FileText className="mr-2 h-4 w-4" />
                    {viewingItem.techpack_filename}
                    <ExternalLink className="ml-2 h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
