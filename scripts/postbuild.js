import fs from 'fs';
import path from 'path';

const distDir = path.resolve(process.cwd(), 'dist');
const indexHtmlPath = path.join(distDir, 'index.html');

if (!fs.existsSync(indexHtmlPath)) {
  console.error('dist/index.html not found!');
  process.exit(1);
}

const indexContent = fs.readFileSync(indexHtmlPath, 'utf8');

// List of all SPA routes
const routes = [
  'mandi',
  'scan',
  'crops',
  'weather',
  'store',
  'tank-mix',
  'scouting',
  'soil',
  'orders',
  'expert',
  'alerts',
  'profile',
  'login',
  'signup',
  'forgot-password',
  'checkout',
  'privacy',
  'terms',
  'cookies',
  'refund'
];

for (const route of routes) {
  const routeDir = path.join(distDir, route);
  if (!fs.existsSync(routeDir)) {
    fs.mkdirSync(routeDir, { recursive: true });
  }
  fs.writeFileSync(path.join(routeDir, 'index.html'), indexContent);
}

// Also ensure .nojekyll and 404.html exist in dist
fs.writeFileSync(path.join(distDir, '.nojekyll'), '');
fs.writeFileSync(path.join(distDir, '404.html'), indexContent);

console.log(`✓ Generated static route entries for ${routes.length} SPA routes.`);
