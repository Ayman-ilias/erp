import type { NextConfig } from "next";
import { API_CONFIG, IMAGE_CONFIG } from "./lib/config";

/**
 * Next.js Configuration for Southern Apparels ERP
 *
 * Features:
 * - Standalone output for Docker deployment
 * - API masking via URL rewrites
 * - CORS headers for API routes
 * - Image optimization configuration
 */

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "standalone",
  productionBrowserSourceMaps: false,

  // Experimental features for font optimization
  experimental: {
    optimizePackageImports: ['next/font/google'],
  },

  // Turbopack configuration (Next.js 16+ default bundler)
  turbopack: {
    // Turbopack handles Node.js module fallbacks automatically
    // No additional configuration needed for basic usage
  },

  // Image optimization configuration
  images: {
    remotePatterns: [
      ...IMAGE_CONFIG.ALLOWED_HOSTNAMES.map((hostname) => ({
        protocol: "http" as const,
        hostname,
      })),
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },

  // Webpack configuration (used for production builds)
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false, // Use Web Crypto API instead
      };
    }
    return config;
  },

  // URL rewrites for API masking and legacy URL support
  async rewrites() {
    // Get backend URL from environment or use default
    // Note: rewrites run at build time, so we need to use env var directly
    const apiUrl = process.env.BACKEND_URL || 
                   process.env.API_URL || 
                   API_CONFIG.BACKEND_URL || 
                   'http://backend:8000';

    return {
      // Process before checking filesystem
      beforeFiles: [
        // Legacy URL support
        { source: "/index", destination: "/" },
        { source: "/index.html", destination: "/" },
        { source: "/index.php", destination: "/" },
      ],

      // Process after checking filesystem
      afterFiles: [],

      // Fallback rewrites (when no file matches)
      // Note: API routes at app/api/v1/[...path]/route.ts handle this instead
      // Rewrites are kept for compatibility but API route handler is primary
      fallback: [
        // API Masking - proxies /api/v1/* to backend (except static files handled above)
        // This hides the actual backend URL from client-side code
        {
          source: "/api/v1/:path*",
          destination: `${apiUrl}/api/v1/:path*`,
        },
      ],
    };
  },

  // Security and CORS headers
  async headers() {
    return [
      {
        // API routes CORS configuration
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,POST,PUT,DELETE,PATCH,OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Authorization, Content-Type, X-Requested-With",
          },
        ],
      },
      {
        // API routes CORS configuration
        source: "/api/v1/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,POST,PUT,DELETE,PATCH,OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Authorization, Content-Type, X-Requested-With",
          },
        ],
      },
      {
        // Security headers for all routes
        source: "/:path*",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
