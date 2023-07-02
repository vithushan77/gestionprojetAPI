import { Router } from "express";
import { initClient } from "../../config/redis";

const v1 = Router();
const redisClient = initClient();

v1.get("/ping", (req, res) => {
    res.status(200).json({
        message: "pong",
    });
});


export { v1 };
