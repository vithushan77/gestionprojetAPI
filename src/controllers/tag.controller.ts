import { PrismaClient } from "@prisma/client";
import { Request, Response, Router } from "express";
import { RedisClient } from "../config";
import { verifyAuthToken } from "../middlewares";
import { TagService } from "../services";

export class TagController {
  private tagService: TagService;
  private redisClient: RedisClient;

  constructor(redisClient: RedisClient, prismaClient: PrismaClient) {
    this.tagService = new TagService(prismaClient, redisClient);
    this.redisClient = redisClient;
  }

  routes(): Router {
    const router = Router();

    router.get("/", verifyAuthToken(), this.getTags.bind(this));
    router.get("/:id", verifyAuthToken(), this.getTagById.bind(this));
    router.post("/", verifyAuthToken(), this.createTag.bind(this));
    router.put("/:id", verifyAuthToken(), this.updateTag.bind(this));
    router.delete("/:id", verifyAuthToken(), this.deleteTag.bind(this));

    return router;
  }

  public async getTags(req: Request, res: Response): Promise<void> {
    const tags = await this.tagService.getTags();
    res.json(tags);
  }

  async getTagById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const tag = await this.tagService.getTagById(id);

    if (!tag) {
      res.status(404).json({
        message: "Tag not found",
      });
      return;
    }

    res.json(tag);
  }

  async createTag(req: Request, res: Response): Promise<void> {
    const tagData = req.body;

    const createdTag = await this.tagService.createTag(tagData);
    res.json(createdTag);
  }

  async updateTag(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const tagData = req.body;

    const updatedTag = await this.tagService.updateTag(id, tagData);
    res.json(updatedTag);
  }

  async deleteTag(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const deletedTag = await this.tagService.deleteTag(id);
    res.json(deletedTag);
  }
}
