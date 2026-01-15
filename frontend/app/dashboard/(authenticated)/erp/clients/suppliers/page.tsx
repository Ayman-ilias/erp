"use client";

import * as React from "react";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusIcon, Pencil, Trash2, Search, X } from "lucide-react";
import { ExportButton } from "@/components/export-button";
import type { ExportColumn } from "@/lib/export-utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { countries } from "@/lib/countries";
import { Skeleton } from "@/components/ui/skeleton";
import { PermissionGuard } from "@/components/permission-guard";

// ============================================================================
// PROPER IMPORTS: TanStack Query hooks & Utils
// ============================================================================
import {
  useSuppliers,
  useCreateSupplier,
  useUpdateSupplier,
  useDeleteSupplier,
} from "@/hooks/use-queries";
import { formatDate, unique } from "@/lib/utils";

// ============================================================================
// TYPES: Form data interface
// ============================================================================
interface SupplierFormData {
  supplier_name: string;
  company_name: string;
  supplier_type: string;
  contact_person: string;
  email: string;
  phone: string;
  country: string;
  rating: number;
}

const initialFormData: SupplierFormData = {
  supplier_name: "",
  company_name: "",
  supplier_type: "Fabric",
  contact_person: "",
  email: "",
  phone: "",
  country: "",
  rating: 0,
};

export default function SuppliersPage() {
  // ============================================================================
  // TANSTACK QUERY: Data fetching with caching, auto-refetch, loading states
  // ============================================================================
  const { data: suppliersData, isLoading, isError } = useSuppliers();
  const suppliers = Array.isArray(suppliersData) ? suppliersData : [];

  const createMutation = useCreateSupplier();
  const updateMutation = useUpdateSupplier();
  const deleteMutation = useDeleteSupplier();

  // ============================================================================
  // LOCAL STATE: UI state only (not server data)
  // ============================================================================
  const [rowLimit, setRowLimit] = useState<number | "all">(50);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [filters, setFilters] = useState({
    search: "",
    type: "",
    country: "",
    rating: "",
  });
  const [formData, setFormData] = useState<SupplierFormData>(initialFormData);

  // ============================================================================
  // DERIVED STATE: Using useMemo instead of useEffect + useState
  // ============================================================================
  const filteredSuppliers = useMemo(() => {
    let result = [...suppliers];

    // Search filter
    if (filters.search && filters.search !== "all") {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (s) =>
          s.supplier_name?.toLowerCase().includes(searchLower) ||
          s.company_name?.toLowerCase().includes(searchLower) ||
          s.contact_person?.toLowerCase().includes(searchLower) ||
          s.email?.toLowerCase().includes(searchLower)
      );
    }

    // Type filter
    if (filters.type && filters.type !== "all") {
      result = result.filter((s) => s.supplier_type === filters.type);
    }

    // Country filter
    if (filters.country && filters.country !== "all") {
      result = result.filter((s) => s.country === filters.country);
    }

    // Rating filter
    if (filters.rating && filters.rating !== "all") {
      const ratingValue = parseFloat(filters.rating);
      result = result.filter((s) => (s.rating ?? 0) >= ratingValue);
    }

    return result;
  }, [suppliers, filters]);

  // Displayed suppliers with row limit
  const displayedSuppliers = useMemo(() => {
    if (rowLimit === "all") return filteredSuppliers;
    return filteredSuppliers.slice(0, rowLimit);
  }, [filteredSuppliers, rowLimit]);

  // Unique values for filter dropdowns - using utils.unique()
  const uniqueTypes = useMemo(
    () => unique(suppliers.map((s) => s.supplier_type).filter(Boolean) as string[]).sort(),
    [suppliers]
  );
  const uniqueCountries = useMemo(
    () => unique(suppliers.map((s) => s.country).filter(Boolean) as string[]).sort(),
    [suppliers]
  );

  const clearFilters = () => setFilters({ search: "", type: "", country: "", rating: "" });

  // ============================================================================
  // HANDLERS: Using TanStack Query mutations
  // ============================================================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSupplier) {
        await updateMutation.mutateAsync({ id: editingSupplier.id, data: formData });
        toast.success("Supplier updated successfully");
      } else {
        await createMutation.mutateAsync(formData);
        toast.success("Supplier created successfully");
      }
      handleCloseDialog();
    } catch (error: unknown) {
      const { handleApiError } = await import("@/lib/error-handler");
      toast.error(handleApiError(error, "Unable to save supplier. Please try again."));
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this supplier?")) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Supplier deleted successfully");
    } catch (error: unknown) {
      const { handleApiError } = await import("@/lib/error-handler");
      toast.error(handleApiError(error, "Unable to delete supplier. Please try again."));
    }
  };

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      supplier_name: supplier.supplier_name || "",
      company_name: supplier.company_name || "",
      supplier_type: supplier.supplier_type || "Fabric",
      contact_person: supplier.contact_person || "",
      email: supplier.email || "",
      phone: supplier.phone || "",
      country: supplier.country || "",
      rating: supplier.rating || 0,
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingSupplier(null);
    setFormData(initialFormData);
  };

  // Export columns configuration - using utils.formatDate
  const exportColumns: ExportColumn[] = [
    { key: "supplier_name", header: "Supplier Name" },
    { key: "company_name", header: "Company Name" },
    { key: "supplier_type", header: "Type" },
    { key: "contact_person", header: "Contact Person" },
    { key: "email", header: "Email" },
    { key: "phone", header: "Phone" },
    { key: "country", header: "Country" },
    { key: "rating", header: "Rating", transform: (value) => value?.toFixed(1) || "N/A" },
    { key: "created_at", header: "Created At", transform: (value) => value ? formatDate(value) : "-" },
    { key: "updated_at", header: "Updated At", transform: (value) => value ? formatDate(value) : "-" },
  ];

  // ============================================================================
  // LOADING & ERROR STATES
  // ============================================================================
  if (isLoading) {
    return (
      <PermissionGuard requiredDepartment="client_info">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-9 w-48" />
              <Skeleton className="h-5 w-72 mt-2" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
          <Card className="p-4">
            <div className="flex gap-4">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-40" />
              <Skeleton className="h-10 w-40" />
            </div>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    {[...Array(11)].map((_, i) => (
                      <TableHead key={i}><Skeleton className="h-4 w-20" /></TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      {[...Array(11)].map((_, j) => (
                        <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </PermissionGuard>
    );
  }

  if (isError) {
    return (
      <PermissionGuard requiredDepartment="client_info">
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <p className="text-destructive">Failed to load suppliers</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </PermissionGuard>
    );
  }

  return (
    <PermissionGuard requiredDepartment="client_info">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Supplier Info</h1>
            <p className="text-muted-foreground mt-2">
              Manage your fabric, trim, and accessory suppliers
            </p>
          </div>
          <div className="flex gap-2">
            <ExportButton
              data={filteredSuppliers}
              columns={exportColumns}
              filename="suppliers"
              sheetName="Suppliers"
            />
            <Button onClick={() => setIsDialogOpen(true)}>
              <PlusIcon className="mr-2 h-4 w-4" />
              Add Supplier
            </Button>
          </div>
        </div>

        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search suppliers..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={filters.type} onValueChange={(value) => setFilters({ ...filters, type: value })}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {uniqueTypes.map((t, index) => (
                  <SelectItem key={`type-${t}-${index}`} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filters.country} onValueChange={(value) => setFilters({ ...filters, country: value })}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Countries</SelectItem>
                {countries.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filters.rating} onValueChange={(value) => setFilters({ ...filters, rating: value })}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                <SelectItem value="4">4+ Stars</SelectItem>
                <SelectItem value="3">3+ Stars</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={rowLimit.toString()}
              onValueChange={(value) => setRowLimit(value === "all" ? "all" : parseInt(value))}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Rows" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">Show 10</SelectItem>
                <SelectItem value="20">Show 20</SelectItem>
                <SelectItem value="50">Show 50</SelectItem>
                <SelectItem value="all">Show All</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={clearFilters} title="Clear filters">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="mt-2 text-sm text-muted-foreground">
            Showing {displayedSuppliers.length} of {filteredSuppliers.length} filtered ({suppliers.length} total) suppliers
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>All Suppliers</CardTitle>
            <CardDescription>
              A list of all suppliers including fabric, trims, and accessories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Supplier Name</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Updated At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedSuppliers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="h-24 text-center">
                      {suppliers.length === 0 ? "No suppliers found." : "No suppliers match your filters."}
                    </TableCell>
                  </TableRow>
                ) : (
                  displayedSuppliers.map((supplier) => (
                    <TableRow
                      key={supplier.id}
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => {
                        setSelectedSupplier(supplier);
                        setIsDetailDialogOpen(true);
                      }}
                    >
                      <TableCell className="font-medium">{supplier.supplier_name}</TableCell>
                      <TableCell>{supplier.company_name}</TableCell>
                      <TableCell>{supplier.supplier_type}</TableCell>
                      <TableCell>{supplier.contact_person}</TableCell>
                      <TableCell>{supplier.email}</TableCell>
                      <TableCell>{supplier.phone}</TableCell>
                      <TableCell>{supplier.country}</TableCell>
                      <TableCell>{supplier.rating?.toFixed(1) || "N/A"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {supplier.created_at ? formatDate(supplier.created_at) : "-"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {supplier.updated_at ? formatDate(supplier.updated_at) : "-"}
                      </TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(supplier)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(supplier.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Create/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingSupplier ? "Edit Supplier" : "Add New Supplier"}
              </DialogTitle>
              <DialogDescription>
                Fill in the supplier details below
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="supplier_name">Supplier Name *</Label>
                  <Input
                    id="supplier_name"
                    value={formData.supplier_name}
                    onChange={(e) => setFormData({ ...formData, supplier_name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company_name">Company Name *</Label>
                  <Input
                    id="company_name"
                    value={formData.company_name}
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supplier_type">Supplier Type *</Label>
                  <Select
                    value={formData.supplier_type}
                    onValueChange={(value) => setFormData({ ...formData, supplier_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Fabric">Fabric</SelectItem>
                      <SelectItem value="Trims">Trims</SelectItem>
                      <SelectItem value="Accessories">Accessories</SelectItem>
                      <SelectItem value="Packaging">Packaging</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact_person">Contact Person *</Label>
                  <Input
                    id="contact_person"
                    value={formData.contact_person}
                    onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country *</Label>
                  <Select
                    value={formData.country}
                    onValueChange={(value) => setFormData({ ...formData, country: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country} value={country}>
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rating">Rating (0-5)</Label>
                  <Input
                    id="rating"
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={formData.rating || ""}
                    onChange={(e) => setFormData({ ...formData, rating: e.target.value ? parseFloat(e.target.value) : 0 })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? "Saving..."
                    : editingSupplier
                    ? "Update"
                    : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Detail View Dialog */}
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Supplier Details</DialogTitle>
              <DialogDescription>
                Complete information for {selectedSupplier?.supplier_name}
              </DialogDescription>
            </DialogHeader>
            {selectedSupplier && (
              <div className="grid gap-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-muted-foreground">Supplier Name</Label>
                    <p className="text-base font-medium">{selectedSupplier.supplier_name}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-muted-foreground">Company Name</Label>
                    <p className="text-base">{selectedSupplier.company_name}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-muted-foreground">Supplier Type</Label>
                    <p className="text-base">{selectedSupplier.supplier_type}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-muted-foreground">Contact Person</Label>
                    <p className="text-base">{selectedSupplier.contact_person}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-muted-foreground">Email</Label>
                    <p className="text-base">
                      {selectedSupplier.email ? (
                        <a href={`mailto:${selectedSupplier.email}`} className="text-blue-600 hover:underline">
                          {selectedSupplier.email}
                        </a>
                      ) : "-"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-muted-foreground">Phone</Label>
                    <p className="text-base">
                      {selectedSupplier.phone ? (
                        <a href={`tel:${selectedSupplier.phone}`} className="text-blue-600 hover:underline">
                          {selectedSupplier.phone}
                        </a>
                      ) : "-"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-muted-foreground">Country</Label>
                    <p className="text-base">{selectedSupplier.country}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-muted-foreground">Rating</Label>
                    <p className="text-base">{selectedSupplier.rating ? `${selectedSupplier.rating.toFixed(1)}/5.0` : "N/A"}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-muted-foreground">Created At</Label>
                    <p className="text-base">{selectedSupplier.created_at ? formatDate(selectedSupplier.created_at) : "-"}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-muted-foreground">Updated At</Label>
                    <p className="text-base">{selectedSupplier.updated_at ? formatDate(selectedSupplier.updated_at) : "-"}</p>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsDetailDialogOpen(false);
                  if (selectedSupplier) {
                    handleEdit(selectedSupplier);
                  }
                }}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <Button onClick={() => setIsDetailDialogOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PermissionGuard>
  );
}
