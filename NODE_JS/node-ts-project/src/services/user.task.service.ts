import { AppError } from "../errors/AppErrors";
import { createTask, getTaskByUserId } from "../repository/user.task.repository";
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