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
            select: {
                tasks: true,
                members: true,
            },
        });
        return team;
    }

    public async createTeam(data: any): Promise<Team> {

        if (data.members) {
            data.members = {
                connect: data.members.map(({ id }: { id: string }) => ({ id }))
            }
        }

        const team = await this.prismaClient.team.create({
            data,
        });
        return team;
    }

    public async updateTeam(id: string, data: Team): Promise<Team> {
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
                tasks: true,
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
}
