"use client";

import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Save, Upload, X } from "lucide-react";
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
  const [logoUrl, setLogoUrl] = useState<string>("");
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
        if (data.logo_url) {
          setLogoUrl(data.logo_url);
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

    if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
      toast.error("Only PNG or JPG images allowed");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File too large. Max 5MB");
      return;
    }

    try {
      if (!token) {
        toast.error("Not authenticated");
        return;
      }
      setUploadingLogo(true);

      const result = await settingsService.companyProfile.uploadLogo(file, token);
      
      if (result.logo_url) {
        setLogoUrl(result.logo_url);
        setFormData({ ...formData, logo_url: result.logo_url });
        toast.success("Logo uploaded!");
      }
    } catch (error: any) {
      toast.error(error?.message || "Upload failed");
    } finally {
      setUploadingLogo(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveLogo = async () => {
    try {
      if (!token) return;
      const updatedData = { ...formData, logo_url: "" };
      setFormData(updatedData);
      setLogoUrl("");
      await settingsService.companyProfile.update({
        ...updatedData,
        default_currency_id: updatedData.default_currency_id ? parseInt(updatedData.default_currency_id) : null,
      }, token);
      toast.success("Logo removed");
    } catch (error: any) {
      toast.error("Failed to remove logo");
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
      toast.success("Saved successfully");
    } catch (error: any) {
      toast.error(error?.message || "Save failed");
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
                  {logoUrl && (
                    <div className="relative inline-block">
                      <div className="w-32 h-32 border-2 border-dashed border-muted-foreground/25 rounded-lg overflow-hidden bg-muted/50">
                        <img
                          src={logoUrl}
                          alt="Company Logo"
                          className="w-full h-full object-contain"
                          onError={() => {
                            toast.error("Failed to load logo");
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
                          {logoUrl ? "Change Logo" : "Upload Logo"}
                        </>
                      )}
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      PNG or JPG (max 5MB)
                    </span>
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
