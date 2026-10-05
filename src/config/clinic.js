/**
 * Merkezi klinik yapılandırma dosyası
 * Tüm iletişim bilgileri, sosyal medya bağlantıları ve ayarlar burada yönetilir.
 */

export const CLINIC = {
  name: 'Özel Turhal Ağız ve Diş Sağlığı Polikliniği',
  shortName: 'Turhal Diş Kliniği',
  slogan: 'Sağlıklı gülüşler için',

  contact: {
    phone: '(0356) 275 75 06',
    phoneRaw: '+903562757506',
    whatsapp: '0501 363 75 06',
    whatsappRaw: '905013637506',
    email: process.env.NEXT_PUBLIC_CLINIC_EMAIL || null,
  },

  address: {
    full: 'Celal, Murat Alpat Cd., 60300 Turhal/Tokat',
    district: 'Turhal',
    city: 'Tokat',
    postalCode: '60300',
  },

  hours: {
    weekdays: '09:30 – 18:00',
    saturday: '09:30 – 18:00',
    sunday: 'Kapalı',
    label: 'Pazartesi – Cumartesi',
  },

  social: {
    instagram: 'https://www.instagram.com/turhaldisklinigi/',
    instagramHandle: '@turhaldisklinigi',
    googleMaps:
      'https://www.google.com/maps/place/%C3%96zel+Turhal+A%C4%9F%C4%B1z+ve+Di%C5%9F+Sa%C4%9Fl%C4%B1%C4%9F%C4%B1+Poliklinigi/@40.3864065,36.087801,19.16z/data=!4m6!3m5!1s0x407ded9665c9cefb:0xbadfd9be4dfcd36!8m2!3d40.3863543!4d36.0882364!16s%2Fg%2F11rctz_d1w?entry=ttu&g_ep=EgoyMDI2MDcyOS4wIKXMDSoASAFQAw%3D%3D',
  },

  maps: {
    placeId: 'ChIJ-86lZZbtfUcRNtP8TWn9r7o',
    lat: 40.3863543,
    lng: 36.0882364,
    embedUrl:
      'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d757.5!2d36.0882364!3d40.3863543!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x407ded9665c9cefb%3A0xbadfd9be4dfcd36!2s%C3%96zel%20Turhal%20A%C4%9F%C4%B1z%20ve%20Di%C5%9F%20Sa%C4%9Fl%C4%B1%C4%9F%C4%B1%20Poliklinigi!5e0!3m2!1str!2str!4v1700000000000!5m2!1str!2str',
  },

  doctors: [
    {
      id: 'mustafa-tarik-arslan',
      name: 'Uzm. Dt. Mustafa Tarık Arslan',
      title: 'Uzman Diş Hekimi',
      specialty: 'Ağız, Diş ve Çene Cerrahisi',
      bio: 'Uzm. Dt. Mustafa Tarık Arslan, modern tedavi yaklaşımları ve hasta odaklı hizmet anlayışıyla ağız ve diş sağlığı alanında uzmanlaşmıştır.',
      image: '/images/doctors/mustafa-tarik-arslan.png',
    },
    {
      id: 'ceren-ozkalay',
      name: 'Dt. Ceren Özkalay',
      title: 'Diş Hekimi',
      specialty: 'Genel Diş Hekimliği',
      bio: 'Dt. Ceren Özkalay, güler yüzlü yaklaşımı ve titiz çalışmasıyla hastalarına kaliteli diş hekimliği hizmeti sunmaktadır.',
      image: '/images/doctors/ceren-ozkalay.png',
    },
    {
      id: 'yakup-asar',
      name: 'Dt. Yakup Aşar',
      title: 'Diş Hekimi',
      specialty: 'Genel Diş Hekimliği',
      bio: 'Dt. Yakup Aşar, hasta odaklı yaklaşımı ve modern tedavi yöntemleriyle kliniğimizde hizmet vermektedir.',
      image: '/images/doctors/avatar-placeholder.svg',
      // Doktorsitesi live availability integration (server-side only — SSRF prevention)
      doktorsitesiUserId: 6988,
    },
  ],

  services: [
    {
      id: 'implant',
      title: 'İmplant Tedavisi',
      description:
        'Eksik dişleriniz için doğal görünümlü, uzun ömürlü implant çözümleri.',
      icon: 'Drill',
    },
    {
      id: 'ortodonti',
      title: 'Ortodonti',
      description:
        'Şeffaf plak ve braket sistemleriyle düzgün, sağlıklı bir gülüş.',
      icon: 'SmilePlus',
    },
    {
      id: 'estetik',
      title: 'Estetik Diş Hekimliği',
      description:
        'Diş beyazlatma, porselen lamine ve gülüş tasarımı ile hayalinizdeki gülüşe kavuşun.',
      icon: 'Sparkles',
    },
    {
      id: 'endodonti',
      title: 'Kanal Tedavisi',
      description:
        'Modern tekniklerle ağrısız ve güvenli kök kanal tedavisi.',
      icon: 'Shield',
    },
    {
      id: 'pedodonti',
      title: 'Çocuk Diş Hekimliği',
      description:
        'Çocuklarınızın diş sağlığını koruyacak özel bakım ve tedavi.',
      icon: 'Baby',
    },
    {
      id: 'protez',
      title: 'Protez Tedavisi',
      description:
        'Sabit ve hareketli protez seçenekleriyle doğal ve konforlu çözümler.',
      icon: 'CircleDot',
    },
  ],

  reviews: {
    rating: 4.9,
    totalReviews: 52,
    googleUrl:
      'https://www.google.com/maps/place/%C3%96zel+Turhal+A%C4%9F%C4%B1z+ve+Di%C5%9F+Sa%C4%9Fl%C4%B1%C4%9F%C4%B1+Poliklinigi/@40.3864065,36.087801,19.16z/data=!4m6!3m5!1s0x407ded9665c9cefb:0xbadfd9be4dfcd36!8m2!3d40.3863543!4d36.0882364!16s%2Fg%2F11rctz_d1w?entry=ttu&g_ep=EgoyMDI2MDcyOS4wIKXMDSoASAFQAw%3D%3D',
  },

  whatsappTemplate: (data) =>
    `Merhaba, Özel Turhal Ağız ve Diş Sağlığı Polikliniği için randevu talebi oluşturmak istiyorum.%0A%0AAd Soyad: ${data.name}%0ATelefon: ${data.phone}%0Aİşlem: ${data.treatment}%0ATercih edilen tarih: ${data.date}%0AMesaj: ${data.message}`,
};

export const SEO = {
  title: 'Özel Turhal Ağız ve Diş Sağlığı Polikliniği | Turhal, Tokat',
  description:
    'Turhal\'da uzman hekim kadrosu, modern tedavi yaklaşımı ve hasta odaklı hizmet anlayışıyla diş sağlığınız için yanınızdayız. İmplant, ortodonti, estetik diş hekimliği ve daha fazlası.',
  keywords:
    'diş kliniği, turhal, tokat, diş hekimi, implant, ortodonti, estetik diş hekimliği, ağız ve diş sağlığı, kanal tedavisi, diş beyazlatma',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://turhaldisklinigi.com',
  ogImage: '/images/og-image.jpg',
};
