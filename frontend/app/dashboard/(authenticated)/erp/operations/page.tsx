"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusIcon, Calculator } from "lucide-react";
import { toast } from "sonner";

interface Operation {
  id: number;
  operation_name: string;
  operation_code: string;
  department: string;
  machine_type: string;
  base_smv: number;
}

interface SMVSetting {
  id: number;
  style_category: string;
  base_smv: number;
  complexity_multiplier: number;
  total_smv: number;
}

export default function OperationsPage() {
  const [operations, setOperations] = useState<Operation[]>([]);
  const [smvSettings, setSmvSettings] = useState<SMVSetting[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [opsRes, smvRes] = await Promise.all([
        fetch("/api/v1/operations"),
        fetch("/api/v1/smv-settings")
      ]);
      setOperations(await opsRes.json());
      setSmvSettings(await smvRes.json());
    } catch (error) {
      toast.error("Failed to fetch data");
    }
  };

  const totalSMV = operations.reduce((sum, op) => sum + op.base_smv, 0);
  const avgSMV = operations.length > 0 ? totalSMV / operations.length : 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Operations & SMV Info</h1>
          <p className="text-muted-foreground mt-2">
            Manage operations, SMV values, and production standards
          </p>
        </div>
        <Button>
          <PlusIcon className="mr-2 h-4 w-4" />
          Add Operation
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Operations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{operations.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total SMV</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSMV.toFixed(2)} min</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Average SMV</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgSMV.toFixed(2)} min</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">SMV Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{smvSettings.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Operation Master</CardTitle>
          <CardDescription>All production operations with SMV values</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Operation Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Machine Type</TableHead>
                <TableHead>Base SMV (min)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {operations.map((op) => (
                <TableRow key={op.id}>
                  <TableCell className="font-mono">{op.operation_code}</TableCell>
                  <TableCell className="font-medium">{op.operation_name}</TableCell>
                  <TableCell>{op.department}</TableCell>
                  <TableCell>{op.machine_type}</TableCell>
                  <TableCell>{op.base_smv.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>SMV Settings by Style Category</CardTitle>
          <CardDescription>Standard minute values for different garment types</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Style Category</TableHead>
                <TableHead>Base SMV</TableHead>
                <TableHead>Complexity Multiplier</TableHead>
                <TableHead>Total SMV</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {smvSettings.map((setting) => (
                <TableRow key={setting.id}>
                  <TableCell className="font-medium">{setting.style_category}</TableCell>
                  <TableCell>{setting.base_smv.toFixed(2)}</TableCell>
                  <TableCell>{setting.complexity_multiplier}x</TableCell>
                  <TableCell className="font-semibold">{setting.total_smv.toFixed(2)} min</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon">
                      <Calculator className="h-4 w-4" />
                    </Button>
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
