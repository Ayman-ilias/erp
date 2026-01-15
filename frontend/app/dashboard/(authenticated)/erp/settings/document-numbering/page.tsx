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

export default function DocumentNumberingPage() {
  const { user, token } = useAuth();
  const [documents, setDocuments] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    document_type: "", document_name: "", prefix: "", suffix: "", current_number: 1, number_length: 5, fiscal_year_reset: false, branch_wise: false, sample_format: "", is_active: true,
  });

  useEffect(() => { if (token && user?.is_superuser) loadData(); }, [token, user]);

  const loadData = async () => {
    try { if (!token) return; setLoading(true); const data = await settingsService.documentNumbering.getAll(token); setDocuments(Array.isArray(data) ? data : []); } catch (error) { toast.error("Failed to load data"); } finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!token) return;
      if (editingItem) { await settingsService.documentNumbering.update(editingItem.id, formData, token); toast.success("Updated"); }
      else { await settingsService.documentNumbering.create(formData, token); toast.success("Created"); }
      setIsDialogOpen(false); resetForm(); loadData();
    } catch (error: any) { toast.error(error?.message || "Failed to save"); }
  };

  const handleEdit = (item: any) => { setEditingItem(item); setFormData({ document_type: item.document_type || "", document_name: item.document_name || "", prefix: item.prefix || "", suffix: item.suffix || "", current_number: item.current_number || 1, number_length: item.number_length || 5, fiscal_year_reset: item.fiscal_year_reset || false, branch_wise: item.branch_wise || false, sample_format: item.sample_format || "", is_active: item.is_active !== false }); setIsDialogOpen(true); };
  const handleDelete = async (id: number) => { if (confirm("Delete?")) { try { if (!token) return; await settingsService.documentNumbering.delete(id, token); toast.success("Deleted"); loadData(); } catch (error) { toast.error("Failed"); } } };
  const resetForm = () => { setEditingItem(null); setFormData({ document_type: "", document_name: "", prefix: "", suffix: "", current_number: 1, number_length: 5, fiscal_year_reset: false, branch_wise: false, sample_format: "", is_active: true }); };

  if (!user?.is_superuser) return <div className="flex items-center justify-center min-h-[400px]"><Card className="p-8 text-center"><Shield className="h-16 w-16 mx-auto mb-4 text-destructive" /><h2 className="text-2xl font-bold mb-2">Access Denied</h2></Card></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold">Document Numbering</h1><p className="text-muted-foreground">Configure document number sequences</p></div>
        <Dialog open={isDialogOpen} onOpenChange={(o) => { setIsDialogOpen(o); if (!o) resetForm(); }}>
          <DialogTrigger asChild><Button><PlusCircle className="mr-2 h-4 w-4" />Add Document Type</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editingItem ? "Edit" : "Add"} Document Numbering</DialogTitle><DialogDescription>Define numbering pattern for documents</DialogDescription></DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Document Type *</Label><Input value={formData.document_type} onChange={(e) => setFormData({ ...formData, document_type: e.target.value.toUpperCase() })} placeholder="PO, SO, INV" required /></div>
                  <div className="space-y-2"><Label>Document Name *</Label><Input value={formData.document_name} onChange={(e) => setFormData({ ...formData, document_name: e.target.value })} placeholder="Purchase Order" required /></div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2"><Label>Prefix</Label><Input value={formData.prefix} onChange={(e) => setFormData({ ...formData, prefix: e.target.value })} placeholder="PO-" /></div>
                  <div className="space-y-2"><Label>Suffix</Label><Input value={formData.suffix} onChange={(e) => setFormData({ ...formData, suffix: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Number Length</Label><Input type="number" min={1} max={15} value={formData.number_length} onChange={(e) => setFormData({ ...formData, number_length: parseInt(e.target.value) || 5 })} /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Current Number</Label><Input type="number" min={0} value={formData.current_number} onChange={(e) => setFormData({ ...formData, current_number: parseInt(e.target.value) || 1 })} /></div>
                  <div className="space-y-2"><Label>Sample Format</Label><Input value={formData.sample_format} onChange={(e) => setFormData({ ...formData, sample_format: e.target.value })} placeholder="PO-00001" /></div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center space-x-2"><Checkbox id="fiscal_reset" checked={formData.fiscal_year_reset} onCheckedChange={(c) => setFormData({ ...formData, fiscal_year_reset: !!c })} /><Label htmlFor="fiscal_reset">Reset on Fiscal Year</Label></div>
                  <div className="flex items-center space-x-2"><Checkbox id="branch_wise" checked={formData.branch_wise} onCheckedChange={(c) => setFormData({ ...formData, branch_wise: !!c })} /><Label htmlFor="branch_wise">Branch-wise</Label></div>
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
          <TableHeader><TableRow><TableHead>Type</TableHead><TableHead>Name</TableHead><TableHead>Format</TableHead><TableHead>Current #</TableHead><TableHead>Options</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {documents.length === 0 ? <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">{loading ? "Loading..." : "No document types"}</TableCell></TableRow> : documents.map((item) => (
              <TableRow key={item.id}><TableCell className="font-medium">{item.document_type}</TableCell><TableCell>{item.document_name}</TableCell><TableCell className="font-mono text-sm">{item.prefix}{String(item.current_number).padStart(item.number_length, "0")}{item.suffix}</TableCell><TableCell>{item.current_number}</TableCell><TableCell><div className="flex gap-1">{item.fiscal_year_reset && <Badge variant="outline">FY Reset</Badge>}{item.branch_wise && <Badge variant="outline">Branch</Badge>}</div></TableCell><TableCell><Badge variant={item.is_active ? "default" : "secondary"}>{item.is_active ? "Active" : "Inactive"}</Badge></TableCell><TableCell className="text-right"><Button variant="ghost" size="icon" onClick={() => handleEdit(item)}><Edit className="h-4 w-4" /></Button><Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell></TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
