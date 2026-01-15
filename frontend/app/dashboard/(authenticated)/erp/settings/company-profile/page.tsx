"use client";

import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Save, Upload, X, Image as ImageIcon } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { settingsService } from "@/services/api";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";

export default function CompanyProfilePage() {
  const { user, token } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    company_name: "",
    legal_name: "",
    registration_number: "",
    tax_id: "",
    logo_url: "",
    website: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "",
    postal_code: "",
    default_currency_id: "",
    fiscal_year_start_month: 1,
  });

  useEffect(() => {
    if (token && user?.is_superuser) {
      loadProfile();
    }
  }, [token, user]);

  const loadProfile = async () => {
    try {
      if (!token) return;
      setLoading(true);
      const data = await settingsService.companyProfile.get(token);
      if (data) {
        setFormData({
          company_name: data.company_name || "",
          legal_name: data.legal_name || "",
          registration_number: data.registration_number || "",
          tax_id: data.tax_id || "",
          logo_url: data.logo_url || "",
          website: data.website || "",
          email: data.email || "",
          phone: data.phone || "",
          address: data.address || "",
          city: data.city || "",
          country: data.country || "",
          postal_code: data.postal_code || "",
          default_currency_id: data.default_currency_id?.toString() || "",
          fiscal_year_start_month: data.fiscal_year_start_month || 1,
        });
        // Set logo preview if logo_url exists
        if (data.logo_url) {
          setLogoPreview(data.logo_url);
        }
      }
    } catch (error) {
      console.error("Error loading company profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Invalid file type. Please upload a PNG or JPG image.");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size too large. Please upload an image smaller than 5MB.");
      return;
    }

    try {
      if (!token) {
        toast.error("Not authenticated");
        return;
      }
      setUploadingLogo(true);

      // Upload file first
      const result = await settingsService.companyProfile.uploadLogo(file, token);
      
      // Update form data with new logo URL from server
      setFormData({ ...formData, logo_url: result.logo_url });
      
      // Set preview to use the server URL (not base64)
      setLogoPreview(result.logo_url);
      
      toast.success("Logo uploaded successfully");
    } catch (error: any) {
      toast.error(error?.message || "Failed to upload logo");
      console.error(error);
    } finally {
      setUploadingLogo(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveLogo = async () => {
    try {
      if (!token) {
        toast.error("Not authenticated");
        return;
      }
      // Update form data and save to database
      const updatedData = { ...formData, logo_url: "" };
      setFormData(updatedData);
      setLogoPreview(null);
      
      // Save the change to database
      const data = {
        ...updatedData,
        default_currency_id: updatedData.default_currency_id ? parseInt(updatedData.default_currency_id) : null,
      };
      await settingsService.companyProfile.update(data, token);
      toast.success("Logo removed successfully");
    } catch (error: any) {
      toast.error("Failed to remove logo");
      console.error(error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!token) {
        toast.error("Not authenticated");
        return;
      }
      setSaving(true);
      const data = {
        ...formData,
        default_currency_id: formData.default_currency_id ? parseInt(formData.default_currency_id) : null,
      };
      await settingsService.companyProfile.update(data, token);
      toast.success("Company profile saved successfully");
    } catch (error: any) {
      toast.error(error?.message || "Failed to save company profile");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (!user?.is_superuser) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="p-8 text-center">
          <Shield className="h-16 w-16 mx-auto mb-4 text-destructive" />
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">You need administrator privileges.</p>
        </Card>
      </div>
    );
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Company Profile</h1>
        <p className="text-muted-foreground">Manage your company information</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Company identity and registration details</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company_name">Company Name *</Label>
                  <Input
                    id="company_name"
                    value={formData.company_name}
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                    placeholder="Southern Apparels & Holdings Ltd"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="legal_name">Legal Name</Label>
                  <Input
                    id="legal_name"
                    value={formData.legal_name}
                    onChange={(e) => setFormData({ ...formData, legal_name: e.target.value })}
                    placeholder="Southern Apparels & Holdings Limited"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="registration_number">Registration Number</Label>
                  <Input
                    id="registration_number"
                    value={formData.registration_number}
                    onChange={(e) => setFormData({ ...formData, registration_number: e.target.value })}
                    placeholder="REG-123456"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tax_id">Tax ID / VAT Number</Label>
                  <Input
                    id="tax_id"
                    value={formData.tax_id}
                    onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })}
                    placeholder="VAT-123456789"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="logo">Company Logo</Label>
                <div className="space-y-4">
                  {/* Logo Preview */}
                  {logoPreview && (
                    <div className="relative inline-block">
                      <div className="relative w-32 h-32 border-2 border-dashed border-muted-foreground/25 rounded-lg overflow-hidden bg-muted/50">
                        <img
                          key={logoPreview}
                          src={(() => {
                            let imageUrl = logoPreview;
                            
                            // Handle different URL formats
                            if (logoPreview.startsWith('http://') || logoPreview.startsWith('https://')) {
                              imageUrl = logoPreview; // External URL
                            } else if (logoPreview.startsWith('/api/v1/static/')) {
                              imageUrl = logoPreview; // Already has correct path
                            } else if (logoPreview.startsWith('/static/')) {
                              // Convert /static/ to /api/v1/static/
                              imageUrl = logoPreview.replace('/static/', '/api/v1/static/');
                            } else if (logoPreview.startsWith('/')) {
                              imageUrl = logoPreview; // Absolute path
                            } else {
                              imageUrl = `/api/v1/static/company_logos/${logoPreview}`; // Relative path
                            }
                            
                            return imageUrl;
                          })()}
                          alt="Company Logo"
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            const img = e.target as HTMLImageElement;
                            console.error("Failed to load logo");
                            console.error("Logo preview URL:", logoPreview);
                            console.error("Attempted image src:", img.src);
                            console.error("Full URL:", window.location.origin + img.src);
                            // Don't show toast on every error - might be temporary network issue
                            // toast.error("Failed to load logo image. Please check the URL or try uploading again.");
                          }}
                          onLoad={() => {
                            console.log("Logo loaded successfully from:", logoPreview);
                          }}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                        onClick={handleRemoveLogo}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                  
                  {/* Upload Button */}
                  <div className="flex items-center gap-4">
                    <input
                      ref={fileInputRef}
                      type="file"
                      id="logo"
                      accept="image/png,image/jpeg,image/jpg"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingLogo}
                    >
                      {uploadingLogo ? (
                        <>
                          <Upload className="mr-2 h-4 w-4 animate-pulse" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          {logoPreview ? "Change Logo" : "Upload Logo"}
                        </>
                      )}
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      PNG or JPG (max 5MB)
                    </span>
                  </div>
                  
                  {/* Logo URL Input (for manual URL entry) */}
                  <div className="space-y-2">
                    <Label htmlFor="logo_url" className="text-sm text-muted-foreground">
                      Or enter logo URL manually
                    </Label>
                    <Input
                      id="logo_url"
                      value={formData.logo_url}
                      onChange={(e) => {
                        setFormData({ ...formData, logo_url: e.target.value });
                        if (e.target.value) {
                          setLogoPreview(e.target.value);
                        } else {
                          setLogoPreview(null);
                        }
                      }}
                      placeholder="https://example.com/logo.png or /static/uploads/company_logos/logo.png"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>Company contact details</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="info@company.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+880 1234 567890"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://www.company.com"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Address</CardTitle>
              <CardDescription>Company physical address</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="address">Street Address</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="123 Industrial Area, Factory Road"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Dhaka"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    placeholder="Bangladesh"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postal_code">Postal Code</Label>
                  <Input
                    id="postal_code"
                    value={formData.postal_code}
                    onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                    placeholder="1000"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Financial Settings</CardTitle>
              <CardDescription>Default currency and fiscal year settings</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fiscal_year_start_month">Fiscal Year Start Month</Label>
                  <Input
                    id="fiscal_year_start_month"
                    type="number"
                    min={1}
                    max={12}
                    value={formData.fiscal_year_start_month}
                    onChange={(e) => setFormData({ ...formData, fiscal_year_start_month: parseInt(e.target.value) || 1 })}
                  />
                  <p className="text-xs text-muted-foreground">1 = January, 7 = July, etc.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
