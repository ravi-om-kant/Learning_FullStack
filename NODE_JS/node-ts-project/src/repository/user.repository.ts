import { pool } from "../libs/db";
import { DBUser, DBUserWithPassword, User } from "../types/user";
import { redisClient } from "../redis/redis";

const USER_CACHE_TTL_SECONDS = 60 * 60; // 1 hour

function userCacheKey(email: string): string {
    return `user:email:${email}`;
}

export async function findUserByEmail(email: string): Promise<User>{
    const cacheKey = userCacheKey(email);

    const cached = await redisClient.get<User>(cacheKey);
    if (cached) {
        return cached;
    }

    const result = await pool.query<DBUser>(
        `Select id, email, role, created_at FROM
        users where email = $1`,[email]
    )

    const user = result.rows[0] ?? null;

    if (user) {
        await redisClient.set(cacheKey, user, { ex: USER_CACHE_TTL_SECONDS });
    }

    return user;
}

export async function createUser(email:string, pass:string): Promise<User>{

    const result = await pool.query<DBUser>(
        `insert into users (email, password_hash)
        values ($1, $2)
        returning id, email, role, created_at`,[email, pass]
    );
    return result.rows[0];
}

export async function findUserByEmailWithPassword(email:string): Promise<DBUserWithPassword | null>{
    const result = await pool.query<DBUserWithPassword>(
        `select * from users where email = $1`,[email]
    );
    return result.rows[0] ?? null;
}