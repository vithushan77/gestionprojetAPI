import {Request, Response, Router} from "express";
import {TaskService} from "../services";
import {verifyAuthToken} from "../middlewares";
import {PrismaClient} from "@prisma/client";
import {RedisClient} from "../config";



export class TaskController {
    private taskService: TaskService;
    private redisClient: RedisClient;

    constructor(redisClient: RedisClient, prismaClient: PrismaClient) {
        this.taskService = new TaskService(prismaClient, redisClient);
        this.redisClient = redisClient;
    }


    routes(): Router {
        const router = Router();

        router.get("/", verifyAuthToken(), this.getTasks.bind(this));
        router.get("/:id", verifyAuthToken(), this.getTaskById.bind(this));
        router.post("/", verifyAuthToken(), this.createTask.bind(this));
        router.put("/:id", verifyAuthToken(), this.updateTask.bind(this));
        router.delete("/:id", verifyAuthToken(), this.deleteTask.bind(this));

        return router;
    }

    public async getTasks(req: Request, res: Response): Promise<void> {
        const tasks = await this.taskService.getTasks();
        res.json(tasks);
    }

    async getTaskById(req: Request, res: Response): Promise<void> {
        const {id} = req.params;
        const task = await this.taskService.getTaskById(id);

        if (!task) {
            res.status(404).json({
                message: "Task not found",
            });
            return;
        }

        res.json(task);
    }

    async createTask(req: Request, res: Response): Promise<void> {
        const taskData = req.body;

        const createdTask = await this.taskService.createTask(taskData);
        res.json(createdTask);
    }

    async updateTask(req: Request, res: Response): Promise<void> {
        const {id} = req.params;
        const taskData = req.body;

        const updatedTask = await this.taskService.updateTask(id, taskData);
        res.json(updatedTask);
    }

    async deleteTask(req: Request, res: Response): Promise<void> {
        const {id} = req.params;

        const deletedTask = await this.taskService.deleteTask(id);
        res.json(deletedTask);
    }
}
