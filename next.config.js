/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: process.env.NODE_ENV === 'production' ? 'out' : '.next',
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
