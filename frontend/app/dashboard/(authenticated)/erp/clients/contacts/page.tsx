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
import {
  useContacts,
  useCreateContact,
  useUpdateContact,
  useDeleteContact,
  useBuyers,
  useSuppliers,
} from "@/hooks/use-queries";

export default function ContactsPage() {
  // TanStack Query hooks
  const { data: contactsData, isLoading: isLoadingContacts, isError: isContactsError, refetch: refetchContacts } = useContacts();
  const { data: buyersData, isLoading: isLoadingBuyers } = useBuyers();
  const { data: suppliersData, isLoading: isLoadingSuppliers } = useSuppliers();

  const contacts: Contact[] = Array.isArray(contactsData) ? contactsData : [];
  const buyers: Buyer[] = Array.isArray(buyersData) ? buyersData : [];
  const suppliers: Supplier[] = Array.isArray(suppliersData) ? suppliersData : [];

  const createMutation = useCreateContact();
  const updateMutation = useUpdateContact();
  const deleteMutation = useDeleteContact();

  // UI State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [rowLimit, setRowLimit] = useState<number | "all">(50);
  const [filters, setFilters] = useState({
    search: "",
    companyType: "",
    buyer: "",
    supplier: "",
    country: "",
  });
  const [formData, setFormData] = useState({
    contact_person_name: "",
    company_type: "buyer",
    company_id: "",
    department: "",
    designation: "",
    phone_number: "",
    corporate_mail: "",
    country: "",
  });

  // Derived state using useMemo
  const filteredContacts = useMemo(() => {
    let result = [...contacts];

    // Search filter
    if (filters.search && filters.search !== "all") {
      const searchLower = filters.search.toLowerCase();
      result = result.filter((contact) =>
        contact.contact_person_name?.toLowerCase().includes(searchLower) ||
        contact.department?.toLowerCase().includes(searchLower) ||
        contact.designation?.toLowerCase().includes(searchLower) ||
        contact.corporate_mail?.toLowerCase().includes(searchLower)
      );
    }

    // Company type filter
    if (filters.companyType && filters.companyType !== "all") {
      result = result.filter((contact) => {
        if (filters.companyType === "buyer") return contact.buyer_id != null;
        if (filters.companyType === "supplier") return contact.supplier_id != null;
        return true;
      });
    }

    // Buyer filter
    if (filters.buyer && filters.buyer !== "all") {
      result = result.filter((contact) => contact.buyer_id?.toString() === filters.buyer);
    }

    // Supplier filter
    if (filters.supplier && filters.supplier !== "all") {
      result = result.filter((contact) => contact.supplier_id?.toString() === filters.supplier);
    }

    // Country filter
    if (filters.country && filters.country !== "all") {
      result = result.filter((contact) => contact.country === filters.country);
    }

    return result;
  }, [contacts, filters]);

  const displayedContacts = useMemo(() => {
    if (rowLimit === "all") {
      return filteredContacts;
    }
    return filteredContacts.slice(0, rowLimit);
  }, [filteredContacts, rowLimit]);

  const uniqueCountries = useMemo(() => {
    return unique(contacts.map((c) => c.country).filter(Boolean)).sort();
  }, [contacts]);

  const clearFilters = () => {
    setFilters({ search: "", companyType: "", buyer: "", supplier: "", country: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Transform form data to match backend schema
      const payload: Record<string, any> = {
        contact_person_name: formData.contact_person_name,
        department: formData.department,
        designation: formData.designation,
        phone_number: formData.phone_number,
        corporate_mail: formData.corporate_mail,
        country: formData.country,
      };

      if (formData.company_type === "buyer") {
        payload.buyer_id = parseInt(formData.company_id);
        payload.supplier_id = null;
      } else {
        payload.supplier_id = parseInt(formData.company_id);
        payload.buyer_id = null;
      }

      if (editingContact) {
        await updateMutation.mutateAsync({ id: editingContact.id, data: payload });
        toast.success("Contact updated successfully");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Contact created successfully");
      }

      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error("Failed to save contact");
      console.error(error);
    }
  };

  const handleEdit = (contact: Contact) => {
    setEditingContact(contact);

    // Determine company type and ID from contact data
    let companyType = "buyer";
    let companyId = "";

    if (contact.buyer_id) {
      companyType = "buyer";
      companyId = contact.buyer_id.toString();
    } else if (contact.supplier_id) {
      companyType = "supplier";
      companyId = contact.supplier_id.toString();
    }

    setFormData({
      contact_person_name: contact.contact_person_name || "",
      company_type: companyType,
      company_id: companyId,
      department: contact.department || "",
      designation: contact.designation || "",
      phone_number: contact.phone_number || "",
      corporate_mail: contact.corporate_mail || "",
      country: contact.country || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this contact?")) {
      try {
        await deleteMutation.mutateAsync(id);
        toast.success("Contact deleted successfully");
      } catch (error) {
        toast.error("Failed to delete contact");
        console.error(error);
      }
    }
  };

  const resetForm = () => {
    setEditingContact(null);
    setFormData({
      contact_person_name: "",
      company_type: "buyer",
      company_id: "",
      department: "",
      designation: "",
      phone_number: "",
      corporate_mail: "",
      country: "",
    });
  };

  const getCompanyName = (contact: Contact) => {
    if (contact.buyer_id) {
      const buyer = buyers.find((b) => b.id === contact.buyer_id);
      return buyer ? `${buyer.buyer_name} (Buyer)` : "-";
    } else if (contact.supplier_id) {
      const supplier = suppliers.find((s) => s.id === contact.supplier_id);
      return supplier ? `${supplier.supplier_name} (Supplier)` : "-";
    }
    return "-";
  };

  // Export columns configuration
  const exportColumns: ExportColumn[] = [
    { key: "contact_person_name", header: "Contact Person Name" },
    {
      key: "company",
      header: "Company",
      transform: (value, row) => getCompanyName(row as Contact),
    },
    { key: "department", header: "Department" },
    { key: "designation", header: "Designation" },
    { key: "phone_number", header: "Phone Number (M)" },
    { key: "corporate_mail", header: "Corporate Mail" },
    { key: "country", header: "Country" },
  ];

  const isLoading = isLoadingContacts || isLoadingBuyers || isLoadingSuppliers;

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
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        <Skeleton className="h-24 w-full" />
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {Array.from({ length: 8 }).map((_, i) => (
                  <TableHead key={i}>
                    <Skeleton className="h-4 w-20" />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 8 }).map((_, j) => (
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
  if (isContactsError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <h2 className="text-xl font-semibold">Failed to load contacts</h2>
        <p className="text-muted-foreground">There was an error loading the contacts data.</p>
        <Button onClick={() => refetchContacts()} variant="outline">
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
            <h1 className="text-3xl font-bold">Contact Info</h1>
            <p className="text-muted-foreground">
              Manage buyer and supplier contacts
            </p>
          </div>
          <div className="flex gap-2">
            <ExportButton
              data={filteredContacts}
              columns={exportColumns}
              filename="contacts"
              sheetName="Contacts"
            />
            <Button
              onClick={() => {
                resetForm();
                setIsDialogOpen(true);
              }}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Contact
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
                  placeholder="Search contacts, departments, emails..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-9"
                />
              </div>
            </div>
            <Select
              value={filters.companyType}
              onValueChange={(value) => setFilters({ ...filters, companyType: value })}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Company Type" />
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
              <SelectTrigger className="w-[150px]">
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
            Showing {displayedContacts.length} of {filteredContacts.length} filtered ({contacts.length} total) contacts
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contact Person Name</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Designation</TableHead>
                <TableHead>Phone Number (M)</TableHead>
                <TableHead>Corporate Mail</TableHead>
                <TableHead>Country</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedContacts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">
                    {contacts.length === 0
                      ? "No contacts found. Add your first contact to get started."
                      : "No contacts match your filters. Try adjusting your search criteria."}
                  </TableCell>
                </TableRow>
              ) : (
                displayedContacts.map((contact) => (
                  <TableRow
                    key={contact.id}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => {
                      setSelectedContact(contact);
                      setIsDetailDialogOpen(true);
                    }}
                  >
                    <TableCell className="font-medium">
                      {contact.contact_person_name}
                    </TableCell>
                    <TableCell>{getCompanyName(contact)}</TableCell>
                    <TableCell>{contact.department}</TableCell>
                    <TableCell>{contact.designation}</TableCell>
                    <TableCell>{contact.phone_number}</TableCell>
                    <TableCell>{contact.corporate_mail}</TableCell>
                    <TableCell>{contact.country}</TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(contact)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(contact.id)}
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
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingContact ? "Edit Contact" : "Add New Contact"}
              </DialogTitle>
              <DialogDescription>
                {editingContact
                  ? "Update contact information"
                  : "Enter contact details below"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="contact_person_name">Contact Person Name</Label>
                  <Input
                    id="contact_person_name"
                    value={formData.contact_person_name}
                    onChange={(e) =>
                      setFormData({ ...formData, contact_person_name: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="company_type">Company Type</Label>
                    <Select
                      value={formData.company_type}
                      onValueChange={(value) =>
                        setFormData({ ...formData, company_type: value, company_id: "" })
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
                    <Label htmlFor="company_id">Company</Label>
                    <Select
                      value={formData.company_id}
                      onValueChange={(value) =>
                        setFormData({ ...formData, company_id: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select company" />
                      </SelectTrigger>
                      <SelectContent>
                        {formData.company_type === "buyer"
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

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      value={formData.department}
                      onChange={(e) =>
                        setFormData({ ...formData, department: e.target.value })
                      }
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="designation">Designation</Label>
                    <Input
                      id="designation"
                      value={formData.designation}
                      onChange={(e) =>
                        setFormData({ ...formData, designation: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="phone_number">Phone Number (M)</Label>
                    <Input
                      id="phone_number"
                      value={formData.phone_number}
                      onChange={(e) =>
                        setFormData({ ...formData, phone_number: e.target.value })
                      }
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="country">Country</Label>
                    <Select
                      value={formData.country}
                      onValueChange={(value) =>
                        setFormData({ ...formData, country: value })
                      }
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
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="corporate_mail">Corporate Mail</Label>
                  <Input
                    id="corporate_mail"
                    type="email"
                    value={formData.corporate_mail}
                    onChange={(e) =>
                      setFormData({ ...formData, corporate_mail: e.target.value })
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
                  {createMutation.isPending || updateMutation.isPending ? "Saving..." : editingContact ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Detail View Dialog */}
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Contact Details</DialogTitle>
              <DialogDescription>
                Complete information for {selectedContact?.contact_person_name}
              </DialogDescription>
            </DialogHeader>
            {selectedContact && (
              <div className="grid gap-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-muted-foreground">Contact Person Name</Label>
                    <p className="text-base font-medium">{selectedContact.contact_person_name}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-muted-foreground">Company</Label>
                    <p className="text-base">{getCompanyName(selectedContact)}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-muted-foreground">Department</Label>
                    <p className="text-base">{selectedContact.department || "-"}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-muted-foreground">Designation</Label>
                    <p className="text-base">{selectedContact.designation || "-"}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-muted-foreground">Phone Number</Label>
                    <p className="text-base">{selectedContact.phone_number ? (
                      <a href={`tel:${selectedContact.phone_number}`} className="text-blue-600 hover:underline">
                        {selectedContact.phone_number}
                      </a>
                    ) : "-"}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-muted-foreground">Corporate Mail</Label>
                    <p className="text-base">{selectedContact.corporate_mail ? (
                      <a href={`mailto:${selectedContact.corporate_mail}`} className="text-blue-600 hover:underline">
                        {selectedContact.corporate_mail}
                      </a>
                    ) : "-"}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-muted-foreground">Country</Label>
                    <p className="text-base">{selectedContact.country || "-"}</p>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsDetailDialogOpen(false);
                  if (selectedContact) {
                    handleEdit(selectedContact);
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
