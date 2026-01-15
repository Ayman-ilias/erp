"use client";

import * as React from "react";
import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { PlusCircle, Edit, Trash2, Search, X, Check, ChevronsUpDown, Eye, Kanban } from "lucide-react";
import { samplesService, workflowService, usersService } from "@/services/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default function SamplePlanPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [filteredPlans, setFilteredPlans] = useState<any[]>([]);
  const [sampleRequests, setSampleRequests] = useState<any[]>([]);
  const [machines, setMachines] = useState<any[]>([]);
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ search: "" });
  const [sampleOpen, setSampleOpen] = useState(false);
  const [sampleSearch, setSampleSearch] = useState("");

  const [formData, setFormData] = useState({
    sample_request_id: "",
    assigned_designer: "",
    assigned_programmer: "",
    assigned_supervisor_knitting: "",
    assigned_supervisor_finishing: "",
    required_knitting_machine_id: "",
    delivery_plan_date: "",
    create_workflow: true, // New field for workflow creation
    workflow_name: "", // New field for workflow name
    priority: "medium", // New field for workflow priority
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [plans, filters, sampleRequests]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [planData, requestData, machineData, workflowData, userData] = await Promise.all([
        samplesService.plans.getAll(),
        samplesService.requests.getAll(),
        samplesService.machines.getAll(true),
        workflowService.getWorkflows().catch(() => []),
        usersService.getAll("", 1000).catch(() => []),
      ]);
      setPlans(Array.isArray(planData) ? planData : []);
      setSampleRequests(Array.isArray(requestData) ? requestData : []);
      setMachines(Array.isArray(machineData) ? machineData : []);
      setWorkflows(Array.isArray(workflowData) ? workflowData : []);
      setUsers(Array.isArray(userData) ? userData : []);
    } catch (error) {
      console.error("Failed to load data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...plans];
    if (filters.search) {
      const s = filters.search.toLowerCase();
      filtered = filtered.filter((p) => {
        const request = sampleRequests.find((r) => r.id === p.sample_request_id);
        return request?.sample_id?.toLowerCase().includes(s) ||
          request?.sample_name?.toLowerCase().includes(s) ||
          p.assigned_designer?.toLowerCase().includes(s) ||
          p.assigned_programmer?.toLowerCase().includes(s);
      });
    }
    setFilteredPlans(filtered);
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
    const selectedSample = sampleRequests.find(r => r.id.toString() === requestId);
    setFormData({ 
      ...formData, 
      sample_request_id: requestId,
      workflow_name: selectedSample ? `Sample Development - ${selectedSample.sample_id}` : ""
    });
    setSampleOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const planData = {
        sample_request_id: parseInt(formData.sample_request_id),
        assigned_designer: formData.assigned_designer || null,
        assigned_programmer: formData.assigned_programmer || null,
        assigned_supervisor_knitting: formData.assigned_supervisor_knitting || null,
        assigned_supervisor_finishing: formData.assigned_supervisor_finishing || null,
        required_knitting_machine_id: formData.required_knitting_machine_id ? parseInt(formData.required_knitting_machine_id) : null,
        delivery_plan_date: formData.delivery_plan_date || null,
      };

      if (editingItem) {
        await samplesService.plans.update(editingItem.id, planData);
        toast.success("Sample plan updated successfully");
      } else {
        await samplesService.plans.create(planData);
        toast.success("Sample plan created successfully");
        
        // Create workflow if requested (Requirements 1.1, 10.4)
        if (formData.create_workflow && formData.workflow_name) {
          try {
            const workflowData = {
              sample_request_id: parseInt(formData.sample_request_id),
              workflow_name: formData.workflow_name,
              assigned_designer: formData.assigned_designer || null,
              assigned_programmer: formData.assigned_programmer || null,
              assigned_supervisor_knitting: formData.assigned_supervisor_knitting || null,
              assigned_supervisor_finishing: formData.assigned_supervisor_finishing || null,
              required_knitting_machine_id: formData.required_knitting_machine_id ? parseInt(formData.required_knitting_machine_id) : null,
              delivery_plan_date: formData.delivery_plan_date || null,
              priority: formData.priority,
            };
            
            await workflowService.createWorkflow(workflowData);
            toast.success("Workflow created successfully");
          } catch (workflowError: any) {
            console.error("Workflow creation failed:", workflowError);
            toast.warning("Sample plan created but workflow creation failed: " + (workflowError?.message || "Unknown error"));
          }
        }
      }

      setIsDialogOpen(false);
      resetForm();
      loadData();
    } catch (error: any) {
      toast.error(error?.message || "Failed to save sample plan");
    }
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      sample_request_id: item.sample_request_id?.toString() || "",
      assigned_designer: item.assigned_designer || "",
      assigned_programmer: item.assigned_programmer || "",
      assigned_supervisor_knitting: item.assigned_supervisor_knitting || "",
      assigned_supervisor_finishing: item.assigned_supervisor_finishing || "",
      required_knitting_machine_id: item.required_knitting_machine_id?.toString() || "",
      delivery_plan_date: item.delivery_plan_date?.split("T")[0] || "",
      create_workflow: false, // Don't create workflow when editing
      workflow_name: "",
      priority: "medium",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this sample plan?")) {
      try {
        await samplesService.plans.delete(id);
        toast.success("Sample plan deleted successfully");
        loadData();
      } catch (error) {
        toast.error("Failed to delete sample plan");
      }
    }
  };

  const resetForm = () => {
    setEditingItem(null);
    setFormData({
      sample_request_id: "", assigned_designer: "", assigned_programmer: "",
      assigned_supervisor_knitting: "", assigned_supervisor_finishing: "",
      required_knitting_machine_id: "", delivery_plan_date: "",
      create_workflow: true, workflow_name: "", priority: "medium",
    });
    setSampleSearch("");
  };

  const getRequestInfo = (requestId: number) => {
    return sampleRequests.find((r) => r.id === requestId);
  };

  const getWorkflowForSample = (sampleRequestId: number) => {
    return workflows.find((w) => w.sample_request_id === sampleRequestId);
  };

  const getWorkflowStatusBadge = (workflow: any) => {
    if (!workflow) return null;

    const statusColors: Record<string, string> = {
      active: "bg-blue-100 text-blue-800 border-blue-200",
      completed: "bg-green-100 text-green-800 border-green-200",
      cancelled: "bg-gray-100 text-gray-800 border-gray-200",
    };

    return (
      <Badge variant="outline" className={statusColors[workflow.workflow_status] || ""}>
        {workflow.workflow_status}
      </Badge>
    );
  };

  const selectedRequest = sampleRequests.find((r) => r.id.toString() === formData.sample_request_id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sample Plan</h1>
          <p className="text-muted-foreground">Assign designers, programmers, supervisors and machines to samples</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/erp/samples/workflow-board">
            <Button variant="outline" size="lg">
              <Kanban className="mr-2 h-5 w-5" /> View Workflow Board
            </Button>
          </Link>
          <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button><PlusCircle className="mr-2 h-4 w-4" />New Sample Plan</Button>
            </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingItem ? "Edit" : "New"} Sample Plan</DialogTitle>
              <DialogDescription>Assign resources to the sample</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Sample ID Selection */}
              <div className="space-y-2">
                <Label>Sample ID *</Label>
                <Popover open={sampleOpen} onOpenChange={setSampleOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" aria-expanded={sampleOpen} className="w-full justify-between">
                      {selectedRequest ? `${selectedRequest.sample_id} - ${selectedRequest.sample_name}` : "Search & select sample..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[500px] p-0">
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
                              <span className="ml-2 text-muted-foreground">({r.buyer_name})</span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Designer & Programmer */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Assign Designer</Label>
                  <Select value={formData.assigned_designer} onValueChange={(value) => setFormData({ ...formData, assigned_designer: value === 'unassigned' ? '' : value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select designer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">No Designer</SelectItem>
                      {users.filter(u => u.is_active).map((user) => (
                        <SelectItem key={user.id} value={user.full_name || user.username}>
                          {user.full_name || user.username}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Assign Programmer</Label>
                  <Select value={formData.assigned_programmer} onValueChange={(value) => setFormData({ ...formData, assigned_programmer: value === 'unassigned' ? '' : value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select programmer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">No Programmer</SelectItem>
                      {users.filter(u => u.is_active).map((user) => (
                        <SelectItem key={user.id} value={user.full_name || user.username}>
                          {user.full_name || user.username}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Supervisors */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Assign Supervisor Knitting</Label>
                  <Select value={formData.assigned_supervisor_knitting} onValueChange={(value) => setFormData({ ...formData, assigned_supervisor_knitting: value === 'unassigned' ? '' : value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select knitting supervisor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">No Supervisor</SelectItem>
                      {users.filter(u => u.is_active).map((user) => (
                        <SelectItem key={user.id} value={user.full_name || user.username}>
                          {user.full_name || user.username}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Assign Supervisor Finishing</Label>
                  <Select value={formData.assigned_supervisor_finishing} onValueChange={(value) => setFormData({ ...formData, assigned_supervisor_finishing: value === 'unassigned' ? '' : value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select finishing supervisor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">No Supervisor</SelectItem>
                      {users.filter(u => u.is_active).map((user) => (
                        <SelectItem key={user.id} value={user.full_name || user.username}>
                          {user.full_name || user.username}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Machine & Delivery Date */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Required Knitting Machine</Label>
                  <Select value={formData.required_knitting_machine_id} onValueChange={(v) => setFormData({ ...formData, required_knitting_machine_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Select machine" /></SelectTrigger>
                    <SelectContent>
                      {machines.map((m) => (
                        <SelectItem key={m.id} value={m.id.toString()}>
                          {m.machine_name} ({m.machine_code}) - {m.gauge_capability}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Delivery Plan Date</Label>
                  <Input type="date" value={formData.delivery_plan_date} onChange={(e) => setFormData({ ...formData, delivery_plan_date: e.target.value })} />
                </div>
              </div>

              {/* Workflow Creation Options (only for new plans) */}
              {!editingItem && (
                <>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="create_workflow"
                        checked={formData.create_workflow}
                        onCheckedChange={(checked) => setFormData({ ...formData, create_workflow: !!checked })}
                      />
                      <Label htmlFor="create_workflow">Create ClickUp-style workflow for this sample</Label>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      This will create a visual workflow board with cards for each development stage
                    </p>
                  </div>

                  {formData.create_workflow && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Workflow Name *</Label>
                        <Input
                          value={formData.workflow_name}
                          onChange={(e) => setFormData({ ...formData, workflow_name: e.target.value })}
                          placeholder="e.g., Sample Development - [Sample ID]"
                          required={formData.create_workflow}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Priority</Label>
                        <Select value={formData.priority} onValueChange={(v) => setFormData({ ...formData, priority: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </>
              )}

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit">{editingItem ? "Update" : "Create"}              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by Sample ID, Name, Designer, Programmer..." value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} className="pl-9" />
          </div>
          <Button variant="outline" size="icon" onClick={() => setFilters({ search: "" })}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="mt-2 text-sm text-muted-foreground">
          Showing {filteredPlans.length} of {plans.length} plans
        </div>
      </Card>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sample ID</TableHead>
              <TableHead>Designer</TableHead>
              <TableHead>Programmer</TableHead>
              <TableHead>Supervisor Knitting</TableHead>
              <TableHead>Supervisor Finishing</TableHead>
              <TableHead>Machine</TableHead>
              <TableHead>Delivery Date</TableHead>
              <TableHead>Workflow</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPlans.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-muted-foreground">
                  {loading ? "Loading..." : "No sample plans found"}
                </TableCell>
              </TableRow>
            ) : (
              filteredPlans.map((item) => {
                const request = getRequestInfo(item.sample_request_id);
                const workflow = getWorkflowForSample(item.sample_request_id);
                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono font-medium">{request?.sample_id || "-"}</TableCell>
                    <TableCell>{item.assigned_designer || "-"}</TableCell>
                    <TableCell>{item.assigned_programmer || "-"}</TableCell>
                    <TableCell>{item.assigned_supervisor_knitting || "-"}</TableCell>
                    <TableCell>{item.assigned_supervisor_finishing || "-"}</TableCell>
                    <TableCell>{item.machine?.machine_name || "-"}</TableCell>
                    <TableCell>{item.delivery_plan_date?.split("T")[0] || "-"}</TableCell>
                    <TableCell>
                      {workflow ? (
                        getWorkflowStatusBadge(workflow)
                      ) : (
                        <span className="text-sm text-muted-foreground">No workflow</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {workflow && (
                        <Link href={`/dashboard/erp/samples/workflow-board?workflow_id=${workflow.id}`}>
                          <Button variant="ghost" size="icon" title="View Workflow Board">
                            <Kanban className="h-4 w-4" />
                          </Button>
                        </Link>
                      )}
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
