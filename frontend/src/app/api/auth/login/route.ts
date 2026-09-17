import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email = '', password = '' } = body;

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      return NextResponse.json({ message: 'Email and password are required.' }, { status: 400 });
    }

    // Call real FastAPI backend
    const backendRes = await fetch(`${BACKEND_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail, password }),
    }).catch(() => null);

    if (backendRes && backendRes.ok) {
      const data = await backendRes.json();
      const token = data.access_token;
      const user = data.user || {};
      const roles = user.roles || [];
      const primaryRole = roles[0] || 'Student';
      const name = `${user.first_name || ''} ${user.last_name || ''}`.trim() || cleanEmail;

      const response = NextResponse.json(data);

      response.cookies.set('access_token', token, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 86400,
      });

      response.cookies.set('user_role', primaryRole, {
        path: '/',
        maxAge: 7 * 86400,
      });

      response.cookies.set('user_name', name, {
        path: '/',
        maxAge: 7 * 86400,
      });

      return response;
    }

    if (backendRes) {
      const errorData = await backendRes.json().catch(() => ({}));
      return NextResponse.json(
        { message: errorData.message || errorData.detail || 'Invalid email or password.' },
        { status: backendRes.status }
      );
    }

    return NextResponse.json({ message: 'Authentication server unavailable.' }, { status: 503 });
  } catch (err: unknown) {
    return NextResponse.json({ message: 'Authentication failed.' }, { status: 500 });
  }
}
