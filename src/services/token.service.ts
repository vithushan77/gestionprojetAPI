import {PrismaClient, Token} from "@prisma/client";
import {RedisClient} from "../config";
import {SecurityUtils} from "../utils";

export class TokenService {
    private prismaClient: PrismaClient;

    constructor(prismaClient: PrismaClient, redisClient: RedisClient) {
        this.prismaClient = prismaClient;
    }

    public async getTokenById(id: string): Promise<any> {
        const token = await this.prismaClient.token.findUnique({
            where: {
                id
            },
        });
        return token;
    }

    public async createToken(data: Token): Promise<any> {
        data.token = SecurityUtils.generateToken();
        const token = await this.prismaClient.token.create({
            data,
        });
        return token;
    }

    public async updateToken(id: string, data: Token): Promise<any> {
        const token = await this.prismaClient.token.update({
            where: {
                id
            },
            data,
        });
        return token;
    }

    public async deleteToken(id: string): Promise<any> {
        const token = await this.prismaClient.token.delete({
            where: {
                id
            },
        });
        return token;
    }

    public async getTokens(): Promise<any> {
        const tokens = await this.prismaClient.token.findMany();
        return tokens;
    }
}
