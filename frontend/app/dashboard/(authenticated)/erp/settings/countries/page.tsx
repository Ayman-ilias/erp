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
import { PlusCircle, Edit, Trash2, Shield } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { settingsService } from "@/services/api";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";

export default function CountriesPage() {
  const { user, token } = useAuth();
  const [countries, setCountries] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [ports, setPorts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [isCountryDialogOpen, setIsCountryDialogOpen] = useState(false);
  const [isCityDialogOpen, setIsCityDialogOpen] = useState(false);
  const [isPortDialogOpen, setIsPortDialogOpen] = useState(false);

  const [editingCountry, setEditingCountry] = useState<any>(null);
  const [editingCity, setEditingCity] = useState<any>(null);
  const [editingPort, setEditingPort] = useState<any>(null);

  const [countryFormData, setCountryFormData] = useState({
    country_id: "",
    country_name: "",
    international_country_code: "",
    international_dialing_number: "",
    is_active: true,
  });

  const [cityFormData, setCityFormData] = useState({
    city_id: "",
    city_name: "",
    country_id: "",
    state_province: "",
    is_active: true,
  });

  const [portFormData, setPortFormData] = useState({
    country_id: "",
    city_id: "",
    locode: "",
    port_name: "",
    name_wo_diacritics: "",
    subdivision: "",
    function: "",
    status: "",
    iata: "",
    coordinates: "",
    remarks: "",
    is_active: true,
  });

  useEffect(() => {
    if (token && user?.is_superuser) {
      loadAllData();
    }
  }, [token, user]);

  const loadAllData = async () => {
    try {
      if (!token) return;
      setLoading(true);
      const [countryData, cityData, portData] = await Promise.all([
        settingsService.countries.getAll(token),
        settingsService.cities.getAll(token),
        settingsService.ports.getAll(token),
      ]);
      setCountries(Array.isArray(countryData) ? countryData : []);
      setCities(Array.isArray(cityData) ? cityData : []);
      setPorts(Array.isArray(portData) ? portData : []);
    } catch (error) {
      console.error("Error loading country data:", error);
      toast.error("Failed to load country data");
    } finally {
      setLoading(false);
    }
  };

  // Country handlers
  const handleCountrySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!token) return;
      if (editingCountry) {
        await settingsService.countries.update(editingCountry.id, countryFormData, token);
        toast.success("Country updated");
      } else {
        await settingsService.countries.create(countryFormData, token);
        toast.success("Country created");
      }
      setIsCountryDialogOpen(false);
      resetCountryForm();
      loadAllData();
    } catch (error: any) {
      toast.error(error?.message || "Failed to save country");
    }
  };

  const handleEditCountry = (item: any) => {
    setEditingCountry(item);
    setCountryFormData({
      country_id: item.country_id || "",
      country_name: item.country_name || "",
      international_country_code: item.international_country_code || "",
      international_dialing_number: item.international_dialing_number || "",
      is_active: item.is_active !== false,
    });
    setIsCountryDialogOpen(true);
  };

  const handleDeleteCountry = async (id: number) => {
    if (confirm("Delete this country?")) {
      try {
        if (!token) return;
        await settingsService.countries.delete(id, token);
        toast.success("Country deleted");
        loadAllData();
      } catch (error) {
        toast.error("Failed to delete country");
      }
    }
  };

  const resetCountryForm = () => {
    setEditingCountry(null);
    setCountryFormData({ country_id: "", country_name: "", international_country_code: "", international_dialing_number: "", is_active: true });
  };

  // City handlers
  const handleCitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!token) return;
      const data = { ...cityFormData, country_id: parseInt(cityFormData.country_id) };
      if (editingCity) {
        await settingsService.cities.update(editingCity.id, data, token);
        toast.success("City updated");
      } else {
        await settingsService.cities.create(data, token);
        toast.success("City created");
      }
      setIsCityDialogOpen(false);
      resetCityForm();
      loadAllData();
    } catch (error: any) {
      toast.error(error?.message || "Failed to save city");
    }
  };

  const handleEditCity = (item: any) => {
    setEditingCity(item);
    setCityFormData({
      city_id: item.city_id || "",
      city_name: item.city_name || "",
      country_id: item.country_id?.toString() || "",
      state_province: item.state_province || "",
      is_active: item.is_active !== false,
    });
    setIsCityDialogOpen(true);
  };

  const handleDeleteCity = async (id: number) => {
    if (confirm("Delete this city?")) {
      try {
        if (!token) return;
        await settingsService.cities.delete(id, token);
        toast.success("City deleted");
        loadAllData();
      } catch (error) {
        toast.error("Failed to delete city");
      }
    }
  };

  const resetCityForm = () => {
    setEditingCity(null);
    setCityFormData({ city_id: "", city_name: "", country_id: "", state_province: "", is_active: true });
  };

  // Port handlers
  const handlePortSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!token) return;
      const data = {
        ...portFormData,
        country_id: portFormData.country_id ? parseInt(portFormData.country_id) : null,
        city_id: portFormData.city_id ? parseInt(portFormData.city_id) : null,
      };
      if (editingPort) {
        await settingsService.ports.update(editingPort.id, data, token);
        toast.success("Port updated");
      } else {
        await settingsService.ports.create(data, token);
        toast.success("Port created");
      }
      setIsPortDialogOpen(false);
      resetPortForm();
      loadAllData();
    } catch (error: any) {
      toast.error(error?.message || "Failed to save port");
    }
  };

  const handleEditPort = (item: any) => {
    setEditingPort(item);
    setPortFormData({
      country_id: item.country_id?.toString() || "",
      city_id: item.city_id?.toString() || "",
      locode: item.locode || "",
      port_name: item.port_name || "",
      name_wo_diacritics: item.name_wo_diacritics || "",
      subdivision: item.subdivision || "",
      function: item.function || "",
      status: item.status || "",
      iata: item.iata || "",
      coordinates: item.coordinates || "",
      remarks: item.remarks || "",
      is_active: item.is_active !== false,
    });
    setIsPortDialogOpen(true);
  };

  const handleDeletePort = async (id: number) => {
    if (confirm("Delete this port?")) {
      try {
        if (!token) return;
        await settingsService.ports.delete(id, token);
        toast.success("Port deleted");
        loadAllData();
      } catch (error) {
        toast.error("Failed to delete port");
      }
    }
  };

  const resetPortForm = () => {
    setEditingPort(null);
    setPortFormData({ country_id: "", city_id: "", locode: "", port_name: "", name_wo_diacritics: "", subdivision: "", function: "", status: "", iata: "", coordinates: "", remarks: "", is_active: true });
  };

  const getCountryName = (id: number) => countries.find((c) => c.id === id)?.country_name || "-";
  const getCityName = (id: number) => cities.find((c) => c.id === id)?.city_name || "-";

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Country Master</h1>
        <p className="text-muted-foreground">Manage countries, cities, and ports (UN/LOCODE)</p>
      </div>

      <Tabs defaultValue="countries" className="space-y-4">
        <TabsList>
          <TabsTrigger value="countries">Countries</TabsTrigger>
          <TabsTrigger value="cities">Cities</TabsTrigger>
          <TabsTrigger value="ports">Ports</TabsTrigger>
        </TabsList>

        {/* Countries Tab */}
        <TabsContent value="countries" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={isCountryDialogOpen} onOpenChange={(open) => { setIsCountryDialogOpen(open); if (!open) resetCountryForm(); }}>
              <DialogTrigger asChild>
                <Button><PlusCircle className="mr-2 h-4 w-4" />Add Country</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingCountry ? "Edit" : "Add"} Country</DialogTitle>
                  <DialogDescription>ISO 3166 country information</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCountrySubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Country ID *</Label>
                        <Input value={countryFormData.country_id} onChange={(e) => setCountryFormData({ ...countryFormData, country_id: e.target.value.toUpperCase() })} placeholder="BD" maxLength={3} required />
                      </div>
                      <div className="space-y-2">
                        <Label>ISO Code</Label>
                        <Input value={countryFormData.international_country_code} onChange={(e) => setCountryFormData({ ...countryFormData, international_country_code: e.target.value.toUpperCase() })} placeholder="BGD" maxLength={3} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Country Name *</Label>
                      <Input value={countryFormData.country_name} onChange={(e) => setCountryFormData({ ...countryFormData, country_name: e.target.value })} placeholder="Bangladesh" required />
                    </div>
                    <div className="space-y-2">
                      <Label>Dialing Code</Label>
                      <Input value={countryFormData.international_dialing_number} onChange={(e) => setCountryFormData({ ...countryFormData, international_dialing_number: e.target.value })} placeholder="+880" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="country_active" checked={countryFormData.is_active} onCheckedChange={(c) => setCountryFormData({ ...countryFormData, is_active: !!c })} />
                      <Label htmlFor="country_active">Active</Label>
                    </div>
                  </div>
                  <DialogFooter><Button type="submit">{editingCountry ? "Update" : "Create"}</Button></DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>ISO Code</TableHead>
                  <TableHead>Dialing Code</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {countries.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">{loading ? "Loading..." : "No countries"}</TableCell></TableRow>
                ) : (
                  countries.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.country_id}</TableCell>
                      <TableCell>{item.country_name}</TableCell>
                      <TableCell>{item.international_country_code || "-"}</TableCell>
                      <TableCell>{item.international_dialing_number || "-"}</TableCell>
                      <TableCell><Badge variant={item.is_active ? "default" : "secondary"}>{item.is_active ? "Active" : "Inactive"}</Badge></TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleEditCountry(item)}><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteCountry(item.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Cities Tab */}
        <TabsContent value="cities" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={isCityDialogOpen} onOpenChange={(open) => { setIsCityDialogOpen(open); if (!open) resetCityForm(); }}>
              <DialogTrigger asChild>
                <Button><PlusCircle className="mr-2 h-4 w-4" />Add City</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingCity ? "Edit" : "Add"} City</DialogTitle>
                  <DialogDescription>City within a country</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCitySubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>City ID *</Label>
                        <Input value={cityFormData.city_id} onChange={(e) => setCityFormData({ ...cityFormData, city_id: e.target.value.toUpperCase() })} placeholder="DHK" required />
                      </div>
                      <div className="space-y-2">
                        <Label>Country *</Label>
                        <Select value={cityFormData.country_id} onValueChange={(v) => setCityFormData({ ...cityFormData, country_id: v })}>
                          <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                          <SelectContent>
                            {countries.map((c) => (<SelectItem key={c.id} value={c.id.toString()}>{c.country_name}</SelectItem>))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>City Name *</Label>
                      <Input value={cityFormData.city_name} onChange={(e) => setCityFormData({ ...cityFormData, city_name: e.target.value })} placeholder="Dhaka" required />
                    </div>
                    <div className="space-y-2">
                      <Label>State/Province</Label>
                      <Input value={cityFormData.state_province} onChange={(e) => setCityFormData({ ...cityFormData, state_province: e.target.value })} placeholder="Dhaka Division" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="city_active" checked={cityFormData.is_active} onCheckedChange={(c) => setCityFormData({ ...cityFormData, is_active: !!c })} />
                      <Label htmlFor="city_active">Active</Label>
                    </div>
                  </div>
                  <DialogFooter><Button type="submit">{editingCity ? "Update" : "Create"}</Button></DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>State/Province</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cities.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">{loading ? "Loading..." : "No cities"}</TableCell></TableRow>
                ) : (
                  cities.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.city_id}</TableCell>
                      <TableCell>{item.city_name}</TableCell>
                      <TableCell>{getCountryName(item.country_id)}</TableCell>
                      <TableCell>{item.state_province || "-"}</TableCell>
                      <TableCell><Badge variant={item.is_active ? "default" : "secondary"}>{item.is_active ? "Active" : "Inactive"}</Badge></TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleEditCity(item)}><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteCity(item.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Ports Tab */}
        <TabsContent value="ports" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={isPortDialogOpen} onOpenChange={(open) => { setIsPortDialogOpen(open); if (!open) resetPortForm(); }}>
              <DialogTrigger asChild>
                <Button><PlusCircle className="mr-2 h-4 w-4" />Add Port</Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{editingPort ? "Edit" : "Add"} Port</DialogTitle>
                  <DialogDescription>UN/LOCODE port information</DialogDescription>
                </DialogHeader>
                <form onSubmit={handlePortSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Country</Label>
                        <Select value={portFormData.country_id} onValueChange={(v) => setPortFormData({ ...portFormData, country_id: v })}>
                          <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                          <SelectContent>
                            {countries.map((c) => (<SelectItem key={c.id} value={c.id.toString()}>{c.country_name}</SelectItem>))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>City</Label>
                        <Select value={portFormData.city_id} onValueChange={(v) => setPortFormData({ ...portFormData, city_id: v })}>
                          <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                          <SelectContent>
                            {cities.filter((c) => !portFormData.country_id || c.country_id === parseInt(portFormData.country_id)).map((c) => (<SelectItem key={c.id} value={c.id.toString()}>{c.city_name}</SelectItem>))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>LOCODE *</Label>
                        <Input value={portFormData.locode} onChange={(e) => setPortFormData({ ...portFormData, locode: e.target.value.toUpperCase() })} placeholder="BDCGP" required />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Port Name *</Label>
                        <Input value={portFormData.port_name} onChange={(e) => setPortFormData({ ...portFormData, port_name: e.target.value })} placeholder="Chittagong" required />
                      </div>
                      <div className="space-y-2">
                        <Label>Name (ASCII)</Label>
                        <Input value={portFormData.name_wo_diacritics} onChange={(e) => setPortFormData({ ...portFormData, name_wo_diacritics: e.target.value })} placeholder="Chittagong" />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Subdivision</Label>
                        <Input value={portFormData.subdivision} onChange={(e) => setPortFormData({ ...portFormData, subdivision: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>Function</Label>
                        <Input value={portFormData.function} onChange={(e) => setPortFormData({ ...portFormData, function: e.target.value })} placeholder="1234567" />
                      </div>
                      <div className="space-y-2">
                        <Label>IATA</Label>
                        <Input value={portFormData.iata} onChange={(e) => setPortFormData({ ...portFormData, iata: e.target.value.toUpperCase() })} placeholder="CGP" maxLength={3} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Coordinates</Label>
                        <Input value={portFormData.coordinates} onChange={(e) => setPortFormData({ ...portFormData, coordinates: e.target.value })} placeholder="2216N 09150E" />
                      </div>
                      <div className="space-y-2">
                        <Label>Status</Label>
                        <Input value={portFormData.status} onChange={(e) => setPortFormData({ ...portFormData, status: e.target.value })} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Remarks</Label>
                      <Input value={portFormData.remarks} onChange={(e) => setPortFormData({ ...portFormData, remarks: e.target.value })} />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="port_active" checked={portFormData.is_active} onCheckedChange={(c) => setPortFormData({ ...portFormData, is_active: !!c })} />
                      <Label htmlFor="port_active">Active</Label>
                    </div>
                  </div>
                  <DialogFooter><Button type="submit">{editingPort ? "Update" : "Create"}</Button></DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>LOCODE</TableHead>
                  <TableHead>Port Name</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>IATA</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ports.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">{loading ? "Loading..." : "No ports"}</TableCell></TableRow>
                ) : (
                  ports.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.locode}</TableCell>
                      <TableCell>{item.port_name}</TableCell>
                      <TableCell>{getCountryName(item.country_id)}</TableCell>
                      <TableCell>{getCityName(item.city_id)}</TableCell>
                      <TableCell>{item.iata || "-"}</TableCell>
                      <TableCell><Badge variant={item.is_active ? "default" : "secondary"}>{item.is_active ? "Active" : "Inactive"}</Badge></TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleEditPort(item)}><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeletePort(item.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
