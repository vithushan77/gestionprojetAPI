import { PrismaClient, Task, TaskAttachment } from "@prisma/client";
import { RedisClient } from "../config";
import { de } from "@faker-js/faker";

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
                status: true,
                team: true
            }
        });
        return task;
    }

    public async createTask(data: any): Promise<any> {

        data = await this.formatData(data);

        const task = await this.prismaClient.task.create({
            data,
        });
        return task;
    }

    public async updateTask(id: string, data: any): Promise<any> {

        data = await this.formatData(data);

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
        const tasks = await this.prismaClient.task.findMany(
            {
                include: {
                    attachments: true,
                    tags: true,
                    assignedUsers: true,
                    status: true,
                    team: true
                }
            }
        );
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

    private async formatData(data: any): Promise<any> {


        if (data.attachments) {
            data.attachments = {
                connect: data.attachments.map(({ id }: { id: string }) => ({ id }))
            }
        }

        if (data.status) {

            if (!data.statusId) {
                let status = await this.prismaClient.taskStatus.findUnique({
                    where: {
                        name: typeof data.status === 'string' ? data.status : data.status.name
                    }
                });

                if (!status) {
                    status = await this.prismaClient.taskStatus.create({
                        data: typeof data.status === 'string' ? { name: data.status } : data.status
                    });
                }
                data.statusId = status.id;
            }

            delete data.status;
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

        if (data.comments) {
            data.comments = {
                create: data.comments.map(({ content, authorId }: { content: string, authorId: string }) => ({ content, authorId }))
            }
        }

        if (data.subTasks) {
            const subTasksWithIds = data.subTasks.filter(({ id }: { id: string }) => id);
            const subTasksWithoutIds = data.subTasks.filter(({ id }: { id: string }) => !id);
            data.subTasks = {
                connect: subTasksWithIds.map(({ id }: { id: string }) => ({ id })),
                create: subTasksWithoutIds.map(({ title, description }: { title: string, description: string }) => ({ title, description }))
            }

        }

        if (data.author) {
            delete data.author;
        }

        if (data.team) {
            delete data.team;
        }

        if (data.project) {
            delete data.project;
        }


        return data;
    }
}
