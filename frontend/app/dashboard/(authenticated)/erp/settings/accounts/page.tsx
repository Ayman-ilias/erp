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

const ACCOUNT_TYPES = ["Asset", "Liability", "Equity", "Revenue", "Expense"];
const ACCOUNT_CATEGORIES = ["Current Asset", "Fixed Asset", "Current Liability", "Long-term Liability", "Capital", "Income", "Cost of Sales", "Operating Expense"];

export default function ChartOfAccountsPage() {
  const { user, token } = useAuth();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    account_code: "", account_name: "", account_type: "", account_category: "", parent_account_id: "", level: 1, is_header: false, is_active: true, is_system_account: false, opening_balance: "0", current_balance: "0", currency_id: "", remarks: "",
  });

  useEffect(() => { if (token && user?.is_superuser) loadData(); }, [token, user]);

  const loadData = async () => {
    try { if (!token) return; setLoading(true); const data = await settingsService.chartOfAccounts.getAll(token); setAccounts(Array.isArray(data) ? data : []); } catch (error) { toast.error("Failed to load accounts"); } finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!token) return;
      const data = { ...formData, parent_account_id: formData.parent_account_id ? parseInt(formData.parent_account_id) : null, currency_id: formData.currency_id ? parseInt(formData.currency_id) : null, opening_balance: parseFloat(formData.opening_balance) || 0, current_balance: parseFloat(formData.current_balance) || 0 };
      if (editingItem) { await settingsService.chartOfAccounts.update(editingItem.id, data, token); toast.success("Account updated"); }
      else { await settingsService.chartOfAccounts.create(data, token); toast.success("Account created"); }
      setIsDialogOpen(false); resetForm(); loadData();
    } catch (error: any) { toast.error(error?.message || "Failed to save"); }
  };

  const handleEdit = (item: any) => { setEditingItem(item); setFormData({ account_code: item.account_code || "", account_name: item.account_name || "", account_type: item.account_type || "", account_category: item.account_category || "", parent_account_id: item.parent_account_id?.toString() || "", level: item.level || 1, is_header: item.is_header || false, is_active: item.is_active !== false, is_system_account: item.is_system_account || false, opening_balance: item.opening_balance?.toString() || "0", current_balance: item.current_balance?.toString() || "0", currency_id: item.currency_id?.toString() || "", remarks: item.remarks || "" }); setIsDialogOpen(true); };
  const handleDelete = async (id: number) => { if (confirm("Delete this account?")) { try { if (!token) return; await settingsService.chartOfAccounts.delete(id, token); toast.success("Deleted"); loadData(); } catch (error) { toast.error("Failed to delete"); } } };
  const resetForm = () => { setEditingItem(null); setFormData({ account_code: "", account_name: "", account_type: "", account_category: "", parent_account_id: "", level: 1, is_header: false, is_active: true, is_system_account: false, opening_balance: "0", current_balance: "0", currency_id: "", remarks: "" }); };
  const getParentName = (id: number) => accounts.find((a) => a.id === id)?.account_name || "-";

  if (!user?.is_superuser) return <div className="flex items-center justify-center min-h-[400px]"><Card className="p-8 text-center"><Shield className="h-16 w-16 mx-auto mb-4 text-destructive" /><h2 className="text-2xl font-bold mb-2">Access Denied</h2></Card></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold">Chart of Accounts</h1><p className="text-muted-foreground">Manage financial accounts structure</p></div>
        <Dialog open={isDialogOpen} onOpenChange={(o) => { setIsDialogOpen(o); if (!o) resetForm(); }}>
          <DialogTrigger asChild><Button><PlusCircle className="mr-2 h-4 w-4" />Add Account</Button></DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>{editingItem ? "Edit" : "Add"} Account</DialogTitle><DialogDescription>Financial account configuration</DialogDescription></DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Account Code *</Label><Input value={formData.account_code} onChange={(e) => setFormData({ ...formData, account_code: e.target.value })} placeholder="1000" required /></div>
                  <div className="space-y-2"><Label>Level</Label><Input type="number" min={1} max={10} value={formData.level} onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) || 1 })} /></div>
                </div>
                <div className="space-y-2"><Label>Account Name *</Label><Input value={formData.account_name} onChange={(e) => setFormData({ ...formData, account_name: e.target.value })} placeholder="Cash and Bank" required /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Account Type *</Label><Select value={formData.account_type} onValueChange={(v) => setFormData({ ...formData, account_type: v })}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{ACCOUNT_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
                  <div className="space-y-2"><Label>Category</Label><Select value={formData.account_category} onValueChange={(v) => setFormData({ ...formData, account_category: v })}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{ACCOUNT_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
                </div>
                <div className="space-y-2"><Label>Parent Account</Label><Select value={formData.parent_account_id} onValueChange={(v) => setFormData({ ...formData, parent_account_id: v })}><SelectTrigger><SelectValue placeholder="Select parent" /></SelectTrigger><SelectContent>{accounts.filter((a) => a.id !== editingItem?.id && a.is_header).map((a) => <SelectItem key={a.id} value={a.id.toString()}>{a.account_code} - {a.account_name}</SelectItem>)}</SelectContent></Select></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Opening Balance</Label><Input type="number" step="0.01" value={formData.opening_balance} onChange={(e) => setFormData({ ...formData, opening_balance: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Current Balance</Label><Input type="number" step="0.01" value={formData.current_balance} onChange={(e) => setFormData({ ...formData, current_balance: e.target.value })} /></div>
                </div>
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center space-x-2"><Checkbox id="is_header" checked={formData.is_header} onCheckedChange={(c) => setFormData({ ...formData, is_header: !!c })} /><Label htmlFor="is_header">Header Account</Label></div>
                  <div className="flex items-center space-x-2"><Checkbox id="is_system" checked={formData.is_system_account} onCheckedChange={(c) => setFormData({ ...formData, is_system_account: !!c })} /><Label htmlFor="is_system">System Account</Label></div>
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
          <TableHeader><TableRow><TableHead>Code</TableHead><TableHead>Name</TableHead><TableHead>Type</TableHead><TableHead>Category</TableHead><TableHead>Parent</TableHead><TableHead>Balance</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {accounts.length === 0 ? <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground">{loading ? "Loading..." : "No accounts"}</TableCell></TableRow> : accounts.map((item) => (
              <TableRow key={item.id}><TableCell className="font-medium" style={{ paddingLeft: `${(item.level - 1) * 20 + 16}px` }}>{item.account_code}{item.is_header && <Badge variant="outline" className="ml-2">H</Badge>}</TableCell><TableCell>{item.account_name}</TableCell><TableCell>{item.account_type}</TableCell><TableCell>{item.account_category || "-"}</TableCell><TableCell>{getParentName(item.parent_account_id)}</TableCell><TableCell className="text-right">{parseFloat(item.current_balance || 0).toLocaleString()}</TableCell><TableCell><Badge variant={item.is_active ? "default" : "secondary"}>{item.is_active ? "Active" : "Inactive"}</Badge></TableCell><TableCell className="text-right"><Button variant="ghost" size="icon" onClick={() => handleEdit(item)}><Edit className="h-4 w-4" /></Button><Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} disabled={item.is_system_account}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell></TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
