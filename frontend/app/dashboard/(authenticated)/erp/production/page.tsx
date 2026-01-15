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
import { CalendarIcon, PlusIcon, Users, Zap } from "lucide-react";

export default function ProductionPage() {
  const productionLines = [
    { line: "Line 01", order: "ORD-001", style: "POLO-001", target: 500, actual: 450, efficiency: 90 },
    { line: "Line 02", order: "ORD-002", style: "SWTR-001", target: 400, actual: 380, efficiency: 95 },
    { line: "Line 03", order: "ORD-001", style: "POLO-001", target: 500, actual: 520, efficiency: 104 },
  ];

  const totalTarget = productionLines.reduce((sum, line) => sum + line.target, 0);
  const totalActual = productionLines.reduce((sum, line) => sum + line.actual, 0);
  const avgEfficiency = productionLines.reduce((sum, line) => sum + line.efficiency, 0) / productionLines.length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Production Planning</h1>
          <p className="text-muted-foreground mt-2">
            Plan and monitor production lines and daily output
          </p>
        </div>
        <Button>
          <PlusIcon className="mr-2 h-4 w-4" />
          Plan Production
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active Lines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{productionLines.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Production lines</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Daily Target</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTarget}</div>
            <p className="text-xs text-muted-foreground mt-1">Pieces per day</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Actual Output</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalActual}</div>
            <p className="text-xs text-muted-foreground mt-1">Pieces produced</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Avg Efficiency</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{avgEfficiency.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground mt-1">Overall performance</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Production Line Status</CardTitle>
          <CardDescription>Real-time production monitoring</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Line</TableHead>
                <TableHead>Order ID</TableHead>
                <TableHead>Style</TableHead>
                <TableHead>Target (pcs/day)</TableHead>
                <TableHead>Actual Output</TableHead>
                <TableHead>Efficiency</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {productionLines.map((line) => (
                <TableRow key={line.line}>
                  <TableCell className="font-medium">{line.line}</TableCell>
                  <TableCell>{line.order}</TableCell>
                  <TableCell>{line.style}</TableCell>
                  <TableCell>{line.target}</TableCell>
                  <TableCell className="font-semibold">{line.actual}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-20 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${line.efficiency >= 100 ? 'bg-green-500' : line.efficiency >= 90 ? 'bg-blue-500' : 'bg-yellow-500'}`}
                          style={{width: `${Math.min(line.efficiency, 100)}%`}}
                        />
                      </div>
                      <span className="text-sm font-medium">{line.efficiency}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      line.efficiency >= 100 ? 'bg-green-100 text-green-700' :
                      line.efficiency >= 90 ? 'bg-blue-100 text-blue-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {line.efficiency >= 100 ? 'Excellent' : line.efficiency >= 90 ? 'Good' : 'Fair'}
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
