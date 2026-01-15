"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PlusCircle, Edit, Trash2, Shield } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { settingsService } from "@/services/api";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";

export default function BranchesPage() {
  const { user, token } = useAuth();
  const [branches, setBranches] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    branch_code: "",
    branch_name: "",
    branch_type: "",
    is_head_office: false,
    address: "",
    city: "",
    country: "",
    phone: "",
    email: "",
    manager_name: "",
    is_active: true,
  });

  useEffect(() => {
    if (token && user?.is_superuser) {
      loadData();
    }
  }, [token, user]);

  const loadData = async () => {
    try {
      if (!token) return;
      setLoading(true);
      const data = await settingsService.branches.getAll(token);
      setBranches(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading branches:", error);
      toast.error("Failed to load branches");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!token) {
        toast.error("Not authenticated");
        return;
      }

      if (editingItem) {
        await settingsService.branches.update(editingItem.id, formData, token);
        toast.success("Branch updated successfully");
      } else {
        await settingsService.branches.create(formData, token);
        toast.success("Branch created successfully");
      }
      setIsDialogOpen(false);
      resetForm();
      loadData();
    } catch (error: any) {
      toast.error(error?.message || "Failed to save branch");
      console.error(error);
    }
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      branch_code: item.branch_code || "",
      branch_name: item.branch_name || "",
      branch_type: item.branch_type || "",
      is_head_office: item.is_head_office || false,
      address: item.address || "",
      city: item.city || "",
      country: item.country || "",
      phone: item.phone || "",
      email: item.email || "",
      manager_name: item.manager_name || "",
      is_active: item.is_active !== false,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this branch?")) {
      try {
        if (!token) {
          toast.error("Not authenticated");
          return;
        }
        await settingsService.branches.delete(id, token);
        toast.success("Branch deleted successfully");
        loadData();
      } catch (error) {
        toast.error("Failed to delete branch");
        console.error(error);
      }
    }
  };

  const resetForm = () => {
    setEditingItem(null);
    setFormData({
      branch_code: "",
      branch_name: "",
      branch_type: "",
      is_head_office: false,
      address: "",
      city: "",
      country: "",
      phone: "",
      email: "",
      manager_name: "",
      is_active: true,
    });
  };

  if (!user?.is_superuser) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="p-8 text-center">
          <Shield className="h-16 w-16 mx-auto mb-4 text-destructive" />
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">You need administrator privileges.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Branches</h1>
          <p className="text-muted-foreground">Manage branch offices and locations</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button><PlusCircle className="mr-2 h-4 w-4" />Add Branch</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingItem ? "Edit Branch" : "Add New Branch"}</DialogTitle>
              <DialogDescription>Branch office information</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Branch Code *</Label>
                    <Input value={formData.branch_code} onChange={(e) => setFormData({ ...formData, branch_code: e.target.value.toUpperCase() })} placeholder="HQ" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Branch Type</Label>
                    <Input value={formData.branch_type} onChange={(e) => setFormData({ ...formData, branch_type: e.target.value })} placeholder="Factory, Office, Warehouse" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Branch Name *</Label>
                  <Input value={formData.branch_name} onChange={(e) => setFormData({ ...formData, branch_name: e.target.value })} placeholder="Head Office" required />
                </div>
                <div className="space-y-2">
                  <Label>Address</Label>
                  <Input value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="123 Industrial Area" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>City</Label>
                    <Input value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} placeholder="Dhaka" />
                  </div>
                  <div className="space-y-2">
                    <Label>Country</Label>
                    <Input value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })} placeholder="Bangladesh" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+880 123 456789" />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="branch@company.com" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Manager Name</Label>
                  <Input value={formData.manager_name} onChange={(e) => setFormData({ ...formData, manager_name: e.target.value })} placeholder="John Doe" />
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="is_head_office" checked={formData.is_head_office} onCheckedChange={(c) => setFormData({ ...formData, is_head_office: !!c })} />
                    <Label htmlFor="is_head_office">Head Office</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="is_active" checked={formData.is_active} onCheckedChange={(c) => setFormData({ ...formData, is_active: !!c })} />
                    <Label htmlFor="is_active">Active</Label>
                  </div>
                </div>
              </div>
              <DialogFooter><Button type="submit">{editingItem ? "Update" : "Create"}</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Manager</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {branches.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">{loading ? "Loading..." : "No branches found"}</TableCell></TableRow>
            ) : (
              branches.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    {item.branch_code}
                    {item.is_head_office && <Badge variant="secondary" className="ml-2">HQ</Badge>}
                  </TableCell>
                  <TableCell>{item.branch_name}</TableCell>
                  <TableCell>{item.branch_type || "-"}</TableCell>
                  <TableCell>{item.city || "-"}</TableCell>
                  <TableCell>{item.manager_name || "-"}</TableCell>
                  <TableCell><Badge variant={item.is_active ? "default" : "secondary"}>{item.is_active ? "Active" : "Inactive"}</Badge></TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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
