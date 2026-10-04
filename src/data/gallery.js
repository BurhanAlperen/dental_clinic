/**
 * Galeri verileri — Manuel yönetim
 * Instagram API entegrasyonu hazır olana kadar bu dosyadan içerik eklenir.
 * Her öğe bir kategori, başlık, açıklama ve opsiyonel Instagram/Google URL'si içerir.
 */

export const GALLERY_CATEGORIES = [
  { id: 'all', label: 'Tümü' },
  { id: 'klinik', label: 'Klinik Yaşamı' },
  { id: 'tedaviler', label: 'Tedaviler' },
  { id: 'hekimler', label: 'Hekimlerimiz' },
  { id: 'hasta', label: 'Hasta Deneyimi' },
  { id: 'bilgi', label: 'Bilgilendirme' },
];

export const GALLERY_ITEMS = [
  {
    id: 1,
    image: '/images/doctors/avatar-placeholder.svg',
    category: 'hekimler',
    title: 'Dt. Yakup Aşar',
    description: 'Hasta odaklı yaklaşımı ve deneyimiyle kliniğimizde hizmet vermektedir.',
    instagramUrl: 'https://www.instagram.com/turhaldisklinigi/',
  },
  {
    id: 2,
    image: '/images/doctors/mustafa-tarik-arslan.png',
    category: 'hekimler',
    title: 'Uzm. Dt. Mustafa Tarık Arslan',
    description: 'Uzman hekim kadromuz her zaman yanınızda.',
    instagramUrl: 'https://www.instagram.com/turhaldisklinigi/',
  },
  {
    id: 3,
    image: '/images/doctors/ceren-ozkalay.png',
    category: 'hekimler',
    title: 'Dt. Ceren Özkalay',
    description: 'Güler yüzlü ve profesyonel yaklaşımla kaliteli hizmet.',
    instagramUrl: 'https://www.instagram.com/turhaldisklinigi/',
  },
  {
    id: 4,
    image: '/images/hero/clinic.png',
    category: 'klinik',
    title: 'Modern Tedavi Odamız',
    description: 'Son teknoloji cihazlarımız ve steril ortamımızla güvenli tedavi deneyimi sunuyoruz.',
    instagramUrl: 'https://www.instagram.com/turhaldisklinigi/',
  },
  {
    id: 5,
    image: '/images/hero/clinic.png',
    category: 'klinik',
    title: 'Steril ve Konforlu Ortam',
    description: 'Kliniğimizde hijyen ve hasta konforu en üst düzeyde tutulmaktadır.',
    instagramUrl: 'https://www.instagram.com/turhaldisklinigi/',
  },
  {
    id: 6,
    image: '/images/hero/clinic.png',
    category: 'tedaviler',
    title: 'İmplant Tedavisi',
    description: 'Eksik dişleriniz için kalıcı ve doğal görünümlü implant çözümleri.',
    instagramUrl: 'https://www.instagram.com/turhaldisklinigi/',
  },
  {
    id: 7,
    image: '/images/hero/clinic.png',
    category: 'bilgi',
    title: 'Diş Sağlığı İpuçları',
    description: 'Ağız ve diş sağlığınızı korumak için uzman önerileri.',
    instagramUrl: 'https://www.instagram.com/turhaldisklinigi/',
  },
  {
    id: 8,
    image: '/images/gallery/review-1.svg',
    category: 'hasta',
    title: 'Ahmet Y. — 5 Yıldız Değerlendirme',
    description: '“Harika bir klinik! Mustafa Bey çok ilgili ve başarılı bir hekim. Tedavimden çok memnun kaldım. Kesinlikle tavsiye ederim.”',
    googleUrl: 'https://www.google.com/maps/place/%C3%96zel+Turhal+A%C4%9F%C4%B1z+ve+Di%C5%9F+Sa%C4%9Fl%C4%B1%C4%9F%C4%B1+Poliklinigi/@40.3864065,36.087801,19.16z/data=!4m6!3m5!1s0x407ded9665c9cefb:0xbadfd9be4dfcd36!8m2!3d40.3863543!4d36.0882364!16s%2Fg%2F11rctz_d1w',
  },
  {
    id: 9,
    image: '/images/gallery/review-2.svg',
    category: 'hasta',
    title: 'Elif K. — 5 Yıldız Değerlendirme',
    description: '“Ceren Hanım çok güler yüzlü ve profesyonel. Diş tedavimden hiç korkmadım. Klinik son derece temiz, modern ve çok ilgili bir ekip var.”',
    googleUrl: 'https://www.google.com/maps/place/%C3%96zel+Turhal+A%C4%9F%C4%B1z+ve+Di%C5%9F+Sa%C4%9Fl%C4%B1%C4%9F%C4%B1+Poliklinigi/@40.3864065,36.087801,19.16z/data=!4m6!3m5!1s0x407ded9665c9cefb:0xbadfd9be4dfcd36!8m2!3d40.3863543!4d36.0882364!16s%2Fg%2F11rctz_d1w',
  },
  {
    id: 10,
    image: '/images/gallery/review-3.svg',
    category: 'hasta',
    title: 'Mehmet A. — 5 Yıldız Değerlendirme',
    description: '“İmplant tedavimi burada yaptırdım. Sonuç gerçekten mükemmel oldu. Tüm ekibe güler yüzleri ve ilgileri için teşekkür ederim.”',
    googleUrl: 'https://www.google.com/maps/place/%C3%96zel+Turhal+A%C4%9F%C4%B1z+ve+Di%C5%9F+Sa%C4%9Fl%C4%B1%C4%9F%C4%B1+Poliklinigi/@40.3864065,36.087801,19.16z/data=!4m6!3m5!1s0x407ded9665c9cefb:0xbadfd9be4dfcd36!8m2!3d40.3863543!4d36.0882364!16s%2Fg%2F11rctz_d1w',
  },
];
