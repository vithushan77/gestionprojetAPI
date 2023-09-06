import {PrismaClient, Task, Role} from "@prisma/client";
import {RedisClient} from "../config";


export class TaskService {
    private prismaClient: PrismaClient;

    constructor(prismaClient: PrismaClient, redisClient: RedisClient) {
        this.prismaClient = prismaClient;
    }

    public async getTasks(): Promise<Task[]> {
        return this.prismaClient.task.findMany({
            include: {
                status: true,
                asigneTo: true,
                project: true,
            }
        });


    }

    public async getTaskById(id: string): Promise<any> {
        const task = await this.prismaClient.task.findUnique({
            where: {
                id
            },
            include: {
                status: true,
                project: true,
                asigneTo: true,
                createdBy: true,
            }
        });
        return task;
    }

    public async createTask(data: any): Promise<any> {
        data= await this.formatData(data);
        const task = await this.prismaClient.task.create({
            data,
        });
        return task;
    }

    public async updateTask(id: string, data: any): Promise<any> {
        data= await this.formatData(data);

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

    public async formatData(data: any): Promise<any> {
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
        if (data.project) {
            data.projectId = data.project.id;
            delete data.project;
        }
        if (data.asigneTo) {
            data.asignedToId = data.asigneTo.id;
            delete data.asigneTo;
        }
        if (data.dueDate && typeof data.dueDate === 'number') {
            data.dueDate = new Date(data.dueDate);
        }
        return data;
    }
}