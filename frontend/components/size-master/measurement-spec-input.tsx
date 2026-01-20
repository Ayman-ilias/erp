"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { useUnitsForSelector, useConvertUnits, type UnitForSelector } from "@/hooks/use-units";

export interface MeasurementSpec {
  id?: number;
  measurement_name: string;
  measurement_code?: string;
  value: string;
  unit_symbol: string;
  unit_name: string;
  tolerance_plus?: number;
  tolerance_minus?: number;
  notes?: string;
  display_order?: number;
  is_custom?: boolean;
  measurement_spec_id?: number;
  original_value?: number;
  original_unit?: string;
}

interface MeasurementSpecInputProps {
  measurements: MeasurementSpec[];
  onMeasurementsChange: (measurements: MeasurementSpec[]) => void;
  predefinedMeasurements?: string[]; // From garment type
  disabled?: boolean;
}

export function MeasurementSpecInput({
  measurements,
  onMeasurementsChange,
  predefinedMeasurements = [],
  disabled = false,
}: MeasurementSpecInputProps) {
  // Get length units for measurements (assuming most garment measurements are length-based)
  const { data: lengthUnits = [] } = useUnitsForSelector(undefined, "Length");
  const convertMutation = useConvertUnits();

  // Add predefined measurements that aren't already in the list
  useEffect(() => {
    if (predefinedMeasurements.length > 0) {
      const existingNames = measurements.map(m => m.measurement_name.toLowerCase());
      const newMeasurements = predefinedMeasurements
        .filter(name => !existingNames.includes(name.toLowerCase()))
        .map(name => ({
          measurement_name: name,
          value: "",
          unit_symbol: "cm",
          unit_name: "Centimeter",
          notes: "",
        }));

      if (newMeasurements.length > 0) {
        onMeasurementsChange([...measurements, ...newMeasurements]);
      }
    }
  }, [predefinedMeasurements, measurements, onMeasurementsChange]);

  const handleMeasurementChange = (index: number, field: keyof MeasurementSpec, value: string) => {
    const updated = [...measurements];
    updated[index] = { ...updated[index], [field]: value };

    // If unit changes, update unit_name
    if (field === "unit_symbol") {
      const unit = (lengthUnits as UnitForSelector[]).find(u => u.symbol === value);
      if (unit) {
        updated[index].unit_name = unit.name;
      }
    }

    onMeasurementsChange(updated);
  };

  const handleAddMeasurement = () => {
    const newMeasurement: MeasurementSpec = {
      measurement_name: "",
      value: "",
      unit_symbol: "cm",
      unit_name: "Centimeter",
      notes: "",
    };
    onMeasurementsChange([...measurements, newMeasurement]);
  };

  const handleRemoveMeasurement = (index: number) => {
    const updated = measurements.filter((_, i) => i !== index);
    onMeasurementsChange(updated);
  };

  const handleConvertValue = async (index: number, newUnitSymbol: string) => {
    const measurement = measurements[index];
    if (!measurement.value || !measurement.unit_symbol || measurement.unit_symbol === newUnitSymbol) {
      return;
    }

    try {
      const result = await convertMutation.mutateAsync({
        value: parseFloat(measurement.value),
        from_unit_symbol: measurement.unit_symbol,
        to_unit_symbol: newUnitSymbol,
      });

      // Update the measurement with converted value
      handleMeasurementChange(index, "value", result.result.toString());
      handleMeasurementChange(index, "unit_symbol", newUnitSymbol);
    } catch (error: any) {
      toast.error(`Conversion failed: ${error.message}`);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Measurement Specifications</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddMeasurement}
          disabled={disabled}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Spec
        </Button>
      </div>

      {measurements.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
          <p>No measurements defined</p>
          <p className="text-sm">Click "Add Spec" to add measurement specifications</p>
        </div>
      ) : (
        <div className="space-y-3">
          {measurements.map((measurement, index) => (
            <div
              key={index}
              className="flex items-end gap-3 p-3 border rounded-lg bg-muted/30"
            >
              {/* Measurement Name */}
              <div className="flex-1 space-y-1">
                <Label className="text-xs">Measurement</Label>
                <Input
                  value={measurement.measurement_name}
                  onChange={(e) =>
                    handleMeasurementChange(index, "measurement_name", e.target.value)
                  }
                  placeholder="e.g., Chest, Waist, Hip"
                  disabled={disabled}
                  className="h-9"
                />
              </div>

              {/* Value */}
              <div className="w-24 space-y-1">
                <Label className="text-xs">Value</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={measurement.value}
                  onChange={(e) =>
                    handleMeasurementChange(index, "value", e.target.value)
                  }
                  placeholder="0.0"
                  disabled={disabled}
                  className="h-9"
                />
              </div>

              {/* Unit */}
              <div className="w-32 space-y-1">
                <Label className="text-xs">Unit</Label>
                <Select
                  value={measurement.unit_symbol}
                  onValueChange={(value) => {
                    // Convert value if there's an existing value
                    if (measurement.value && parseFloat(measurement.value) > 0) {
                      handleConvertValue(index, value);
                    } else {
                      handleMeasurementChange(index, "unit_symbol", value);
                    }
                  }}
                  disabled={disabled}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(lengthUnits as UnitForSelector[]).map((unit) => (
                      <SelectItem key={unit.id} value={unit.symbol}>
                        <div className="flex items-center gap-2">
                          <span>{unit.symbol}</span>
                          <span className="text-muted-foreground text-sm">
                            {unit.name}
                          </span>
                          {unit.is_base && (
                            <Badge variant="outline" className="text-xs">
                              Base
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Delete Button */}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveMeasurement(index)}
                disabled={disabled}
                className="h-9 w-9 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {measurements.length > 0 && (
        <div className="text-xs text-muted-foreground">
          <p>💡 Tip: Values are automatically converted when you change units</p>
        </div>
      )}
    </div>
  );
}