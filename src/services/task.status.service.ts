import { PrismaClient, TaskStatus, User } from "@prisma/client";
import { RedisClient } from "../config";

export class TaskStatusService {
    private prismaClient: PrismaClient;

    constructor(prismaClient: PrismaClient, redisClient: RedisClient) {
        this.prismaClient = prismaClient;
    }

    public async getTaskStatusById(id: string): Promise<any> {
        const taskStatus = await this.prismaClient.taskStatus.findUnique({
            where: {
                id
            },
        });
        return taskStatus;
    }

    public async createTaskStatus(data: any): Promise<TaskStatus> {
        data = await this.formatData(data);

        const taskStatus = await this.prismaClient.taskStatus.create({
            data,
        });
        return taskStatus;
    }

    public async updateTaskStatus(id: string, data: TaskStatus): Promise<TaskStatus> {
        data = await this.formatData(data);

        const taskStatus = await this.prismaClient.taskStatus.update({
            where: {
                id
            },
            data,
        });
        return taskStatus;
    }

    public async deleteTaskStatus(id: string): Promise<TaskStatus> {
        const taskStatus = await this.prismaClient.taskStatus.delete({
            where: {
                id
            },
        });
        return taskStatus;
    }

    public async getTaskStatuss(): Promise<TaskStatus[]> {
        const taskstatuss = await this.prismaClient.taskStatus.findMany();
        return taskstatuss;
    }

    private async formatData(data: any): Promise<any> {
        delete data.task;
        delete data.asigneTo;

        if (data.mentions) {
            data.mentions = {
                connect: data.mentions.map(({ id }: { id: string }) => ({ id }))
            }
        }

        if (data.answers) {
            data.answers = {
                connect: data.answers.map(({ id }: { id: string }) => ({ id }))
            }
        }

        return data;
    }
}
