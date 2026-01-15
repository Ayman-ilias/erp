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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, Edit, Trash2, Shield } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { settingsService } from "@/services/api";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";

export default function RolesPage() {
  const { user, token } = useAuth();
  const [roles, setRoles] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [isPermDialogOpen, setIsPermDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<any>(null);

  const [roleFormData, setRoleFormData] = useState({
    role_code: "",
    role_name: "",
    description: "",
    is_system_role: false,
    is_active: true,
  });

  const [permFormData, setPermFormData] = useState({
    permission_code: "",
    permission_name: "",
    module: "",
    action: "",
    description: "",
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
      const [rolesData, permsData] = await Promise.all([
        settingsService.roles.getAll(token),
        settingsService.permissions.getAll(token),
      ]);
      setRoles(Array.isArray(rolesData) ? rolesData : []);
      setPermissions(Array.isArray(permsData) ? permsData : []);
    } catch (error) {
      console.error("Error loading roles data:", error);
      toast.error("Failed to load roles data");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!token) return;
      if (editingRole) {
        await settingsService.roles.update(editingRole.id, roleFormData, token);
        toast.success("Role updated");
      } else {
        await settingsService.roles.create(roleFormData, token);
        toast.success("Role created");
      }
      setIsRoleDialogOpen(false);
      resetRoleForm();
      loadData();
    } catch (error: any) {
      toast.error(error?.message || "Failed to save role");
    }
  };

  const handleEditRole = (item: any) => {
    setEditingRole(item);
    setRoleFormData({
      role_code: item.role_code || "",
      role_name: item.role_name || "",
      description: item.description || "",
      is_system_role: item.is_system_role || false,
      is_active: item.is_active !== false,
    });
    setIsRoleDialogOpen(true);
  };

  const handleDeleteRole = async (id: number) => {
    if (confirm("Delete this role?")) {
      try {
        if (!token) return;
        await settingsService.roles.delete(id, token);
        toast.success("Role deleted");
        loadData();
      } catch (error) {
        toast.error("Failed to delete role");
      }
    }
  };

  const resetRoleForm = () => {
    setEditingRole(null);
    setRoleFormData({ role_code: "", role_name: "", description: "", is_system_role: false, is_active: true });
  };

  const handlePermSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!token) return;
      await settingsService.permissions.create(permFormData, token);
      toast.success("Permission created");
      setIsPermDialogOpen(false);
      resetPermForm();
      loadData();
    } catch (error: any) {
      toast.error(error?.message || "Failed to save permission");
    }
  };

  const resetPermForm = () => {
    setPermFormData({ permission_code: "", permission_name: "", module: "", action: "", description: "" });
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
      <div>
        <h1 className="text-3xl font-bold">Roles & Permissions</h1>
        <p className="text-muted-foreground">Manage user roles and access permissions</p>
      </div>

      <Tabs defaultValue="roles" className="space-y-4">
        <TabsList>
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
        </TabsList>

        <TabsContent value="roles" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={isRoleDialogOpen} onOpenChange={(open) => { setIsRoleDialogOpen(open); if (!open) resetRoleForm(); }}>
              <DialogTrigger asChild>
                <Button><PlusCircle className="mr-2 h-4 w-4" />Add Role</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingRole ? "Edit" : "Add"} Role</DialogTitle>
                  <DialogDescription>Define a user role with specific access levels</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleRoleSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Role Code *</Label>
                        <Input value={roleFormData.role_code} onChange={(e) => setRoleFormData({ ...roleFormData, role_code: e.target.value.toUpperCase() })} placeholder="ADMIN" required />
                      </div>
                      <div className="space-y-2">
                        <Label>Role Name *</Label>
                        <Input value={roleFormData.role_name} onChange={(e) => setRoleFormData({ ...roleFormData, role_name: e.target.value })} placeholder="Administrator" required />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea value={roleFormData.description} onChange={(e) => setRoleFormData({ ...roleFormData, description: e.target.value })} placeholder="Full system access" rows={2} />
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="is_system_role" checked={roleFormData.is_system_role} onCheckedChange={(c) => setRoleFormData({ ...roleFormData, is_system_role: !!c })} />
                        <Label htmlFor="is_system_role">System Role</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="role_active" checked={roleFormData.is_active} onCheckedChange={(c) => setRoleFormData({ ...roleFormData, is_active: !!c })} />
                        <Label htmlFor="role_active">Active</Label>
                      </div>
                    </div>
                  </div>
                  <DialogFooter><Button type="submit">{editingRole ? "Update" : "Create"}</Button></DialogFooter>
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
                  <TableHead>Description</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">{loading ? "Loading..." : "No roles"}</TableCell></TableRow>
                ) : (
                  roles.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.role_code}</TableCell>
                      <TableCell>{item.role_name}</TableCell>
                      <TableCell className="max-w-xs truncate">{item.description || "-"}</TableCell>
                      <TableCell>{item.is_system_role && <Badge variant="secondary">System</Badge>}</TableCell>
                      <TableCell><Badge variant={item.is_active ? "default" : "secondary"}>{item.is_active ? "Active" : "Inactive"}</Badge></TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleEditRole(item)}><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteRole(item.id)} disabled={item.is_system_role}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={isPermDialogOpen} onOpenChange={(open) => { setIsPermDialogOpen(open); if (!open) resetPermForm(); }}>
              <DialogTrigger asChild>
                <Button><PlusCircle className="mr-2 h-4 w-4" />Add Permission</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Permission</DialogTitle>
                  <DialogDescription>Define a specific permission for module access</DialogDescription>
                </DialogHeader>
                <form onSubmit={handlePermSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Permission Code *</Label>
                        <Input value={permFormData.permission_code} onChange={(e) => setPermFormData({ ...permFormData, permission_code: e.target.value.toUpperCase() })} placeholder="USERS_VIEW" required />
                      </div>
                      <div className="space-y-2">
                        <Label>Permission Name *</Label>
                        <Input value={permFormData.permission_name} onChange={(e) => setPermFormData({ ...permFormData, permission_name: e.target.value })} placeholder="View Users" required />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Module *</Label>
                        <Input value={permFormData.module} onChange={(e) => setPermFormData({ ...permFormData, module: e.target.value })} placeholder="users" required />
                      </div>
                      <div className="space-y-2">
                        <Label>Action *</Label>
                        <Input value={permFormData.action} onChange={(e) => setPermFormData({ ...permFormData, action: e.target.value })} placeholder="view, create, edit, delete" required />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Input value={permFormData.description} onChange={(e) => setPermFormData({ ...permFormData, description: e.target.value })} placeholder="Allows viewing user list" />
                    </div>
                  </div>
                  <DialogFooter><Button type="submit">Create</Button></DialogFooter>
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
                  <TableHead>Module</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {permissions.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">{loading ? "Loading..." : "No permissions"}</TableCell></TableRow>
                ) : (
                  permissions.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.permission_code}</TableCell>
                      <TableCell>{item.permission_name}</TableCell>
                      <TableCell><Badge variant="outline">{item.module}</Badge></TableCell>
                      <TableCell>{item.action}</TableCell>
                      <TableCell className="max-w-xs truncate">{item.description || "-"}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
