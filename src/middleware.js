import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((request) => {
    const { nextUrl, auth: session } = request;
    const pathname = nextUrl.pathname;

    // /admin/login — zaten giriş yapmışsa yönlendir
    if (pathname === "/admin/login") {
        if (session?.user) {
            if (session.user.role === "SUPER_ADMIN") {
                return NextResponse.redirect(new URL("/admin", request.url));
            }
            if (session.user.role === "DOCTOR") {
                return NextResponse.redirect(new URL("/admin/doktor", request.url));
            }
        }
        return NextResponse.next();
    }

    // /admin/* rotaları koruma
    if (pathname.startsWith("/admin")) {
        // Giriş yapılmamış
        if (!session?.user) {
            return NextResponse.redirect(new URL("/admin/login", request.url));
        }

        const role = session.user.role;

        // /admin/doktor/* — sadece doktorlar
        if (pathname.startsWith("/admin/doktor")) {
            if (role !== "DOCTOR") {
                return NextResponse.redirect(new URL("/admin", request.url));
            }
            return NextResponse.next();
        }

        // /admin (super admin alanı) — sadece super admin
        if (role !== "SUPER_ADMIN") {
            return NextResponse.redirect(new URL("/admin/doktor", request.url));
        }

        return NextResponse.next();
    }

    return NextResponse.next();
});

export const config = {
    matcher: ["/admin/:path*"],
};
