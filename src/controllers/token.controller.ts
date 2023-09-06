import { Request, Response, Router } from "express";
import { TokenService } from "../services";
import { verifyAuthToken } from "../middlewares";
import { PrismaClient } from "@prisma/client";
import { RedisClient } from "../config";

export class TokenController {
    private tokenService: TokenService;
    private redisClient: RedisClient;

    constructor(redisClient: RedisClient, prismaClient: PrismaClient) {
        this.tokenService = new TokenService(prismaClient, redisClient);
        this.redisClient = redisClient;
    }

    routes(): Router {
        const router = Router();

        router.get("/", verifyAuthToken(), this.getTokens.bind(this));
        router.get("/:id", verifyAuthToken(), this.getTokenById.bind(this));
        router.post("/", verifyAuthToken(), this.createToken.bind(this));
        router.put("/:id", verifyAuthToken(), this.updateToken.bind(this));
        router.delete("/:id", verifyAuthToken(), this.deleteToken.bind(this));

        return router;
    }

    public async getTokens(req: Request, res: Response): Promise<void> {
        const tokens = await this.tokenService.getTokens();
        res.json(tokens);
    }

    async getTokenById(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        const token = await this.tokenService.getTokenById(id);

        if (!token) {
            res.status(404).json({
                message: "Token not found",
            });
            return;
        }

        res.json(token);
    }

    async createToken(req: Request, res: Response): Promise<void> {
        const tokenData = req.body;

        const createdToken = await this.tokenService.createToken(tokenData);
        res.json(createdToken);
    }

    async updateToken(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        const tokenData = req.body;

        const updatedToken = await this.tokenService.updateToken(id, tokenData);
        res.json(updatedToken);
    }

    async deleteToken(req: Request, res: Response): Promise<void> {
        const { id } = req.params;

        const deletedToken = await this.tokenService.deleteToken(id);
        res.json(deletedToken);
    }
}
