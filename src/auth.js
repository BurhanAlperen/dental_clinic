import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
    session: {
        strategy: "jwt",
    },

    providers: [
        Credentials({
            credentials: {
                email: {
                    label: "E-posta",
                    type: "email",
                },
                password: {
                    label: "Parola",
                    type: "password",
                },
            },

            async authorize(credentials) {
                const email = String(credentials?.email ?? "")
                    .trim()
                    .toLowerCase();
                const password = String(credentials?.password ?? "");

                if (!email || !password) {
                    return null;
                }

                const user = await prisma.user.findUnique({
                    where: { email },
                    include: {
                        doctor: {
                            select: {
                                id: true,
                                isActive: true,
                            },
                        },
                    },
                });

                if (!user || !user.isActive) {
                    return null;
                }

                if (
                    user.role === "DOCTOR" &&
                    (!user.doctor || !user.doctor.isActive)
                ) {
                    return null;
                }

                const validPassword = await compare(
                    password,
                    user.passwordHash
                );

                if (!validPassword) {
                    return null;
                }

                return {
                    id: String(user.id),
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    doctorId: user.doctor?.id ?? null,
                };
            },
        }),
    ],

    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = user.role;
                token.doctorId = user.doctorId;
            }

            return token;
        },

        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.sub;
                session.user.role = token.role;
                session.user.doctorId = token.doctorId;
            }

            return session;
        },
    },

    pages: {
        signIn: "/admin/login",
    },
});