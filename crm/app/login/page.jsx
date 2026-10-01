import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

async function login(formData) {
  'use server';
  const pw = String(formData.get('pw') || '');
  const expected = process.env.AUTH_PASSWORD;
  if (expected && pw.length > 0 && pw === expected) {
    (await cookies()).set('crm_auth', process.env.AUTH_SECRET || '', {
      httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 90,
    });
    redirect('/');
  }
  redirect('/login?e=1');
}

export default async function Login({ searchParams }) {
  const sp = (await searchParams) || {};
  return (
    <div className="login-wrap">
      <form action={login} className="login-card">
        <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}>◆ CRM Anti Custos</div>
        <div className="microcaps" style={{ marginBottom: 18 }}>acesso privado</div>
        <input className="field" name="pw" type="password" placeholder="senha" style={{ width: '100%', marginBottom: 12 }} autoFocus />
        {sp.e && <div style={{ color: 'var(--bad)', fontSize: 12, marginBottom: 12 }}>senha incorreta</div>}
        <button className="btn" type="submit" style={{ width: '100%', justifyContent: 'center' }}>Entrar</button>
      </form>
    </div>
  );
}
