import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma.js";
import { CLINIC } from "../src/config/clinic.js";

async function main() {
    console.log("🌱 Veritabanı klinisyen ve hizmet senkronizasyonu başlatılıyor...");

    // 1. Hizmetleri ekle / güncelle
    console.log("➡️ Hizmetler kontrol ediliyor...");
    for (const service of CLINIC.services) {
        await prisma.service.upsert({
            where: { name: service.title },
            update: {
                description: service.description,
                isActive: true,
            },
            create: {
                name: service.title,
                description: service.description,
                isActive: true,
            },
        });
    }
    console.log(`✅ ${CLINIC.services.length} hizmet senkronize edildi.`);

    // 2. Doktorları ve kullanıcı hesaplarını ekle / güncelle
    console.log("➡️ Doktor hesapları kontrol ediliyor...");
    const defaultPassword = process.env.DEFAULT_DOCTOR_PASSWORD || "Klinik2026!*";
    const passwordHash = await bcrypt.hash(defaultPassword, 12);

    const doctorConfigs = [
        {
            slug: "mustafa-tarik-arslan",
            name: "Mustafa Tarık Arslan",
            email: "mustafa.arslan@turhaldisklinigi.com",
            title: "Uzm. Dt.",
            specialtyTitle: "Uzman Diş Hekimi",
            specialty: "Ağız, Diş ve Çene Cerrahisi",
            photoUrl: "/images/doctors/mustafa-tarik-arslan.png",
            bio: "Uzm. Dt. Mustafa Tarık Arslan, modern tedavi yaklaşımları ve hasta odaklı hizmet anlayışıyla ağız ve diş sağlığı alanında uzmanlaşmıştır.",
        },
        {
            slug: "ceren-ozkalay",
            name: "Ceren Özkalay",
            email: "ceren.ozkalay@turhaldisklinigi.com",
            title: "Dt.",
            specialtyTitle: "Diş Hekimi",
            specialty: "Genel Diş Hekimliği",
            photoUrl: "/images/doctors/ceren-ozkalay.png",
            bio: "Dt. Ceren Özkalay, güler yüzlü yaklaşımı ve titiz çalışmasıyla hastalarına kaliteli diş hekimliği hizmeti sunmaktadır.",
        },
        {
            slug: "yakup-asar",
            name: "Yakup Aşar",
            email: "yakup.asar@turhaldisklinigi.com",
            title: "Dt.",
            specialtyTitle: "Diş Hekimi",
            specialty: "Genel Diş Hekimliği",
            photoUrl: "/images/doctors/avatar-placeholder.svg",
            bio: "Dt. Yakup Aşar, hasta odaklı yaklaşımı ve modern tedavi yöntemleriyle kliniğimizde hizmet vermektedir.",
        },
    ];

    for (const doc of doctorConfigs) {
        let user = await prisma.user.findUnique({
            where: { email: doc.email },
            include: { doctor: true },
        });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    name: doc.name,
                    email: doc.email,
                    passwordHash,
                    role: "DOCTOR",
                    isActive: true,
                    doctor: {
                        create: {
                            title: doc.title,
                            specialtyTitle: doc.specialtyTitle,
                            specialty: doc.specialty,
                            photoUrl: doc.photoUrl,
                            bio: doc.bio,
                            isActive: true,
                        },
                    },
                },
                include: { doctor: true },
            });
            console.log(`➕ Yeni doktor oluşturuldu: ${user.name} (${user.email})`);
        } else {
            // Kullanıcı varsa doktor profilini güncelle/oluştur
            if (!user.doctor) {
                await prisma.doctor.create({
                    data: {
                        userId: user.id,
                        title: doc.title,
                        specialtyTitle: doc.specialtyTitle,
                        specialty: doc.specialty,
                        photoUrl: doc.photoUrl,
                        bio: doc.bio,
                        isActive: true,
                    },
                });
            } else {
                await prisma.doctor.update({
                    where: { id: user.doctor.id },
                    data: {
                        title: doc.title,
                        specialtyTitle: doc.specialtyTitle,
                        specialty: doc.specialty,
                        photoUrl: doc.photoUrl,
                        bio: doc.bio,
                        isActive: true,
                    },
                });
            }
            console.log(`🔄 Doktor güncellendi: ${user.name}`);
        }

        // Doktor çalışma saatlerini tanımla (Pazartesi-Cumartesi: 09:30 - 18:00)
        // dayOfWeek: 1 = Pazartesi ... 6 = Cumartesi
        const doctorId = user.doctor?.id;
        if (doctorId) {
            const existingAvail = await prisma.doctorAvailability.count({ where: { doctorId } });
            if (existingAvail === 0) {
                const availData = [];
                for (let day = 1; day <= 6; day++) {
                    availData.push({
                        doctorId,
                        dayOfWeek: day,
                        startMinute: 9 * 60 + 30, // 09:30 -> 570
                        endMinute: 18 * 60,       // 18:00 -> 1080
                        isActive: true,
                    });
                }
                await prisma.doctorAvailability.createMany({ data: availData });
                console.log(`⏰ ${doc.name} için haftalık çalışma saatleri (Pzt-Cmt 09:30-18:00) eklendi.`);
            }
        }
    }

    console.log("\n🎉 Tüm klinik doktor ve hizmet verileri veritabanına başarıyla aktarıldı!");
}

main()
    .catch((e) => {
        console.error("Hata:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
