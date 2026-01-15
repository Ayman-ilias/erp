"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Edit, Trash2, Shield } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { settingsService } from "@/services/api";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";

export default function WarehousesPage() {
  const { user, token } = useAuth();
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    warehouse_code: "", warehouse_name: "", warehouse_type: "", branch_id: "", address: "", city: "", country: "", manager_name: "", capacity_sqft: "", is_default: false, is_active: true,
  });

  useEffect(() => { if (token && user?.is_superuser) loadData(); }, [token, user]);

  const loadData = async () => {
    try {
      if (!token) return; setLoading(true);
      const [whData, branchData] = await Promise.all([settingsService.warehouses.getAll(token), settingsService.branches.getAll(token)]);
      setWarehouses(Array.isArray(whData) ? whData : []); setBranches(Array.isArray(branchData) ? branchData : []);
    } catch (error) { toast.error("Failed to load data"); } finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!token) return;
      const data = { ...formData, branch_id: formData.branch_id ? parseInt(formData.branch_id) : null, capacity_sqft: formData.capacity_sqft ? parseFloat(formData.capacity_sqft) : null };
      if (editingItem) { await settingsService.warehouses.update(editingItem.id, data, token); toast.success("Warehouse updated"); }
      else { await settingsService.warehouses.create(data, token); toast.success("Warehouse created"); }
      setIsDialogOpen(false); resetForm(); loadData();
    } catch (error: any) { toast.error(error?.message || "Failed to save"); }
  };

  const handleEdit = (item: any) => { setEditingItem(item); setFormData({ warehouse_code: item.warehouse_code || "", warehouse_name: item.warehouse_name || "", warehouse_type: item.warehouse_type || "", branch_id: item.branch_id?.toString() || "", address: item.address || "", city: item.city || "", country: item.country || "", manager_name: item.manager_name || "", capacity_sqft: item.capacity_sqft?.toString() || "", is_default: item.is_default || false, is_active: item.is_active !== false }); setIsDialogOpen(true); };
  const handleDelete = async (id: number) => { if (confirm("Delete this warehouse?")) { try { if (!token) return; await settingsService.warehouses.delete(id, token); toast.success("Deleted"); loadData(); } catch (error) { toast.error("Failed to delete"); } } };
  const resetForm = () => { setEditingItem(null); setFormData({ warehouse_code: "", warehouse_name: "", warehouse_type: "", branch_id: "", address: "", city: "", country: "", manager_name: "", capacity_sqft: "", is_default: false, is_active: true }); };
  const getBranchName = (id: number) => branches.find((b) => b.id === id)?.branch_name || "-";

  if (!user?.is_superuser) return <div className="flex items-center justify-center min-h-[400px]"><Card className="p-8 text-center"><Shield className="h-16 w-16 mx-auto mb-4 text-destructive" /><h2 className="text-2xl font-bold mb-2">Access Denied</h2></Card></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold">Warehouses</h1><p className="text-muted-foreground">Manage warehouse locations</p></div>
        <Dialog open={isDialogOpen} onOpenChange={(o) => { setIsDialogOpen(o); if (!o) resetForm(); }}>
          <DialogTrigger asChild><Button><PlusCircle className="mr-2 h-4 w-4" />Add Warehouse</Button></DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>{editingItem ? "Edit" : "Add"} Warehouse</DialogTitle><DialogDescription>Warehouse location configuration</DialogDescription></DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Warehouse Code *</Label><Input value={formData.warehouse_code} onChange={(e) => setFormData({ ...formData, warehouse_code: e.target.value.toUpperCase() })} required /></div>
                  <div className="space-y-2"><Label>Type</Label><Input value={formData.warehouse_type} onChange={(e) => setFormData({ ...formData, warehouse_type: e.target.value })} placeholder="Raw, Finished, General" /></div>
                </div>
                <div className="space-y-2"><Label>Warehouse Name *</Label><Input value={formData.warehouse_name} onChange={(e) => setFormData({ ...formData, warehouse_name: e.target.value })} required /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Branch</Label><Select value={formData.branch_id} onValueChange={(v) => setFormData({ ...formData, branch_id: v })}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{branches.map((b) => <SelectItem key={b.id} value={b.id.toString()}>{b.branch_name}</SelectItem>)}</SelectContent></Select></div>
                  <div className="space-y-2"><Label>Capacity (sqft)</Label><Input type="number" value={formData.capacity_sqft} onChange={(e) => setFormData({ ...formData, capacity_sqft: e.target.value })} /></div>
                </div>
                <div className="space-y-2"><Label>Address</Label><Input value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>City</Label><Input value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Manager</Label><Input value={formData.manager_name} onChange={(e) => setFormData({ ...formData, manager_name: e.target.value })} /></div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center space-x-2"><Checkbox id="is_default" checked={formData.is_default} onCheckedChange={(c) => setFormData({ ...formData, is_default: !!c })} /><Label htmlFor="is_default">Default</Label></div>
                  <div className="flex items-center space-x-2"><Checkbox id="is_active" checked={formData.is_active} onCheckedChange={(c) => setFormData({ ...formData, is_active: !!c })} /><Label htmlFor="is_active">Active</Label></div>
                </div>
              </div>
              <DialogFooter><Button type="submit">{editingItem ? "Update" : "Create"}</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader><TableRow><TableHead>Code</TableHead><TableHead>Name</TableHead><TableHead>Type</TableHead><TableHead>Branch</TableHead><TableHead>City</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {warehouses.length === 0 ? <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">{loading ? "Loading..." : "No warehouses"}</TableCell></TableRow> : warehouses.map((item) => (
              <TableRow key={item.id}><TableCell className="font-medium">{item.warehouse_code}{item.is_default && <Badge variant="secondary" className="ml-2">Default</Badge>}</TableCell><TableCell>{item.warehouse_name}</TableCell><TableCell>{item.warehouse_type || "-"}</TableCell><TableCell>{getBranchName(item.branch_id)}</TableCell><TableCell>{item.city || "-"}</TableCell><TableCell><Badge variant={item.is_active ? "default" : "secondary"}>{item.is_active ? "Active" : "Inactive"}</Badge></TableCell><TableCell className="text-right"><Button variant="ghost" size="icon" onClick={() => handleEdit(item)}><Edit className="h-4 w-4" /></Button><Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell></TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
