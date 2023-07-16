import { Organization, PrismaClient, Task, Team } from "@prisma/client";
import { RedisClient } from "../config";

export class OrganizationService {
    private prismaClient: PrismaClient;

    constructor(prismaClient: PrismaClient, redisClient: RedisClient) {
        this.prismaClient = prismaClient;
    }

    includeAll() {
        return {
            tags: true,
            projects: {
                include: {
                    teams: {
                        include: {
                            members: true,
                        }
                    },
                    tasks: true,
                }
            }
        }
    }

    public async getOrganizationById(id: string): Promise<any> {
        const organization = await this.prismaClient.organization.findUnique({
            where: {
                id
            },
            include: this.includeAll(),
        });
        return organization;
    }

    public async createOrganization(data: any): Promise<Organization> {

        data = await this.formatData(data);

        const organization = await this.prismaClient.organization.create({
            data,
        });
        return organization;
    }

    public async updateOrganization(id: string, data: Organization): Promise<Organization> {

        data = await this.formatData(data);

        const organization = await this.prismaClient.organization.update({
            where: {
                id
            },
            data,
        });
        return organization;
    }

    public async deleteOrganization(id: string): Promise<Organization> {
        const organization = await this.prismaClient.organization.delete({
            where: {
                id
            },
        });
        return organization;
    }

    public async getOrganizations(): Promise<Organization[]> {
        const organizations = await this.prismaClient.organization.findMany();
        return organizations;
    }

    public async getOrganizationTasks(id: string): Promise<Task[]> {
        const organization = await this.prismaClient.organization.findUnique({
            where: {
                id,
            },
            select: {
                projects: {
                    select: {
                        tasks: true,
                    }
                }
            },
        });
        return organization.projects.reduce((acc, project) => [...acc, ...project.tasks], []);
    }

    public async addTeamsToOrganization(organizationId: string, teams: Team[]): Promise<Organization> {
        const organization = await this.prismaClient.organization.update({
            where: {
                id: organizationId,
            },
            data: {
                teams: {
                    connect: teams.map((team) => ({ id: team.id })),
                },
            },
            include: {
                teams: true,
            },
        });
        return organization;
    }

    public async getOrganizationTeams(organizationId: string): Promise<Team[]> {
        const organization = await this.prismaClient.organization.findUnique({
            where: {
                id: organizationId,
            },
            include: {
                teams: true,
            },
        });
        return organization.teams;
    }

    private async formatData(data: any) {

        if (data.teams) {
            data.teams = {
                connect: data.teams.map(({ id }: { id: string }) => ({ id }))
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

        if (data.projects) {
            data.projects = {
                connect: data.projects.map(({ id }: { id: string }) => ({ id }))
            }
        }

        if (data.pinnedUsers) {
            data.pinnedUsers = {
                connect: data.pinnedUsers.map(({ id }: { id: string }) => ({ id }))
            }
        }

        return data;
    }
}
