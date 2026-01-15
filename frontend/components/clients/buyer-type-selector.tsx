"use client";

import * as React from "react";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBuyerTypes, useCreateBuyerType } from "@/hooks/use-queries";
import { toast } from "sonner";

interface BuyerTypeSelectorProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  allowCreate?: boolean;
  className?: string;
}

interface BuyerType {
  id: number;
  name: string;
  description?: string;
  is_active: boolean;
}

/**
 * Reusable Buyer Type Selector component with "Add New" functionality
 *
 * Fetches buyer types from database and allows creating new ones inline.
 * Returns the buyer type ID as a string for form compatibility.
 */
export function BuyerTypeSelector({
  value,
  onChange,
  placeholder = "Select buyer type",
  disabled = false,
  required = false,
  allowCreate = true,
  className,
}: BuyerTypeSelectorProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newTypeName, setNewTypeName] = useState("");
  const [newTypeDescription, setNewTypeDescription] = useState("");

  // Fetch buyer types (only active ones)
  const { data: buyerTypes = [], isLoading, refetch } = useBuyerTypes(true);
  const createBuyerTypeMutation = useCreateBuyerType();

  const handleCreateBuyerType = async () => {
    if (!newTypeName.trim()) {
      toast.error("Buyer type name is required");
      return;
    }

    try {
      const newBuyerType = await createBuyerTypeMutation.mutateAsync({
        name: newTypeName.trim(),
        description: newTypeDescription.trim() || undefined,
        is_active: true,
      });

      // Select the newly created buyer type
      onChange(newBuyerType.id.toString());
      
      // Reset form and close dialog
      setNewTypeName("");
      setNewTypeDescription("");
      setIsCreateDialogOpen(false);
      
      // Refresh the list
      refetch();
      
      toast.success(`Buyer type "${newBuyerType.name}" created successfully`);
    } catch (error: any) {
      console.error("Failed to create buyer type:", error);
      toast.error(error?.message || "Failed to create buyer type");
    }
  };

  const selectedBuyerType = buyerTypes.find(
    (type: BuyerType) => type.id.toString() === value
  );

  return (
    <div className={cn("space-y-2", className)}>
      <Select
        value={value || ""}
        onValueChange={onChange}
        disabled={disabled || isLoading}
        required={required}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder}>
            {selectedBuyerType && (
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span>{selectedBuyerType.name}</span>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {/* Existing buyer types */}
          {buyerTypes.map((type: BuyerType) => (
            <SelectItem key={type.id} value={type.id.toString()}>
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <div className="flex flex-col">
                  <span className="font-medium">{type.name}</span>
                  {type.description && (
                    <span className="text-xs text-muted-foreground">
                      {type.description}
                    </span>
                  )}
                </div>
              </div>
            </SelectItem>
          ))}
          
          {/* Add New option */}
          {allowCreate && (
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <div className="relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Buyer Type
                </div>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create New Buyer Type</DialogTitle>
                  <DialogDescription>
                    Add a new buyer type to categorize your clients.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">
                      Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="name"
                      value={newTypeName}
                      onChange={(e) => setNewTypeName(e.target.value)}
                      placeholder="e.g., Retail, Wholesale, Brand"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newTypeDescription}
                      onChange={(e) => setNewTypeDescription(e.target.value)}
                      placeholder="Optional description for this buyer type"
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsCreateDialogOpen(false);
                      setNewTypeName("");
                      setNewTypeDescription("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleCreateBuyerType}
                    disabled={!newTypeName.trim() || createBuyerTypeMutation.isPending}
                  >
                    {createBuyerTypeMutation.isPending ? "Creating..." : "Create"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </SelectContent>
      </Select>
    </div>
  );
}