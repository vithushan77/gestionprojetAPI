import * as crypto from "crypto";

export class SecurityUtils {

    public static hashPassword(str: string): string {
        const hash = crypto.createHash('sha512');
        hash.update(str);
        return hash.digest('hex');
    }

    public static generateToken(): string {
        return crypto.randomBytes(64).toString('hex');
    }

    public static checkPassword(password: string, hash: string): boolean {
        return hash === SecurityUtils.hashPassword(password);
    }

}