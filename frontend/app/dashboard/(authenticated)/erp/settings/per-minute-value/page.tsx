"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Edit, Trash2, Shield, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { settingsService } from "@/services/api";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";

export default function PerMinuteValuePage() {
  const { user, token } = useAuth();
  const [values, setValues] = useState<any[]>([]);
  const [currentValue, setCurrentValue] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    date_of_value_set: "", value: "0", currency_id: "", amendment_no: 0, effective_from: "", effective_to: "", is_current: false,
  });

  useEffect(() => { if (token && user?.is_superuser) loadData(); }, [token, user]);

  const loadData = async () => {
    try {
      if (!token) return; setLoading(true);
      const [allData, current] = await Promise.all([
        settingsService.perMinuteValue.getAll(token),
        settingsService.perMinuteValue.getCurrent(token).catch(() => null),
      ]);
      setValues(Array.isArray(allData) ? allData : []);
      setCurrentValue(current);
    } catch (error) { toast.error("Failed to load data"); } finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!token) return;
      const data = { ...formData, value: parseFloat(formData.value), currency_id: formData.currency_id ? parseInt(formData.currency_id) : null, effective_from: formData.effective_from || null, effective_to: formData.effective_to || null };
      if (editingItem) { await settingsService.perMinuteValue.update(editingItem.id, data, token); toast.success("Updated"); }
      else { await settingsService.perMinuteValue.create(data, token); toast.success("Created"); }
      setIsDialogOpen(false); resetForm(); loadData();
    } catch (error: any) { toast.error(error?.message || "Failed to save"); }
  };

  const handleEdit = (item: any) => { setEditingItem(item); setFormData({ date_of_value_set: item.date_of_value_set?.split("T")[0] || "", value: item.value?.toString() || "0", currency_id: item.currency_id?.toString() || "", amendment_no: item.amendment_no || 0, effective_from: item.effective_from?.split("T")[0] || "", effective_to: item.effective_to?.split("T")[0] || "", is_current: item.is_current || false }); setIsDialogOpen(true); };
  const handleDelete = async (id: number) => { if (confirm("Delete?")) { try { if (!token) return; await settingsService.perMinuteValue.delete(id, token); toast.success("Deleted"); loadData(); } catch (error) { toast.error("Failed"); } } };
  const resetForm = () => { setEditingItem(null); setFormData({ date_of_value_set: new Date().toISOString().split("T")[0], value: "0", currency_id: "", amendment_no: 0, effective_from: "", effective_to: "", is_current: false }); };

  if (!user?.is_superuser) return <div className="flex items-center justify-center min-h-[400px]"><Card className="p-8 text-center"><Shield className="h-16 w-16 mx-auto mb-4 text-destructive" /><h2 className="text-2xl font-bold mb-2">Access Denied</h2></Card></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold">Per Minute Value</h1><p className="text-muted-foreground">Configure per minute value rates for costing</p></div>
        <Dialog open={isDialogOpen} onOpenChange={(o) => { setIsDialogOpen(o); if (!o) resetForm(); }}>
          <DialogTrigger asChild><Button><PlusCircle className="mr-2 h-4 w-4" />Add Value</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editingItem ? "Edit" : "Add"} Per Minute Value</DialogTitle><DialogDescription>Define cost per minute for calculations</DialogDescription></DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Date Set *</Label><Input type="date" value={formData.date_of_value_set} onChange={(e) => setFormData({ ...formData, date_of_value_set: e.target.value })} required /></div>
                  <div className="space-y-2"><Label>Amendment No</Label><Input type="number" min={0} value={formData.amendment_no} onChange={(e) => setFormData({ ...formData, amendment_no: parseInt(e.target.value) || 0 })} /></div>
                </div>
                <div className="space-y-2"><Label>Value (per minute) *</Label><Input type="number" step="0.0001" value={formData.value} onChange={(e) => setFormData({ ...formData, value: e.target.value })} required /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Effective From</Label><Input type="date" value={formData.effective_from} onChange={(e) => setFormData({ ...formData, effective_from: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Effective To</Label><Input type="date" value={formData.effective_to} onChange={(e) => setFormData({ ...formData, effective_to: e.target.value })} /></div>
                </div>
                <div className="flex items-center space-x-2"><Checkbox id="is_current" checked={formData.is_current} onCheckedChange={(c) => setFormData({ ...formData, is_current: !!c })} /><Label htmlFor="is_current">Current Active Value</Label></div>
              </div>
              <DialogFooter><Button type="submit">{editingItem ? "Update" : "Create"}</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {currentValue && (
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-lg"><Clock className="h-5 w-5" />Current Per Minute Value</CardTitle><CardDescription>Active rate used for all calculations</CardDescription></CardHeader>
          <CardContent><div className="text-3xl font-bold">{parseFloat(currentValue.value).toFixed(4)}</div><p className="text-sm text-muted-foreground mt-1">Set on {currentValue.date_of_value_set?.split("T")[0]} (Amendment #{currentValue.amendment_no})</p></CardContent>
        </Card>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader><TableRow><TableHead>Date Set</TableHead><TableHead>Value</TableHead><TableHead>Amendment</TableHead><TableHead>Effective From</TableHead><TableHead>Effective To</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {values.length === 0 ? <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">{loading ? "Loading..." : "No values"}</TableCell></TableRow> : values.map((item) => (
              <TableRow key={item.id}><TableCell>{item.date_of_value_set?.split("T")[0]}</TableCell><TableCell className="font-medium">{parseFloat(item.value).toFixed(4)}</TableCell><TableCell>#{item.amendment_no}</TableCell><TableCell>{item.effective_from?.split("T")[0] || "-"}</TableCell><TableCell>{item.effective_to?.split("T")[0] || "-"}</TableCell><TableCell>{item.is_current && <Badge variant="default">Current</Badge>}</TableCell><TableCell className="text-right"><Button variant="ghost" size="icon" onClick={() => handleEdit(item)}><Edit className="h-4 w-4" /></Button><Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell></TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
