import { Request, Response, Router } from "express";
import { OrganizationService } from "../services";
import { verifyAuthToken } from "../middlewares";
import { PrismaClient } from "@prisma/client";
import { RedisClient } from "../config";

export class OrganizationController {
    private organizationService: OrganizationService;
    private redisClient: RedisClient;

    constructor(redisClient: RedisClient, prismaClient: PrismaClient) {
        this.organizationService = new OrganizationService(prismaClient, redisClient);
        this.redisClient = redisClient;
    }

    routes(): Router {
        const router = Router();

        router.get("/", verifyAuthToken(), this.getOrganizations.bind(this));
        router.get("/:id", verifyAuthToken(), this.getOrganizationById.bind(this));
        router.post("/", verifyAuthToken(), this.createOrganization.bind(this));
        router.put("/:id", verifyAuthToken(), this.updateOrganization.bind(this));
        router.delete("/:id", verifyAuthToken(), this.deleteOrganization.bind(this));

        router.get("/:id/tasks", verifyAuthToken(), this.getOrganizationTasks.bind(this));

        router.post("/:id/teams", verifyAuthToken(), this.addTeamsToOrganization.bind(this));
        router.get("/:id/teams", verifyAuthToken(), this.getOrganizationTeams.bind(this));

        return router;
    }

    public async getOrganizations(req: Request, res: Response): Promise<void> {
        const organizations = await this.organizationService.getOrganizations();
        res.json(organizations);
    }

    async getOrganizationById(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        const organization = await this.organizationService.getOrganizationById(id);

        if (!organization) {
            res.status(404).json({
                message: "Organization not found",
            });
            return;
        }

        res.json(organization);
    }

    async createOrganization(req: Request, res: Response): Promise<void> {
        const organizationData = req.body;

        try {
            const createdOrganization = await this.organizationService.createOrganization(organizationData);
            res.json(createdOrganization);
        } catch (error) {
            res.status(500).json({
                message: "Failed to create organization",
                error: error.message,
            });
        }
    }

    async updateOrganization(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        const organizationData = req.body;

        try {
            const updatedOrganization = await this.organizationService.updateOrganization(id, organizationData);
            res.json(updatedOrganization);
        } catch (error) {
            res.status(500).json({
                message: "Failed to update organization",
                error: error.message,
            });
        }
    }

    async deleteOrganization(req: Request, res: Response): Promise<void> {
        const { id } = req.params;

        try {
            const deletedOrganization = await this.organizationService.deleteOrganization(id);
            res.json(deletedOrganization);
        } catch (error) {
            res.status(500).json({
                message: "Failed to delete organization",
                error: error.message,
            });
        }
    }

    async getOrganizationTasks(req: Request, res: Response): Promise<void> {
        const { id } = req.params;

        try {
            const tasks = await this.organizationService.getOrganizationTasks(id);
            res.json(tasks);
        }
        catch (error) {
            res.status(500).json({
                message: "Failed to get organization tasks",
                error: error.message,
            });
        }
    }

    async addTeamsToOrganization(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        const { teams } = req.body;

        try {
            const organization = await this.organizationService.addTeamsToOrganization(id, teams);
            res.json(organization);
        }
        catch (error) {
            res.status(500).json({
                message: "Failed to add teams to organization",
                error: error.message,
            });
        }
    }

    async getOrganizationTeams(req: Request, res: Response): Promise<void> {
        const { id } = req.params;

        try {
            const teams = await this.organizationService.getOrganizationTeams(id);
            res.json(teams);
        }
        catch (error) {
            res.status(500).json({
                message: "Failed to get organization teams",
                error: error.message,
            });
        }
    }
}
