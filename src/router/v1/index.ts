import { PrismaClient } from "@prisma/client";
import { NextFunction, Request, Response, Router } from "express";
import { initClient } from "../../config/redis";
import { CommentController, OrganizationController, ProjectController, RoleController, TagController, TaskController, TeamController, TokenController, TrashController, UserController } from "../../controllers";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime";

const router = Router();
const redisClient = initClient();
const prismaClient = new PrismaClient();

const userController = new UserController(redisClient, prismaClient);
const roleController = new RoleController(redisClient, prismaClient);
const projectController = new ProjectController(redisClient, prismaClient);
const teamController = new TeamController(redisClient, prismaClient);
const tokenController = new TokenController(redisClient, prismaClient);
const taskController = new TaskController(redisClient, prismaClient);
const commentController = new CommentController(redisClient, prismaClient);
const organizationController = new OrganizationController(redisClient, prismaClient);
const trashController = new TrashController(redisClient, prismaClient);
const tagController = new TagController(redisClient, prismaClient);

class ResponseError extends Error {
    status: number;
    code?: string;

    constructor(message: string, status: number, code?: string) {
        super(message);
        this.name = "ResponseError";
        this.status = status;
        this.code = code;
    }
}

class PingNotFoundException extends ResponseError {

    constructor() {
        super("Ping not found", 404, "E1000");
    }
}

router.get("/ping", (req, res) => {
    throw new PingNotFoundException();
    res.status(200).json({
        message: "pong",
    });
});

router.use("/users", userController.routes())
router.use("/roles", roleController.routes())
router.use("/projects", projectController.routes())
router.use("/teams", teamController.routes())
router.use("/tokens", tokenController.routes())
router.use("/tasks", taskController.routes())
router.use("/comments", commentController.routes())
router.use("/organizations", organizationController.routes())
router.use("/trash", trashController.routes())
router.use("/tag", tagController.routes())

// error handler
router.use((err: Error, req: Request, res: Response, next: NextFunction) => {

    console.error(err);

    if (err.name === "ResponseError") {
        const responseError = err as ResponseError;
        return res.status(responseError.status).json({
            message: responseError.message,
            code: responseError.code,
            name: responseError.name,
        });
    }

    if (err.name === "PrismaClientKnownRequestError") {
        let prismaError = err as PrismaClientKnownRequestError;

        switch (prismaError.code) {
            case "P2002":
                return res.status(400).json({
                    message: "Duplicate entry",
                    code: prismaError.code,
                });
            case "P2003":
                return res.status(400).json({
                    message: `Foreign key constraint violation ${prismaError.meta.field_name}`,
                    code: prismaError.code,
                });
            case "P2025":
                return res.status(404).json({
                    message: prismaError.meta.cause,
                    code: prismaError.code,
                });
            case "P2005":
            case "P2006":
            case "P2007":
                return res.status(400).json({
                    message: `Invalid field value ${prismaError.meta.field_name}`,
                    code: prismaError.code,
                });
            case "2011":
                return res.status(400).json({
                    message: `Null constraint violation ${prismaError.meta.field_name}`,
                    code: prismaError.code,
                });
            case "2012":
                return res.status(400).json({
                    message: `Missing required field ${prismaError.meta.field_name}`,
                    code: prismaError.code,
                });
            case "P2015":
                return res.status(404).json({
                    message: `Record not found`,
                    code: prismaError.code,
                });
            default:
                return res.status(500).json({
                    message: prismaError.message,
                    code: prismaError.code,
                });
        }
    }



    return res.status(500).json({
        message: err.message,
    });
});


export { router };
