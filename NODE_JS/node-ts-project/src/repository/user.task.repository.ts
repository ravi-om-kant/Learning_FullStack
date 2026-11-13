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

export async function getTaskByUserId(userId: string): Promise<Task[]> {
    const result = await pool.query<TaskRow>(
        `select * from support_tasks where user_id = $1
        order by created_at desc;`, [userId]
    )
    return result.rows;
}

export async function fetchUserTaskByIdAndUserId(taskId: string, userId: string): Promise<Task | null> {
    const result = await pool.query<TaskRow>(
        `select * from support_tasks where id = $1 and user_id = $2
        order by created_at desc;`, [taskId, userId]
    )
    return result.rows[0] ?? null;
}

export async function updateTaskTitle(taskId: string, userId: string, title: string): Promise<Task> {
    const result = await pool.query<TaskRow>(`
        UPDATE support_tasks 
        set title = $1, updated_at = now() 
        where user_id = $2 and id = $3
        RETURNING id, title, status, user_id, created_at, updated_at`,
        [title, userId, taskId]);
    return result.rows[0];
}

export async function deleteTask(taskId: string, userId: string): Promise<boolean> {

    const result = await pool.query<TaskRow>(
        `
        DELETE from support_tasks where user_id = $2 and id = $1
        `, [taskId, userId]
    );
    return (result.rowCount ?? 0) > 0;
}

