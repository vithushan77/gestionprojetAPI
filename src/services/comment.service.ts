import { PrismaClient, Comment, User } from "@prisma/client";
import { RedisClient } from "../config";

export class CommentService {
    private prismaClient: PrismaClient;

    constructor(prismaClient: PrismaClient, redisClient: RedisClient) {
        this.prismaClient = prismaClient;
    }

    public async getCommentById(id: string): Promise<any> {
        const comment = await this.prismaClient.comment.findUnique({
            where: {
                id
            },
            include: {
                mentions: true,
                task: true,
                author: true,
                answers: true,
                answerTo: true,
            },
        });
        return comment;
    }

    public async createComment(data: any): Promise<Comment> {
        data = await this.formatData(data);

        const comment = await this.prismaClient.comment.create({
            data,
        });
        return comment;
    }

    public async updateComment(id: string, data: Comment): Promise<Comment> {
        data = await this.formatData(data);

        const comment = await this.prismaClient.comment.update({
            where: {
                id
            },
            data,
        });
        return comment;
    }

    public async deleteComment(id: string): Promise<Comment> {
        const comment = await this.prismaClient.comment.delete({
            where: {
                id
            },
        });
        return comment;
    }

    public async getComments(): Promise<Comment[]> {
        const comments = await this.prismaClient.comment.findMany();
        return comments;
    }

    public async getCommentMentions(id: string): Promise<User[]> {
        const comment = await this.prismaClient.comment.findUnique({
            where: {
                id,
            },
            include: {
                mentions: true,
            },
        });
        return comment.mentions;
    }

    private async formatData(data: any): Promise<any> {
        delete data.task;
        delete data.author;
        delete data.answerTo;

        if (data.mentions) {
            data.mentions = {
                connect: data.mentions.map(({ id }: { id: string }) => ({ id }))
            }
        }

        if (data.answers) {
            data.answers = {
                connect: data.answers.map(({ id }: { id: string }) => ({ id }))
            }
        }

        return data;
    }
}
