import { PrismaClient } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import { NextFunction, Request, Response, Router } from "express";
import { initClient } from "../../config";
import {RoleController, UserController, TaskStatusController} from "../../controllers";
import { AuthController } from "../../controllers";
import {ProjectController} from "../../controllers";
import {TaskController} from "../../controllers";
import {TokenController} from "../../controllers";

const router = Router();
const redisClient = initClient();
const prismaClient = new PrismaClient();
const userController = new UserController(redisClient, prismaClient);
const roleController = new RoleController(redisClient, prismaClient);
const authController = new AuthController(redisClient, prismaClient);
const projectController = new ProjectController(redisClient, prismaClient);
const taskController = new TaskController(redisClient, prismaClient);
const tokenController = new TokenController(redisClient, prismaClient);
const taskStatusController = new TaskStatusController(redisClient, prismaClient);

router.get("/ping", (req, res) => {
    res.status(200).json({
        message: "pong",
    });
});

router.use("/users", userController.routes())
router.use("/roles", roleController.routes())
router.use("/auth", authController.routes())
router.use("/projects", projectController.routes())
router.use("/tasks", taskController.routes())
router.use("/tokens",tokenController.routes())
router.use("/task-status",taskStatusController.routes())

// error handler
router.use((err: Error, req: Request, res: Response, next: NextFunction) => {

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
                console.log(prismaError);
                return res.status(500).json({
                    message: prismaError.message,
                    code: prismaError.code,
                });
        }
    }



    console.log(err);
    return res.status(500).json({
        message: err.message,
    });
});


export { router };
