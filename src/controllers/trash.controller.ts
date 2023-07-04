import { Request, Response, Router } from "express";
import { TrashService } from "../services";
import { verifyAuthToken } from "../middlewares";
import { PrismaClient } from "@prisma/client";
import { RedisClient } from "../config";

export class TrashController {
    private trashService: TrashService;
    private redisClient: RedisClient;

    constructor(redisClient: RedisClient, prismaClient: PrismaClient) {
        this.trashService = new TrashService(prismaClient, redisClient);
        this.redisClient = redisClient;
    }

    routes(): Router {
        const router = Router();

        router.get("/", verifyAuthToken(), this.getTrashs.bind(this));
        router.get("/:id", verifyAuthToken(), this.getTrashById.bind(this));
        router.post("/", verifyAuthToken(), this.createTrash.bind(this));
        router.put("/:id", verifyAuthToken(), this.updateTrash.bind(this));
        router.delete("/:id", verifyAuthToken(), this.deleteTrash.bind(this));

        return router;
    }

    public async getTrashs(req: Request, res: Response): Promise<void> {
        const trashs = await this.trashService.getTrashs();
        res.json(trashs);
    }

    async getTrashById(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        const trash = await this.trashService.getTrashById(id);

        if (!trash) {
            res.status(404).json({
                message: "Trash not found",
            });
            return;
        }

        res.json(trash);
    }

    async createTrash(req: Request, res: Response): Promise<void> {
        const trashData = req.body;

        try {
            const createdTrash = await this.trashService.createTrash(trashData);
            res.json(createdTrash);
        } catch (error) {
            res.status(500).json({
                message: "Failed to create trash",
                error: error.message,
            });
        }
    }

    async updateTrash(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        const trashData = req.body;

        try {
            const updatedTrash = await this.trashService.updateTrash(id, trashData);
            res.json(updatedTrash);
        } catch (error) {
            res.status(500).json({
                message: "Failed to update trash",
                error: error.message,
            });
        }
    }

    async deleteTrash(req: Request, res: Response): Promise<void> {
        const { id } = req.params;

        try {
            const deletedTrash = await this.trashService.deleteTrash(id);
            res.json(deletedTrash);
        } catch (error) {
            res.status(500).json({
                message: "Failed to delete trash",
                error: error.message,
            });
        }
    }
}
