import { PrismaClient, Task } from "@prisma/client";
import { RedisClient } from "../config";

export class TaskService {
    private prismaClient: PrismaClient;

    constructor(prismaClient: PrismaClient, redisClient: RedisClient) {
        this.prismaClient = prismaClient;
    }

    public async getTaskById(id: string): Promise<any> {
        const task = await this.prismaClient.task.findUnique({
            where: {
                id
            },
        });
        return task;
    }

    public async createTask(data: Task): Promise<any> {
        const task = await this.prismaClient.task.create({
            data,
        });
        return task;
    }

    public async updateTask(id: string, data: Task): Promise<any> {
        const task = await this.prismaClient.task.update({
            where: {
                id
            },
            data,
        });
        return task;
    }

    public async deleteTask(id: string): Promise<any> {
        const task = await this.prismaClient.task.delete({
            where: {
                id
            },
        });
        return task;
    }

    public async getTasks(): Promise<any> {
        const tasks = await this.prismaClient.task.findMany();
        return tasks;
    }
}
