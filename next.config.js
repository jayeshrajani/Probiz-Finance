// HTTPS-only headers are baked in when built on Vercel (or with FORCE_HTTPS=1 at build time).
// Locally the site runs on plain http, where upgrade-insecure-requests would break every asset request.
const httpsOnly = Boolean(process.env.VERCEL) || process.env.FORCE_HTTPS === '1';
// next dev serves one manifest script as JSON, which nosniff would block.
const isDev = process.env.NODE_ENV !== 'production';

const securityHeaders = [
  ...(isDev ? [] : [{ key: 'X-Content-Type-Options', value: 'nosniff' }]),
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  ...(httpsOnly
    ? [
        { key: 'Strict-Transport-Security', value: 'max-age=31536000' },
        { key: 'Content-Security-Policy', value: 'upgrade-insecure-requests' },
      ]
    : []),
];

module.exports = {
  turbopack: { root: __dirname },
  reactStrictMode: true,
  serverExternalPackages: ['@electric-sql/pglite', 'postgres'],
  images: {
    loader: 'akamai',
    path: '',
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};
