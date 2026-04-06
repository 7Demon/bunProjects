import { db } from '../db/index.js';
import { users, sessions } from '../db/schema.js';
import { eq } from 'drizzle-orm';

export const loginUser = async (email, password) => {
    // 1. Cari user berdasarkan email
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (!user) {
        throw new Error("email atau password salah");
    }

    // 2. Verifikasi password
    const isPasswordValid = await Bun.password.verify(password, user.password);

    if (!isPasswordValid) {
        throw new Error("email atau password salah");
    }

    // 3. Generate token UUID
    const token = crypto.randomUUID();

    // 4. Simpan token ke tabel sessions
    await db.insert(sessions).values({
        token,
        userId: user.id
    });

    return token;
};

export const registerUser = async ({ name, email, password }) => {
    // 1. Cek apakah email sudah terdaftar
    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
    
    if (existingUser.length > 0) {
        return { error: 'email sudah terdaftar' };
    }

    // 2. Hash password
    const hashedPassword = await Bun.password.hash(password);

    // 3. Simpan user ke database
    await db.insert(users).values({
        name,
        email,
        password: hashedPassword
    });

    return { data: 'OK' };
};

export const getAllUsers = async () => {
    return await db.select().from(users);
};

export const getUserById = async (id) => {
    const result = await db.select().from(users).where(eq(users.id, parseInt(id)));
    return result[0] || null;
};
