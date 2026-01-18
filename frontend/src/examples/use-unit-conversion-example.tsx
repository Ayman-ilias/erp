/**
 * Example usage of useUnitConversion hook
 * 
 * This example demonstrates how to use the useUnitConversion hook
 * for inline unit conversion with debouncing.
 */

import React, { useState } from 'react';
import { useUnitConversion } from '@/hooks/use-units';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function UnitConversionExample() {
  const [value, setValue] = useState<number>(1);
  const [fromUnitId, setFromUnitId] = useState<number>(1); // kg
  const [toUnitId, setToUnitId] = useState<number>(2); // g
  
  const { convert, isConverting, convertedValue, error, reset } = useUnitConversion();

  const handleConvert = () => {
    convert({ value, fromUnitId, toUnitId });
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <h3 className="text-lg font-semibold">Unit Conversion Example</h3>
      
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="value">Value</Label>
          <Input
            id="value"
            type="number"
            value={value}
            onChange={(e) => setValue(Number(e.target.value))}
            placeholder="Enter value"
          />
        </div>
        
        <div>
          <Label htmlFor="fromUnit">From Unit ID</Label>
          <Input
            id="fromUnit"
            type="number"
            value={fromUnitId}
            onChange={(e) => setFromUnitId(Number(e.target.value))}
            placeholder="From unit ID"
          />
        </div>
        
        <div>
          <Label htmlFor="toUnit">To Unit ID</Label>
          <Input
            id="toUnit"
            type="number"
            value={toUnitId}
            onChange={(e) => setToUnitId(Number(e.target.value))}
            placeholder="To unit ID"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button onClick={handleConvert} disabled={isConverting}>
          {isConverting ? 'Converting...' : 'Convert'}
        </Button>
        <Button variant="outline" onClick={reset}>
          Reset
        </Button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-700 text-sm">Error: {error}</p>
        </div>
      )}

      {convertedValue && !error && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-md">
          <h4 className="font-medium text-green-800 mb-2">Conversion Result:</h4>
          <div className="text-sm text-green-700 space-y-1">
            <p>
              <strong>Original:</strong> {convertedValue.value} {convertedValue.from_unit.symbol}
            </p>
            <p>
              <strong>Converted:</strong> {convertedValue.result} {convertedValue.to_unit.symbol}
            </p>
            <p>
              <strong>Formula:</strong> {convertedValue.formula}
            </p>
            <p>
              <strong>From:</strong> {convertedValue.from_unit.name} ({convertedValue.from_unit.symbol})
            </p>
            <p>
              <strong>To:</strong> {convertedValue.to_unit.name} ({convertedValue.to_unit.symbol})
            </p>
          </div>
        </div>
      )}

      <div className="text-xs text-gray-500 mt-4">
        <p><strong>Note:</strong> This hook includes 300ms debouncing to avoid excessive API calls.</p>
        <p>Multiple rapid calls will be debounced and only the last one will execute.</p>
      </div>
    </div>
  );
}

export default UnitConversionExample;