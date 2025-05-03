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
    domains: ["localhost", "placeholder.com"],
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=3600, s-maxage=86400",
          },
        ],
      },
      {
        source: "/sw.js",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
        ],
      },
      {
        source: "/manifest.json",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
        ],
      },
    ]
  },
  webpack: (config, { isServer, dev }) => {
    // Safe require with try/catch to prevent build failures
    try {
      const path = require("path")

      // Add runtime detection for Pages vs App router
      config.plugins.push({
        apply: (compiler) => {
          compiler.hooks.normalModuleFactory.tap("RuntimeDetectionPlugin", (factory) => {
            factory.hooks.parser.for("javascript/auto").tap("RuntimeDetectionPlugin", (parser) => {
              parser.hooks.evaluateIdentifier.for("__PAGES_ROUTER__").tap("RuntimeDetectionPlugin", () => {
                // Check if we're building the Pages Router
                const isPagesRouter =
                  compiler.options.entry &&
                  (compiler.options.entry["pages/_app"] !== undefined ||
                    (typeof compiler.options.entry === "function" &&
                      compiler.options.context &&
                      compiler.options.context.includes("/pages")))

                return {
                  type: "Literal",
                  value: isPagesRouter,
                }
              })
            })
          })
        },
      })

      // Add resolve aliases for better imports
      config.resolve.alias = {
        ...config.resolve.alias,
        "@": path.resolve(__dirname),
      }
    } catch (error) {
      console.warn("Warning: Could not apply webpack customizations", error)
    }

    return config
  },
  env: {
    NEXT_PUBLIC_RUNTIME: "app",
  },
}

module.exports = nextConfig
