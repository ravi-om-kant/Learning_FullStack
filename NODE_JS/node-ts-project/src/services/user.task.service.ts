import { AppError } from "../errors/AppErrors";
import { createTask, deleteTask, fetchUserTaskByIdAndUserId, getTaskByUserId, updateTaskTitle } from "../repository/user.task.repository";
import { Task } from "../types/task";


function validateTitle(title: unknown): string{
    if(typeof title !== "string" || !title.trim()){
        throw new AppError(400, "Title is required");
    }

    const trimmedTitle = title.trim();
    if(trimmedTitle.length > 100){
        throw new AppError(400, 'Title must be 100 char or less');
    }
    return trimmedTitle;
}

export async function createUserTask(userId:string, title: unknown): Promise<Task>{
    const validTitle = validateTitle(title);

    return createTask(userId, validTitle);
}

export async function getUserTask(userId: string): Promise<Task[]>{
    return getTaskByUserId(userId);
}

export async function getUserTaskByIdAndUserId(taskId: string, userId: string): Promise<Task | null>{
    const task = await fetchUserTaskByIdAndUserId(taskId, userId);
    if(!task) throw new AppError(404, "Task not found");
    return task;
}

export async function updateUserTask(taskId:string, userId:string, title:string): Promise<Task>{
    const validTitle = validateTitle(title);
    await getUserTaskByIdAndUserId(taskId, userId);
    const task = updateTaskTitle(taskId, userId, validTitle);
    return task;
}

export async function deleteUserTask(taskId:string, userId: string): Promise<boolean>{
    const result = await deleteTask(taskId, userId);
    if(!result) throw new AppError(404, "No task content");
    return result;
}