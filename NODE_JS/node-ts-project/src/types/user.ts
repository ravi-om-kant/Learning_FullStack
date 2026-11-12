export type User = {
    id: string;
    email: string;
    role: string;
    created_at: Date;
}

export type DBUser = {
    id: string;
    email: string;
    role: string;
    created_at: Date;
}

export type DBUserWithPassword = DBUser & {
    password_hash: string | null;
}

export type TokenPayload = {
    userId: string;
    email: string;
    role: string;
    googleId?: string;
}