import { json } from '@sveltejs/kit';

const USER = process.env.AUTH_USER || '4nt';
const PASS = process.env.AUTH_PASS || 'Jure006jur123#';
const TOKEN = Buffer.from(`${USER}:${PASS}`).toString('base64');

export async function POST({ request, cookies }) {
  const { username, password } = await request.json();

  if (username !== USER || password !== PASS) {
    return json({ error: 'Pogrešno korisničko ime ili lozinka' }, { status: 401 });
  }

  cookies.set('auth', TOKEN, {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365 // 1 godina
  });

  return json({ ok: true });
}

export async function DELETE({ cookies }) {
  cookies.delete('auth', { path: '/' });
  return json({ ok: true });
}
