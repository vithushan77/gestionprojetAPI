import {Request, Response, Router} from "express";
import {ProjectService} from "../services";
import {verifyAuthToken} from "../middlewares";
import {PrismaClient} from "@prisma/client";
import {RedisClient} from "../config";



export class ProjectController {
    private projectService: ProjectService;
    private redisClient: RedisClient;

    constructor(redisClient: RedisClient, prismaClient: PrismaClient) {
        this.projectService = new ProjectService(prismaClient, redisClient);
        this.redisClient = redisClient;
    }


    routes(): Router {
        const router = Router();

        router.get("/", verifyAuthToken(), this.getProjects.bind(this));
        router.get("/:id", verifyAuthToken(), this.getProjectById.bind(this));
        router.post("/", verifyAuthToken(), this.createProject.bind(this));
        router.put("/:id", verifyAuthToken(), this.updateProject.bind(this));
        router.delete("/:id", verifyAuthToken(), this.deleteProject.bind(this));

        return router;
    }

    public async getProjects(req: Request, res: Response): Promise<void> {
        const projects = await this.projectService.getProjects();
        res.json(projects);
    }

    async getProjectById(req: Request, res: Response): Promise<void> {
        const {id} = req.params;
        const project = await this.projectService.getProjectById(id);

        if (!project) {
            res.status(404).json({
                message: "Project not found",
            });
            return;
        }

        res.json(project);
    }

    async createProject(req: Request, res: Response): Promise<void> {
        const projectData = req.body;

        const createdProject = await this.projectService.createProject(projectData);
        res.json(createdProject);
    }

    async updateProject(req: Request, res: Response): Promise<void> {
        const {id} = req.params;
        const projectData = req.body;

        const updatedProject = await this.projectService.updateProject(id, projectData);
        res.json(updatedProject);
    }

    async deleteProject(req: Request, res: Response): Promise<void> {
        const {id} = req.params;

        const deletedProject = await this.projectService.deleteProject(id);
        res.json(deletedProject);
    }
}
