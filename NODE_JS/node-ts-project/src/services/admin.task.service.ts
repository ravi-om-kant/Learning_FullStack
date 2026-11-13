import { AppError } from "../errors/AppErrors";
import { logger } from "../libs/logger";
import { findAllTasks } from "../repository/admin.task.repository";
import { Task } from "../types/task";


type AdminTaskQuery = {
    search?: string;
    status?: string;
};

type AdminTaskListResponse = {
    tasks: Task[];
}

type TaskStatus = (typeof TASK_STATUSES)[number];

const TASK_STATUSES = ["OPEN", "IN_PROGRESS", "CLOSED"] as const;

function isTaskStatus(value: string): value is TaskStatus {
    return TASK_STATUSES.includes(value as TaskStatus);
}

export async function getAdminTask(query: AdminTaskQuery): Promise<AdminTaskListResponse> {
    const search = query.search?.trim() || undefined;
    const status = query.status?.trim() || undefined;

    if (status && !isTaskStatus(status)) {
        throw new AppError(400, `Status must be among one of this ${TASK_STATUSES.forEach(T => `${T}`)}`);
    }
    console.log("------------------------", search)
    const tasks = await findAllTasks({
        search, status
    })
    return { tasks };
}