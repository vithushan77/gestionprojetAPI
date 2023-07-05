import { Request, Response, Router } from "express";
import { RoleService } from "../services";
import { verifyAuthToken } from "../middlewares";
import { PrismaClient } from "@prisma/client";
import { RedisClient } from "../config";

export class RoleController {
  private roleService: RoleService;
  private redisClient: RedisClient;

  constructor(redisClient: RedisClient, prismaClient: PrismaClient) {
    this.roleService = new RoleService(prismaClient, redisClient);
    this.redisClient = redisClient;
  }

  routes(): Router {
    const router = Router();

    router.get("/", verifyAuthToken(), this.getRoles.bind(this));
    router.get("/:id", verifyAuthToken(), this.getRoleById.bind(this));
    router.post("/", verifyAuthToken(), this.createRole.bind(this));
    router.put("/:id", verifyAuthToken(), this.updateRole.bind(this));
    router.delete("/:id", verifyAuthToken(), this.deleteRole.bind(this));

    return router;
  }

  public async getRoles(req: Request, res: Response): Promise<void> {
    const roles = await this.roleService.getRoles();
    res.json(roles);
  }

  async getRoleById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const role = await this.roleService.getRoleById(id);

    if (!role) {
      res.status(404).json({
        message: "Role not found",
      });
      return;
    }

    res.json(role);
  }

  async createRole(req: Request, res: Response): Promise<void> {
    const roleData = req.body;

    const createdRole = await this.roleService.createRole(roleData);
    res.json(createdRole);
  }

  async updateRole(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const roleData = req.body;

    const updatedRole = await this.roleService.updateRole(id, roleData);
    res.json(updatedRole);
  }

  async deleteRole(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const deletedRole = await this.roleService.deleteRole(id);
    res.json(deletedRole);
  }
}
