"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, BarChart3, PieChart, TrendingUp, Users } from "lucide-react";

export default function ReportsPage() {
  const reports = [
    {
      title: "Production Report",
      description: "Daily/Monthly production summary by line",
      icon: BarChart3,
      color: "bg-blue-100 text-blue-700",
      lastGenerated: "2 hours ago"
    },
    {
      title: "Buyer Performance",
      description: "Order history and buyer statistics",
      icon: Users,
      color: "bg-green-100 text-green-700",
      lastGenerated: "1 day ago"
    },
    {
      title: "Style Analysis",
      description: "Style-wise production and costing",
      icon: PieChart,
      color: "bg-purple-100 text-purple-700",
      lastGenerated: "3 days ago"
    },
    {
      title: "Efficiency Report",
      description: "Line efficiency and SMV analysis",
      icon: TrendingUp,
      color: "bg-orange-100 text-orange-700",
      lastGenerated: "5 hours ago"
    },
    {
      title: "Inventory Report",
      description: "Stock levels and material consumption",
      icon: FileText,
      color: "bg-red-100 text-red-700",
      lastGenerated: "1 hour ago"
    },
    {
      title: "Quality Report",
      description: "Defect analysis and quality metrics",
      icon: FileText,
      color: "bg-yellow-100 text-yellow-700",
      lastGenerated: "4 hours ago"
    }
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
          <p className="text-muted-foreground mt-2">
            Generate and view various ERP reports
          </p>
        </div>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Export All
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {reports.map((report, index) => {
          const Icon = report.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className={`p-3 rounded-lg ${report.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
                <CardTitle className="mt-4">{report.title}</CardTitle>
                <CardDescription>{report.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Last generated: {report.lastGenerated}
                  </span>
                  <Button variant="ghost" size="sm">
                    <FileText className="mr-2 h-4 w-4" />
                    Generate
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Stats Overview</CardTitle>
          <CardDescription>Key metrics at a glance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">Total Production (Month)</p>
              <p className="text-2xl font-bold mt-2">45,250 pcs</p>
              <p className="text-xs text-green-600 mt-1">↑ 12% from last month</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">Active Orders</p>
              <p className="text-2xl font-bold mt-2">18</p>
              <p className="text-xs text-blue-600 mt-1">3 in production</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">Avg Efficiency</p>
              <p className="text-2xl font-bold mt-2">96.3%</p>
              <p className="text-xs text-green-600 mt-1">↑ 2.1% improvement</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">On-Time Delivery</p>
              <p className="text-2xl font-bold mt-2">94.5%</p>
              <p className="text-xs text-green-600 mt-1">Excellent performance</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Report Activity</CardTitle>
          <CardDescription>Latest generated reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Monthly Production Report - November 2025</p>
                  <p className="text-sm text-muted-foreground">Generated 2 hours ago</p>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                <Download className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Inventory Stock Report</p>
                  <p className="text-sm text-muted-foreground">Generated 1 hour ago</p>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                <Download className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Weekly Efficiency Analysis</p>
                  <p className="text-sm text-muted-foreground">Generated 5 hours ago</p>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
