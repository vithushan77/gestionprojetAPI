import { PrismaClient, Task, Team, User } from "@prisma/client";
import { RedisClient } from "../config";

export class TeamService {
    private prismaClient: PrismaClient;

    constructor(prismaClient: PrismaClient, redisClient: RedisClient) {
        this.prismaClient = prismaClient;
    }

    public async getTeamById(id: string): Promise<any> {
        const team = await this.prismaClient.team.findUnique({
            where: {
                id
            },
            include: {
                tasks: true,
                members: true,
                projects: true,
                tags: true,
                organization: true,
            },
        });
        return team;
    }

    public async createTeam(data: any): Promise<Team> {

        data = await this.formatData(data);

        const team = await this.prismaClient.team.create({
            data,
        });
        return team;
    }

    public async updateTeam(id: string, data: any): Promise<Team> {

        data = await this.formatData(data);

        const team = await this.prismaClient.team.update({
            where: {
                id
            },
            data,
        });
        return team;
    }

    public async deleteTeam(id: string): Promise<Team> {
        const team = await this.prismaClient.team.delete({
            where: {
                id
            },
        });
        return team;
    }

    public async getTeams(): Promise<Team[]> {
        const teams = await this.prismaClient.team.findMany();
        return teams;
    }

    public async addTasksToTeam(teamId: string, tasks: Task[]): Promise<Team> {
        const team = await this.prismaClient.team.update({
            where: {
                id: teamId,
            },
            data: {
                tasks: {
                    connect: tasks.map((task) => ({ id: task.id })),
                },
            },
            include: {
                tasks: true,
            },
        });
        return team;
    }

    public async getTeamTasks(id: string): Promise<Task[]> {
        const team = await this.prismaClient.team.findUnique({
            where: {
                id,
            },
            include: {
                tasks: {
                    include: {
                        attachments: true,
                        tags: true,
                        assignedUsers: true,
                        author: true,
                        comments: true,
                        subTasks: true,
                        parentTask: true,
                        status: true,
                        team: true,
                        project: true,
                    }
                }
            },
        });
        return team.tasks;
    }

    public async addMembersToTeam(teamId: string, members: User[]): Promise<Team> {
        const team = await this.prismaClient.team.update({
            where: {
                id: teamId,
            },
            data: {
                members: {
                    connect: members.map((member) => ({ id: member.id })),
                },
            },
            include: {
                members: true,
            },
        });
        return team;
    }

    public async getTeamMembers(teamId: string): Promise<User[]> {
        const team = await this.prismaClient.team.findUnique({
            where: {
                id: teamId,
            },
            include: {
                members: true,
            },
        });
        return team.members;
    }

    private async formatData(data: any): Promise<any> {
        if (data.members) {
            data.members = {
                connect: data.members.map(({ id }: { id: string }) => ({ id }))
            }
        }

        if (data.projects) {
            data.projects = {
                connect: data.projects.map(({ id }: { id: string }) => ({ id }))
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


        if (data.tasks) {
            data.tasks = {
                connect: data.tasks.map(({ id }: { id: string }) => ({ id }))
            }
        }

        if (data.organization) {
            delete data.organization;
        }

        if (data.lastTeamUsers) {
            data.lastTeamUsers = {
                connect: data.lastTeamUsers.map(({ id }: { id: string }) => ({ id }))
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
