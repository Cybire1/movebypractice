import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack configuration for WASM support
  turbopack: {
    resolveExtensions: [
      '.tsx',
      '.ts',
      '.jsx',
      '.js',
      '.mjs',
      '.json',
      '.wasm',
    ],
  },

  // Enable WASM support
  experimental: {
    // Disable package optimization for WASM packages
    optimizePackageImports: [],
  },

  // Add headers for WASM support (required for SharedArrayBuffer)
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
