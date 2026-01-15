"use client";

import * as React from "react";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { PlusCircle, Edit, Trash2, Search, X, AlertCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { countries } from "@/lib/countries";
import { ExportButton } from "@/components/export-button";
import type { ExportColumn } from "@/lib/export-utils";
import { PermissionGuard } from "@/components/permission-guard";
import { unique } from "@/lib/utils";
import { errorHandlingService } from "@/services/error-handling";
import {
  useShippingAddresses,
  useCreateShippingAddress,
  useUpdateShippingAddress,
  useDeleteShippingAddress,
  useBuyers,
} from "@/hooks/use-queries";

export default function ShippingPage() {
  // TanStack Query hooks
  const { data: shippingData, isLoading: isLoadingShipping, isError: isShippingError, refetch: refetchShipping } = useShippingAddresses();
  const { data: buyersData, isLoading: isLoadingBuyers } = useBuyers();

  const shipping: ShippingAddress[] = Array.isArray(shippingData) ? shippingData : [];
  const buyers: Buyer[] = Array.isArray(buyersData) ? buyersData : [];

  const createMutation = useCreateShippingAddress();
  const updateMutation = useUpdateShippingAddress();
  const deleteMutation = useDeleteShippingAddress();

  // UI State
  const [rowLimit, setRowLimit] = useState<number | "all">(50);
  const [filters, setFilters] = useState({ search: "", buyer: "", country: "" });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedShipping, setSelectedShipping] = useState<ShippingAddress | null>(null);
  const [editingShipping, setEditingShipping] = useState<ShippingAddress | null>(null);
  const [formData, setFormData] = useState({
    buyer_id: "",
    buyer_name: "",
    brand_name: "",
    company_name: "",
    destination_country: "",
    destination_country_code: "",
    destination_port: "",
    place_of_delivery: "",
    destination_code: "",
    warehouse_no: "",
    address: "",
  });

  // Derived state using useMemo
  const filteredShipping = useMemo(() => {
    let result = [...shipping];
    if (filters.search && filters.search !== "all") {
      const searchLower = filters.search.toLowerCase();
      result = result.filter((s) =>
        s.buyer_name?.toLowerCase().includes(searchLower) ||
        s.company_name?.toLowerCase().includes(searchLower) ||
        s.destination_country?.toLowerCase().includes(searchLower) ||
        s.destination_port?.toLowerCase().includes(searchLower)
      );
    }
    if (filters.buyer && filters.buyer !== "all") {
      result = result.filter((s) => s.buyer_id?.toString() === filters.buyer);
    }
    if (filters.country && filters.country !== "all") {
      result = result.filter((s) => s.destination_country === filters.country);
    }
    return result;
  }, [shipping, filters]);

  const displayedShipping = useMemo(() => {
    if (rowLimit === "all") {
      return filteredShipping;
    }
    return filteredShipping.slice(0, rowLimit);
  }, [filteredShipping, rowLimit]);

  const uniqueCountries = useMemo(() => {
    return unique(shipping.map((s) => s.destination_country).filter(Boolean)).sort();
  }, [shipping]);

  const clearFilters = () => setFilters({ search: "", buyer: "", country: "" });

  const handleBuyerChange = (buyerId: string) => {
    const buyer = buyers.find((b) => b.id.toString() === buyerId);
    if (buyer) {
      setFormData({
        ...formData,
        buyer_id: buyerId,
        buyer_name: buyer.buyer_name || "",
        brand_name: buyer.brand_name || "",
        company_name: buyer.company_name || "",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingShipping) {
        await updateMutation.mutateAsync({ id: editingShipping.id, data: formData });
        toast.success("Shipping info updated successfully");
      } else {
        await createMutation.mutateAsync(formData);
        toast.success("Shipping info created successfully");
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error("Failed to save shipping info");
      console.error(error);
    }
  };

  const handleEdit = (ship: ShippingAddress) => {
    setEditingShipping(ship);
    setFormData({
      buyer_id: ship.buyer_id?.toString() || "",
      buyer_name: ship.buyer_name || "",
      brand_name: ship.brand_name || "",
      company_name: ship.company_name || "",
      destination_country: ship.destination_country || "",
      destination_country_code: ship.destination_country_code || "",
      destination_port: ship.destination_port || "",
      place_of_delivery: ship.place_of_delivery || "",
      destination_code: ship.destination_code || "",
      warehouse_no: ship.warehouse_no || "",
      address: ship.address || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this shipping info?")) {
      try {
        await deleteMutation.mutateAsync(id);
        toast.success("Shipping info deleted successfully");
      } catch (error) {
        toast.error("Failed to delete shipping info");
        console.error(error);
      }
    }
  };

  const resetForm = () => {
    setEditingShipping(null);
    setFormData({
      buyer_id: "",
      buyer_name: "",
      brand_name: "",
      company_name: "",
      destination_country: "",
      destination_country_code: "",
      destination_port: "",
      place_of_delivery: "",
      destination_code: "",
      warehouse_no: "",
      address: "",
    });
  };

  // Export columns configuration
  const exportColumns: ExportColumn[] = [
    { key: "buyer_name", header: "Buyer Name" },
    { key: "brand_name", header: "Brand Name" },
    { key: "company_name", header: "Company Name" },
    { key: "destination_country", header: "Destination Country" },
    { key: "destination_country_code", header: "Country Code" },
    { key: "destination_port", header: "Destination Port" },
    { key: "place_of_delivery", header: "Place of Delivery" },
    { key: "warehouse_no", header: "Warehouse No" },
    { key: "address", header: "Address" },
  ];

  const isLoading = isLoadingShipping || isLoadingBuyers;

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-9 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-36" />
          </div>
        </div>
        <Skeleton className="h-20 w-full" />
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {Array.from({ length: 9 }).map((_, i) => (
                  <TableHead key={i}>
                    <Skeleton className="h-4 w-20" />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 9 }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  // Error state
  if (isShippingError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <h2 className="text-xl font-semibold">Failed to load shipping info</h2>
        <p className="text-muted-foreground">There was an error loading the shipping data.</p>
        <Button onClick={() => refetchShipping()} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <PermissionGuard requiredDepartment="client_info">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Shipping Info</h1>
            <p className="text-muted-foreground">
              Manage buyer shipping destinations
            </p>
          </div>
          <div className="flex gap-2">
            <ExportButton
              data={filteredShipping}
              columns={exportColumns}
              filename="shipping"
              sheetName="Shipping"
            />
            <Button
              onClick={() => {
                resetForm();
                setIsDialogOpen(true);
              }}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Shipping Info
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="rounded-md border p-4 bg-card">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search buyer, company, country, port..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-9"
                />
              </div>
            </div>
            <Select
              value={filters.buyer}
              onValueChange={(value) => setFilters({ ...filters, buyer: value })}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Buyers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Buyers</SelectItem>
                {buyers.map((buyer) => (
                  <SelectItem key={buyer.id} value={buyer.id.toString()}>
                    {buyer.buyer_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filters.country}
              onValueChange={(value) => setFilters({ ...filters, country: value })}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Countries</SelectItem>
                {countries.map((country, idx) => (
                  <SelectItem key={`country-${idx}`} value={country}>
                    {country}
                  </SelectItem>
                ))}
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
            Showing {displayedShipping.length} of {filteredShipping.length} filtered ({shipping.length} total)
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Buyer Name</TableHead>
                <TableHead>Brand Name</TableHead>
                <TableHead>Company Name</TableHead>
                <TableHead>Destination Country</TableHead>
                <TableHead>Country Code</TableHead>
                <TableHead>Destination Port</TableHead>
                <TableHead>Place of Delivery</TableHead>
                <TableHead>Warehouse No</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedShipping.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <div className="flex flex-col items-center space-y-3">
                      <AlertCircle className="h-8 w-8 text-muted-foreground" />
                      <div className="space-y-1">
                        <p className="text-muted-foreground">
                          {shipping.length === 0
                            ? errorHandlingService.handleEmptyState('load-shipping-data', 'shipping').message
                            : "No shipping info matches your filters. Try adjusting your search criteria."}
                        </p>
                        {shipping.length === 0 && (
                          <div className="text-sm text-muted-foreground space-y-1">
                            {errorHandlingService.handleEmptyState('load-shipping-data', 'shipping').suggestions.map((suggestion, index) => (
                              <p key={index}>• {suggestion}</p>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                displayedShipping.map((ship) => (
                  <TableRow
                    key={ship.id}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => {
                      setSelectedShipping(ship);
                      setIsDetailDialogOpen(true);
                    }}
                  >
                    <TableCell className="font-medium">{ship.buyer_name}</TableCell>
                    <TableCell>{ship.brand_name}</TableCell>
                    <TableCell>{ship.company_name}</TableCell>
                    <TableCell>{ship.destination_country}</TableCell>
                    <TableCell>{ship.destination_country_code}</TableCell>
                    <TableCell>{ship.destination_port}</TableCell>
                    <TableCell>{ship.place_of_delivery}</TableCell>
                    <TableCell>{ship.warehouse_no}</TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(ship)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(ship.id)}
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
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingShipping ? "Edit Shipping Info" : "Add New Shipping Info"}
              </DialogTitle>
              <DialogDescription>
                {editingShipping
                  ? "Update shipping destination information"
                  : "Enter shipping destination details"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="buyer_id">Select Buyer</Label>
                  <Select
                    value={formData.buyer_id}
                    onValueChange={handleBuyerChange}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select buyer" />
                    </SelectTrigger>
                    <SelectContent>
                      {buyers.map((buyer) => (
                        <SelectItem key={buyer.id} value={buyer.id.toString()}>
                          {buyer.buyer_name} - {buyer.company_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label>Buyer Name</Label>
                    <Input value={formData.buyer_name} disabled />
                  </div>
                  <div className="grid gap-2">
                    <Label>Brand Name</Label>
                    <Input value={formData.brand_name} disabled />
                  </div>
                  <div className="grid gap-2">
                    <Label>Company Name</Label>
                    <Input value={formData.company_name} disabled />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="destination_country">Destination Country</Label>
                    <Select
                      value={formData.destination_country}
                      onValueChange={(value) =>
                        setFormData({ ...formData, destination_country: value })
                      }
                      required
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
                  <div className="grid gap-2">
                    <Label htmlFor="destination_country_code">Country Code</Label>
                    <Input
                      id="destination_country_code"
                      value={formData.destination_country_code}
                      onChange={(e) =>
                        setFormData({ ...formData, destination_country_code: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="destination_port">Destination Port</Label>
                    <Input
                      id="destination_port"
                      value={formData.destination_port}
                      onChange={(e) =>
                        setFormData({ ...formData, destination_port: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="place_of_delivery">Place of Delivery</Label>
                    <Input
                      id="place_of_delivery"
                      value={formData.place_of_delivery}
                      onChange={(e) =>
                        setFormData({ ...formData, place_of_delivery: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="destination_code">Destination Code</Label>
                    <Input
                      id="destination_code"
                      value={formData.destination_code}
                      onChange={(e) =>
                        setFormData({ ...formData, destination_code: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="warehouse_no">Warehouse No</Label>
                    <Input
                      id="warehouse_no"
                      value={formData.warehouse_no}
                      onChange={(e) =>
                        setFormData({ ...formData, warehouse_no: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {createMutation.isPending || updateMutation.isPending ? "Saving..." : editingShipping ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Detail View Dialog */}
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Shipping Details</DialogTitle>
              <DialogDescription>
                Complete shipping information for {selectedShipping?.buyer_name}
              </DialogDescription>
            </DialogHeader>
            {selectedShipping && (
              <div className="grid gap-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-muted-foreground">Buyer Name</Label>
                    <p className="text-base font-medium">{selectedShipping.buyer_name}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-muted-foreground">Brand Name</Label>
                    <p className="text-base">{selectedShipping.brand_name || "-"}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-muted-foreground">Company Name</Label>
                    <p className="text-base">{selectedShipping.company_name || "-"}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-muted-foreground">Destination Country</Label>
                    <p className="text-base">{selectedShipping.destination_country}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-muted-foreground">Country Code</Label>
                    <p className="text-base">{selectedShipping.destination_country_code || "-"}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-muted-foreground">Destination Port</Label>
                    <p className="text-base">{selectedShipping.destination_port || "-"}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-muted-foreground">Place of Delivery</Label>
                    <p className="text-base">{selectedShipping.place_of_delivery || "-"}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-muted-foreground">Destination Code</Label>
                    <p className="text-base">{selectedShipping.destination_code || "-"}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-muted-foreground">Warehouse No</Label>
                    <p className="text-base">{selectedShipping.warehouse_no || "-"}</p>
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label className="text-sm font-semibold text-muted-foreground">Address</Label>
                    <p className="text-base">{selectedShipping.address || "-"}</p>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsDetailDialogOpen(false);
                  if (selectedShipping) {
                    handleEdit(selectedShipping);
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
