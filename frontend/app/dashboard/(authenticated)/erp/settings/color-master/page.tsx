"use client";

import * as React from "react";
import { useState, useMemo } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PlusCircle, Edit, Trash2, Shield, Search, Palette, SwatchBook,
  Info, Tag, Building2, Globe, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import {
  // Universal Colors
  useUniversalColors,
  useUniversalColorsForSelector,
  useCreateUniversalColor,
  useUpdateUniversalColor,
  useDeleteUniversalColor,
  // H&M Colors
  useHMColors,
  useCreateHMColor,
  useUpdateHMColor,
  useDeleteHMColor,
  // Types
  type UniversalColor,
  type HMColor,
  type ColorFamilyEnum,
  type ColorTypeEnum,
  type ColorValueEnum,
  type FinishTypeEnum,
} from "@/hooks/use-sizecolor";

// Color family options with colors
const colorFamilyOptions: { value: ColorFamilyEnum; label: string; hex: string }[] = [
  { value: "Red", label: "Red", hex: "#DC2626" },
  { value: "Orange", label: "Orange", hex: "#EA580C" },
  { value: "Yellow", label: "Yellow", hex: "#CA8A04" },
  { value: "Green", label: "Green", hex: "#16A34A" },
  { value: "Blue", label: "Blue", hex: "#2563EB" },
  { value: "Purple", label: "Purple", hex: "#9333EA" },
  { value: "Pink", label: "Pink", hex: "#DB2777" },
  { value: "Brown", label: "Brown", hex: "#78350F" },
  { value: "Grey", label: "Grey", hex: "#6B7280" },
  { value: "Black", label: "Black", hex: "#1F2937" },
  { value: "White", label: "White", hex: "#F9FAFB" },
  { value: "Beige", label: "Beige", hex: "#D4C4A8" },
  { value: "Navy", label: "Navy", hex: "#1E3A5F" },
  { value: "Cream", label: "Cream", hex: "#FFFDD0" },
  { value: "Burgundy", label: "Burgundy", hex: "#800020" },
  { value: "Teal", label: "Teal", hex: "#0D9488" },
  { value: "Olive", label: "Olive", hex: "#65A30D" },
  { value: "Coral", label: "Coral", hex: "#FF7F50" },
  { value: "Multi", label: "Multi", hex: "linear-gradient(90deg, #DC2626, #CA8A04, #16A34A, #2563EB)" },
];

// Color type options
const colorTypeOptions: { value: ColorTypeEnum; label: string }[] = [
  { value: "Solid", label: "Solid" },
  { value: "Melange", label: "Melange" },
  { value: "Dope Dyed", label: "Dope Dyed" },
  { value: "Yarn Dyed", label: "Yarn Dyed" },
  { value: "Garment Dyed", label: "Garment Dyed" },
  { value: "Reactive Dyed", label: "Reactive Dyed" },
  { value: "Pigment Dyed", label: "Pigment Dyed" },
  { value: "Tie Dye", label: "Tie Dye" },
  { value: "Ombre", label: "Ombre" },
  { value: "Print", label: "Print" },
  { value: "Stripe", label: "Stripe" },
];

// Color value options
const colorValueOptions: { value: ColorValueEnum; label: string }[] = [
  { value: "Light", label: "Light" },
  { value: "Medium", label: "Medium" },
  { value: "Dark", label: "Dark" },
  { value: "Bright", label: "Bright" },
  { value: "Dusty", label: "Dusty" },
  { value: "Medium Dusty", label: "Medium Dusty" },
  { value: "Pastel", label: "Pastel" },
  { value: "Neon", label: "Neon" },
  { value: "Muted", label: "Muted" },
];

// Finish type options
const finishTypeOptions: { value: FinishTypeEnum; label: string }[] = [
  { value: "Yarn Dyed", label: "Yarn Dyed" },
  { value: "Dope Dyed", label: "Dope Dyed" },
  { value: "Garment Dyed", label: "Garment Dyed" },
  { value: "Piece Dyed", label: "Piece Dyed" },
  { value: "Raw", label: "Raw" },
  { value: "Washed", label: "Washed" },
  { value: "Enzyme Washed", label: "Enzyme Washed" },
  { value: "Stone Washed", label: "Stone Washed" },
];

// H&M Color Master and Value options (dynamically generated from data)

export default function ColorMasterPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("universal");
  const [hasVisitedHMTab, setHasVisitedHMTab] = useState(false);

  // Universal Colors State
  const [universalSearchTerm, setUniversalSearchTerm] = useState("");
  const [universalFamilyFilter, setUniversalFamilyFilter] = useState<string>("all");
  const [universalTypeFilter, setUniversalTypeFilter] = useState<string>("all");
  const [isUniversalDialogOpen, setIsUniversalDialogOpen] = useState(false);
  const [editingUniversal, setEditingUniversal] = useState<UniversalColor | null>(null);

  // H&M Colors State
  const [hmSearchTerm, setHMSearchTerm] = useState("");
  const [hmColorMasterFilter, setHMColorMasterFilter] = useState<string>("all");
  const [hmColorValueFilter, setHMColorValueFilter] = useState<string>("all");
  const [isHMDialogOpen, setIsHMDialogOpen] = useState(false);
  const [editingHM, setEditingHM] = useState<HMColor | null>(null);
  const [hmPage, setHMPage] = useState(1);
  const hmPageSize = 50; // Items per page

  // Universal Color Form
  const [universalFormData, setUniversalFormData] = useState({
    name: "",
    hex_code: "#000000",
    pantone_code: "",
    tcx_code: "",
    color_family: "" as ColorFamilyEnum | "",
    color_type: "Solid" as ColorTypeEnum,
    color_value: "" as ColorValueEnum | "",
    finish_type: "" as FinishTypeEnum | "",
    description: "",
    is_active: true,
  });

  // H&M Color Form
  const [hmFormData, setHMFormData] = useState({
    color_code: "",
    color_master: "",
    color_value: "",
    mixed_name: "",
    is_active: true,
  });

  // Queries
  const { data: universalColors = [], isLoading: universalLoading } = useUniversalColors(
    universalFamilyFilter !== "all" ? universalFamilyFilter : undefined,
    universalTypeFilter !== "all" ? universalTypeFilter : undefined,
    0,  // skip
    500 // limit - fetch all universal colors
  );

  const { data: hmColors = [], isLoading: hmLoading } = useHMColors(
    hmColorMasterFilter !== "all" ? hmColorMasterFilter : undefined,
    hmColorValueFilter !== "all" ? hmColorValueFilter : undefined,
    0,    // skip
    5000, // limit - fetch all H&M colors (3860+ records)
    hasVisitedHMTab || activeTab === "hm" // Only load when tab is visited
  );

  // Mutations
  const createUniversalMutation = useCreateUniversalColor();
  const updateUniversalMutation = useUpdateUniversalColor();
  const deleteUniversalMutation = useDeleteUniversalColor();

  const createHMMutation = useCreateHMColor();
  const updateHMMutation = useUpdateHMColor();
  const deleteHMMutation = useDeleteHMColor();

  // Filter universal colors
  const filteredUniversalColors = useMemo(() => {
    let filtered = universalColors as UniversalColor[];
    if (universalSearchTerm) {
      const term = universalSearchTerm.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.color_name.toLowerCase().includes(term) ||
          c.color_code.toLowerCase().includes(term) ||
          (c.pantone_code?.toLowerCase().includes(term)) ||
          (c.tcx_code?.toLowerCase().includes(term)) ||
          c.hex_code.toLowerCase().includes(term)
      );
    }
    return filtered;
  }, [universalColors, universalSearchTerm]);

  // Filter H&M colors
  const filteredHMColors = useMemo(() => {
    let filtered = hmColors as HMColor[];
    if (hmSearchTerm) {
      const term = hmSearchTerm.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.color_code.toLowerCase().includes(term) ||
          c.color_master.toLowerCase().includes(term) ||
          (c.color_value?.toLowerCase().includes(term)) ||
          (c.mixed_name?.toLowerCase().includes(term))
      );
    }
    return filtered;
  }, [hmColors, hmSearchTerm]);

  // Paginate H&M colors for performance
  const paginatedHMColors = useMemo(() => {
    const startIndex = (hmPage - 1) * hmPageSize;
    return filteredHMColors.slice(startIndex, startIndex + hmPageSize);
  }, [filteredHMColors, hmPage, hmPageSize]);

  const hmTotalPages = Math.ceil(filteredHMColors.length / hmPageSize);

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setHMPage(1);
  }, [hmSearchTerm, hmColorMasterFilter, hmColorValueFilter]);

  // Track when H&M tab is visited for lazy loading
  React.useEffect(() => {
    if (activeTab === "hm" && !hasVisitedHMTab) {
      setHasVisitedHMTab(true);
    }
  }, [activeTab, hasVisitedHMTab]);

  // Calculate RGB from hex
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  };

  // Convert hex to HSL for color detection
  const hexToHsl = (hex: string): { h: number; s: number; l: number } => {
    const rgb = hexToRgb(hex);
    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }

    return { h: h * 360, s: s * 100, l: l * 100 };
  };

  // Detect color family from hex code
  const detectColorFamily = (hex: string): ColorFamilyEnum | "" => {
    const { h, s, l } = hexToHsl(hex);

    // Handle achromatic colors (very low saturation)
    if (s < 10) {
      if (l < 15) return "Black";
      if (l > 90) return "White";
      return "Grey";
    }

    // Handle very light colors
    if (l > 90) return "White";
    if (l < 10) return "Black";

    // Detect by hue ranges
    if (h >= 0 && h < 15) return "Red";
    if (h >= 15 && h < 45) return "Orange";
    if (h >= 45 && h < 70) return "Yellow";
    if (h >= 70 && h < 160) return "Green";
    if (h >= 160 && h < 200) return "Teal";
    if (h >= 200 && h < 250) return "Blue";
    if (h >= 250 && h < 290) return "Purple";
    if (h >= 290 && h < 330) return "Pink";
    if (h >= 330 && h <= 360) return "Red";

    // Special cases based on saturation and lightness
    if (s < 30 && l > 70 && l < 90) return "Beige";
    if (s < 30 && l > 85) return "Cream";

    return "";
  };

  // Detect color value (light/dark/bright) from hex code
  const detectColorValue = (hex: string): ColorValueEnum | "" => {
    const { s, l } = hexToHsl(hex);

    if (l > 75) return "Light";
    if (l < 25) return "Dark";
    if (s > 80 && l > 40 && l < 60) return "Bright";
    if (s > 90 && l > 55) return "Neon";
    if (s < 40 && l > 60 && l < 80) return "Pastel";
    if (s < 50 && l > 40 && l < 70) return "Dusty";
    if (s > 40 && l > 35 && l < 55) return "Medium";
    if (s < 60 && l > 30 && l < 50) return "Muted";

    return "Medium";
  };

  // Auto-fill from hex code
  const handleHexCodeChange = (newHex: string) => {
    const updates: Partial<typeof universalFormData> = { hex_code: newHex };

    // Only auto-detect if hex is valid
    if (/^#[0-9A-Fa-f]{6}$/.test(newHex)) {
      // Auto-detect color family if not already set
      if (!universalFormData.color_family) {
        const detectedFamily = detectColorFamily(newHex);
        if (detectedFamily) updates.color_family = detectedFamily;
      }
      // Auto-detect color value if not already set
      if (!universalFormData.color_value) {
        const detectedValue = detectColorValue(newHex);
        if (detectedValue) updates.color_value = detectedValue;
      }
    }

    setUniversalFormData({ ...universalFormData, ...updates });
  };

  // Auto-fill from Pantone code lookup
  const handlePantoneCodeChange = (pantoneCode: string) => {
    setUniversalFormData({ ...universalFormData, pantone_code: pantoneCode });

    // Search existing universal colors for matching Pantone code
    if (pantoneCode.length >= 3) {
      const matchingColor = (universalColors as UniversalColor[]).find(
        (c) => c.pantone_code?.toLowerCase() === pantoneCode.toLowerCase()
      );

      if (matchingColor) {
        setUniversalFormData((prev) => ({
          ...prev,
          pantone_code: pantoneCode,
          name: prev.name || matchingColor.color_name,
          hex_code: matchingColor.hex_code || prev.hex_code,
          tcx_code: matchingColor.tcx_code || prev.tcx_code,
          color_family: prev.color_family || matchingColor.color_family || "",
          color_type: matchingColor.color_type || prev.color_type,
          color_value: prev.color_value || matchingColor.color_value || "",
          description: prev.description || matchingColor.description || "",
        }));
        toast.success(`Found matching Pantone color: ${matchingColor.color_name}`);
      }
    }
  };

  // Auto-fill from TCX code lookup
  const handleTCXCodeChange = (tcxCode: string) => {
    setUniversalFormData({ ...universalFormData, tcx_code: tcxCode });

    // Search existing universal colors for matching TCX code
    if (tcxCode.length >= 3) {
      const matchingColor = (universalColors as UniversalColor[]).find(
        (c) => c.tcx_code?.toLowerCase() === tcxCode.toLowerCase()
      );

      if (matchingColor) {
        setUniversalFormData((prev) => ({
          ...prev,
          tcx_code: tcxCode,
          name: prev.name || matchingColor.color_name,
          hex_code: matchingColor.hex_code || prev.hex_code,
          pantone_code: matchingColor.pantone_code || prev.pantone_code,
          color_family: prev.color_family || matchingColor.color_family || "",
          color_type: matchingColor.color_type || prev.color_type,
          color_value: prev.color_value || matchingColor.color_value || "",
          description: prev.description || matchingColor.description || "",
        }));
        toast.success(`Found matching TCX color: ${matchingColor.color_name}`);
      }
    }
  };

  // Universal Color handlers
  const handleUniversalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const rgb = hexToRgb(universalFormData.hex_code);
      const data = {
        ...universalFormData,
        rgb_r: rgb.r,
        rgb_g: rgb.g,
        rgb_b: rgb.b,
        color_family: universalFormData.color_family || undefined,
        color_value: universalFormData.color_value || undefined,
        finish_type: universalFormData.finish_type || undefined,
      };

      if (editingUniversal) {
        await updateUniversalMutation.mutateAsync({ id: editingUniversal.id, data });
        toast.success("Universal color updated successfully");
      } else {
        await createUniversalMutation.mutateAsync(data);
        toast.success("Universal color created successfully");
      }
      setIsUniversalDialogOpen(false);
      resetUniversalForm();
    } catch (error: any) {
      toast.error(error?.message || "Failed to save color");
    }
  };

  const handleEditUniversal = (color: UniversalColor) => {
    setEditingUniversal(color);
    setUniversalFormData({
      name: color.color_name,
      hex_code: color.hex_code,
      pantone_code: color.pantone_code || "",
      tcx_code: color.tcx_code || "",
      color_family: color.color_family || "",
      color_type: color.color_type || "Solid",
      color_value: color.color_value || "",
      finish_type: color.finish_type || "",
      description: color.description || "",
      is_active: color.is_active,
    });
    setIsUniversalDialogOpen(true);
  };

  const handleDeleteUniversal = async (id: number) => {
    if (confirm("Are you sure you want to delete this color?")) {
      try {
        await deleteUniversalMutation.mutateAsync(id);
        toast.success("Color deleted successfully");
      } catch (error: any) {
        toast.error(error?.message || "Failed to delete color");
      }
    }
  };

  const resetUniversalForm = () => {
    setEditingUniversal(null);
    setUniversalFormData({
      name: "",
      hex_code: "#000000",
      pantone_code: "",
      tcx_code: "",
      color_family: "",
      color_type: "Solid",
      color_value: "",
      finish_type: "",
      description: "",
      is_active: true,
    });
  };

  // H&M Color handlers
  const handleHMSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        ...hmFormData,
      };

      if (editingHM) {
        await updateHMMutation.mutateAsync({ id: editingHM.id, data });
        toast.success("H&M color updated successfully");
      } else {
        await createHMMutation.mutateAsync(data);
        toast.success("H&M color created successfully");
      }
      setIsHMDialogOpen(false);
      resetHMForm();
    } catch (error: any) {
      toast.error(error?.message || "Failed to save H&M color");
    }
  };

  const handleEditHM = (color: HMColor) => {
    setEditingHM(color);
    setHMFormData({
      color_code: color.color_code,
      color_master: color.color_master,
      color_value: color.color_value || "",
      mixed_name: color.mixed_name || "",
      is_active: color.is_active,
    });
    setIsHMDialogOpen(true);
  };

  const handleDeleteHM = async (id: number) => {
    if (confirm("Are you sure you want to delete this H&M color?")) {
      try {
        await deleteHMMutation.mutateAsync(id);
        toast.success("H&M color deleted successfully");
      } catch (error: any) {
        toast.error(error?.message || "Failed to delete H&M color");
      }
    }
  };

  const resetHMForm = () => {
    setEditingHM(null);
    setHMFormData({
      color_code: "",
      color_master: "",
      color_value: "",
      mixed_name: "",
      is_active: true,
    });
  };

  // Group colors by family for dashboard
  const colorsByFamily = useMemo(() => {
    const grouped: Record<string, { count: number; colors: string[] }> = {};
    (universalColors as UniversalColor[]).forEach(color => {
      const family = color.color_family || "Other";
      if (!grouped[family]) {
        grouped[family] = { count: 0, colors: [] };
      }
      grouped[family].count++;
      if (grouped[family].colors.length < 5) {
        grouped[family].colors.push(color.hex_code);
      }
    });
    return grouped;
  }, [universalColors]);

  if (!user?.is_superuser) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="p-8 text-center">
          <Shield className="h-16 w-16 mx-auto mb-4 text-destructive" />
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">
            You need administrator privileges to access this page.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <SwatchBook className="h-8 w-8" />
          Color Master
        </h1>
        <p className="text-muted-foreground">
          Manage Universal Colors (Pantone/TCX/RGB/Hex) and H&M proprietary color codes
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 lg:w-[500px]">
          <TabsTrigger value="dashboard" className="gap-2">
            <Palette className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="universal" className="gap-2">
            <Globe className="h-4 w-4" />
            Universal
          </TabsTrigger>
          <TabsTrigger value="hm" className="gap-2">
            <Building2 className="h-4 w-4" />
            H&M Colors
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Universal Colors Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Universal Colors
                </CardTitle>
                <CardDescription>Industry standard color codes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{(universalColors as UniversalColor[]).length}</div>
                <p className="text-sm text-muted-foreground">Total colors with Pantone/TCX/Hex codes</p>
                <div className="mt-4 grid grid-cols-5 gap-2">
                  {colorFamilyOptions.slice(0, 10).map((family) => {
                    const data = colorsByFamily[family.value];
                    if (!data) return null;
                    return (
                      <div key={family.value} className="text-center">
                        <div
                          className="w-8 h-8 rounded-full mx-auto border"
                          style={{ backgroundColor: family.hex }}
                          title={family.label}
                        />
                        <div className="text-xs mt-1">{data.count}</div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* H&M Colors Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  H&M Colors
                </CardTitle>
                <CardDescription>H&M proprietary color codes with master/value structure</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{(hmColors as HMColor[]).length}</div>
                <p className="text-sm text-muted-foreground">Total H&M color codes imported from Excel</p>
                <div className="mt-4 space-y-2">
                  {/* Show top color masters */}
                  {(() => {
                    const colorMasters = (hmColors as HMColor[]).reduce((acc, color) => {
                      const master = color.color_master;
                      acc[master] = (acc[master] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>);
                    
                    return Object.entries(colorMasters)
                      .sort(([,a], [,b]) => b - a)
                      .slice(0, 4)
                      .map(([master, count]) => (
                        <div key={master} className="flex justify-between text-sm">
                          <span>{master}</span>
                          <Badge variant="secondary">{count}</Badge>
                        </div>
                      ));
                  })()}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Info Cards */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Color Code Systems
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div className="p-3 bg-muted rounded">
                  <h4 className="font-semibold mb-1 flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Pantone
                  </h4>
                  <p className="text-muted-foreground">
                    Universal color matching system (e.g., 19-3921)
                  </p>
                </div>
                <div className="p-3 bg-muted rounded">
                  <h4 className="font-semibold mb-1 flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    TCX Codes
                  </h4>
                  <p className="text-muted-foreground">
                    Textile Color eXtended from Pantone (e.g., 13-0552 TCX)
                  </p>
                </div>
                <div className="p-3 bg-muted rounded">
                  <h4 className="font-semibold mb-1 flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Hex/RGB
                  </h4>
                  <p className="text-muted-foreground">
                    Digital color codes for screen display (#FF5733)
                  </p>
                </div>
                <div className="p-3 bg-muted rounded">
                  <h4 className="font-semibold mb-1 flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    H&M Codes
                  </h4>
                  <p className="text-muted-foreground">
                    H&M proprietary color codes with master/value structure
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Universal Colors Tab */}
        <TabsContent value="universal" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, Pantone, TCX..."
                  value={universalSearchTerm}
                  onChange={(e) => setUniversalSearchTerm(e.target.value)}
                  className="pl-8 w-[250px]"
                />
              </div>
              <Select value={universalFamilyFilter} onValueChange={setUniversalFamilyFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Color Family" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Families</SelectItem>
                  {colorFamilyOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: opt.hex }}
                        />
                        {opt.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={universalTypeFilter} onValueChange={setUniversalTypeFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Color Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {colorTypeOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Dialog
              open={isUniversalDialogOpen}
              onOpenChange={(open) => {
                setIsUniversalDialogOpen(open);
                if (!open) resetUniversalForm();
              }}
            >
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Universal Color
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingUniversal ? "Edit Universal Color" : "Add Universal Color"}
                  </DialogTitle>
                  <DialogDescription>
                    Add a color with Pantone, TCX, RGB, or Hex codes
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleUniversalSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Color Name *</Label>
                      <Input
                        id="name"
                        value={universalFormData.name}
                        onChange={(e) =>
                          setUniversalFormData({ ...universalFormData, name: e.target.value })
                        }
                        placeholder="e.g., Navy Blue"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="hex_code">Hex Code * (auto-detects family & value)</Label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={universalFormData.hex_code}
                            onChange={(e) => handleHexCodeChange(e.target.value)}
                            className="w-12 h-9 p-1 cursor-pointer"
                          />
                          <Input
                            id="hex_code"
                            value={universalFormData.hex_code}
                            onChange={(e) => handleHexCodeChange(e.target.value)}
                            placeholder="#000000"
                            pattern="^#[0-9A-Fa-f]{6}$"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>RGB (Auto-calculated)</Label>
                        <div className="text-sm text-muted-foreground p-2 bg-muted rounded">
                          {(() => {
                            const rgb = hexToRgb(universalFormData.hex_code);
                            return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
                          })()}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="pantone_code">Pantone Code (auto-fills from database)</Label>
                        <Input
                          id="pantone_code"
                          value={universalFormData.pantone_code}
                          onChange={(e) => handlePantoneCodeChange(e.target.value)}
                          placeholder="e.g., 19-3921"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tcx_code">TCX Code (auto-fills from database)</Label>
                        <Input
                          id="tcx_code"
                          value={universalFormData.tcx_code}
                          onChange={(e) => handleTCXCodeChange(e.target.value)}
                          placeholder="e.g., 13-0552 TCX"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="color_family">Color Family (auto from hex)</Label>
                        <Select
                          value={universalFormData.color_family}
                          onValueChange={(v: ColorFamilyEnum) =>
                            setUniversalFormData({ ...universalFormData, color_family: v })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Auto-detected or select" />
                          </SelectTrigger>
                          <SelectContent>
                            {colorFamilyOptions.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                <div className="flex items-center gap-2">
                                  <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: opt.hex }}
                                  />
                                  {opt.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="color_type">Color Type</Label>
                        <Select
                          value={universalFormData.color_type}
                          onValueChange={(v: ColorTypeEnum) =>
                            setUniversalFormData({ ...universalFormData, color_type: v })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {colorTypeOptions.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="color_value">Color Value (auto from hex)</Label>
                        <Select
                          value={universalFormData.color_value}
                          onValueChange={(v: ColorValueEnum) =>
                            setUniversalFormData({ ...universalFormData, color_value: v })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Auto-detected or select" />
                          </SelectTrigger>
                          <SelectContent>
                            {colorValueOptions.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="finish_type">Finish Type</Label>
                        <Select
                          value={universalFormData.finish_type}
                          onValueChange={(v: FinishTypeEnum) =>
                            setUniversalFormData({ ...universalFormData, finish_type: v })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select finish" />
                          </SelectTrigger>
                          <SelectContent>
                            {finishTypeOptions.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={universalFormData.description}
                        onChange={(e) =>
                          setUniversalFormData({ ...universalFormData, description: e.target.value })
                        }
                        placeholder="Additional notes"
                        rows={2}
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="is_active"
                        checked={universalFormData.is_active}
                        onCheckedChange={(checked) =>
                          setUniversalFormData({ ...universalFormData, is_active: !!checked })
                        }
                      />
                      <Label htmlFor="is_active" className="cursor-pointer">Active</Label>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={createUniversalMutation.isPending || updateUniversalMutation.isPending}>
                      {editingUniversal ? "Update" : "Create"} Color
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="text-sm text-muted-foreground">
            Showing {filteredUniversalColors.length} of {(universalColors as UniversalColor[]).length} universal colors
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Color</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Pantone</TableHead>
                  <TableHead>TCX</TableHead>
                  <TableHead>Hex</TableHead>
                  <TableHead>Family</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {universalLoading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : filteredUniversalColors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground">
                      {universalSearchTerm || universalFamilyFilter !== "all" || universalTypeFilter !== "all"
                        ? "No colors found matching your filters."
                        : "No universal colors yet. Add your first color."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUniversalColors.map((color) => (
                    <TableRow key={color.id}>
                      <TableCell>
                        <div
                          className="w-8 h-8 rounded-md border shadow-sm"
                          style={{ backgroundColor: color.hex_code }}
                          title={color.hex_code}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{color.color_name}</TableCell>
                      <TableCell>
                        {color.pantone_code && (
                          <code className="px-1.5 py-0.5 bg-muted rounded text-xs">
                            {color.pantone_code}
                          </code>
                        )}
                      </TableCell>
                      <TableCell>
                        {color.tcx_code && (
                          <code className="px-1.5 py-0.5 bg-muted rounded text-xs">
                            {color.tcx_code}
                          </code>
                        )}
                      </TableCell>
                      <TableCell>
                        <code className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">
                          {color.hex_code}
                        </code>
                      </TableCell>
                      <TableCell>
                        {color.color_family && <Badge variant="outline">{color.color_family}</Badge>}
                      </TableCell>
                      <TableCell>{color.color_type || "Solid"}</TableCell>
                      <TableCell>
                        <Badge variant={color.is_active ? "default" : "secondary"}>
                          {color.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleEditUniversal(color)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteUniversal(color.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* H&M Colors Tab */}
        <TabsContent value="hm" className="space-y-4">
          <Card className="bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
            <CardContent className="py-3">
              <p className="text-sm text-amber-800 dark:text-amber-200 flex items-center gap-2">
                <Info className="h-4 w-4" />
                H&M colors imported from Excel with Color Code, Color Master, Color Value, and Mixed Name fields.
              </p>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search code, master, value..."
                  value={hmSearchTerm}
                  onChange={(e) => setHMSearchTerm(e.target.value)}
                  className="pl-8 w-[250px]"
                />
              </div>
              <Select value={hmColorMasterFilter} onValueChange={setHMColorMasterFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Colour Master" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Masters</SelectItem>
                  {(() => {
                    const masters = [...new Set((hmColors as HMColor[]).map(c => c.color_master))].sort();
                    return masters.map((master) => (
                      <SelectItem key={master} value={master}>
                        {master}
                      </SelectItem>
                    ));
                  })()}
                </SelectContent>
              </Select>
              <Select value={hmColorValueFilter} onValueChange={setHMColorValueFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Colour Value" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Values</SelectItem>
                  {(() => {
                    const values = [...new Set((hmColors as HMColor[]).map(c => c.color_value).filter(Boolean))].sort();
                    return values.map((value) => (
                      <SelectItem key={value} value={value!}>
                        {value}
                      </SelectItem>
                    ));
                  })()}
                </SelectContent>
              </Select>
            </div>

            <Dialog
              open={isHMDialogOpen}
              onOpenChange={(open) => {
                setIsHMDialogOpen(open);
                if (!open) resetHMForm();
              }}
            >
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add H&M Color
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingHM ? "Edit H&M Color" : "Add H&M Color"}
                  </DialogTitle>
                  <DialogDescription>
                    Add an H&M color with code, master, value, and mixed name
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleHMSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="color_code">Colour Code *</Label>
                      <Input
                        id="color_code"
                        value={hmFormData.color_code}
                        onChange={(e) =>
                          setHMFormData({ ...hmFormData, color_code: e.target.value })
                        }
                        placeholder="e.g., 51-138"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="color_master">Colour Master *</Label>
                      <Input
                        id="color_master"
                        value={hmFormData.color_master}
                        onChange={(e) =>
                          setHMFormData({ ...hmFormData, color_master: e.target.value })
                        }
                        placeholder="e.g., BEIGE"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="color_value">Colour Value</Label>
                      <Input
                        id="color_value"
                        value={hmFormData.color_value}
                        onChange={(e) =>
                          setHMFormData({ ...hmFormData, color_value: e.target.value })
                        }
                        placeholder="e.g., MEDIUM DUSTY"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="mixed_name">Mixed Name</Label>
                      <Input
                        id="mixed_name"
                        value={hmFormData.mixed_name}
                        onChange={(e) =>
                          setHMFormData({ ...hmFormData, mixed_name: e.target.value })
                        }
                        placeholder="e.g., BEIGE MEDIUM DUSTY"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="hm_is_active"
                        checked={hmFormData.is_active}
                        onCheckedChange={(checked) =>
                          setHMFormData({ ...hmFormData, is_active: !!checked })
                        }
                      />
                      <Label htmlFor="hm_is_active" className="cursor-pointer">Active</Label>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={createHMMutation.isPending || updateHMMutation.isPending}>
                      {editingHM ? "Update" : "Create"} H&M Color
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="text-sm text-muted-foreground">
            Showing {paginatedHMColors.length} of {filteredHMColors.length} filtered ({(hmColors as HMColor[]).length} total H&M colors)
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Colour Code</TableHead>
                  <TableHead>Colour Master</TableHead>
                  <TableHead>Colour Value</TableHead>
                  <TableHead>Mixed Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {hmLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : filteredHMColors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      {hmSearchTerm || hmColorMasterFilter !== "all" || hmColorValueFilter !== "all"
                        ? "No H&M colors found matching your filters."
                        : "No H&M colors yet. Add your first H&M color."}
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedHMColors.map((color) => (
                    <TableRow key={color.id}>
                      <TableCell>
                        <code className="px-2 py-1 bg-muted rounded text-sm font-mono font-bold">
                          {color.color_code}
                        </code>
                      </TableCell>
                      <TableCell className="font-medium">{color.color_master}</TableCell>
                      <TableCell>
                        {color.color_value && (
                          <Badge variant="outline">{color.color_value}</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {color.mixed_name}
                      </TableCell>
                      <TableCell>
                        <Badge variant={color.is_active ? "default" : "secondary"}>
                          {color.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleEditHM(color)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteHM(color.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          {filteredHMColors.length > hmPageSize && (
            <div className="flex items-center justify-between px-2">
              <div className="text-sm text-muted-foreground">
                Page {hmPage} of {hmTotalPages} ({filteredHMColors.length} total)
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setHMPage(1)}
                  disabled={hmPage === 1}
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setHMPage((p) => Math.max(1, p - 1))}
                  disabled={hmPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-1 mx-2">
                  {/* Show page numbers */}
                  {Array.from({ length: Math.min(5, hmTotalPages) }, (_, i) => {
                    let pageNum: number;
                    if (hmTotalPages <= 5) {
                      pageNum = i + 1;
                    } else if (hmPage <= 3) {
                      pageNum = i + 1;
                    } else if (hmPage >= hmTotalPages - 2) {
                      pageNum = hmTotalPages - 4 + i;
                    } else {
                      pageNum = hmPage - 2 + i;
                    }
                    return (
                      <Button
                        key={pageNum}
                        variant={hmPage === pageNum ? "default" : "outline"}
                        size="sm"
                        className="w-8 h-8 p-0"
                        onClick={() => setHMPage(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setHMPage((p) => Math.min(hmTotalPages, p + 1))}
                  disabled={hmPage === hmTotalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setHMPage(hmTotalPages)}
                  disabled={hmPage === hmTotalPages}
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* H&M Color Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Top Color Masters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {(() => {
                    const colorMasters = (hmColors as HMColor[]).reduce((acc, color) => {
                      const master = color.color_master;
                      acc[master] = (acc[master] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>);
                    
                    return Object.entries(colorMasters)
                      .sort(([,a], [,b]) => b - a)
                      .slice(0, 8)
                      .map(([master, count]) => (
                        <div key={master} className="flex justify-between text-sm">
                          <span className="font-medium">{master}</span>
                          <Badge variant="secondary">{count}</Badge>
                        </div>
                      ));
                  })()}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Top Color Values</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {(() => {
                    const colorValues = (hmColors as HMColor[]).reduce((acc, color) => {
                      if (color.color_value) {
                        acc[color.color_value] = (acc[color.color_value] || 0) + 1;
                      }
                      return acc;
                    }, {} as Record<string, number>);
                    
                    return Object.entries(colorValues)
                      .sort(([,a], [,b]) => b - a)
                      .slice(0, 8)
                      .map(([value, count]) => (
                        <div key={value} className="flex justify-between text-sm">
                          <span className="font-medium">{value}</span>
                          <Badge variant="secondary">{count}</Badge>
                        </div>
                      ));
                  })()}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
