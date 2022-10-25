/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
}

module.exports = {
  nextConfig,
  env: {
    NEXT_PUBLIC_MASTERDAO_CONTRACT_ADDRESS: process.env.NEXT_PUBLIC_MASTERDAO_CONTRACT_ADDRESS
  },
  typescript: {
    ignoreBuildErrors: true
  }
}