"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Ruler,
  Scale,
  Hash,
  Layers,
  Waypoints,
  Package,
  Square,
  Beaker,
  Clock,
  HelpCircle,
} from "lucide-react";
import type { UoMCategoryWithUnits } from "@/hooks/use-uom";

// Icon mapping for categories
const iconMap: Record<string, React.ElementType> = {
  Ruler: Ruler,
  Scale: Scale,
  Hash: Hash,
  Layers: Layers,
  Waypoints: Waypoints,
  Package: Package,
  Square: Square,
  Beaker: Beaker,
  Clock: Clock,
};

interface UoMCategoryCardProps {
  category: UoMCategoryWithUnits;
  onClick?: () => void;
  isSelected?: boolean;
}

export function UoMCategoryCard({
  category,
  onClick,
  isSelected,
}: UoMCategoryCardProps) {
  const IconComponent = category.icon
    ? iconMap[category.icon] || HelpCircle
    : HelpCircle;

  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md hover:border-primary/50 ${
        isSelected ? "border-primary ring-2 ring-primary/20" : ""
      }`}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-start gap-4 pb-2">
        <div
          className={`p-3 rounded-lg ${
            isSelected ? "bg-primary text-primary-foreground" : "bg-primary/10"
          }`}
        >
          <IconComponent
            className={`h-6 w-6 ${isSelected ? "" : "text-primary"}`}
          />
        </div>
        <div className="flex-1 min-w-0">
          <CardTitle className="text-lg truncate">{category.uom_category}</CardTitle>
          <CardDescription className="text-xs line-clamp-2">
            {category.industry_use || category.uom_description || "No description"}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="text-xs">
            {category.unit_count} unit{category.unit_count !== 1 ? "s" : ""}
          </Badge>
          {category.base_unit && (
            <span className="text-xs text-muted-foreground">
              Base: <span className="font-medium">{category.base_unit}</span>
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
