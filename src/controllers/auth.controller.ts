import { PrismaClient } from "@prisma/client";
import { Request, Response, Router } from "express";
import { RedisClient } from "../config";
import { AuthService, UserService } from "../services";

export class AuthController {
    private authService: AuthService;
    private userService: UserService;
    private redisClient: RedisClient;

    constructor(redisClient: RedisClient, prismaClient: PrismaClient) {
        this.authService = new AuthService(prismaClient, redisClient);
        this.userService = new UserService(prismaClient, redisClient);
        this.redisClient = redisClient;
    }

    routes(): Router {
        const router = Router();

        router.post("/authenticate/email", this.authenticateWithEmailAndPassword.bind(this));
        router.post("/signup", this.createUserWithEmailAndPassword.bind(this))
        router.get("/me", this.me.bind(this))

        return router;
    }

    async me(req: Request, res: Response) {

        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                message: "Unauthorized",
            });
        }

        const user = await this.authService.me(token);

        res.status(200).json({
            user,
        });
    }


    // Authenticate user using Firebase ID token
    async authenticateWithEmailAndPassword(req: Request, res: Response) {
        const { email, password } = req.body;

        const firebaseUser = await this.authService
            .authenticateWithEmailAndPassword(email, password)

        if (!firebaseUser) {

            return res.status(400).json({
                message: "Invalid credentials",
            });
        }

        const token = await firebaseUser.getIdToken();
        const user = await this.authService.getUserByFirebaseId(firebaseUser.uid);

        if (!user) {
            return res.status(400).json({
                message: "User not found",
            });
        }

        await this.authService.persistToken(token, user);

        res.status(200).json({
            token,
        });

    }

    // Create user using email and password
    async createUserWithEmailAndPassword(req: Request, res: Response) {

        const { email, password } = req.body;

        const userExists = await this.authService.userExists(email);

        if (userExists) {
            return res.status(400).json({
                message: "User already exists",
            });
        }

        const firebaseUser = await this.authService
            .createUserWithEmailAndPassword(email, password)

        if (!firebaseUser) {
            return res.status(400).json({
                message: "Could not create user",
            });
        }

        res.status(200).json({
            message: "User created",
        });

    }
}
