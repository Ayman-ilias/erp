"use client";

import * as React from "react";
import { useState, useEffect } from "react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusCircle, Edit, Trash2, Search, X, RefreshCw } from "lucide-react";
import { ExportButton } from "@/components/export-button";
import type { ExportColumn } from "@/lib/export-utils";
import { api } from "@/services/api";
import { toast } from "sonner";
import { ColorSelectorEnhanced } from "@/components/ui/color-selector-enhanced";
import { SizeSelectorEnhanced } from "@/components/ui/size-selector-enhanced";

// Helper functions
import { formatDateTimeWithFallback, generateStyleVariantId } from "@/services/utils";

export default function StyleVariantsPage() {
  const [styleVariants, setStyleVariants] = useState<any[]>([]);
  const [filteredVariants, setFilteredVariants] = useState<any[]>([]);
  const [displayedVariants, setDisplayedVariants] = useState<any[]>([]);
  const [styleSummaries, setStyleSummaries] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [editingVariant, setEditingVariant] = useState<any>(null);
  const [rowLimit, setRowLimit] = useState<number | "all">(50);
  const [filters, setFilters] = useState({
    search: "",
    style: "",
    colour: "",
  });
  const [formData, setFormData] = useState({
    style_summary_id: 0,
    style_name: "",
    style_id: "",
    colour_name: "",
    colour_code: "",
    colour_ref: "",
    piece_name: "",
    sizes: [] as string[],
  });

  // State for set pieces
  const [isSetStyle, setIsSetStyle] = useState(false);
  const [setPieceCount, setSetPieceCount] = useState(0);
  const [setPieces, setSetPieces] = useState<Array<{
    piece_name: string;
    colour_name: string;
    colour_code: string;
    colour_ref: string;
    sizes: string[];
  }>>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      console.log("[StyleVariants] Loading data...");
      const [variantsData, stylesData] = await Promise.all([
        api.styleVariants.getAll(),
        api.styles.getAll(),
      ]);
      console.log("[StyleVariants] Loaded variants:", variantsData?.length || 0);
      console.log("[StyleVariants] Sample variant:", variantsData?.[0]);
      setStyleVariants(Array.isArray(variantsData) ? variantsData : []);
      setStyleSummaries(Array.isArray(stylesData) ? stylesData : []);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error(`Failed to load data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Extract unique values for filters
  const uniqueStyles = [...new Set(styleVariants.map((v: any) => v.style_name).filter(Boolean))].sort();
  const uniqueColours = [...new Set(styleVariants.map((v: any) => v.colour_name).filter(Boolean))].sort();

  // Clear filters function
  const clearFilters = () => {
    setFilters({ search: "", style: "", colour: "" });
  };

  // Apply filters
  useEffect(() => {
    let result = [...styleVariants];

    // Search filter
    if (filters.search && filters.search !== "all") {
      const searchLower = filters.search.toLowerCase();
      result = result.filter((variant: any) =>
        variant.style_name?.toLowerCase().includes(searchLower) ||
        variant.style_id?.toLowerCase().includes(searchLower) ||
        variant.colour_name?.toLowerCase().includes(searchLower) ||
        variant.colour_code?.toLowerCase().includes(searchLower)
      );
    }

    // Style filter
    if (filters.style && filters.style !== "all") {
      result = result.filter((variant: any) => variant.style_name === filters.style);
    }

    // Colour filter
    if (filters.colour && filters.colour !== "all") {
      result = result.filter((variant: any) => variant.colour_name === filters.colour);
    }

    setFilteredVariants(result);
  }, [styleVariants, filters]);

  // Group variants by style_id for set pieces
  const groupVariantsByStyle = (variants: any[]) => {
    const grouped = new Map<string, any[]>();
    
    variants.forEach((variant) => {
      // Use style_id as the key for grouping
      const key = variant.style_id || `${variant.style_summary_id}`;
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(variant);
    });

    // Convert to array of grouped variants
    const groupedArray: any[] = [];
    grouped.forEach((variants, styleId) => {
      // Separate set pieces (with piece_name) from regular variants
      const setPieces = variants.filter((v: any) => v.piece_name && v.piece_name.trim() !== "");
      const regularVariants = variants.filter((v: any) => !v.piece_name || v.piece_name.trim() === "");
      
      // Group set pieces if there are multiple pieces for the same style
      if (setPieces.length > 1) {
        // Sort pieces by piece_name for consistent display
        const sortedPieces = [...setPieces].sort((a, b) => 
          (a.piece_name || "").localeCompare(b.piece_name || "")
        );
        const firstVariant = sortedPieces[0];
        groupedArray.push({
          ...firstVariant,
          id: firstVariant.id, // Keep first ID for actions
          isGrouped: true,
          pieces: sortedPieces.map((v: any) => ({
            id: v.id,
            piece_name: v.piece_name,
            colour_name: v.colour_name,
            colour_code: v.colour_code,
            sizes: v.sizes || [],
          })),
          // Combine all sizes from all pieces
          allSizes: [...new Set(sortedPieces.flatMap((v: any) => v.sizes || []))],
        });
      } else if (setPieces.length === 1) {
        // Single set piece, show individually
        groupedArray.push({
          ...setPieces[0],
          isGrouped: false,
        });
      }
      
      // Add regular variants individually
      regularVariants.forEach((variant: any) => {
        groupedArray.push({
          ...variant,
          isGrouped: false,
        });
      });
    });

    return groupedArray;
  };

  // Apply row limit and grouping
  useEffect(() => {
    const grouped = groupVariantsByStyle(filteredVariants);
    console.log("[StyleVariants] Grouped variants:", grouped.filter((v: any) => v.isGrouped));
    if (rowLimit === "all") {
      setDisplayedVariants(grouped);
    } else {
      setDisplayedVariants(grouped.slice(0, rowLimit));
    }
  }, [filteredVariants, rowLimit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log("[StyleVariants] Submitting form:", { editingVariant, formData, isSetStyle, setPieces });
      
      // Get base style ID from style summary
      const selectedStyle = styleSummaries.find(
        (style: any) => style.id === formData.style_summary_id
      );
      const baseStyleId = selectedStyle?.style_id || formData.style_id.split('_')[0];
      
      // Calculate piece count and size count
      const pieceCount = isSetStyle && setPieceCount > 0 ? setPieceCount : 1;
      const sizeCount = formData.sizes?.length || 0;
      
      // Generate variant ID
      const variantId = generateStyleVariantId(baseStyleId, pieceCount, sizeCount);
      
      if (editingVariant) {
        if (isSetStyle && setPieces.length > 1) {
          // Update multiple pieces - need to update each piece separately
          const updatePromises = setPieces.map((piece, index) => {
            // Find the corresponding variant ID for this piece
            const groupedVariants = styleVariants.filter(
              (v: any) => v.style_id === editingVariant.style_id && v.piece_name && v.piece_name.trim() !== ""
            );
            const variantToUpdate = groupedVariants[index];
            
            if (!variantToUpdate) {
              // If variant doesn't exist, create it
              const variantData = {
                style_summary_id: formData.style_summary_id,
                style_name: formData.style_name,
                style_id: variantId,
                colour_name: piece.colour_name,
                colour_code: piece.colour_code,
                piece_name: piece.piece_name,
                sizes: piece.sizes,
                is_multicolor: false,
                display_name: null,
              };
              return api.styleVariants.create(variantData);
            } else {
              // Update existing variant
              const updateData = {
                style_summary_id: formData.style_summary_id,
                style_name: formData.style_name,
                style_id: variantId,
                colour_name: piece.colour_name,
                colour_code: piece.colour_code,
                piece_name: piece.piece_name,
                sizes: piece.sizes,
              };
              return api.styleVariants.update(variantToUpdate.id, updateData);
            }
          });
          
          await Promise.all(updatePromises);
          toast.success(`${setPieces.length} style variant pieces updated successfully`);
        } else {
          // Single variant update
          const updateData = {
            ...formData,
            style_id: variantId,
          };
          const result = await api.styleVariants.update(editingVariant.id, updateData);
          console.log("[StyleVariants] Update result:", result);
          toast.success("Style variant updated successfully");
        }
      } else {
            if (isSetStyle) {
          // Create multiple variants for set pieces - all use the same variant ID format
          // Calculate total sizes across all pieces for variant ID
          const allSizes = [...new Set(setPieces.flatMap(p => p.sizes || []))];
          const sizeCount = allSizes.length;
          const finalVariantId = generateStyleVariantId(baseStyleId, pieceCount, sizeCount);
          
          const createPromises = setPieces.map((piece) => {
            const variantData = {
              style_summary_id: formData.style_summary_id,
              style_name: formData.style_name,
              style_id: finalVariantId, // Same ID format for all pieces
              colour_name: piece.colour_name,
              colour_code: piece.colour_code,
              piece_name: piece.piece_name,
              sizes: piece.sizes || [], // Each piece has its own sizes
              is_multicolor: false,
              display_name: null,
            };
            console.log("[StyleVariants] Creating variant:", variantData);
            return api.styleVariants.create(variantData);
          });

          const results = await Promise.all(createPromises);
          console.log("[StyleVariants] Created variants:", results);
          toast.success(`${setPieces.length} style variants created successfully`);
        } else {
          // Single variant creation
          const variantData = {
            ...formData,
            style_id: variantId, // Use generated variant ID
          };
          console.log("[StyleVariants] Creating single variant:", variantData);
          const result = await api.styleVariants.create(variantData);
          console.log("[StyleVariants] Created variant result:", result);
          toast.success("Style variant created successfully");
        }
      }
      setIsDialogOpen(false);
      resetForm();
      // Clear filters to show newly created variants
      clearFilters();
      // Add a small delay to ensure backend has committed the transaction
      setTimeout(() => {
        loadData();
      }, 500);
    } catch (error) {
      console.error("[StyleVariants] Submit error:", error);
      toast.error(`Failed to save style variant: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleEdit = (variant: any) => {
    console.log("[StyleVariants] Editing variant:", variant);
    setEditingVariant(variant);
    
    // Check if this variant is part of a set (has piece_name)
    const hasPieceName = variant.piece_name && variant.piece_name.trim() !== "";
    
    if (hasPieceName) {
      // Find all variants with the same style_id (grouped set pieces)
      const groupedVariants = styleVariants.filter(
        (v: any) => v.style_id === variant.style_id && v.piece_name && v.piece_name.trim() !== ""
      );
      
      console.log("[StyleVariants] Found grouped variants:", groupedVariants.length);
      
      if (groupedVariants.length > 1) {
        // This is a set with multiple pieces - load all pieces
        setIsSetStyle(true);
        setSetPieceCount(groupedVariants.length);
        
        const pieces = groupedVariants.map((v: any) => ({
          piece_name: v.piece_name || "",
          colour_name: v.colour_name || "",
          colour_code: v.colour_code || "",
          colour_ref: v.colour_ref || "",
          sizes: v.sizes || [],
        }));
        setSetPieces(pieces);

        // Set form data with first variant's style info
        setFormData({
          style_summary_id: variant.style_summary_id,
          style_name: variant.style_name,
          style_id: variant.style_id,
          colour_name: "", // Not used for set pieces
          colour_code: "", // Not used for set pieces
          colour_ref: "", // Not used for set pieces
          piece_name: "", // Not used for set pieces
          sizes: [], // Sizes are per-piece now
        });
      } else {
        // Single piece with piece_name
        setIsSetStyle(false);
        setSetPieceCount(0);
        setSetPieces([]);
        setFormData({
          style_summary_id: variant.style_summary_id,
          style_name: variant.style_name,
          style_id: variant.style_id,
          colour_name: variant.colour_name,
          colour_code: variant.colour_code || "",
          colour_ref: variant.colour_ref || "",
          piece_name: variant.piece_name || "",
          sizes: variant.sizes || [],
        });
      }
    } else {
      // Regular single-color variant
      setIsSetStyle(false);
      setSetPieceCount(0);
      setSetPieces([]);
      setFormData({
        style_summary_id: variant.style_summary_id,
        style_name: variant.style_name,
        style_id: variant.style_id,
        colour_name: variant.colour_name,
        colour_code: variant.colour_code || "",
        colour_ref: variant.colour_ref || "",
        piece_name: variant.piece_name || "",
        sizes: variant.sizes || [],
      });
    }
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this style variant?")) {
      try {
        await api.styleVariants.delete(id);
        toast.success("Style variant deleted successfully");
        loadData();
      } catch (error) {
        toast.error("Failed to delete style variant");
        console.error(error);
      }
    }
  };

  const resetForm = () => {
    setEditingVariant(null);
    setFormData({
      style_summary_id: 0,
      style_name: "",
      style_id: "",
      colour_name: "",
      colour_code: "",
      colour_ref: "",
      piece_name: "",
      sizes: [],
    });
    setIsSetStyle(false);
    setSetPieceCount(0);
    setSetPieces([]);
  };

  // Generate style variant ID in format: StyleID_piece_count_size_count
  const generateStyleVariantId = (
    baseStyleId: string,
    pieceCount: number,
    sizeCount: number
  ): string => {
    // For non-set styles, piece_count is 1
    const pieces = pieceCount > 0 ? pieceCount : 1;
    const sizes = sizeCount > 0 ? sizeCount : 0;
    return `${baseStyleId}_${pieces}_${sizes}`;
  };

  const handleStyleSummaryChange = (styleSummaryId: string) => {
    const selectedStyle = styleSummaries.find(
      (style: any) => style.id === parseInt(styleSummaryId)
    );
    if (selectedStyle) {
      const pieceCount = selectedStyle.is_set && selectedStyle.set_piece_count > 0 
        ? selectedStyle.set_piece_count 
        : 1;
      // Use current sizes from formData, or 0 if not set yet
      const currentSizes = formData.sizes || [];
      const sizeCount = currentSizes.length;
      const variantId = generateStyleVariantId(
        selectedStyle.style_id,
        pieceCount,
        sizeCount
      );

      setFormData({
        ...formData,
        style_summary_id: selectedStyle.id,
        style_name: selectedStyle.style_name,
        style_id: variantId, // Use generated variant ID
      });

      // Check if this is a set style
      if (selectedStyle.is_set && selectedStyle.set_piece_count > 0) {
        setIsSetStyle(true);
        setSetPieceCount(selectedStyle.set_piece_count);

        // Initialize empty pieces array
        const pieces = Array.from({ length: selectedStyle.set_piece_count }, () => ({
          piece_name: "",
          colour_name: "",
          colour_code: "",
          colour_ref: "",
          sizes: [],
        }));
        setSetPieces(pieces);
      } else {
        setIsSetStyle(false);
        setSetPieceCount(0);
        setSetPieces([]);
      }
    }
  };

  const updateSetPiece = (index: number, field: string, value: string | string[]) => {
    setSetPieces(prevPieces => {
      const updatedPieces = [...prevPieces];
      updatedPieces[index] = {
        ...updatedPieces[index],
        [field]: value,
      };
      return updatedPieces;
    });
  };

  const updateSetPieceMultiple = (index: number, updates: Record<string, string | string[]>) => {
    setSetPieces(prevPieces => {
      const updatedPieces = [...prevPieces];
      updatedPieces[index] = {
        ...updatedPieces[index],
        ...updates,
      };
      return updatedPieces;
    });
  };

  // Export columns configuration
  const exportColumns: ExportColumn[] = [
    { key: "style_name", header: "Style Name" },
    { key: "style_id", header: "Style ID" },
    { key: "piece_name", header: "Piece Name" },
    { key: "colour_name", header: "Colour Name" },
    { key: "colour_code", header: "Colour Code (Hex)" },
    { key: "colour_ref", header: "Colour Reference" },
    { key: "sizes", header: "Sizes", transform: (value) => Array.isArray(value) ? value.join(", ") : "-" },
    { key: "created_at", header: "Created At", transform: (value) => formatDateTimeWithFallback(value) },
    { key: "updated_at", header: "Updated At", transform: (value) => formatDateTimeWithFallback(value) },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Style Variants</h1>
          <p className="text-muted-foreground">
            Manage style variants with colors and specifications
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButton
            data={filteredVariants}
            columns={exportColumns}
            filename="style-variants"
            sheetName="Style Variants"
          />
          <Button
            variant="outline"
            onClick={loadData}
            title="Refresh list"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Style Variant
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingVariant ? "Edit Style Variant" : "Add New Style Variant"}
              </DialogTitle>
              <DialogDescription>
                {editingVariant
                  ? "Update style variant information"
                  : "Enter style variant details"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="style_summary">Style Summary *</Label>
                  <Select
                    value={formData.style_summary_id.toString()}
                    onValueChange={handleStyleSummaryChange}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a style" />
                    </SelectTrigger>
                    <SelectContent>
                      {styleSummaries.map((style: any) => (
                        <SelectItem key={style.id} value={style.id.toString()}>
                          {style.style_name} ({style.style_id})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="style_name">Style Name</Label>
                    <Input
                      id="style_name"
                      value={formData.style_name}
                      onChange={(e) =>
                        setFormData({ ...formData, style_name: e.target.value })
                      }
                      disabled
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="style_id">Style Variant ID (Auto-Generated)</Label>
                    <Input
                      id="style_id"
                      value={formData.style_id}
                      onChange={(e) =>
                        setFormData({ ...formData, style_id: e.target.value })
                      }
                      disabled
                      className="font-mono"
                    />
                    <p className="text-xs text-muted-foreground">
                      Format: StyleID_piece_count_size_count (e.g., S1234_2_2)
                    </p>
                  </div>
                </div>

                {/* Conditional rendering: Set pieces OR single color */}
                {isSetStyle ? (
                  <div className="space-y-4 border-t pt-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg">
                        Set Pieces ({setPieceCount} pieces)
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Define each piece in this set
                      </p>
                    </div>

                    {setPieces.map((piece, index) => (
                      <div key={index} className="space-y-3 p-4 border rounded-lg bg-muted/50">
                        <h4 className="font-medium text-sm">
                          Piece {index + 1}
                        </h4>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label htmlFor={`piece_name_${index}`}>Piece Name *</Label>
                            <Input
                              id={`piece_name_${index}`}
                              value={piece.piece_name}
                              onChange={(e) =>
                                updateSetPiece(index, "piece_name", e.target.value)
                              }
                              placeholder="e.g., Top, Bottom..."
                              required
                              disabled={editingVariant !== null}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`colour_name_${index}`}>Colour (Name, Code, Ref) *</Label>
                            <ColorSelectorEnhanced
                              value={piece.colour_name}
                              onValueChange={(colorName, colorCode, colorRef) => {
                                updateSetPieceMultiple(index, {
                                  colour_name: colorName,
                                  colour_code: colorCode,
                                  colour_ref: colorRef,
                                });
                              }}
                              placeholder="Select color..."
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`sizes_${index}`}>Sizes (for Piece {index + 1})</Label>
                          <SizeSelectorEnhanced
                            value={piece.sizes || []}
                            onValueChange={(value) => {
                              updateSetPiece(index, "sizes", value);
                            }}
                            placeholder={`Select sizes for ${piece.piece_name || `Piece ${index + 1}`}...`}
                          />
                          <p className="text-xs text-muted-foreground">
                            Select sizes available for this specific piece
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="colour_name">Colour (Name, Code, Reference) *</Label>
                      <ColorSelectorEnhanced
                        value={formData.colour_name}
                        onValueChange={(colorName, colorCode, colorRef) =>
                          setFormData({
                            ...formData,
                            colour_name: colorName,
                            colour_code: colorCode,
                            colour_ref: colorRef
                          })
                        }
                        placeholder="Select or search color..."
                      />
                      <p className="text-xs text-muted-foreground">
                        Search by color name, hex code, or reference. Click &quot;Add New Color&quot; to add custom colors.
                      </p>
                    </div>
                  </>
                )}

                {!isSetStyle && (
                  <div className="space-y-2">
                    <Label htmlFor="sizes">Sizes</Label>
                    <SizeSelectorEnhanced
                      value={formData.sizes}
                      onValueChange={(value) => {
                        // Update sizes and recalculate variant ID
                        const selectedStyle = styleSummaries.find(
                          (style: any) => style.id === formData.style_summary_id
                        );
                        if (selectedStyle) {
                          const baseStyleId = selectedStyle.style_id;
                          const pieceCount = 1;
                          const sizeCount = value?.length || 0;
                          const variantId = generateStyleVariantId(baseStyleId, pieceCount, sizeCount);
                          setFormData({
                            ...formData,
                            sizes: value,
                            style_id: variantId // Update variant ID with new size count
                          });
                        } else {
                          setFormData({ ...formData, sizes: value });
                        }
                      }}
                      placeholder="Select multiple sizes..."
                    />
                    <p className="text-xs text-muted-foreground">
                      Select sizes or click &quot;Add New Size&quot; to add custom sizes
                    </p>
                  </div>
                )}

              </div>
              <DialogFooter>
                <Button type="submit">
                  {editingVariant ? "Update" : "Create"} Style Variant
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      </div>

      {/* Filters */}
      <div className="rounded-md border p-4 bg-card">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search style, colour..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-9"
              />
            </div>
          </div>
          <Select
            value={filters.style}
            onValueChange={(value) => setFilters({ ...filters, style: value })}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Styles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Styles</SelectItem>
              {uniqueStyles.map((style: string, idx) => (
                <SelectItem key={`style-${idx}`} value={style}>
                  {style}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filters.colour}
            onValueChange={(value) => setFilters({ ...filters, colour: value })}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Colours" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Colours</SelectItem>
              {uniqueColours.map((colour: string, idx) => (
                <SelectItem key={`colour-${idx}`} value={colour}>
                  {colour}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={rowLimit.toString()}
            onValueChange={(value) => setRowLimit(value === "all" ? "all" : parseInt(value))}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Rows" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">Show 10</SelectItem>
              <SelectItem value="20">Show 20</SelectItem>
              <SelectItem value="50">Show 50</SelectItem>
              <SelectItem value="all">Show All</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={clearFilters} title="Clear filters">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="mt-2 text-sm text-muted-foreground">
          Showing {displayedVariants.length} of {filteredVariants.length} filtered ({styleVariants.length} total) style variants
          {(filters.search || filters.style || filters.colour) && (
            <span className="ml-2 text-amber-600">
              (Filters active - new variants may be hidden)
            </span>
          )}
        </div>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Style Name</TableHead>
              <TableHead>Style ID</TableHead>
              <TableHead>Piece Name</TableHead>
              <TableHead>Colour Name</TableHead>
              <TableHead>Colour Code</TableHead>
              <TableHead>Sizes</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Updated At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayedVariants.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center">
                  {styleVariants.length === 0
                    ? "No style variants found. Add your first style variant to get started."
                    : "No style variants match your filters. Try adjusting your search criteria."}
                </TableCell>
              </TableRow>
            ) : (
              displayedVariants.map((variant: any) => (
                <TableRow 
                  key={variant.id}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => {
                    setSelectedVariant(variant);
                    setIsDetailDialogOpen(true);
                  }}
                >
                  <TableCell className="font-medium">{variant.style_name}</TableCell>
                  <TableCell>{variant.style_id}</TableCell>
                  <TableCell>
                    {variant.isGrouped ? (
                      <div className="space-y-0.5">
                        {variant.pieces.map((piece: any, idx: number) => (
                          <div key={idx} className="text-sm py-0.5">
                            {piece.piece_name}
                          </div>
                        ))}
                      </div>
                    ) : variant.piece_name ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                        {variant.piece_name}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {variant.isGrouped ? (
                      <div className="space-y-0.5">
                        {variant.pieces.map((piece: any, idx: number) => (
                          <div key={idx} className="text-sm py-0.5">
                            {piece.colour_name}
                          </div>
                        ))}
                      </div>
                    ) : (
                      variant.colour_name
                    )}
                  </TableCell>
                  <TableCell>
                    {variant.isGrouped ? (
                      <div className="space-y-0.5">
                        {variant.pieces.map((piece: any, idx: number) => (
                          <div key={idx} className="text-sm py-0.5">
                            {piece.colour_code || "-"}
                          </div>
                        ))}
                      </div>
                    ) : (
                      variant.colour_code || "-"
                    )}
                  </TableCell>
                  <TableCell>
                    {variant.isGrouped ? (
                      variant.allSizes && variant.allSizes.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {variant.allSizes.slice(0, 5).map((size: string, idx: number) => (
                            <span key={idx} className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">
                              {size}
                            </span>
                          ))}
                          {variant.allSizes.length > 5 && (
                            <span className="text-xs text-muted-foreground">
                              +{variant.allSizes.length - 5}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )
                    ) : (
                      variant.sizes && variant.sizes.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {variant.sizes.slice(0, 3).map((size: string, idx: number) => (
                            <span key={idx} className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">
                              {size}
                            </span>
                          ))}
                          {variant.sizes.length > 3 && (
                            <span className="text-xs text-muted-foreground">
                              +{variant.sizes.length - 3}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDateTimeWithFallback(variant.created_at)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDateTimeWithFallback(variant.updated_at)}</TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-end gap-2">
                          {variant.isGrouped ? (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              // Find the first piece variant to get full details
                              const firstPieceId = variant.pieces[0].id;
                              const fullVariant = styleVariants.find((v: any) => v.id === firstPieceId);
                              if (fullVariant) {
                                handleEdit(fullVariant);
                              }
                            }}
                            title="Edit all set pieces"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              if (confirm(`Delete all ${variant.pieces.length} pieces of this set?`)) {
                                // Delete all pieces
                                Promise.all(variant.pieces.map((p: any) => api.styleVariants.delete(p.id)))
                                  .then(() => {
                                    toast.success("Set pieces deleted successfully");
                                    loadData();
                                  })
                                  .catch(() => toast.error("Failed to delete set pieces"));
                              }
                            }}
                            title="Delete all set pieces"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(variant)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(variant.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Detail View Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Style Variant Details</DialogTitle>
            <DialogDescription>
              Complete information for {selectedVariant?.style_name} - {selectedVariant?.style_id}
            </DialogDescription>
          </DialogHeader>
          {selectedVariant && (
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-muted-foreground">Style Name</Label>
                  <p className="text-base font-medium">{selectedVariant.style_name}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-muted-foreground">Style Variant ID</Label>
                  <p className="text-base font-mono">{selectedVariant.style_id}</p>
                </div>
              </div>

              {selectedVariant.isGrouped ? (
                <div className="space-y-4 border-t pt-4">
                  <h3 className="font-semibold text-lg">Set Pieces ({selectedVariant.pieces.length} pieces)</h3>
                  <div className="space-y-3">
                    {selectedVariant.pieces.map((piece: any, idx: number) => (
                      <div key={idx} className="p-4 border rounded-lg bg-muted/30">
                        <h4 className="font-medium mb-3">Piece {idx + 1}: {piece.piece_name}</h4>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label className="text-sm font-semibold text-muted-foreground">Piece Name</Label>
                            <p className="text-base">{piece.piece_name}</p>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-semibold text-muted-foreground">Colour</Label>
                            <p className="text-base">{piece.colour_name}</p>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-semibold text-muted-foreground">Colour Code</Label>
                            <p className="text-base">{piece.colour_code || "-"}</p>
                          </div>
                          <div className="space-y-2 col-span-3">
                            <Label className="text-sm font-semibold text-muted-foreground">Sizes</Label>
                            <div className="flex flex-wrap gap-2">
                              {piece.sizes && piece.sizes.length > 0 ? (
                                piece.sizes.map((size: string, sIdx: number) => (
                                  <span key={sIdx} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                                    {size}
                                  </span>
                                ))
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {selectedVariant.piece_name && (
                    <div className="space-y-2 border-t pt-4">
                      <Label className="text-sm font-semibold text-muted-foreground">Piece Name</Label>
                      <p className="text-base">{selectedVariant.piece_name}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4 border-t pt-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-muted-foreground">Colour Name</Label>
                      <p className="text-base">{selectedVariant.colour_name}</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-muted-foreground">Colour Code</Label>
                      <p className="text-base">{selectedVariant.colour_code || "-"}</p>
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label className="text-sm font-semibold text-muted-foreground">Sizes</Label>
                      <div className="flex flex-wrap gap-2">
                        {selectedVariant.sizes && selectedVariant.sizes.length > 0 ? (
                          selectedVariant.sizes.map((size: string, idx: number) => (
                            <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                              {size}
                            </span>
                          ))
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {selectedVariant.allSizes && selectedVariant.allSizes.length > 0 && (
                <div className="space-y-2 border-t pt-4">
                  <Label className="text-sm font-semibold text-muted-foreground">All Sizes (Combined)</Label>
                  <div className="flex flex-wrap gap-2">
                    {selectedVariant.allSizes.map((size: string, idx: number) => (
                      <span key={idx} className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                        {size}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Timestamps Section */}
              <div className="grid grid-cols-2 gap-4 border-t pt-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-muted-foreground">Created At</Label>
                  <p className="text-base">{formatDateTimeWithFallback(selectedVariant.created_at)}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-muted-foreground">Updated At</Label>
                  <p className="text-base">{formatDateTimeWithFallback(selectedVariant.updated_at)}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDetailDialogOpen(false);
                if (selectedVariant && selectedVariant.isGrouped) {
                  const firstPieceId = selectedVariant.pieces[0].id;
                  const fullVariant = styleVariants.find((v: any) => v.id === firstPieceId);
                  if (fullVariant) {
                    handleEdit(fullVariant);
                  }
                } else if (selectedVariant) {
                  handleEdit(selectedVariant);
                }
              }}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button onClick={() => setIsDetailDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
