import { Request, RequestHandler } from 'express';

export function verifyAuthToken(roles?: string[]): RequestHandler {
    console.log(`Check user token with roles ${roles}`);
    return async function (req: Request, res, next) {
        try {
            next();
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    };
}
