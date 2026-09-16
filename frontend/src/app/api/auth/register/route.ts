import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email = '', password = '', first_name = '', last_name = '' } = body;

    const cleanEmail = email.trim().toLowerCase();
    const cleanFirst = first_name.trim();
    const cleanLast = last_name.trim();

    if (!cleanEmail || !password || !cleanFirst) {
      return NextResponse.json({ message: 'All registration fields are required.' }, { status: 400 });
    }

    // Determine user role
    let role = 'Student';
    if (cleanEmail.includes('admin')) {
      role = 'Admin';
    } else if (cleanEmail.includes('instructor') || cleanEmail.includes('teacher')) {
      role = 'Instructor';
    }

    const fullName = `${cleanFirst} ${cleanLast}`.trim();
    const token = 'jwt_session_' + Buffer.from(`${cleanEmail}:${Date.now()}`).toString('base64');

    const response = NextResponse.json({
      message: 'Account created successfully.',
      access_token: token,
      token_type: 'Bearer',
      expires_in: 900,
      user: {
        id: 'usr-' + Date.now(),
        email: cleanEmail,
        first_name: cleanFirst,
        last_name: cleanLast,
        roles: [role],
      }
    }, { status: 201 });

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

    response.cookies.set('user_name', fullName, {
      path: '/',
      maxAge: 7 * 86400,
    });

    return response;
  } catch (err: unknown) {
    return NextResponse.json({ message: 'Registration failed.' }, { status: 500 });
  }
}
