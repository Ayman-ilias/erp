'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { toast } from 'sonner';
import YarnCompositionModal from './YarnCompositionModal';

interface YarnCompositionItem {
  material: string;
  percentage: number;
}

interface YarnData {
  yarn_id?: string;
  yarn_name: string;
  yarn_composition?: string;
  yarn_composition_details?: YarnCompositionItem[];
  blend_ratio?: string;
  yarn_count?: string;
  count_system?: string;
  yarn_type?: string;
  yarn_form?: string;
  tpi?: string;
  yarn_finish?: string;
  color?: string;
  dye_type?: string;
  uom: string;
  remarks?: string;
}

interface YarnManagementSectionProps {
  sampleId: string;
  onYarnAdded?: (yarn: YarnData) => void;
  existingYarns?: YarnData[];
  className?: string;
}

const COUNT_SYSTEMS = ['Ne', 'Nm', 'Tex', 'Denier', 'Dtex'];
const YARN_TYPES = ['Ring Spun', 'Open End', 'Compact', 'Combed', 'Carded', 'Rotor'];
const YARN_FORMS = ['Cone', 'Hank', 'Cheese', 'Bobbin', 'Spool'];
const DYE_TYPES = ['Reactive', 'Disperse', 'Acid', 'Direct', 'Vat', 'Pigment'];
const UOM_OPTIONS = ['kg', 'lbs', 'gram', 'meter', 'yard'];

export default function YarnManagementSection({
  sampleId,
  onYarnAdded,
  existingYarns = [],
  className = ''
}: YarnManagementSectionProps) {
  const [isAddingYarn, setIsAddingYarn] = useState(false);
  const [isCompositionModalOpen, setIsCompositionModalOpen] = useState(false);
  const [yarns, setYarns] = useState<YarnData[]>(existingYarns);
  const [currentYarn, setCurrentYarn] = useState<YarnData>({
    yarn_name: '',
    uom: 'kg'
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setYarns(existingYarns);
  }, [existingYarns]);

  const resetYarnForm = () => {
    setCurrentYarn({
      yarn_name: '',
      uom: 'kg'
    });
  };

  const handleInputChange = (field: keyof YarnData, value: string) => {
    setCurrentYarn(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCompositionSave = (composition: YarnCompositionItem[]) => {
    const compositionString = composition
      .map(item => `${item.material} ${item.percentage}%`)
      .join(', ');
    
    setCurrentYarn(prev => ({
      ...prev,
      yarn_composition: compositionString,
      yarn_composition_details: composition
    }));
  };

  const generateYarnId = async (yarnName: string) => {
    try {
      const response = await fetch(`/api/v1/samples/yarn-management/generate-yarn-id/${encodeURIComponent(yarnName)}`);
      if (response.ok) {
        const data = await response.json();
        return data.suggested_yarn_id;
      }
    } catch (error) {
      console.error('Failed to generate yarn ID:', error);
    }
    return null;
  };

  const handleSaveYarn = async () => {
    if (!currentYarn.yarn_name.trim()) {
      toast.error('Yarn name is required');
      return;
    }

    setIsLoading(true);
    try {
      // Generate yarn ID if not provided
      if (!currentYarn.yarn_id) {
        const generatedId = await generateYarnId(currentYarn.yarn_name);
        if (generatedId) {
          currentYarn.yarn_id = generatedId;
        }
      }

      // Create yarn via API
      const response = await fetch('/api/v1/samples/yarn-management/create-yarn', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...currentYarn,
          sample_id: sampleId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create yarn');
      }

      const result = await response.json();
      
      // Add to local state
      const newYarn = { ...currentYarn, yarn_id: result.yarn_id };
      setYarns(prev => [...prev, newYarn]);
      
      // Notify parent component
      if (onYarnAdded) {
        onYarnAdded(newYarn);
      }

      toast.success('Yarn created successfully');
      resetYarnForm();
      setIsAddingYarn(false);
      
    } catch (error) {
      console.error('Failed to create yarn:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create yarn');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelAdd = () => {
    resetYarnForm();
    setIsAddingYarn(false);
  };

  const renderCompositionBadges = (compositionDetails?: YarnCompositionItem[]) => {
    if (!compositionDetails || compositionDetails.length === 0) {
      return <span className="text-gray-400 text-sm">No composition details</span>;
    }

    return (
      <div className="flex flex-wrap gap-1">
        {compositionDetails.map((item, index) => (
          <Badge key={index} variant="secondary" className="text-xs">
            {item.material} {item.percentage}%
          </Badge>
        ))}
      </div>
    );
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Yarn Management</h3>
        {!isAddingYarn && (
          <Button
            onClick={() => setIsAddingYarn(true)}
            size="sm"
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add New Yarn
          </Button>
        )}
      </div>

      {/* Add Yarn Form */}
      {isAddingYarn && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Add New Yarn</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="yarn_name">Yarn Name *</Label>
                <Input
                  id="yarn_name"
                  value={currentYarn.yarn_name}
                  onChange={(e) => handleInputChange('yarn_name', e.target.value)}
                  placeholder="Enter yarn name"
                />
              </div>

              <div>
                <Label htmlFor="yarn_id">Yarn ID</Label>
                <Input
                  id="yarn_id"
                  value={currentYarn.yarn_id || ''}
                  onChange={(e) => handleInputChange('yarn_id', e.target.value)}
                  placeholder="Auto-generated if empty"
                />
              </div>

              <div>
                <Label>Yarn Composition</Label>
                <div className="flex gap-2">
                  <Input
                    value={currentYarn.yarn_composition || ''}
                    onChange={(e) => handleInputChange('yarn_composition', e.target.value)}
                    placeholder="Enter composition or use popup"
                    readOnly={!!currentYarn.yarn_composition_details?.length}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCompositionModalOpen(true)}
                    className="flex-shrink-0"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
                {currentYarn.yarn_composition_details && (
                  <div className="mt-2">
                    {renderCompositionBadges(currentYarn.yarn_composition_details)}
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="yarn_count">Yarn Count</Label>
                <Input
                  id="yarn_count"
                  value={currentYarn.yarn_count || ''}
                  onChange={(e) => handleInputChange('yarn_count', e.target.value)}
                  placeholder="e.g., 30s, 40s"
                />
              </div>

              <div>
                <Label htmlFor="count_system">Count System</Label>
                <Select
                  value={currentYarn.count_system || ''}
                  onValueChange={(value) => handleInputChange('count_system', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select count system" />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNT_SYSTEMS.map((system) => (
                      <SelectItem key={system} value={system}>
                        {system}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="yarn_type">Yarn Type</Label>
                <Select
                  value={currentYarn.yarn_type || ''}
                  onValueChange={(value) => handleInputChange('yarn_type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select yarn type" />
                  </SelectTrigger>
                  <SelectContent>
                    {YARN_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="yarn_form">Yarn Form</Label>
                <Select
                  value={currentYarn.yarn_form || ''}
                  onValueChange={(value) => handleInputChange('yarn_form', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select yarn form" />
                  </SelectTrigger>
                  <SelectContent>
                    {YARN_FORMS.map((form) => (
                      <SelectItem key={form} value={form}>
                        {form}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="color">Color</Label>
                <Input
                  id="color"
                  value={currentYarn.color || ''}
                  onChange={(e) => handleInputChange('color', e.target.value)}
                  placeholder="Enter color"
                />
              </div>

              <div>
                <Label htmlFor="dye_type">Dye Type</Label>
                <Select
                  value={currentYarn.dye_type || ''}
                  onValueChange={(value) => handleInputChange('dye_type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select dye type" />
                  </SelectTrigger>
                  <SelectContent>
                    {DYE_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="uom">Unit of Measure</Label>
                <Select
                  value={currentYarn.uom}
                  onValueChange={(value) => handleInputChange('uom', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {UOM_OPTIONS.map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="remarks">Remarks</Label>
              <Textarea
                id="remarks"
                value={currentYarn.remarks || ''}
                onChange={(e) => handleInputChange('remarks', e.target.value)}
                placeholder="Enter any additional remarks"
                rows={3}
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancelAdd}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveYarn}
                disabled={isLoading || !currentYarn.yarn_name.trim()}
              >
                {isLoading ? 'Creating...' : 'Create Yarn'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Existing Yarns List */}
      {yarns.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium">Associated Yarns ({yarns.length})</h4>
          {yarns.map((yarn, index) => (
            <Card key={yarn.yarn_id || index} className="border-l-4 border-l-blue-500">
              <CardContent className="pt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="font-medium">{yarn.yarn_name}</div>
                    <div className="text-sm text-gray-500">ID: {yarn.yarn_id}</div>
                    {yarn.yarn_count && (
                      <div className="text-sm text-gray-600">
                        Count: {yarn.yarn_count} {yarn.count_system}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <div className="text-sm">
                      <span className="font-medium">Type:</span> {yarn.yarn_type || 'N/A'}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Color:</span> {yarn.color || 'N/A'}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">UoM:</span> {yarn.uom}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium mb-1">Composition:</div>
                    {renderCompositionBadges(yarn.yarn_composition_details)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Yarn Composition Modal */}
      <YarnCompositionModal
        isOpen={isCompositionModalOpen}
        onClose={() => setIsCompositionModalOpen(false)}
        onSave={handleCompositionSave}
        initialComposition={currentYarn.yarn_composition_details || []}
        title="Edit Yarn Composition"
      />
    </div>
  );
}