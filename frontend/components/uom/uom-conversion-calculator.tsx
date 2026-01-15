"use client";

import * as React from "react";
import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { ArrowRightLeft, Copy, Check, Calculator, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import {
  useUoMCategoriesWithCounts,
  useUoMs,
  useConvertUoM,
  type UoMCategoryWithUnits,
  type UoM,
  type UoMConversionResult,
} from "@/hooks/use-uom";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface UoMConversionCalculatorProps {
  className?: string;
}

// Categories that support meaningful conversions (have units with different factors)
const CONVERTIBLE_CATEGORIES = ["Length", "Weight", "Quantity", "Textile Density", "Area", "Volume", "Time"];

export function UoMConversionCalculator({ className }: UoMConversionCalculatorProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [fromUomId, setFromUomId] = useState<number | null>(null);
  const [toUomId, setToUomId] = useState<number | null>(null);
  const [inputValue, setInputValue] = useState<string>("");
  const [result, setResult] = useState<UoMConversionResult | null>(null);
  const [copied, setCopied] = useState(false);

  // Fetch data
  const { data: categories = [] } = useUoMCategoriesWithCounts(true);
  const { data: units = [] } = useUoMs(selectedCategoryId || undefined);
  const convertMutation = useConvertUoM();

  // Filter to only show categories that support meaningful conversions
  const convertibleCategories = useMemo(() => {
    return (categories as UoMCategoryWithUnits[]).filter(cat =>
      CONVERTIBLE_CATEGORIES.includes(cat.uom_category)
    );
  }, [categories]);

  // Reset units when category changes
  useEffect(() => {
    setFromUomId(null);
    setToUomId(null);
    setResult(null);
  }, [selectedCategoryId]);

  // Auto-convert when all values are set
  useEffect(() => {
    if (fromUomId && toUomId && inputValue && parseFloat(inputValue) > 0) {
      handleConvert();
    }
  }, [fromUomId, toUomId, inputValue]);

  const handleConvert = async () => {
    if (!fromUomId || !toUomId || !inputValue) return;

    const value = parseFloat(inputValue);
    if (isNaN(value) || value <= 0) {
      toast.error("Please enter a valid positive number");
      return;
    }

    try {
      const conversionResult = await convertMutation.mutateAsync({
        from_uom_id: fromUomId,
        to_uom_id: toUomId,
        value: value,
      });
      setResult(conversionResult);
    } catch (error: any) {
      toast.error(error?.message || "Conversion failed");
      setResult(null);
    }
  };

  const handleSwap = () => {
    const temp = fromUomId;
    setFromUomId(toUomId);
    setToUomId(temp);
    // The useEffect will trigger a new conversion
  };

  const handleCopyResult = () => {
    if (result) {
      navigator.clipboard.writeText(result.to_value.toString());
      setCopied(true);
      toast.success("Result copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleReset = () => {
    setSelectedCategoryId(null);
    setFromUomId(null);
    setToUomId(null);
    setInputValue("");
    setResult(null);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-primary" />
          <CardTitle>Unit Converter</CardTitle>
        </div>
        <CardDescription>
          Convert between units within the same category
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Category Selection */}
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select
            value={selectedCategoryId?.toString() || ""}
            onValueChange={(v) => setSelectedCategoryId(parseInt(v))}
          >
            <SelectTrigger id="category">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {convertibleCategories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id.toString()}>
                  {cat.uom_category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Only categories with convertible units are shown
          </p>
        </div>

        {/* Conversion Fields */}
        <div className="grid grid-cols-[1fr,auto,1fr] gap-2 items-end">
          {/* From Unit */}
          <div className="space-y-2">
            <Label htmlFor="fromUnit">From</Label>
            <Select
              value={fromUomId?.toString() || ""}
              onValueChange={(v) => setFromUomId(parseInt(v))}
              disabled={!selectedCategoryId}
            >
              <SelectTrigger id="fromUnit">
                <SelectValue placeholder="Select unit" />
              </SelectTrigger>
              <SelectContent>
                {(units as UoM[]).map((unit) => (
                  <SelectItem key={unit.id} value={unit.id.toString()}>
                    {unit.name} ({unit.symbol})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Swap Button */}
          <Button
            variant="outline"
            size="icon"
            onClick={handleSwap}
            disabled={!fromUomId || !toUomId}
            className="mb-0.5"
          >
            <ArrowRightLeft className="h-4 w-4" />
          </Button>

          {/* To Unit */}
          <div className="space-y-2">
            <Label htmlFor="toUnit">To</Label>
            <Select
              value={toUomId?.toString() || ""}
              onValueChange={(v) => setToUomId(parseInt(v))}
              disabled={!selectedCategoryId}
            >
              <SelectTrigger id="toUnit">
                <SelectValue placeholder="Select unit" />
              </SelectTrigger>
              <SelectContent>
                {(units as UoM[])
                  .filter((unit) => unit.id !== fromUomId)
                  .map((unit) => (
                    <SelectItem key={unit.id} value={unit.id.toString()}>
                      {unit.name} ({unit.symbol})
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Value Input */}
        <div className="space-y-2">
          <Label htmlFor="value">Value</Label>
          <Input
            id="value"
            type="number"
            step="any"
            min="0"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter value to convert"
            disabled={!fromUomId || !toUomId}
          />
        </div>

        {/* Result */}
        {result && (
          <div className="rounded-lg bg-muted p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Result</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyResult}
                className="h-8 px-2"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <div className="text-2xl font-bold">
              {result.to_value.toLocaleString(undefined, {
                maximumFractionDigits: 6,
              })}{" "}
              <span className="text-lg font-normal text-muted-foreground">
                {result.to_uom}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {result.formula}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleReset}
            className="flex-1"
          >
            Reset
          </Button>
          <Button
            onClick={handleConvert}
            disabled={!fromUomId || !toUomId || !inputValue || convertMutation.isPending}
            className="flex-1"
          >
            {convertMutation.isPending ? "Converting..." : "Convert"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default UoMConversionCalculator;
