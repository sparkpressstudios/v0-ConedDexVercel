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
    domains: ['api.dicebear.com', 'lh3.googleusercontent.com', 'avatars.githubusercontent.com'],
    unoptimized: true,
  },
  experimental: {
    serverActions: true,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't resolve 'fs' module on the client to prevent this error
      config.resolve.fallback = {
        fs: false,
        path: false,
        crypto: false,
        os: false,
      }
    }
    return config
  },
}

export default nextConfig
