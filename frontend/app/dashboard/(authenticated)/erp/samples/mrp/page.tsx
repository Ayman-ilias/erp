"use client";

import * as React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PackageIcon } from "lucide-react";

export default function MRPPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Material Requirement Planning</h1>
        <p className="text-muted-foreground">
          Manage yarn and material requirements for samples
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <PackageIcon className="h-6 w-6" />
            <CardTitle>MRP Module</CardTitle>
          </div>
          <CardDescription>
            Material planning features coming soon
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <PackageIcon className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Material Requirement Planning</h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              This module will help you manage:
            </p>
            <ul className="text-sm text-muted-foreground space-y-2 max-w-md mx-auto text-left">
              <li>• Yarn requirements and stock tracking</li>
              <li>• Trim and accessories planning</li>
              <li>• Material consumption calculations</li>
              <li>• Supplier requisitions</li>
              <li>• Stock availability checks</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
