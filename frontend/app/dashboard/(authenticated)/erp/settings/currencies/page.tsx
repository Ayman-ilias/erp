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

export default function CurrenciesPage() {
  const { user, token } = useAuth();
  const [currencies, setCurrencies] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    currency_code: "",
    currency_name: "",
    symbol: "",
    decimal_places: 2,
    is_base_currency: false,
    exchange_rate: "1.0",
    is_active: true,
    remarks: "",
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
      const data = await settingsService.currencies.getAll(token);
      setCurrencies(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading currencies:", error);
      toast.error("Failed to load currencies");
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
        await settingsService.currencies.update(editingItem.id, formData, token);
        toast.success("Currency updated successfully");
      } else {
        await settingsService.currencies.create(formData, token);
        toast.success("Currency created successfully");
      }
      setIsDialogOpen(false);
      resetForm();
      loadData();
    } catch (error: any) {
      toast.error(error?.message || "Failed to save currency");
      console.error(error);
    }
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      currency_code: item.currency_code || "",
      currency_name: item.currency_name || "",
      symbol: item.symbol || "",
      decimal_places: item.decimal_places || 2,
      is_base_currency: item.is_base_currency || false,
      exchange_rate: item.exchange_rate?.toString() || "1.0",
      is_active: item.is_active !== false,
      remarks: item.remarks || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this currency?")) {
      try {
        if (!token) {
          toast.error("Not authenticated");
          return;
        }
        await settingsService.currencies.delete(id, token);
        toast.success("Currency deleted successfully");
        loadData();
      } catch (error) {
        toast.error("Failed to delete currency");
        console.error(error);
      }
    }
  };

  const resetForm = () => {
    setEditingItem(null);
    setFormData({
      currency_code: "",
      currency_name: "",
      symbol: "",
      decimal_places: 2,
      is_base_currency: false,
      exchange_rate: "1.0",
      is_active: true,
      remarks: "",
    });
  };

  if (!user?.is_superuser) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="p-8 text-center">
          <Shield className="h-16 w-16 mx-auto mb-4 text-destructive" />
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">
            You need administrator privileges to access this page.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Currencies</h1>
          <p className="text-muted-foreground">
            Manage currencies and exchange rates
          </p>
        </div>
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Currency
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? "Edit Currency" : "Add New Currency"}
              </DialogTitle>
              <DialogDescription>
                {editingItem
                  ? "Update currency information"
                  : "Create a new currency with exchange rate"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="currency_code">Currency Code *</Label>
                    <Input
                      id="currency_code"
                      value={formData.currency_code}
                      onChange={(e) =>
                        setFormData({ ...formData, currency_code: e.target.value.toUpperCase() })
                      }
                      placeholder="USD, EUR, BDT"
                      maxLength={3}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="symbol">Symbol</Label>
                    <Input
                      id="symbol"
                      value={formData.symbol}
                      onChange={(e) =>
                        setFormData({ ...formData, symbol: e.target.value })
                      }
                      placeholder="$, €, ৳"
                      maxLength={5}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency_name">Currency Name *</Label>
                  <Input
                    id="currency_name"
                    value={formData.currency_name}
                    onChange={(e) =>
                      setFormData({ ...formData, currency_name: e.target.value })
                    }
                    placeholder="US Dollar"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="exchange_rate">Exchange Rate *</Label>
                    <Input
                      id="exchange_rate"
                      type="number"
                      step="0.000001"
                      value={formData.exchange_rate}
                      onChange={(e) =>
                        setFormData({ ...formData, exchange_rate: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="decimal_places">Decimal Places</Label>
                    <Input
                      id="decimal_places"
                      type="number"
                      min={0}
                      max={6}
                      value={formData.decimal_places}
                      onChange={(e) =>
                        setFormData({ ...formData, decimal_places: parseInt(e.target.value) || 2 })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="remarks">Remarks</Label>
                  <Input
                    id="remarks"
                    value={formData.remarks}
                    onChange={(e) =>
                      setFormData({ ...formData, remarks: e.target.value })
                    }
                    placeholder="Optional notes"
                  />
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="is_base_currency"
                      checked={formData.is_base_currency}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, is_base_currency: !!checked })
                      }
                    />
                    <Label htmlFor="is_base_currency" className="cursor-pointer">
                      Base Currency
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, is_active: !!checked })
                      }
                    />
                    <Label htmlFor="is_active" className="cursor-pointer">
                      Active
                    </Label>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">
                  {editingItem ? "Update" : "Create"} Currency
                </Button>
              </DialogFooter>
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
              <TableHead>Symbol</TableHead>
              <TableHead>Exchange Rate</TableHead>
              <TableHead>Decimals</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currencies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  {loading ? "Loading..." : "No currencies found. Add your first currency."}
                </TableCell>
              </TableRow>
            ) : (
              currencies.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    {item.currency_code}
                    {item.is_base_currency && (
                      <Badge variant="secondary" className="ml-2">Base</Badge>
                    )}
                  </TableCell>
                  <TableCell>{item.currency_name}</TableCell>
                  <TableCell>{item.symbol || "-"}</TableCell>
                  <TableCell>{parseFloat(item.exchange_rate).toFixed(4)}</TableCell>
                  <TableCell>{item.decimal_places}</TableCell>
                  <TableCell>
                    <Badge variant={item.is_active ? "default" : "secondary"}>
                      {item.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(item)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(item.id)}
                      >
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
    </div>
  );
}
