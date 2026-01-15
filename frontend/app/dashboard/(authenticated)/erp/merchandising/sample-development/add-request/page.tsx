"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { ArrowLeft, Loader2, Upload, FileText, Check, ChevronsUpDown, Plus, X, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { api } from "@/services/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const SAMPLE_CATEGORIES = ["Proto", "Fit", "PP", "SMS", "TOP", "Salesman", "Photo Shoot", "Production"];

export default function AddSampleRequestPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchParams = useSearchParams();
  
  // Check if we're editing (via URL query param)
  const editSampleId = searchParams.get("edit");
  const [isEditing, setIsEditing] = useState(false);

  // Fetch required data
  const { data: buyersData } = useQuery({
    queryKey: ["buyers"],
    queryFn: () => api.buyers.getAll(),
  });

  // Fetch yarn and trims from merchandiser (material-details)
  const { data: yarnsData, isLoading: yarnsLoading, error: yarnsError } = useQuery({
    queryKey: ["merchandiser", "yarn"],
    queryFn: async () => {
      try {
        const data = await api.merchandiser.yarn.getAll();
        console.log('[Yarn Fetch] Raw response:', data);
        console.log('[Yarn Fetch] Total yarns:', data?.length || 0);
        if (data && Array.isArray(data) && data.length > 0) {
          console.log('[Yarn Fetch] First yarn structure:', JSON.stringify(data[0], null, 2));
          // Return all yarns - yarn_id is required in the model, so all should have it
          return data;
        }
        return [];
      } catch (error) {
        console.error('[Yarn Fetch] Error:', error);
        return [];
      }
    },
  });

  const { data: trimsData } = useQuery({
    queryKey: ["merchandiser", "trims"],
    queryFn: async () => {
      try {
        return await api.merchandiser.trims.getAll();
      } catch (error) {
        console.error('Failed to fetch trims:', error);
        return [];
      }
    },
  });

  const { data: colorsData } = useQuery({
    queryKey: ["colors"],
    queryFn: async () => {
      try {
        const response = await fetch('/api/v1/color-master/colors');
        if (!response.ok) return [];
        return await response.json();
      } catch (error) {
        console.error('Failed to fetch colors:', error);
        return [];
      }
    },
  });

  const { data: sizesData } = useQuery({
    queryKey: ["size-charts"],
    queryFn: async () => {
      try {
        // Fetch all size charts from size_chart_master with full details
        const response = await fetch('/api/v1/size-charts');
        if (!response.ok) return [];
        const data = await response.json();
        // Extract unique sizes with their auto_generated_id (size_id) and all details
        const uniqueSizes = new Map();
        data.forEach((chart: any) => {
          if (chart.auto_generated_id && chart.size_name) {
            // Use auto_generated_id as the unique key and size_id
            uniqueSizes.set(chart.auto_generated_id, {
              id: chart.id,
              size_name: chart.size_name,
              size_id: chart.auto_generated_id, // Use auto_generated_id as size_id
              auto_generated_id: chart.auto_generated_id,
              profile_name: chart.profile_name || '',
              product_type_name: chart.product_type_name || '',
              gender: chart.gender || '',
              measurements: chart.measurements || {},
              size_order: chart.size_order || 0
            });
          }
        });
        return Array.from(uniqueSizes.values());
      } catch (error) {
        console.error('Failed to fetch sizes:', error);
        return [];
      }
    },
  });

  // Fetch all samples to find the one we're editing
  const { data: allSamplesData } = useQuery({
    queryKey: ["merchandiser", "samplePrimary"],
    queryFn: () => api.merchandiser.samplePrimary.getAll(),
    enabled: !!editSampleId,
  });

  // Helper function to format gauge for display (remove "GG" suffix)
  const formatGaugeForDisplay = (gauge: string): string => {
    if (!gauge) return "";
    return gauge.replace(/\s*GG\s*/gi, "").trim();
  };

  // Find the sample we're editing
  const sampleData = useMemo(() => {
    if (!editSampleId || !allSamplesData) return null;
    return Array.isArray(allSamplesData) 
      ? allSamplesData.find((s: any) => s.sample_id === editSampleId)
      : null;
  }, [editSampleId, allSamplesData]);

  // Load sample data into form when editing
  useEffect(() => {
    if (sampleData && editSampleId) {
      setIsEditing(true);
      // Parse additional_instruction if it's a string (from sync)
      let additionalInstructions = [];
      if (sampleData.additional_instruction) {
        if (typeof sampleData.additional_instruction === 'string') {
          // Split by newline and parse
          const lines = sampleData.additional_instruction.split('\n');
          additionalInstructions = lines.map((line: string) => {
            const trimmed = line.trim();
            const done = trimmed.startsWith('✓');
            const instruction = done ? trimmed.substring(1).trim() : trimmed;
            return { instruction, done };
          }).filter((item: any) => item.instruction);
        } else if (Array.isArray(sampleData.additional_instruction)) {
          additionalInstructions = sampleData.additional_instruction;
        }
      }
      
      // Parse decorative_part if it's a string
      let decorativeParts = [];
      if (sampleData.decorative_part) {
        if (typeof sampleData.decorative_part === 'string') {
          decorativeParts = sampleData.decorative_part.split(',').map((p: string) => p.trim()).filter(Boolean);
        } else if (Array.isArray(sampleData.decorative_part)) {
          decorativeParts = sampleData.decorative_part;
        }
      }
      
      setFormData({
        sample_id: sampleData.sample_id || "",
        buyer_id: sampleData.buyer_id?.toString() || "",
        buyer_name: sampleData.buyer_name || "",
        sample_name: sampleData.sample_name || "",
        item: sampleData.item || "",
        gauge: formatGaugeForDisplay(sampleData.gauge || ""),
        ply: sampleData.ply || "",
        sample_category: sampleData.sample_category || "Proto",
        yarn_ids: Array.isArray(sampleData.yarn_ids) ? sampleData.yarn_ids : (sampleData.yarn_ids ? [sampleData.yarn_ids] : []),
        yarn_id: sampleData.yarn_id || "",
        yarn_details: sampleData.yarn_details || "",
        component_yarn: sampleData.component_yarn || "",
        count: sampleData.count || "",
        trims_ids: Array.isArray(sampleData.trims_ids) ? sampleData.trims_ids : (sampleData.trims_ids ? [sampleData.trims_ids] : []),
        trims_details: sampleData.trims_details || "",
        decorative_part: decorativeParts,
        color_ids: Array.isArray(sampleData.color_ids) ? sampleData.color_ids : (sampleData.color_id ? [sampleData.color_id] : []),
        color_name: sampleData.color_name || "",
        size_ids: Array.isArray(sampleData.size_ids) ? sampleData.size_ids : (sampleData.size_id ? [sampleData.size_id] : []),
        size_names: Array.isArray(sampleData.size_names) ? sampleData.size_names : (sampleData.size_name ? [sampleData.size_name] : []),
        priority: sampleData.priority || "normal",
        yarn_handover_date: sampleData.yarn_handover_date ? new Date(sampleData.yarn_handover_date).toISOString().split('T')[0] : "",
        trims_handover_date: sampleData.trims_handover_date ? new Date(sampleData.trims_handover_date).toISOString().split('T')[0] : "",
        required_date: sampleData.required_date ? new Date(sampleData.required_date).toISOString().split('T')[0] : "",
        request_pcs: sampleData.request_pcs?.toString() || "",
        additional_instruction: additionalInstructions,
        techpack_files: Array.isArray(sampleData.techpack_files) ? sampleData.techpack_files : [],
      });
    }
  }, [sampleData, editSampleId]);

  const [formData, setFormData] = useState({
    sample_id: "",
    buyer_id: "",
    buyer_name: "",
    sample_name: "",
    item: "",
    gauge: "",
    ply: "",
    sample_category: "Proto",
    priority: "normal" as string,
    yarn_ids: [] as string[],
    yarn_id: "",
    yarn_details: "",
    component_yarn: "",
    count: "",
    trims_ids: [] as string[],
    trims_details: "",
    decorative_part: [] as string[],  // Array of decorative parts
    color_ids: [] as number[],  // Array of color IDs
    color_name: "",
    size_ids: [] as string[],  // Array of size IDs (auto_generated_id)
    size_names: [] as string[],  // Array of size names for display
    yarn_handover_date: "",
    trims_handover_date: "",
    required_date: "",
    request_pcs: "",
    additional_instruction: [] as Array<{instruction: string, done: boolean}>,  // Array of instructions with status
    techpack_files: [] as Array<{url: string, filename: string, type: string}>,  // Array of techpack files
  });

  const [buyerOpen, setBuyerOpen] = useState(false);
  const [buyerSearch, setBuyerSearch] = useState("");
  
  // Item dropdown state
  const [itemOpen, setItemOpen] = useState(false);
  const [itemSearch, setItemSearch] = useState("");
  const [items, setItems] = useState<string[]>(["Sweater", "T-Shirt", "Polo", "Hoodie", "Cardigan", "Vest", "Jacket", "Pants", "Shorts"]);
  
  // Gauge dropdown state
  const [gaugeOpen, setGaugeOpen] = useState(false);
  const [gaugeSearch, setGaugeSearch] = useState("");
  const [gauges, setGauges] = useState<string[]>(["12", "14", "16", "18", "20", "22", "24", "7", "10", "12,5", "14,5"]);

  // Color, Size, Yarn, and Trims dropdown state
  const [colorOpen, setColorOpen] = useState(false);
  const [sizeOpen, setSizeOpen] = useState(false);
  const [yarnOpen, setYarnOpen] = useState(false);
  const [trimsOpen, setTrimsOpen] = useState(false);

  // Mutation for creating sample
  const createPrimaryMutation = useMutation({
    mutationFn: (data: any) => api.merchandiser.samplePrimary.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchandiser", "samplePrimary"] });
      toast.success("Sample request created successfully");
      
      // Close this tab and navigate parent window back
      if (window.opener) {
        // Send message to parent to refresh data (for React Query)
        try {
          window.opener.postMessage({ type: 'SAMPLE_UPDATED', source: 'merchandising' }, '*');
        } catch (e) {
          // Ignore if postMessage fails
        }
        // Navigate parent window back to sample development page (will trigger refresh)
        window.opener.location.href = "/dashboard/erp/merchandising/sample-development";
        window.close();
      } else {
        // If not opened from another window, just navigate back
        router.push("/dashboard/erp/merchandising/sample-development");
      }
    },
    onError: (error: any) => {
      toast.error(`Failed to create sample: ${error.message}`);
    },
  });

  // Mutation for updating sample
  const updatePrimaryMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => api.merchandiser.samplePrimary.update(id, data),
    onSuccess: () => {
      // Invalidate both Merchandiser and Samples queries for bidirectional sync
      queryClient.invalidateQueries({ queryKey: ["merchandiser", "samplePrimary"] });
      queryClient.invalidateQueries({ queryKey: ["samples", "requests"] });
      toast.success("Sample request updated successfully and synced to Sample Department");
      
      // Close this tab and navigate parent window back
      if (window.opener) {
        // Send message to parent to refresh data (for React Query)
        try {
          window.opener.postMessage({ type: 'SAMPLE_UPDATED', source: 'merchandising' }, '*');
        } catch (e) {
          // Ignore if postMessage fails
        }
        // Navigate parent window back to sample development page (will trigger refresh)
        window.opener.location.href = "/dashboard/erp/merchandising/sample-development";
        window.close();
      } else {
        // If not opened from another window, just navigate back
        router.push("/dashboard/erp/merchandising/sample-development");
      }
    },
    onError: (error: any) => {
      toast.error(`Failed to update sample: ${error.message}`);
    },
  });

  const filteredBuyers = useMemo(() => {
    if (!buyerSearch || !buyersData) return buyersData || [];
    return buyersData.filter((b: any) =>
      b.buyer_name?.toLowerCase().includes(buyerSearch.toLowerCase()) ||
      b.brand_name?.toLowerCase().includes(buyerSearch.toLowerCase()) ||
      b.company_name?.toLowerCase().includes(buyerSearch.toLowerCase())
    );
  }, [buyersData, buyerSearch]);

  const handleBuyerSelect = (buyerId: string) => {
    const buyer = buyersData?.find((b: any) => b.id.toString() === buyerId);
    setFormData({ 
      ...formData, 
      buyer_id: buyerId, 
      buyer_name: buyer?.buyer_name || buyer?.brand_name || "" 
    });
    setBuyerOpen(false);
    setBuyerSearch("");
  };

  // Helper function to format gauge for storage (add "GG" suffix)
  const formatGaugeForStorage = (gauge: string): string => {
    if (!gauge) return "";
    // Split by comma, add GG to each number, then join
    return gauge
      .split(",")
      .map((g) => {
        const trimmed = g.trim();
        if (!trimmed) return "";
        // If already has GG, keep it; otherwise add GG
        return trimmed.match(/GG/i) ? trimmed : `${trimmed} GG`;
      })
      .filter(Boolean)
      .join(",");
  };

  const handleItemSelect = (item: string) => {
    setFormData({ ...formData, item });
    setItemOpen(false);
    setItemSearch("");
  };

  const handleAddNewItem = () => {
    const newItem = itemSearch.trim();
    if (newItem && !items.includes(newItem)) {
      setItems([...items, newItem]);
      setFormData({ ...formData, item: newItem });
      setItemOpen(false);
      setItemSearch("");
    }
  };

  const filteredItems = useMemo(() => {
    if (!itemSearch) return items;
    return items.filter((item) =>
      item.toLowerCase().includes(itemSearch.toLowerCase())
    );
  }, [items, itemSearch]);

  const handleGaugeSelect = (gauge: string) => {
    // Store with GG format
    const formattedGauge = formatGaugeForStorage(gauge);
    setFormData({ ...formData, gauge: formattedGauge });
    setGaugeOpen(false);
    setGaugeSearch("");
  };

  const handleAddNewGauge = () => {
    const newGauge = gaugeSearch.trim();
    if (newGauge) {
      // Format the new gauge with GG
      const formattedGauge = formatGaugeForStorage(newGauge);
      // Store in list without GG for display
      const displayGauge = formatGaugeForDisplay(formattedGauge);
      if (!gauges.includes(displayGauge)) {
        setGauges([...gauges, displayGauge]);
      }
      setFormData({ ...formData, gauge: formattedGauge });
      setGaugeOpen(false);
      setGaugeSearch("");
    }
  };

  const filteredGauges = useMemo(() => {
    if (!gaugeSearch) return gauges;
    return gauges.filter((gauge) =>
      gauge.toLowerCase().includes(gaugeSearch.toLowerCase())
    );
  }, [gauges, gaugeSearch]);

  // Handlers for multiple decorative parts
  const [newDecorativePart, setNewDecorativePart] = useState("");
  const addDecorativePart = () => {
    if (newDecorativePart.trim()) {
      setFormData({
        ...formData,
        decorative_part: [...formData.decorative_part, newDecorativePart.trim()],
      });
      setNewDecorativePart("");
    }
  };
  const removeDecorativePart = (index: number) => {
    setFormData({
      ...formData,
      decorative_part: formData.decorative_part.filter((_, i) => i !== index),
    });
  };

  // Handlers for multiple additional instructions
  const [newInstruction, setNewInstruction] = useState("");
  const addInstruction = () => {
    if (newInstruction.trim()) {
      setFormData({
        ...formData,
        additional_instruction: [...formData.additional_instruction, { instruction: newInstruction.trim(), done: false }],
      });
      setNewInstruction("");
    }
  };
  const removeInstruction = (index: number) => {
    setFormData({
      ...formData,
      additional_instruction: formData.additional_instruction.filter((_, i) => i !== index),
    });
  };
  const toggleInstructionDone = (index: number) => {
    const updated = [...formData.additional_instruction];
    updated[index] = { ...updated[index], done: !updated[index].done };
    setFormData({ ...formData, additional_instruction: updated });
  };

  // Handlers for multiple techpack files
  const handleTechpackFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fileType: string) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    
    const newFiles = files.map(file => ({
      filename: file.name,
      url: URL.createObjectURL(file), // Temporary URL, replace with server URL in production
      type: fileType,
    }));
    
    setFormData({
      ...formData,
      techpack_files: [...formData.techpack_files, ...newFiles],
    });
  };
  const removeTechpackFile = (index: number) => {
    setFormData({
      ...formData,
      techpack_files: formData.techpack_files.filter((_, i) => i !== index),
    });
  };
  const openSpecSheetGenerator = () => {
    window.open("/dashboard/erp/merchandising/sample-development/spec-sheet", "_blank");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prepare data for backend
    const submitData: any = {
      ...formData,
      buyer_id: parseInt(formData.buyer_id),
      request_pcs: formData.request_pcs ? parseInt(formData.request_pcs) : null,
      // Convert date strings to ISO format or null
      yarn_handover_date: formData.yarn_handover_date ? new Date(formData.yarn_handover_date).toISOString() : null,
      trims_handover_date: formData.trims_handover_date ? new Date(formData.trims_handover_date).toISOString() : null,
      required_date: formData.required_date ? new Date(formData.required_date).toISOString() : null,
      // Ensure arrays are included (even if empty, backend expects arrays)
      decorative_part: formData.decorative_part || [],
      additional_instruction: formData.additional_instruction || [],
      techpack_files: formData.techpack_files || [],
      // Set size_id from size_ids array (use first one for backward compatibility)
      size_id: formData.size_ids && formData.size_ids.length > 0 ? formData.size_ids[0] : null,
      size_name: formData.size_names && formData.size_names.length > 0 ? formData.size_names.join(', ') : null,
    };
    
    // Set yarn_id from yarn_ids array if not set (for backward compatibility)
    if (!submitData.yarn_id && submitData.yarn_ids && submitData.yarn_ids.length > 0) {
      submitData.yarn_id = submitData.yarn_ids[0];
    }
    // Ensure yarn_ids is always an array
    if (!submitData.yarn_ids || !Array.isArray(submitData.yarn_ids)) {
      submitData.yarn_ids = submitData.yarn_id ? [submitData.yarn_id] : [];
    }
    
    // Remove size_names from submit (not needed by backend)
    delete submitData.size_names;
    
    // For updates, exclude sample_id (it shouldn't change)
    if (isEditing && editSampleId) {
      delete submitData.sample_id;
      updatePrimaryMutation.mutate({ id: editSampleId, data: submitData });
    } else {
      // Only include sample_id if it's not empty (backend will auto-generate if empty)
      if (!formData.sample_id || formData.sample_id.trim() === "") {
        delete submitData.sample_id;
      }
      createPrimaryMutation.mutate(submitData);
    }
  };

  const selectedBuyer = buyersData?.find((b: any) => b.id.toString() === formData.buyer_id);

  return (
    <div className="container mx-auto py-6 px-4 max-w-[1600px]">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => {
            if (window.opener) {
              window.close();
            } else {
              router.push("/dashboard/erp/merchandising/sample-development");
            }
          }}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>{isEditing ? "Edit Sample Request" : "Create New Sample Request"}</CardTitle>
            <CardDescription>
              {isEditing 
                ? "Update the sample request details below"
                : "Fill in the details to create a new sample request. Sample ID will be auto-generated if left empty."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Row 1: Buyer, Sample Name, Item, Category, Priority, Gauge, PLY, Colors, Sizes - 9 columns */}
              <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(9, minmax(0, 1fr))' }}>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Buyer *</Label>
                  <Popover open={buyerOpen} onOpenChange={setBuyerOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" role="combobox" aria-expanded={buyerOpen} className="w-full justify-between h-10 text-sm">
                        {selectedBuyer ? (selectedBuyer.buyer_name || selectedBuyer.brand_name) : "Select..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[350px] p-0">
                      <Command>
                        <CommandInput placeholder="Search buyer..." value={buyerSearch} onValueChange={setBuyerSearch} />
                        <CommandList>
                          <CommandEmpty>No buyer found.</CommandEmpty>
                          <CommandGroup>
                            {filteredBuyers.map((b: any) => (
                              <CommandItem key={b.id} value={b.id.toString()} onSelect={() => handleBuyerSelect(b.id.toString())}>
                                <Check className={cn("mr-2 h-4 w-4", formData.buyer_id === b.id.toString() ? "opacity-100" : "opacity-0")} />
                                {b.buyer_name || b.brand_name} {b.company_name ? `- ${b.company_name}` : ""}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Sample Name *</Label>
                  <Input className="h-10" value={formData.sample_name} onChange={(e) => setFormData({ ...formData, sample_name: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Item</Label>
                  <Popover open={itemOpen} onOpenChange={setItemOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" role="combobox" aria-expanded={itemOpen} className="w-full justify-between h-10 text-sm">
                        {formData.item || "Select item..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0">
                      <Command>
                        <CommandInput 
                          placeholder="Search or add item..." 
                          value={itemSearch} 
                          onValueChange={setItemSearch}
                        />
                        <CommandList>
                          <CommandEmpty>
                            {itemSearch ? (
                              <div className="py-2">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  className="w-full justify-start"
                                  onClick={handleAddNewItem}
                                >
                                  <Plus className="mr-2 h-4 w-4" />
                                  Add "{itemSearch}"
                                </Button>
                              </div>
                            ) : (
                              "No item found."
                            )}
                          </CommandEmpty>
                          <CommandGroup>
                            {filteredItems.map((item) => (
                              <CommandItem
                                key={item}
                                value={item}
                                onSelect={() => handleItemSelect(item)}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    formData.item === item ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {item}
                              </CommandItem>
                            ))}
                            {itemSearch && !filteredItems.includes(itemSearch) && (
                              <CommandItem
                                value={`add-${itemSearch}`}
                                onSelect={handleAddNewItem}
                                className="text-primary"
                              >
                                <Plus className="mr-2 h-4 w-4" />
                                Add "{itemSearch}"
                              </CommandItem>
                            )}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Category *</Label>
                  <Select value={formData.sample_category} onValueChange={(v) => setFormData({ ...formData, sample_category: v })}>
                    <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {SAMPLE_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Priority *</Label>
                  <Select value={formData.priority} onValueChange={(v) => setFormData({ ...formData, priority: v })}>
                    <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="urgent">Urgent - Instant Needed</SelectItem>
                      <SelectItem value="high">High Priority</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="low">Low Priority</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Gauge</Label>
                  <Popover open={gaugeOpen} onOpenChange={setGaugeOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" role="combobox" aria-expanded={gaugeOpen} className="w-full justify-between h-10 text-sm">
                        {formatGaugeForDisplay(formData.gauge) || "Select gauge..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0">
                      <Command>
                        <CommandInput 
                          placeholder="Search or add gauge (e.g., 12 or 12,5)..." 
                          value={gaugeSearch} 
                          onValueChange={setGaugeSearch}
                        />
                        <CommandList>
                          <CommandEmpty>
                            {gaugeSearch ? (
                              <div className="py-2">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  className="w-full justify-start"
                                  onClick={handleAddNewGauge}
                                >
                                  <Plus className="mr-2 h-4 w-4" />
                                  Add "{gaugeSearch}"
                                </Button>
                              </div>
                            ) : (
                              "No gauge found."
                            )}
                          </CommandEmpty>
                          <CommandGroup>
                            {filteredGauges.map((gauge) => (
                              <CommandItem
                                key={gauge}
                                value={gauge}
                                onSelect={() => handleGaugeSelect(gauge)}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    formatGaugeForDisplay(formData.gauge) === gauge ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {gauge}
                              </CommandItem>
                            ))}
                            {gaugeSearch && !filteredGauges.some(g => g.toLowerCase() === gaugeSearch.toLowerCase()) && (
                              <CommandItem
                                value={`add-${gaugeSearch}`}
                                onSelect={handleAddNewGauge}
                                className="text-primary"
                              >
                                <Plus className="mr-2 h-4 w-4" />
                                Add "{gaugeSearch}"
                              </CommandItem>
                            )}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">PLY</Label>
                  <Input className="h-10" type="number" value={formData.ply} onChange={(e) => setFormData({ ...formData, ply: e.target.value })} placeholder="2" />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Colors</Label>
                  <Popover open={colorOpen} onOpenChange={setColorOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" role="combobox" className="w-full justify-between h-10 text-sm">
                        {formData.color_ids.length > 0 
                          ? `${formData.color_ids.length} color(s) selected`
                          : "Select colors..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[250px] p-0">
                      <Command>
                        <CommandInput placeholder="Search colors..." />
                        <CommandEmpty>No colors found.</CommandEmpty>
                        <CommandList>
                          <CommandGroup>
                            {(colorsData || []).map((color: any) => (
                              <CommandItem
                                key={color.id}
                                value={color.color_name}
                                onSelect={() => {
                                  const isSelected = formData.color_ids.includes(color.id);
                                  setFormData({
                                    ...formData,
                                    color_ids: isSelected
                                      ? formData.color_ids.filter(id => id !== color.id)
                                      : [...formData.color_ids, color.id]
                                  });
                                }}
                              >
                                <div className="flex items-center w-full">
                                  <Check className={cn("mr-2 h-4 w-4", formData.color_ids.includes(color.id) ? "opacity-100" : "opacity-0")} />
                                  <div className="flex items-center gap-2 flex-1">
                                    {color.hex_code && (
                                      <div 
                                        className="w-4 h-4 rounded border" 
                                        style={{ backgroundColor: color.hex_code }}
                                      />
                                    )}
                                    <span className="text-sm">{color.color_name}</span>
                                  </div>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Sizes</Label>
                  <Popover open={sizeOpen} onOpenChange={setSizeOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" role="combobox" className="w-full justify-between h-10 text-sm">
                        {formData.size_ids.length > 0 
                          ? `${formData.size_ids.length} size(s) selected`
                          : "Select sizes..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[600px] p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Search by size ID, name, profile, or product type..." />
                        <CommandEmpty>No sizes found.</CommandEmpty>
                        <CommandList className="max-h-[400px]">
                          <CommandGroup>
                            {(sizesData || []).map((size: any) => {
                              const isSelected = formData.size_ids.includes(size.size_id);
                              return (
                                <CommandItem
                                  key={size.size_id}
                                  value={`${size.size_id} ${size.size_name} ${size.profile_name || ''} ${size.product_type_name || ''}`}
                                  onSelect={() => {
                                    setFormData({
                                      ...formData,
                                      size_ids: isSelected
                                        ? formData.size_ids.filter(id => id !== size.size_id)
                                        : [...formData.size_ids, size.size_id],
                                      size_names: isSelected
                                        ? formData.size_names.filter(name => name !== size.size_name)
                                        : [...formData.size_names, size.size_name]
                                    });
                                  }}
                                  className="p-3"
                                >
                                  <div className="flex items-start gap-3 w-full">
                                    <Check className={cn("mt-1 h-4 w-4 shrink-0", isSelected ? "opacity-100" : "opacity-0")} />
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="text-sm font-medium">{size.size_id}</span>
                                        <span className="text-xs text-muted-foreground">({size.size_name})</span>
                                      </div>
                                      <div className="text-xs text-muted-foreground space-y-0.5">
                                        {size.profile_name && (
                                          <div>Profile: <span className="font-medium">{size.profile_name}</span></div>
                                        )}
                                        {size.product_type_name && (
                                          <div>Product Type: <span className="font-medium">{size.product_type_name}</span></div>
                                        )}
                                        {size.gender && (
                                          <div>Gender: <span className="font-medium">{size.gender}</span></div>
                                        )}
                                        {size.measurements && Object.keys(size.measurements).length > 0 && (
                                          <div className="mt-1">
                                            <span className="font-medium">Measurements: </span>
                                            <span className="text-xs">
                                              {Object.entries(size.measurements).slice(0, 3).map(([key, value]) => (
                                                <span key={key} className="mr-2">{key}: {String(value)}</span>
                                              ))}
                                              {Object.keys(size.measurements).length > 3 && (
                                                <span className="text-muted-foreground">+{Object.keys(size.measurements).length - 3} more</span>
                                              )}
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </CommandItem>
                              );
                            })}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Row 2: Request Pcs, Yarn ID, Trims ID, Yarn Handover Date, Trims Handover Date, Required Date - 6 columns */}
              <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(6, minmax(0, 1fr))' }}>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Request Pcs</Label>
                  <Input className="h-10" type="number" value={formData.request_pcs} onChange={(e) => setFormData({ ...formData, request_pcs: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Yarn ID</Label>
                  <Popover open={yarnOpen} onOpenChange={setYarnOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" role="combobox" className="w-full justify-between h-10 text-sm">
                        {yarnsLoading ? (
                          "Loading..."
                        ) : formData.yarn_ids && formData.yarn_ids.length > 0 ? (
                          `${formData.yarn_ids.length} yarn(s) selected`
                        ) : (
                          "Select yarn..."
                        )}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0">
                      <Command>
                        <CommandInput placeholder="Search yarns..." />
                        {yarnsLoading ? (
                          <CommandList>
                            <div className="px-2 py-6 text-center text-sm text-muted-foreground">Loading yarns...</div>
                          </CommandList>
                        ) : yarnsError ? (
                          <CommandList>
                            <div className="px-2 py-6 text-center text-sm text-red-500">Error loading yarns</div>
                          </CommandList>
                        ) : (
                          <>
                            <CommandEmpty>No yarns found.</CommandEmpty>
                            <CommandList>
                              <CommandGroup>
                                {(yarnsData || []).map((yarn: any) => {
                                  const yarnId = yarn.yarn_id;
                                  const yarnName = yarn.yarn_name || 'No name';
                                  if (!yarnId) {
                                    console.warn('[Yarn Render] Yarn without ID:', yarn);
                                    return null;
                                  }
                                  const isSelected = formData.yarn_ids.includes(yarnId);
                                  return (
                                    <CommandItem
                                      key={yarnId}
                                      value={`${yarnId} ${yarnName}`}
                                      onSelect={() => {
                                        setFormData({
                                          ...formData,
                                          yarn_ids: isSelected
                                            ? formData.yarn_ids.filter(id => id !== yarnId)
                                            : [...formData.yarn_ids, yarnId]
                                        });
                                      }}
                                    >
                                      <Check className={cn("mr-2 h-4 w-4", isSelected ? "opacity-100" : "opacity-0")} />
                                      <div className="flex flex-col">
                                        <span className="text-sm font-medium">{yarnId}</span>
                                        <span className="text-xs text-muted-foreground">{yarnName}</span>
                                      </div>
                                    </CommandItem>
                                  );
                                })}
                              </CommandGroup>
                            </CommandList>
                          </>
                        )}
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Trims</Label>
                  <Popover open={trimsOpen} onOpenChange={setTrimsOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" role="combobox" className="w-full justify-between h-10 text-sm">
                        {formData.trims_ids && formData.trims_ids.length > 0 
                          ? `${formData.trims_ids.length} trim(s) selected`
                          : "Select trims..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0">
                      <Command>
                        <CommandInput placeholder="Search trims..." />
                        <CommandEmpty>No trims found.</CommandEmpty>
                        <CommandList>
                          <CommandGroup>
                            {(trimsData || []).map((trim: any) => (
                              <CommandItem
                                key={trim.product_id}
                                value={`${trim.product_id} ${trim.product_name}`}
                                onSelect={() => {
                                  const isSelected = formData.trims_ids.includes(trim.product_id);
                                  setFormData({
                                    ...formData,
                                    trims_ids: isSelected
                                      ? formData.trims_ids.filter(id => id !== trim.product_id)
                                      : [...formData.trims_ids, trim.product_id]
                                  });
                                }}
                              >
                                <Check className={cn("mr-2 h-4 w-4", formData.trims_ids.includes(trim.product_id) ? "opacity-100" : "opacity-0")} />
                                <div className="flex flex-col">
                                  <span className="text-sm font-medium">{trim.product_id}</span>
                                  <span className="text-xs text-muted-foreground">{trim.product_name}</span>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Yarn Handover Date</Label>
                  <Input className="h-10" type="date" value={formData.yarn_handover_date} onChange={(e) => setFormData({ ...formData, yarn_handover_date: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Trims Handover Date</Label>
                  <Input className="h-10" type="date" value={formData.trims_handover_date} onChange={(e) => setFormData({ ...formData, trims_handover_date: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Required Date</Label>
                  <Input className="h-10" type="date" value={formData.required_date} onChange={(e) => setFormData({ ...formData, required_date: e.target.value })} />
                </div>
              </div>

              {/* Row 3: Yarn Details, Trims Details - 2 columns */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Yarn Details</Label>
                  <Input className="h-10" value={formData.yarn_details} onChange={(e) => setFormData({ ...formData, yarn_details: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Trims Details</Label>
                  <Input className="h-10" value={formData.trims_details} onChange={(e) => setFormData({ ...formData, trims_details: e.target.value })} />
                </div>
              </div>

              {/* Row 4: Decorative Part (moved below yarn details, above additional instruction) */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Decorative Part</Label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input 
                      className="h-10 flex-1" 
                      value={newDecorativePart} 
                      onChange={(e) => setNewDecorativePart(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addDecorativePart())}
                      placeholder="Enter decorative part..." 
                    />
                    <Button type="button" onClick={addDecorativePart} size="sm" className="h-10">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {formData.decorative_part.length > 0 && (
                    <div className="space-y-2 border rounded-lg p-3">
                      {formData.decorative_part.map((part, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="flex-1 text-sm">{part}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeDecorativePart(idx)}
                            className="h-6 w-6 p-0"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Row 5: Additional Instructions (full width with multiple entries) */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Additional Instructions</Label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input 
                      className="h-10 flex-1" 
                      value={newInstruction} 
                      onChange={(e) => setNewInstruction(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInstruction())}
                      placeholder="Enter instruction..." 
                    />
                    <Button type="button" onClick={addInstruction} size="sm" className="h-10">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {formData.additional_instruction.length > 0 && (
                    <div className="space-y-2 border rounded-lg p-3">
                      {formData.additional_instruction.map((inst, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <input
                            type="checkbox"
                            checked={inst.done}
                            onChange={() => toggleInstructionDone(idx)}
                            className="mt-1"
                          />
                          <span className={cn("flex-1 text-sm", inst.done && "line-through text-muted-foreground")}>
                            {inst.instruction}
                          </span>
                          {inst.done && <Badge variant="secondary" className="text-xs">Done</Badge>}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeInstruction(idx)}
                            className="h-6 w-6 p-0"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Row 5: Attach Techpack (multiple files with types) */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Attach Techpack Files</Label>
                <div className="space-y-3 border rounded-lg p-4">
                  <div className="flex gap-2 flex-wrap">
                    <input
                      type="file"
                      id="techpack-spec-sheet"
                      accept=".xls,.xlsx"
                      onChange={(e) => handleTechpackFileUpload(e, "spec-sheet")}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById("techpack-spec-sheet")?.click()}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Spec Sheet
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={openSpecSheetGenerator}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Generate Spec Sheet
                    </Button>
                    <input
                      type="file"
                      id="techpack-pdf"
                      accept=".pdf"
                      onChange={(e) => handleTechpackFileUpload(e, "pdf")}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById("techpack-pdf")?.click()}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      PDF
                    </Button>
                    <input
                      type="file"
                      id="techpack-image"
                      accept=".png,.jpg,.jpeg"
                      onChange={(e) => handleTechpackFileUpload(e, "image")}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById("techpack-image")?.click()}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Image
                    </Button>
                    <input
                      type="file"
                      id="techpack-excel"
                      accept=".xls,.xlsx"
                      onChange={(e) => handleTechpackFileUpload(e, "excel")}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById("techpack-excel")?.click()}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Excel
                    </Button>
                  </div>
                  {formData.techpack_files.length > 0 && (
                    <div className="space-y-2">
                      {formData.techpack_files.map((file, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-muted p-2 rounded text-sm">
                          <Badge variant="secondary" className="text-xs">{file.type}</Badge>
                          <span className="flex-1">{file.filename}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(file.url, '_blank')}
                            className="h-6 w-6 p-0"
                          >
                            <FileText className="h-3 w-3" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeTechpackFile(idx)}
                            className="h-6 w-6 p-0"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end gap-4 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    if (window.opener) {
                      window.close();
                    } else {
                      router.push("/dashboard/erp/merchandising/sample-development");
                    }
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createPrimaryMutation.isPending}>
                  {createPrimaryMutation.isPending || updatePrimaryMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isEditing ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    isEditing ? "Update Sample" : "Create Sample"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

