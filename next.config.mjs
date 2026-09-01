const SERVER = process.env.BUILD_TARGET === 'server'

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: SERVER ? undefined : 'export', // static HTML for export mode, server mode when BUILD_TARGET=server
  pageExtensions: SERVER
    ? ['server.ts', 'tsx', 'ts', 'jsx', 'js']
    : ['tsx', 'ts', 'jsx', 'js'],
  trailingSlash: true,        // emits /project/mumbai/index.html — works on any static host
  reactStrictMode: true,
  images: { unoptimized: true }, // required by output: export; we pre-optimise with sharp instead
  eslint: { ignoreDuringBuilds: false },
  typescript: { ignoreBuildErrors: false },
  experimental: { optimizePackageImports: ['lucide-react'] },
}

export default nextConfig

