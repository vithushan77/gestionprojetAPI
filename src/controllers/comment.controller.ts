import { Request, Response, Router } from "express";
import { CommentService } from "../services";
import { verifyAuthToken } from "../middlewares";
import { PrismaClient } from "@prisma/client";
import { RedisClient } from "../config";

export class CommentController {
    private commentService: CommentService;
    private redisClient: RedisClient;

    constructor(redisClient: RedisClient, prismaClient: PrismaClient) {
        this.commentService = new CommentService(prismaClient, redisClient);
        this.redisClient = redisClient;
    }

    routes(): Router {
        const router = Router();

        router.get("/", verifyAuthToken(), this.getComments.bind(this));
        router.get("/:id", verifyAuthToken(), this.getCommentById.bind(this));
        router.post("/", verifyAuthToken(), this.createComment.bind(this));
        router.put("/:id", verifyAuthToken(), this.updateComment.bind(this));
        router.delete("/:id", verifyAuthToken(), this.deleteComment.bind(this));

        router.get("/:id/mentions", verifyAuthToken(), this.getCommentMentions.bind(this));

        return router;
    }

    public async getComments(req: Request, res: Response): Promise<void> {
        const comments = await this.commentService.getComments();
        res.json(comments);
    }

    async getCommentById(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        const comment = await this.commentService.getCommentById(id);

        if (!comment) {
            res.status(404).json({
                message: "Comment not found",
            });
            return;
        }

        res.json(comment);
    }

    async createComment(req: Request, res: Response): Promise<void> {
        const commentData = req.body;

        try {
            const createdComment = await this.commentService.createComment(commentData);
            res.json(createdComment);
        } catch (error) {
            res.status(500).json({
                message: "Failed to create comment",
                error: error.message,
            });
        }
    }

    async updateComment(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        const commentData = req.body;

        try {
            const updatedComment = await this.commentService.updateComment(id, commentData);
            res.json(updatedComment);
        } catch (error) {
            res.status(500).json({
                message: "Failed to update comment",
                error: error.message,
            });
        }
    }

    async deleteComment(req: Request, res: Response): Promise<void> {
        const { id } = req.params;

        try {
            const deletedComment = await this.commentService.deleteComment(id);
            res.json(deletedComment);
        } catch (error) {
            res.status(500).json({
                message: "Failed to delete comment",
                error: error.message,
            });
        }
    }

    async getCommentMentions(req: Request, res: Response): Promise<void> {
        const { id } = req.params;

        try {
            const mentions = await this.commentService.getCommentMentions(id);
            res.json(mentions);
        }
        catch (error) {
            res.status(500).json({
                message: "Failed to get comment mentions",
                error: error.message,
            });
        }
    }


}
