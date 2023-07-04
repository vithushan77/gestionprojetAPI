import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import { initClient } from "../../config/redis";
import { CommentController, OrganizationController, ProjectController, RoleController, TagController, TaskController, TeamController, TokenController, TrashController, UserController } from "../../controllers";

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

router.get("/ping", (req, res) => {
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

export { router };
