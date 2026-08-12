import { redirect } from '@sveltejs/kit';

const USER = process.env.AUTH_USER || '4nt';
const PASS = process.env.AUTH_PASS || 'Jure006jur123#';

// Cookie value = base64(user:pass). Ako se poklopi s očekivanom, korisnik je logiran.
const TOKEN = Buffer.from(`${USER}:${PASS}`).toString('base64');

const PUBLIC_PATHS = ['/login', '/api/login', '/manifest.json', '/icon.svg', '/icon-192.png'];

export async function handle({ event, resolve }) {
  const { pathname } = event.url;
  const authed = event.cookies.get('auth') === TOKEN;

  const isPublic = PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'));

  if (!authed && !isPublic) {
    if (pathname.startsWith('/api/')) {
      return new Response('Unauthorized', { status: 401 });
    }
    throw redirect(303, '/login');
  }

  if (authed && pathname === '/login') {
    throw redirect(303, '/');
  }

  event.locals.authed = authed;
  return resolve(event);
}
