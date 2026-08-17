import { NextResponse } from 'next/server';
import { validateAdminRequest } from '../../../../lib/auth';

export async function GET(request) {
  const isAdmin = validateAdminRequest(request);
  return NextResponse.json({ isAdmin });
}
