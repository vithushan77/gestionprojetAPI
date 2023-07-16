import { PrismaClient, User } from "@prisma/client";
import { SecurityUtils } from "../utils";
import { RedisClient } from "../config";
import { ProjectService } from "./project.service";

export class UserService {
  private prismaClient: PrismaClient;

  constructor(prismaClient: PrismaClient, redisClient: RedisClient) {
    this.prismaClient = prismaClient;
  }

  public async getUserByToken(token: string): Promise<any> {
    const user = await this.prismaClient.token.findUnique({
      where: {
        token: token,
      },
      select: {
        user: true,
      },
    });
    return user;
  }

  public async getUserByEmail(email: string): Promise<any> {
    const user = await this.prismaClient.user.findUnique({
      where: {
        email,
      },
    });
    return user;
  }

  public async getUserById(id: string): Promise<any> {
    const user = await this.prismaClient.user.findUnique({
      where: {
        id
      },
      include: {
        teams: {
          include: {
            organization: true
          }
        },
        lastTeam: true,
        role: true,
        assignedTasks: true,
        notifications: true,
        comments: true,
        activities: true
      }
    });
    return user;
  }

  public async getUserByFirebaseId(id: string): Promise<any> {
    const user = await this.prismaClient.user.findUnique({
      where: {
        firebaseId: id
      },
    });
    return user;
  }

  public async createUser(data: any): Promise<any> {
    data = await this.formatData(data);


    if (!data.roleId) {
      const role = await this.prismaClient.role.findFirst({
        where: {
          name: 'USER'
        }
      });

      data.roleId = role.id;
    }

    const user = await this.prismaClient.user.create({
      data,
    });
    return user;
  }

  public async updateUser(id: string, data: any): Promise<any> {
    data = await this.formatData(data);

    const user = await this.prismaClient.user.update({
      where: {
        id
      },
      include: {
        teams: {
          include: {
            organization: true
          }
        },
        lastTeam: true,
        role: true,
        assignedTasks: true,
        notifications: true,
        comments: true,
        activities: true
      },
      data,
    });
    return user;
  }

  public async deleteUser(id: string): Promise<any> {
    const user = await this.prismaClient.user.delete({
      where: {
        id
      }
    });
    return user;
  }

  public async getUsers(): Promise<any> {
    const users = await this.prismaClient.user.findMany();
    return users;
  }


  public async updateUserLastLogin(id: any) {

    const user = await this.prismaClient.user.findUnique({
      where: {
        id
      },
      include: {
        lastTeam: {
          include: {
            projects: true
          }
        },
        lastProject: true,
        teams: {
          include: {
            projects: true
          },
        }
      }
    });

    let lastTeam = user.lastTeam;
    let lastProjectId = user.lastProjectId;
    let lastOrganizationId = user.lastOrganizationId;

    const firstTeam = user.teams[0];

    if (!lastTeam && firstTeam) {
      lastTeam = firstTeam;
    }

    if (!lastProjectId && lastTeam && lastTeam.projects.length > 0) {
      // take a random project from the list of all prismaClient.projects
      const projects = await this.prismaClient.project.findMany();
      lastProjectId = projects[0].id;
    }

    if (!lastOrganizationId && lastTeam) {
      lastOrganizationId = lastTeam.organizationId;
    }

    const updateUser = await this.prismaClient.user.update({
      where: {
        id
      },
      data: {
        lastLogin: new Date(),
        lastTeamId: lastTeam.id,
        lastProjectId,
        lastOrganizationId
      }
    });

    return updateUser;
  }

  async formatData(data: any) {
    if (data.password) {
      data.passwordHash = SecurityUtils.hashPassword(data.password);
      delete data.password;
    }

    if (data.lastTeam && !data.lastTeamId) {
      data.lastTeamId = data.lastTeam.id;
    }

    if (data.lastProject && !data.lastProjectId) {
      data.lastProjectId = data.lastProject.id;
    }

    if (data.lastOrganization && !data.lastOrganizationId) {
      data.lastOrganizationId = data.lastOrganization.id;
    }


    delete data.lastTeam;
    delete data.lastProject;
    delete data.lastOrganization;
    delete data.role;

    if (data.teams) {
      data.teams = {
        connect: data.teams.map(({ id }: { id: string }) => ({ id }))
      }
    }

    data = await this.formatArrayData(data, 'assignedTasks');
    data = await this.formatArrayData(data, 'createdTasks');
    data = await this.formatArrayData(data, 'createdTeams');
    data = await this.formatArrayData(data, 'tokens');
    data = await this.formatArrayData(data, 'comments');
    data = await this.formatArrayData(data, 'mentionnedComments');
    data = await this.formatArrayData(data, 'notifications');
    data = await this.formatArrayData(data, 'createdOrganizations');
    data = await this.formatArrayData(data, 'pinnedProjects');
    data = await this.formatArrayData(data, 'pinnedTeams');
    data = await this.formatArrayData(data, 'pinnedTasks');
    data = await this.formatArrayData(data, 'pinnedComments');
    data = await this.formatArrayData(data, 'pinnedOrganizations');
    data = await this.formatArrayData(data, 'activities');

    return data;
  }

  async formatArrayData(data: any, key: string) {
    if (data[key]) {
      data[key] = {
        connect: data[key].map(({ id }: { id: string }) => ({ id }))
      }
    }

    return data;
  }


}
