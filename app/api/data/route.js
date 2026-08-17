import { NextResponse } from 'next/server';
import { getAppState, saveAppState } from '../../../lib/db';
import { validateAdminRequest } from '../../../lib/auth';

// Ensure fresh data on every request
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const state = await getAppState();
    return NextResponse.json(state, {
      headers: {
        'Cache-Control': 'no-store, max-age=0'
      }
    });
  } catch (err) {
    console.error('[API /api/data GET error]', err);
    return NextResponse.json({ error: 'Failed to retrieve state' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const isAdmin = validateAdminRequest(request);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized: Admin authentication required to make changes' }, { status: 401 });
    }

    const payload = await request.json();
    const result = await saveAppState(payload);

    return NextResponse.json({
      success: true,
      savedCloud: result.savedCloud,
      updatedAt: result.state.updatedAt,
      message: result.savedCloud 
        ? 'Changes synced to Cloud Database and visible to all users worldwide' 
        : 'Changes updated in server memory (Configure Supabase or Upstash KV in Vercel for permanent storage across reboots)'
    });
  } catch (err) {
    console.error('[API /api/data POST error]', err);
    return NextResponse.json({ error: 'Failed to persist state' }, { status: 500 });
  }
}
