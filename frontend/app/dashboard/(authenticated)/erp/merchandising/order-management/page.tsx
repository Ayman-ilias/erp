"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, ArrowLeft, Loader2, Edit, Trash2, FileText, Package, Truck, Box, List } from "lucide-react";
import { useRouter } from "next/navigation";
import { api } from "@/services/api";
import { toast } from "sonner";
import { format } from "date-fns";
import { UnderDevelopment } from "@/components/under-development";

// ========== SALES CONTRACT DIALOG ==========
function SalesContractDialog({
  open,
  onOpenChange,
  editingContract,
  buyers,
  onSubmit,
  isLoading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingContract: any;
  buyers: any[];
  onSubmit: (data: any) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    buyer_id: "",
    sales_contract_no: "",
    amendment_no: 0,
  });

  useEffect(() => {
    if (editingContract) {
      setFormData({
        buyer_id: String(editingContract.buyer_id || ""),
        sales_contract_no: editingContract.sales_contract_no || "",
        amendment_no: editingContract.amendment_no || 0,
      });
    } else {
      setFormData({
        buyer_id: "",
        sales_contract_no: "",
        amendment_no: 0,
      });
    }
  }, [editingContract, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      buyer_id: parseInt(formData.buyer_id),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{editingContract ? "Edit Sales Contract" : "Create Sales Contract"}</DialogTitle>
          <DialogDescription>
            Create or edit a sales contract summary
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="buyer_id">
                Buyer <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.buyer_id}
                onValueChange={(value) => setFormData({ ...formData, buyer_id: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select buyer" />
                </SelectTrigger>
                <SelectContent>
                  {buyers.map((buyer: any) => (
                    <SelectItem key={buyer.id} value={String(buyer.id)}>
                      {buyer.brand_name} - {buyer.company_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sales_contract_no">
                Sales Contract No <span className="text-destructive">*</span>
              </Label>
              <Input
                id="sales_contract_no"
                value={formData.sales_contract_no}
                onChange={(e) => setFormData({ ...formData, sales_contract_no: e.target.value })}
                required
                placeholder="e.g., SC-2024-001"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amendment_no">Amendment No</Label>
              <Input
                id="amendment_no"
                type="number"
                value={formData.amendment_no}
                onChange={(e) => setFormData({ ...formData, amendment_no: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {editingContract ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>{editingContract ? "Update" : "Create"} Contract</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ========== ORDER DIALOG ==========
function OrderDialog({
  open,
  onOpenChange,
  editingOrder,
  salesContracts,
  buyers,
  styles,
  onSubmit,
  isLoading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingOrder: any;
  salesContracts: any[];
  buyers: any[];
  styles: any[];
  onSubmit: (data: any) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    sales_contract_id: "",
    buyer_id: "",
    order_number: "",
    order_date: "",
    scl_po: "",
    season: "",
    order_category: "",
    allow_tolerance: false,
    tolerance_percent: 0,
    style_ids: [] as string[],
  });

  // Get the selected buyer's name to determine which fields to show
  const selectedBuyer = useMemo(() => {
    return buyers.find((b: any) => String(b.id) === formData.buyer_id);
  }, [buyers, formData.buyer_id]);

  const isHM = selectedBuyer?.brand_name?.toUpperCase()?.includes("H&M");

  useEffect(() => {
    if (editingOrder) {
      setFormData({
        sales_contract_id: editingOrder.sales_contract_id || "",
        buyer_id: String(editingOrder.buyer_id || ""),
        order_number: editingOrder.order_number || "",
        order_date: editingOrder.order_date ? editingOrder.order_date.split("T")[0] : "",
        scl_po: editingOrder.scl_po || "",
        season: editingOrder.season || "",
        order_category: editingOrder.order_category || "",
        allow_tolerance: editingOrder.allow_tolerance || false,
        tolerance_percent: editingOrder.tolerance_percent || 0,
        style_ids: editingOrder.style_ids || [],
      });
    } else {
      setFormData({
        sales_contract_id: "",
        buyer_id: "",
        order_number: "",
        order_date: "",
        scl_po: "",
        season: "",
        order_category: "",
        allow_tolerance: false,
        tolerance_percent: 0,
        style_ids: [],
      });
    }
  }, [editingOrder, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      buyer_id: parseInt(formData.buyer_id),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingOrder ? "Edit Order" : "Create Order"}</DialogTitle>
          <DialogDescription>
            Create or edit order primary information
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sales_contract_id">Sales Contract</Label>
              <Select
                value={formData.sales_contract_id}
                onValueChange={(value) => setFormData({ ...formData, sales_contract_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select sales contract" />
                </SelectTrigger>
                <SelectContent>
                  {salesContracts.map((sc: any) => (
                    <SelectItem key={sc.sales_contract_id} value={sc.sales_contract_id}>
                      {sc.sales_contract_no} ({sc.sales_contract_id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="buyer_id">
                Buyer <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.buyer_id}
                onValueChange={(value) => setFormData({ ...formData, buyer_id: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select buyer" />
                </SelectTrigger>
                <SelectContent>
                  {buyers.map((buyer: any) => (
                    <SelectItem key={buyer.id} value={String(buyer.id)}>
                      {buyer.brand_name} - {buyer.company_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="order_number">
                Order Number <span className="text-destructive">*</span>
              </Label>
              <Input
                id="order_number"
                value={formData.order_number}
                onChange={(e) => setFormData({ ...formData, order_number: e.target.value })}
                required
                placeholder="e.g., PO-2024-001"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="order_date">Order Date</Label>
              <Input
                id="order_date"
                type="date"
                value={formData.order_date}
                onChange={(e) => setFormData({ ...formData, order_date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="scl_po">SCL PO</Label>
              <Input
                id="scl_po"
                value={formData.scl_po}
                onChange={(e) => setFormData({ ...formData, scl_po: e.target.value })}
                placeholder="SCL PO reference"
              />
            </div>
            {isHM && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="season">Season (H&M)</Label>
                  <Input
                    id="season"
                    value={formData.season}
                    onChange={(e) => setFormData({ ...formData, season: e.target.value })}
                    placeholder="e.g., SS24, AW24"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="order_category">Order Category (H&M)</Label>
                  <Select
                    value={formData.order_category}
                    onValueChange={(value) => setFormData({ ...formData, order_category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Main">Main</SelectItem>
                      <SelectItem value="Re-Order">Re-Order</SelectItem>
                      <SelectItem value="Sample">Sample</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
            <div className="space-y-2 col-span-2">
              <div className="flex items-center gap-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="allow_tolerance"
                    checked={formData.allow_tolerance}
                    onChange={(e) => setFormData({ ...formData, allow_tolerance: e.target.checked })}
                    className="mr-2"
                  />
                  <Label htmlFor="allow_tolerance">Allow Tolerance</Label>
                </div>
                {formData.allow_tolerance && (
                  <div className="flex items-center gap-2">
                    <Label htmlFor="tolerance_percent">Tolerance %</Label>
                    <Input
                      id="tolerance_percent"
                      type="number"
                      value={formData.tolerance_percent}
                      onChange={(e) => setFormData({ ...formData, tolerance_percent: parseFloat(e.target.value) || 0 })}
                      className="w-24"
                      step="0.1"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {editingOrder ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>{editingOrder ? "Update" : "Create"} Order</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ========== DELIVERY SCHEDULE DIALOG ==========
function DeliveryScheduleDialog({
  open,
  onOpenChange,
  editingSchedule,
  orders,
  buyers,
  onSubmit,
  isLoading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingSchedule: any;
  orders: any[];
  buyers: any[];
  onSubmit: (data: any) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    order_id: "",
    shipment_date: "",
    destination_country: "",
    destination_country_code: "",
    destination_number: "",
    destination_code: "",
    incoterms: "",
    freight_method: "",
    total_units: 0,
    packs: 0,
    price_ticket: "",
  });

  // Get the selected order's buyer to determine which fields to show
  const selectedOrder = useMemo(() => {
    return orders.find((o: any) => o.order_id === formData.order_id);
  }, [orders, formData.order_id]);

  const selectedBuyer = useMemo(() => {
    return buyers.find((b: any) => b.id === selectedOrder?.buyer_id);
  }, [buyers, selectedOrder]);

  const isPrimark = selectedBuyer?.brand_name?.toUpperCase()?.includes("PRIMARK");

  useEffect(() => {
    if (editingSchedule) {
      setFormData({
        order_id: editingSchedule.order_id || "",
        shipment_date: editingSchedule.shipment_date ? editingSchedule.shipment_date.split("T")[0] : "",
        destination_country: editingSchedule.destination_country || "",
        destination_country_code: editingSchedule.destination_country_code || "",
        destination_number: editingSchedule.destination_number || "",
        destination_code: editingSchedule.destination_code || "",
        incoterms: editingSchedule.incoterms || "",
        freight_method: editingSchedule.freight_method || "",
        total_units: editingSchedule.total_units || 0,
        packs: editingSchedule.packs || 0,
        price_ticket: editingSchedule.price_ticket || "",
      });
    } else {
      setFormData({
        order_id: "",
        shipment_date: "",
        destination_country: "",
        destination_country_code: "",
        destination_number: "",
        destination_code: "",
        incoterms: "",
        freight_method: "",
        total_units: 0,
        packs: 0,
        price_ticket: "",
      });
    }
  }, [editingSchedule, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingSchedule ? "Edit Delivery Schedule" : "Create Delivery Schedule"}</DialogTitle>
          <DialogDescription>
            Create or edit shipment delivery schedule
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="order_id">
                Order <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.order_id}
                onValueChange={(value) => setFormData({ ...formData, order_id: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select order" />
                </SelectTrigger>
                <SelectContent>
                  {orders.map((order: any) => (
                    <SelectItem key={order.order_id} value={order.order_id}>
                      {order.order_number} ({order.order_id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="shipment_date">
                Shipment Date <span className="text-destructive">*</span>
              </Label>
              <Input
                id="shipment_date"
                type="date"
                value={formData.shipment_date}
                onChange={(e) => setFormData({ ...formData, shipment_date: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="destination_country">Destination Country</Label>
              <Input
                id="destination_country"
                value={formData.destination_country}
                onChange={(e) => setFormData({ ...formData, destination_country: e.target.value })}
                placeholder="e.g., United Kingdom"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="destination_country_code">Country Code</Label>
              <Input
                id="destination_country_code"
                value={formData.destination_country_code}
                onChange={(e) => setFormData({ ...formData, destination_country_code: e.target.value })}
                placeholder="e.g., GB"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="destination_number">Destination Number</Label>
              <Input
                id="destination_number"
                value={formData.destination_number}
                onChange={(e) => setFormData({ ...formData, destination_number: e.target.value })}
                placeholder="Destination number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="destination_code">Destination Code</Label>
              <Input
                id="destination_code"
                value={formData.destination_code}
                onChange={(e) => setFormData({ ...formData, destination_code: e.target.value })}
                placeholder="Destination code"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="incoterms">Incoterms</Label>
              <Select
                value={formData.incoterms}
                onValueChange={(value) => setFormData({ ...formData, incoterms: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select incoterms" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FOB">FOB</SelectItem>
                  <SelectItem value="CIF">CIF</SelectItem>
                  <SelectItem value="CFR">CFR</SelectItem>
                  <SelectItem value="EXW">EXW</SelectItem>
                  <SelectItem value="DDP">DDP</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="freight_method">Freight Method</Label>
              <Select
                value={formData.freight_method}
                onValueChange={(value) => setFormData({ ...formData, freight_method: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sea">Sea</SelectItem>
                  <SelectItem value="Air">Air</SelectItem>
                  <SelectItem value="Road">Road</SelectItem>
                  <SelectItem value="Rail">Rail</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {isPrimark && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="total_units">Total Units (PRIMARK)</Label>
                  <Input
                    id="total_units"
                    type="number"
                    value={formData.total_units}
                    onChange={(e) => setFormData({ ...formData, total_units: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="packs">Packs (PRIMARK)</Label>
                  <Input
                    id="packs"
                    type="number"
                    value={formData.packs}
                    onChange={(e) => setFormData({ ...formData, packs: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price_ticket">Price Ticket (PRIMARK)</Label>
                  <Input
                    id="price_ticket"
                    value={formData.price_ticket}
                    onChange={(e) => setFormData({ ...formData, price_ticket: e.target.value })}
                    placeholder="Price ticket info"
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {editingSchedule ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>{editingSchedule ? "Update" : "Create"} Schedule</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ========== PACKING DETAIL DIALOG ==========
function PackingDetailDialog({
  open,
  onOpenChange,
  editingPacking,
  deliverySchedules,
  onSubmit,
  isLoading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingPacking: any;
  deliverySchedules: any[];
  onSubmit: (data: any) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    shipment_id: "",
    carton_length: 0,
    carton_width: 0,
    carton_height: 0,
    cartons_per_pallet: 0,
    pieces_per_carton: 0,
  });

  useEffect(() => {
    if (editingPacking) {
      setFormData({
        shipment_id: editingPacking.shipment_id || "",
        carton_length: editingPacking.carton_length || 0,
        carton_width: editingPacking.carton_width || 0,
        carton_height: editingPacking.carton_height || 0,
        cartons_per_pallet: editingPacking.cartons_per_pallet || 0,
        pieces_per_carton: editingPacking.pieces_per_carton || 0,
      });
    } else {
      setFormData({
        shipment_id: "",
        carton_length: 0,
        carton_width: 0,
        carton_height: 0,
        cartons_per_pallet: 0,
        pieces_per_carton: 0,
      });
    }
  }, [editingPacking, open]);

  // Calculate CBM
  const cbm = useMemo(() => {
    if (formData.carton_length && formData.carton_width && formData.carton_height) {
      return ((formData.carton_length * formData.carton_width * formData.carton_height) / 1000000).toFixed(4);
    }
    return "0.0000";
  }, [formData.carton_length, formData.carton_width, formData.carton_height]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{editingPacking ? "Edit Packing Detail" : "Create Packing Detail"}</DialogTitle>
          <DialogDescription>
            Create or edit packing specifications
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <Label htmlFor="shipment_id">
                Shipment <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.shipment_id}
                onValueChange={(value) => setFormData({ ...formData, shipment_id: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select shipment" />
                </SelectTrigger>
                <SelectContent>
                  {deliverySchedules.map((ds: any) => (
                    <SelectItem key={ds.shipment_id} value={ds.shipment_id}>
                      {ds.shipment_id} - {ds.shipment_date}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="carton_length">Carton Length (cm)</Label>
              <Input
                id="carton_length"
                type="number"
                value={formData.carton_length}
                onChange={(e) => setFormData({ ...formData, carton_length: parseFloat(e.target.value) || 0 })}
                step="0.01"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="carton_width">Carton Width (cm)</Label>
              <Input
                id="carton_width"
                type="number"
                value={formData.carton_width}
                onChange={(e) => setFormData({ ...formData, carton_width: parseFloat(e.target.value) || 0 })}
                step="0.01"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="carton_height">Carton Height (cm)</Label>
              <Input
                id="carton_height"
                type="number"
                value={formData.carton_height}
                onChange={(e) => setFormData({ ...formData, carton_height: parseFloat(e.target.value) || 0 })}
                step="0.01"
              />
            </div>
            <div className="space-y-2">
              <Label>CBM (Auto-calculated)</Label>
              <Input value={cbm} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cartons_per_pallet">Cartons per Pallet</Label>
              <Input
                id="cartons_per_pallet"
                type="number"
                value={formData.cartons_per_pallet}
                onChange={(e) => setFormData({ ...formData, cartons_per_pallet: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pieces_per_carton">Pieces per Carton</Label>
              <Input
                id="pieces_per_carton"
                type="number"
                value={formData.pieces_per_carton}
                onChange={(e) => setFormData({ ...formData, pieces_per_carton: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {editingPacking ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>{editingPacking ? "Update" : "Create"} Packing</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ========== ORDER BREAKDOWN DIALOG ==========
function OrderBreakdownDialog({
  open,
  onOpenChange,
  editingBreakdown,
  deliverySchedules,
  styleVariants,
  onSubmit,
  isLoading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingBreakdown: any;
  deliverySchedules: any[];
  styleVariants: any[];
  onSubmit: (data: any) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    shipment_id: "",
    style_variant_id: "",
    order_quantity: 0,
    tolerance_quantity: 0,
    unit_price: 0,
    status: "Pending",
  });

  useEffect(() => {
    if (editingBreakdown) {
      setFormData({
        shipment_id: editingBreakdown.shipment_id || "",
        style_variant_id: editingBreakdown.style_variant_id || "",
        order_quantity: editingBreakdown.order_quantity || 0,
        tolerance_quantity: editingBreakdown.tolerance_quantity || 0,
        unit_price: editingBreakdown.unit_price || 0,
        status: editingBreakdown.status || "Pending",
      });
    } else {
      setFormData({
        shipment_id: "",
        style_variant_id: "",
        order_quantity: 0,
        tolerance_quantity: 0,
        unit_price: 0,
        status: "Pending",
      });
    }
  }, [editingBreakdown, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{editingBreakdown ? "Edit Order Breakdown" : "Create Order Breakdown"}</DialogTitle>
          <DialogDescription>
            Create or edit order breakdown by style variant
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="shipment_id">
                Shipment <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.shipment_id}
                onValueChange={(value) => setFormData({ ...formData, shipment_id: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select shipment" />
                </SelectTrigger>
                <SelectContent>
                  {deliverySchedules.map((ds: any) => (
                    <SelectItem key={ds.shipment_id} value={ds.shipment_id}>
                      {ds.shipment_id} - {ds.shipment_date}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="style_variant_id">
                Style Variant <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.style_variant_id}
                onValueChange={(value) => setFormData({ ...formData, style_variant_id: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select style variant" />
                </SelectTrigger>
                <SelectContent>
                  {styleVariants.map((sv: any) => (
                    <SelectItem key={sv.style_variant_id} value={sv.style_variant_id}>
                      {sv.variant_name || sv.style_variant_id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="order_quantity">
                Order Quantity <span className="text-destructive">*</span>
              </Label>
              <Input
                id="order_quantity"
                type="number"
                value={formData.order_quantity}
                onChange={(e) => setFormData({ ...formData, order_quantity: parseInt(e.target.value) || 0 })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tolerance_quantity">Tolerance Quantity</Label>
              <Input
                id="tolerance_quantity"
                type="number"
                value={formData.tolerance_quantity}
                onChange={(e) => setFormData({ ...formData, tolerance_quantity: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit_price">Unit Price ($)</Label>
              <Input
                id="unit_price"
                type="number"
                value={formData.unit_price}
                onChange={(e) => setFormData({ ...formData, unit_price: parseFloat(e.target.value) || 0 })}
                step="0.01"
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
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="In Production">In Production</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Shipped">Shipped</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {editingBreakdown ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>{editingBreakdown ? "Update" : "Create"} Breakdown</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ========== MAIN PAGE COMPONENT ==========
export default function OrderManagementPage() {
  // Show Under Development overlay - wrapper with relative positioning
  return (
    <div className="relative min-h-[calc(100vh-120px)]">
      <UnderDevelopment
        title="Order Management"
        message="The Order Management feature is currently under development and will be available soon."
      />
      <OrderManagementContent />
    </div>
  );
}

function OrderManagementContent() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("contracts");

  // Dialog states
  const [contractDialogOpen, setContractDialogOpen] = useState(false);
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [packingDialogOpen, setPackingDialogOpen] = useState(false);
  const [breakdownDialogOpen, setBreakdownDialogOpen] = useState(false);

  // Editing states
  const [editingContract, setEditingContract] = useState<any>(null);
  const [editingOrder, setEditingOrder] = useState<any>(null);
  const [editingSchedule, setEditingSchedule] = useState<any>(null);
  const [editingPacking, setEditingPacking] = useState<any>(null);
  const [editingBreakdown, setEditingBreakdown] = useState<any>(null);

  // Filter states
  const [selectedContractId, setSelectedContractId] = useState<string>("all");
  const [selectedOrderId, setSelectedOrderId] = useState<string>("all");
  const [selectedShipmentId, setSelectedShipmentId] = useState<string>("all");

  // ========== FETCH DATA ==========
  // Fetch Buyers
  const { data: buyersData } = useQuery({
    queryKey: ["buyers"],
    queryFn: () => api.buyers.getAll(),
  });

  // Fetch Styles
  const { data: stylesData } = useQuery({
    queryKey: ["merchandiser", "styleCreation"],
    queryFn: () => api.merchandiser.styleCreation.getAll(),
  });

  // Fetch Style Variants
  const { data: styleVariantsData } = useQuery({
    queryKey: ["merchandiser", "styleVariants"],
    queryFn: () => api.merchandiser.styleVariants.getAll(),
  });


  // Fetch Sales Contracts
  const { data: contractsData, isLoading: contractsLoading } = useQuery({
    queryKey: ["merchandiser", "salesContracts"],
    queryFn: () => api.merchandiser.salesContracts.getAll(),
  });

  // Fetch Orders
  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ["merchandiser", "orders", selectedContractId],
    queryFn: () => api.merchandiser.orders.getAll(selectedContractId === "all" ? undefined : selectedContractId),
  });

  // Fetch Delivery Schedules
  const { data: schedulesData, isLoading: schedulesLoading } = useQuery({
    queryKey: ["merchandiser", "deliverySchedules", selectedOrderId],
    queryFn: () => api.merchandiser.deliverySchedules.getAll(selectedOrderId === "all" ? undefined : selectedOrderId),
  });

  // Fetch Packing Details
  const { data: packingData, isLoading: packingLoading } = useQuery({
    queryKey: ["merchandiser", "packingDetails", selectedShipmentId],
    queryFn: () => api.merchandiser.packingDetails.getAll(selectedShipmentId === "all" ? undefined : selectedShipmentId),
  });

  // Fetch Order Breakdowns
  const { data: breakdownsData, isLoading: breakdownsLoading } = useQuery({
    queryKey: ["merchandiser", "orderBreakdowns", selectedShipmentId],
    queryFn: () => api.merchandiser.orderBreakdowns.getAll(selectedShipmentId === "all" ? undefined : selectedShipmentId),
  });

  // Create buyer lookup map
  const buyerMap = useMemo(() => {
    if (!buyersData) return {};
    return buyersData.reduce((acc: any, buyer: any) => {
      acc[buyer.id] = buyer;
      return acc;
    }, {});
  }, [buyersData]);

  // ========== SALES CONTRACT MUTATIONS ==========
  const createContractMutation = useMutation({
    mutationFn: (data: any) => api.merchandiser.salesContracts.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchandiser", "salesContracts"] });
      toast.success("Sales contract created successfully");
      setContractDialogOpen(false);
      setEditingContract(null);
    },
    onError: (error: any) => toast.error(`Failed to create contract: ${error.message}`),
  });

  const updateContractMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.merchandiser.salesContracts.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchandiser", "salesContracts"] });
      toast.success("Sales contract updated successfully");
      setContractDialogOpen(false);
      setEditingContract(null);
    },
    onError: (error: any) => toast.error(`Failed to update contract: ${error.message}`),
  });

  const deleteContractMutation = useMutation({
    mutationFn: (id: string) => api.merchandiser.salesContracts.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchandiser", "salesContracts"] });
      toast.success("Sales contract deleted successfully");
    },
    onError: (error: any) => toast.error(`Failed to delete contract: ${error.message}`),
  });

  // ========== ORDER MUTATIONS ==========
  const createOrderMutation = useMutation({
    mutationFn: (data: any) => api.merchandiser.orders.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchandiser", "orders"] });
      queryClient.invalidateQueries({ queryKey: ["merchandiser", "salesContracts"] });
      toast.success("Order created successfully");
      setOrderDialogOpen(false);
      setEditingOrder(null);
    },
    onError: (error: any) => toast.error(`Failed to create order: ${error.message}`),
  });

  const updateOrderMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.merchandiser.orders.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchandiser", "orders"] });
      toast.success("Order updated successfully");
      setOrderDialogOpen(false);
      setEditingOrder(null);
    },
    onError: (error: any) => toast.error(`Failed to update order: ${error.message}`),
  });

  const deleteOrderMutation = useMutation({
    mutationFn: (id: string) => api.merchandiser.orders.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchandiser", "orders"] });
      queryClient.invalidateQueries({ queryKey: ["merchandiser", "salesContracts"] });
      toast.success("Order deleted successfully");
    },
    onError: (error: any) => toast.error(`Failed to delete order: ${error.message}`),
  });

  // ========== DELIVERY SCHEDULE MUTATIONS ==========
  const createScheduleMutation = useMutation({
    mutationFn: (data: any) => api.merchandiser.deliverySchedules.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchandiser", "deliverySchedules"] });
      toast.success("Delivery schedule created successfully");
      setScheduleDialogOpen(false);
      setEditingSchedule(null);
    },
    onError: (error: any) => toast.error(`Failed to create schedule: ${error.message}`),
  });

  const updateScheduleMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.merchandiser.deliverySchedules.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchandiser", "deliverySchedules"] });
      toast.success("Delivery schedule updated successfully");
      setScheduleDialogOpen(false);
      setEditingSchedule(null);
    },
    onError: (error: any) => toast.error(`Failed to update schedule: ${error.message}`),
  });

  const deleteScheduleMutation = useMutation({
    mutationFn: (id: string) => api.merchandiser.deliverySchedules.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchandiser", "deliverySchedules"] });
      toast.success("Delivery schedule deleted successfully");
    },
    onError: (error: any) => toast.error(`Failed to delete schedule: ${error.message}`),
  });

  // ========== PACKING DETAIL MUTATIONS ==========
  const createPackingMutation = useMutation({
    mutationFn: (data: any) => api.merchandiser.packingDetails.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchandiser", "packingDetails"] });
      toast.success("Packing detail created successfully");
      setPackingDialogOpen(false);
      setEditingPacking(null);
    },
    onError: (error: any) => toast.error(`Failed to create packing: ${error.message}`),
  });

  const updatePackingMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.merchandiser.packingDetails.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchandiser", "packingDetails"] });
      toast.success("Packing detail updated successfully");
      setPackingDialogOpen(false);
      setEditingPacking(null);
    },
    onError: (error: any) => toast.error(`Failed to update packing: ${error.message}`),
  });

  const deletePackingMutation = useMutation({
    mutationFn: (id: string) => api.merchandiser.packingDetails.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchandiser", "packingDetails"] });
      toast.success("Packing detail deleted successfully");
    },
    onError: (error: any) => toast.error(`Failed to delete packing: ${error.message}`),
  });

  // ========== ORDER BREAKDOWN MUTATIONS ==========
  const createBreakdownMutation = useMutation({
    mutationFn: (data: any) => api.merchandiser.orderBreakdowns.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchandiser", "orderBreakdowns"] });
      toast.success("Order breakdown created successfully");
      setBreakdownDialogOpen(false);
      setEditingBreakdown(null);
    },
    onError: (error: any) => toast.error(`Failed to create breakdown: ${error.message}`),
  });

  const updateBreakdownMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.merchandiser.orderBreakdowns.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchandiser", "orderBreakdowns"] });
      toast.success("Order breakdown updated successfully");
      setBreakdownDialogOpen(false);
      setEditingBreakdown(null);
    },
    onError: (error: any) => toast.error(`Failed to update breakdown: ${error.message}`),
  });

  const deleteBreakdownMutation = useMutation({
    mutationFn: (id: string) => api.merchandiser.orderBreakdowns.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchandiser", "orderBreakdowns"] });
      toast.success("Order breakdown deleted successfully");
    },
    onError: (error: any) => toast.error(`Failed to delete breakdown: ${error.message}`),
  });

  // ========== DELETE HANDLERS ==========
  const handleDeleteContract = (id: string) => {
    if (confirm("Are you sure you want to delete this sales contract?")) {
      deleteContractMutation.mutate(id);
    }
  };

  const handleDeleteOrder = (id: string) => {
    if (confirm("Are you sure you want to delete this order?")) {
      deleteOrderMutation.mutate(id);
    }
  };

  const handleDeleteSchedule = (id: string) => {
    if (confirm("Are you sure you want to delete this delivery schedule?")) {
      deleteScheduleMutation.mutate(id);
    }
  };

  const handleDeletePacking = (id: string) => {
    if (confirm("Are you sure you want to delete this packing detail?")) {
      deletePackingMutation.mutate(id);
    }
  };

  const handleDeleteBreakdown = (id: string) => {
    if (confirm("Are you sure you want to delete this order breakdown?")) {
      deleteBreakdownMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard/erp/merchandising")}
            className="mb-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Merchandising
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Order Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage sales contracts, orders, delivery schedules, packing, and breakdowns
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="contracts" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Sales Contracts
            {contractsData && (
              <Badge variant="secondary" className="ml-1">
                {contractsData.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Orders
            {ordersData && (
              <Badge variant="secondary" className="ml-1">
                {ordersData.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="delivery" className="flex items-center gap-2">
            <Truck className="h-4 w-4" />
            Delivery
            {schedulesData && (
              <Badge variant="secondary" className="ml-1">
                {schedulesData.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="packing" className="flex items-center gap-2">
            <Box className="h-4 w-4" />
            Packing
            {packingData && (
              <Badge variant="secondary" className="ml-1">
                {packingData.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="breakdown" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            Breakdown
            {breakdownsData && (
              <Badge variant="secondary" className="ml-1">
                {breakdownsData.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* SALES CONTRACTS TAB */}
        <TabsContent value="contracts">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Sales Contract Summary</CardTitle>
                  <CardDescription>
                    Manage sales contracts with buyers
                  </CardDescription>
                </div>
                <Button
                  onClick={() => {
                    setEditingContract(null);
                    setContractDialogOpen(true);
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Contract
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {contractsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : contractsData && contractsData.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Contract ID</TableHead>
                      <TableHead>Contract No</TableHead>
                      <TableHead>Buyer</TableHead>
                      <TableHead>Total Qty</TableHead>
                      <TableHead>Total Value</TableHead>
                      <TableHead>No. of POs</TableHead>
                      <TableHead>Amendment</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contractsData.map((contract: any) => (
                      <TableRow key={contract.sales_contract_id}>
                        <TableCell className="font-medium">{contract.sales_contract_id}</TableCell>
                        <TableCell>{contract.sales_contract_no}</TableCell>
                        <TableCell>
                          {buyerMap[contract.buyer_id]?.brand_name || `ID: ${contract.buyer_id}`}
                        </TableCell>
                        <TableCell>{contract.total_order_quantity?.toLocaleString() || 0}</TableCell>
                        <TableCell>${contract.total_order_value?.toLocaleString() || 0}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{contract.no_of_po || 0}</Badge>
                        </TableCell>
                        <TableCell>{contract.amendment_no || 0}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingContract(contract);
                              setContractDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteContract(contract.sales_contract_id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No sales contracts found. Click "Add Contract" to create one.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ORDERS TAB */}
        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Order Primary Info</CardTitle>
                  <CardDescription>
                    Manage purchase orders and their details
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Select value={selectedContractId} onValueChange={setSelectedContractId}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Filter by Contract" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Contracts</SelectItem>
                      {contractsData?.map((contract: any) => (
                        <SelectItem key={contract.sales_contract_id} value={contract.sales_contract_id}>
                          {contract.sales_contract_no}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={() => {
                      setEditingOrder(null);
                      setOrderDialogOpen(true);
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Order
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {ordersLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : ordersData && ordersData.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Order Number</TableHead>
                      <TableHead>Buyer</TableHead>
                      <TableHead>Order Date</TableHead>
                      <TableHead>SCL PO</TableHead>
                      <TableHead>Tolerance</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ordersData.map((order: any) => (
                      <TableRow key={order.order_id}>
                        <TableCell className="font-medium">{order.order_id}</TableCell>
                        <TableCell>{order.order_number}</TableCell>
                        <TableCell>
                          {buyerMap[order.buyer_id]?.brand_name || `ID: ${order.buyer_id}`}
                        </TableCell>
                        <TableCell>
                          {order.order_date ? format(new Date(order.order_date), "yyyy-MM-dd") : "-"}
                        </TableCell>
                        <TableCell>{order.scl_po || "-"}</TableCell>
                        <TableCell>
                          {order.allow_tolerance ? (
                            <Badge variant="secondary">{order.tolerance_percent}%</Badge>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingOrder(order);
                              setOrderDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteOrder(order.order_id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No orders found. Click "Add Order" to create one.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* DELIVERY SCHEDULE TAB */}
        <TabsContent value="delivery">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Delivery Schedule</CardTitle>
                  <CardDescription>
                    Manage shipment schedules and destinations
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Select value={selectedOrderId} onValueChange={setSelectedOrderId}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Filter by Order" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Orders</SelectItem>
                      {ordersData?.map((order: any) => (
                        <SelectItem key={order.order_id} value={order.order_id}>
                          {order.order_number}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={() => {
                      setEditingSchedule(null);
                      setScheduleDialogOpen(true);
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Schedule
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {schedulesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : schedulesData && schedulesData.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Shipment ID</TableHead>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Shipment Date</TableHead>
                      <TableHead>Destination</TableHead>
                      <TableHead>Incoterms</TableHead>
                      <TableHead>Freight</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {schedulesData.map((schedule: any) => (
                      <TableRow key={schedule.shipment_id}>
                        <TableCell className="font-medium">{schedule.shipment_id}</TableCell>
                        <TableCell>{schedule.order_id}</TableCell>
                        <TableCell>
                          {schedule.shipment_date ? format(new Date(schedule.shipment_date), "yyyy-MM-dd") : "-"}
                        </TableCell>
                        <TableCell>{schedule.destination_country || "-"}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{schedule.incoterms || "-"}</Badge>
                        </TableCell>
                        <TableCell>{schedule.freight_method || "-"}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingSchedule(schedule);
                              setScheduleDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteSchedule(schedule.shipment_id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No delivery schedules found. Click "Add Schedule" to create one.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* PACKING DETAILS TAB */}
        <TabsContent value="packing">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Packing Details</CardTitle>
                  <CardDescription>
                    Manage carton dimensions and packing specifications
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Select value={selectedShipmentId} onValueChange={setSelectedShipmentId}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Filter by Shipment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Shipments</SelectItem>
                      {schedulesData?.map((schedule: any) => (
                        <SelectItem key={schedule.shipment_id} value={schedule.shipment_id}>
                          {schedule.shipment_id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={() => {
                      setEditingPacking(null);
                      setPackingDialogOpen(true);
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Packing
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {packingLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : packingData && packingData.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Pack ID</TableHead>
                      <TableHead>Shipment ID</TableHead>
                      <TableHead>Dimensions (L x W x H)</TableHead>
                      <TableHead>CBM</TableHead>
                      <TableHead>Cartons/Pallet</TableHead>
                      <TableHead>Pieces/Carton</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {packingData.map((pack: any) => (
                      <TableRow key={pack.pack_id}>
                        <TableCell className="font-medium">{pack.pack_id}</TableCell>
                        <TableCell>{pack.shipment_id}</TableCell>
                        <TableCell>
                          {pack.carton_length} x {pack.carton_width} x {pack.carton_height} cm
                        </TableCell>
                        <TableCell>{pack.cbm?.toFixed(4) || "-"}</TableCell>
                        <TableCell>{pack.cartons_per_pallet || "-"}</TableCell>
                        <TableCell>{pack.pieces_per_carton || "-"}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingPacking(pack);
                              setPackingDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeletePacking(pack.pack_id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No packing details found. Click "Add Packing" to create one.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ORDER BREAKDOWN TAB */}
        <TabsContent value="breakdown">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Order Breakdown</CardTitle>
                  <CardDescription>
                    Breakdown by style variant with quantities and pricing
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Select value={selectedShipmentId} onValueChange={setSelectedShipmentId}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Filter by Shipment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Shipments</SelectItem>
                      {schedulesData?.map((schedule: any) => (
                        <SelectItem key={schedule.shipment_id} value={schedule.shipment_id}>
                          {schedule.shipment_id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={() => {
                      setEditingBreakdown(null);
                      setBreakdownDialogOpen(true);
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Breakdown
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {breakdownsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : breakdownsData && breakdownsData.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Breakdown ID</TableHead>
                      <TableHead>Shipment ID</TableHead>
                      <TableHead>Style Variant</TableHead>
                      <TableHead>Order Qty</TableHead>
                      <TableHead>Tolerance Qty</TableHead>
                      <TableHead>Unit Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {breakdownsData.map((breakdown: any) => (
                      <TableRow key={breakdown.breakdown_id}>
                        <TableCell className="font-medium">{breakdown.breakdown_id}</TableCell>
                        <TableCell>{breakdown.shipment_id}</TableCell>
                        <TableCell>{breakdown.style_variant_id}</TableCell>
                        <TableCell>{breakdown.order_quantity?.toLocaleString()}</TableCell>
                        <TableCell>{breakdown.tolerance_quantity || "-"}</TableCell>
                        <TableCell>${breakdown.unit_price?.toFixed(2) || "-"}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              breakdown.status === "Completed"
                                ? "default"
                                : breakdown.status === "In Production"
                                ? "secondary"
                                : breakdown.status === "Cancelled"
                                ? "destructive"
                                : "outline"
                            }
                          >
                            {breakdown.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingBreakdown(breakdown);
                              setBreakdownDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteBreakdown(breakdown.breakdown_id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No order breakdowns found. Click "Add Breakdown" to create one.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* DIALOGS */}
      <SalesContractDialog
        open={contractDialogOpen}
        onOpenChange={setContractDialogOpen}
        editingContract={editingContract}
        buyers={buyersData || []}
        onSubmit={(data) => {
          if (editingContract) {
            updateContractMutation.mutate({ id: editingContract.sales_contract_id, data });
          } else {
            createContractMutation.mutate(data);
          }
        }}
        isLoading={createContractMutation.isPending || updateContractMutation.isPending}
      />

      <OrderDialog
        open={orderDialogOpen}
        onOpenChange={setOrderDialogOpen}
        editingOrder={editingOrder}
        salesContracts={contractsData || []}
        buyers={buyersData || []}
        styles={stylesData || []}
        onSubmit={(data) => {
          if (editingOrder) {
            updateOrderMutation.mutate({ id: editingOrder.order_id, data });
          } else {
            createOrderMutation.mutate(data);
          }
        }}
        isLoading={createOrderMutation.isPending || updateOrderMutation.isPending}
      />

      <DeliveryScheduleDialog
        open={scheduleDialogOpen}
        onOpenChange={setScheduleDialogOpen}
        editingSchedule={editingSchedule}
        orders={ordersData || []}
        buyers={buyersData || []}
        onSubmit={(data) => {
          if (editingSchedule) {
            updateScheduleMutation.mutate({ id: editingSchedule.shipment_id, data });
          } else {
            createScheduleMutation.mutate(data);
          }
        }}
        isLoading={createScheduleMutation.isPending || updateScheduleMutation.isPending}
      />

      <PackingDetailDialog
        open={packingDialogOpen}
        onOpenChange={setPackingDialogOpen}
        editingPacking={editingPacking}
        deliverySchedules={schedulesData || []}
        onSubmit={(data) => {
          if (editingPacking) {
            updatePackingMutation.mutate({ id: editingPacking.pack_id, data });
          } else {
            createPackingMutation.mutate(data);
          }
        }}
        isLoading={createPackingMutation.isPending || updatePackingMutation.isPending}
      />

      <OrderBreakdownDialog
        open={breakdownDialogOpen}
        onOpenChange={setBreakdownDialogOpen}
        editingBreakdown={editingBreakdown}
        deliverySchedules={schedulesData || []}
        styleVariants={styleVariantsData || []}
        onSubmit={(data) => {
          if (editingBreakdown) {
            updateBreakdownMutation.mutate({ id: editingBreakdown.breakdown_id, data });
          } else {
            createBreakdownMutation.mutate(data);
          }
        }}
        isLoading={createBreakdownMutation.isPending || updateBreakdownMutation.isPending}
      />
    </div>
  );
}
