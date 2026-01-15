"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Search, X, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { settingsService } from "@/services/api";

interface ColorMasterTabsProps {
  colorMasters: any[];
  masterLoading: boolean;
  masterSearch: string;
  setMasterSearch: (value: string) => void;
  masterRowLimit: number | "all";
  setMasterRowLimit: (value: number | "all") => void;
  activeCodeTab: string;
  setActiveCodeTab: (value: string) => void;
  setMasterCodeType: (value: string) => void;
  setMasterPage: (value: number) => void;
  clearMasterFilters: () => void;
  getFamilyName: (id: number) => string;
  getColorName: (id: number) => string;
  getValueName: (id: number) => string;
  handleEditMaster: (item: any) => void;
  handleDeleteMaster: (id: number) => void;
  token: string | null;
}

export default function ColorMasterTabs({
  colorMasters,
  masterLoading,
  masterSearch,
  setMasterSearch,
  masterRowLimit,
  setMasterRowLimit,
  activeCodeTab,
  setActiveCodeTab,
  setMasterCodeType,
  setMasterPage,
  clearMasterFilters,
  getFamilyName,
  getColorName,
  getValueName,
  handleEditMaster,
  handleDeleteMaster,
  token,
}: ColorMasterTabsProps) {
  const queryClient = useQueryClient();

  const codeTypeMap: Record<string, string> = {
    "hnm": "H&M",
    "tcx": "TCX",
    "general": "General",
    "hex": "HEX"
  };

  const handleTabChange = (value: string) => {
    setActiveCodeTab(value);
    setMasterCodeType(codeTypeMap[value] || "H&M");
    setMasterPage(0);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 border-b">
        {["hnm", "tcx", "general", "hex"].map((codeType) => (
          <button
            key={codeType}
            onClick={() => handleTabChange(codeType)}
            className={`px-4 py-2 font-medium transition-colors border-b-2 ${
              activeCodeTab === codeType
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {codeType === "hnm" ? "H&M Color Code" : codeType === "tcx" ? "TCX Color Code" : codeType === "general" ? "General Color Code" : "HEX Color Code"}
          </button>
        ))}
      </div>

      {["hnm", "tcx", "general", "hex"].map((codeType) => {
        const codeTypeFilter = codeType === "hnm" ? "H&M" : codeType === "tcx" ? "TCX" : codeType === "general" ? "General" : "HEX";
        
        // Filter by code type (data should already be filtered server-side, but double-check)
        const baseFiltered = colorMasters.filter(m => m.color_code_type === codeTypeFilter);
        
        // Data is already filtered by search in loadColorMasters, but apply here too if needed
        let filteredMasters = baseFiltered;
        
        // Apply row limit
        const displayedMasters = masterRowLimit === "all" 
          ? filteredMasters 
          : filteredMasters.slice(0, masterRowLimit);
        
        if (activeCodeTab !== codeType) return null;
        
        return (
          <div key={codeType} className="space-y-4">
            {codeType === "tcx" && (
              <Card className="p-4 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100">Pantone TCX Colors</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300">Add all Pantone TCX color codes to the Color Master</p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={async () => {
                      if (!token) return;
                      if (!confirm("This will add all Pantone TCX color codes to the Color Master. This may take a moment. Continue?")) return;
                      
                      try {
                        const response = await settingsService.colorMaster.seedTcx(token);
                        toast.success(`Successfully seeded TCX colors! Inserted: ${response.inserted}, Updated: ${response.updated}, Total: ${response.total_tcx_colors}`);
                        // Refetch color masters
                        queryClient.invalidateQueries({ 
                          predicate: (query) => {
                            const key = query.queryKey[0] as string;
                            return key.startsWith("settings-color-master");
                          }
                        });
                      } catch (error: any) {
                        toast.error(error?.message || "Failed to seed TCX colors");
                      }
                    }}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />Seed All TCX Colors
                  </Button>
                </div>
              </Card>
            )}
            <Card className="p-4">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search colors..."
                      value={masterSearch}
                      onChange={(e) => setMasterSearch(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
                <Select
                  value={masterRowLimit.toString()}
                  onValueChange={(value) => setMasterRowLimit(value === "all" ? "all" : parseInt(value))}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Rows" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">Show 10</SelectItem>
                    <SelectItem value="20">Show 20</SelectItem>
                    <SelectItem value="50">Show 50</SelectItem>
                    <SelectItem value="100">Show 100</SelectItem>
                    <SelectItem value="all">Show All</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon" onClick={clearMasterFilters} title="Clear filters">
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                {masterLoading ? (
                  "Loading..."
                ) : (
                  <>
                    Showing {displayedMasters.length} of {filteredMasters.length} filtered 
                    {masterSearch ? " (search results)" : ` (${codeTypeFilter} colors)`}
                  </>
                )}
              </div>
            </Card>
            
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Color Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Family</TableHead>
                    <TableHead>Color</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Hex</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {masterLoading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                        Loading colors...
                      </TableCell>
                    </TableRow>
                  ) : displayedMasters.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                        {filteredMasters.length === 0 && masterSearch ? (
                          "No colors match your search"
                        ) : codeTypeFilter === "TCX" ? (
                          <div className="space-y-2">
                            <p>No TCX color codes found</p>
                            <p className="text-xs">Click the "Seed All TCX Colors" button above to add 340+ Pantone TCX colors</p>
                          </div>
                        ) : (
                          `No ${codeTypeFilter} color codes found`
                        )}
                      </TableCell>
                    </TableRow>
                  ) : (
                    displayedMasters.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.color_name}</TableCell>
                        <TableCell><Badge variant="outline">{item.color_code || "-"}</Badge></TableCell>
                        <TableCell>{getFamilyName(item.color_family_id)}</TableCell>
                        <TableCell>{getColorName(item.color_id)}</TableCell>
                        <TableCell>{getValueName(item.color_value_id)}</TableCell>
                        <TableCell>
                          {item.hex_value && (
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded border" style={{ backgroundColor: item.hex_value }} />
                              <span className="text-xs">{item.hex_value}</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell><Badge variant={item.is_active ? "default" : "secondary"}>{item.is_active ? "Active" : "Inactive"}</Badge></TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleEditMaster(item)}><Edit className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteMaster(item.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        );
      })}
    </div>
  );
}
