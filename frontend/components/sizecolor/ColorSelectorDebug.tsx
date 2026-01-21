/**
 * Debug version of ColorSelector to diagnose API issues
 */

"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { useUniversalColorsForSelector, useHMColorsForSelector } from "@/hooks/use-sizecolor";

export function ColorSelectorDebug() {
  const { token, user } = useAuth();
  const [debugInfo, setDebugInfo] = useState<any>({});

  // Fetch data using hooks with error handling
  const { 
    data: universalColors, 
    isLoading: universalLoading, 
    error: universalError,
    isError: universalIsError 
  } = useUniversalColorsForSelector();
  
  const { 
    data: hmColors, 
    isLoading: hmLoading, 
    error: hmError,
    isError: hmIsError 
  } = useHMColorsForSelector();

  useEffect(() => {
    setDebugInfo({
      token: token ? `${token.substring(0, 10)}...` : 'No token',
      user: user ? user.username : 'No user',
      universalColors: universalColors ? `${universalColors.length} colors` : 'No data',
      universalLoading,
      universalError: universalError ? String(universalError) : 'No error',
      universalIsError,
      hmColors: hmColors ? `${hmColors.length} colors` : 'No data',
      hmLoading,
      hmError: hmError ? String(hmError) : 'No error',
      hmIsError,
    });
  }, [token, user, universalColors, universalLoading, universalError, universalIsError, hmColors, hmLoading, hmError, hmIsError]);

  return (
    <div className="p-4 border rounded-lg bg-muted/30 space-y-4">
      <h3 className="font-semibold">Color Selector Debug Info</h3>
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <strong>Authentication:</strong>
          <div>Token: {debugInfo.token}</div>
          <div>User: {debugInfo.user}</div>
        </div>
        
        <div>
          <strong>Universal Colors:</strong>
          <div>Data: {debugInfo.universalColors}</div>
          <div>Loading: {String(debugInfo.universalLoading)}</div>
          <div>Error: {debugInfo.universalError}</div>
          <div>Is Error: {String(debugInfo.universalIsError)}</div>
        </div>
        
        <div>
          <strong>H&M Colors:</strong>
          <div>Data: {debugInfo.hmColors}</div>
          <div>Loading: {String(debugInfo.hmLoading)}</div>
          <div>Error: {debugInfo.hmError}</div>
          <div>Is Error: {String(debugInfo.hmIsError)}</div>
        </div>
      </div>

      {universalColors && universalColors.length > 0 && (
        <div>
          <strong>Sample Universal Colors:</strong>
          <div className="flex flex-wrap gap-2 mt-2">
            {universalColors.slice(0, 5).map((color: any) => (
              <Badge key={color.id} variant="secondary" className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded border"
                  style={{ backgroundColor: color.hex_code }}
                />
                {color.color_name}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {hmColors && hmColors.length > 0 && (
        <div>
          <strong>Sample H&M Colors:</strong>
          <div className="flex flex-wrap gap-2 mt-2">
            {hmColors.slice(0, 5).map((color: any) => (
              <Badge key={color.id} variant="outline">
                {color.color_master} ({color.color_code})
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}