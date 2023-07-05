import { PrismaClient, Project } from "@prisma/client";
import { RedisClient } from "../config";

export class ProjectService {
    private prismaClient: PrismaClient;

    constructor(prismaClient: PrismaClient, redisClient: RedisClient) {
        this.prismaClient = prismaClient;
    }

    public async getProjectById(id: string): Promise<any> {
        const project = await this.prismaClient.project.findUnique({
            where: {
                id
            },
        });
        return project;
    }

    public async createProject(data: any): Promise<any> {

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

        const project = await this.prismaClient.project.create({
            data,
        });
        return project;
    }

    public async updateProject(id: string, data: Project): Promise<any> {
        const project = await this.prismaClient.project.update({
            where: {
                id
            },
            data,
        });
        return project;
    }

    public async deleteProject(id: string): Promise<any> {
        const project = await this.prismaClient.project.delete({
            where: {
                id
            },
        });
        return project;
    }

    public async getProjects(): Promise<any> {
        const projects = await this.prismaClient.project.findMany();
        return projects;
    }
}
