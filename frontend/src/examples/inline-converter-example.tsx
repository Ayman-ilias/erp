/**
 * Example usage of InlineConverter component
 * 
 * This example demonstrates how to use the InlineConverter component
 * for inline unit conversion in forms.
 */

import React, { useState } from 'react';
import { InlineConverter } from '@/components/uom/InlineConverter';
import { UnitSelector } from '@/components/uom/UnitSelector';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function InlineConverterExample() {
  const [quantity, setQuantity] = useState<number>(5);
  const [unitId, setUnitId] = useState<number>(1); // Default to first unit (kg)
  
  return (
    <div className="space-y-6 p-4">
      <Card>
        <CardHeader>
          <CardTitle>InlineConverter Example</CardTitle>
          <CardDescription>
            Demonstrates inline unit conversion without changing the original form values
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Quantity Input */}
          <div>
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              placeholder="Enter quantity"
              min="0"
              step="0.01"
            />
          </div>
          
          {/* Unit Selection with Inline Converter */}
          <div>
            <Label htmlFor="unit">Unit</Label>
            <div className="flex items-center gap-2">
              <UnitSelector
                value={unitId}
                onChange={setUnitId}
                placeholder="Select unit..."
                className="flex-1"
              />
              <InlineConverter
                value={quantity}
                fromUnitId={unitId}
                disabled={!quantity || !unitId}
              />
            </div>
          </div>
          
          {/* Current Form State Display */}
          <div className="p-3 bg-muted rounded-md">
            <h4 className="font-medium text-sm mb-2">Current Form State:</h4>
            <div className="text-sm space-y-1">
              <div><strong>Quantity:</strong> {quantity}</div>
              <div><strong>Unit ID:</strong> {unitId}</div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Note: These values remain unchanged when using the inline converter.
            </p>
          </div>
        </CardContent>
      </Card>
      
      {/* Category-Filtered Example */}
      <Card>
        <CardHeader>
          <CardTitle>Category-Filtered Conversion</CardTitle>
          <CardDescription>
            Example with category filtering for weight units only
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="weight">Weight</Label>
            <div className="flex items-center gap-2">
              <Input
                id="weight"
                type="number"
                value={2.5}
                readOnly
                className="flex-1"
              />
              <UnitSelector
                value={1} // kg
                onChange={() => {}} // Read-only for demo
                categoryFilter="Weight"
                disabled
                className="flex-1"
              />
              <InlineConverter
                value={2.5}
                fromUnitId={1} // kg
                categoryName="Weight"
              />
            </div>
          </div>
          
          <div className="text-sm text-muted-foreground">
            This converter will only show weight units (kg, g, tola, seer, etc.)
          </div>
        </CardContent>
      </Card>
      
      {/* Textile Units Example */}
      <Card>
        <CardHeader>
          <CardTitle>Textile Units Example</CardTitle>
          <CardDescription>
            Example with textile-specific units
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="fabric-weight">Fabric Weight</Label>
            <div className="flex items-center gap-2">
              <Input
                id="fabric-weight"
                type="number"
                value={200}
                readOnly
                className="flex-1"
              />
              <UnitSelector
                value={50} // Assuming GSM unit ID
                onChange={() => {}} // Read-only for demo
                categoryFilter="Textile - Fabric Weight"
                disabled
                className="flex-1"
              />
              <InlineConverter
                value={200}
                fromUnitId={50} // GSM
                categoryName="Textile - Fabric Weight"
              />
            </div>
          </div>
          
          <div className="text-sm text-muted-foreground">
            This converter will only show textile fabric weight units (GSM, oz/yd², etc.)
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default InlineConverterExample;