/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  
  // Add route handlers to dynamically rendered routes to prevent static rendering issues
  serverRuntimeConfig: {
    // Specify any server-side-only config here
    dynamicRoutes: [
      '/dashboard/**/*',  // Make all dashboard routes dynamic
      '/shops/map'        // Make the shops map page dynamic
    ],
  },
  
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ]
  },
  
  // Don't include source maps in production
  productionBrowserSourceMaps: false,
}

export default nextConfig
