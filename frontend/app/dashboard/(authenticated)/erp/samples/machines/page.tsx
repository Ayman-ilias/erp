"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Edit, Trash2, Search, Cog } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { samplesService } from "@/services/api";
import { toast } from "sonner";

const MACHINE_TYPES = ["Flat Knitting", "Circular Knitting", "Warp Knitting", "Linking", "Other"];

export default function SampleMachinesPage() {
  const [machines, setMachines] = useState<any[]>([]);
  const [filteredMachines, setFilteredMachines] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    machine_code: "",
    machine_name: "",
    machine_type: "",
    gauge_capability: "",
    brand: "",
    location: "",
    is_active: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = machines.filter(
        (m) =>
          m.machine_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          m.machine_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          m.machine_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          m.brand?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredMachines(filtered);
    } else {
      setFilteredMachines(machines);
    }
  }, [searchTerm, machines]);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await samplesService.machines.getAll();
      setMachines(Array.isArray(data) ? data : []);
      setFilteredMachines(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load machines:", error);
      toast.error("Failed to load machines");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await samplesService.machines.update(editingItem.id, formData);
        toast.success("Machine updated successfully");
      } else {
        await samplesService.machines.create(formData);
        toast.success("Machine created successfully");
      }
      setIsDialogOpen(false);
      resetForm();
      loadData();
    } catch (error: any) {
      toast.error(error?.message || "Failed to save machine");
    }
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      machine_code: item.machine_code || "",
      machine_name: item.machine_name || "",
      machine_type: item.machine_type || "",
      gauge_capability: item.gauge_capability || "",
      brand: item.brand || "",
      location: item.location || "",
      is_active: item.is_active !== false,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this machine?")) {
      try {
        await samplesService.machines.delete(id);
        toast.success("Machine deleted successfully");
        loadData();
      } catch (error) {
        toast.error("Failed to delete machine");
      }
    }
  };

  const resetForm = () => {
    setEditingItem(null);
    setFormData({
      machine_code: "",
      machine_name: "",
      machine_type: "",
      gauge_capability: "",
      brand: "",
      location: "",
      is_active: true,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sample Machines</h1>
          <p className="text-muted-foreground">
            Manage knitting machines available for sample production
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Machine
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingItem ? "Edit" : "Add"} Machine</DialogTitle>
              <DialogDescription>Configure knitting machine details</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Machine Code *</Label>
                    <Input
                      value={formData.machine_code}
                      onChange={(e) => setFormData({ ...formData, machine_code: e.target.value })}
                      placeholder="MC-001"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Machine Name *</Label>
                    <Input
                      value={formData.machine_name}
                      onChange={(e) => setFormData({ ...formData, machine_name: e.target.value })}
                      placeholder="Flat Knitting Machine 1"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Machine Type</Label>
                    <Select
                      value={formData.machine_type}
                      onValueChange={(v) => setFormData({ ...formData, machine_type: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {MACHINE_TYPES.map((t) => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Gauge Capability</Label>
                    <Input
                      value={formData.gauge_capability}
                      onChange={(e) => setFormData({ ...formData, gauge_capability: e.target.value })}
                      placeholder="5GG, 7GG, 12GG"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Brand</Label>
                    <Input
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      placeholder="Shima Seiki, Stoll"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Input
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="Floor 2, Section A"
                    />
                  </div>
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
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search machines..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 max-w-sm"
          />
        </div>
      </Card>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Gauge</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMachines.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground">
                  {loading ? "Loading..." : "No machines found"}
                </TableCell>
              </TableRow>
            ) : (
              filteredMachines.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-mono font-medium">{item.machine_code}</TableCell>
                  <TableCell>{item.machine_name}</TableCell>
                  <TableCell>{item.machine_type || "-"}</TableCell>
                  <TableCell>{item.gauge_capability || "-"}</TableCell>
                  <TableCell>{item.brand || "-"}</TableCell>
                  <TableCell>{item.location || "-"}</TableCell>
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
