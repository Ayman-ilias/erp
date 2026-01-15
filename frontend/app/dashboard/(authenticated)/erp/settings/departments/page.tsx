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

export default function DepartmentsPage() {
  const { user, token } = useAuth();
  const [departments, setDepartments] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    department_code: "", department_name: "", parent_department_id: "", branch_id: "", manager_user_id: "", cost_center_code: "", is_active: true, remarks: "",
  });

  useEffect(() => { if (token && user?.is_superuser) loadData(); }, [token, user]);

  const loadData = async () => {
    try {
      if (!token) return;
      setLoading(true);
      const [deptData, branchData] = await Promise.all([
        settingsService.departments.getAll(token),
        settingsService.branches.getAll(token),
      ]);
      setDepartments(Array.isArray(deptData) ? deptData : []);
      setBranches(Array.isArray(branchData) ? branchData : []);
    } catch (error) { toast.error("Failed to load data"); } finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!token) return;
      const data = { ...formData, parent_department_id: formData.parent_department_id ? parseInt(formData.parent_department_id) : null, branch_id: formData.branch_id ? parseInt(formData.branch_id) : null, manager_user_id: formData.manager_user_id ? parseInt(formData.manager_user_id) : null };
      if (editingItem) { await settingsService.departments.update(editingItem.id, data, token); toast.success("Department updated"); }
      else { await settingsService.departments.create(data, token); toast.success("Department created"); }
      setIsDialogOpen(false); resetForm(); loadData();
    } catch (error: any) { toast.error(error?.message || "Failed to save"); }
  };

  const handleEdit = (item: any) => { setEditingItem(item); setFormData({ department_code: item.department_code || "", department_name: item.department_name || "", parent_department_id: item.parent_department_id?.toString() || "", branch_id: item.branch_id?.toString() || "", manager_user_id: item.manager_user_id?.toString() || "", cost_center_code: item.cost_center_code || "", is_active: item.is_active !== false, remarks: item.remarks || "" }); setIsDialogOpen(true); };
  const handleDelete = async (id: number) => { if (confirm("Delete this department?")) { try { if (!token) return; await settingsService.departments.delete(id, token); toast.success("Deleted"); loadData(); } catch (error) { toast.error("Failed to delete"); } } };
  const resetForm = () => { setEditingItem(null); setFormData({ department_code: "", department_name: "", parent_department_id: "", branch_id: "", manager_user_id: "", cost_center_code: "", is_active: true, remarks: "" }); };
  const getBranchName = (id: number) => branches.find((b) => b.id === id)?.branch_name || "-";
  const getParentName = (id: number) => departments.find((d) => d.id === id)?.department_name || "-";

  if (!user?.is_superuser) return <div className="flex items-center justify-center min-h-[400px]"><Card className="p-8 text-center"><Shield className="h-16 w-16 mx-auto mb-4 text-destructive" /><h2 className="text-2xl font-bold mb-2">Access Denied</h2></Card></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold">Departments</h1><p className="text-muted-foreground">Manage organizational departments</p></div>
        <Dialog open={isDialogOpen} onOpenChange={(o) => { setIsDialogOpen(o); if (!o) resetForm(); }}>
          <DialogTrigger asChild><Button><PlusCircle className="mr-2 h-4 w-4" />Add Department</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editingItem ? "Edit" : "Add"} Department</DialogTitle><DialogDescription>Organizational unit configuration</DialogDescription></DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Department Code *</Label><Input value={formData.department_code} onChange={(e) => setFormData({ ...formData, department_code: e.target.value.toUpperCase() })} required /></div>
                  <div className="space-y-2"><Label>Cost Center Code</Label><Input value={formData.cost_center_code} onChange={(e) => setFormData({ ...formData, cost_center_code: e.target.value })} /></div>
                </div>
                <div className="space-y-2"><Label>Department Name *</Label><Input value={formData.department_name} onChange={(e) => setFormData({ ...formData, department_name: e.target.value })} required /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Branch</Label><Select value={formData.branch_id} onValueChange={(v) => setFormData({ ...formData, branch_id: v })}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{branches.map((b) => <SelectItem key={b.id} value={b.id.toString()}>{b.branch_name}</SelectItem>)}</SelectContent></Select></div>
                  <div className="space-y-2"><Label>Parent Department</Label><Select value={formData.parent_department_id} onValueChange={(v) => setFormData({ ...formData, parent_department_id: v })}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{departments.filter((d) => d.id !== editingItem?.id).map((d) => <SelectItem key={d.id} value={d.id.toString()}>{d.department_name}</SelectItem>)}</SelectContent></Select></div>
                </div>
                <div className="space-y-2"><Label>Remarks</Label><Input value={formData.remarks} onChange={(e) => setFormData({ ...formData, remarks: e.target.value })} /></div>
                <div className="flex items-center space-x-2"><Checkbox id="is_active" checked={formData.is_active} onCheckedChange={(c) => setFormData({ ...formData, is_active: !!c })} /><Label htmlFor="is_active">Active</Label></div>
              </div>
              <DialogFooter><Button type="submit">{editingItem ? "Update" : "Create"}</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader><TableRow><TableHead>Code</TableHead><TableHead>Name</TableHead><TableHead>Branch</TableHead><TableHead>Parent</TableHead><TableHead>Cost Center</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {departments.length === 0 ? <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">{loading ? "Loading..." : "No departments"}</TableCell></TableRow> : departments.map((item) => (
              <TableRow key={item.id}><TableCell className="font-medium">{item.department_code}</TableCell><TableCell>{item.department_name}</TableCell><TableCell>{getBranchName(item.branch_id)}</TableCell><TableCell>{getParentName(item.parent_department_id)}</TableCell><TableCell>{item.cost_center_code || "-"}</TableCell><TableCell><Badge variant={item.is_active ? "default" : "secondary"}>{item.is_active ? "Active" : "Inactive"}</Badge></TableCell><TableCell className="text-right"><Button variant="ghost" size="icon" onClick={() => handleEdit(item)}><Edit className="h-4 w-4" /></Button><Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell></TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
