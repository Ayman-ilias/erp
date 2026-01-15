import { NextRequest, NextResponse } from 'next/server';
import { API_CONFIG } from '@/lib/config';

async function proxyRequest(request: NextRequest, path: string[]) {
  const url = new URL(request.url);
  const targetPath = `/api/v1/${path.join('/')}${url.search}`;
  
  // Get backend URL - prioritize environment variable, then config, then Docker default
  const backendUrl = process.env.BACKEND_URL || 
                     process.env.API_URL || 
                     API_CONFIG.BACKEND_URL || 
                     'http://backend:8000';
  
  const targetUrl = `${backendUrl}${targetPath}`;

  // Log for debugging (only in development or for specific paths)
  if (process.env.NODE_ENV !== 'production' || path[0] === 'static' || path[0] === 'buyers' || path[0] === 'suppliers') {
    console.log('[API Proxy] Request:', request.method, targetUrl);
    console.log('[API Proxy] BACKEND_URL env:', process.env.BACKEND_URL || 'not set');
  }

  try {
    // Get headers from the incoming request
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      // Skip host header and other headers that shouldn't be forwarded
      if (!['host', 'connection', 'content-length'].includes(key.toLowerCase())) {
        headers[key] = value;
      }
    });

    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT_MS);

    const fetchOptions: RequestInit = {
      method: request.method,
      headers,
      signal: controller.signal,
    };

    // Include body for non-GET requests
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      const body = await request.text();
      if (body) {
        fetchOptions.body = body;
      }
    }

    try {
      const response = await fetch(targetUrl, fetchOptions);
      clearTimeout(timeoutId);

      // Get content type to determine if it's binary (image, file, etc.)
      const contentType = response.headers.get('content-type') || '';
      const isBinary = contentType.startsWith('image/') || 
                       contentType.startsWith('application/octet-stream') ||
                       contentType.startsWith('application/pdf') ||
                       contentType.includes('video/') ||
                       contentType.includes('audio/');

      // Create response headers
      const responseHeaders = new Headers();
      response.headers.forEach((value, key) => {
        // Skip headers that Next.js will handle
        if (!['content-encoding', 'transfer-encoding', 'connection'].includes(key.toLowerCase())) {
          responseHeaders.set(key, value);
        }
      });

      // Handle binary vs text content differently
      if (isBinary) {
        // For binary content (images, files), use arrayBuffer
        const arrayBuffer = await response.arrayBuffer();
        if (path[0] === 'static') {
          console.log('[API Proxy] Serving binary file, size:', arrayBuffer.byteLength, 'Content-Type:', contentType);
        }
        
        // Ensure proper headers for binary content
        if (contentType) {
          responseHeaders.set('Content-Type', contentType);
        }
        responseHeaders.set('Content-Length', arrayBuffer.byteLength.toString());
        responseHeaders.set('Cache-Control', 'public, max-age=31536000, immutable');
        
        return new NextResponse(arrayBuffer, {
          status: response.status,
          statusText: response.statusText,
          headers: responseHeaders,
        });
      } else {
        // For text content (JSON, HTML, etc.), use text
        const text = await response.text();
        return new NextResponse(text, {
          status: response.status,
          statusText: response.statusText,
          headers: responseHeaders,
        });
      }
    } catch (fetchError) {
      clearTimeout(timeoutId);

      // Check if it's an abort error (timeout)
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        console.error('[API Proxy] Request timeout:', targetUrl);
        return NextResponse.json(
          { detail: 'Request timeout - operation may have completed' },
          { status: 504 } // Gateway Timeout
        );
      }

      throw fetchError; // Re-throw for outer catch block
    }
  } catch (error) {
    console.error('[API Proxy] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Backend service unavailable';
    return NextResponse.json(
      { detail: errorMessage },
      { status: 503 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path);
}
