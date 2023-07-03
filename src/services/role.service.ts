import { PrismaClient, Role } from "@prisma/client";
import { SecurityUtils } from "../utils";
import { RedisClient } from "../config";

export class RoleService {
  private prismaClient: PrismaClient;

  constructor(prismaClient: PrismaClient, redisClient: RedisClient) {
    this.prismaClient = prismaClient;
  }

  public async getRoleById(id: string): Promise<any> {
    const role = await this.prismaClient.role.findUnique({
      where: {
        id
      },
    });
    return role;
  }

  public async createRole(data: Role): Promise<any> {
    const role = await this.prismaClient.role.create({
      data,
    });
    return role;
  }

  public async updateRole(id: string, data: Role): Promise<any> {
    const role = await this.prismaClient.role.update({
      where: {
        id
      },
      data,
    });
    return role;
  }

  public async deleteRole(id: string): Promise<any> {
    const role = await this.prismaClient.role.delete({
      where: {
        id
      },
    });
    return role;
  }

  public async getRoles(): Promise<any> {
    const roles = await this.prismaClient.role.findMany();
    return roles;
  }
}
