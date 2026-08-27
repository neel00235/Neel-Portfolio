/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',           // static HTML for all 52 project pages + 4 static routes
  trailingSlash: true,        // emits /project/mumbai/index.html — works on any static host
  reactStrictMode: true,
  images: { unoptimized: true }, // required by output: export; we pre-optimise with sharp instead
  eslint: { ignoreDuringBuilds: false },
  typescript: { ignoreBuildErrors: false },
  experimental: { optimizePackageImports: ['lucide-react'] },
}

export default nextConfig
