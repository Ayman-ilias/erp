"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Plus, ArrowLeft, Loader2, Edit, Trash2, Calendar, CheckCircle2, ChevronsUpDown, Check, Upload, FileText, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { api } from "@/services/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const SAMPLE_CATEGORIES = ["Proto", "Fit", "PP", "SMS", "TOP", "Salesman", "Photo Shoot", "Production"];

export default function SampleDevelopmentPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("primary");

  // Dialog states
  const [primaryDialogOpen, setPrimaryDialogOpen] = useState(false);
  const [tnaDialogOpen, setTnaDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);

  // Editing states
  const [editingPrimary, setEditingPrimary] = useState<any>(null);
  const [editingTna, setEditingTna] = useState<any>(null);
  const [editingStatus, setEditingStatus] = useState<any>(null);

  // ========== FETCH DATA FROM CLIENT INFO ==========
  const { data: buyersData } = useQuery({
    queryKey: ["buyers"],
    queryFn: () => api.buyers.getAll(),
  });

  // Create buyer lookup map
  const buyerMap = useMemo(() => {
    if (!buyersData) return {};
    return buyersData.reduce((acc: any, buyer: any) => {
      acc[buyer.id] = buyer;
      return acc;
    }, {});
  }, [buyersData]);

  // ========== FETCH MERCHANDISER DATA ==========
  const { data: primaryInfoData, isLoading: primaryLoading, error: primaryError } = useQuery({
    queryKey: ["merchandiser", "samplePrimary"],
    queryFn: async () => {
      try {
        const result = await api.merchandiser.samplePrimary.getAll();
        console.log("Sample Primary API Response:", result);
        return Array.isArray(result) ? result : [];
      } catch (error) {
        console.error("Error in queryFn:", error);
        throw error;
      }
    },
    retry: 1,
  });
  
  // Show error if API call fails
  useEffect(() => {
    if (primaryError) {
      console.error("Error fetching sample primary info:", primaryError);
      toast.error(`Failed to load samples: ${primaryError instanceof Error ? primaryError.message : 'Unknown error'}`);
    }
  }, [primaryError]);
  
  // Debug: Log data changes
  useEffect(() => {
    console.log("Primary Info Data:", primaryInfoData);
    console.log("Primary Loading:", primaryLoading);
    console.log("Primary Error:", primaryError);
  }, [primaryInfoData, primaryLoading, primaryError]);

  // Listen for messages from child windows to refresh data (bidirectional sync)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'SAMPLE_UPDATED') {
        // Invalidate queries to refresh data from both Merchandiser and Samples
        queryClient.invalidateQueries({ queryKey: ["merchandiser", "samplePrimary"] });
        queryClient.invalidateQueries({ queryKey: ["samples", "requests"] });
        toast.success("Sample data refreshed from Sample Department");
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [queryClient]);

  const { data: tnaData, isLoading: tnaLoading } = useQuery({
    queryKey: ["merchandiser", "sampleTna"],
    queryFn: () => api.merchandiser.sampleTna.getAll(),
  });

  const { data: statusData, isLoading: statusLoading } = useQuery({
    queryKey: ["merchandiser", "sampleStatus"],
    queryFn: () => api.merchandiser.sampleStatus.getAll(),
  });

  const { data: yarnsData } = useQuery({
    queryKey: ["merchandiser", "yarn"],
    queryFn: () => api.merchandiser.yarn.getAll(),
  });

  const { data: trimsData } = useQuery({
    queryKey: ["merchandiser", "trims"],
    queryFn: () => api.merchandiser.trims.getAll(),
  });

  // ========== SAMPLE PRIMARY INFO MUTATIONS ==========
  const createPrimaryMutation = useMutation({
    mutationFn: (data: any) => api.merchandiser.samplePrimary.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchandiser", "samplePrimary"] });
      toast.success("Sample request created successfully");
      setPrimaryDialogOpen(false);
      setEditingPrimary(null);
    },
    onError: (error: any) => toast.error(`Failed to create sample: ${error.message}`),
  });

  const updatePrimaryMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      api.merchandiser.samplePrimary.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchandiser", "samplePrimary"] });
      toast.success("Sample updated successfully");
      setPrimaryDialogOpen(false);
      setEditingPrimary(null);
    },
    onError: (error: any) => toast.error(`Failed to update sample: ${error.message}`),
  });

  const deletePrimaryMutation = useMutation({
    mutationFn: (id: string) => api.merchandiser.samplePrimary.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchandiser", "samplePrimary"] });
      toast.success("Sample deleted successfully");
    },
    onError: (error: any) => toast.error(`Failed to delete sample: ${error.message}`),
  });

  // ========== SAMPLE TNA MUTATIONS ==========
  const createTnaMutation = useMutation({
    mutationFn: (data: any) => api.merchandiser.sampleTna.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchandiser", "sampleTna"] });
      toast.success("TNA created successfully");
      setTnaDialogOpen(false);
      setEditingTna(null);
    },
    onError: (error: any) => toast.error(`Failed to create TNA: ${error.message}`),
  });

  const updateTnaMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      api.merchandiser.sampleTna.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchandiser", "sampleTna"] });
      toast.success("TNA updated successfully");
      setTnaDialogOpen(false);
      setEditingTna(null);
    },
    onError: (error: any) => toast.error(`Failed to update TNA: ${error.message}`),
  });

  const deleteTnaMutation = useMutation({
    mutationFn: (id: number) => api.merchandiser.sampleTna.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchandiser", "sampleTna"] });
      toast.success("TNA deleted successfully");
    },
    onError: (error: any) => toast.error(`Failed to delete TNA: ${error.message}`),
  });

  // ========== SAMPLE STATUS MUTATIONS ==========
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      api.merchandiser.sampleStatus.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchandiser", "sampleStatus"] });
      toast.success("Status updated successfully");
      setStatusDialogOpen(false);
      setEditingStatus(null);
    },
    onError: (error: any) => toast.error(`Failed to update status: ${error.message}`),
  });

  const deleteStatusMutation = useMutation({
    mutationFn: (id: number) => api.merchandiser.sampleStatus.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchandiser", "sampleStatus"] });
      toast.success("Status deleted successfully");
    },
    onError: (error: any) => toast.error(`Failed to delete status: ${error.message}`),
  });

  const syncStatusMutation = useMutation({
    mutationFn: () => api.merchandiser.sampleStatus.sync(),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["merchandiser", "sampleStatus"] });
      toast.success(`Sync completed: ${data.synced || 0} created, ${data.updated || 0} updated`);
    },
    onError: (error: any) => toast.error(`Failed to sync: ${error.message}`),
  });

  const handleDeletePrimary = (sampleId: string) => {
    if (confirm("Are you sure you want to delete this sample?")) {
      deletePrimaryMutation.mutate(sampleId);
    }
  };

  const handleDeleteTna = (id: number) => {
    if (confirm("Are you sure you want to delete this TNA record?")) {
      deleteTnaMutation.mutate(id);
    }
  };

  const handleDeleteStatus = (id: number) => {
    if (confirm("Are you sure you want to delete this status record?")) {
      deleteStatusMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard/erp/merchandising")}
            className="mb-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Merchandising
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Sample Development</h1>
          <p className="text-muted-foreground mt-2">
            Manage sample information, TNA, and status tracking
          </p>
        </div>
        <Button
          onClick={() => {
            window.open("/dashboard/erp/merchandising/sample-development/add-request", "_blank");
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Create New Sample Request
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="primary">
            Sample Primary Info
            {primaryInfoData && (
              <Badge variant="secondary" className="ml-2">
                {primaryInfoData.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="tna">
            Sample TNA - Color Wise
            {tnaData && (
              <Badge variant="secondary" className="ml-2">
                {tnaData.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="status">
            Sample Status
            {statusData && (
              <Badge variant="secondary" className="ml-2">
                {statusData.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* SAMPLE PRIMARY INFO TAB */}
        <TabsContent value="primary">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Sample Primary Information</CardTitle>
                  <CardDescription>
                    Basic details for sample development with buyer information
                  </CardDescription>
                </div>
                <Button
                  onClick={() => {
                    window.open("/dashboard/erp/merchandising/sample-development/add-request", "_blank");
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Sample Request
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {primaryLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : primaryInfoData && primaryInfoData.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sample ID</TableHead>
                      <TableHead>Sample Name</TableHead>
                      <TableHead>Buyer</TableHead>
                      <TableHead>Yarn IDs</TableHead>
                      <TableHead>Color</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {primaryInfoData.map((sample: any) => (
                      <TableRow key={sample.id}>
                        <TableCell className="font-medium">{sample.sample_id}</TableCell>
                        <TableCell>{sample.sample_name}</TableCell>
                        <TableCell>
                          {buyerMap[sample.buyer_id]?.brand_name || `ID: ${sample.buyer_id}`}
                        </TableCell>
                        <TableCell>
                          {sample.yarn_ids && Array.isArray(sample.yarn_ids)
                            ? sample.yarn_ids.join(", ")
                            : "-"}
                        </TableCell>
                        <TableCell>
                          <Badge>{sample.color_name || "-"}</Badge>
                        </TableCell>
                        <TableCell>{sample.size_name || "-"}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              window.open(`/dashboard/erp/merchandising/sample-development/add-request?edit=${sample.sample_id}`, "_blank");
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeletePrimary(sample.sample_id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No sample records found. Click "Add Sample Request" to create one.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* SAMPLE TNA TAB */}
        <TabsContent value="tna">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Sample TNA - Color Wise</CardTitle>
                  <CardDescription>
                    Time & Action calendar for sample development
                  </CardDescription>
                </div>
                <Button
                  onClick={() => {
                    setEditingTna(null);
                    setTnaDialogOpen(true);
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add TNA
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {tnaLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : tnaData && tnaData.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sample ID</TableHead>
                      <TableHead>Sample Name</TableHead>
                      <TableHead>Worksheet Received</TableHead>
                      <TableHead>Required Date</TableHead>
                      <TableHead>Item Request PCS</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tnaData.map((tna: any) => (
                      <TableRow key={tna.id}>
                        <TableCell className="font-medium">{tna.sample_id}</TableCell>
                        <TableCell>{tna.sample_name}</TableCell>
                        <TableCell>
                          {tna.worksheet_received_date
                            ? new Date(tna.worksheet_received_date).toLocaleDateString()
                            : "-"}
                        </TableCell>
                        <TableCell>
                          {tna.required_date
                            ? new Date(tna.required_date).toLocaleDateString()
                            : "-"}
                        </TableCell>
                        <TableCell>{tna.item_request_pcs || "-"}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{tna.sample_category || "-"}</Badge>
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingTna(tna);
                              setTnaDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteTna(tna.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No TNA records found. Click "Add TNA" to create one.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* SAMPLE STATUS TAB */}
        <TabsContent value="status">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Sample Status</CardTitle>
                  <CardDescription>
                    Edit sample status. Status records are created by the Sample Department.
                  </CardDescription>
                </div>
                <Button
                  onClick={() => syncStatusMutation.mutate()}
                  disabled={syncStatusMutation.isPending}
                  variant="outline"
                >
                  {syncStatusMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Sync from Samples
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {statusLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : statusData && statusData.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sample ID</TableHead>
                      <TableHead>Status From Sample</TableHead>
                      <TableHead>Status From Merchandiser</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead>Expecting End Date</TableHead>
                      <TableHead>Updated By</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {statusData.map((status: any) => (
                      <TableRow key={status.id}>
                        <TableCell className="font-medium">{status.sample_id}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              status.status_by_sample === "Approved"
                                ? "default"
                                : status.status_by_sample === "Rejected"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {status.status_by_sample || "-"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {status.status_from_merchandiser || "-"}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {status.notes || "-"}
                        </TableCell>
                        <TableCell>
                          {status.expecting_end_date
                            ? new Date(status.expecting_end_date).toLocaleDateString()
                            : "-"}
                        </TableCell>
                        <TableCell>
                          {status.updated_by || "-"}
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              try {
                                setEditingStatus(status);
                                setStatusDialogOpen(true);
                              } catch (error) {
                                console.error("Error opening edit dialog:", error);
                                toast.error("Failed to open edit dialog");
                              }
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteStatus(status.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No status records found. Status records are created by the Sample Department.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* SAMPLE PRIMARY INFO DIALOG */}
      <SamplePrimaryDialog
        open={primaryDialogOpen}
        onOpenChange={(open) => {
          setPrimaryDialogOpen(open);
          if (!open) {
            setEditingPrimary(null);
          }
        }}
        editingSample={editingPrimary}
        buyers={buyersData || []}
        yarns={yarnsData || []}
        trims={trimsData || []}
        onSubmit={(data) => {
          if (editingPrimary) {
            updatePrimaryMutation.mutate({ id: editingPrimary.sample_id, data });
          } else {
            createPrimaryMutation.mutate(data);
          }
        }}
        isLoading={createPrimaryMutation.isPending || updatePrimaryMutation.isPending}
      />

      {/* SAMPLE TNA DIALOG */}
      <SampleTnaDialog
        open={tnaDialogOpen}
        onOpenChange={setTnaDialogOpen}
        editingTna={editingTna}
        samples={primaryInfoData || []}
        onSubmit={(data) => {
          if (editingTna) {
            updateTnaMutation.mutate({ id: editingTna.id, data });
          } else {
            createTnaMutation.mutate(data);
          }
        }}
        isLoading={createTnaMutation.isPending || updateTnaMutation.isPending}
      />

      {/* SAMPLE STATUS DIALOG */}
      <SampleStatusDialog
        open={statusDialogOpen}
        onOpenChange={(open) => {
          setStatusDialogOpen(open);
          if (!open) {
            setEditingStatus(null);
          }
        }}
        editingStatus={editingStatus}
        onSubmit={(data) => {
          if (editingStatus) {
            updateStatusMutation.mutate({ id: editingStatus.id, data });
          }
        }}
        isLoading={updateStatusMutation.isPending}
      />
    </div>
  );
}

// ========== SAMPLE PRIMARY INFO DIALOG ==========
// Helper function to format additional_instruction for display (merchandising - plain text)
const formatAdditionalInstruction = (instruction: any): string => {
  if (!instruction) return "-";
  if (typeof instruction === 'string') return instruction;
  if (Array.isArray(instruction)) {
    return instruction.map((inst: any) => {
      if (typeof inst === 'string') return inst;
      if (inst && typeof inst === 'object') {
        const text = inst.instruction || inst.toString();
        const done = inst.done ? "✓ " : "";
        return `${done}${text}`;
      }
      return String(inst);
    }).join(", ");
  }
  return String(instruction);
};

function SamplePrimaryDialog({
  open,
  onOpenChange,
  editingSample,
  buyers,
  yarns,
  trims,
  onSubmit,
  isLoading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingSample: any;
  buyers: any[];
  yarns: any[];
  trims: any[];
  onSubmit: (data: any) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    sample_id: "",
    buyer_id: "",
    buyer_name: "",
    sample_name: "",
    item: "",
    gauge: "",
    ply: "",
    sample_category: "Proto",
    yarn_ids: [] as string[],
    yarn_id: "",
    yarn_details: "",
    component_yarn: "",
    count: "",
    trims_ids: [] as string[],
    trims_details: "",
    decorative_part: "",
    decorative_details: "",
    color_id: "",
    color_name: "",
    size_id: "",
    size_name: "",
    yarn_handover_date: "",
    trims_handover_date: "",
    required_date: "",
    request_pcs: "",
    additional_instruction: "",
    techpack_url: "",
    techpack_filename: "",
  });
  const [buyerOpen, setBuyerOpen] = useState(false);
  const [buyerSearch, setBuyerSearch] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Item dropdown state
  const [itemOpen, setItemOpen] = useState(false);
  const [itemSearch, setItemSearch] = useState("");
  const [items, setItems] = useState<string[]>(["Sweater", "T-Shirt", "Polo", "Hoodie", "Cardigan", "Vest", "Jacket", "Pants", "Shorts"]);
  
  // Gauge dropdown state
  const [gaugeOpen, setGaugeOpen] = useState(false);
  const [gaugeSearch, setGaugeSearch] = useState("");
  const [gauges, setGauges] = useState<string[]>(["12", "14", "16", "18", "20", "22", "24", "7", "10", "12,5", "14,5"]);

  useEffect(() => {
    if (editingSample) {
      // Format dates for date inputs
      const formatDate = (date: string | Date | null | undefined) => {
        if (!date) return "";
        const d = typeof date === "string" ? new Date(date) : date;
        return d.toISOString().split("T")[0];
      };
      
      setFormData({
        sample_id: editingSample.sample_id || "",
        buyer_id: String(editingSample.buyer_id || ""),
        buyer_name: editingSample.buyer_name || "",
        sample_name: editingSample.sample_name || "",
        item: editingSample.item || "",
        gauge: editingSample.gauge || "",
        ply: editingSample.ply || "",
        sample_category: editingSample.sample_category || "Proto",
        yarn_ids: editingSample.yarn_ids || [],
        yarn_id: editingSample.yarn_id || (editingSample.yarn_ids && editingSample.yarn_ids[0] ? editingSample.yarn_ids[0] : ""),
        yarn_details: editingSample.yarn_details || "",
        component_yarn: editingSample.component_yarn || "",
        count: editingSample.count || "",
        trims_ids: editingSample.trims_ids || [],
        trims_details: editingSample.trims_details || "",
        // Convert array to comma-separated string for form display
        decorative_part: Array.isArray(editingSample.decorative_part)
          ? editingSample.decorative_part.join(', ')
          : (editingSample.decorative_part || ""),
        decorative_details: editingSample.decorative_details || "",
        color_id: editingSample.color_id || "",
        color_name: editingSample.color_name || "",
        size_id: editingSample.size_id || "",
        size_name: editingSample.size_name || "",
        yarn_handover_date: formatDate(editingSample.yarn_handover_date),
        trims_handover_date: formatDate(editingSample.trims_handover_date),
        required_date: formatDate(editingSample.required_date),
        request_pcs: editingSample.request_pcs?.toString() || "",
        additional_instruction: formatAdditionalInstruction(editingSample.additional_instruction) || "",
        // Extract from techpack_files array if available
        techpack_url: editingSample.techpack_files?.[0]?.url || editingSample.techpack_url || "",
        techpack_filename: editingSample.techpack_files?.[0]?.filename || editingSample.techpack_filename || "",
      });
    } else {
      setFormData({
        sample_id: "",
        buyer_id: "",
        buyer_name: "",
        sample_name: "",
        item: "",
        gauge: "",
        ply: "",
        sample_category: "Proto",
        yarn_ids: [],
        yarn_id: "",
        yarn_details: "",
        component_yarn: "",
        count: "",
        trims_ids: [],
        trims_details: "",
        decorative_part: "",
        decorative_details: "",
        color_id: "",
        color_name: "",
        size_id: "",
        size_name: "",
        yarn_handover_date: "",
        trims_handover_date: "",
        required_date: "",
        request_pcs: "",
        additional_instruction: "",
        techpack_url: "",
        techpack_filename: "",
      });
    }
    setBuyerSearch("");
    setItemSearch("");
    setGaugeSearch("");
  }, [editingSample, open]);

  const filteredBuyers = useMemo(() => {
    if (!buyerSearch) return buyers;
    return buyers.filter((b: any) =>
      b.buyer_name?.toLowerCase().includes(buyerSearch.toLowerCase()) ||
      b.brand_name?.toLowerCase().includes(buyerSearch.toLowerCase()) ||
      b.company_name?.toLowerCase().includes(buyerSearch.toLowerCase())
    );
  }, [buyers, buyerSearch]);

  const handleBuyerSelect = (buyerId: string) => {
    const buyer = buyers.find((b: any) => b.id.toString() === buyerId);
    setFormData({ 
      ...formData, 
      buyer_id: buyerId, 
      buyer_name: buyer?.buyer_name || buyer?.brand_name || "" 
    });
    setBuyerOpen(false);
    setBuyerSearch("");
  };

  // Helper function to format gauge for display (remove "GG" suffix)
  const formatGaugeForDisplay = (gauge: string): string => {
    if (!gauge) return "";
    return gauge.replace(/\s*GG\s*/gi, "").trim();
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // For now, just store filename. In production, upload to server and get URL
    setFormData({
      ...formData,
      techpack_filename: file.name,
      techpack_url: URL.createObjectURL(file), // Temporary URL, replace with server URL
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Prepare data for backend - match schema exactly
    const submitData: any = {
      sample_name: formData.sample_name || null,
      buyer_id: formData.buyer_id ? parseInt(formData.buyer_id) : null,
      buyer_name: formData.buyer_name || null,
      item: formData.item || null,
      gauge: formData.gauge || null,
      ply: formData.ply || null,
      sample_category: formData.sample_category || null,
      yarn_ids: formData.yarn_ids && formData.yarn_ids.length > 0 ? formData.yarn_ids : null,
      yarn_id: formData.yarn_id || (formData.yarn_ids && formData.yarn_ids.length > 0 ? formData.yarn_ids[0] : null),
      yarn_details: formData.yarn_details || null,
      component_yarn: formData.component_yarn || null,
      count: formData.count || null,
      trims_ids: formData.trims_ids && formData.trims_ids.length > 0 ? formData.trims_ids : null,
      trims_details: formData.trims_details || null,
      // Convert decorative_part string to array (backend expects List[str])
      decorative_part: formData.decorative_part
        ? formData.decorative_part.split(',').map((s: string) => s.trim()).filter((s: string) => s)
        : null,
      color_id: formData.color_id || null,
      color_name: formData.color_name || null,
      size_id: formData.size_id || null,
      size_name: formData.size_name || null,
      // Convert date strings to ISO format or null
      yarn_handover_date: formData.yarn_handover_date ? new Date(formData.yarn_handover_date).toISOString() : null,
      trims_handover_date: formData.trims_handover_date ? new Date(formData.trims_handover_date).toISOString() : null,
      required_date: formData.required_date ? new Date(formData.required_date).toISOString() : null,
      request_pcs: formData.request_pcs ? parseInt(formData.request_pcs) : null,
      // Convert additional_instruction string to array of objects (backend expects List[Dict])
      additional_instruction: formData.additional_instruction
        ? [{ instruction: formData.additional_instruction, done: false }]
        : null,
      // Convert techpack fields to array (backend expects List[Dict])
      techpack_files: formData.techpack_url
        ? [{ url: formData.techpack_url, filename: formData.techpack_filename || 'techpack', type: 'document' }]
        : null,
    };

    // Only include sample_id if it's not empty (backend will auto-generate if empty)
    if (formData.sample_id && formData.sample_id.trim() !== "") {
      submitData.sample_id = formData.sample_id;
    }

    // Remove null values for cleaner payload (optional fields)
    Object.keys(submitData).forEach(key => {
      if (submitData[key] === null || submitData[key] === undefined) {
        delete submitData[key];
      }
    });

    onSubmit(submitData);
  };

  const selectedBuyer = buyers.find((b: any) => b.id.toString() === formData.buyer_id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-h-[90vh] overflow-y-auto !p-6" 
        style={{ 
          maxWidth: 'calc(100vw - 4rem)', 
          width: 'calc(100vw - 4rem)',
          minWidth: '1400px'
        }}
      >
        <DialogHeader>
          <DialogTitle>{editingSample ? "Edit Sample Request" : "Create New Sample Request"}</DialogTitle>
          <DialogDescription>
            {editingSample
              ? "Update the sample request details below"
              : "Fill in the details to create a new sample request. Sample ID will be auto-generated if left empty."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Row 1: Buyer, Sample Name, Item, Category, Gauge, PLY, Color, Size - 8 columns */}
          <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(8, minmax(0, 1fr))' }}>
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
              <Label className="text-sm font-medium">Color Name</Label>
              <Input className="h-10" value={formData.color_name} onChange={(e) => setFormData({ ...formData, color_name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Size Name</Label>
              <Input className="h-10" value={formData.size_name} onChange={(e) => setFormData({ ...formData, size_name: e.target.value })} />
            </div>
          </div>

          {/* Row 2: Request Pcs, Yarn ID, Trims ID, Decorative Part, Yarn Handover Date, Trims Handover Date, Required Date - 7 columns */}
          <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(7, minmax(0, 1fr))' }}>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Request Pcs</Label>
              <Input className="h-10" type="number" value={formData.request_pcs} onChange={(e) => setFormData({ ...formData, request_pcs: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Yarn ID</Label>
              <Input className="h-10" value={formData.yarn_id} onChange={(e) => setFormData({ ...formData, yarn_id: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Trims ID</Label>
              <Input className="h-10" value={formData.trims_ids && formData.trims_ids.length > 0 ? formData.trims_ids.join(", ") : ""} onChange={(e) => setFormData({ ...formData, trims_ids: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })} placeholder="TRM-001, TRM-002" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Decorative Part</Label>
              <Input className="h-10" value={formData.decorative_part} onChange={(e) => setFormData({ ...formData, decorative_part: e.target.value })} />
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

          {/* Row 3: Yarn Details, Trims Details, Decorative Details, Techpack - 4 columns */}
          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Yarn Details</Label>
              <Input className="h-10" value={formData.yarn_details} onChange={(e) => setFormData({ ...formData, yarn_details: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Trims Details</Label>
              <Input className="h-10" value={formData.trims_details} onChange={(e) => setFormData({ ...formData, trims_details: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Decorative Details</Label>
              <Input className="h-10" value={formData.decorative_details} onChange={(e) => setFormData({ ...formData, decorative_details: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Attach Techpack</Label>
              <div className="flex gap-2">
                <Input
                  className="h-10 flex-1"
                  value={formData.techpack_filename}
                  placeholder="No file"
                  readOnly
                />
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                  className="hidden"
                />
                <Button type="button" variant="outline" size="sm" className="h-10 px-3" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="h-4 w-4" />
                </Button>
                {formData.techpack_url && (
                  <Button type="button" variant="ghost" size="sm" className="h-10 px-3" onClick={() => window.open(formData.techpack_url, '_blank')}>
                    <FileText className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Row 4: Additional Instruction (full width) */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Additional Instruction</Label>
            <Textarea value={formData.additional_instruction} onChange={(e) => setFormData({ ...formData, additional_instruction: e.target.value })} rows={3} className="resize-none" />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {editingSample ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>{editingSample ? "Update" : "Create"} Sample</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ========== SAMPLE TNA DIALOG ==========
function SampleTnaDialog({
  open,
  onOpenChange,
  editingTna,
  samples,
  onSubmit,
  isLoading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingTna: any;
  samples: any[];
  onSubmit: (data: any) => void;
  isLoading: boolean;
}) {
  const [sampleIdOpen, setSampleIdOpen] = useState(false);
  const [sampleSearch, setSampleSearch] = useState("");
  const [formData, setFormData] = useState({
    sample_id: "",
    sample_name: "",
    worksheet_received_date: "",
    worksheet_handover_date: "",
    yarn_handover_date: "",
    trims_handover_date: "",
    required_date: "",
    item_request_pcs: "",
    sample_category: "",
    size: "",
    additional_instruction: "",
  });

  useEffect(() => {
    if (editingTna) {
      setFormData({
        sample_id: editingTna.sample_id || "",
        sample_name: editingTna.sample_name || "",
        worksheet_received_date: editingTna.worksheet_received_date || "",
        worksheet_handover_date: editingTna.worksheet_handover_date || "",
        yarn_handover_date: editingTna.yarn_handover_date || "",
        trims_handover_date: editingTna.trims_handover_date || "",
        required_date: editingTna.required_date || "",
        item_request_pcs: editingTna.item_request_pcs || "",
        sample_category: editingTna.sample_category || "",
        size: editingTna.size || "",
        additional_instruction: editingTna.additional_instruction || "",
      });
    } else {
      setFormData({
        sample_id: "",
        sample_name: "",
        worksheet_received_date: "",
        worksheet_handover_date: "",
        yarn_handover_date: "",
        trims_handover_date: "",
        required_date: "",
        item_request_pcs: "",
        sample_category: "",
        size: "",
        additional_instruction: "",
      });
    }
  }, [editingTna, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.sample_id || formData.sample_id.trim() === "") {
      toast.error("Please select a sample ID");
      return;
    }
    
    const submitData = {
      ...formData,
    };
    
    onSubmit(submitData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingTna ? "Edit TNA" : "Add New TNA"}</DialogTitle>
          <DialogDescription>
            Time & Action calendar for sample development
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sample_id">
                Sample ID <span className="text-destructive">*</span>
              </Label>
              <Popover open={sampleIdOpen} onOpenChange={setSampleIdOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={sampleIdOpen}
                    className="w-full justify-between"
                  >
                    {formData.sample_id
                      ? samples.find((s) => s.sample_id === formData.sample_id)?.sample_id || formData.sample_id
                      : "Select sample ID..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0">
                  <Command>
                    <CommandInput 
                      placeholder="Search sample ID or name..." 
                      value={sampleSearch}
                      onValueChange={setSampleSearch}
                    />
                    <CommandList>
                      <CommandEmpty>No sample found.</CommandEmpty>
                      <CommandGroup>
                        {samples
                          .filter((sample) => {
                            const searchLower = sampleSearch.toLowerCase();
                            return (
                              sample.sample_id?.toLowerCase().includes(searchLower) ||
                              sample.sample_name?.toLowerCase().includes(searchLower)
                            );
                          })
                          .map((sample) => (
                            <CommandItem
                              key={sample.sample_id}
                              value={sample.sample_id}
                              onSelect={() => {
                                // Format dates for date inputs
                                const formatDate = (date: string | Date | null | undefined) => {
                                  if (!date) return "";
                                  const d = typeof date === "string" ? new Date(date) : date;
                                  return d.toISOString().split("T")[0];
                                };
                                
                                setFormData({
                                  ...formData,
                                  sample_id: sample.sample_id,
                                  sample_name: sample.sample_name || formData.sample_name,
                                  // Populate all relevant fields from selected sample
                                  sample_category: sample.sample_category || formData.sample_category,
                                  size: sample.size_name || sample.size_id || formData.size,
                                  yarn_handover_date: formatDate(sample.yarn_handover_date) || formData.yarn_handover_date,
                                  trims_handover_date: formatDate(sample.trims_handover_date) || formData.trims_handover_date,
                                  required_date: formatDate(sample.required_date) || formData.required_date,
                                  item_request_pcs: sample.request_pcs?.toString() || formData.item_request_pcs,
                                  additional_instruction: formatAdditionalInstruction(sample.additional_instruction) || formData.additional_instruction,
                                });
                                setSampleIdOpen(false);
                                setSampleSearch("");
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  formData.sample_id === sample.sample_id ? "opacity-100" : "opacity-0"
                                )}
                              />
                              <div className="flex flex-col">
                                <span className="font-medium">{sample.sample_id}</span>
                                <span className="text-xs text-muted-foreground">{sample.sample_name}</span>
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
              <Label htmlFor="sample_name">
                Sample Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="sample_name"
                value={formData.sample_name}
                onChange={(e) => setFormData({ ...formData, sample_name: e.target.value })}
                required
                placeholder="e.g., Basic T-Shirt Sample"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="worksheet_received_date">Worksheet Received Date</Label>
              <Input
                id="worksheet_received_date"
                type="date"
                value={formData.worksheet_received_date}
                onChange={(e) =>
                  setFormData({ ...formData, worksheet_received_date: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="worksheet_handover_date">Worksheet Handover Date</Label>
              <Input
                id="worksheet_handover_date"
                type="date"
                value={formData.worksheet_handover_date}
                onChange={(e) =>
                  setFormData({ ...formData, worksheet_handover_date: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="yarn_handover_date">Yarn Handover Date</Label>
              <Input
                id="yarn_handover_date"
                type="date"
                value={formData.yarn_handover_date}
                onChange={(e) =>
                  setFormData({ ...formData, yarn_handover_date: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="trims_handover_date">Trims Handover Date</Label>
              <Input
                id="trims_handover_date"
                type="date"
                value={formData.trims_handover_date}
                onChange={(e) =>
                  setFormData({ ...formData, trims_handover_date: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="required_date">
                Required Date <span className="text-destructive">*</span>
              </Label>
              <Input
                id="required_date"
                type="date"
                value={formData.required_date}
                onChange={(e) => setFormData({ ...formData, required_date: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="item_request_pcs">Item Request PCS</Label>
              <Input
                id="item_request_pcs"
                type="number"
                value={formData.item_request_pcs}
                onChange={(e) =>
                  setFormData({ ...formData, item_request_pcs: e.target.value })
                }
                placeholder="e.g., 5"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sample_category">Sample Category</Label>
              <Select
                value={formData.sample_category}
                onValueChange={(value) =>
                  setFormData({ ...formData, sample_category: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Proto">Proto</SelectItem>
                  <SelectItem value="Size Set">Size Set</SelectItem>
                  <SelectItem value="PP Meeting">PP Meeting</SelectItem>
                  <SelectItem value="Production">Production</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="size">Size</Label>
              <Input
                id="size"
                value={formData.size}
                onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                placeholder="e.g., M"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="additional_instruction">Additional Instruction</Label>
            <Textarea
              id="additional_instruction"
              value={formData.additional_instruction}
              onChange={(e) =>
                setFormData({ ...formData, additional_instruction: e.target.value })
              }
              placeholder="Any special instructions or notes"
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {editingTna ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>{editingTna ? "Update" : "Create"} TNA</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ========== SAMPLE STATUS DIALOG ==========
function SampleStatusDialog({
  open,
  onOpenChange,
  editingStatus,
  onSubmit,
  isLoading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingStatus: any;
  onSubmit: (data: any) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    status_by_sample: "",
    status_from_merchandiser: "",
    notes: "",
    updated_by: "",
    expecting_end_date: "",
  });

  // Log for debugging
  useEffect(() => {
    if (open && editingStatus) {
      console.log("SampleStatusDialog opened with editingStatus:", editingStatus);
    }
  }, [open, editingStatus]);

  useEffect(() => {
    if (editingStatus && open) {
      try {
        const formatDate = (date: string | Date | null | undefined) => {
          if (!date) return "";
          const d = typeof date === "string" ? new Date(date) : date;
          return d.toISOString().split("T")[0];
        };
        setFormData({
          status_by_sample: editingStatus?.status_by_sample ?? "",
          status_from_merchandiser: editingStatus?.status_from_merchandiser ?? "",
          notes: editingStatus?.notes ?? "",
          updated_by: editingStatus?.updated_by ?? "",
          expecting_end_date: formatDate(editingStatus?.expecting_end_date),
        });
      } catch (error) {
        console.error("Error setting form data:", error);
      }
    } else if (!open) {
      // Reset form when dialog closes
      setFormData({
        status_by_sample: "",
        status_from_merchandiser: "",
        notes: "",
        updated_by: "",
        expecting_end_date: "",
      });
    }
  }, [editingStatus, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingStatus) {
      console.error("Cannot submit: editingStatus is null");
      return; // Only allow editing existing records
    }
    
    try {
      // Only submit fields that merchandiser can edit (exclude status_by_sample)
      const submitData: any = {};
      
      if (formData.status_from_merchandiser !== undefined) {
        submitData.status_from_merchandiser = formData.status_from_merchandiser || null;
      }
      if (formData.notes !== undefined) {
        submitData.notes = formData.notes || null;
      }
      if (formData.updated_by !== undefined) {
        submitData.updated_by = formData.updated_by || null;
      }
      
      onSubmit(submitData);
    } catch (error) {
      console.error("Error in handleSubmit:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Status</DialogTitle>
          <DialogDescription>
            Update sample status. Status records are created by the Sample Department.
          </DialogDescription>
        </DialogHeader>
        {editingStatus ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status_by_sample">Status By Sample (Read-only)</Label>
                <Input
                  id="status_by_sample"
                  value={formData?.status_by_sample ?? "-"}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status_from_merchandiser">Status From Merchandiser</Label>
                <Select
                  value={formData?.status_from_merchandiser || undefined}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, status_from_merchandiser: value || "" }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Following Up">Following Up</SelectItem>
                    <SelectItem value="Awaiting Feedback">Awaiting Feedback</SelectItem>
                    <SelectItem value="Action Required">Action Required</SelectItem>
                    <SelectItem value="Closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData?.notes ?? ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes or comments"
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="updated_by">Updated By</Label>
              <Input
                id="updated_by"
                value={formData?.updated_by ?? ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, updated_by: e.target.value }))}
                placeholder="Your name or ID"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expecting_end_date">Expecting End Date (Read-only)</Label>
              <Input
                id="expecting_end_date"
                type="date"
                value={formData?.expecting_end_date ?? ""}
                disabled
                className="bg-muted"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Status"
                )}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="py-4 text-center text-muted-foreground">
            Please select a status record to edit.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
