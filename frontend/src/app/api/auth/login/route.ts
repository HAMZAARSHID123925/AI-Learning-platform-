import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email = '', password = '' } = body;

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      return NextResponse.json({ message: 'Email and password are required.' }, { status: 400 });
    }

    // Determine user role and name from credentials
    let role = 'Student';
    let name = cleanEmail.split('@')[0] || 'Candidate';
    name = name.charAt(0).toUpperCase() + name.slice(1);

    if (cleanEmail.includes('admin')) {
      role = 'Admin';
      name = 'System Administrator';
    } else if (cleanEmail.includes('instructor') || cleanEmail.includes('teacher')) {
      role = 'Instructor';
      name = 'Lead Instructor';
    }

    const token = 'jwt_session_' + Buffer.from(`${cleanEmail}:${Date.now()}`).toString('base64');

    const response = NextResponse.json({
      access_token: token,
      token_type: 'Bearer',
      expires_in: 900,
      user: {
        id: 'usr-' + Date.now(),
        email: cleanEmail,
        first_name: name.split(' ')[0],
        last_name: name.split(' ')[1] || '',
        roles: [role],
      }
    });

    // Set secure cookie flags
    response.cookies.set('access_token', token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 86400,
    });

    response.cookies.set('user_role', role, {
      path: '/',
      maxAge: 7 * 86400,
    });

    response.cookies.set('user_name', name, {
      path: '/',
      maxAge: 7 * 86400,
    });

    return response;
  } catch (err: unknown) {
    return NextResponse.json({ message: 'Authentication failed.' }, { status: 500 });
  }
}
