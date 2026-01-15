"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  Package,
  Ruler,
  Palette,
  ClipboardList,
  LineChart,
  Layers,
} from "lucide-react";

export default function MerchandisingDashboard() {
  const router = useRouter();

  const sections = [
    {
      title: "Material Details",
      description: "Manage yarn, fabric, trims, accessories, finished goods & packing",
      icon: Package,
      color: "bg-emerald-500",
      href: "/dashboard/erp/merchandising/material-details",
      items: [
        "Yarn Details",
        "Fabric Details",
        "Trims Details",
        "Accessories Details",
        "Finished Good Details",
        "Packing Good Details",
      ],
    },
    {
      title: "Size Details",
      description: "Size chart management and specifications",
      icon: Ruler,
      color: "bg-blue-500",
      href: "/dashboard/erp/merchandising/size-details",
      items: ["Size Chart"],
    },
    {
      title: "Sample Development",
      description: "Sample primary info, TNA, and status tracking",
      icon: ClipboardList,
      color: "bg-purple-500",
      href: "/dashboard/erp/merchandising/sample-development",
      items: ["Sample Primary Info", "Sample TNA - Color Wise", "Sample Status"],
    },
    {
      title: "Style Management",
      description: "Style creation from samples and material details",
      icon: Palette,
      color: "bg-pink-500",
      href: "/dashboard/erp/merchandising/style-management",
      items: ["Style Creation from Sample", "Style Basic Info", "Style Material Details"],
    },
    {
      title: "Style Variants",
      description: "Add style colors and manage variants",
      icon: Layers,
      color: "bg-orange-500",
      href: "/dashboard/erp/merchandising/style-variants",
      items: ["Add Style Color", "Style Variant Management"],
    },
    {
      title: "CM Calculation",
      description: "Cost of manufacturing calculations",
      icon: LineChart,
      color: "bg-teal-500",
      href: "/dashboard/erp/merchandising/cm-calculation",
      items: ["Calculate CM", "View CM History"],
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Merchandising Department</h1>
        <p className="text-muted-foreground mt-2">
          Manage materials, samples, styles, and costing for garment production
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <Card
              key={section.title}
              className="cursor-pointer transition-all hover:shadow-lg hover:scale-105"
              onClick={() => router.push(section.href)}
            >
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className={`${section.color} p-3 rounded-lg`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{section.title}</CardTitle>
                    <CardDescription className="text-sm mt-1">
                      {section.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {section.items.map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Button className="w-full mt-4" variant="outline">
                  Access Module
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle>Quick Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Active Styles</p>
              <p className="text-2xl font-bold">--</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Samples In Progress</p>
              <p className="text-2xl font-bold">--</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Material Types</p>
              <p className="text-2xl font-bold">--</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Pending Approvals</p>
              <p className="text-2xl font-bold">--</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

