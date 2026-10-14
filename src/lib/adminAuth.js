/**
 * Ortak yardımcı fonksiyonlar — Admin API katmanı
 */
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export const ISTANBUL_TZ = "Europe/Istanbul";

/**
 * Session doğrulama + rol kontrolü
 * @param {"SUPER_ADMIN" | "DOCTOR" | "ANY"} requiredRole
 */
export async function requireAuth(requiredRole = "SUPER_ADMIN") {
    const session = await auth();

    if (!session?.user) {
        return {
            error: NextResponse.json(
                { success: false, error: "Oturum açmanız gerekiyor." },
                { status: 401 }
            ),
            session: null,
        };
    }

    if (requiredRole !== "ANY" && session.user.role !== requiredRole) {
        return {
            error: NextResponse.json(
                { success: false, error: "Bu işlem için yetkiniz yok." },
                { status: 403 }
            ),
            session: null,
        };
    }

    return { error: null, session };
}

/**
 * Randevu çakışması kontrolü
 * Aynı doktorun PENDING veya CONFIRMED randevularıyla çakışıyor mu?
 */
export async function checkConflict(prisma, { doctorId, startAt, endAt, excludeId }) {
    const where = {
        doctorId,
        status: { in: ["PENDING", "CONFIRMED"] },
        AND: [
            { startAt: { lt: endAt } },
            { endAt: { gt: startAt } },
        ],
    };

    if (excludeId) {
        where.NOT = { id: excludeId };
    }

    const conflict = await prisma.appointment.findFirst({ where });
    return conflict;
}

export const STATUS_LABELS = {
    PENDING: "Onay bekliyor",
    CONFIRMED: "Onaylandı",
    CANCELLED: "İptal edildi",
    COMPLETED: "Tamamlandı",
    NO_SHOW: "Gelmedi",
};

export const VALID_STATUSES = ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED", "NO_SHOW"];
