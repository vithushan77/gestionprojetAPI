import { PrismaClient } from "@prisma/client";
import { Request, Response, Router } from "express";
import { RedisClient } from "../config";
import { verifyAuthToken } from "../middlewares";
import { ActivityService } from "../services";

export class ActivityController {
  private activityService: ActivityService;
  private redisClient: RedisClient;

  constructor(redisClient: RedisClient, prismaClient: PrismaClient) {
    this.activityService = new ActivityService(prismaClient, redisClient);
    this.redisClient = redisClient;
  }

  routes(): Router {
    const router = Router();

    router.get("/", verifyAuthToken(), this.getActivitys.bind(this));
    router.get("/:id", verifyAuthToken(), this.getActivityById.bind(this));
    router.post("/", verifyAuthToken(), this.createActivity.bind(this));
    router.put("/:id", verifyAuthToken(), this.updateActivity.bind(this));
    router.delete("/:id", verifyAuthToken(), this.deleteActivity.bind(this));

    return router;
  }

  public async getActivitys(req: Request, res: Response): Promise<void> {
    const activitys = await this.activityService.getActivitys();
    res.json(activitys);
  }

  async getActivityById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const activity = await this.activityService.getActivityById(id);

    if (!activity) {
      res.status(404).json({
        message: "Activity not found",
      });
      return;
    }

    res.json(activity);
  }

  async createActivity(req: Request, res: Response): Promise<void> {
    const activityData = req.body;
    const createdActivity = await this.activityService.createActivity(
      activityData
    );
    res.json(createdActivity);
  }

  async updateActivity(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const activityData = req.body;
    const updatedActivity = await this.activityService.updateActivity(
      id,
      activityData
    );
    res.json(updatedActivity);
  }

  async deleteActivity(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const deletedActivity = await this.activityService.deleteActivity(id);
    res.json(deletedActivity);
  }
}
