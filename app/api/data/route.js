import { NextResponse } from 'next/server';
import { validateAdminRequest } from '@/lib/db';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

// Path to your local database file
const filePath = path.join(process.cwd(), 'data', 'db.json');

// Helper to safely read data from local disk
function readLocalData() {
  if (!fs.existsSync(filePath)) {
    // Ensure data directory exists if missing
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const initialState = { topics: [], updatedAt: new Date().toISOString() };
    fs.writeFileSync(filePath, JSON.stringify(initialState, null, 2), 'utf8');
    return initialState;
  }
  const fileData = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(fileData);
}

// Helper to save data synchronously to local disk
function writeLocalData(data) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

// GET: Fetch state directly from local hard drive
export async function GET() {
  try {
    const state = readLocalData();
    return NextResponse.json(state, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (err) {
    console.error('[API /api/data GET error]', err);
    return NextResponse.json({ error: 'Failed to retrieve state' }, { status: 500 });
  }
}

// POST: Save new state directly to local hard drive
export async function POST(request) {
  try {
    const isAdmin = validateAdminRequest(request);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin authentication required to make changes' },
        { status: 401 }
      );
    }

    const payload = await request.json();
    payload.updatedAt = new Date().toISOString();

    // Persist immediately to laptop hard drive
    writeLocalData(payload);

    return NextResponse.json({
      success: true,
      savedLocal: true,
      updatedAt: payload.updatedAt,
      message: 'Changes written permanently to local disk storage.',
    });
  } catch (err) {
    console.error('[API /api/data POST error]', err);
    return NextResponse.json({ error: 'Failed to persist state to local disk' }, { status: 500 });
  }
}

// OPTIONS: Handle CORS preflight requests
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    }
  );
}
