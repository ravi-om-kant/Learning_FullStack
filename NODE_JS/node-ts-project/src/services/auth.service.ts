import { AppError } from "../errors/AppErrors";
import { signAccessToken } from "../libs/jwt";
import { createUser, findUserByEmail, findUserByEmailWithPassword } from "../repository/user.repository";
import bcrypt from 'bcryptjs'

export async function registerUser(email: string, password: string): Promise<void> {
    if (!email || !password) {
        throw new AppError(400, "Email and Password is required!")
    }

    if (password.length < 6) {
        throw new AppError(400, "Password mush be at least 6 character")
    }

    const normalizeEmail = email.toLowerCase().trim();

    const existingEmail = await findUserByEmail(normalizeEmail);

    if (existingEmail) {
        throw new AppError(408, "Email already exist!");
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await createUser(normalizeEmail, passwordHash);

}


export async function loginUser(email: string, password: string): Promise<{ accessToken: string }> {
    if (!email || !password) {
        throw new AppError(400, "Email and Password is required!")
    }

    const normalizeEmail = email.toLowerCase().trim();
    const user = await findUserByEmailWithPassword(normalizeEmail);
    if (!user?.password_hash) {
        throw new AppError(401, "Invalid email or password!!");
    }

    const passwordValid = await bcrypt.compare(password, user?.password_hash);
    if (!passwordValid) {
        throw new AppError(401, "Invalid email or password!!");
    }

    const accessToken = signAccessToken({
        userId: user?.id,
        email: user.email,
        role: user.role
    });
    return { accessToken };
}