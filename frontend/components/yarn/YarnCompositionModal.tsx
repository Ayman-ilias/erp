'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface YarnCompositionItem {
  material: string;
  percentage: number;
}

interface YarnCompositionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (composition: YarnCompositionItem[]) => void;
  initialComposition?: YarnCompositionItem[];
  title?: string;
}

const MATERIAL_OPTIONS = [
  'BCI COTTON',
  'RECYCLED',
  'POLYAMIDE',
  'ELASTANE',
  'POLYESTER',
  'VISCOSE',
  'MODAL',
  'TENCEL',
  'LINEN',
  'WOOL',
  'SILK',
  'ACRYLIC',
  'NYLON',
  'SPANDEX'
];

export default function YarnCompositionModal({
  isOpen,
  onClose,
  onSave,
  initialComposition = [],
  title = 'Yarn Composition'
}: YarnCompositionModalProps) {
  const [composition, setComposition] = useState<YarnCompositionItem[]>([]);
  const [totalPercentage, setTotalPercentage] = useState(0);

  useEffect(() => {
    if (isOpen) {
      if (initialComposition.length > 0) {
        setComposition([...initialComposition]);
      } else {
        // Start with one empty row
        setComposition([{ material: '', percentage: 0 }]);
      }
    }
  }, [isOpen, initialComposition]);

  useEffect(() => {
    const total = composition.reduce((sum, item) => sum + (item.percentage || 0), 0);
    setTotalPercentage(total);
  }, [composition]);

  const addCompositionRow = () => {
    setComposition([...composition, { material: '', percentage: 0 }]);
  };

  const removeCompositionRow = (index: number) => {
    if (composition.length > 1) {
      const newComposition = composition.filter((_, i) => i !== index);
      setComposition(newComposition);
    }
  };

  const updateCompositionItem = (index: number, field: keyof YarnCompositionItem, value: string | number) => {
    const newComposition = [...composition];
    if (field === 'percentage') {
      newComposition[index][field] = Number(value) || 0;
    } else {
      newComposition[index][field] = value as string;
    }
    setComposition(newComposition);
  };

  const handleSave = () => {
    // Validate composition
    const validComposition = composition.filter(item => item.material && item.percentage > 0);
    
    if (validComposition.length === 0) {
      toast.error('Please add at least one material with percentage');
      return;
    }

    const total = validComposition.reduce((sum, item) => sum + item.percentage, 0);
    if (Math.abs(total - 100) > 0.01) {
      toast.error(`Total percentage must equal 100%. Current total: ${total}%`);
      return;
    }

    // Check for duplicate materials
    const materials = validComposition.map(item => item.material);
    const uniqueMaterials = new Set(materials);
    if (materials.length !== uniqueMaterials.size) {
      toast.error('Duplicate materials are not allowed');
      return;
    }

    onSave(validComposition);
    onClose();
    toast.success('Yarn composition saved successfully');
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Header */}
          <div className="grid grid-cols-12 gap-2 text-sm font-medium text-gray-700 border-b pb-2">
            <div className="col-span-6">Material</div>
            <div className="col-span-4">Percentage</div>
            <div className="col-span-2">Action</div>
          </div>

          {/* Composition Rows */}
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {composition.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-6">
                  <Select
                    value={item.material}
                    onValueChange={(value) => updateCompositionItem(index, 'material', value)}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Select material" />
                    </SelectTrigger>
                    <SelectContent>
                      {MATERIAL_OPTIONS.map((material) => (
                        <SelectItem key={material} value={material}>
                          {material}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="col-span-4">
                  <div className="relative">
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={item.percentage || ''}
                      onChange={(e) => updateCompositionItem(index, 'percentage', e.target.value)}
                      className="h-9 pr-8"
                      placeholder="0"
                    />
                    <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                      %
                    </span>
                  </div>
                </div>
                
                <div className="col-span-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCompositionRow(index)}
                    disabled={composition.length === 1}
                    className="h-9 w-9 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Add Row Button */}
          <div className="flex justify-start">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addCompositionRow}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Material
            </Button>
          </div>

          {/* Total Display */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center">
              <Label className="text-sm font-medium">Total:</Label>
              <div className={`text-lg font-semibold ${
                Math.abs(totalPercentage - 100) < 0.01 
                  ? 'text-green-600' 
                  : totalPercentage > 100 
                    ? 'text-red-600' 
                    : 'text-orange-600'
              }`}>
                {totalPercentage.toFixed(1)}%
              </div>
            </div>
            {Math.abs(totalPercentage - 100) > 0.01 && (
              <p className="text-sm text-gray-500 mt-1">
                {totalPercentage < 100 
                  ? `Need ${(100 - totalPercentage).toFixed(1)}% more to reach 100%`
                  : `Exceeds 100% by ${(totalPercentage - 100).toFixed(1)}%`
                }
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={Math.abs(totalPercentage - 100) > 0.01 || composition.every(item => !item.material || item.percentage <= 0)}
          >
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}