import { PrismaClient, Team } from "@prisma/client";
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
        });
        return team;
    }

    public async createTeam(data: Team): Promise<any> {
        const team = await this.prismaClient.team.create({
            data,
        });
        return team;
    }

    public async updateTeam(id: string, data: Team): Promise<any> {
        const team = await this.prismaClient.team.update({
            where: {
                id
            },
            data,
        });
        return team;
    }

    public async deleteTeam(id: string): Promise<any> {
        const team = await this.prismaClient.team.delete({
            where: {
                id
            },
        });
        return team;
    }

    public async getTeams(): Promise<any> {
        const teams = await this.prismaClient.team.findMany();
        return teams;
    }
}
