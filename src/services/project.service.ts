import {PrismaClient, Project, Role} from "@prisma/client";
import {RedisClient} from "../config";


export class ProjectService {
    private prismaClient: PrismaClient;

    constructor(prismaClient: PrismaClient, redisClient: RedisClient) {
        this.prismaClient = prismaClient;
    }

    public async getProjects(): Promise<Project[]> {
        return await this.prismaClient.project.findMany();

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

        const project = await this.prismaClient.project.create({
            data,
        });
        return project;
    }


    public async updateProject(id: string, data: any): Promise<any> {

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
}