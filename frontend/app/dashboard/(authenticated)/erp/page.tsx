"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, Package, Settings, FileText, Shield } from "lucide-react";
import { APP_CONFIG } from "@/lib/config";

export default function ERPDashboard() {
  return (
    <div className="flex flex-col gap-8 p-6 max-w-6xl mx-auto">
      {/* Welcome Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Welcome to {APP_CONFIG.NAME} {APP_CONFIG.DESCRIPTION}
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Complete enterprise resource planning for ready-made garment manufacturing.
          Use the navigation menu on the left to access different modules.
        </p>
      </div>

      {/* Quick Start Guide */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-600" />
            Getting Started Guide
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1 */}
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
              1
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Set Up Clients
              </h3>
              <p className="text-sm text-muted-foreground">
                Start by adding your <strong>Buyers</strong> and <strong>Suppliers</strong> in the Clients section.
                Include contact information, shipping addresses, and banking details for smooth operations.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold">
              2
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Package className="h-4 w-4" />
                Create Style Information
              </h3>
              <p className="text-sm text-muted-foreground">
                Navigate to <strong>Style Info</strong> to create garment styles, add color variants,
                and define required materials with accurate consumption data for costing.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
              3
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Manage Samples & Orders
              </h3>
              <p className="text-sm text-muted-foreground">
                Use the <strong>Sample Department</strong> to track sample development with TNA and operations.
                Once approved, create <strong>Orders</strong> to manage bulk production and delivery schedules.
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
              4
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Configure Operations
              </h3>
              <p className="text-sm text-muted-foreground">
                Set up <strong>Operations & SMV</strong> values for production planning.
                Use <strong>Production Planning</strong> to schedule activities and <strong>Store & Inventory</strong> to track materials.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-purple-600" />
            System Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">📋 Best Practices</h4>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Always save your work before navigating away</li>
                <li>• Use the sidebar navigation to access different modules</li>
                <li>• Keep buyer and supplier information up to date</li>
                <li>• Review reports regularly to track performance</li>
                <li>• Use filters and search to find data quickly</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-sm">⚡ Quick Tips</h4>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Click on any table row to view detailed information</li>
                <li>• Use the export feature to download data as needed</li>
                <li>• Set up styles before creating samples</li>
                <li>• Track sample operations for accurate SMV calculation</li>
                <li>• Regular backups ensure data safety</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-sm">🔒 Data Security</h4>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Your data is automatically backed up daily</li>
                <li>• All connections are secure and encrypted</li>
                <li>• Change your password regularly</li>
                <li>• Log out when leaving your workstation</li>
                <li>• Contact admin for access control issues</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-sm">📞 Need Help?</h4>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Explore each module using the sidebar menu</li>
                <li>• Hover over buttons to see tooltips</li>
                <li>• Check the documentation for detailed guides</li>
                <li>• Contact your system administrator for support</li>
                <li>• Report any issues immediately</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Important Notice */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-xl">💡</span>
              </div>
            </div>
            <div className="flex-1">
              <h4 className="font-semibold mb-2">System Performance Optimized</h4>
              <p className="text-sm text-muted-foreground">
                This system has been optimized to handle <strong>200-250+ concurrent users</strong> with
                <strong> millions of data records</strong>. Your data is safe with automated daily backups
                and persistent storage. The system features advanced caching for faster response times.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
