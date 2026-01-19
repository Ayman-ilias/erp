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
import { ColorSelector, type SelectedColor } from "@/components/sizecolor/ColorSelector";
import { SizeSelector, type SelectedSize } from "@/components/sizecolor/SizeSelector";
import { EnhancedColorSelector, type EnhancedSelectedColor } from "@/components/sizecolor/EnhancedColorSelector";
import { EnhancedSizeSelector, type EnhancedSelectedSize } from "@/components/sizecolor/EnhancedSizeSelector";

const DEFAULT_SAMPLE_CATEGORIES = ["Proto", "Fit", "PP", "SMS", "TOP", "Salesman", "Photo Shoot", "Production"];

// Multi-step form wizard steps
const WIZARD_STEPS = [
  { id: 1, name: "Basic Info", description: "Buyer, Sample Name, Category" },
  { id: 2, name: "Specifications", description: "Gauge, PLY, Colors, Sizes" },
  { id: 3, name: "Materials", description: "Yarn, Trims & Details" },
  { id: 4, name: "Dates", description: "Handover & Required Dates" },
  { id: 5, name: "Additional", description: "Decorative Parts & Instructions" },
  { id: 6, name: "Files", description: "Techpack & Attachments" },
  { id: 7, name: "Review", description: "Preview & Submit" },
];

export default function AddSampleRequestPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchParams = useSearchParams();

  // Check if we're editing (via URL query param)
  const editSampleId = searchParams.get("edit");
  const [isEditing, setIsEditing] = useState(false);

  // Wizard state
  const [currentStep, setCurrentStep] = useState(1);

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

  // Note: Colors and Sizes are now fetched by the ColorSelector and SizeSelector components
  // using the new sizecolor hooks (useUniversalColorsForSelector, useHMColorsForSelector, useSizesForSelector)

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
      // Start on review page when editing
      setCurrentStep(7);
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
    ply: "" as string | number,
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
    color_ids: [] as number[],  // Array of color IDs (legacy)
    color_name: "",
    size_ids: [] as string[],  // Array of size IDs (legacy)
    size_names: [] as string[],  // Array of size names for display (legacy)
    yarn_handover_date: "",
    trims_handover_date: "",
    required_date: "",
    request_pcs: "",
    additional_instruction: [] as Array<{instruction: string, done: boolean}>,  // Array of instructions with status
    techpack_files: [] as Array<{url: string, filename: string, type: string}>,  // Array of techpack files
  });

  // New color and size selection state using the redesigned components
  const [selectedColors, setSelectedColors] = useState<SelectedColor[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<SelectedSize[]>([]);

  // Enhanced color and size selection state using the enhanced components
  const [enhancedSelectedColors, setEnhancedSelectedColors] = useState<EnhancedSelectedColor[]>([]);
  const [enhancedSelectedSizes, setEnhancedSelectedSizes] = useState<EnhancedSelectedSize[]>([]);

  // Feature flag to switch between legacy and enhanced selectors
  const [useEnhancedSelectors, setUseEnhancedSelectors] = useState(true);

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

  // Category dropdown state
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");
  const [categories, setCategories] = useState<string[]>(DEFAULT_SAMPLE_CATEGORIES);

  // Yarn and Trims dropdown state (Colors and Sizes now use dedicated selector components)
  const [yarnOpen, setYarnOpen] = useState(false);
  const [trimsOpen, setTrimsOpen] = useState(false);

  // Mutation for creating sample
  const createPrimaryMutation = useMutation({
    mutationFn: (data: any) => api.merchandiser.samplePrimary.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchandiser", "samplePrimary"] });
      queryClient.invalidateQueries({ queryKey: ["samples", "requests"] });
      toast.success("Sample request created successfully");
      
      // Close this tab and navigate parent window back
      if (window.opener) {
        // Send message to parent to refresh data (for React Query)
        try {
          window.opener.postMessage({ type: 'SAMPLE_UPDATED', source: 'merchandising' }, '*');
        } catch (e) {
          // Ignore if postMessage fails
        }
        // Close this window - parent will refresh via postMessage
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
        // Close this window - parent will refresh via postMessage
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

  const handleCategorySelect = (category: string) => {
    setFormData({ ...formData, sample_category: category });
    setCategoryOpen(false);
    setCategorySearch("");
  };

  const handleAddNewCategory = () => {
    const newCategory = categorySearch.trim();
    if (newCategory && !categories.includes(newCategory)) {
      setCategories([...categories, newCategory]);
      setFormData({ ...formData, sample_category: newCategory });
      setCategoryOpen(false);
      setCategorySearch("");
    }
  };

  const filteredCategories = useMemo(() => {
    if (!categorySearch) return categories;
    return categories.filter((category) =>
      category.toLowerCase().includes(categorySearch.toLowerCase())
    );
  }, [categories, categorySearch]);

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
      // ply must be string or null (not integer)
      ply: formData.ply && String(formData.ply).trim() !== "" ? String(formData.ply).trim() : null,
      // Convert date strings to ISO format or null
      yarn_handover_date: formData.yarn_handover_date ? new Date(formData.yarn_handover_date).toISOString() : null,
      trims_handover_date: formData.trims_handover_date ? new Date(formData.trims_handover_date).toISOString() : null,
      required_date: formData.required_date ? new Date(formData.required_date).toISOString() : null,
      // Keep arrays as arrays for backend (backend expects List[str] and List[Dict])
      decorative_part: Array.isArray(formData.decorative_part) && formData.decorative_part.length > 0
        ? formData.decorative_part
        : null,
      additional_instruction: Array.isArray(formData.additional_instruction) && formData.additional_instruction.length > 0
        ? formData.additional_instruction
        : null,
      techpack_files: formData.techpack_files && formData.techpack_files.length > 0 ? formData.techpack_files : null,

      // Enhanced color selection data from EnhancedColorSelector component
      selected_colors: useEnhancedSelectors && enhancedSelectedColors.length > 0 ? enhancedSelectedColors.map(c => ({
        color_id: c.id,
        color_type: "universal", // Enhanced selector uses universal colors
        color_code: c.color_code,
        color_name: c.color_name,
        hex_code: c.hex_code,
        display_name: c.display_name || c.color_name,
        pantone_code: c.pantone_code,
        ral_code: c.ral_code,
        color_family: c.color_family,
        color_category: c.color_category
      })) : selectedColors.length > 0 ? selectedColors.map(c => ({
        color_id: c.id,
        color_type: c.type,  // "universal" or "hm"
        color_code: c.code,
        color_name: c.name,
        hex_code: c.hex_code,
      })) : null,

      // Legacy color_ids for backward compatibility
      color_ids: useEnhancedSelectors 
        ? enhancedSelectedColors.map(c => c.id)
        : selectedColors.filter(c => c.type === "universal").map(c => c.id),
      color_name: useEnhancedSelectors
        ? enhancedSelectedColors.map(c => c.color_name).join(", ") || null
        : selectedColors.map(c => c.name).join(", ") || null,

      // Enhanced size selection data from EnhancedSizeSelector component
      selected_sizes: useEnhancedSelectors && enhancedSelectedSizes.length > 0 ? enhancedSelectedSizes.map(s => ({
        size_id: s.id,
        size_code: s.size_code,
        size_name: s.size_name,
        size_label: s.size_label,
        garment_type_id: s.garment_type_id,
        garment_type_name: s.garment_type_name,
        gender: s.gender,
        age_group: s.age_group,
        fit_type: s.fit_type,
        measurements: s.measurements
      })) : selectedSizes.length > 0 ? selectedSizes.map(s => ({
        size_id: s.id,
        size_code: s.size_code,
        size_name: s.size_name,
        garment_type_name: s.garment_type_name,
        gender: s.gender,
        age_group: s.age_group,
        fit_type: s.fit_type,
      })) : null,

      // Legacy size_id and size_name for backward compatibility
      size_id: useEnhancedSelectors
        ? (enhancedSelectedSizes.length > 0 ? enhancedSelectedSizes[0].size_code : null)
        : (selectedSizes.length > 0 ? selectedSizes[0].size_code : null),
      size_ids: useEnhancedSelectors
        ? enhancedSelectedSizes.map(s => s.size_code)
        : selectedSizes.map(s => s.size_code),
      size_name: useEnhancedSelectors
        ? enhancedSelectedSizes.map(s => s.size_name).join(", ") || null
        : selectedSizes.map(s => s.size_name).join(", ") || null,
    };

    // Set yarn_id from yarn_ids array if not set (for backward compatibility)
    if (!submitData.yarn_id && submitData.yarn_ids && submitData.yarn_ids.length > 0) {
      submitData.yarn_id = submitData.yarn_ids[0];
    }
    // Ensure yarn_ids is always an array
    if (!submitData.yarn_ids || !Array.isArray(submitData.yarn_ids)) {
      submitData.yarn_ids = submitData.yarn_id ? [submitData.yarn_id] : [];
    }

    // For updates, exclude sample_id (it shouldn't change) and use sample_id as identifier
    if (isEditing && sampleData?.sample_id) {
      delete submitData.sample_id;
      updatePrimaryMutation.mutate({ id: sampleData.sample_id, data: submitData });
    } else {
      // Only include sample_id if it's not empty (backend will auto-generate if empty)
      if (!formData.sample_id || formData.sample_id.trim() === "") {
        delete submitData.sample_id;
      }
      createPrimaryMutation.mutate(submitData);
    }
  };

  const selectedBuyer = buyersData?.find((b: any) => b.id.toString() === formData.buyer_id);

  // Navigation handlers
  const goToNextStep = () => {
    if (currentStep < WIZARD_STEPS.length) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToStep = (step: number) => {
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Progress Tracker Component
  const ProgressTracker = () => (
    <div className="bg-white border rounded-lg p-6 mb-6 shadow-sm">
      <div className="flex items-center justify-between">
        {WIZARD_STEPS.map((step, index) => {
          // In edit mode, show all steps as completed (green) except current
          const isCompleted = isEditing ? step.id !== currentStep : currentStep > step.id;
          const isCurrent = currentStep === step.id;

          return (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <button
                  onClick={() => goToStep(step.id)}
                  disabled={!isEditing && step.id > currentStep}
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all",
                    isCurrent
                      ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                      : isCompleted
                      ? "bg-green-500 text-white cursor-pointer hover:bg-green-600"
                      : "bg-muted text-muted-foreground cursor-not-allowed"
                  )}
                >
                  {isCompleted ? <Check className="h-5 w-5" /> : step.id}
                </button>
                <div className="text-center mt-2">
                  <div className={cn(
                    "text-sm font-medium",
                    isCurrent ? "text-primary" : "text-muted-foreground"
                  )}>
                    {step.name}
                  </div>
                  <div className="text-xs text-muted-foreground">{step.description}</div>
                </div>
              </div>
              {index < WIZARD_STEPS.length - 1 && (
                <div className={cn(
                  "h-1 flex-1 mx-2 rounded transition-all",
                  isCompleted ? "bg-green-500" : "bg-muted"
                )} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="container mx-auto px-6 max-w-[1800px]">
        <Button
          variant="ghost"
          onClick={() => {
            if (window.opener) {
              window.close();
            } else {
              router.push("/dashboard/erp/merchandising/sample-development");
            }
          }}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Sample Development
        </Button>

        <ProgressTracker />

        <Card className="shadow-lg">
          <CardHeader className="border-b bg-card">
            <CardTitle className="text-2xl">
              {isEditing ? "Edit Sample Request" : "Create New Sample Request"}
            </CardTitle>
            <CardDescription className="text-base">
              Step {currentStep} of {WIZARD_STEPS.length}: {WIZARD_STEPS[currentStep - 1].name}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Step 1: Basic Information */}
              {currentStep === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Basic Information</h3>
                <div className="grid grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Buyer *</Label>
                    <Popover open={buyerOpen} onOpenChange={setBuyerOpen}>
                      <PopoverTrigger asChild>
                        <Button variant="outline" role="combobox" aria-expanded={buyerOpen} className="w-full justify-between h-11">
                          {selectedBuyer ? (selectedBuyer.buyer_name || selectedBuyer.brand_name) : "Select buyer..."}
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
                    <Input className="h-11" value={formData.sample_name} onChange={(e) => setFormData({ ...formData, sample_name: e.target.value })} required placeholder="Enter sample name" />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Item</Label>
                    <Popover open={itemOpen} onOpenChange={setItemOpen}>
                      <PopoverTrigger asChild>
                        <Button variant="outline" role="combobox" aria-expanded={itemOpen} className="w-full justify-between h-11">
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
                </div>

                <div className="grid grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Category *</Label>
                    <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
                      <PopoverTrigger asChild>
                        <Button variant="outline" role="combobox" aria-expanded={categoryOpen} className="w-full justify-between h-11">
                          {formData.sample_category || "Select category..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[300px] p-0">
                        <Command>
                          <CommandInput
                            placeholder="Search or add category..."
                            value={categorySearch}
                            onValueChange={setCategorySearch}
                          />
                          <CommandList>
                            <CommandEmpty>
                              {categorySearch ? (
                                <div className="py-2">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    className="w-full justify-start"
                                    onClick={handleAddNewCategory}
                                  >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add "{categorySearch}"
                                  </Button>
                                </div>
                              ) : (
                                "No category found."
                              )}
                            </CommandEmpty>
                            <CommandGroup>
                              {filteredCategories.map((category) => (
                                <CommandItem
                                  key={category}
                                  value={category}
                                  onSelect={() => handleCategorySelect(category)}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      formData.sample_category === category ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  {category}
                                </CommandItem>
                              ))}
                              {categorySearch && !filteredCategories.some(c => c.toLowerCase() === categorySearch.toLowerCase()) && (
                                <CommandItem
                                  value={`add-${categorySearch}`}
                                  onSelect={handleAddNewCategory}
                                  className="text-primary"
                                >
                                  <Plus className="mr-2 h-4 w-4" />
                                  Add "{categorySearch}"
                                </CommandItem>
                              )}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Priority *</Label>
                    <Select value={formData.priority} onValueChange={(v) => setFormData({ ...formData, priority: v })}>
                      <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="urgent">Urgent - Instant Needed</SelectItem>
                        <SelectItem value="high">High Priority</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="low">Low Priority</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Request Pieces</Label>
                    <Input className="h-11" type="number" value={formData.request_pcs} onChange={(e) => setFormData({ ...formData, request_pcs: e.target.value })} placeholder="Enter quantity" />
                  </div>
                </div>
              </div>
              )}

              {/* Step 2: Specifications */}
              {currentStep === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Specifications</h3>
                <div className="grid grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Gauge</Label>
                    <Popover open={gaugeOpen} onOpenChange={setGaugeOpen}>
                      <PopoverTrigger asChild>
                        <Button variant="outline" role="combobox" aria-expanded={gaugeOpen} className="w-full justify-between h-11">
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
                    <Input className="h-11" type="number" value={formData.ply} onChange={(e) => setFormData({ ...formData, ply: e.target.value })} placeholder="Enter PLY (e.g., 2)" />
                  </div>

                  {/* Selector Type Toggle */}
                  <div className="col-span-3 flex items-center justify-between p-3 border rounded-lg bg-muted/30">
                    <div className="flex items-center gap-2">
                      <Label className="text-sm font-medium">Color & Size Selectors</Label>
                      <Badge variant="outline" className="text-xs">
                        {useEnhancedSelectors ? "Enhanced" : "Legacy"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Label htmlFor="enhanced-toggle" className="text-xs">Enhanced</Label>
                      <input
                        id="enhanced-toggle"
                        type="checkbox"
                        checked={useEnhancedSelectors}
                        onChange={(e) => setUseEnhancedSelectors(e.target.checked)}
                        className="rounded"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Colors</Label>
                    {useEnhancedSelectors ? (
                      <EnhancedColorSelector
                        selectedColors={enhancedSelectedColors}
                        onColorsChange={setEnhancedSelectedColors}
                        maxSelections={10}
                        showTrends={true}
                        showEquivalents={true}
                      />
                    ) : (
                      <ColorSelector
                        selectedColors={selectedColors}
                        onColorsChange={setSelectedColors}
                        maxSelections={10}
                      />
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Sizes</Label>
                    {useEnhancedSelectors ? (
                      <EnhancedSizeSelector
                        selectedSizes={enhancedSelectedSizes}
                        onSizesChange={setEnhancedSelectedSizes}
                        maxSelections={20}
                        showMeasurements={true}
                        showRegionalVariations={true}
                        enableSizeConversion={true}
                      />
                    ) : (
                      <SizeSelector
                        selectedSizes={selectedSizes}
                        onSizesChange={setSelectedSizes}
                        maxSelections={20}
                      />
                    )}
                  </div>
                </div>
              </div>
              )}

              {/* Step 3: Materials */}
              {currentStep === 3 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Materials</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Yarn ID</Label>
                    <Popover open={yarnOpen} onOpenChange={setYarnOpen}>
                      <PopoverTrigger asChild>
                        <Button variant="outline" role="combobox" className="w-full justify-between h-11">
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
                        <Button variant="outline" role="combobox" className="w-full justify-between h-11">
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
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Yarn Details</Label>
                    <Input className="h-11" value={formData.yarn_details} onChange={(e) => setFormData({ ...formData, yarn_details: e.target.value })} placeholder="Additional yarn information" />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Trims Details</Label>
                    <Input className="h-11" value={formData.trims_details} onChange={(e) => setFormData({ ...formData, trims_details: e.target.value })} placeholder="Additional trims information" />
                  </div>
                </div>
              </div>
              )}

              {/* Step 4: Important Dates */}
              {currentStep === 4 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Important Dates</h3>
                <div className="grid grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Yarn Handover Date</Label>
                    <Input className="h-11" type="date" value={formData.yarn_handover_date} onChange={(e) => setFormData({ ...formData, yarn_handover_date: e.target.value })} />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Trims Handover Date</Label>
                    <Input className="h-11" type="date" value={formData.trims_handover_date} onChange={(e) => setFormData({ ...formData, trims_handover_date: e.target.value })} />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Required Date</Label>
                    <Input className="h-11" type="date" value={formData.required_date} onChange={(e) => setFormData({ ...formData, required_date: e.target.value })} />
                  </div>
                </div>
              </div>
              )}

              {/* Step 5: Decorative Parts & Additional Instructions */}
              {currentStep === 5 && (
              <>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Decorative Parts</h3>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <Input
                      className="h-11 flex-1"
                      value={newDecorativePart}
                      onChange={(e) => setNewDecorativePart(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addDecorativePart())}
                      placeholder="Enter decorative part (e.g., embroidery, patches, appliques)..."
                    />
                    <Button type="button" onClick={addDecorativePart} size="lg" className="h-11 px-6">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Part
                    </Button>
                  </div>
                  {formData.decorative_part.length > 0 && (
                    <div className="grid grid-cols-2 gap-3 border rounded-lg p-4 bg-muted/30">
                      {formData.decorative_part.map((part, idx) => (
                        <div key={idx} className="flex items-center gap-3 bg-background p-3 rounded-md shadow-sm">
                          <span className="flex-1 text-sm font-medium">{part}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeDecorativePart(idx)}
                            className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Additional Instructions</h3>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <Input
                      className="h-11 flex-1"
                      value={newInstruction}
                      onChange={(e) => setNewInstruction(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInstruction())}
                      placeholder="Enter special instruction or requirement..."
                    />
                    <Button type="button" onClick={addInstruction} size="lg" className="h-11 px-6">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Instruction
                    </Button>
                  </div>
                  {formData.additional_instruction.length > 0 && (
                    <div className="space-y-2 border rounded-lg p-4 bg-muted/30">
                      {formData.additional_instruction.map((inst, idx) => (
                        <div key={idx} className="flex items-start gap-3 bg-background p-3 rounded-md shadow-sm">
                          <input
                            type="checkbox"
                            checked={inst.done}
                            onChange={() => toggleInstructionDone(idx)}
                            className="mt-1 h-4 w-4 cursor-pointer"
                          />
                          <span className={cn("flex-1 text-sm", inst.done && "line-through text-muted-foreground")}>
                            {inst.instruction}
                          </span>
                          {inst.done && <Badge variant="secondary" className="text-xs">Completed</Badge>}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeInstruction(idx)}
                            className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              </>
              )}

              {/* Step 6: Techpack Files */}
              {currentStep === 6 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Attach Techpack Files</h3>
                <div className="space-y-4 border rounded-lg p-6 bg-muted/30">
                  <div className="flex gap-3 flex-wrap">
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
                      size="lg"
                      onClick={() => document.getElementById("techpack-spec-sheet")?.click()}
                      className="h-11"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Spec Sheet
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      onClick={openSpecSheetGenerator}
                      className="h-11"
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
                      size="lg"
                      onClick={() => document.getElementById("techpack-pdf")?.click()}
                      className="h-11"
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
                      size="lg"
                      onClick={() => document.getElementById("techpack-image")?.click()}
                      className="h-11"
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
                      size="lg"
                      onClick={() => document.getElementById("techpack-excel")?.click()}
                      className="h-11"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Excel
                    </Button>
                  </div>
                  {formData.techpack_files.length > 0 && (
                    <div className="space-y-2 mt-4">
                      {formData.techpack_files.map((file, idx) => (
                        <div key={idx} className="flex items-center gap-3 bg-background p-3 rounded-md shadow-sm">
                          <Badge variant="secondary" className="text-xs font-semibold">{file.type}</Badge>
                          <span className="flex-1 text-sm font-medium">{file.filename}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(file.url, '_blank')}
                            className="h-8 w-8 p-0"
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeTechpackFile(idx)}
                            className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              )}

              {/* Step 7: Review & Submit */}
              {currentStep === 7 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold border-b pb-2">Review Your Sample Request</h3>

                {/* Basic Information Review */}
                <div className="bg-muted/30 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-base">Basic Information</h4>
                    <Button type="button" variant="ghost" size="sm" onClick={() => goToStep(1)}>Edit</Button>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div><span className="text-muted-foreground">Buyer:</span> <span className="font-medium">{selectedBuyer?.buyer_name || selectedBuyer?.brand_name || "Not selected"}</span></div>
                    <div><span className="text-muted-foreground">Sample Name:</span> <span className="font-medium">{formData.sample_name || "Not entered"}</span></div>
                    <div><span className="text-muted-foreground">Item:</span> <span className="font-medium">{formData.item || "Not selected"}</span></div>
                    <div><span className="text-muted-foreground">Category:</span> <span className="font-medium">{formData.sample_category}</span></div>
                    <div><span className="text-muted-foreground">Priority:</span> <span className="font-medium capitalize">{formData.priority}</span></div>
                    <div><span className="text-muted-foreground">Request Pcs:</span> <span className="font-medium">{formData.request_pcs || "Not entered"}</span></div>
                  </div>
                </div>

                {/* Specifications Review */}
                <div className="bg-muted/30 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-base">Specifications</h4>
                    <Button type="button" variant="ghost" size="sm" onClick={() => goToStep(2)}>Edit</Button>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div><span className="text-muted-foreground">Gauge:</span> <span className="font-medium">{formatGaugeForDisplay(formData.gauge) || "Not entered"}</span></div>
                    <div><span className="text-muted-foreground">PLY:</span> <span className="font-medium">{formData.ply || "Not entered"}</span></div>
                    <div><span className="text-muted-foreground">Colors:</span> <span className="font-medium">
                      {useEnhancedSelectors 
                        ? `${enhancedSelectedColors.length} selected (Enhanced)` 
                        : `${selectedColors.length} selected (Legacy)`}
                    </span></div>
                  </div>
                  
                  {/* Enhanced Color Details */}
                  {useEnhancedSelectors && enhancedSelectedColors.length > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <span className="text-xs text-muted-foreground">Selected Colors (Enhanced):</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {enhancedSelectedColors.map((color) => (
                          <div key={color.id} className="flex items-center gap-2 bg-background rounded px-2 py-1 border">
                            <div
                              className="w-4 h-4 rounded border"
                              style={{ backgroundColor: color.hex_code }}
                            />
                            <div className="flex flex-col">
                              <span className="text-xs font-medium">{color.color_name}</span>
                              <div className="flex gap-1">
                                {color.pantone_code && <Badge variant="outline" className="text-xs">Pantone: {color.pantone_code}</Badge>}
                                {color.ral_code && <Badge variant="outline" className="text-xs">RAL: {color.ral_code}</Badge>}
                                <Badge variant="outline" className="text-xs">{color.color_family}</Badge>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Legacy Color Details */}
                  {!useEnhancedSelectors && selectedColors.length > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <span className="text-xs text-muted-foreground">Selected Colors (Legacy):</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedColors.map((color) => (
                          <div key={`${color.type}-${color.id}`} className="flex items-center gap-2 bg-background rounded px-2 py-1 border">
                            <div
                              className="w-4 h-4 rounded border"
                              style={{ backgroundColor: color.hex_code }}
                            />
                            <span className="text-xs font-medium">{color.name}</span>
                            <Badge variant="outline" className="text-xs">{color.type === "hm" ? "H&M" : color.code}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Enhanced Size Details */}
                  {useEnhancedSelectors && (
                    <div className="mt-3 pt-3 border-t">
                      <span className="text-muted-foreground text-sm">Sizes (Enhanced):</span>
                      <span className="font-medium text-sm ml-2">
                        {enhancedSelectedSizes.length > 0 ? `${enhancedSelectedSizes.length} selected` : "None selected"}
                      </span>
                      {enhancedSelectedSizes.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {enhancedSelectedSizes.map((size) => (
                            <div key={size.id} className="bg-background rounded px-2 py-1 border">
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="text-xs">
                                  {size.size_name} ({size.size_label})
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {size.garment_type_name} • {size.gender} • {size.age_group}
                                </span>
                              </div>
                              {size.measurements && Object.keys(size.measurements).length > 0 && (
                                <div className="mt-1 text-xs text-muted-foreground">
                                  Measurements: {Object.entries(size.measurements)
                                    .slice(0, 3)
                                    .map(([key, value]) => `${key}: ${value}`)
                                    .join(", ")}
                                  {Object.keys(size.measurements).length > 3 && "..."}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Legacy Size Details */}
                  {!useEnhancedSelectors && (
                    <div className="mt-3 pt-3 border-t">
                      <span className="text-muted-foreground text-sm">Sizes (Legacy):</span>
                      <span className="font-medium text-sm ml-2">
                        {selectedSizes.length > 0 ? `${selectedSizes.length} selected` : "None selected"}
                      </span>
                      {selectedSizes.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {selectedSizes.map((size) => (
                            <Badge key={size.id} variant="secondary" className="text-xs">
                              {size.size_name} ({size.garment_type_name}, {size.gender})
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Materials Review */}
                <div className="bg-muted/30 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-base">Materials</h4>
                    <Button type="button" variant="ghost" size="sm" onClick={() => goToStep(3)}>Edit</Button>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="text-muted-foreground">Yarn IDs:</span> <span className="font-medium">{formData.yarn_ids.length > 0 ? formData.yarn_ids.join(", ") : "None selected"}</span></div>
                    <div><span className="text-muted-foreground">Trims:</span> <span className="font-medium">{formData.trims_ids.length > 0 ? `${formData.trims_ids.length} selected` : "None selected"}</span></div>
                    <div><span className="text-muted-foreground">Yarn Details:</span> <span className="font-medium">{formData.yarn_details || "Not entered"}</span></div>
                    <div><span className="text-muted-foreground">Trims Details:</span> <span className="font-medium">{formData.trims_details || "Not entered"}</span></div>
                  </div>
                </div>

                {/* Dates Review */}
                <div className="bg-muted/30 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-base">Important Dates</h4>
                    <Button type="button" variant="ghost" size="sm" onClick={() => goToStep(4)}>Edit</Button>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div><span className="text-muted-foreground">Yarn Handover:</span> <span className="font-medium">{formData.yarn_handover_date || "Not set"}</span></div>
                    <div><span className="text-muted-foreground">Trims Handover:</span> <span className="font-medium">{formData.trims_handover_date || "Not set"}</span></div>
                    <div><span className="text-muted-foreground">Required Date:</span> <span className="font-medium">{formData.required_date || "Not set"}</span></div>
                  </div>
                </div>

                {/* Additional Info Review */}
                <div className="bg-muted/30 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-base">Additional Information</h4>
                    <Button type="button" variant="ghost" size="sm" onClick={() => goToStep(5)}>Edit</Button>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Decorative Parts:</span>
                      {formData.decorative_part.length > 0 ? (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {formData.decorative_part.map((part, idx) => (
                            <Badge key={idx} variant="secondary">{part}</Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="font-medium ml-2">None added</span>
                      )}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Additional Instructions:</span>
                      {formData.additional_instruction.length > 0 ? (
                        <ul className="list-disc list-inside mt-2 space-y-1">
                          {formData.additional_instruction.map((inst, idx) => (
                            <li key={idx} className={cn(inst.done && "line-through text-muted-foreground")}>
                              {inst.instruction}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="font-medium ml-2">None added</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Files Review */}
                <div className="bg-muted/30 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-base">Techpack Files</h4>
                    <Button type="button" variant="ghost" size="sm" onClick={() => goToStep(6)}>Edit</Button>
                  </div>
                  <div className="text-sm">
                    {formData.techpack_files.length > 0 ? (
                      <div className="space-y-2">
                        {formData.techpack_files.map((file, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <Badge variant="secondary">{file.type}</Badge>
                            <span className="font-medium">{file.filename}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">No files attached</span>
                    )}
                  </div>
                </div>
              </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between gap-4 pt-6 border-t">
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={() => {
                      if (window.opener) {
                        window.close();
                      } else {
                        router.push("/dashboard/erp/merchandising/sample-development");
                      }
                    }}
                    className="px-8"
                  >
                    Cancel
                  </Button>
                  {currentStep > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      onClick={goToPreviousStep}
                      className="px-8"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Previous
                    </Button>
                  )}
                </div>

                <div className="flex gap-3">
                  {currentStep < WIZARD_STEPS.length && (
                    <Button
                      type="button"
                      size="lg"
                      onClick={goToNextStep}
                      className="px-8"
                    >
                      Next
                      <ChevronsUpDown className="ml-2 h-4 w-4 rotate-90" />
                    </Button>
                  )}
                  {currentStep === WIZARD_STEPS.length && (
                    <Button type="submit" disabled={createPrimaryMutation.isPending} size="lg" className="px-8">
                      {createPrimaryMutation.isPending || updatePrimaryMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {isEditing ? "Updating..." : "Creating..."}
                        </>
                      ) : (
                        <>
                          {isEditing ? "Update Sample" : "Create Sample"}
                          <Check className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

