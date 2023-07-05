import { PrismaClient, Task, TaskAttachment } from "@prisma/client";
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
            include: {
                attachments: true,
                tags: true,
                assignedUsers: true,
                author: true,
                comments: true,
                subTasks: true,
                parentTask: true,
                team: true
            }
        });
        return task;
    }

    public async createTask(data: any): Promise<any> {

        if (data.attachments) {
            data.attachments = {
                connect: data.attachments.map(({ id }: { id: string }) => ({ id }))
            }
        }

        if (data.tags) {
            const existingTags = await this.prismaClient.tag.findMany({
                where: {
                    name: {
                        in: data.tags.map(({ name }: { name: string }) => name)
                    }
                }
            });

            const newTags = data.tags.filter(({ name }: { name: string }) => !existingTags.find((tag: any) => tag.name === name));

            data.tags = {
                connect: existingTags.map(({ id }: { id: string }) => ({ id })),
                create: newTags.map(({ name }: { name: string }) => ({ name })),
            }
        }

        if (data.assignedUsers) {
            data.assignedUsers = {
                connect: data.assignedUsers.map(({ id }: { id: string }) => ({ id }))
            }
        }

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

    public async getTaskAttachmentById(id: string): Promise<TaskAttachment | null> {
        const attachment = await this.prismaClient.taskAttachment.findUnique({
            where: {
                id,
            },
        });
        return attachment;
    }

    public async createTaskAttachment(data: TaskAttachment): Promise<TaskAttachment> {
        const attachment = await this.prismaClient.taskAttachment.create({
            data,
        });
        return attachment;
    }

    public async updateTaskAttachment(id: string, data: TaskAttachment): Promise<TaskAttachment | null> {
        const attachment = await this.prismaClient.taskAttachment.update({
            where: {
                id,
            },
            data,
        });
        return attachment;
    }

    public async deleteTaskAttachment(id: string): Promise<TaskAttachment | null> {
        const attachment = await this.prismaClient.taskAttachment.delete({
            where: {
                id,
            },
        });
        return attachment;
    }

    public async getTaskAttachments(taskId: string): Promise<TaskAttachment[]> {
        const attachments = await this.prismaClient.taskAttachment.findMany({
            where: {
                taskId,
            },
        });
        return attachments;
    }
}
