import type { NextConfig } from "next";


const nextConfig: NextConfig = {
  /* config options here */
  
  experimental: {
    optimizePackageImports: ['react-bootstrap'],
  },
  allowedDevOrigins: ['local-origin.dev', '*.local-origin.dev'],

};

export default nextConfig;
