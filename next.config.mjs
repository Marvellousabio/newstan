const isProd = process.env.NODE_ENV === 'production';

const csp = [
  "default-src 'self';",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https:;",
  "style-src 'self' 'unsafe-inline' https:;",
  "img-src 'self' blob: data: https:;",
  "font-src 'self' data: https:;",
  "connect-src 'self' https: wss:;",
  "frame-ancestors 'none';",
  "base-uri 'self';",
  "form-action 'self';",
].join(' ');

const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  // Only enable HSTS when serving over HTTPS with a valid cert
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self)' },
  { key: 'Content-Security-Policy', value: csp },
];

/** @typedef {import('next').NextConfig} NextConfig */
const withPWA = (await import('next-pwa')).default({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  fallbacks: {
    document: '/offline'
  },
});

/** @type {NextConfig} */
const baseConfig = {
  reactStrictMode: true,
  swcMinify: true,
  poweredByHeader: false,
  compress: true,
  output: 'standalone',
  eslint: { ignoreDuringBuilds: true },
  async headers() {
    if (!isProd) return [];
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};

const nextConfig = withPWA(baseConfig);
export default nextConfig;
