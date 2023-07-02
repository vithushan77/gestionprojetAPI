import { Router } from "express";
import { initClient } from "../../config/redis";

const router = Router();
const redisClient = initClient();

router.get("/ping", (req, res) => {
    res.status(200).json({
        message: "pong",
    });
});

export { router };
