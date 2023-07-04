import { PrismaClient, Trash } from "@prisma/client";
import { RedisClient } from "../config";

export class TrashService {
  private prismaClient: PrismaClient;

  constructor(prismaClient: PrismaClient, redisClient: RedisClient) {
    this.prismaClient = prismaClient;
  }

  public async getTrashById(id: string): Promise<any> {
    const trash = await this.prismaClient.trash.findUnique({
      where: {
        id
      },
    });
    return trash;
  }

  public async createTrash(data: Trash): Promise<any> {
    const trash = await this.prismaClient.trash.create({
      data,
    });
    return trash;
  }

  public async updateTrash(id: string, data: Trash): Promise<any> {
    const trash = await this.prismaClient.trash.update({
      where: {
        id
      },
      data,
    });
    return trash;
  }

  public async deleteTrash(id: string): Promise<any> {
    const trash = await this.prismaClient.trash.delete({
      where: {
        id
      },
    });
    return trash;
  }

  public async getTrashs(): Promise<any> {
    const trashs = await this.prismaClient.trash.findMany();
    return trashs;
  }
}
