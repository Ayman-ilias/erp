"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Edit, Trash2, Shield } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { settingsService } from "@/services/api";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";

export default function TaxesPage() {
  const { user, token } = useAuth();
  const [taxes, setTaxes] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    tax_code: "", tax_name: "", tax_type: "", rate: "0", is_compound: false, is_recoverable: true, is_active: true, effective_from: "", effective_to: "", remarks: "",
  });

  useEffect(() => { if (token && user?.is_superuser) loadData(); }, [token, user]);

  const loadData = async () => {
    try { if (!token) return; setLoading(true); const data = await settingsService.taxes.getAll(token); setTaxes(Array.isArray(data) ? data : []); } catch (error) { toast.error("Failed to load taxes"); } finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!token) return;
      const data = { ...formData, rate: parseFloat(formData.rate), effective_from: formData.effective_from || null, effective_to: formData.effective_to || null };
      if (editingItem) { await settingsService.taxes.update(editingItem.id, data, token); toast.success("Tax updated"); }
      else { await settingsService.taxes.create(data, token); toast.success("Tax created"); }
      setIsDialogOpen(false); resetForm(); loadData();
    } catch (error: any) { toast.error(error?.message || "Failed to save"); }
  };

  const handleEdit = (item: any) => { setEditingItem(item); setFormData({ tax_code: item.tax_code || "", tax_name: item.tax_name || "", tax_type: item.tax_type || "", rate: item.rate?.toString() || "0", is_compound: item.is_compound || false, is_recoverable: item.is_recoverable !== false, is_active: item.is_active !== false, effective_from: item.effective_from?.split("T")[0] || "", effective_to: item.effective_to?.split("T")[0] || "", remarks: item.remarks || "" }); setIsDialogOpen(true); };
  const handleDelete = async (id: number) => { if (confirm("Delete this tax?")) { try { if (!token) return; await settingsService.taxes.delete(id, token); toast.success("Deleted"); loadData(); } catch (error) { toast.error("Failed to delete"); } } };
  const resetForm = () => { setEditingItem(null); setFormData({ tax_code: "", tax_name: "", tax_type: "", rate: "0", is_compound: false, is_recoverable: true, is_active: true, effective_from: "", effective_to: "", remarks: "" }); };

  if (!user?.is_superuser) return <div className="flex items-center justify-center min-h-[400px]"><Card className="p-8 text-center"><Shield className="h-16 w-16 mx-auto mb-4 text-destructive" /><h2 className="text-2xl font-bold mb-2">Access Denied</h2></Card></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold">Taxes</h1><p className="text-muted-foreground">Manage tax rates and configurations</p></div>
        <Dialog open={isDialogOpen} onOpenChange={(o) => { setIsDialogOpen(o); if (!o) resetForm(); }}>
          <DialogTrigger asChild><Button><PlusCircle className="mr-2 h-4 w-4" />Add Tax</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editingItem ? "Edit" : "Add"} Tax</DialogTitle><DialogDescription>Tax configuration for transactions</DialogDescription></DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Tax Code *</Label><Input value={formData.tax_code} onChange={(e) => setFormData({ ...formData, tax_code: e.target.value.toUpperCase() })} placeholder="VAT" required /></div>
                  <div className="space-y-2"><Label>Tax Type</Label><Input value={formData.tax_type} onChange={(e) => setFormData({ ...formData, tax_type: e.target.value })} placeholder="Sales, Purchase, Withholding" /></div>
                </div>
                <div className="space-y-2"><Label>Tax Name *</Label><Input value={formData.tax_name} onChange={(e) => setFormData({ ...formData, tax_name: e.target.value })} placeholder="Value Added Tax" required /></div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2"><Label>Rate (%) *</Label><Input type="number" step="0.01" value={formData.rate} onChange={(e) => setFormData({ ...formData, rate: e.target.value })} required /></div>
                  <div className="space-y-2"><Label>Effective From</Label><Input type="date" value={formData.effective_from} onChange={(e) => setFormData({ ...formData, effective_from: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Effective To</Label><Input type="date" value={formData.effective_to} onChange={(e) => setFormData({ ...formData, effective_to: e.target.value })} /></div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center space-x-2"><Checkbox id="is_compound" checked={formData.is_compound} onCheckedChange={(c) => setFormData({ ...formData, is_compound: !!c })} /><Label htmlFor="is_compound">Compound Tax</Label></div>
                  <div className="flex items-center space-x-2"><Checkbox id="is_recoverable" checked={formData.is_recoverable} onCheckedChange={(c) => setFormData({ ...formData, is_recoverable: !!c })} /><Label htmlFor="is_recoverable">Recoverable</Label></div>
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
          <TableHeader><TableRow><TableHead>Code</TableHead><TableHead>Name</TableHead><TableHead>Type</TableHead><TableHead>Rate</TableHead><TableHead>Compound</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {taxes.length === 0 ? <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">{loading ? "Loading..." : "No taxes"}</TableCell></TableRow> : taxes.map((item) => (
              <TableRow key={item.id}><TableCell className="font-medium">{item.tax_code}</TableCell><TableCell>{item.tax_name}</TableCell><TableCell>{item.tax_type || "-"}</TableCell><TableCell>{parseFloat(item.rate).toFixed(2)}%</TableCell><TableCell>{item.is_compound ? "Yes" : "No"}</TableCell><TableCell><Badge variant={item.is_active ? "default" : "secondary"}>{item.is_active ? "Active" : "Inactive"}</Badge></TableCell><TableCell className="text-right"><Button variant="ghost" size="icon" onClick={() => handleEdit(item)}><Edit className="h-4 w-4" /></Button><Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell></TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
