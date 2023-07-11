import { PrismaClient, User } from "@prisma/client";
import { User as FirebaseUser, getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, Auth } from "firebase/auth";
import { RedisClient } from "../config";
import { app } from "../config/firebase";
import { UserService } from "./user.service";

export class AuthService {
  private prismaClient: PrismaClient;
  private auth: Auth;

  constructor(prismaClient: PrismaClient, redisClient: RedisClient) {
    this.prismaClient = prismaClient;
    this.auth = getAuth(app);
  }

  async authenticateWithEmailAndPassword(
    email: string,
    password: string
  ): Promise<FirebaseUser> {
    const userCredential = await signInWithEmailAndPassword(
      this.auth,
      email,
      password
    );

    return userCredential.user;
  }

  async persistToken(token: string, user: User): Promise<void> {
    await this.prismaClient.token.create({
      data: {
        token: token,
        context: "auth",
        user: {
          connect: {
            id: user.id,
          },
        },
      },
    });
  }

  async getUserByFirebaseId(id: string): Promise<any> {
    const user = await this.prismaClient.user.findUnique({
      where: {
        firebaseId: id
      },
    });
    return user;
  }


  async me(token: string): Promise<User> {
    let findToken = await this.prismaClient.token.findUnique({
      where: {
        token: token,
      },
      select: {
        user: true,
      },
    });

    if (!findToken) {
      throw new Error("Token not found");
    }

    return findToken.user;
  }


  async userExists(email: string): Promise<boolean> {
    const user = await this.prismaClient.user.findUnique({
      where: {
        email: email,
      },
    });

    if (user) {
      return true;
    }

    return false;
  }

  async createUserWithEmailAndPassword(
    email: string,
    password: string
  ): Promise<FirebaseUser> {
    const userCredential = await createUserWithEmailAndPassword(
      this.auth,
      email,
      password
    );

    return userCredential.user;
  }
}
