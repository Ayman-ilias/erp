"use client";

import * as React from "react";
import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Database, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { settingsService } from "@/services/api";
import { toast } from "sonner";
import {
  Building2,
  MapPin,
  Users,
  ShieldCheck,
  BookOpen,
  CircleDollarSign,
  Percent,
  Network,
  Ruler,
  Palette,
  Warehouse,
  Hash,
  CalendarDays,
  Globe,
  Clock,
} from "lucide-react";

const settingsModules = [
  {
    title: "Company Profile",
    description: "Manage company information, logo, and contact details",
    href: "/dashboard/erp/settings/company-profile",
    icon: Building2,
  },
  {
    title: "Branches",
    description: "Configure branch offices and locations",
    href: "/dashboard/erp/settings/branches",
    icon: MapPin,
  },
  {
    title: "Users",
    description: "Manage user accounts and credentials",
    href: "/dashboard/erp/settings/users",
    icon: Users,
  },
  {
    title: "Roles & Permissions",
    description: "Define roles and assign permissions",
    href: "/dashboard/erp/settings/roles",
    icon: ShieldCheck,
  },
  {
    title: "Chart of Accounts",
    description: "Set up financial accounts structure",
    href: "/dashboard/erp/settings/accounts",
    icon: BookOpen,
  },
  {
    title: "Currencies",
    description: "Configure currencies and exchange rates",
    href: "/dashboard/erp/settings/currencies",
    icon: CircleDollarSign,
  },
  {
    title: "Taxes",
    description: "Define tax rates and configurations",
    href: "/dashboard/erp/settings/taxes",
    icon: Percent,
  },
  {
    title: "Departments",
    description: "Manage organizational departments",
    href: "/dashboard/erp/settings/departments",
    icon: Network,
  },
  {
    title: "Units of Measure",
    description: "Configure measurement units and categories",
    href: "/dashboard/erp/settings/uom",
    icon: Ruler,
  },
  {
    title: "Colour Master",
    description: "Manage color families, values, and master colors",
    href: "/dashboard/erp/settings/colors",
    icon: Palette,
  },
  {
    title: "Warehouses",
    description: "Configure warehouse locations and settings",
    href: "/dashboard/erp/settings/warehouses",
    icon: Warehouse,
  },
  {
    title: "Document Numbering",
    description: "Set up document numbering sequences",
    href: "/dashboard/erp/settings/document-numbering",
    icon: Hash,
  },
  {
    title: "Fiscal Year",
    description: "Manage fiscal year periods",
    href: "/dashboard/erp/settings/fiscal-year",
    icon: CalendarDays,
  },
  {
    title: "Country Master",
    description: "Manage countries, cities, and ports",
    href: "/dashboard/erp/settings/countries",
    icon: Globe,
  },
  {
    title: "Per Minute Value",
    description: "Configure per minute value rates",
    href: "/dashboard/erp/settings/per-minute-value",
    icon: Clock,
  },
];

export default function SettingsPage() {
  const { user, token } = useAuth();
  const [isSeeding, setIsSeeding] = useState(false);

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

  const handleSeedData = async () => {
    if (!token) {
      toast.error("Authentication required");
      return;
    }

    setIsSeeding(true);
    try {
      const data = await settingsService.seed(token);
      toast.success("Seed data completed successfully!", {
        description: `Created: ${JSON.stringify(data.results, null, 2)}`,
      });
    } catch (error: any) {
      console.error("Seed error:", error);
      toast.error("Failed to seed data", {
        description: error?.message || error?.detail || "Unknown error occurred",
      });
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Basic Settings</h1>
          <p className="text-muted-foreground">
            Configure and manage your ERP system settings
          </p>
        </div>
        <Button
          onClick={handleSeedData}
          disabled={isSeeding}
          variant="outline"
          className="flex items-center gap-2"
        >
          {isSeeding ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Seeding...
            </>
          ) : (
            <>
              <Database className="h-4 w-4" />
              Seed Initial Data
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {settingsModules.map((module) => (
          <Link key={module.href} href={module.href}>
            <Card className="h-full hover:bg-muted/50 transition-colors cursor-pointer">
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <module.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">{module.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>{module.description}</CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
