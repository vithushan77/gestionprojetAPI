import { PrismaClient, User } from "@prisma/client";
import { SecurityUtils } from "../utils";
import { RedisClient } from "../config";

export class UserService {
  private prismaClient: PrismaClient;

  constructor(prismaClient: PrismaClient, redisClient: RedisClient) {
    this.prismaClient = prismaClient;
  }

  public async getUserByToken(token: string): Promise<any> {
    const user = await this.prismaClient.token.findUnique({
      where: {
        token: token,
      },
      select: {
        user: true,
      },
    });
    return user;
  }

  public async getUserById(id: string): Promise<any> {
    const user = await this.prismaClient.user.findUnique({
      where: {
        id
      },
    });
    return user;
  }

  public async createUser(data: User & { password: string }): Promise<any> {
    data.passwordHash = SecurityUtils.hashPassword(data.password);
    delete data.password;
    const user = await this.prismaClient.user.create({
      data,
    });
    return user;
  }

  public async updateUser(id: string, data: User & { password: string }): Promise<any> {
    if (data.password) {
      data.passwordHash = SecurityUtils.hashPassword(data.password);
      delete data.password;
    }
    const user = await this.prismaClient.user.update({
      where: {
        id
      },
      data,
    });
    return user;
  }

  public async deleteUser(id: string): Promise<any> {
    const user = await this.prismaClient.user.delete({
      where: {
        id
      },
    });
    return user;
  }

  public async getUsers(): Promise<any> {
    const users = await this.prismaClient.user.findMany();
    return users;
  }
}
