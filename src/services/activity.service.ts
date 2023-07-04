import { PrismaClient, Activity } from "@prisma/client";
import { RedisClient } from "../config";

export class ActivityService {
  private prismaClient: PrismaClient;

  constructor(prismaClient: PrismaClient, redisClient: RedisClient) {
    this.prismaClient = prismaClient;
  }

  public async getActivityById(id: string): Promise<any> {
    const activity = await this.prismaClient.activity.findUnique({
      where: {
        id
      },
    });
    return activity;
  }

  public async createActivity(data: Activity): Promise<any> {
    const activity = await this.prismaClient.activity.create({
      data,
    });
    return activity;
  }

  public async updateActivity(id: string, data: Activity): Promise<any> {
    const activity = await this.prismaClient.activity.update({
      where: {
        id
      },
      data,
    });
    return activity;
  }

  public async deleteActivity(id: string): Promise<any> {
    const activity = await this.prismaClient.activity.delete({
      where: {
        id
      },
    });
    return activity;
  }

  public async getActivitys(): Promise<any> {
    const activitys = await this.prismaClient.activity.findMany();
    return activitys;
  }
}
