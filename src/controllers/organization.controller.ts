import { PrismaClient } from "@prisma/client";
import { Request, Response, Router } from "express";
import { RedisClient } from "../config";
import { verifyAuthToken } from "../middlewares";
import { OrganizationService } from "../services";

export class OrganizationController {
  private organizationService: OrganizationService;
  private redisClient: RedisClient;

  constructor(redisClient: RedisClient, prismaClient: PrismaClient) {
    this.organizationService = new OrganizationService(
      prismaClient,
      redisClient
    );
    this.redisClient = redisClient;
  }

  routes(): Router {
    const router = Router();

    router.get("/", verifyAuthToken(), this.getOrganizations.bind(this));
    router.get("/:id", verifyAuthToken(), this.getOrganizationById.bind(this));
    router.post("/", verifyAuthToken(), this.createOrganization.bind(this));
    router.put("/:id", verifyAuthToken(), this.updateOrganization.bind(this));
    router.delete(
      "/:id",
      verifyAuthToken(),
      this.deleteOrganization.bind(this)
    );

    router.get(
      "/:id/tasks",
      verifyAuthToken(),
      this.getOrganizationTasks.bind(this)
    );

    router.post(
      "/:id/teams",
      verifyAuthToken(),
      this.addTeamsToOrganization.bind(this)
    );
    router.get(
      "/:id/teams",
      verifyAuthToken(),
      this.getOrganizationTeams.bind(this)
    );

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

    const createdOrganization =
      await this.organizationService.createOrganization(organizationData);
    res.status(201).json(createdOrganization);
  }

  async updateOrganization(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const organizationData = req.body;

    const updatedOrganization =
      await this.organizationService.updateOrganization(id, organizationData);
    res.json(updatedOrganization);
  }

  async deleteOrganization(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const deletedOrganization =
      await this.organizationService.deleteOrganization(id);
    res.json(deletedOrganization);
  }

  async getOrganizationTasks(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const tasks = await this.organizationService.getOrganizationTasks(id);
    res.json(tasks);
  }

  async addTeamsToOrganization(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const { teams } = req.body;

    const organization = await this.organizationService.addTeamsToOrganization(
      id,
      teams
    );
    res.json(organization);
  }

  async getOrganizationTeams(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const teams = await this.organizationService.getOrganizationTeams(id);
    res.json(teams);
  }
}
