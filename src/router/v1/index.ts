import { Router } from "express";
import { initClient } from "../../config/redis";
import { PrismaClient } from "@prisma/client";
import { ProjectController, RoleController, UserController } from "../../controllers";

const router = Router();
const redisClient = initClient();
const prismaClient = new PrismaClient();

const userController = new UserController(redisClient, prismaClient);
const roleController = new RoleController(redisClient, prismaClient);
const projectController = new ProjectController(redisClient, prismaClient);

router.get("/ping", (req, res) => {
    res.status(200).json({
        message: "pong",
    });
});

router.use("/users", userController.routes())
router.use("/roles", roleController.routes())
router.use("/projects", projectController.routes())

export { router };
