"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Edit, Trash2, Search, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { samplesService } from "@/services/api";
import { toast } from "sonner";

const OPERATION_TYPES = [
  "Knitting",
  "Linking",
  "Washing",
  "Ironing",
  "Finishing",
  "Quality Check",
  "Packing",
  "Cutting",
  "Sewing",
  "Embroidery",
  "Printing",
  "Other"
];

export default function AddNewManufacturingOperationsPage() {
  const [operations, setOperations] = useState<any[]>([]);
  const [filteredOperations, setFilteredOperations] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [formData, setFormData] = useState({
    operation_type: "",
    operation_name: "",
    standard_duration: "",
    is_active: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    let filtered = [...operations];

    if (searchTerm) {
      filtered = filtered.filter(
        (op) =>
          op.operation_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          op.operation_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (typeFilter && typeFilter !== "all") {
      filtered = filtered.filter((op) => op.operation_type === typeFilter);
    }

    setFilteredOperations(filtered);
  }, [searchTerm, typeFilter, operations]);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await samplesService.manufacturingOperations.getAll();
      setOperations(Array.isArray(data) ? data : []);
      setFilteredOperations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load operations:", error);
      toast.error("Failed to load operations");
    } finally {
      setLoading(false);
    }
  };

  // Generate next Operation ID
  const generateOperationId = () => {
    const existingIds = operations.map((op) => op.operation_id).filter(Boolean);
    const numbers = existingIds
      .filter((id: string) => id.startsWith("OP-"))
      .map((id: string) => parseInt(id.replace("OP-", ""), 10))
      .filter((n: number) => !isNaN(n));

    const nextNumber = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
    return `OP-${String(nextNumber).padStart(3, "0")}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        operation_id: editingItem ? editingItem.operation_id : generateOperationId(),
        operation_type: formData.operation_type || null,
        operation_name: formData.operation_name,
        standard_duration: formData.standard_duration ? parseFloat(formData.standard_duration) : null,
        is_active: formData.is_active,
      };

      if (editingItem) {
        await samplesService.manufacturingOperations.update(editingItem.id, data);
        toast.success("Operation updated successfully");
      } else {
        await samplesService.manufacturingOperations.create(data);
        toast.success("Operation created successfully");
      }
      setIsDialogOpen(false);
      resetForm();
      loadData();
    } catch (error: any) {
      toast.error(error?.message || "Failed to save operation");
    }
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      operation_type: item.operation_type || "",
      operation_name: item.operation_name || "",
      standard_duration: item.standard_duration?.toString() || "",
      is_active: item.is_active !== false,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this operation?")) {
      try {
        await samplesService.manufacturingOperations.delete(id);
        toast.success("Operation deleted successfully");
        loadData();
      } catch (error) {
        toast.error("Failed to delete operation");
      }
    }
  };

  const resetForm = () => {
    setEditingItem(null);
    setFormData({
      operation_type: "",
      operation_name: "",
      standard_duration: "",
      is_active: true,
    });
  };

  const uniqueTypes = [...new Set(operations.map((op) => op.operation_type).filter(Boolean))].sort();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Add New Manufacturing Operations</h1>
          <p className="text-muted-foreground">
            Master data for production operations (Operation ID auto-generated)
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Operation
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingItem ? "Edit" : "Add"} Operation</DialogTitle>
              <DialogDescription>
                {editingItem
                  ? `Editing ${editingItem.operation_id}`
                  : `Next ID: ${generateOperationId()}`}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                {editingItem && (
                  <div className="space-y-2">
                    <Label>Operation ID</Label>
                    <Input value={editingItem.operation_id} disabled className="font-mono bg-muted" />
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Operation Name *</Label>
                  <Input
                    value={formData.operation_name}
                    onChange={(e) => setFormData({ ...formData, operation_name: e.target.value })}
                    placeholder="e.g., Panel Knitting, Collar Linking"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Operation Type (Optional)</Label>
                  <Select
                    value={formData.operation_type || undefined}
                    onValueChange={(v) => setFormData({ ...formData, operation_type: v === "none" ? "" : v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {OPERATION_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Standard Duration (minutes)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.standard_duration}
                    onChange={(e) => setFormData({ ...formData, standard_duration: e.target.value })}
                    placeholder="e.g., 15.5"
                  />
                  <p className="text-xs text-muted-foreground">Default time for this operation</p>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(c) => setFormData({ ...formData, is_active: !!c })}
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">{editingItem ? "Update" : "Create"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by ID or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={typeFilter || "all"} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {uniqueTypes.map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={() => { setSearchTerm(""); setTypeFilter("all"); }}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="mt-2 text-sm text-muted-foreground">
          Showing {filteredOperations.length} of {operations.length} operations
        </div>
      </Card>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Operation ID</TableHead>
              <TableHead>Operation Type</TableHead>
              <TableHead>Operation Name</TableHead>
              <TableHead>Std. Duration</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOperations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  {loading ? "Loading..." : "No operations found"}
                </TableCell>
              </TableRow>
            ) : (
              filteredOperations.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-mono font-medium">{item.operation_id}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{item.operation_type}</Badge>
                  </TableCell>
                  <TableCell>{item.operation_name}</TableCell>
                  <TableCell>
                    {item.standard_duration ? `${item.standard_duration} min` : "-"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={item.is_active ? "default" : "secondary"}>
                      {item.is_active ? "Active" : "Inactive"}
                    </Badge>
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
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
