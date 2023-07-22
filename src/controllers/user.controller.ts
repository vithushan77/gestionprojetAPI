import { NextFunction, Request, Response, Router } from "express";
import { UserService } from "../services";
import { verifyAuthToken } from "../middlewares";
import { PrismaClient } from "@prisma/client";
import { RedisClient } from "../config";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime";

export class UserController {
  private userService: UserService;
  private redisClient: RedisClient;

  constructor(redisClient: RedisClient, prismaClient: PrismaClient) {
    this.userService = new UserService(prismaClient, redisClient);
    this.redisClient = redisClient;
  }

  routes(): Router {
    const router = Router();

    router.get("/", verifyAuthToken(), this.getUsers.bind(this));
    router.get("/:id", verifyAuthToken(), this.getUserById.bind(this));
    router.post("/", verifyAuthToken(), this.createUser.bind(this));
    router.put("/:id", verifyAuthToken(), this.updateUser.bind(this));
    router.delete("/:id", verifyAuthToken(), this.deleteUser.bind(this));

    return router;
  }

  public async getUsers(req: Request, res: Response): Promise<void> {

    if (req.query.email) {
      const user = await this.userService.getUserByEmail(req.query.email as string);
      if (!user) {
        res.status(404).json({
          message: "User not found",
        });
        return;
      }
      res.json(user);
      return;
    }

    const users = await this.userService.getUsers();
    res.json(users);
  }

  async getUserById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const { firebase } = req.query;

    let user = await this.userService.getUserById(id);

    if (!user) {
      res.status(404).json({
        message: "User not found",
      });
      return;
    }

    res.json(user);
  }

  async createUser(req: Request, res: Response): Promise<void> {
    const userData = req.body;

    const createdUser = await this.userService.createUser(userData);
    res.json(createdUser);
  }

  async updateUser(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const userData = req.body;

    const updatedUser = await this.userService.updateUser(id, userData);
    res.json(updatedUser);
  }

  async deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id } = req.params;

    const deletedUser = await this.userService.deleteUser(id);
    res.json(deletedUser);
  }
}
