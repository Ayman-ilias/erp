"use client";

import React, { useState, useEffect, useMemo } from "react";
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
import { Badge } from "@/components/ui/badge";
import { X, Plus, Check } from "lucide-react";
import { toast } from "sonner";

// Predefined material options
const MATERIAL_OPTIONS = [
  "BCI COTTON",
  "COTTON",
  "ORGANIC COTTON",
  "RECYCLED COTTON",
  "POLYESTER",
  "RECYCLED POLYESTER",
  "NYLON",
  "POLYAMIDE",
  "ELASTANE",
  "SPANDEX",
  "VISCOSE",
  "RAYON",
  "MODAL",
  "TENCEL",
  "LYOCELL",
  "WOOL",
  "CASHMERE",
  "SILK",
  "LINEN",
  "BAMBOO",
  "ACRYLIC",
  "RECYCLED",
];

// Count system options
const COUNT_SYSTEMS = [
  { value: "Ne", label: "Ne (English)" },
  { value: "Nm", label: "Nm (Metric)" },
  { value: "Tex", label: "Tex" },
  { value: "Denier", label: "Denier" },
];

// Consumption unit options
const CONSUMPTION_UNITS = [
  { value: "g", label: "g (grams)" },
  { value: "kg", label: "kg" },
  { value: "oz", label: "oz (ounces)" },
  { value: "lb", label: "lb (pounds)" },
];

export interface CompositionItem {
  material: string;
  percentage: number;
}

export interface YarnCompositionData {
  composition: CompositionItem[];
  fiberCount: string;
  ply: string;
  countSystem: string;
  consumption: string;
  consumptionUnit: string;
}

interface YarnCompositionEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: YarnCompositionData;
  onSave: (data: YarnCompositionData) => void;
}

export function YarnCompositionEditor({
  open,
  onOpenChange,
  initialData,
  onSave,
}: YarnCompositionEditorProps) {
  const [composition, setComposition] = useState<CompositionItem[]>([
    { material: "", percentage: 100 },
  ]);
  const [fiberCount, setFiberCount] = useState("");
  const [ply, setPly] = useState("");
  const [countSystem, setCountSystem] = useState("Nm");
  const [consumption, setConsumption] = useState("");
  const [consumptionUnit, setConsumptionUnit] = useState("g");

  // Calculate total percentage
  const totalPercentage = useMemo(() => {
    return composition.reduce((sum, item) => sum + (item.percentage || 0), 0);
  }, [composition]);

  // Load initial data
  useEffect(() => {
    if (initialData) {
      setComposition(
        initialData.composition.length > 0
          ? initialData.composition
          : [{ material: "", percentage: 100 }]
      );
      setFiberCount(initialData.fiberCount || "");
      setPly(initialData.ply || "");
      setCountSystem(initialData.countSystem || "Nm");
      setConsumption(initialData.consumption || "");
      setConsumptionUnit(initialData.consumptionUnit || "g");
    } else {
      // Reset to defaults
      setComposition([{ material: "", percentage: 100 }]);
      setFiberCount("");
      setPly("");
      setCountSystem("Nm");
      setConsumption("");
      setConsumptionUnit("g");
    }
  }, [initialData, open]);

  const handleAddMaterial = () => {
    setComposition([...composition, { material: "", percentage: 0 }]);
  };

  const handleRemoveMaterial = (index: number) => {
    if (composition.length > 1) {
      const newComposition = composition.filter((_, i) => i !== index);
      setComposition(newComposition);
    }
  };

  const handleMaterialChange = (index: number, material: string) => {
    const newComposition = [...composition];
    newComposition[index].material = material;
    setComposition(newComposition);
  };

  const handlePercentageChange = (index: number, percentage: number) => {
    const newComposition = [...composition];
    newComposition[index].percentage = percentage;
    setComposition(newComposition);
  };

  const handleSave = () => {
    // Validate
    const validComposition = composition.filter((c) => c.material && c.percentage > 0);
    if (validComposition.length === 0) {
      toast.error("Please add at least one material with percentage");
      return;
    }

    const total = validComposition.reduce((sum, item) => sum + item.percentage, 0);
    if (total !== 100) {
      toast.error(`Total percentage must be 100%. Current: ${total}%`);
      return;
    }

    onSave({
      composition: validComposition,
      fiberCount,
      ply,
      countSystem,
      consumption,
      consumptionUnit,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Yarn Composition</DialogTitle>
          <DialogDescription>
            Define the yarn composition with materials and percentages
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Materials Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">Material</Label>
              <Label className="text-sm font-semibold">Percentage</Label>
            </div>

            {composition.map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="flex-1">
                  <Select
                    value={item.material}
                    onValueChange={(value) => handleMaterialChange(index, value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select material..." />
                    </SelectTrigger>
                    <SelectContent>
                      {MATERIAL_OPTIONS.map((material) => (
                        <SelectItem key={material} value={material}>
                          {material}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-24">
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={item.percentage}
                    onChange={(e) =>
                      handlePercentageChange(index, parseFloat(e.target.value) || 0)
                    }
                    className="text-right"
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveMaterial(index)}
                  disabled={composition.length === 1}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddMaterial}
              className="w-full"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Material
            </Button>

            {/* Total Row */}
            <div className="flex items-center justify-between pt-2 border-t">
              <span className="text-sm font-semibold">Total</span>
              <Badge
                variant={totalPercentage === 100 ? "default" : "destructive"}
                className="text-sm"
              >
                {totalPercentage}%
              </Badge>
            </div>
          </div>

          {/* Fiber Yarn Count/Ply Section */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Fiber Yarn Count/Ply</Label>
            <div className="flex items-center gap-2">
              <Input
                type="text"
                value={fiberCount}
                onChange={(e) => setFiberCount(e.target.value)}
                placeholder="50"
                className="w-24"
              />
              <span className="text-muted-foreground">/</span>
              <Input
                type="text"
                value={ply}
                onChange={(e) => setPly(e.target.value)}
                placeholder="2"
                className="w-20"
              />
              <Select value={countSystem} onValueChange={setCountSystem}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COUNT_SYSTEMS.map((system) => (
                    <SelectItem key={system.value} value={system.value}>
                      {system.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Consumption Section */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Consumption</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                step="0.01"
                value={consumption}
                onChange={(e) => setConsumption(e.target.value)}
                placeholder="86.00"
                className="w-32"
              />
              <Select value={consumptionUnit} onValueChange={setConsumptionUnit}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONSUMPTION_UNITS.map((unit) => (
                    <SelectItem key={unit.value} value={unit.value}>
                      {unit.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave}>
            <Check className="mr-2 h-4 w-4" />
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Helper function to format composition for display
export function formatCompositionDisplay(data: YarnCompositionData | null): string {
  if (!data || !data.composition || data.composition.length === 0) {
    return "";
  }

  const compositionStr = data.composition
    .map((c) => `${c.percentage}% ${c.material}`)
    .join(" / ");

  const countStr =
    data.fiberCount && data.ply
      ? ` | ${data.fiberCount}/${data.ply} ${data.countSystem}`
      : "";

  const consumptionStr =
    data.consumption ? ` | ${data.consumption}${data.consumptionUnit}` : "";

  return compositionStr + countStr + consumptionStr;
}

// Helper function to parse composition from display string
export function parseCompositionFromString(str: string): YarnCompositionData | null {
  if (!str) return null;

  try {
    // Parse simple format like "50% BCI COTTON / 38% RECYCLED / 3% POLYAMIDE / 1% ELASTANE"
    const parts = str.split("|").map((p) => p.trim());
    const compositionPart = parts[0];

    const composition: CompositionItem[] = [];
    const materialParts = compositionPart.split("/").map((p) => p.trim());

    for (const part of materialParts) {
      const match = part.match(/(\d+(?:\.\d+)?)\s*%?\s*(.+)/);
      if (match) {
        composition.push({
          percentage: parseFloat(match[1]),
          material: match[2].trim().toUpperCase(),
        });
      }
    }

    return {
      composition,
      fiberCount: "",
      ply: "",
      countSystem: "Nm",
      consumption: "",
      consumptionUnit: "g",
    };
  } catch {
    return null;
  }
}
