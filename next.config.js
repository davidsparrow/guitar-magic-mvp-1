/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure API routes are properly handled
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ];
  },
  
  // Environment variables for Stripe
  env: {
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  },
  
  // Enable webpack for better debugging
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('stripe');
    }
    return config;
  },
  
  // Configure body parsing for webhooks
  experimental: {
    serverComponentsExternalPackages: ['stripe'],
  },
};

module.exports = nextConfig;
