import { NextResponse } from 'next/server';
import { CLINIC } from '@/config/clinic';

/**
 * Doktorsitesi Live Availability Provider – Dt. Yakup Aşar
 *
 * Real API endpoint discovered from Doktorsitesi's frontend JS:
 *   GET https://api.doktorsitesi.com/public/user/{userId}/available?isOnlineConsultation=0
 *
 * Response format:
 *   { items: [{ date: "YYYY-MM-DD", times: [{ startTime, endTime, isblock }] }] }
 *   isblock: 0 = available, 1 = blocked/busy
 *
 * Security: The Doktorsitesi userId is read ONLY from server-side config (CLINIC),
 * never from any client-supplied input (SSRF prevention).
 *
 * Fail-safe: If Doktorsitesi is unreachable, we return HTTP 503 with a clear error.
 * We NEVER fall back to "all slots open" — that would cause double-booking.
 */

const CACHE_TTL_MS = 60 * 1000; // 60 seconds

// In-memory cache
let _cache = null;
let _cacheTimestamp = 0;

/**
 * Parse the Doktorsitesi availability response into our internal format.
 * Returns { scheduleByDate, allSlots } or throws on parse failure.
 *
 * scheduleByDate: { "YYYY-MM-DD": { available: ["HH:mm", ...], busy: ["HH:mm", ...] } }
 */
function parseAvailabilityResponse(json) {
  if (!json || !Array.isArray(json.items)) {
    throw new Error('Doktorsitesi response missing "items" array');
  }

  const scheduleByDate = {};
  const allSlotsSet = new Set();

  for (const dayItem of json.items) {
    const { date, times } = dayItem;
    if (!date || !Array.isArray(times)) {
      console.warn('[Doktorsitesi] Unexpected day item format:', dayItem);
      continue;
    }

    const available = [];
    const busy = [];

    for (const slot of times) {
      const time = slot.startTime;
      if (!time) continue;

      allSlotsSet.add(time);

      if (slot.isblock === 0) {
        available.push(time);
      } else {
        busy.push(time);
      }
    }

    scheduleByDate[date] = { available, busy };
  }

  return {
    scheduleByDate,
    allSlots: [...allSlotsSet].sort(),
  };
}

/**
 * Fetch fresh availability data from Doktorsitesi API.
 * userId is sourced ONLY from the server-side CLINIC config.
 */
async function fetchFromDoktorsitesi(userId) {
  const url = `https://api.doktorsitesi.com/public/user/${userId}/available?isOnlineConsultation=0`;

  const response = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      Accept: 'application/json',
      Referer: 'https://www.doktorsitesi.com/',
      Origin: 'https://www.doktorsitesi.com',
    },
    // Do not use Next.js cache — we manage our own in-memory TTL
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Doktorsitesi API returned HTTP ${response.status}`);
  }

  const json = await response.json();
  return parseAvailabilityResponse(json);
}

// GET: Return live availability data (with 60s in-memory cache)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const forceRefresh = searchParams.get('refresh') === 'true';
    const now = Date.now();

    // Resolve Yakup Aşar's Doktorsitesi userId from config (SSRF prevention)
    const yakupDoctor = CLINIC.doctors.find((d) => d.id === 'yakup-asar');
    const userId = yakupDoctor?.doktorsitesiUserId;

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          providerError: true,
          error:
            'Dt. Yakup Aşar için Doktorsitesi kullanıcı kimliği yapılandırılmamış.',
        },
        { status: 503 }
      );
    }

    // Serve from cache if fresh
    if (!forceRefresh && _cache && now - _cacheTimestamp < CACHE_TTL_MS) {
      return NextResponse.json({
        ..._cache,
        cached: true,
        cacheAgeSeconds: Math.floor((now - _cacheTimestamp) / 1000),
      });
    }

    // Fetch fresh data
    const { scheduleByDate, allSlots } = await fetchFromDoktorsitesi(userId);

    const payload = {
      success: true,
      doctor: 'Dt. Yakup Aşar',
      source: 'doktorsitesi.com',
      isLiveSynced: true,
      cacheTtlSeconds: CACHE_TTL_MS / 1000,
      allSlots,
      scheduleByDate,
      lastSyncAt: new Date().toISOString(),
      nextSyncAt: new Date(now + CACHE_TTL_MS).toISOString(),
      cached: false,
    };

    // Store in cache
    _cache = payload;
    _cacheTimestamp = now;

    return NextResponse.json(payload, {
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('[Doktorsitesi] Availability fetch error:', error.message);

    // FAIL-SAFE: Return 503 — never expose all slots as available
    return NextResponse.json(
      {
        success: false,
        providerError: true,
        error:
          'Randevu saatleri şu anda güncellenemiyor. Lütfen birkaç saniye sonra tekrar deneyin.',
        detail: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 503 }
    );
  }
}

// POST: No-op — booking is handled by /api/appointments.
// This endpoint is kept for backward compatibility but does nothing meaningful.
export async function POST() {
  return NextResponse.json({ success: true, message: 'Acknowledged.' });
}
