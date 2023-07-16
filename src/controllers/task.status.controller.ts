import { PrismaClient } from "@prisma/client";
import { Request, Response, Router } from "express";
import { RedisClient } from "../config";
import { verifyAuthToken } from "../middlewares";
import { TaskStatusService } from "../services";

export class TaskStatusController {
  private taskStatusService: TaskStatusService;
  private redisClient: RedisClient;

  constructor(redisClient: RedisClient, prismaClient: PrismaClient) {
    this.taskStatusService = new TaskStatusService(prismaClient, redisClient);
    this.redisClient = redisClient;
  }

  routes(): Router {
    const router = Router();

    router.get("/", verifyAuthToken(), this.getTaskStatuss.bind(this));
    router.get("/:id", verifyAuthToken(), this.getTaskStatusById.bind(this));
    router.post("/", verifyAuthToken(), this.createTaskStatus.bind(this));
    router.put("/:id", verifyAuthToken(), this.updateTaskStatus.bind(this));
    router.delete("/:id", verifyAuthToken(), this.deleteTaskStatus.bind(this));

    return router;
  }

  public async getTaskStatuss(req: Request, res: Response): Promise<void> {
    const taskstatuss = await this.taskStatusService.getTaskStatuss();
    res.json(taskstatuss);
  }

  async getTaskStatusById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const taskstatus = await this.taskStatusService.getTaskStatusById(id);

    if (!taskstatus) {
      res.status(404).json({
        message: "TaskStatus not found",
      });
      return;
    }

    res.json(taskstatus);
  }

  async createTaskStatus(req: Request, res: Response): Promise<void> {
    const taskstatusData = req.body;

    const createdTaskStatus = await this.taskStatusService.createTaskStatus(taskstatusData);
    res.json(createdTaskStatus);
  }

  async updateTaskStatus(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const taskstatusData = req.body;

    const updatedTaskStatus = await this.taskStatusService.updateTaskStatus(
      id,
      taskstatusData
    );
    res.json(updatedTaskStatus);
  }

  async deleteTaskStatus(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const deletedTaskStatus = await this.taskStatusService.deleteTaskStatus(id);
    res.json(deletedTaskStatus);
  }
}
