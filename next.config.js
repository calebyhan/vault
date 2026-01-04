/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: process.env.NODE_ENV === 'production' ? 'out' : '.next',
  // Use relative paths for Electron
  assetPrefix: process.env.NODE_ENV === 'production' ? '.' : undefined,
  images: {
    unoptimized: true,
  },
  // Disable TypeScript errors during build for now
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
};

module.exports = nextConfig;
