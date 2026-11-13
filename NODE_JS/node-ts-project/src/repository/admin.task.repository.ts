import { pool } from "../libs/db";
import { logger } from "../libs/logger";
import { Task } from "../types/task";

type TaskRow = Task;
type AdminTaskListFilter = {
    search?:string;
    status?:string;
}
export async function findAllTasks(filters:AdminTaskListFilter):Promise<Task[]>{
    
    const conditions: string[] = [];
    const values: string[] = [];

    let paramIndex = 1;

    if(filters.search){
        conditions.push(`title ILIKE $${paramIndex}`);
        values.push(`%${filters.search}%`);
        paramIndex++;
    }

    if(filters.status){
        conditions.push(`status = $${paramIndex}`);
        values.push(filters.status);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : ""
    console.log(whereClause, conditions, values)
    // const result = await pool.query<TaskRow>(
    //     `select * from support_tasks
    //     where title ilike %$1% or status = $2`,[filters.search, filters.status]
    // )
    const result = await pool.query<TaskRow>(
        `
        select * from support_tasks
        ${whereClause}
        order by created_at desc
        `, values
    )
    //  console.log(whereClause, result)
    return result.rows;
}

export async function updateTaskStatus(taskId: string, status: string): Promise<Task | null>{
    const result = await pool.query<TaskRow>(`
            UPDATE support_tasks
            SET status = $2 
            WHERE id = $1
            RETURnING *
        `, [taskId, status]);
    
    return result.rows[0] ?? null;
}
