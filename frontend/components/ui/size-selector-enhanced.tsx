"use client";

import * as React from "react";
import { Plus, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/services/api";
import { toast } from "sonner";

interface GarmentSize {
  id: number;
  size_value: string;
  size_label: string | null;
  size_category: string | null;
  sort_order: number;
  is_active: boolean;
}

interface SizeSelectorEnhancedProps {
  value: string[];
  onValueChange: (sizes: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  maxSelections?: number;
}

const SIZE_CATEGORIES = ["Standard", "Numeric", "Custom"];

export function SizeSelectorEnhanced({
  value = [],
  onValueChange,
  placeholder = "Select sizes...",
  disabled = false,
  className,
  maxSelections,
}: SizeSelectorEnhancedProps) {
  const [sizes, setSizes] = React.useState<GarmentSize[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [showAddDialog, setShowAddDialog] = React.useState(false);
  const [adding, setAdding] = React.useState(false);
  const [newSize, setNewSize] = React.useState({
    size_value: "",
    size_label: "",
    size_category: "Custom",
    sort_order: 100,
  });

  // Load sizes from API
  const loadSizes = React.useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.sizes.getAll();
      setSizes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load sizes:", error);
      // Fallback: try to seed defaults if empty
      try {
        await api.colors.seedDefaults(); // This seeds both colors and sizes
        const data = await api.sizes.getAll();
        setSizes(Array.isArray(data) ? data : []);
      } catch {
        setSizes([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadSizes();
  }, [loadSizes]);

  // Group sizes by category
  const groupedSizes = React.useMemo(() => {
    const groups: Record<string, GarmentSize[]> = {};
    sizes.forEach(size => {
      const category = size.size_category || "Other";
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(size);
    });
    // Sort each group by sort_order
    Object.keys(groups).forEach(key => {
      groups[key].sort((a, b) => a.sort_order - b.sort_order);
    });
    return groups;
  }, [sizes]);

  const toggleSize = (sizeValue: string) => {
    if (disabled) return;

    if (value.includes(sizeValue)) {
      onValueChange(value.filter(v => v !== sizeValue));
    } else {
      if (maxSelections && value.length >= maxSelections) {
        toast.error(`Maximum ${maxSelections} sizes allowed`);
        return;
      }
      onValueChange([...value, sizeValue]);
    }
  };

  const clearAll = () => {
    if (!disabled) {
      onValueChange([]);
    }
  };

  const handleAddSize = async () => {
    if (!newSize.size_value.trim()) {
      toast.error("Size value is required");
      return;
    }

    try {
      setAdding(true);
      const created = await api.sizes.create({
        size_value: newSize.size_value.trim().toUpperCase(),
        size_label: newSize.size_label.trim() || null,
        size_category: newSize.size_category,
        sort_order: newSize.sort_order,
        is_active: true,
      });

      toast.success(`Size "${created.size_value}" added successfully`);
      setSizes(prev => [...prev, created].sort((a, b) => a.sort_order - b.sort_order));

      // Automatically select the new size
      if (!maxSelections || value.length < maxSelections) {
        onValueChange([...value, created.size_value]);
      }

      setShowAddDialog(false);
      setNewSize({ size_value: "", size_label: "", size_category: "Custom", sort_order: 100 });
    } catch (error: any) {
      toast.error(error.message || "Failed to add size");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Selected sizes */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 p-2 bg-muted/50 rounded-lg">
          <span className="text-xs text-muted-foreground self-center mr-1">Selected:</span>
          {value.map(sizeValue => {
            const sizeInfo = sizes.find(s => s.size_value === sizeValue);
            return (
              <Badge
                key={sizeValue}
                variant="secondary"
                className="flex items-center gap-1 pr-1"
              >
                {sizeValue}
                {sizeInfo?.size_label && (
                  <span className="text-xs text-muted-foreground">({sizeInfo.size_label})</span>
                )}
                <button
                  onClick={() => toggleSize(sizeValue)}
                  disabled={disabled}
                  className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            );
          })}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAll}
            disabled={disabled}
            className="h-6 px-2 text-xs"
          >
            Clear All
          </Button>
        </div>
      )}

      {/* Size grid */}
      {loading ? (
        <div className="flex items-center justify-center p-4">
          <Loader2 className="h-5 w-5 animate-spin mr-2" />
          <span className="text-sm text-muted-foreground">Loading sizes...</span>
        </div>
      ) : (
        <div className="space-y-3">
          {Object.entries(groupedSizes).map(([category, categorySizes]) => (
            <div key={category}>
              <div className="text-xs font-medium text-muted-foreground mb-2">{category}</div>
              <div className="grid grid-cols-5 gap-2">
                {categorySizes.map(size => {
                  const isSelected = value.includes(size.size_value);
                  return (
                    <Button
                      key={size.id}
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleSize(size.size_value)}
                      disabled={disabled}
                      className={cn(
                        "h-9 text-sm font-medium",
                        isSelected && "bg-primary text-primary-foreground"
                      )}
                      title={size.size_label || size.size_value}
                    >
                      {size.size_value}
                    </Button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Add New Size Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddDialog(true)}
            disabled={disabled}
            className="w-full border-dashed"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add New Size
          </Button>
        </div>
      )}

      {/* Add New Size Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Add New Size</DialogTitle>
            <DialogDescription>
              Add a new size to the master list. It will be available for all style variants.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="size_value">Size Value *</Label>
              <Input
                id="size_value"
                value={newSize.size_value}
                onChange={(e) => setNewSize(prev => ({ ...prev, size_value: e.target.value.toUpperCase() }))}
                placeholder="e.g., 6XL, 52, CUSTOM"
                className="font-mono"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="size_label">Size Label (Optional)</Label>
              <Input
                id="size_label"
                value={newSize.size_label}
                onChange={(e) => setNewSize(prev => ({ ...prev, size_label: e.target.value }))}
                placeholder="e.g., 6 Extra Large, Size 52"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="size_category">Category</Label>
              <Select
                value={newSize.size_category}
                onValueChange={(value) => setNewSize(prev => ({ ...prev, size_category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {SIZE_CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="sort_order">Sort Order</Label>
              <Input
                id="sort_order"
                type="number"
                value={newSize.sort_order}
                onChange={(e) => setNewSize(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
                placeholder="e.g., 100"
              />
              <p className="text-xs text-muted-foreground">
                Lower numbers appear first. Standard sizes use 1-10, Numeric uses 11-20.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddSize} disabled={adding}>
              {adding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Size
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
