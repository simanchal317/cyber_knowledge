import { 
  initialServices, 
  initialFileTransfer, 
  initialPrivescLinux, 
  initialPrivescWindows, 
  initialCtfCategories, 
  initialMachines,
  initialCustomSections,
  initialNotebookTopics
} from './initial-data';

// In-memory serverless cache
let globalMemoryState = null;

export function getDefaultState() {
  return {
    version: 2,
    updatedAt: new Date().toISOString(),
    services: initialServices,
    fileTransfer: initialFileTransfer,
    privescLinux: initialPrivescLinux,
    privescWindows: initialPrivescWindows,
    ctfCategories: initialCtfCategories,
    machines: initialMachines,
    notebookTopics: initialNotebookTopics,
    customSections: initialCustomSections,
    deletedIds: [],
    customAdditions: {},
    deletedFtEntries: [],
    customFtEntries: {},
    deletedPrivescTopics: [],
    customPrivescTopics: { linux: [], windows: [] },
    permanentlyDeletedSections: []
  };
}

/**
 * Fetch the global application state from cloud storage (Upstash Redis / Supabase / KV / Memory)
 */
export async function getAppState() {
  // 1. Try Upstash Redis / Vercel KV (Fastest & easiest on Vercel)
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

  if (upstashUrl && upstashToken) {
    try {
      const res = await fetch(`${upstashUrl}/get/range_platform_state`, {
        headers: { Authorization: `Bearer ${upstashToken}` },
        cache: 'no-store'
      });
      if (res.ok) {
        const json = await res.json();
        if (json.result) {
          const parsed = typeof json.result === 'string' ? JSON.parse(json.result) : json.result;
          return { ...getDefaultState(), ...parsed };
        }
      }
    } catch (err) {
      console.error('[DB] Upstash KV fetch error:', err);
    }
  }

  // 2. Try Supabase REST API
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;

  if (supabaseUrl && supabaseKey) {
    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/range_config?id=eq.global&select=state`, {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`
        },
        cache: 'no-store'
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0 && data[0].state) {
          return { ...getDefaultState(), ...data[0].state };
        }
      }
    } catch (err) {
      console.error('[DB] Supabase fetch error:', err);
    }
  }

  // 3. Fallback to in-memory global state
  if (!globalMemoryState) {
    globalMemoryState = getDefaultState();
  }
  return globalMemoryState;
}

/**
 * Save state to cloud storage
 */
export async function saveAppState(newState) {
  const mergedState = {
    ...getDefaultState(),
    ...newState,
    updatedAt: new Date().toISOString()
  };

  // Update memory state
  globalMemoryState = mergedState;

  let savedCloud = false;

  // 1. Save to Upstash / Vercel KV
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

  if (upstashUrl && upstashToken) {
    try {
      const res = await fetch(`${upstashUrl}/set/range_platform_state`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${upstashToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(JSON.stringify(mergedState))
      });
      if (res.ok) savedCloud = true;
    } catch (err) {
      console.error('[DB] Upstash save error:', err);
    }
  }

  // 2. Save to Supabase
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;

  if (supabaseUrl && supabaseKey) {
    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/range_config`, {
        method: 'POST',
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          Prefer: 'resolution=merge-duplicates'
        },
        body: JSON.stringify({ id: 'global', state: mergedState, updated_at: new Date().toISOString() })
      });
      if (res.ok) savedCloud = true;
    } catch (err) {
      console.error('[DB] Supabase save error:', err);
    }
  }

  return { success: true, savedCloud, state: mergedState };
}
