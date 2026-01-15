"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/services/api";
import { toast } from "sonner";

export default function SamplesPage() {
  const [buyers, setBuyers] = useState<any[]>([]);
  const [styles, setStyles] = useState<any[]>([]);
  const [samples, setSamples] = useState<any[]>([]);
  const [selectedSample, setSelectedSample] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("part1");

  // Part 1 - Initial Sample Info
  const [part1Data, setPart1Data] = useState({
    sample_id: "",
    buyer_id: "",
    style_id: "",
    sample_type: "",
    sample_description: "",
    item: "",
    gauge: "",
    worksheet_rcv_date: "",
    notes: "",
  });

  // Part 2 - Additional Info
  const [part2Data, setPart2Data] = useState({
    yarn_rcv_date: "",
    required_date: "",
    color: "",
  });

  // Part 3 - Report Info
  const [part3Data, setPart3Data] = useState({
    assigned_designer: "",
    required_sample_quantity: 1,
    round: 1,
  });

  // Part 5 - Submit Status
  const [submitStatus, setSubmitStatus] = useState("");

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [buyersData, stylesData, samplesData] = await Promise.all([
        api.buyers.getAll(),
        api.styles.getAll(),
        api.samples.getAll(),
      ]);
      setBuyers(buyersData);
      setStyles(stylesData);
      setSamples(samplesData);
    } catch (error) {
      toast.error("Failed to load data");
      console.error(error);
    }
  };

  const handlePart1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const sampleData = {
        ...part1Data,
        buyer_id: parseInt(part1Data.buyer_id),
        style_id: parseInt(part1Data.style_id),
        worksheet_rcv_date: part1Data.worksheet_rcv_date ? new Date(part1Data.worksheet_rcv_date).toISOString() : null,
      };
      const newSample = await api.samples.create(sampleData);
      toast.success("Sample created successfully");
      setSamples([...samples, newSample]);
      setActiveTab("part2");
    } catch (error) {
      toast.error("Failed to create sample");
      console.error(error);
    }
  };

  const handleSelectSample = async (sampleId: string) => {
    try {
      const sample = await api.samples.getBySampleId(sampleId);
      setSelectedSample(sample);

      // Auto-fill data
      setPart1Data({
        sample_id: sample.sample_id,
        buyer_id: sample.buyer_id.toString(),
        style_id: sample.style_id.toString(),
        sample_type: sample.sample_type,
        sample_description: sample.sample_description || "",
        item: sample.item || "",
        gauge: sample.gauge || "",
        worksheet_rcv_date: sample.worksheet_rcv_date ? sample.worksheet_rcv_date.split('T')[0] : "",
        notes: sample.notes || "",
      });

      toast.success("Sample loaded");
    } catch (error) {
      toast.error("Sample not found");
      console.error(error);
    }
  };

  const handlePart2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSample) {
      toast.error("Please select a sample first");
      return;
    }

    try {
      const updateData = {
        ...part2Data,
        yarn_rcv_date: part2Data.yarn_rcv_date ? new Date(part2Data.yarn_rcv_date).toISOString() : null,
        required_date: part2Data.required_date ? new Date(part2Data.required_date).toISOString() : null,
      };
      await api.samples.update(selectedSample.id, updateData);
      toast.success("Sample updated");
      setActiveTab("part3");
    } catch (error) {
      toast.error("Failed to update sample");
      console.error(error);
    }
  };

  const handlePart3Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSample) {
      toast.error("Please select a sample first");
      return;
    }

    try {
      await api.samples.update(selectedSample.id, part3Data);
      toast.success("Report submitted");
      setActiveTab("part5");
    } catch (error) {
      toast.error("Failed to submit report");
      console.error(error);
    }
  };

  const handleSubmitStatus = async (status: string) => {
    if (!selectedSample) {
      toast.error("Please select a sample first");
      return;
    }

    try {
      const updateData = { submit_status: status };
      await api.samples.update(selectedSample.id, updateData);
      setSubmitStatus(status);
      toast.success(`Status updated to: ${status}`);

      if (status === "Reject and Request for remake") {
        toast.info("Round number has been incremented");
      }
    } catch (error) {
      toast.error("Failed to update status");
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Sample Department</h1>
        <p className="text-muted-foreground">Manage sample creation and approval workflow</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="part1">Part 1: Create</TabsTrigger>
          <TabsTrigger value="part2">Part 2: Info</TabsTrigger>
          <TabsTrigger value="part3">Part 3: Report</TabsTrigger>
          <TabsTrigger value="part5">Part 5: Status</TabsTrigger>
          <TabsTrigger value="part6">Part 6: Operations</TabsTrigger>
        </TabsList>

        <TabsContent value="part1">
          <Card>
            <CardHeader>
              <CardTitle>Part 1: Initial Sample Information</CardTitle>
              <CardDescription>Fill in the basic sample information manually</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePart1Submit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sample_id">Sample ID *</Label>
                    <Input
                      id="sample_id"
                      required
                      value={part1Data.sample_id}
                      onChange={(e) => setPart1Data({ ...part1Data, sample_id: e.target.value })}
                      placeholder="AUTO-001"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="buyer">Buyer *</Label>
                    <Select value={part1Data.buyer_id} onValueChange={(value) => setPart1Data({ ...part1Data, buyer_id: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select buyer" />
                      </SelectTrigger>
                      <SelectContent>
                        {buyers.map((buyer: any) => (
                          <SelectItem key={buyer.id} value={buyer.id.toString()}>
                            {buyer.buyer_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="style">Style *</Label>
                    <Select value={part1Data.style_id} onValueChange={(value) => setPart1Data({ ...part1Data, style_id: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select style" />
                      </SelectTrigger>
                      <SelectContent>
                        {styles.map((style: any) => (
                          <SelectItem key={style.id} value={style.id.toString()}>
                            {style.style_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sample_type">Sample Type *</Label>
                    <Select value={part1Data.sample_type} onValueChange={(value) => setPart1Data({ ...part1Data, sample_type: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Proto">Proto</SelectItem>
                        <SelectItem value="Fit">Fit</SelectItem>
                        <SelectItem value="PP">PP (Pre-Production)</SelectItem>
                        <SelectItem value="SMS">SMS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="item">Item</Label>
                    <Input
                      id="item"
                      value={part1Data.item}
                      onChange={(e) => setPart1Data({ ...part1Data, item: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gauge">Gauge</Label>
                    <Input
                      id="gauge"
                      value={part1Data.gauge}
                      onChange={(e) => setPart1Data({ ...part1Data, gauge: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="worksheet_rcv_date">Worksheet Received Date</Label>
                  <Input
                    id="worksheet_rcv_date"
                    type="date"
                    value={part1Data.worksheet_rcv_date}
                    onChange={(e) => setPart1Data({ ...part1Data, worksheet_rcv_date: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sample_description">Sample Description</Label>
                  <Textarea
                    id="sample_description"
                    value={part1Data.sample_description}
                    onChange={(e) => setPart1Data({ ...part1Data, sample_description: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={part1Data.notes}
                    onChange={(e) => setPart1Data({ ...part1Data, notes: e.target.value })}
                  />
                </div>

                <Button type="submit">Create Sample</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="part2">
          <Card>
            <CardHeader>
              <CardTitle>Part 2: Additional Information</CardTitle>
              <CardDescription>Select sample ID to auto-fill, then add additional details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="select_sample">Select Sample ID</Label>
                  <Select onValueChange={handleSelectSample}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select sample" />
                    </SelectTrigger>
                    <SelectContent>
                      {samples.map((sample: any) => (
                        <SelectItem key={sample.id} value={sample.sample_id}>
                          {sample.sample_id} - {sample.sample_type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedSample && (
                  <form onSubmit={handlePart2Submit} className="space-y-4">
                    <div className="rounded-lg border p-4 bg-muted/50">
                      <h3 className="font-semibold mb-2">Auto-filled Information</h3>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>Buyer: {buyers.find((b: any) => b.id === selectedSample.buyer_id)?.buyer_name}</div>
                        <div>Style: {styles.find((s: any) => s.id === selectedSample.style_id)?.style_name}</div>
                        <div>Type: {selectedSample.sample_type}</div>
                        <div>Worksheet Date: {selectedSample.worksheet_rcv_date || 'N/A'}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="yarn_rcv_date">Yarn Received Date</Label>
                        <Input
                          id="yarn_rcv_date"
                          type="date"
                          value={part2Data.yarn_rcv_date}
                          onChange={(e) => setPart2Data({ ...part2Data, yarn_rcv_date: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="required_date">Required Date</Label>
                        <Input
                          id="required_date"
                          type="date"
                          value={part2Data.required_date}
                          onChange={(e) => setPart2Data({ ...part2Data, required_date: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="color">Color</Label>
                      <Input
                        id="color"
                        value={part2Data.color}
                        onChange={(e) => setPart2Data({ ...part2Data, color: e.target.value })}
                      />
                    </div>

                    <Button type="submit">Update Sample</Button>
                  </form>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="part3">
          <Card>
            <CardHeader>
              <CardTitle>Part 3: Report</CardTitle>
              <CardDescription>Complete the sample report</CardDescription>
            </CardHeader>
            <CardContent>
              {selectedSample ? (
                <form onSubmit={handlePart3Submit} className="space-y-4">
                  <div className="rounded-lg border p-4 bg-muted/50">
                    <h3 className="font-semibold mb-2">Sample Information</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>Sample ID: {selectedSample.sample_id}</div>
                      <div>Color: {selectedSample.color || 'N/A'}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="assigned_designer">Assigned Designer</Label>
                      <Input
                        id="assigned_designer"
                        value={part3Data.assigned_designer}
                        onChange={(e) => setPart3Data({ ...part3Data, assigned_designer: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="required_sample_quantity">Required Sample Quantity</Label>
                      <Input
                        id="required_sample_quantity"
                        type="number"
                        min="1"
                        value={part3Data.required_sample_quantity}
                        onChange={(e) => setPart3Data({ ...part3Data, required_sample_quantity: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="round">Round</Label>
                    <Input
                      id="round"
                      type="number"
                      min="1"
                      value={part3Data.round}
                      onChange={(e) => setPart3Data({ ...part3Data, round: parseInt(e.target.value) })}
                      disabled
                    />
                    <p className="text-sm text-muted-foreground">Round increments automatically on rejection</p>
                  </div>

                  <Button type="submit">Submit Report</Button>
                </form>
              ) : (
                <p className="text-muted-foreground">Please select a sample from Part 2 first</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="part5">
          <Card>
            <CardHeader>
              <CardTitle>Part 5: Submit Status</CardTitle>
              <CardDescription>Update the sample submission status</CardDescription>
            </CardHeader>
            <CardContent>
              {selectedSample ? (
                <div className="space-y-4">
                  <div className="rounded-lg border p-4 bg-muted/50">
                    <h3 className="font-semibold mb-2">Current Sample</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>Sample ID: {selectedSample.sample_id}</div>
                      <div>Round: {selectedSample.round}</div>
                      <div>Current Status: {selectedSample.submit_status || 'Not set'}</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Select Submit Status</Label>
                    <div className="grid gap-2">
                      <Button
                        variant={submitStatus === "Approve" ? "default" : "outline"}
                        onClick={() => handleSubmitStatus("Approve")}
                        className="justify-start"
                      >
                        Approve
                      </Button>
                      <Button
                        variant={submitStatus === "Reject and Request for remake" ? "default" : "outline"}
                        onClick={() => handleSubmitStatus("Reject and Request for remake")}
                        className="justify-start"
                      >
                        Reject and Request for remake (Round +1)
                      </Button>
                      <Button
                        variant={submitStatus === "Proceed Next Stage With Comments" ? "default" : "outline"}
                        onClick={() => handleSubmitStatus("Proceed Next Stage With Comments")}
                        className="justify-start"
                      >
                        Proceed Next Stage With Comments
                      </Button>
                      <Button
                        variant={submitStatus === "Reject & Drop" ? "default" : "outline"}
                        onClick={() => handleSubmitStatus("Reject & Drop")}
                        className="justify-start"
                      >
                        Reject & Drop
                      </Button>
                      <Button
                        variant={submitStatus === "Drop" ? "default" : "outline"}
                        onClick={() => handleSubmitStatus("Drop")}
                        className="justify-start"
                      >
                        Drop
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">Please select a sample from Part 2 first</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="part6">
          <Card>
            <CardHeader>
              <CardTitle>Part 6: Operations & SMV Calculation</CardTitle>
              <CardDescription>Add operations and calculate SMV for the sample</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Coming soon: Operation type and name of operation management, SMV calculation, and Material Requirement Planning</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
