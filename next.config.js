const webpack = require('webpack')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: false,
  },
  // Configure webpack to handle the thread-stream test files issue
  webpack: (config, { isServer }) => {
    // Ignore test dependencies (tap, why-is-node-running) that are only used in test files
    // These are devDependencies of thread-stream and not needed in production
    // The contextRegExp ensures we only ignore these when imported from test file context
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^(tap|why-is-node-running)$/,
        contextRegExp: /thread-stream\/test/,
      }),
      // Also ignore test files themselves from thread-stream
      new webpack.IgnorePlugin({
        resourceRegExp: /\.(test|spec)\.(js|mjs)$/,
        contextRegExp: /thread-stream\/test/,
      })
    )

    // Fallback for missing optional test dependencies
    // Set to false to prevent webpack from trying to resolve them
    config.resolve.fallback = {
      ...config.resolve.fallback,
      'tap': false,
      'why-is-node-running': false,
    }

    return config
  },
  // Configure Turbopack (Next.js 16+ default bundler)
  // Empty config tells Next.js to use Turbopack but allows webpack config for compatibility
  turbopack: {},
  // Exclude server-only packages from client bundle
  // These packages should only run on the server side and use Node.js APIs
  // This prevents Next.js from trying to bundle them for the client
  serverExternalPackages: ['pino', 'thread-stream'],
}

module.exports = nextConfig
