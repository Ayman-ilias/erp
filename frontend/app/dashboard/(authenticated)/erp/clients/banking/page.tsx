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
  useBankingDetails,
  useCreateBankingDetail,
  useUpdateBankingDetail,
  useDeleteBankingDetail,
  useBuyers,
  useSuppliers,
} from "@/hooks/use-queries";

export default function BankingPage() {
  // TanStack Query hooks
  const { data: bankingData, isLoading: isLoadingBanking, isError: isBankingError, refetch: refetchBanking } = useBankingDetails();
  const { data: buyersData, isLoading: isLoadingBuyers } = useBuyers();
  const { data: suppliersData, isLoading: isLoadingSuppliers } = useSuppliers();

  const banking: BankingDetail[] = Array.isArray(bankingData) ? bankingData : [];
  const buyers: Buyer[] = Array.isArray(buyersData) ? buyersData : [];
  const suppliers: Supplier[] = Array.isArray(suppliersData) ? suppliersData : [];

  const createMutation = useCreateBankingDetail();
  const updateMutation = useUpdateBankingDetail();
  const deleteMutation = useDeleteBankingDetail();

  // UI State
  const [rowLimit, setRowLimit] = useState<number | "all">(50);
  const [filters, setFilters] = useState({ search: "", clientType: "", buyer: "", supplier: "", country: "" });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedBanking, setSelectedBanking] = useState<BankingDetail | null>(null);
  const [editingBanking, setEditingBanking] = useState<BankingDetail | null>(null);
  const [formData, setFormData] = useState({
    client_type: "buyer",
    client_id: "",
    client_name: "",
    country: "",
    bank_name: "",
    sort_code: "",
    account_number: "",
  });

  // Derived state using useMemo
  const filteredBanking = useMemo(() => {
    let result = [...banking];
    if (filters.search && filters.search !== "all") {
      const searchLower = filters.search.toLowerCase();
      result = result.filter((b) =>
        b.client_name?.toLowerCase().includes(searchLower) ||
        b.bank_name?.toLowerCase().includes(searchLower) ||
        b.country?.toLowerCase().includes(searchLower) ||
        b.account_number?.toLowerCase().includes(searchLower)
      );
    }
    // Client type filter
    if (filters.clientType && filters.clientType !== "all") {
      result = result.filter((b) => b.client_type === filters.clientType);
    }
    // Buyer filter
    if (filters.buyer && filters.buyer !== "all") {
      result = result.filter((b) => b.client_type === "buyer" && b.client_id?.toString() === filters.buyer);
    }
    // Supplier filter
    if (filters.supplier && filters.supplier !== "all") {
      result = result.filter((b) => b.client_type === "supplier" && b.client_id?.toString() === filters.supplier);
    }
    if (filters.country && filters.country !== "all") {
      result = result.filter((b) => b.country === filters.country);
    }
    return result;
  }, [banking, filters]);

  const displayedBanking = useMemo(() => {
    if (rowLimit === "all") {
      return filteredBanking;
    }
    return filteredBanking.slice(0, rowLimit);
  }, [filteredBanking, rowLimit]);

  const uniqueCountries = useMemo(() => {
    return unique(banking.map((b) => b.country).filter(Boolean)).sort();
  }, [banking]);

  const clearFilters = () => setFilters({ search: "", clientType: "", buyer: "", supplier: "", country: "" });

  const handleClientChange = (clientId: string) => {
    if (formData.client_type === "buyer") {
      const buyer = buyers.find((b) => b.id.toString() === clientId);
      if (buyer) {
        setFormData({
          ...formData,
          client_id: clientId,
          client_name: buyer.buyer_name || "",
        });
      }
    } else {
      const supplier = suppliers.find((s) => s.id.toString() === clientId);
      if (supplier) {
        setFormData({
          ...formData,
          client_id: clientId,
          client_name: supplier.supplier_name || "",
        });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingBanking) {
        await updateMutation.mutateAsync({ id: editingBanking.id, data: formData });
        toast.success("Banking info updated successfully");
      } else {
        await createMutation.mutateAsync(formData);
        toast.success("Banking info created successfully");
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error("Failed to save banking info");
      console.error(error);
    }
  };

  const handleEdit = (bank: BankingDetail) => {
    setEditingBanking(bank);
    setFormData({
      client_type: bank.client_type || "buyer",
      client_id: bank.client_id?.toString() || "",
      client_name: bank.client_name || "",
      country: bank.country || "",
      bank_name: bank.bank_name || "",
      sort_code: bank.sort_code || "",
      account_number: bank.account_number || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this banking info?")) {
      try {
        await deleteMutation.mutateAsync(id);
        toast.success("Banking info deleted successfully");
      } catch (error) {
        toast.error("Failed to delete banking info");
        console.error(error);
      }
    }
  };

  const resetForm = () => {
    setEditingBanking(null);
    setFormData({
      client_type: "buyer",
      client_id: "",
      client_name: "",
      country: "",
      bank_name: "",
      sort_code: "",
      account_number: "",
    });
  };

  // Export columns configuration
  const exportColumns: ExportColumn[] = [
    { key: "client_name", header: "Client Name" },
    { key: "client_type", header: "Client Type", transform: (value) => value === "buyer" ? "Buyer" : "Supplier" },
    { key: "country", header: "Country" },
    { key: "bank_name", header: "Bank Name" },
    { key: "account_number", header: "Account Number" },
    { key: "sort_code", header: "SORT Code" },
  ];

  const isLoading = isLoadingBanking || isLoadingBuyers || isLoadingSuppliers;

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
                {Array.from({ length: 6 }).map((_, i) => (
                  <TableHead key={i}>
                    <Skeleton className="h-4 w-20" />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
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
  if (isBankingError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <h2 className="text-xl font-semibold">Failed to load banking info</h2>
        <p className="text-muted-foreground">There was an error loading the banking data.</p>
        <Button onClick={() => refetchBanking()} variant="outline">
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
            <h1 className="text-3xl font-bold">Banking Info</h1>
            <p className="text-muted-foreground">
              Manage client banking information
            </p>
          </div>
          <div className="flex gap-2">
            <ExportButton
              data={filteredBanking}
              columns={exportColumns}
              filename="banking"
              sheetName="Banking"
            />
            <Button
              onClick={() => {
                resetForm();
                setIsDialogOpen(true);
              }}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Banking Info
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
                  placeholder="Search client, bank, account..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-9"
                />
              </div>
            </div>
            <Select
              value={filters.clientType}
              onValueChange={(value) => setFilters({ ...filters, clientType: value })}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Client Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="buyer">Buyers</SelectItem>
                <SelectItem value="supplier">Suppliers</SelectItem>
              </SelectContent>
            </Select>
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
              value={filters.supplier}
              onValueChange={(value) => setFilters({ ...filters, supplier: value })}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Suppliers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Suppliers</SelectItem>
                {suppliers.map((supplier) => (
                  <SelectItem key={supplier.id} value={supplier.id.toString()}>
                    {supplier.supplier_name}
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
            Showing {displayedBanking.length} of {filteredBanking.length} filtered ({banking.length} total)
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client Name</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Bank Name</TableHead>
                <TableHead>Account Number</TableHead>
                <TableHead>SORT Code</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedBanking.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex flex-col items-center space-y-3">
                      <AlertCircle className="h-8 w-8 text-muted-foreground" />
                      <div className="space-y-1">
                        <p className="text-muted-foreground">
                          {banking.length === 0
                            ? errorHandlingService.handleEmptyState('load-banking-data', 'banking').message
                            : "No banking info matches your filters. Try adjusting your search criteria."}
                        </p>
                        {banking.length === 0 && (
                          <div className="text-sm text-muted-foreground space-y-1">
                            {errorHandlingService.handleEmptyState('load-banking-data', 'banking').suggestions.map((suggestion, index) => (
                              <p key={index}>• {suggestion}</p>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                displayedBanking.map((bank) => (
                  <TableRow
                    key={bank.id}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => {
                      setSelectedBanking(bank);
                      setIsDetailDialogOpen(true);
                    }}
                  >
                    <TableCell className="font-medium">{bank.client_name}</TableCell>
                    <TableCell>{bank.country}</TableCell>
                    <TableCell>{bank.bank_name}</TableCell>
                    <TableCell>{bank.account_number}</TableCell>
                    <TableCell>{bank.sort_code}</TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(bank)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(bank.id)}
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
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingBanking ? "Edit Banking Info" : "Add New Banking Info"}
              </DialogTitle>
              <DialogDescription>
                {editingBanking
                  ? "Update banking information"
                  : "Enter banking details below"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="client_type">Client Type</Label>
                    <Select
                      value={formData.client_type}
                      onValueChange={(value) =>
                        setFormData({ ...formData, client_type: value, client_id: "", client_name: "" })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="buyer">Buyer</SelectItem>
                        <SelectItem value="supplier">Supplier</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="client_id">Client</Label>
                    <Select
                      value={formData.client_id}
                      onValueChange={handleClientChange}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select client" />
                      </SelectTrigger>
                      <SelectContent>
                        {formData.client_type === "buyer"
                          ? buyers.map((buyer) => (
                            <SelectItem key={buyer.id} value={buyer.id.toString()}>
                              {buyer.buyer_name}
                            </SelectItem>
                          ))
                          : suppliers.map((supplier) => (
                            <SelectItem
                              key={supplier.id}
                              value={supplier.id.toString()}
                            >
                              {supplier.supplier_name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label>Client Name</Label>
                  <Input value={formData.client_name} disabled />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="country">Country</Label>
                    <Select
                      value={formData.country}
                      onValueChange={(value) =>
                        setFormData({ ...formData, country: value })
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
                    <Label htmlFor="sort_code">SORT Code</Label>
                    <Input
                      id="sort_code"
                      value={formData.sort_code}
                      onChange={(e) =>
                        setFormData({ ...formData, sort_code: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="bank_name">Bank Name</Label>
                    <Input
                      id="bank_name"
                      value={formData.bank_name}
                      onChange={(e) =>
                        setFormData({ ...formData, bank_name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="account_number">Account Number</Label>
                    <Input
                      id="account_number"
                      value={formData.account_number}
                      onChange={(e) =>
                        setFormData({ ...formData, account_number: e.target.value })
                      }
                      required
                    />
                  </div>
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
                  {createMutation.isPending || updateMutation.isPending ? "Saving..." : editingBanking ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Detail View Dialog */}
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Banking Details</DialogTitle>
              <DialogDescription>
                Complete banking information for {selectedBanking?.client_name}
              </DialogDescription>
            </DialogHeader>
            {selectedBanking && (
              <div className="grid gap-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-muted-foreground">Client Name</Label>
                    <p className="text-base font-medium">{selectedBanking.client_name}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-muted-foreground">Client Type</Label>
                    <p className="text-base">
                      {selectedBanking.client_type === "buyer" ? "Buyer" : "Supplier"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-muted-foreground">Country</Label>
                    <p className="text-base">{selectedBanking.country || "-"}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-muted-foreground">Bank Name</Label>
                    <p className="text-base">{selectedBanking.bank_name}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-muted-foreground">Account Number</Label>
                    <p className="text-base font-mono">{selectedBanking.account_number || "-"}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-muted-foreground">SORT Code</Label>
                    <p className="text-base">{selectedBanking.sort_code || "-"}</p>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsDetailDialogOpen(false);
                  if (selectedBanking) {
                    handleEdit(selectedBanking);
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
