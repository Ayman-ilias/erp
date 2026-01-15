/**
 * API Service Layer for Southern Apparels ERP
 *
 * Core API request function and service modules organized by entity
 */

import { PATHS } from "@/router.config";
import { API_CONFIG } from "@/lib/config";
import { errorHandlingService, ErrorContext } from "./error-handling";

// ============================================================================
// Configuration
// ============================================================================

// API base path - uses masked URL in production, falls back to direct API route
const getBasePath = () => {
  if (typeof window !== "undefined") {
    return API_CONFIG.BASE_PATH;
  }
  return API_CONFIG.BASE_PATH;
};

// ============================================================================
// Core API Response Function
// ============================================================================

/**
 * Core API request function following the established pattern
 *
 * @param basePath - Base URL for API requests
 * @param apiPath - Endpoint path (from PATHS config)
 * @param token - Optional authorization token
 * @param method - HTTP method
 * @param body - Request payload (FormData or JSON string)
 * @param addMultipartHeader - Flag for multipart form data
 */
export const getAPIResponse = async (
  basePath: string,
  apiPath: string,
  token: string | null = null,
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH" = "GET",
  body: FormData | string | null = null,
  addMultipartHeader = false
): Promise<any> => {
  try {
    const headers: Record<string, string> = {};

    // Add authorization header if token provided
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    // Set content type based on body type
    if (body) {
      if (body instanceof FormData) {
        if (addMultipartHeader) {
          // Let browser set Content-Type with boundary for FormData
          // headers["Content-Type"] = "multipart/form-data";
        }
      } else if (typeof body === "string") {
        headers["Content-Type"] = "application/json";
      }
    }

    const fetchOptions: RequestInit = {
      method,
      headers,
      body: body ?? undefined,
    };

    const response = await fetch(`${basePath}${apiPath}`, fetchOptions);

    // Handle non-JSON responses
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const jsonResponse = await response.json();

      if (!response.ok) {
        throw new Error(jsonResponse.detail || `API Error: ${response.status}`);
      }

      return jsonResponse;
    }

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return { success: true };
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

// ============================================================================
// AUTH SERVICE
// ============================================================================

export const authService = {
  login: async (username: string, password: string) => {
    const basePath = getBasePath();
    return getAPIResponse(
      basePath,
      PATHS.AUTH.LOGIN().root,
      null,
      "POST",
      JSON.stringify({ username, password })
    );
  },

  register: async (data: {
    username: string;
    email: string;
    password: string;
    full_name: string;
    role?: string;
    department?: string;
    designation?: string;
  }) => {
    const basePath = getBasePath();
    return getAPIResponse(
      basePath,
      PATHS.AUTH.REGISTER().root,
      null,
      "POST",
      JSON.stringify(data)
    );
  },

  getMe: async (token: string) => {
    const basePath = getBasePath();
    return getAPIResponse(basePath, PATHS.AUTH.ME().root, token, "GET");
  },

  forgotPassword: async (email: string) => {
    const basePath = getBasePath();
    return getAPIResponse(
      basePath,
      PATHS.AUTH.FORGOT_PASSWORD().root,
      null,
      "POST",
      JSON.stringify({ email })
    );
  },

  resetPassword: async (token: string, newPassword: string) => {
    const basePath = getBasePath();
    return getAPIResponse(
      basePath,
      PATHS.AUTH.RESET_PASSWORD().root,
      null,
      "POST",
      JSON.stringify({ token, new_password: newPassword })
    );
  },
};

// ============================================================================
// USERS SERVICE
// ============================================================================

export const usersService = {
  getAll: async (token: string, limit?: number) => {
    const basePath = getBasePath();
    return getAPIResponse(basePath, PATHS.USERS.LIST(limit).root, token, "GET");
  },

  getById: async (id: number, token: string) => {
    const basePath = getBasePath();
    return getAPIResponse(basePath, PATHS.USERS.DETAIL(id).root, token, "GET");
  },

  create: async (
    data: {
      username: string;
      email: string;
      password: string;
      full_name: string;
      role?: string;
      department?: string;
      designation?: string;
      is_active?: boolean;
      is_superuser?: boolean;
      department_access?: string[];
    },
    token: string
  ) => {
    const basePath = getBasePath();
    return getAPIResponse(
      basePath,
      PATHS.USERS.CREATE().root,
      token,
      "POST",
      JSON.stringify(data)
    );
  },

  update: async (id: number, data: Record<string, any>, token: string) => {
    const basePath = getBasePath();
    return getAPIResponse(
      basePath,
      PATHS.USERS.UPDATE(id).root,
      token,
      "PUT",
      JSON.stringify(data)
    );
  },

  delete: async (id: number, token: string) => {
    const basePath = getBasePath();
    return getAPIResponse(
      basePath,
      PATHS.USERS.DELETE(id).root,
      token,
      "DELETE"
    );
  },
};

// ============================================================================
// BUYERS SERVICE
// ============================================================================

export const buyersService = {
  getAll: async (limit?: number) => {
    const basePath = getBasePath();
    return getAPIResponse(basePath, PATHS.BUYERS.LIST(limit).root, null, "GET");
  },

  getById: async (id: number) => {
    const basePath = getBasePath();
    return getAPIResponse(basePath, PATHS.BUYERS.DETAIL(id).root, null, "GET");
  },

  create: async (data: Record<string, any>) => {
    const basePath = getBasePath();
    return getAPIResponse(
      basePath,
      PATHS.BUYERS.CREATE().root,
      null,
      "POST",
      JSON.stringify(data)
    );
  },

  update: async (id: number, data: Record<string, any>) => {
    const basePath = getBasePath();
    return getAPIResponse(
      basePath,
      PATHS.BUYERS.UPDATE(id).root,
      null,
      "PUT",
      JSON.stringify(data)
    );
  },

  delete: async (id: number) => {
    const basePath = getBasePath();
    return getAPIResponse(
      basePath,
      PATHS.BUYERS.DELETE(id).root,
      null,
      "DELETE"
    );
  },
};

// ============================================================================
// BUYER TYPES SERVICE
// ============================================================================

export const buyerTypesService = {
  getAll: async (isActive?: boolean) => {
    const basePath = getBasePath();
    return getAPIResponse(basePath, PATHS.BUYERS.TYPES.LIST(isActive).root, null, "GET");
  },

  getById: async (id: number) => {
    const basePath = getBasePath();
    return getAPIResponse(basePath, PATHS.BUYERS.TYPES.DETAIL(id).root, null, "GET");
  },

  create: async (data: Record<string, any>) => {
    const basePath = getBasePath();
    return getAPIResponse(
      basePath,
      PATHS.BUYERS.TYPES.CREATE().root,
      null,
      "POST",
      JSON.stringify(data)
    );
  },

  update: async (id: number, data: Record<string, any>) => {
    const basePath = getBasePath();
    return getAPIResponse(
      basePath,
      PATHS.BUYERS.TYPES.UPDATE(id).root,
      null,
      "PUT",
      JSON.stringify(data)
    );
  },

  delete: async (id: number) => {
    const basePath = getBasePath();
    return getAPIResponse(
      basePath,
      PATHS.BUYERS.TYPES.DELETE(id).root,
      null,
      "DELETE"
    );
  },
};

// ============================================================================
// SUPPLIERS SERVICE
// ============================================================================

export const suppliersService = {
  getAll: async (limit?: number) => {
    const basePath = getBasePath();
    return getAPIResponse(
      basePath,
      PATHS.SUPPLIERS.LIST(limit).root,
      null,
      "GET"
    );
  },

  getById: async (id: number) => {
    const basePath = getBasePath();
    return getAPIResponse(
      basePath,
      PATHS.SUPPLIERS.DETAIL(id).root,
      null,
      "GET"
    );
  },

  create: async (data: Record<string, any>) => {
    const basePath = getBasePath();
    return getAPIResponse(
      basePath,
      PATHS.SUPPLIERS.CREATE().root,
      null,
      "POST",
      JSON.stringify(data)
    );
  },

  update: async (id: number, data: Record<string, any>) => {
    const basePath = getBasePath();
    return getAPIResponse(
      basePath,
      PATHS.SUPPLIERS.UPDATE(id).root,
      null,
      "PUT",
      JSON.stringify(data)
    );
  },

  delete: async (id: number) => {
    const basePath = getBasePath();
    return getAPIResponse(
      basePath,
      PATHS.SUPPLIERS.DELETE(id).root,
      null,
      "DELETE"
    );
  },
};

// ============================================================================
// CONTACTS SERVICE
// ============================================================================

export const contactsService = {
  getAll: async (limit?: number) => {
    const basePath = getBasePath();
    return getAPIResponse(
      basePath,
      PATHS.CONTACTS.LIST(limit).root,
      null,
      "GET"
    );
  },

  getById: async (id: number) => {
    const basePath = getBasePath();
    return getAPIResponse(
      basePath,
      PATHS.CONTACTS.DETAIL(id).root,
      null,
      "GET"
    );
  },

  create: async (data: Record<string, any>) => {
    const basePath = getBasePath();
    return getAPIResponse(
      basePath,
      PATHS.CONTACTS.CREATE().root,
      null,
      "POST",
      JSON.stringify(data)
    );
  },

  update: async (id: number, data: Record<string, any>) => {
    const basePath = getBasePath();
    return getAPIResponse(
      basePath,
      PATHS.CONTACTS.UPDATE(id).root,
      null,
      "PUT",
      JSON.stringify(data)
    );
  },

  delete: async (id: number) => {
    const basePath = getBasePath();
    return getAPIResponse(
      basePath,
      PATHS.CONTACTS.DELETE(id).root,
      null,
      "DELETE"
    );
  },
};

// ============================================================================
// SHIPPING SERVICE
// ============================================================================

export const shippingService = {
  getAll: async (limit?: number) => {
    const context: ErrorContext = {
      operation: 'load-shipping-data',
      endpoint: PATHS.SHIPPING.LIST(limit).root,
      timestamp: new Date()
    }
    
    return errorHandlingService.executeWithRetry(async () => {
      const basePath = getBasePath();
      return getAPIResponse(
        basePath,
        PATHS.SHIPPING.LIST(limit).root,
        null,
        "GET"
      );
    }, context);
  },

  getById: async (id: number) => {
    const context: ErrorContext = {
      operation: 'load-shipping-detail',
      endpoint: PATHS.SHIPPING.DETAIL(id).root,
      timestamp: new Date()
    }
    
    return errorHandlingService.executeWithRetry(async () => {
      const basePath = getBasePath();
      return getAPIResponse(
        basePath,
        PATHS.SHIPPING.DETAIL(id).root,
        null,
        "GET"
      );
    }, context);
  },

  create: async (data: Record<string, any>) => {
    const context: ErrorContext = {
      operation: 'create-shipping',
      endpoint: PATHS.SHIPPING.CREATE().root,
      timestamp: new Date()
    }
    
    return errorHandlingService.executeWithRetry(async () => {
      const basePath = getBasePath();
      return getAPIResponse(
        basePath,
        PATHS.SHIPPING.CREATE().root,
        null,
        "POST",
        JSON.stringify(data)
      );
    }, context);
  },

  update: async (id: number, data: Record<string, any>) => {
    const context: ErrorContext = {
      operation: 'update-shipping',
      endpoint: PATHS.SHIPPING.UPDATE(id).root,
      timestamp: new Date()
    }
    
    return errorHandlingService.executeWithRetry(async () => {
      const basePath = getBasePath();
      return getAPIResponse(
        basePath,
        PATHS.SHIPPING.UPDATE(id).root,
        null,
        "PUT",
        JSON.stringify(data)
      );
    }, context);
  },

  delete: async (id: number) => {
    const context: ErrorContext = {
      operation: 'delete-shipping',
      endpoint: PATHS.SHIPPING.DELETE(id).root,
      timestamp: new Date()
    }
    
    return errorHandlingService.executeWithRetry(async () => {
      const basePath = getBasePath();
      return getAPIResponse(
        basePath,
        PATHS.SHIPPING.DELETE(id).root,
        null,
        "DELETE"
      );
    }, context);
  },
};

// ============================================================================
// BANKING SERVICE
// ============================================================================

export const bankingService = {
  getAll: async (limit?: number) => {
    const context: ErrorContext = {
      operation: 'load-banking-data',
      endpoint: PATHS.BANKING.LIST(limit).root,
      timestamp: new Date()
    }
    
    return errorHandlingService.executeWithRetry(async () => {
      const basePath = getBasePath();
      return getAPIResponse(
        basePath,
        PATHS.BANKING.LIST(limit).root,
        null,
        "GET"
      );
    }, context);
  },

  getById: async (id: number) => {
    const context: ErrorContext = {
      operation: 'load-banking-detail',
      endpoint: PATHS.BANKING.DETAIL(id).root,
      timestamp: new Date()
    }
    
    return errorHandlingService.executeWithRetry(async () => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, PATHS.BANKING.DETAIL(id).root, null, "GET");
    }, context);
  },

  create: async (data: Record<string, any>) => {
    const context: ErrorContext = {
      operation: 'create-banking',
      endpoint: PATHS.BANKING.CREATE().root,
      timestamp: new Date()
    }
    
    return errorHandlingService.executeWithRetry(async () => {
      const basePath = getBasePath();
      return getAPIResponse(
        basePath,
        PATHS.BANKING.CREATE().root,
        null,
        "POST",
        JSON.stringify(data)
      );
    }, context);
  },

  update: async (id: number, data: Record<string, any>) => {
    const context: ErrorContext = {
      operation: 'update-banking',
      endpoint: PATHS.BANKING.UPDATE(id).root,
      timestamp: new Date()
    }
    
    return errorHandlingService.executeWithRetry(async () => {
      const basePath = getBasePath();
      return getAPIResponse(
        basePath,
        PATHS.BANKING.UPDATE(id).root,
        null,
        "PUT",
        JSON.stringify(data)
      );
    }, context);
  },

  delete: async (id: number) => {
    const context: ErrorContext = {
      operation: 'delete-banking',
      endpoint: PATHS.BANKING.DELETE(id).root,
      timestamp: new Date()
    }
    
    return errorHandlingService.executeWithRetry(async () => {
      const basePath = getBasePath();
      return getAPIResponse(
        basePath,
        PATHS.BANKING.DELETE(id).root,
        null,
        "DELETE"
      );
    }, context);
  },
};

// ============================================================================
// SAMPLES SERVICE (Legacy - kept for backward compatibility)
// ============================================================================

export const samplesService = {
  getAll: async (limit?: number) => {
    const basePath = getBasePath();
    return getAPIResponse(
      basePath,
      PATHS.SAMPLES.LIST(limit).root,
      null,
      "GET"
    );
  },

  getById: async (id: number) => {
    const basePath = getBasePath();
    return getAPIResponse(basePath, PATHS.SAMPLES.DETAIL(id).root, null, "GET");
  },

  getBySampleId: async (sampleId: string) => {
    const basePath = getBasePath();
    return getAPIResponse(
      basePath,
      PATHS.SAMPLES.BY_SAMPLE_ID(sampleId).root,
      null,
      "GET"
    );
  },

  create: async (data: Record<string, any>) => {
    const basePath = getBasePath();
    return getAPIResponse(
      basePath,
      PATHS.SAMPLES.CREATE().root,
      null,
      "POST",
      JSON.stringify(data)
    );
  },

  update: async (id: number, data: Record<string, any>) => {
    const basePath = getBasePath();
    return getAPIResponse(
      basePath,
      PATHS.SAMPLES.UPDATE(id).root,
      null,
      "PUT",
      JSON.stringify(data)
    );
  },

  delete: async (id: number) => {
    const basePath = getBasePath();
    return getAPIResponse(
      basePath,
      PATHS.SAMPLES.DELETE(id).root,
      null,
      "DELETE"
    );
  },

  getOperations: async (sampleId: number) => {
    const basePath = getBasePath();
    return getAPIResponse(
      basePath,
      PATHS.SAMPLES.OPERATIONS(sampleId).root,
      null,
      "GET"
    );
  },

  createOperation: async (data: Record<string, any>) => {
    const basePath = getBasePath();
    return getAPIResponse(
      basePath,
      PATHS.SAMPLES.CREATE_OPERATION().root,
      null,
      "POST",
      JSON.stringify(data)
    );
  },

  // ============================================
  // NEW SAMPLE MODULE API (Primary API)
  // ============================================

  // Sample Machines (Master Data)
  machines: {
    getAll: async (isActive?: boolean, limit?: number) => {
      const basePath = getBasePath();
      const params = new URLSearchParams();
      if (isActive !== undefined) params.append("is_active", isActive.toString());
      if (limit) params.append("limit", limit.toString());
      const queryString = params.toString() ? `?${params.toString()}` : "";
      return getAPIResponse(basePath, `/samples/machines${queryString}`, null, "GET");
    },
    getById: async (id: number) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, `/samples/machines/${id}`, null, "GET");
    },
    create: async (data: any) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, "/samples/machines", null, "POST", JSON.stringify(data));
    },
    update: async (id: number, data: any) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, `/samples/machines/${id}`, null, "PUT", JSON.stringify(data));
    },
    delete: async (id: number) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, `/samples/machines/${id}`, null, "DELETE");
    },
  },

  // Manufacturing Operations (Master Data)
  manufacturingOperations: {
    getAll: async (operationType?: string, isActive?: boolean, limit?: number) => {
      const basePath = getBasePath();
      const params = new URLSearchParams();
      if (operationType) params.append("operation_type", operationType);
      if (isActive !== undefined) params.append("is_active", isActive.toString());
      if (limit) params.append("limit", limit.toString());
      const queryString = params.toString() ? `?${params.toString()}` : "";
      return getAPIResponse(basePath, `/samples/manufacturing-operations${queryString}`, null, "GET");
    },
    getById: async (id: number) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, `/samples/manufacturing-operations/${id}`, null, "GET");
    },
    create: async (data: any) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, "/samples/manufacturing-operations", null, "POST", JSON.stringify(data));
    },
    update: async (id: number, data: any) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, `/samples/manufacturing-operations/${id}`, null, "PUT", JSON.stringify(data));
    },
    delete: async (id: number) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, `/samples/manufacturing-operations/${id}`, null, "DELETE");
    },
  },

  // Sample Requests (NEW Primary Sample API)
  requests: {
    getAll: async (buyerId?: number, category?: string, status?: string, limit?: number) => {
      const basePath = getBasePath();
      const params = new URLSearchParams();
      if (buyerId) params.append("buyer_id", buyerId.toString());
      if (category) params.append("sample_category", category);
      if (status) params.append("current_status", status);
      if (limit) params.append("limit", limit.toString());
      const queryString = params.toString() ? `?${params.toString()}` : "";
      return getAPIResponse(basePath, `/samples/requests${queryString}`, null, "GET");
    },
    getById: async (id: number) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, `/samples/requests/${id}`, null, "GET");
    },
    getBySampleId: async (sampleId: string) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, `/samples/requests/by-sample-id/${sampleId}`, null, "GET");
    },
    create: async (data: any) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, "/samples/requests", null, "POST", JSON.stringify(data));
    },
    update: async (id: number, data: any) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, `/samples/requests/${id}`, null, "PUT", JSON.stringify(data));
    },
    delete: async (id: number) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, `/samples/requests/${id}`, null, "DELETE");
    },
  },

  // Sample Plans
  plans: {
    getAll: async (limit?: number) => {
      const basePath = getBasePath();
      const params = limit ? `?limit=${limit}` : "";
      return getAPIResponse(basePath, `/samples/sample-plans${params}`, null, "GET");
    },
    getByRequestId: async (requestId: number) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, `/samples/sample-plans/by-request/${requestId}`, null, "GET");
    },
    create: async (data: any) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, "/samples/sample-plans", null, "POST", JSON.stringify(data));
    },
    update: async (id: number, data: any) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, `/samples/sample-plans/${id}`, null, "PUT", JSON.stringify(data));
    },
    delete: async (id: number) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, `/samples/sample-plans/${id}`, null, "DELETE");
    },
  },

  // Sample Materials (Required materials per sample)
  sampleMaterials: {
    getAll: async (sampleRequestId?: number, limit?: number) => {
      const basePath = getBasePath();
      const params = new URLSearchParams();
      if (sampleRequestId) params.append("sample_request_id", sampleRequestId.toString());
      if (limit) params.append("limit", limit.toString());
      const queryString = params.toString() ? `?${params.toString()}` : "";
      return getAPIResponse(basePath, `/samples/sample-materials${queryString}`, null, "GET");
    },
    create: async (data: any) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, "/samples/sample-materials", null, "POST", JSON.stringify(data));
    },
    update: async (id: number, data: any) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, `/samples/sample-materials/${id}`, null, "PUT", JSON.stringify(data));
    },
    delete: async (id: number) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, `/samples/sample-materials/${id}`, null, "DELETE");
    },
  },

  // Sample Operations (Link operations to samples)
  sampleOperations: {
    getAll: async (sampleRequestId?: number, limit?: number) => {
      const basePath = getBasePath();
      const params = new URLSearchParams();
      if (sampleRequestId) params.append("sample_request_id", sampleRequestId.toString());
      if (limit) params.append("limit", limit.toString());
      const queryString = params.toString() ? `?${params.toString()}` : "";
      return getAPIResponse(basePath, `/samples/sample-operations${queryString}`, null, "GET");
    },
    create: async (data: any) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, "/samples/sample-operations", null, "POST", JSON.stringify(data));
    },
    update: async (id: number, data: any) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, `/samples/sample-operations/${id}`, null, "PUT", JSON.stringify(data));
    },
    delete: async (id: number) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, `/samples/sample-operations/${id}`, null, "DELETE");
    },
  },

  // Sample TNA (Time & Action)
  tna: {
    getAll: async (sampleRequestId?: number, status?: string, limit?: number) => {
      const basePath = getBasePath();
      const params = new URLSearchParams();
      if (sampleRequestId) params.append("sample_request_id", sampleRequestId.toString());
      if (status) params.append("status_filter", status);
      if (limit) params.append("limit", limit.toString());
      const queryString = params.toString() ? `?${params.toString()}` : "";
      return getAPIResponse(basePath, `/samples/sample-tna${queryString}`, null, "GET");
    },
    create: async (data: any) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, "/samples/sample-tna", null, "POST", JSON.stringify(data));
    },
    update: async (id: number, data: any) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, `/samples/sample-tna/${id}`, null, "PUT", JSON.stringify(data));
    },
    delete: async (id: number) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, `/samples/sample-tna/${id}`, null, "DELETE");
    },
  },

  // Sample Status (History tracking)
  status: {
    getAll: async (sampleRequestId?: number, limit?: number) => {
      const basePath = getBasePath();
      const params = new URLSearchParams();
      if (sampleRequestId) params.append("sample_request_id", sampleRequestId.toString());
      if (limit) params.append("limit", limit.toString());
      const queryString = params.toString() ? `?${params.toString()}` : "";
      return getAPIResponse(basePath, `/samples/sample-status${queryString}`, null, "GET");
    },
    create: async (data: any) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, "/samples/sample-status", null, "POST", JSON.stringify(data));
    },
    update: async (id: number, data: any) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, `/samples/sample-status/${id}`, null, "PUT", JSON.stringify(data));
    },
    delete: async (id: number) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, `/samples/sample-status/${id}`, null, "DELETE");
    },
  },

  // Style Variant Materials
  variantMaterials: {
    getAll: async (styleVariantId?: number, limit?: number) => {
      const basePath = getBasePath();
      const params = new URLSearchParams();
      if (styleVariantId) params.append("style_variant_id", styleVariantId.toString());
      if (limit) params.append("limit", limit.toString());
      const queryString = params.toString() ? `?${params.toString()}` : "";
      return getAPIResponse(basePath, `/samples/variant-materials${queryString}`, null, "GET");
    },
    create: async (data: any) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, "/samples/variant-materials", null, "POST", JSON.stringify(data));
    },
    update: async (id: number, data: any) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, `/samples/variant-materials/${id}`, null, "PUT", JSON.stringify(data));
    },
    delete: async (id: number) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, `/samples/variant-materials/${id}`, null, "DELETE");
    },
  },

  // SMV Calculations
  smv: {
    getAll: async (styleVariantId?: number, limit?: number) => {
      const basePath = getBasePath();
      const params = new URLSearchParams();
      if (styleVariantId) params.append("style_variant_id", styleVariantId.toString());
      if (limit) params.append("limit", limit.toString());
      const queryString = params.toString() ? `?${params.toString()}` : "";
      return getAPIResponse(basePath, `/samples/smv-calculations${queryString}`, null, "GET");
    },
    getTotals: async (styleVariantId: number) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, `/samples/smv-calculations/totals/${styleVariantId}`, null, "GET");
    },
    create: async (data: any) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, "/samples/smv-calculations", null, "POST", JSON.stringify(data));
    },
    update: async (id: number, data: any) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, `/samples/smv-calculations/${id}`, null, "PUT", JSON.stringify(data));
    },
    delete: async (id: number) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, `/samples/smv-calculations/${id}`, null, "DELETE");
    },
  },

  // Garment Colors
  garmentColors: {
    getAll: async (isActive?: boolean) => {
      const basePath = getBasePath();
      const params = isActive !== undefined ? `?is_active=${isActive}` : "";
      return getAPIResponse(basePath, `/samples/colors${params}`, null, "GET");
    },
    create: async (data: any) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, "/samples/colors", null, "POST", JSON.stringify(data));
    },
    update: async (id: number, data: any) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, `/samples/colors/${id}`, null, "PUT", JSON.stringify(data));
    },
    delete: async (id: number) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, `/samples/colors/${id}`, null, "DELETE");
    },
  },

  // Garment Sizes
  garmentSizes: {
    getAll: async (isActive?: boolean) => {
      const basePath = getBasePath();
      const params = isActive !== undefined ? `?is_active=${isActive}` : "";
      return getAPIResponse(basePath, `/samples/sizes${params}`, null, "GET");
    },
    create: async (data: any) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, "/samples/sizes", null, "POST", JSON.stringify(data));
    },
    update: async (id: number, data: any) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, `/samples/sizes/${id}`, null, "PUT", JSON.stringify(data));
    },
    delete: async (id: number) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, `/samples/sizes/${id}`, null, "DELETE");
    },
  },
};

// ============================================================================
// STYLES SERVICE
// ============================================================================

export const stylesService = {
  getAll: async (limit?: number) => {
    const basePath = getBasePath();
    return getAPIResponse(basePath, PATHS.STYLES.LIST(limit).root, null, "GET");
  },

  getById: async (id: number) => {
    const basePath = getBasePath();
    return getAPIResponse(basePath, PATHS.STYLES.DETAIL(id).root, null, "GET");
  },

  create: async (data: Record<string, any>) => {
    const basePath = getBasePath();
    return getAPIResponse(
      basePath,
      PATHS.STYLES.CREATE().root,
      null,
      "POST",
      JSON.stringify(data)
    );
  },

  update: async (id: number, data: Record<string, any>) => {
    const basePath = getBasePath();
    return getAPIResponse(
      basePath,
      PATHS.STYLES.UPDATE(id).root,
      null,
      "PUT",
      JSON.stringify(data)
    );
  },

  delete: async (id: number) => {
    const basePath = getBasePath();
    return getAPIResponse(
      basePath,
      PATHS.STYLES.DELETE(id).root,
      null,
      "DELETE"
    );
  },
};

// ============================================================================
// STYLE VARIANTS SERVICE
// ============================================================================

export const styleVariantsService = {
  getAll: async (styleSummaryId?: number, limit?: number) => {
    const basePath = getBasePath();
    return getAPIResponse(
      basePath,
      PATHS.STYLE_VARIANTS.LIST(styleSummaryId, limit).root,
      null,
      "GET"
    );
  },

  getById: async (id: number) => {
    const basePath = getBasePath();
    return getAPIResponse(
      basePath,
      PATHS.STYLE_VARIANTS.DETAIL(id).root,
      null,
      "GET"
    );
  },

  create: async (data: Record<string, any>) => {
    const basePath = getBasePath();
    return getAPIResponse(
      basePath,
      PATHS.STYLE_VARIANTS.CREATE().root,
      null,
      "POST",
      JSON.stringify(data)
    );
  },

  update: async (id: number, data: Record<string, any>) => {
    const basePath = getBasePath();
    return getAPIResponse(
      basePath,
      PATHS.STYLE_VARIANTS.UPDATE(id).root,
      null,
      "PUT",
      JSON.stringify(data)
    );
  },

  delete: async (id: number) => {
    const basePath = getBasePath();
    return getAPIResponse(
      basePath,
      PATHS.STYLE_VARIANTS.DELETE(id).root,
      null,
      "DELETE"
    );
  },
};

// ============================================================================
// REQUIRED MATERIALS SERVICE
// ============================================================================

export const requiredMaterialsService = {
  getAll: async (styleVariantId?: number) => {
    const basePath = getBasePath();
    return getAPIResponse(
      basePath,
      PATHS.REQUIRED_MATERIALS.LIST(styleVariantId).root,
      null,
      "GET"
    );
  },

  getById: async (id: number) => {
    const basePath = getBasePath();
    return getAPIResponse(
      basePath,
      PATHS.REQUIRED_MATERIALS.DETAIL(id).root,
      null,
      "GET"
    );
  },

  create: async (data: Record<string, any>) => {
    const basePath = getBasePath();
    return getAPIResponse(
      basePath,
      PATHS.REQUIRED_MATERIALS.CREATE().root,
      null,
      "POST",
      JSON.stringify(data)
    );
  },

  update: async (id: number, data: Record<string, any>) => {
    const basePath = getBasePath();
    return getAPIResponse(
      basePath,
      PATHS.REQUIRED_MATERIALS.UPDATE(id).root,
      null,
      "PUT",
      JSON.stringify(data)
    );
  },

  delete: async (id: number) => {
    const basePath = getBasePath();
    return getAPIResponse(
      basePath,
      PATHS.REQUIRED_MATERIALS.DELETE(id).root,
      null,
      "DELETE"
    );
  },
};

// ============================================================================
// ORDERS SERVICE
// ============================================================================

export const ordersService = {
  getAll: async (limit?: number) => {
    const basePath = getBasePath();
    return getAPIResponse(basePath, PATHS.ORDERS.LIST(limit).root, null, "GET");
  },

  getById: async (id: number) => {
    const basePath = getBasePath();
    return getAPIResponse(basePath, PATHS.ORDERS.DETAIL(id).root, null, "GET");
  },

  create: async (data: Record<string, any>) => {
    const basePath = getBasePath();
    return getAPIResponse(
      basePath,
      PATHS.ORDERS.CREATE().root,
      null,
      "POST",
      JSON.stringify(data)
    );
  },

  update: async (id: number, data: Record<string, any>) => {
    const basePath = getBasePath();
    return getAPIResponse(
      basePath,
      PATHS.ORDERS.UPDATE(id).root,
      null,
      "PUT",
      JSON.stringify(data)
    );
  },

  delete: async (id: number) => {
    const basePath = getBasePath();
    return getAPIResponse(
      basePath,
      PATHS.ORDERS.DELETE(id).root,
      null,
      "DELETE"
    );
  },
};

// ============================================================================
// MATERIALS SERVICE
// ============================================================================

export const materialsService = {
  getAll: async (limit?: number) => {
    const basePath = getBasePath();
    return getAPIResponse(
      basePath,
      PATHS.MATERIALS.LIST(limit).root,
      null,
      "GET"
    );
  },

  getById: async (id: number) => {
    const basePath = getBasePath();
    return getAPIResponse(
      basePath,
      PATHS.MATERIALS.DETAIL(id).root,
      null,
      "GET"
    );
  },

  create: async (data: Record<string, any>) => {
    const basePath = getBasePath();
    return getAPIResponse(
      basePath,
      PATHS.MATERIALS.CREATE().root,
      null,
      "POST",
      JSON.stringify(data)
    );
  },

  update: async (id: number, data: Record<string, any>) => {
    const basePath = getBasePath();
    return getAPIResponse(
      basePath,
      PATHS.MATERIALS.UPDATE(id).root,
      null,
      "PUT",
      JSON.stringify(data)
    );
  },

  delete: async (id: number) => {
    const basePath = getBasePath();
    return getAPIResponse(
      basePath,
      PATHS.MATERIALS.DELETE(id).root,
      null,
      "DELETE"
    );
  },
};

// ============================================================================
// COLORS SERVICE
// ============================================================================

export const colorsService = {
  getAll: async (category?: string) => {
    const basePath = getBasePath();
    return getAPIResponse(
      basePath,
      PATHS.MASTER.COLORS.LIST(category).root,
      null,
      "GET"
    );
  },

  getById: async (id: number) => {
    const basePath = getBasePath();
    return getAPIResponse(
      basePath,
      PATHS.MASTER.COLORS.DETAIL(id).root,
      null,
      "GET"
    );
  },

  create: async (data: Record<string, any>) => {
    const basePath = getBasePath();
    return getAPIResponse(
      basePath,
      PATHS.MASTER.COLORS.CREATE().root,
      null,
      "POST",
      JSON.stringify(data)
    );
  },

  update: async (id: number, data: Record<string, any>) => {
    const basePath = getBasePath();
    return getAPIResponse(
      basePath,
      PATHS.MASTER.COLORS.UPDATE(id).root,
      null,
      "PUT",
      JSON.stringify(data)
    );
  },

  delete: async (id: number) => {
    const basePath = getBasePath();
    return getAPIResponse(
      basePath,
      PATHS.MASTER.COLORS.DELETE(id).root,
      null,
      "DELETE"
    );
  },

  seedDefaults: async () => {
    const basePath = getBasePath();
    return getAPIResponse(
      basePath,
      PATHS.MASTER.COLORS.SEED_DEFAULTS().root,
      null,
      "POST"
    );
  },
};

// ============================================================================
// SIZES SERVICE
// ============================================================================

export const sizesService = {
  getAll: async (category?: string) => {
    const basePath = getBasePath();
    return getAPIResponse(
      basePath,
      PATHS.MASTER.SIZES.LIST(category).root,
      null,
      "GET"
    );
  },

  getById: async (id: number) => {
    const basePath = getBasePath();
    return getAPIResponse(
      basePath,
      PATHS.MASTER.SIZES.DETAIL(id).root,
      null,
      "GET"
    );
  },

  create: async (data: Record<string, any>) => {
    const basePath = getBasePath();
    return getAPIResponse(
      basePath,
      PATHS.MASTER.SIZES.CREATE().root,
      null,
      "POST",
      JSON.stringify(data)
    );
  },

  update: async (id: number, data: Record<string, any>) => {
    const basePath = getBasePath();
    return getAPIResponse(
      basePath,
      PATHS.MASTER.SIZES.UPDATE(id).root,
      null,
      "PUT",
      JSON.stringify(data)
    );
  },

  delete: async (id: number) => {
    const basePath = getBasePath();
    return getAPIResponse(
      basePath,
      PATHS.MASTER.SIZES.DELETE(id).root,
      null,
      "DELETE"
    );
  },
};

// ============================================================================
// PRODUCTION SERVICE
// ============================================================================

export const productionService = {
  getAll: async (limit?: number) => {
    const basePath = getBasePath();
    return getAPIResponse(
      basePath,
      PATHS.PRODUCTION.LIST(limit).root,
      null,
      "GET"
    );
  },

  getById: async (id: number) => {
    const basePath = getBasePath();
    return getAPIResponse(
      basePath,
      PATHS.PRODUCTION.DETAIL(id).root,
      null,
      "GET"
    );
  },

  create: async (data: Record<string, any>) => {
    const basePath = getBasePath();
    return getAPIResponse(
      basePath,
      PATHS.PRODUCTION.CREATE().root,
      null,
      "POST",
      JSON.stringify(data)
    );
  },

  update: async (id: number, data: Record<string, any>) => {
    const basePath = getBasePath();
    return getAPIResponse(
      basePath,
      PATHS.PRODUCTION.UPDATE(id).root,
      null,
      "PUT",
      JSON.stringify(data)
    );
  },

  delete: async (id: number) => {
    const basePath = getBasePath();
    return getAPIResponse(
      basePath,
      PATHS.PRODUCTION.DELETE(id).root,
      null,
      "DELETE"
    );
  },
};

// ============================================================================
// INVENTORY SERVICE
// ============================================================================

export const inventoryService = {
  getAll: async (limit?: number) => {
    const basePath = getBasePath();
    return getAPIResponse(
      basePath,
      PATHS.INVENTORY.LIST(limit).root,
      null,
      "GET"
    );
  },

  getById: async (id: number) => {
    const basePath = getBasePath();
    return getAPIResponse(
      basePath,
      PATHS.INVENTORY.DETAIL(id).root,
      null,
      "GET"
    );
  },

  create: async (data: Record<string, any>) => {
    const basePath = getBasePath();
    return getAPIResponse(
      basePath,
      PATHS.INVENTORY.CREATE().root,
      null,
      "POST",
      JSON.stringify(data)
    );
  },

  update: async (id: number, data: Record<string, any>) => {
    const basePath = getBasePath();
    return getAPIResponse(
      basePath,
      PATHS.INVENTORY.UPDATE(id).root,
      null,
      "PUT",
      JSON.stringify(data)
    );
  },

  delete: async (id: number) => {
    const basePath = getBasePath();
    return getAPIResponse(
      basePath,
      PATHS.INVENTORY.DELETE(id).root,
      null,
      "DELETE"
    );
  },
};

// ============================================================================
// REPORTS SERVICE
// ============================================================================

export const reportsService = {
  getDashboard: async () => {
    const basePath = getBasePath();
    return getAPIResponse(
      basePath,
      PATHS.REPORTS.DASHBOARD().root,
      null,
      "GET"
    );
  },

  export: async (type: string) => {
    const basePath = getBasePath();
    return getAPIResponse(
      basePath,
      PATHS.REPORTS.EXPORT(type).root,
      null,
      "GET"
    );
  },
};

// ============================================================================
// MERCHANDISER SERVICES
// ============================================================================

export const merchandiserService = {
  // Yarn
  yarn: {
    getAll: async (limit?: number) => {
      const basePath = getBasePath();
      return getAPIResponse(
        basePath,
        PATHS.MERCHANDISER.YARN.LIST(limit).root,
        null,
        "GET"
      );
    },
    getById: async (yarnId: string) => {
      const basePath = getBasePath();
      return getAPIResponse(
        basePath,
        PATHS.MERCHANDISER.YARN.DETAIL(yarnId).root,
        null,
        "GET"
      );
    },
    create: async (data: any) => {
      const basePath = getBasePath();
      return getAPIResponse(
        basePath,
        PATHS.MERCHANDISER.YARN.CREATE().root,
        null,
        "POST",
        JSON.stringify(data)
      );
    },
    update: async (yarnId: string, data: any) => {
      const basePath = getBasePath();
      return getAPIResponse(
        basePath,
        PATHS.MERCHANDISER.YARN.UPDATE(yarnId).root,
        null,
        "PUT",
        JSON.stringify(data)
      );
    },
    delete: async (yarnId: string) => {
      const basePath = getBasePath();
      return getAPIResponse(
        basePath,
        PATHS.MERCHANDISER.YARN.DELETE(yarnId).root,
        null,
        "DELETE"
      );
    },
  },

  // Fabric
  fabric: {
    getAll: async (limit?: number) => {
      const basePath = getBasePath();
      return getAPIResponse(
        basePath,
        PATHS.MERCHANDISER.FABRIC.LIST(limit).root,
        null,
        "GET"
      );
    },
    getById: async (fabricId: string) => {
      const basePath = getBasePath();
      return getAPIResponse(
        basePath,
        PATHS.MERCHANDISER.FABRIC.DETAIL(fabricId).root,
        null,
        "GET"
      );
    },
    create: async (data: any) => {
      const basePath = getBasePath();
      return getAPIResponse(
        basePath,
        PATHS.MERCHANDISER.FABRIC.CREATE().root,
        null,
        "POST",
        JSON.stringify(data)
      );
    },
    update: async (fabricId: string, data: any) => {
      const basePath = getBasePath();
      return getAPIResponse(
        basePath,
        PATHS.MERCHANDISER.FABRIC.UPDATE(fabricId).root,
        null,
        "PUT",
        JSON.stringify(data)
      );
    },
    delete: async (fabricId: string) => {
      const basePath = getBasePath();
      return getAPIResponse(
        basePath,
        PATHS.MERCHANDISER.FABRIC.DELETE(fabricId).root,
        null,
        "DELETE"
      );
    },
  },

  // Trims
  trims: {
    getAll: async (limit?: number) => {
      const basePath = getBasePath();
      return getAPIResponse(
        basePath,
        PATHS.MERCHANDISER.TRIMS.LIST(limit).root,
        null,
        "GET"
      );
    },
    getById: async (productId: string) => {
      const basePath = getBasePath();
      return getAPIResponse(
        basePath,
        PATHS.MERCHANDISER.TRIMS.DETAIL(productId).root,
        null,
        "GET"
      );
    },
    create: async (data: any) => {
      const basePath = getBasePath();
      return getAPIResponse(
        basePath,
        PATHS.MERCHANDISER.TRIMS.CREATE().root,
        null,
        "POST",
        JSON.stringify(data)
      );
    },
    update: async (productId: string, data: any) => {
      const basePath = getBasePath();
      return getAPIResponse(
        basePath,
        PATHS.MERCHANDISER.TRIMS.UPDATE(productId).root,
        null,
        "PUT",
        JSON.stringify(data)
      );
    },
    delete: async (productId: string) => {
      const basePath = getBasePath();
      return getAPIResponse(
        basePath,
        PATHS.MERCHANDISER.TRIMS.DELETE(productId).root,
        null,
        "DELETE"
      );
    },
  },

  // Accessories
  accessories: {
    getAll: async (limit?: number) => {
      const basePath = getBasePath();
      return getAPIResponse(
        basePath,
        PATHS.MERCHANDISER.ACCESSORIES.LIST(limit).root,
        null,
        "GET"
      );
    },
    getById: async (productId: string) => {
      const basePath = getBasePath();
      return getAPIResponse(
        basePath,
        PATHS.MERCHANDISER.ACCESSORIES.DETAIL(productId).root,
        null,
        "GET"
      );
    },
    create: async (data: any) => {
      const basePath = getBasePath();
      return getAPIResponse(
        basePath,
        PATHS.MERCHANDISER.ACCESSORIES.CREATE().root,
        null,
        "POST",
        JSON.stringify(data)
      );
    },
    update: async (productId: string, data: any) => {
      const basePath = getBasePath();
      return getAPIResponse(
        basePath,
        PATHS.MERCHANDISER.ACCESSORIES.UPDATE(productId).root,
        null,
        "PUT",
        JSON.stringify(data)
      );
    },
    delete: async (productId: string) => {
      const basePath = getBasePath();
      return getAPIResponse(
        basePath,
        PATHS.MERCHANDISER.ACCESSORIES.DELETE(productId).root,
        null,
        "DELETE"
      );
    },
  },

  // Finished Good
  finishedGood: {
    getAll: async (limit?: number) => {
      const basePath = getBasePath();
      return getAPIResponse(
        basePath,
        PATHS.MERCHANDISER.FINISHED_GOOD.LIST(limit).root,
        null,
        "GET"
      );
    },
    getById: async (productId: string) => {
      const basePath = getBasePath();
      return getAPIResponse(
        basePath,
        PATHS.MERCHANDISER.FINISHED_GOOD.DETAIL(productId).root,
        null,
        "GET"
      );
    },
    create: async (data: any) => {
      const basePath = getBasePath();
      return getAPIResponse(
        basePath,
        PATHS.MERCHANDISER.FINISHED_GOOD.CREATE().root,
        null,
        "POST",
        JSON.stringify(data)
      );
    },
    update: async (productId: string, data: any) => {
      const basePath = getBasePath();
      return getAPIResponse(
        basePath,
        PATHS.MERCHANDISER.FINISHED_GOOD.UPDATE(productId).root,
        null,
        "PUT",
        JSON.stringify(data)
      );
    },
    delete: async (productId: string) => {
      const basePath = getBasePath();
      return getAPIResponse(
        basePath,
        PATHS.MERCHANDISER.FINISHED_GOOD.DELETE(productId).root,
        null,
        "DELETE"
      );
    },
  },

  // Packing Good
  packingGood: {
    getAll: async (limit?: number) => {
      const basePath = getBasePath();
      return getAPIResponse(
        basePath,
        PATHS.MERCHANDISER.PACKING_GOOD.LIST(limit).root,
        null,
        "GET"
      );
    },
    getById: async (productId: string) => {
      const basePath = getBasePath();
      return getAPIResponse(
        basePath,
        PATHS.MERCHANDISER.PACKING_GOOD.DETAIL(productId).root,
        null,
        "GET"
      );
    },
    create: async (data: any) => {
      const basePath = getBasePath();
      return getAPIResponse(
        basePath,
        PATHS.MERCHANDISER.PACKING_GOOD.CREATE().root,
        null,
        "POST",
        JSON.stringify(data)
      );
    },
    update: async (productId: string, data: any) => {
      const basePath = getBasePath();
      return getAPIResponse(
        basePath,
        PATHS.MERCHANDISER.PACKING_GOOD.UPDATE(productId).root,
        null,
        "PUT",
        JSON.stringify(data)
      );
    },
    delete: async (productId: string) => {
      const basePath = getBasePath();
      return getAPIResponse(
        basePath,
        PATHS.MERCHANDISER.PACKING_GOOD.DELETE(productId).root,
        null,
        "DELETE"
      );
    },
  },

  // Size Chart
  sizeChart: {
    getAll: async (limit?: number) => {
      const basePath = getBasePath();
      return getAPIResponse(
        basePath,
        PATHS.MERCHANDISER.SIZE_CHART.LIST(limit).root,
        null,
        "GET"
      );
    },
    getById: async (sizeId: string) => {
      const basePath = getBasePath();
      return getAPIResponse(
        basePath,
        PATHS.MERCHANDISER.SIZE_CHART.DETAIL(sizeId).root,
        null,
        "GET"
      );
    },
    create: async (data: any) => {
      const basePath = getBasePath();
      return getAPIResponse(
        basePath,
        PATHS.MERCHANDISER.SIZE_CHART.CREATE().root,
        null,
        "POST",
        JSON.stringify(data)
      );
    },
    update: async (sizeId: string, data: any) => {
      const basePath = getBasePath();
      return getAPIResponse(
        basePath,
        PATHS.MERCHANDISER.SIZE_CHART.UPDATE(sizeId).root,
        null,
        "PUT",
        JSON.stringify(data)
      );
    },
    delete: async (sizeId: string) => {
      const basePath = getBasePath();
      return getAPIResponse(
        basePath,
        PATHS.MERCHANDISER.SIZE_CHART.DELETE(sizeId).root,
        null,
        "DELETE"
      );
    },
  },

  // Sample Primary
  samplePrimary: {
    getAll: async (limit?: number) => {
      const basePath = getBasePath();
      return getAPIResponse(
        basePath,
        PATHS.MERCHANDISER.SAMPLE_PRIMARY.LIST(limit).root,
        null,
        "GET"
      );
    },
    getById: async (sampleId: string) => {
      const basePath = getBasePath();
      return getAPIResponse(
        basePath,
        PATHS.MERCHANDISER.SAMPLE_PRIMARY.DETAIL(sampleId).root,
        null,
        "GET"
      );
    },
    create: async (data: any) => {
      const basePath = getBasePath();
      return getAPIResponse(
        basePath,
        PATHS.MERCHANDISER.SAMPLE_PRIMARY.CREATE().root,
        null,
        "POST",
        JSON.stringify(data)
      );
    },
    update: async (sampleId: string, data: any) => {
      const basePath = getBasePath();
      return getAPIResponse(
        basePath,
        PATHS.MERCHANDISER.SAMPLE_PRIMARY.UPDATE(sampleId).root,
        null,
        "PUT",
        JSON.stringify(data)
      );
    },
    delete: async (sampleId: string) => {
      const basePath = getBasePath();
      return getAPIResponse(
        basePath,
        PATHS.MERCHANDISER.SAMPLE_PRIMARY.DELETE(sampleId).root,
        null,
        "DELETE"
      );
    },
    syncToSamples: async () => {
      const basePath = getBasePath();
      return getAPIResponse(
        basePath,
        "/merchandiser/sample-primary/sync-to-samples",
        null,
        "POST"
      );
    },
  },

  // Sample TNA
  sampleTna: {
    getAll: async (limit?: number) => {
      const basePath = getBasePath();
      return getAPIResponse(
        basePath,
        PATHS.MERCHANDISER.SAMPLE_TNA.LIST(undefined, limit).root,
        null,
        "GET"
      );
    },
    getById: async (tnaId: number) => {
      const basePath = getBasePath();
      return getAPIResponse(
        basePath,
        PATHS.MERCHANDISER.SAMPLE_TNA.DETAIL(tnaId).root,
        null,
        "GET"
      );
    },
    create: async (data: any) => {
      const basePath = getBasePath();
      return getAPIResponse(
        basePath,
        PATHS.MERCHANDISER.SAMPLE_TNA.CREATE().root,
        null,
        "POST",
        JSON.stringify(data)
      );
    },
    update: async (tnaId: number, data: any) => {
      const basePath = getBasePath();
      return getAPIResponse(
        basePath,
        PATHS.MERCHANDISER.SAMPLE_TNA.UPDATE(tnaId).root,
        null,
        "PUT",
        JSON.stringify(data)
      );
    },
    delete: async (tnaId: number) => {
      const basePath = getBasePath();
      return getAPIResponse(
        basePath,
        PATHS.MERCHANDISER.SAMPLE_TNA.DELETE(tnaId).root,
        null,
        "DELETE"
      );
    },
  },

  // Sample Status
  sampleStatus: {
    getAll: async (limit?: number) => {
      const basePath = getBasePath();
      return getAPIResponse(
        basePath,
        PATHS.MERCHANDISER.SAMPLE_STATUS.LIST(undefined, limit).root,
        null,
        "GET"
      );
    },
    getById: async (statusId: number) => {
      const basePath = getBasePath();
      return getAPIResponse(
        basePath,
        PATHS.MERCHANDISER.SAMPLE_STATUS.DETAIL(statusId).root,
        null,
        "GET"
      );
    },
    create: async (data: any) => {
      const basePath = getBasePath();
      return getAPIResponse(
        basePath,
        PATHS.MERCHANDISER.SAMPLE_STATUS.CREATE().root,
        null,
        "POST",
        JSON.stringify(data)
      );
    },
    update: async (statusId: number, data: any) => {
      const basePath = getBasePath();
      return getAPIResponse(
        basePath,
        PATHS.MERCHANDISER.SAMPLE_STATUS.UPDATE(statusId).root,
        null,
        "PUT",
        JSON.stringify(data)
      );
    },
    delete: async (statusId: number) => {
      const basePath = getBasePath();
      return getAPIResponse(
        basePath,
        PATHS.MERCHANDISER.SAMPLE_STATUS.DELETE(statusId).root,
        null,
        "DELETE"
      );
    },
    sync: async () => {
      const basePath = getBasePath();
      return getAPIResponse(
        basePath,
        PATHS.MERCHANDISER.SAMPLE_STATUS.SYNC().root,
        null,
        "POST"
      );
    },
  },

  // Style Creation
  styleCreation: {
    getAll: async (limit?: number) => {
      const basePath = getBasePath();
      return getAPIResponse(
        basePath,
        PATHS.MERCHANDISER.STYLE_CREATION.LIST(limit).root,
        null,
        "GET"
      );
    },
    getById: async (styleId: string) => {
      const basePath = getBasePath();
      return getAPIResponse(
        basePath,
        PATHS.MERCHANDISER.STYLE_CREATION.DETAIL(styleId).root,
        null,
        "GET"
      );
    },
    create: async (data: any) => {
      const basePath = getBasePath();
      return getAPIResponse(
        basePath,
        PATHS.MERCHANDISER.STYLE_CREATION.CREATE().root,
        null,
        "POST",
        JSON.stringify(data)
      );
    },
    update: async (styleId: string, data: any) => {
      const basePath = getBasePath();
      return getAPIResponse(
        basePath,
        PATHS.MERCHANDISER.STYLE_CREATION.UPDATE(styleId).root,
        null,
        "PUT",
        JSON.stringify(data)
      );
    },
    delete: async (styleId: string) => {
      const basePath = getBasePath();
      return getAPIResponse(
        basePath,
        PATHS.MERCHANDISER.STYLE_CREATION.DELETE(styleId).root,
        null,
        "DELETE"
      );
    },
  },

  // Style Basic Info
  styleBasicInfo: {
    getAll: async (limit?: number) => {
      const basePath = getBasePath();
      return getAPIResponse(
        basePath,
        PATHS.MERCHANDISER.STYLE_BASIC_INFO.LIST(limit).root,
        null,
        "GET"
      );
    },
    getById: async (infoId: string) => {
      const basePath = getBasePath();
      return getAPIResponse(
        basePath,
        PATHS.MERCHANDISER.STYLE_BASIC_INFO.DETAIL(infoId).root,
        null,
        "GET"
      );
    },
    create: async (data: any) => {
      const basePath = getBasePath();
      return getAPIResponse(
        basePath,
        PATHS.MERCHANDISER.STYLE_BASIC_INFO.CREATE().root,
        null,
        "POST",
        JSON.stringify(data)
      );
    },
    update: async (infoId: string, data: any) => {
      const basePath = getBasePath();
      return getAPIResponse(
        basePath,
        PATHS.MERCHANDISER.STYLE_BASIC_INFO.UPDATE(infoId).root,
        null,
        "PUT",
        JSON.stringify(data)
      );
    },
    delete: async (infoId: string) => {
      const basePath = getBasePath();
      return getAPIResponse(
        basePath,
        PATHS.MERCHANDISER.STYLE_BASIC_INFO.DELETE(infoId).root,
        null,
        "DELETE"
      );
    },
  },

  // Style Material Link
  styleMaterialLink: {
    getAll: async (limit?: number) => {
      const basePath = getBasePath();
      return getAPIResponse(
        basePath,
        PATHS.MERCHANDISER.STYLE_MATERIAL.LIST(undefined, limit).root,
        null,
        "GET"
      );
    },
    getById: async (linkId: string) => {
      const basePath = getBasePath();
      return getAPIResponse(
        basePath,
        PATHS.MERCHANDISER.STYLE_MATERIAL.DETAIL(linkId).root,
        null,
        "GET"
      );
    },
    create: async (data: any) => {
      const basePath = getBasePath();
      return getAPIResponse(
        basePath,
        PATHS.MERCHANDISER.STYLE_MATERIAL.CREATE().root,
        null,
        "POST",
        JSON.stringify(data)
      );
    },
    update: async (linkId: string, data: any) => {
      const basePath = getBasePath();
      return getAPIResponse(
        basePath,
        PATHS.MERCHANDISER.STYLE_MATERIAL.UPDATE(linkId).root,
        null,
        "PUT",
        JSON.stringify(data)
      );
    },
    delete: async (linkId: string) => {
      const basePath = getBasePath();
      return getAPIResponse(
        basePath,
        PATHS.MERCHANDISER.STYLE_MATERIAL.DELETE(linkId).root,
        null,
        "DELETE"
      );
    },
  },

  // Style Color
  styleColor: {
    getAll: async (styleId?: string, limit?: number) => {
      const basePath = getBasePath();
      return getAPIResponse(
        basePath,
        PATHS.MERCHANDISER.STYLE_COLOR.LIST(styleId, limit).root,
        null,
        "GET"
      );
    },
    getById: async (id: number) => {
      const basePath = getBasePath();
      return getAPIResponse(
        basePath,
        PATHS.MERCHANDISER.STYLE_COLOR.DETAIL(id).root,
        null,
        "GET"
      );
    },
    create: async (data: any) => {
      const basePath = getBasePath();
      return getAPIResponse(
        basePath,
        PATHS.MERCHANDISER.STYLE_COLOR.CREATE().root,
        null,
        "POST",
        JSON.stringify(data)
      );
    },
    update: async (id: number, data: any) => {
      const basePath = getBasePath();
      return getAPIResponse(
        basePath,
        PATHS.MERCHANDISER.STYLE_COLOR.UPDATE(id).root,
        null,
        "PUT",
        JSON.stringify(data)
      );
    },
    delete: async (id: number) => {
      const basePath = getBasePath();
      return getAPIResponse(
        basePath,
        PATHS.MERCHANDISER.STYLE_COLOR.DELETE(id).root,
        null,
        "DELETE"
      );
    },
  },

  // Style Size
  styleSize: {
    getAll: async (styleId?: string, limit?: number) => {
      const basePath = getBasePath();
      return getAPIResponse(
        basePath,
        PATHS.MERCHANDISER.STYLE_SIZE.LIST(styleId, limit).root,
        null,
        "GET"
      );
    },
    getById: async (id: number) => {
      const basePath = getBasePath();
      return getAPIResponse(
        basePath,
        PATHS.MERCHANDISER.STYLE_SIZE.DETAIL(id).root,
        null,
        "GET"
      );
    },
    create: async (data: any) => {
      const basePath = getBasePath();
      return getAPIResponse(
        basePath,
        PATHS.MERCHANDISER.STYLE_SIZE.CREATE().root,
        null,
        "POST",
        JSON.stringify(data)
      );
    },
    update: async (id: number, data: any) => {
      const basePath = getBasePath();
      return getAPIResponse(
        basePath,
        PATHS.MERCHANDISER.STYLE_SIZE.UPDATE(id).root,
        null,
        "PUT",
        JSON.stringify(data)
      );
    },
    delete: async (id: number) => {
      const basePath = getBasePath();
      return getAPIResponse(
        basePath,
        PATHS.MERCHANDISER.STYLE_SIZE.DELETE(id).root,
        null,
        "DELETE"
      );
    },
  },

  // Style Variants
  styleVariants: {
    getAll: async (styleId?: string, limit?: number) => {
      const basePath = getBasePath();
      return getAPIResponse(
        basePath,
        PATHS.MERCHANDISER.STYLE_VARIANT.LIST(styleId, limit).root,
        null,
        "GET"
      );
    },
    getById: async (styleVariantId: string) => {
      const basePath = getBasePath();
      return getAPIResponse(
        basePath,
        PATHS.MERCHANDISER.STYLE_VARIANT.DETAIL(styleVariantId).root,
        null,
        "GET"
      );
    },
    create: async (data: any) => {
      const basePath = getBasePath();
      return getAPIResponse(
        basePath,
        PATHS.MERCHANDISER.STYLE_VARIANT.CREATE().root,
        null,
        "POST",
        JSON.stringify(data)
      );
    },
    autoGenerate: async (styleId: string) => {
      const basePath = getBasePath();
      return getAPIResponse(
        basePath,
        PATHS.MERCHANDISER.STYLE_VARIANT.AUTO_GENERATE().root,
        null,
        "POST",
        JSON.stringify({ style_id: styleId })
      );
    },
    update: async (styleVariantId: string, data: any) => {
      const basePath = getBasePath();
      return getAPIResponse(
        basePath,
        PATHS.MERCHANDISER.STYLE_VARIANT.UPDATE(styleVariantId).root,
        null,
        "PUT",
        JSON.stringify(data)
      );
    },
    delete: async (styleVariantId: string) => {
      const basePath = getBasePath();
      return getAPIResponse(
        basePath,
        PATHS.MERCHANDISER.STYLE_VARIANT.DELETE(styleVariantId).root,
        null,
        "DELETE"
      );
    },
  },

  // CM Calculation
  cmCalculation: {
    getAll: async (styleId?: string, limit?: number) => {
      const basePath = getBasePath();
      return getAPIResponse(
        basePath,
        PATHS.MERCHANDISER.CM_CALCULATION.LIST(styleId, limit).root,
        null,
        "GET"
      );
    },
    getById: async (cmId: string) => {
      const basePath = getBasePath();
      return getAPIResponse(
        basePath,
        PATHS.MERCHANDISER.CM_CALCULATION.DETAIL(cmId).root,
        null,
        "GET"
      );
    },
    create: async (data: any) => {
      const basePath = getBasePath();
      return getAPIResponse(
        basePath,
        PATHS.MERCHANDISER.CM_CALCULATION.CREATE().root,
        null,
        "POST",
        JSON.stringify(data)
      );
    },
    update: async (cmId: string, data: any) => {
      const basePath = getBasePath();
      return getAPIResponse(
        basePath,
        PATHS.MERCHANDISER.CM_CALCULATION.UPDATE(cmId).root,
        null,
        "PUT",
        JSON.stringify(data)
      );
    },
    delete: async (cmId: string) => {
      const basePath = getBasePath();
      return getAPIResponse(
        basePath,
        PATHS.MERCHANDISER.CM_CALCULATION.DELETE(cmId).root,
        null,
        "DELETE"
      );
    },
  },
};

// ============================================================================
// SETTINGS SERVICE
// ============================================================================

export const settingsService = {
  // Company Profile
  companyProfile: {
    get: async (token: string) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, "/settings/company-profile", token, "GET");
    },
    update: async (data: any, token: string) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, "/settings/company-profile", token, "PUT", JSON.stringify(data));
    },
    uploadLogo: async (file: File, token: string) => {
      const basePath = getBasePath();
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(`${basePath}/settings/company-profile/upload-logo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to upload logo');
      }
      
      return await response.json();
    },
  },

  // Branches
  branches: {
    getAll: async (token: string, limit?: number) => {
      const basePath = getBasePath();
      const params = limit ? `?limit=${limit}` : "";
      return getAPIResponse(basePath, `/settings/branches${params}`, token, "GET");
    },
    getById: async (id: number, token: string) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, `/settings/branches/${id}`, token, "GET");
    },
    create: async (data: any, token: string) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, "/settings/branches", token, "POST", JSON.stringify(data));
    },
    update: async (id: number, data: any, token: string) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, `/settings/branches/${id}`, token, "PUT", JSON.stringify(data));
    },
    delete: async (id: number, token: string) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, `/settings/branches/${id}`, token, "DELETE");
    },
  },

  // Departments
  departments: {
    getAll: async (token: string, limit?: number) => {
      const basePath = getBasePath();
      const params = limit ? `?limit=${limit}` : "";
      return getAPIResponse(basePath, `/settings/departments${params}`, token, "GET");
    },
    getById: async (id: number, token: string) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, `/settings/departments/${id}`, token, "GET");
    },
    create: async (data: any, token: string) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, "/settings/departments", token, "POST", JSON.stringify(data));
    },
    update: async (id: number, data: any, token: string) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, `/settings/departments/${id}`, token, "PUT", JSON.stringify(data));
    },
    delete: async (id: number, token: string) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, `/settings/departments/${id}`, token, "DELETE");
    },
  },

  // Roles
  roles: {
    getAll: async (token: string, limit?: number) => {
      const basePath = getBasePath();
      const params = limit ? `?limit=${limit}` : "";
      return getAPIResponse(basePath, `/settings/roles${params}`, token, "GET");
    },
    getById: async (id: number, token: string) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, `/settings/roles/${id}`, token, "GET");
    },
    create: async (data: any, token: string) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, "/settings/roles", token, "POST", JSON.stringify(data));
    },
    update: async (id: number, data: any, token: string) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, `/settings/roles/${id}`, token, "PUT", JSON.stringify(data));
    },
    delete: async (id: number, token: string) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, `/settings/roles/${id}`, token, "DELETE");
    },
    getPermissions: async (id: number, token: string) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, `/settings/roles/${id}/permissions`, token, "GET");
    },
    assignPermission: async (roleId: number, permissionId: number, token: string) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, `/settings/roles/${roleId}/permissions`, token, "POST", JSON.stringify({ permission_id: permissionId }));
    },
    removePermission: async (roleId: number, permissionId: number, token: string) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, `/settings/roles/${roleId}/permissions/${permissionId}`, token, "DELETE");
    },
  },

  // Permissions
  permissions: {
    getAll: async (token: string) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, "/settings/permissions", token, "GET");
    },
    create: async (data: any, token: string) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, "/settings/permissions", token, "POST", JSON.stringify(data));
    },
  },

  // Currencies
  currencies: {
    getAll: async (token: string, limit?: number) => {
      const basePath = getBasePath();
      const params = limit ? `?limit=${limit}` : "";
      return getAPIResponse(basePath, `/settings/currencies${params}`, token, "GET");
    },
    getById: async (id: number, token: string) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, `/settings/currencies/${id}`, token, "GET");
    },
    create: async (data: any, token: string) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, "/settings/currencies", token, "POST", JSON.stringify(data));
    },
    update: async (id: number, data: any, token: string) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, `/settings/currencies/${id}`, token, "PUT", JSON.stringify(data));
    },
    delete: async (id: number, token: string) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, `/settings/currencies/${id}`, token, "DELETE");
    },
  },

  // Taxes
  taxes: {
    getAll: async (token: string, limit?: number) => {
      const basePath = getBasePath();
      const params = limit ? `?limit=${limit}` : "";
      return getAPIResponse(basePath, `/settings/taxes${params}`, token, "GET");
    },
    getById: async (id: number, token: string) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, `/settings/taxes/${id}`, token, "GET");
    },
    create: async (data: any, token: string) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, "/settings/taxes", token, "POST", JSON.stringify(data));
    },
    update: async (id: number, data: any, token: string) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, `/settings/taxes/${id}`, token, "PUT", JSON.stringify(data));
    },
    delete: async (id: number, token: string) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, `/settings/taxes/${id}`, token, "DELETE");
    },
  },

  // UoM Categories
  uomCategories: {
    getAll: async (token: string, limit?: number) => {
      const basePath = getBasePath();
      const params = limit ? `?limit=${limit}` : "";
      return getAPIResponse(basePath, `/settings/uom-categories${params}`, token, "GET");
    },
    getAllWithCounts: async (token: string, isActive?: boolean) => {
      const basePath = getBasePath();
      const params = isActive !== undefined ? `?is_active=${isActive}` : "";
      return getAPIResponse(basePath, `/settings/uom-categories/with-counts${params}`, token, "GET");
    },
    getById: async (id: number, token: string) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, `/settings/uom-categories/${id}`, token, "GET");
    },
    create: async (data: any, token: string) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, "/settings/uom-categories", token, "POST", JSON.stringify(data));
    },
    update: async (id: number, data: any, token: string) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, `/settings/uom-categories/${id}`, token, "PUT", JSON.stringify(data));
    },
    delete: async (id: number, token: string) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, `/settings/uom-categories/${id}`, token, "DELETE");
    },
  },

  // UoM
  uom: {
    getAll: async (token: string, categoryId?: number, limit?: number) => {
      const basePath = getBasePath();
      const params = new URLSearchParams();
      if (categoryId) params.append("category_id", categoryId.toString());
      if (limit) params.append("limit", limit.toString());
      const queryString = params.toString() ? `?${params.toString()}` : "";
      return getAPIResponse(basePath, `/settings/uom${queryString}`, token, "GET");
    },
    getById: async (id: number, token: string) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, `/settings/uom/${id}`, token, "GET");
    },
    create: async (data: any, token: string) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, "/settings/uom", token, "POST", JSON.stringify(data));
    },
    update: async (id: number, data: any, token: string) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, `/settings/uom/${id}`, token, "PUT", JSON.stringify(data));
    },
    delete: async (id: number, token: string) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, `/settings/uom/${id}`, token, "DELETE");
    },
    // New enhanced endpoints
    convert: async (data: { from_uom_id: number; to_uom_id: number; value: number }, token: string) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, "/settings/uom/convert", token, "POST", JSON.stringify(data));
    },
    getCompatible: async (uomId: number, token: string) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, `/settings/uom/compatible/${uomId}`, token, "GET");
    },
    validateSymbol: async (data: { symbol: string; category_id: number; exclude_id?: number }, token: string) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, "/settings/uom/validate-symbol", token, "POST", JSON.stringify(data));
    },
    search: async (query: string, token: string, categoryId?: number, limit?: number) => {
      const basePath = getBasePath();
      const params = new URLSearchParams();
      params.append("q", query);
      if (categoryId) params.append("category_id", categoryId.toString());
      if (limit) params.append("limit", limit.toString());
      return getAPIResponse(basePath, `/settings/uom/search?${params.toString()}`, token, "GET");
    },
    getForSelector: async (token: string, categoryId?: number, categoryName?: string, search?: string) => {
      const basePath = getBasePath();
      const params = new URLSearchParams();
      if (categoryId) params.append("category_id", categoryId.toString());
      if (categoryName) params.append("category_name", categoryName);
      if (search) params.append("search", search);
      const queryString = params.toString() ? `?${params.toString()}` : "";
      return getAPIResponse(basePath, `/settings/uom/for-selector${queryString}`, token, "GET");
    },
  },

  // Color Families
  colorFamilies: {
    getAll: async (token: string, limit?: number) => {
      const basePath = getBasePath();
      const params = limit ? `?limit=${limit}` : "";
      return getAPIResponse(basePath, `/settings/color-families${params}`, token, "GET");
    },
    getById: async (id: number, token: string) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, `/settings/color-families/${id}`, token, "GET");
    },
    create: async (data: any, token: string) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, "/settings/color-families", token, "POST", JSON.stringify(data));
    },
    update: async (id: number, data: any, token: string) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, `/settings/color-families/${id}`, token, "PUT", JSON.stringify(data));
    },
    delete: async (id: number, token: string) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, `/settings/color-families/${id}`, token, "DELETE");
    },
  },

  // Colors
  colors: {
    getAll: async (token: string, familyId?: number, limit?: number) => {
      const basePath = getBasePath();
      const params = new URLSearchParams();
      if (familyId) params.append("family_id", familyId.toString());
      if (limit) params.append("limit", limit.toString());
      const queryString = params.toString() ? `?${params.toString()}` : "";
      return getAPIResponse(basePath, `/settings/colors${queryString}`, token, "GET");
    },
    getById: async (id: number, token: string) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, `/settings/colors/${id}`, token, "GET");
    },
    create: async (data: any, token: string) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, "/settings/colors", token, "POST", JSON.stringify(data));
    },
    update: async (id: number, data: any, token: string) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, `/settings/colors/${id}`, token, "PUT", JSON.stringify(data));
    },
    delete: async (id: number, token: string) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, `/settings/colors/${id}`, token, "DELETE");
    },
  },

  // Color Values
  colorValues: {
    getAll: async (token: string, limit?: number) => {
      const basePath = getBasePath();
      const params = limit ? `?limit=${limit}` : "";
      return getAPIResponse(basePath, `/settings/color-values${params}`, token, "GET");
    },
    getById: async (id: number, token: string) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, `/settings/color-values/${id}`, token, "GET");
    },
    create: async (data: any, token: string) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, "/settings/color-values", token, "POST", JSON.stringify(data));
    },
    update: async (id: number, data: any, token: string) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, `/settings/color-values/${id}`, token, "PUT", JSON.stringify(data));
    },
    delete: async (id: number, token: string) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, `/settings/color-values/${id}`, token, "DELETE");
    },
  },

  // Color Master
  colorMaster: {
    getAll: async (token: string, colorCodeType?: string, limit?: number, skip?: number) => {
      const basePath = getBasePath();
      const params = new URLSearchParams();
      if (colorCodeType) params.append("color_code_type", colorCodeType);
      if (limit) params.append("limit", limit.toString());
      if (skip !== undefined) params.append("skip", skip.toString());
      const queryString = params.toString() ? `?${params.toString()}` : "";
      return getAPIResponse(basePath, `/settings/color-master${queryString}`, token, "GET");
    },
    getById: async (id: number, token: string) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, `/settings/color-master/${id}`, token, "GET");
    },
    create: async (data: any, token: string) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, "/settings/color-master", token, "POST", JSON.stringify(data));
    },
    update: async (id: number, data: any, token: string) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, `/settings/color-master/${id}`, token, "PUT", JSON.stringify(data));
    },
    delete: async (id: number, token: string) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, `/settings/color-master/${id}`, token, "DELETE");
    },
    seedTcx: async (token: string) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, "/settings/color-master/seed-tcx", token, "POST");
    },
  },

  // Countries
  countries: {
    getAll: async (token: string, limit?: number) => {
      const basePath = getBasePath();
      const params = limit ? `?limit=${limit}` : "";
      return getAPIResponse(basePath, `/settings/countries${params}`, token, "GET");
    },
    getById: async (id: number, token: string) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, `/settings/countries/${id}`, token, "GET");
    },
    create: async (data: any, token: string) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, "/settings/countries", token, "POST", JSON.stringify(data));
    },
    update: async (id: number, data: any, token: string) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, `/settings/countries/${id}`, token, "PUT", JSON.stringify(data));
    },
    delete: async (id: number, token: string) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, `/settings/countries/${id}`, token, "DELETE");
    },
  },

  // Cities
  cities: {
    getAll: async (token: string, countryId?: number, limit?: number) => {
      const basePath = getBasePath();
      const params = new URLSearchParams();
      if (countryId) params.append("country_id", countryId.toString());
      if (limit) params.append("limit", limit.toString());
      const queryString = params.toString() ? `?${params.toString()}` : "";
      return getAPIResponse(basePath, `/settings/cities${queryString}`, token, "GET");
    },
    getById: async (id: number, token: string) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, `/settings/cities/${id}`, token, "GET");
    },
    create: async (data: any, token: string) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, "/settings/cities", token, "POST", JSON.stringify(data));
    },
    update: async (id: number, data: any, token: string) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, `/settings/cities/${id}`, token, "PUT", JSON.stringify(data));
    },
    delete: async (id: number, token: string) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, `/settings/cities/${id}`, token, "DELETE");
    },
  },

  // Ports
  ports: {
    getAll: async (token: string, countryId?: number, limit?: number) => {
      const basePath = getBasePath();
      const params = new URLSearchParams();
      if (countryId) params.append("country_id", countryId.toString());
      if (limit) params.append("limit", limit.toString());
      const queryString = params.toString() ? `?${params.toString()}` : "";
      return getAPIResponse(basePath, `/settings/ports${queryString}`, token, "GET");
    },
    getById: async (id: number, token: string) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, `/settings/ports/${id}`, token, "GET");
    },
    create: async (data: any, token: string) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, "/settings/ports", token, "POST", JSON.stringify(data));
    },
    update: async (id: number, data: any, token: string) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, `/settings/ports/${id}`, token, "PUT", JSON.stringify(data));
    },
    delete: async (id: number, token: string) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, `/settings/ports/${id}`, token, "DELETE");
    },
  },

  // Warehouses
  warehouses: {
    getAll: async (token: string, limit?: number) => {
      const basePath = getBasePath();
      const params = limit ? `?limit=${limit}` : "";
      return getAPIResponse(basePath, `/settings/warehouses${params}`, token, "GET");
    },
    getById: async (id: number, token: string) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, `/settings/warehouses/${id}`, token, "GET");
    },
    create: async (data: any, token: string) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, "/settings/warehouses", token, "POST", JSON.stringify(data));
    },
    update: async (id: number, data: any, token: string) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, `/settings/warehouses/${id}`, token, "PUT", JSON.stringify(data));
    },
    delete: async (id: number, token: string) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, `/settings/warehouses/${id}`, token, "DELETE");
    },
  },

  // Document Numbering
  documentNumbering: {
    getAll: async (token: string) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, "/settings/document-numbering", token, "GET");
    },
    getById: async (id: number, token: string) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, `/settings/document-numbering/${id}`, token, "GET");
    },
    create: async (data: any, token: string) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, "/settings/document-numbering", token, "POST", JSON.stringify(data));
    },
    update: async (id: number, data: any, token: string) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, `/settings/document-numbering/${id}`, token, "PUT", JSON.stringify(data));
    },
    delete: async (id: number, token: string) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, `/settings/document-numbering/${id}`, token, "DELETE");
    },
    getNextNumber: async (documentType: string, branchId: number | null, token: string) => {
      const basePath = getBasePath();
      const params = new URLSearchParams();
      params.append("document_type", documentType);
      if (branchId) params.append("branch_id", branchId.toString());
      return getAPIResponse(basePath, `/settings/document-numbering/next?${params.toString()}`, token, "GET");
    },
  },

  // Fiscal Years
  fiscalYears: {
    getAll: async (token: string) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, "/settings/fiscal-years", token, "GET");
    },
    getById: async (id: number, token: string) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, `/settings/fiscal-years/${id}`, token, "GET");
    },
    create: async (data: any, token: string) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, "/settings/fiscal-years", token, "POST", JSON.stringify(data));
    },
    update: async (id: number, data: any, token: string) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, `/settings/fiscal-years/${id}`, token, "PUT", JSON.stringify(data));
    },
    delete: async (id: number, token: string) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, `/settings/fiscal-years/${id}`, token, "DELETE");
    },
  },

  // Per Minute Value
  perMinuteValue: {
    getAll: async (token: string) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, "/settings/per-minute-value", token, "GET");
    },
    getCurrent: async (token: string) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, "/settings/per-minute-value/current", token, "GET");
    },
    getById: async (id: number, token: string) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, `/settings/per-minute-value/${id}`, token, "GET");
    },
    create: async (data: any, token: string) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, "/settings/per-minute-value", token, "POST", JSON.stringify(data));
    },
    update: async (id: number, data: any, token: string) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, `/settings/per-minute-value/${id}`, token, "PUT", JSON.stringify(data));
    },
    delete: async (id: number, token: string) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, `/settings/per-minute-value/${id}`, token, "DELETE");
    },
  },

  // Chart of Accounts
  chartOfAccounts: {
    getAll: async (token: string, limit?: number) => {
      const basePath = getBasePath();
      const params = limit ? `?limit=${limit}` : "";
      return getAPIResponse(basePath, `/settings/chart-of-accounts${params}`, token, "GET");
    },
    getById: async (id: number, token: string) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, `/settings/chart-of-accounts/${id}`, token, "GET");
    },
    create: async (data: any, token: string) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, "/settings/chart-of-accounts", token, "POST", JSON.stringify(data));
    },
    update: async (id: number, data: any, token: string) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, `/settings/chart-of-accounts/${id}`, token, "PUT", JSON.stringify(data));
    },
    delete: async (id: number, token: string) => {
      const basePath = getBasePath();
      return getAPIResponse(basePath, `/settings/chart-of-accounts/${id}`, token, "DELETE");
    },
  },

  // Seed Data
  seed: async (token: string) => {
    const basePath = getBasePath();
    return getAPIResponse(basePath, "/settings/seed", token, "POST");
  },
};

// ============================================================================
// BACKWARD COMPATIBILITY - Unified API Export
// ============================================================================

/**
 * Unified API object for backward compatibility
 * Maintains existing import patterns: import { api } from "@/services/api"
 */
// ============================================================================
// NOTIFICATIONS SERVICE
// ============================================================================

const getAuthToken = async (): Promise<string | null> => {
  if (typeof window !== "undefined") {
    try {
      // Try to get encrypted token and decrypt it
      const { AUTH_CONFIG } = await import("@/lib/config");
      const TOKEN_STORAGE_KEY = AUTH_CONFIG.TOKEN_STORAGE_KEY; // "encrypted_token"
      const encryptedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
      
      if (encryptedToken) {
        try {
          // Import decrypt function dynamically
          const { safeDecrypt } = await import("@/lib/crypto");
          const decryptedToken = await safeDecrypt(encryptedToken);
          if (decryptedToken) {
            return decryptedToken;
          }
        } catch (decryptError) {
          // If decryption fails, it might be plaintext (encryption disabled)
          // Check if it looks like a JWT token (has dots)
          if (encryptedToken.includes(".")) {
            return encryptedToken;
          }
        }
      }
      
      // Fallback to legacy token storage
      const legacyToken = localStorage.getItem(AUTH_CONFIG.LEGACY_TOKEN_KEY) || sessionStorage.getItem(AUTH_CONFIG.LEGACY_TOKEN_KEY);
      if (legacyToken) {
        return legacyToken;
      }
    } catch (error) {
      console.error("Error getting auth token:", error);
      // Final fallback
      return localStorage.getItem("token") || sessionStorage.getItem("token");
    }
  }
  return null;
};

export const notificationsService = {
  getAll: async (unreadOnly?: boolean, limit?: number) => {
    const basePath = getBasePath();
    const token = await getAuthToken();
    return getAPIResponse(
      basePath,
      PATHS.NOTIFICATIONS.LIST(unreadOnly, limit).root,
      token,
      "GET"
    );
  },
  
  getUnreadCount: async () => {
    const basePath = getBasePath();
    const token = await getAuthToken();
    return getAPIResponse(
      basePath,
      PATHS.NOTIFICATIONS.UNREAD_COUNT().root,
      token,
      "GET"
    );
  },
  
  markAsRead: async (id: number) => {
    const basePath = getBasePath();
    const token = await getAuthToken();
    return getAPIResponse(
      basePath,
      PATHS.NOTIFICATIONS.MARK_READ(id).root,
      token,
      "PUT"
    );
  },
  
  markAllAsRead: async () => {
    const basePath = getBasePath();
    const token = await getAuthToken();
    return getAPIResponse(
      basePath,
      PATHS.NOTIFICATIONS.MARK_ALL_READ().root,
      token,
      "PUT"
    );
  },
};

export const api = {
  auth: authService,
  users: usersService,
  buyers: buyersService,
  buyerTypes: buyerTypesService,
  suppliers: suppliersService,
  contacts: contactsService,
  shipping: shippingService,
  banking: bankingService,
  samples: samplesService,
  styles: stylesService,
  styleVariants: styleVariantsService,
  requiredMaterials: requiredMaterialsService,
  orders: ordersService,
  materials: materialsService,
  colors: colorsService,
  sizes: sizesService,
  production: productionService,
  inventory: inventoryService,
  reports: reportsService,
  merchandiser: merchandiserService,
  settings: settingsService,
  notifications: notificationsService,
};

// ============================================================================
// Type Exports
// ============================================================================

export type ApiType = typeof api;

// ============================================================================
// WORKFLOW SERVICES
// ============================================================================

export const workflowService = {
  createWorkflow: async (data: Record<string, any>) => {
    const basePath = getBasePath();
    return getAPIResponse(
      basePath,
      "/workflows",
      null,
      "POST",
      JSON.stringify(data)
    );
  },

  getWorkflow: async (id: number) => {
    const basePath = getBasePath();
    return getAPIResponse(basePath, `/workflows/${id}`, null, "GET");
  },

  getWorkflows: async (filters?: Record<string, any>) => {
    const basePath = getBasePath();
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    const queryString = params.toString() ? `?${params.toString()}` : "";
    return getAPIResponse(basePath, `/workflows${queryString}`, null, "GET");
  },

  getStatistics: async () => {
    const basePath = getBasePath();
    return getAPIResponse(basePath, "/workflows/statistics", null, "GET");
  },

  updateWorkflow: async (id: number, data: Record<string, any>) => {
    const basePath = getBasePath();
    return getAPIResponse(
      basePath,
      `/workflows/${id}`,
      null,
      "PUT",
      JSON.stringify(data)
    );
  },

  deleteWorkflow: async (id: number) => {
    const basePath = getBasePath();
    return getAPIResponse(basePath, `/workflows/${id}`, null, "DELETE");
  },

  getWorkflowCards: async (workflowId: number) => {
    const basePath = getBasePath();
    return getAPIResponse(basePath, `/workflows/${workflowId}/cards`, null, "GET");
  },

  updateCardStatus: async (cardId: number, status: string, reason?: string) => {
    const basePath = getBasePath();
    const data = { status, reason };
    return getAPIResponse(
      basePath,
      `/workflow-cards/${cardId}/status`,
      null,
      "PUT",
      JSON.stringify(data)
    );
  },

  updateCardAssignee: async (cardId: number, assignee: string) => {
    const basePath = getBasePath();
    return getAPIResponse(
      basePath,
      `/workflow-cards/${cardId}/assignee`,
      null,
      "PUT",
      JSON.stringify({ assignee })
    );
  },

  addCardComment: async (cardId: number, comment: string) => {
    const basePath = getBasePath();
    return getAPIResponse(
      basePath,
      `/workflow-cards/${cardId}/comments`,
      null,
      "POST",
      JSON.stringify({ comment_text: comment })
    );
  },

  uploadCardAttachment: async (cardId: number, file: File) => {
    const basePath = getBasePath();
    const formData = new FormData();
    formData.append("file", file);
    return getAPIResponse(
      basePath,
      `/workflow-cards/${cardId}/attachments`,
      null,
      "POST",
      formData,
      true
    );
  },
};

export const workflowTemplateService = {
  getTemplates: async (templateName?: string) => {
    const basePath = getBasePath();
    const params = templateName ? `?template_name=${templateName}` : "";
    return getAPIResponse(basePath, `/workflow-templates${params}`, null, "GET");
  },

  createTemplate: async (data: Record<string, any>) => {
    const basePath = getBasePath();
    return getAPIResponse(
      basePath,
      "/workflow-templates",
      null,
      "POST",
      JSON.stringify(data)
    );
  },

  updateTemplate: async (id: number, data: Record<string, any>) => {
    const basePath = getBasePath();
    return getAPIResponse(
      basePath,
      `/workflow-templates/${id}`,
      null,
      "PUT",
      JSON.stringify(data)
    );
  },

  deleteTemplate: async (id: number) => {
    const basePath = getBasePath();
    return getAPIResponse(basePath, `/workflow-templates/${id}`, null, "DELETE");
  },
};

// Color Master Service (with TCX, HEX, RGB)
export const colorMasterService = {
  getAll: async (buyerId?: number) => {
    const basePath = getBasePath();
    const query = buyerId ? `?buyer_id=${buyerId}` : '';
    return getAPIResponse(basePath, `/color-master/colors${query}`, null, "GET");
  },

  getById: async (id: number) => {
    const basePath = getBasePath();
    return getAPIResponse(basePath, `/color-master/colors/${id}`, null, "GET");
  },

  create: async (data: any) => {
    const basePath = getBasePath();
    return getAPIResponse(basePath, `/color-master/colors`, null, "POST", JSON.stringify(data));
  },

  update: async (id: number, data: any) => {
    const basePath = getBasePath();
    return getAPIResponse(basePath, `/color-master/colors/${id}`, null, "PUT", JSON.stringify(data));
  },

  delete: async (id: number) => {
    const basePath = getBasePath();
    return getAPIResponse(basePath, `/color-master/colors/${id}`, null, "DELETE");
  },
};

// Size Chart Service
export const sizeChartService = {
  getProductTypes: async () => {
    const basePath = getBasePath();
    return getAPIResponse(basePath, `/size-charts/product-types`, null, "GET");
  },

  getProfiles: async (buyerId?: number) => {
    const basePath = getBasePath();
    const query = buyerId ? `?buyer_id=${buyerId}` : '';
    return getAPIResponse(basePath, `/size-charts/profiles${query}`, null, "GET");
  },

  getAll: async (profileId?: number, productTypeId?: number) => {
    const basePath = getBasePath();
    let query = '?';
    if (profileId) query += `profile_id=${profileId}&`;
    if (productTypeId) query += `product_type_id=${productTypeId}&`;
    query = query.slice(0, -1); // Remove trailing & or ?
    return getAPIResponse(basePath, `/size-charts${query}`, null, "GET");
  },

  create: async (data: any) => {
    const basePath = getBasePath();
    return getAPIResponse(basePath, `/size-charts`, null, "POST", JSON.stringify(data));
  },

  update: async (id: number, data: any) => {
    const basePath = getBasePath();
    return getAPIResponse(basePath, `/size-charts/${id}`, null, "PUT", JSON.stringify(data));
  },

  delete: async (id: number) => {
    const basePath = getBasePath();
    return getAPIResponse(basePath, `/size-charts/${id}`, null, "DELETE");
  },
};