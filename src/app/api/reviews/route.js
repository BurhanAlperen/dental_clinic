import { NextResponse } from 'next/server';

/**
 * Google Places API Proxy
 * API anahtarı sunucu tarafında saklanır, istemciye asla gönderilmez.
 * Yanıtlar 1 saatlik önbelleğe alınır.
 */

export async function GET() {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID || 'ChIJ-86lZZbtfUcRNtP8TWn9r7o';

  // API anahtarı yoksa statik fallback verisi döndür
  if (!apiKey) {
    return NextResponse.json({
      rating: 4.9,
      totalReviews: 52,
      reviews: [],
      source: 'static',
      message: 'Google Places API anahtarı yapılandırılmamış. Statik veri döndürülüyor.',
    });
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=rating,user_ratings_total,reviews&language=tr&key=${apiKey}`;

    const response = await fetch(url, {
      next: { revalidate: 3600 }, // 1 saat önbellek
    });

    if (!response.ok) {
      throw new Error(`Google API yanıt hatası: ${response.status}`);
    }

    const data = await response.json();

    if (data.status !== 'OK') {
      throw new Error(`Google API durumu: ${data.status}`);
    }

    const result = data.result;
    return NextResponse.json({
      rating: result.rating || 4.9,
      totalReviews: result.user_ratings_total || 52,
      reviews: (result.reviews || []).map((r) => ({
        author: r.author_name,
        rating: r.rating,
        text: r.text,
        timeAgo: r.relative_time_description,
        profilePhoto: r.profile_photo_url,
      })),
      source: 'google',
    });
  } catch (error) {
    console.error('Google Places API hatası:', error);
    return NextResponse.json(
      {
        rating: 4.9,
        totalReviews: 52,
        reviews: [],
        source: 'fallback',
        message: 'API isteği başarısız oldu. Fallback verisi döndürülüyor.',
      },
      { status: 200 }
    );
  }
}
