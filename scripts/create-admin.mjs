import readline from "node:readline/promises";
import { stdin, stdout } from "node:process";
import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma.js";

const rl = readline.createInterface({ input: stdin, output: stdout });

async function main() {
    const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();

    if (!email) {
        throw new Error("ADMIN_EMAIL ortam değişkeni tanımlanmamış.");
    }

    const existingUser = await prisma.user.findUnique({
        where: { email },
    });

    if (existingUser) {
        throw new Error("Bu e-posta adresi zaten kayıtlı. Yeni hesap oluşturulmadı.");
    }

    const password = await rl.question("Super Admin parolası: ");

    if (password.length < 12) {
        throw new Error("Parola en az 12 karakter olmalı.");
    }

    const confirmation = await rl.question("Parolayı tekrar gir: ");

    if (password !== confirmation) {
        throw new Error("Parolalar eşleşmiyor.");
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
        data: {
            name: "Super Admin",
            email,
            passwordHash,
            role: "SUPER_ADMIN",
            isActive: true,
        },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
        },
    });

    console.log("\nSuper Admin hesabı oluşturuldu:");
    console.table(user);
}

main()
    .catch((error) => {
        console.error("Hesap oluşturulamadı:", error.message);
        process.exitCode = 1;
    })
    .finally(async () => {
        rl.close();
        await prisma.$disconnect();
    });