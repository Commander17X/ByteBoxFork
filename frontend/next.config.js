/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static export (disabled for development with API routes)
  // output: 'export',
  trailingSlash: true,
  
  // API proxy to orchestrator (disabled for static export)
  // async rewrites() {
  //   return [
  //     {
  //       source: '/api/:path*',
  //       destination: 'http://5.231.82.135:3001/api/:path*',
  //     },
  //   ]
  // },

  // Performance optimizations
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Suppress hydration warnings in development for browser extension interference
  reactStrictMode: true,
  onDemandEntries: {
    // period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 2,
  },

  // Bundle optimizations
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },

  // Image optimization (disabled for static export)
  images: {
    unoptimized: true,
  },

  // Faster builds
  typescript: {
    ignoreBuildErrors: false,
  },

  // Reduce bundle size
  webpack: (config, { dev, isServer }) => {
    // Optimize bundle splitting
    if (!dev && !isServer) {
      config.optimization.splitChunks.chunks = 'all'
      config.optimization.splitChunks.cacheGroups = {
        ...config.optimization.splitChunks.cacheGroups,
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: 10,
        },
        framer: {
          test: /[\\/]node_modules[\\/]framer-motion[\\/]/,
          name: 'framer-motion',
          chunks: 'all',
          priority: 20,
        },
      }
    }

    return config
  },
}

module.exports = nextConfig
