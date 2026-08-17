import { NextResponse } from 'next/server';
import { verifyCredentials, generateAdminToken } from '../../../../lib/auth';

export async function POST(request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
    }

    if (verifyCredentials(username.trim(), password)) {
      const token = generateAdminToken();
      return NextResponse.json({ 
        success: true, 
        token, 
        user: username.trim(),
        message: 'Admin authenticated successfully'
      });
    }

    return NextResponse.json({ error: 'Invalid admin credentials' }, { status: 401 });
  } catch (err) {
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
