/**
 * Tests for useUnitConversion hook
 * 
 * **Validates: Requirements 4.3, 8.1, 14.3**
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useUnitConversion } from '@/hooks/use-units';
import { settingsService } from '@/services/api';
import { useAuth } from '@/lib/auth-context';

// Mock dependencies
vi.mock('@/services/api', () => ({
  settingsService: {
    uom: {
      convert: vi.fn(),
    },
  },
}));

vi.mock('@/lib/auth-context', () => ({
  useAuth: vi.fn(),
}));

const mockUseAuth = vi.mocked(useAuth);
const mockConvert = vi.mocked(settingsService.uom.convert);

// Test wrapper with QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useUnitConversion', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({ token: 'test-token' } as any);
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  it('should initialize with correct default state', () => {
    const { result } = renderHook(() => useUnitConversion(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isConverting).toBe(false);
    expect(result.current.convertedValue).toBe(null);
    expect(result.current.error).toBe(null);
    expect(typeof result.current.convert).toBe('function');
    expect(typeof result.current.reset).toBe('function');
    expect(typeof result.current.cleanup).toBe('function');
  });

  it('should debounce conversion calls (300ms)', async () => {
    vi.useFakeTimers();
    
    const mockResponse = {
      value: 1,
      from_unit: { id: 1, name: 'Kilogram', symbol: 'kg' },
      to_unit: { id: 2, name: 'Gram', symbol: 'g' },
      result: 1000,
      formula: '1 kg = 1000 g',
    };
    
    mockConvert.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useUnitConversion(), {
      wrapper: createWrapper(),
    });

    // Make multiple rapid calls
    act(() => {
      result.current.convert({ value: 1, fromUnitId: 1, toUnitId: 2 });
      result.current.convert({ value: 2, fromUnitId: 1, toUnitId: 2 });
      result.current.convert({ value: 3, fromUnitId: 1, toUnitId: 2 });
    });

    // Should not call API immediately
    expect(mockConvert).not.toHaveBeenCalled();

    // Fast-forward 299ms - should still not call
    act(() => {
      vi.advanceTimersByTime(299);
    });
    expect(mockConvert).not.toHaveBeenCalled();

    // Fast-forward 1ms more (total 300ms) - should call once with last value
    act(() => {
      vi.advanceTimersByTime(1);
    });

    await waitFor(() => {
      expect(mockConvert).toHaveBeenCalledTimes(1);
      expect(mockConvert).toHaveBeenCalledWith(
        { value: 3, from_uom_id: 1, to_uom_id: 2 },
        'test-token'
      );
    });

    vi.useRealTimers();
  });

  it('should handle successful conversion', async () => {
    vi.useFakeTimers();
    
    const mockResponse = {
      value: 1,
      from_unit: { id: 1, name: 'Kilogram', symbol: 'kg' },
      to_unit: { id: 2, name: 'Gram', symbol: 'g' },
      result: 1000,
      formula: '1 kg = 1000 g',
    };
    
    mockConvert.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useUnitConversion(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.convert({ value: 1, fromUnitId: 1, toUnitId: 2 });
    });

    // Should be converting after debounce
    act(() => {
      vi.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(result.current.isConverting).toBe(false);
      expect(result.current.convertedValue).toEqual(mockResponse);
      expect(result.current.error).toBe(null);
    });

    vi.useRealTimers();
  });

  it('should handle conversion errors', async () => {
    vi.useFakeTimers();
    
    const mockError = {
      response: {
        data: {
          detail: 'Cannot convert between different UoM categories'
        }
      }
    };
    
    mockConvert.mockRejectedValue(mockError);

    const { result } = renderHook(() => useUnitConversion(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.convert({ value: 1, fromUnitId: 1, toUnitId: 2 });
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(result.current.isConverting).toBe(false);
      expect(result.current.convertedValue).toBe(null);
      expect(result.current.error).toBe('Cannot convert between different UoM categories');
    });

    vi.useRealTimers();
  });

  it('should handle generic errors', async () => {
    vi.useFakeTimers();
    
    mockConvert.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useUnitConversion(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.convert({ value: 1, fromUnitId: 1, toUnitId: 2 });
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(result.current.error).toBe('Network error');
    });

    vi.useRealTimers();
  });

  it('should reset state correctly', () => {
    const { result } = renderHook(() => useUnitConversion(), {
      wrapper: createWrapper(),
    });

    // Set some state
    act(() => {
      result.current.convert({ value: 1, fromUnitId: 1, toUnitId: 2 });
    });

    // Reset
    act(() => {
      result.current.reset();
    });

    expect(result.current.isConverting).toBe(false);
    expect(result.current.convertedValue).toBe(null);
    expect(result.current.error).toBe(null);
  });

  it('should cleanup timeouts on unmount', () => {
    vi.useFakeTimers();
    
    const { result, unmount } = renderHook(() => useUnitConversion(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.convert({ value: 1, fromUnitId: 1, toUnitId: 2 });
    });

    // Unmount before timeout
    unmount();

    // Fast-forward past timeout
    act(() => {
      vi.advanceTimersByTime(300);
    });

    // Should not call API after unmount
    expect(mockConvert).not.toHaveBeenCalled();

    vi.useRealTimers();
  });

  it('should use correct API endpoint and parameters', async () => {
    vi.useFakeTimers();
    
    mockConvert.mockResolvedValue({});

    const { result } = renderHook(() => useUnitConversion(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.convert({ value: 5.5, fromUnitId: 10, toUnitId: 20 });
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(mockConvert).toHaveBeenCalledWith(
        {
          value: 5.5,
          from_uom_id: 10,
          to_uom_id: 20,
        },
        'test-token'
      );
    });

    vi.useRealTimers();
  });
});