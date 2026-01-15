"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusIcon, Eye, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface Style {
  id: number;
  style_number: string;
  style_name: string;
  garment_type: string;
  season: string;
  target_price: number;
  complexity_level: string;
}

export default function StylesPage() {
  const [styles, setStyles] = useState<Style[]>([]);
  const [filteredStyles, setFilteredStyles] = useState<Style[]>([]);
  const [displayedStyles, setDisplayedStyles] = useState<Style[]>([]);
  const [rowLimit, setRowLimit] = useState<number | "all">(50);
  const [filters, setFilters] = useState({
    search: "",
    garmentType: "",
    season: "",
    complexity: "",
  });

  useEffect(() => {
    fetchStyles();
  }, []);

  const fetchStyles = async () => {
    try {
      const response = await fetch("/api/v1/samples/styles/");
      const data = await response.json();
      setStyles(data);
      setFilteredStyles(data);
    } catch (error) {
      toast.error("Failed to fetch styles");
    }
  };

  // Apply filters
  useEffect(() => {
    let result = [...styles];

    // Search filter
    if (filters.search && filters.search !== "all") {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (style: Style) =>
          style.style_name?.toLowerCase().includes(searchLower) ||
          style.style_number?.toLowerCase().includes(searchLower) ||
          style.garment_type?.toLowerCase().includes(searchLower)
      );
    }

    // Garment Type filter
    if (filters.garmentType && filters.garmentType !== "all") {
      result = result.filter((style: Style) => style.garment_type === filters.garmentType);
    }

    // Season filter
    if (filters.season && filters.season !== "all") {
      result = result.filter((style: Style) => style.season === filters.season);
    }

    // Complexity filter
    if (filters.complexity && filters.complexity !== "all") {
      result = result.filter((style: Style) => style.complexity_level === filters.complexity);
    }

    setFilteredStyles(result);
  }, [styles, filters]);

  const clearFilters = () => {
    setFilters({ search: "", garmentType: "", season: "", complexity: "" });
  };

  // Get unique values for filters
  const uniqueGarmentTypes = [...new Set(styles.map((s: Style) => s.garment_type).filter(Boolean))].sort();
  const uniqueSeasons = [...new Set(styles.map((s: Style) => s.season).filter(Boolean))].sort();
  const uniqueComplexities = [...new Set(styles.map((s: Style) => s.complexity_level).filter(Boolean))].sort();

  // Apply row limit to filtered results
  useEffect(() => {
    if (rowLimit === "all") {
      setDisplayedStyles(filteredStyles);
    } else {
      setDisplayedStyles(filteredStyles.slice(0, rowLimit));
    }
  }, [filteredStyles, rowLimit]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Style Info</h1>
          <p className="text-muted-foreground mt-2">
            Manage garment styles, variants, and specifications
          </p>
        </div>
        <Button>
          <PlusIcon className="mr-2 h-4 w-4" />
          Add Style
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Styles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{styles.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active This Season</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {styles.filter(s => s.season === "SS2025").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Polo Styles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {styles.filter(s => s.garment_type === "Polo").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Avg Target Price</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${styles.length > 0 ? (styles.reduce((sum, s) => sum + s.target_price, 0) / styles.length).toFixed(2) : "0"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search style name, number, type..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-9"
              />
            </div>
          </div>
          <Select
            value={filters.garmentType}
            onValueChange={(value) => setFilters({ ...filters, garmentType: value })}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Garment Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {uniqueGarmentTypes.map((type: string) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filters.season}
            onValueChange={(value) => setFilters({ ...filters, season: value })}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Season" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Seasons</SelectItem>
              {uniqueSeasons.map((season: string) => (
                <SelectItem key={season} value={season}>
                  {season}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filters.complexity}
            onValueChange={(value) => setFilters({ ...filters, complexity: value })}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Complexity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              {uniqueComplexities.map((level: string) => (
                <SelectItem key={level} value={level}>
                  {level}
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
          Showing {displayedStyles.length} of {filteredStyles.length} filtered ({styles.length} total) styles
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Styles</CardTitle>
          <CardDescription>Manage your garment style library</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Style Number</TableHead>
                <TableHead>Style Name</TableHead>
                <TableHead>Garment Type</TableHead>
                <TableHead>Season</TableHead>
                <TableHead>Target Price</TableHead>
                <TableHead>Complexity</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedStyles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    {styles.length === 0
                      ? "No styles found."
                      : "No styles match your filters. Try adjusting your search criteria."}
                  </TableCell>
                </TableRow>
              ) : (
                displayedStyles.map((style) => (
                  <TableRow key={style.id}>
                    <TableCell className="font-medium">{style.style_number}</TableCell>
                    <TableCell>{style.style_name}</TableCell>
                    <TableCell>{style.garment_type}</TableCell>
                    <TableCell>{style.season}</TableCell>
                    <TableCell>${style.target_price.toFixed(2)}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${style.complexity_level === "High" ? "bg-red-100 text-red-700" :
                        style.complexity_level === "Medium" ? "bg-yellow-100 text-yellow-700" :
                          "bg-green-100 text-green-700"
                        }`}>
                        {style.complexity_level}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
