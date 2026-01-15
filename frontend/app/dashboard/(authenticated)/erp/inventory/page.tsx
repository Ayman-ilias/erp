"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PlusIcon, Package, AlertTriangle } from "lucide-react";

export default function InventoryPage() {
  const inventory = [
    { id: 1, item: "Cotton Fabric - White", category: "Fabric", stock: 1500, unit: "yards", min_stock: 500, supplier: "Yarn Traders Ltd" },
    { id: 2, item: "Polyester Thread", category: "Trims", stock: 200, unit: "cones", min_stock: 100, supplier: "Thread Co" },
    { id: 3, item: "Metal Buttons", category: "Accessories", stock: 5000, unit: "pieces", min_stock: 1000, supplier: "Button Masters" },
    { id: 4, item: "Ribbing Fabric", category: "Fabric", stock: 300, unit: "yards", min_stock: 500, supplier: "Fabric Inc" },
  ];

  const lowStock = inventory.filter(item => item.stock < item.min_stock);
  const totalValue = inventory.reduce((sum, item) => sum + item.stock, 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Store & Inventory</h1>
          <p className="text-muted-foreground mt-2">
            Manage materials, fabrics, and accessories stock
          </p>
        </div>
        <Button>
          <PlusIcon className="mr-2 h-4 w-4" />
          Add Item
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventory.length}</div>
            <p className="text-xs text-muted-foreground mt-1">In inventory</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Low Stock Alert</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{lowStock.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Items below minimum</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Fabric Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {inventory.filter(i => i.category === "Fabric").reduce((sum, i) => sum + i.stock, 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Total yards</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(inventory.map(i => i.category)).size}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Item categories</p>
          </CardContent>
        </Card>
      </div>

      {lowStock.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <CardTitle className="text-red-900">Low Stock Alert</CardTitle>
            </div>
            <CardDescription className="text-red-700">
              {lowStock.length} item(s) below minimum stock level
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lowStock.map(item => (
                <div key={item.id} className="flex items-center justify-between p-2 bg-white rounded">
                  <span className="font-medium">{item.item}</span>
                  <span className="text-sm text-red-600">
                    {item.stock} {item.unit} (Min: {item.min_stock})
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Inventory Stock</CardTitle>
          <CardDescription>Current stock levels for all materials</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Current Stock</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Min Stock</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventory.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.item}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell className="font-semibold">{item.stock}</TableCell>
                  <TableCell>{item.unit}</TableCell>
                  <TableCell>{item.min_stock}</TableCell>
                  <TableCell>{item.supplier}</TableCell>
                  <TableCell className="text-right">
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      item.stock < item.min_stock ? 'bg-red-100 text-red-700' :
                      item.stock < item.min_stock * 1.5 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {item.stock < item.min_stock ? 'Low' :
                       item.stock < item.min_stock * 1.5 ? 'Medium' : 'Good'}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
