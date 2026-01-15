"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Edit, Trash2, Shield, Lock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { settingsService } from "@/services/api";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";

export default function FiscalYearPage() {
  const { user, token } = useAuth();
  const [fiscalYears, setFiscalYears] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fiscal_year_code: "", fiscal_year_name: "", start_date: "", end_date: "", is_current: false, is_closed: false,
  });

  useEffect(() => { if (token && user?.is_superuser) loadData(); }, [token, user]);

  const loadData = async () => {
    try { if (!token) return; setLoading(true); const data = await settingsService.fiscalYears.getAll(token); setFiscalYears(Array.isArray(data) ? data : []); } catch (error) { toast.error("Failed to load fiscal years"); } finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!token) return;
      if (editingItem) { await settingsService.fiscalYears.update(editingItem.id, formData, token); toast.success("Fiscal year updated"); }
      else { await settingsService.fiscalYears.create(formData, token); toast.success("Fiscal year created"); }
      setIsDialogOpen(false); resetForm(); loadData();
    } catch (error: any) { toast.error(error?.message || "Failed to save"); }
  };

  const handleEdit = (item: any) => { setEditingItem(item); setFormData({ fiscal_year_code: item.fiscal_year_code || "", fiscal_year_name: item.fiscal_year_name || "", start_date: item.start_date?.split("T")[0] || "", end_date: item.end_date?.split("T")[0] || "", is_current: item.is_current || false, is_closed: item.is_closed || false }); setIsDialogOpen(true); };
  const handleDelete = async (id: number) => { if (confirm("Delete this fiscal year?")) { try { if (!token) return; await settingsService.fiscalYears.delete(id, token); toast.success("Deleted"); loadData(); } catch (error) { toast.error("Failed to delete"); } } };
  const resetForm = () => { setEditingItem(null); setFormData({ fiscal_year_code: "", fiscal_year_name: "", start_date: "", end_date: "", is_current: false, is_closed: false }); };

  if (!user?.is_superuser) return <div className="flex items-center justify-center min-h-[400px]"><Card className="p-8 text-center"><Shield className="h-16 w-16 mx-auto mb-4 text-destructive" /><h2 className="text-2xl font-bold mb-2">Access Denied</h2></Card></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold">Fiscal Year</h1><p className="text-muted-foreground">Manage fiscal year periods</p></div>
        <Dialog open={isDialogOpen} onOpenChange={(o) => { setIsDialogOpen(o); if (!o) resetForm(); }}>
          <DialogTrigger asChild><Button><PlusCircle className="mr-2 h-4 w-4" />Add Fiscal Year</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editingItem ? "Edit" : "Add"} Fiscal Year</DialogTitle><DialogDescription>Define fiscal year period for accounting</DialogDescription></DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Fiscal Year Code *</Label><Input value={formData.fiscal_year_code} onChange={(e) => setFormData({ ...formData, fiscal_year_code: e.target.value })} placeholder="FY2024-25" required /></div>
                  <div className="space-y-2"><Label>Fiscal Year Name *</Label><Input value={formData.fiscal_year_name} onChange={(e) => setFormData({ ...formData, fiscal_year_name: e.target.value })} placeholder="2024-2025" required /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Start Date *</Label><Input type="date" value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} required /></div>
                  <div className="space-y-2"><Label>End Date *</Label><Input type="date" value={formData.end_date} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} required /></div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center space-x-2"><Checkbox id="is_current" checked={formData.is_current} onCheckedChange={(c) => setFormData({ ...formData, is_current: !!c })} /><Label htmlFor="is_current">Current Fiscal Year</Label></div>
                  <div className="flex items-center space-x-2"><Checkbox id="is_closed" checked={formData.is_closed} onCheckedChange={(c) => setFormData({ ...formData, is_closed: !!c })} /><Label htmlFor="is_closed">Closed</Label></div>
                </div>
              </div>
              <DialogFooter><Button type="submit">{editingItem ? "Update" : "Create"}</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader><TableRow><TableHead>Code</TableHead><TableHead>Name</TableHead><TableHead>Start Date</TableHead><TableHead>End Date</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {fiscalYears.length === 0 ? <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">{loading ? "Loading..." : "No fiscal years"}</TableCell></TableRow> : fiscalYears.map((item) => (
              <TableRow key={item.id}><TableCell className="font-medium">{item.fiscal_year_code}</TableCell><TableCell>{item.fiscal_year_name}</TableCell><TableCell>{item.start_date?.split("T")[0]}</TableCell><TableCell>{item.end_date?.split("T")[0]}</TableCell><TableCell><div className="flex gap-1">{item.is_current && <Badge variant="default">Current</Badge>}{item.is_closed && <Badge variant="secondary"><Lock className="h-3 w-3 mr-1" />Closed</Badge>}</div></TableCell><TableCell className="text-right"><Button variant="ghost" size="icon" onClick={() => handleEdit(item)}><Edit className="h-4 w-4" /></Button><Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} disabled={item.is_closed}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell></TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
