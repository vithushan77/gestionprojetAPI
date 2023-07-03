import { Request, Response, Router } from "express";
import { TeamService } from "../services";
import { verifyAuthToken } from "../middlewares";
import { PrismaClient } from "@prisma/client";
import { RedisClient } from "../config";

export class TeamController {
    private teamService: TeamService;
    private redisClient: RedisClient;

    constructor(redisClient: RedisClient, prismaClient: PrismaClient) {
        this.teamService = new TeamService(prismaClient, redisClient);
        this.redisClient = redisClient;
    }

    routes(): Router {
        const router = Router();

        router.get("/", verifyAuthToken(), this.getTeams.bind(this));
        router.get("/:id", verifyAuthToken(), this.getTeamById.bind(this));
        router.post("/", verifyAuthToken(), this.createTeam.bind(this));
        router.put("/:id", verifyAuthToken(), this.updateTeam.bind(this));
        router.delete("/:id", verifyAuthToken(), this.deleteTeam.bind(this));

        return router;
    }

    public async getTeams(req: Request, res: Response): Promise<void> {
        const teams = await this.teamService.getTeams();
        res.json(teams);
    }

    async getTeamById(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        const team = await this.teamService.getTeamById(id);

        if (!team) {
            res.status(404).json({
                message: "Team not found",
            });
            return;
        }

        res.json(team);
    }

    async createTeam(req: Request, res: Response): Promise<void> {
        const teamData = req.body;

        try {
            const createdTeam = await this.teamService.createTeam(teamData);
            res.json(createdTeam);
        } catch (error) {
            res.status(500).json({
                message: "Failed to create team",
                error: error.message,
            });
        }
    }

    async updateTeam(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        const teamData = req.body;

        try {
            const updatedTeam = await this.teamService.updateTeam(id, teamData);
            res.json(updatedTeam);
        } catch (error) {
            res.status(500).json({
                message: "Failed to update team",
                error: error.message,
            });
        }
    }

    async deleteTeam(req: Request, res: Response): Promise<void> {
        const { id } = req.params;

        try {
            const deletedTeam = await this.teamService.deleteTeam(id);
            res.json(deletedTeam);
        } catch (error) {
            res.status(500).json({
                message: "Failed to delete team",
                error: error.message,
            });
        }
    }
}
