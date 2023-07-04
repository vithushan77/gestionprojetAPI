import { PrismaClient, Tag } from "@prisma/client";
import { RedisClient } from "../config";

export class TagService {
  private prismaClient: PrismaClient;

  constructor(prismaClient: PrismaClient, redisClient: RedisClient) {
    this.prismaClient = prismaClient;
  }

  public async getTagById(id: string): Promise<any> {
    const tag = await this.prismaClient.tag.findUnique({
      where: {
        id
      },
    });
    return tag;
  }

  public async createTag(data: Tag): Promise<any> {
    const tag = await this.prismaClient.tag.create({
      data,
    });
    return tag;
  }

  public async updateTag(id: string, data: Tag): Promise<any> {
    const tag = await this.prismaClient.tag.update({
      where: {
        id
      },
      data,
    });
    return tag;
  }

  public async deleteTag(id: string): Promise<any> {
    const tag = await this.prismaClient.tag.delete({
      where: {
        id
      },
    });
    return tag;
  }

  public async getTags(): Promise<any> {
    const tags = await this.prismaClient.tag.findMany();
    return tags;
  }
}
