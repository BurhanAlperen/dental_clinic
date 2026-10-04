import { NextResponse } from 'next/server';

/**
 * Instagram Graph API Proxy
 * API erişim anahtarı sunucu tarafında saklanır.
 * İleride Meta Developer Console'dan token alınarak aktif edilecek.
 */

export async function GET() {
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  const userId = process.env.INSTAGRAM_USER_ID;

  // Token yoksa boş yanıt döndür
  if (!accessToken || !userId) {
    return NextResponse.json({
      items: [],
      source: 'static',
      message: 'Instagram API yapılandırılmamış. Lütfen src/data/gallery.js dosyasından manuel içerik ekleyin.',
    });
  }

  try {
    const url = `https://graph.instagram.com/${userId}/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp&access_token=${accessToken}&limit=12`;

    const response = await fetch(url, {
      next: { revalidate: 3600 }, // 1 saat önbellek
    });

    if (!response.ok) {
      throw new Error(`Instagram API yanıt hatası: ${response.status}`);
    }

    const data = await response.json();

    const items = (data.data || []).map((item) => ({
      id: item.id,
      image: item.media_type === 'VIDEO' ? item.thumbnail_url : item.media_url,
      caption: item.caption || '',
      mediaType: item.media_type,
      permalink: item.permalink,
      timestamp: item.timestamp,
    }));

    return NextResponse.json({
      items,
      source: 'instagram',
    });
  } catch (error) {
    console.error('Instagram API hatası:', error);
    return NextResponse.json(
      {
        items: [],
        source: 'fallback',
        message: 'Instagram API isteği başarısız.',
      },
      { status: 200 }
    );
  }
}
