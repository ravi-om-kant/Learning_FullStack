import { pool } from "../libs/db";
import { Task } from "../types/task";

type TaskRow = Task;

export async function createTask(
    userId: string,
    title: string
): Promise<Task> {
    const result = await pool.query<TaskRow>(
        `insert 
            into support_tasks (title, user_id) 
            values ($2, $1)
        returning id, title, status, user_id, created_at, updated_at`, [userId, title]
    );
    return result.rows[0];
}

export async function getTaskByUserId(userId: string):Promise<Task[]>{
    const result = await pool.query<TaskRow>(
        `select * from support_tasks where user_id = $1
        order by created_at desc;`, [userId]
    )
    return result.rows;
}