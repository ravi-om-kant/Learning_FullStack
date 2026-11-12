import { pool } from "../libs/db";
import { DBUser, DBUserWithPassword, User } from "../types/user";


export async function findUserByEmail(email: string): Promise<User>{

    const result = await pool.query<DBUser>(
        `Select id, email, role, created_at FROM
        users where email = $1`,[email]
    )
    console.log(result, "========================================");
    return result.rows[0] ?? null;
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