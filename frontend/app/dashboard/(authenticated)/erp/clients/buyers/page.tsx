"use client";

import * as React from "react";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { PermissionGuard } from "@/components/permission-guard";
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
import { PlusCircle, Edit, Trash2, Search, X, Loader2 } from "lucide-react";
import { ExportButton } from "@/components/export-button";
import type { ExportColumn } from "@/lib/export-utils";
import { BuyerTypeSelector } from "@/components/clients/buyer-type-selector";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { countries } from "@/lib/countries";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

// ============================================================================
// PROPER IMPORTS: TanStack Query hooks & Utils
// ============================================================================
import {
  useBuyers,
  useCreateBuyer,
  useUpdateBuyer,
  useDeleteBuyer,
} from "@/hooks/use-queries";
import { formatDate, unique } from "@/lib/utils";

// ============================================================================
// TYPES: Using global Buyer type from types.d.ts
// BuyerFormData for form state (subset of Buyer fields)
// ============================================================================
interface BuyerFormData {
  buyer_name: string;
  brand_name: string;
  company_name: string;
  head_office_country: string;
  email: string;
  phone: string;
  website: string;
  rating: number;
  status: string;
  buyer_type_id: string;
}

const initialFormData: BuyerFormData = {
  buyer_name: "",
  brand_name: "",
  company_name: "",
  head_office_country: "",
  email: "",
  phone: "",
  website: "",
  rating: 0,
  status: "active",
  buyer_type_id: "",
};

export default function BuyersPage() {
  // ============================================================================
  // TANSTACK QUERY: Data fetching with caching, auto-refetch, loading states
  // Benefits: No useEffect needed, automatic cache invalidation, loading/error states
  // ============================================================================
  const { data: buyersData, isLoading, isError } = useBuyers();
  const buyers = Array.isArray(buyersData) ? buyersData : [];

  const createMutation = useCreateBuyer();
  const updateMutation = useUpdateBuyer();
  const deleteMutation = useDeleteBuyer();

  // ============================================================================
  // LOCAL STATE: UI state only (not server data)
  // ============================================================================
  const [rowLimit, setRowLimit] = useState<number | "all">(50);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedBuyer, setSelectedBuyer] = useState<Buyer | null>(null);
  const [editingBuyer, setEditingBuyer] = useState<Buyer | null>(null);
  const [filters, setFilters] = useState({
    search: "",
    country: "",
    rating: "",
    buyerName: "",
    status: "",
  });
  const [formData, setFormData] = useState<BuyerFormData>(initialFormData);

  // ============================================================================
  // DERIVED STATE: Using useMemo instead of useEffect + useState
  // Benefits: No extra re-renders, computed on-demand, cleaner code
  // ============================================================================
  const filteredBuyers = useMemo(() => {
    let result = [...buyers];

    // Search filter (buyer name, brand, company, email)
    if (filters.search && filters.search !== "all") {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (buyer) =>
          buyer.buyer_name?.toLowerCase().includes(searchLower) ||
          buyer.brand_name?.toLowerCase().includes(searchLower) ||
          buyer.company_name?.toLowerCase().includes(searchLower) ||
          buyer.email?.toLowerCase().includes(searchLower)
      );
    }

    // Buyer Name filter
    if (filters.buyerName && filters.buyerName !== "all") {
      result = result.filter((buyer) => buyer.buyer_name === filters.buyerName);
    }

    // Status filter
    if (filters.status && filters.status !== "all") {
      result = result.filter((buyer) => buyer.status === filters.status);
    }

    // Country filter
    if (filters.country && filters.country !== "all") {
      result = result.filter((buyer) => buyer.head_office_country === filters.country);
    }

    // Rating filter
    if (filters.rating && filters.rating !== "all") {
      const ratingValue = parseFloat(filters.rating);
      result = result.filter((buyer) => (buyer.rating ?? 0) >= ratingValue);
    }

    return result;
  }, [buyers, filters]);

  // Displayed buyers with row limit - using useMemo
  const displayedBuyers = useMemo(() => {
    if (rowLimit === "all") return filteredBuyers;
    return filteredBuyers.slice(0, rowLimit);
  }, [filteredBuyers, rowLimit]);

  // Unique values for filter dropdowns - using utils.unique()
  const uniqueCountries = useMemo(
    () => unique(buyers.map((b) => b.head_office_country).filter(Boolean) as string[]).sort(),
    [buyers]
  );
  const uniqueBuyerNames = useMemo(
    () => unique(buyers.map((b) => b.buyer_name).filter(Boolean) as string[]).sort(),
    [buyers]
  );

  const clearFilters = () => {
    setFilters({
      search: "",
      country: "",
      rating: "",
      buyerName: "",
      status: "",
    });
  };

  // ============================================================================
  // HANDLERS: Using TanStack Query mutations
  // Benefits: Automatic cache invalidation, optimistic updates, error handling
  // ============================================================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Prepare data with proper type conversion
      const submitData = {
        ...formData,
        buyer_type_id: formData.buyer_type_id ? parseInt(formData.buyer_type_id) : undefined,
      };

      if (editingBuyer) {
        await updateMutation.mutateAsync({ id: editingBuyer.id, data: submitData });
        toast.success("Buyer updated successfully");
      } else {
        await createMutation.mutateAsync(submitData);
        toast.success("Buyer created successfully");
      }
      setIsDialogOpen(false);
      resetForm();
      // No need to call loadBuyers() - TanStack Query auto-invalidates!
    } catch (error: unknown) {
      const { handleApiError } = await import("@/lib/error-handler");
      toast.error(handleApiError(error, "Unable to save buyer information. Please try again."));
    }
  };

  const handleEdit = (buyer: Buyer) => {
    setEditingBuyer(buyer);
    setFormData({
      buyer_name: buyer.buyer_name || "",
      brand_name: buyer.brand_name || "",
      company_name: buyer.company_name || "",
      head_office_country: buyer.head_office_country || "",
      email: buyer.email || "",
      phone: buyer.phone || "",
      website: buyer.website || "",
      rating: buyer.rating || 0,
      status: buyer.status || "active",
      buyer_type_id: buyer.buyer_type_id ? buyer.buyer_type_id.toString() : "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this buyer?")) {
      try {
        await deleteMutation.mutateAsync(id);
        toast.success("Buyer deleted successfully");
        // No need to call loadBuyers() - TanStack Query auto-invalidates!
      } catch (error: any) {
        const { handleApiError } = await import("@/lib/error-handler");
        toast.error(handleApiError(error, "Unable to delete buyer. Please try again."));
      }
    }
  };

  const resetForm = () => {
    setEditingBuyer(null);
    setFormData(initialFormData);
  };

  // Export columns configuration - using utils.formatDate
  const exportColumns: ExportColumn[] = [
    { key: "buyer_name", header: "Buyer Name" },
    { key: "brand_name", header: "Brand Name" },
    { key: "company_name", header: "Company Name" },
    { key: "buyer_type", header: "Buyer Type", transform: (value, row) => row.buyer_type?.name || "-" },
    { key: "head_office_country", header: "Head Office Country" },
    { key: "email", header: "Email" },
    { key: "phone", header: "Phone" },
    { key: "website", header: "Website" },
    { key: "rating", header: "Rating" },
    { key: "status", header: "Status", transform: (value) => value === "active" ? "Active" : value === "inactive" ? "Inactive" : "On Hold" },
    { key: "created_at", header: "Created At", transform: (value) => value ? formatDate(value) : "-" },
    { key: "updated_at", header: "Updated At", transform: (value) => value ? formatDate(value) : "-" },
  ];

  // ============================================================================
  // LOADING & ERROR STATES: Proper handling with TanStack Query
  // ============================================================================
  if (isLoading) {
    return (
      <PermissionGuard requiredDepartment="client_info">
        <div className="space-y-6">
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
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  {[...Array(8)].map((_, i) => (
                    <TableHead key={i}><Skeleton className="h-4 w-20" /></TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    {[...Array(8)].map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </PermissionGuard>
    );
  }

  if (isError) {
    return (
      <PermissionGuard requiredDepartment="client_info">
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <p className="text-destructive">Failed to load buyers</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </PermissionGuard>
    );
  }

  return (
    <PermissionGuard requiredDepartment="client_info">
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Buyer Info</h1>
          <p className="text-muted-foreground">Manage your buyers and their information</p>
        </div>
        <div className="flex gap-2">
          <ExportButton
            data={filteredBuyers}
            columns={exportColumns}
            filename="buyers"
            sheetName="Buyers"
          />
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Buyer
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingBuyer ? "Edit Buyer" : "Add New Buyer"}</DialogTitle>
              <DialogDescription>
                {editingBuyer ? "Update buyer information" : "Enter buyer details to add to the system"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="buyer_name">Buyer Name *</Label>
                    <Input
                      id="buyer_name"
                      required
                      value={formData.buyer_name}
                      onChange={(e) => setFormData({ ...formData, buyer_name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="brand_name">Brand Name</Label>
                    <Input
                      id="brand_name"
                      value={formData.brand_name}
                      onChange={(e) => setFormData({ ...formData, brand_name: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company_name">Company Name *</Label>
                  <Input
                    id="company_name"
                    required
                    value={formData.company_name}
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="buyer_type">Buyer Type</Label>
                  <BuyerTypeSelector
                    value={formData.buyer_type_id}
                    onChange={(value) => setFormData({ ...formData, buyer_type_id: value })}
                    placeholder="Select buyer type"
                    allowCreate={true}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="head_office_country">Country</Label>
                    <Select
                      value={formData.head_office_country}
                      onValueChange={(value) => setFormData({ ...formData, head_office_country: value })}
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
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="rating">Rating (0-5, e.g., 3.1, 4.2)</Label>
                    <Input
                      id="rating"
                      type="number"
                      min="0"
                      max="5"
                      step="0.1"
                      value={formData.rating || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === "") {
                          setFormData({ ...formData, rating: 0 });
                        } else {
                          let rating = parseFloat(value);
                          // Ensure between 0-5
                          rating = Math.max(0, Math.min(5, rating));
                          // Round to 1 decimal place
                          rating = Math.round(rating * 10) / 10;
                          setFormData({ ...formData, rating });
                        }
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => setFormData({ ...formData, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="on_hold">On Hold</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">{editingBuyer ? "Update" : "Create"} Buyer</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search buyers, brands, companies, emails..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-9"
              />
            </div>
          </div>
          <Select
            value={filters.buyerName}
            onValueChange={(value) => setFilters({ ...filters, buyerName: value })}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Buyer Name" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Buyers</SelectItem>
              {uniqueBuyerNames.map((name: string) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filters.status}
            onValueChange={(value) => setFilters({ ...filters, status: value })}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="on_hold">On Hold</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filters.country}
            onValueChange={(value) => setFilters({ ...filters, country: value })}
          >
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Head Office Country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Countries</SelectItem>
              {countries.map((country) => (
                <SelectItem key={country} value={country}>
                  {country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filters.rating}
            onValueChange={(value) => setFilters({ ...filters, rating: value })}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Filter by Rating" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Ratings</SelectItem>
              <SelectItem value="4">4+ Stars</SelectItem>
              <SelectItem value="3">3+ Stars</SelectItem>
              <SelectItem value="2">2+ Stars</SelectItem>
              <SelectItem value="1">1+ Stars</SelectItem>
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
          Showing {displayedBuyers.length} of {filteredBuyers.length} filtered ({buyers.length} total) buyers
        </div>
      </Card>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Buyer Name</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Buyer Type</TableHead>
              <TableHead>Head Office Country</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Updated At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayedBuyers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={12} className="h-24 text-center">
                  {buyers.length === 0
                    ? "No buyers found. Add your first buyer to get started."
                    : "No buyers match your filters. Try adjusting your search criteria."}
                </TableCell>
              </TableRow>
            ) : (
              displayedBuyers.map((buyer) => (
                <TableRow
                  key={buyer.id}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => {
                    setSelectedBuyer(buyer);
                    setIsDetailDialogOpen(true);
                  }}
                >
                  <TableCell className="font-medium">{buyer.buyer_name}</TableCell>
                  <TableCell>{buyer.brand_name || "-"}</TableCell>
                  <TableCell>{buyer.company_name}</TableCell>
                  <TableCell>{buyer.buyer_type?.name || "-"}</TableCell>
                  <TableCell>{buyer.head_office_country || "-"}</TableCell>
                  <TableCell>{buyer.email || "-"}</TableCell>
                  <TableCell>{buyer.phone || "-"}</TableCell>
                  <TableCell>{buyer.rating || "-"}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        buyer.status === "active"
                          ? "bg-green-500 hover:bg-green-600"
                          : buyer.status === "inactive"
                          ? "bg-red-500 hover:bg-red-600"
                          : "bg-gray-400 hover:bg-gray-500"
                      }
                    >
                      {buyer.status === "active" ? "Active" : buyer.status === "inactive" ? "Inactive" : "On Hold"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{buyer.created_at ? formatDate(buyer.created_at) : "-"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{buyer.updated_at ? formatDate(buyer.updated_at) : "-"}</TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(buyer)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(buyer.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Detail View Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Buyer Details</DialogTitle>
            <DialogDescription>
              Complete information for {selectedBuyer?.buyer_name}
            </DialogDescription>
          </DialogHeader>
          {selectedBuyer && (
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-muted-foreground">Buyer Name</Label>
                  <p className="text-base font-medium">{selectedBuyer.buyer_name}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-muted-foreground">Brand Name</Label>
                  <p className="text-base">{selectedBuyer.brand_name || "-"}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-muted-foreground">Company Name</Label>
                  <p className="text-base">{selectedBuyer.company_name}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-muted-foreground">Buyer Type</Label>
                  <p className="text-base">{selectedBuyer.buyer_type?.name || "-"}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-muted-foreground">Head Office Country</Label>
                  <p className="text-base">{selectedBuyer.head_office_country || "-"}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-muted-foreground">Email</Label>
                  <p className="text-base">{selectedBuyer.email ? (
                    <a href={`mailto:${selectedBuyer.email}`} className="text-blue-600 hover:underline">
                      {selectedBuyer.email}
                    </a>
                  ) : "-"}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-muted-foreground">Phone</Label>
                  <p className="text-base">{selectedBuyer.phone ? (
                    <a href={`tel:${selectedBuyer.phone}`} className="text-blue-600 hover:underline">
                      {selectedBuyer.phone}
                    </a>
                  ) : "-"}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-muted-foreground">Website</Label>
                  <p className="text-base">{selectedBuyer.website ? (
                    <a href={selectedBuyer.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {selectedBuyer.website}
                    </a>
                  ) : "-"}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-muted-foreground">Rating</Label>
                  <p className="text-base">{selectedBuyer.rating ? `${selectedBuyer.rating}/5.0` : "-"}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-muted-foreground">Status</Label>
                  <div>
                    <Badge
                      className={
                        selectedBuyer.status === "active"
                          ? "bg-green-500 hover:bg-green-600"
                          : selectedBuyer.status === "inactive"
                          ? "bg-red-500 hover:bg-red-600"
                          : "bg-gray-400 hover:bg-gray-500"
                      }
                    >
                      {selectedBuyer.status === "active" ? "Active" : selectedBuyer.status === "inactive" ? "Inactive" : "On Hold"}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-muted-foreground">Created At</Label>
                  <p className="text-base">{selectedBuyer.created_at ? formatDate(selectedBuyer.created_at) : "-"}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-muted-foreground">Updated At</Label>
                  <p className="text-base">{selectedBuyer.updated_at ? formatDate(selectedBuyer.updated_at) : "-"}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDetailDialogOpen(false);
                if (selectedBuyer) {
                  handleEdit(selectedBuyer);
                }
              }}
            >
              <Edit className="mr-2 h-4 w-4" />
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
