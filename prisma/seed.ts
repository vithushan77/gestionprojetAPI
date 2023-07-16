import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

async function seed() {
  try {

    const roleNames = ["ADMIN", "USER", "SUPER_ADMIN", "GUEST"];
    const roles = await Promise.all(
      roleNames.map((name) =>
        prisma.role.create({
          data: {
            name,
          },
        })
      )
    );

    // Create organizations
    const organizationNames = ["Organization A", "Organization B", "Organization C"];
    const organizationPlans = ["FREE", "PREMIUM", "ENTERPRISE"];
    const organizationTypes = ["PERSONAL", "BUSINESS", "ENTERPRISE", "EDUCATION"]
    const organizations = await Promise.all(
      organizationNames.map((name) =>
        prisma.organization.create({
          data: {
            name,
            plan: organizationPlans[Math.floor(Math.random() * organizationPlans.length)],
            type: organizationTypes[Math.floor(Math.random() * organizationTypes.length)],
          },
        })
      )
    );


    // Create teams
    const teams = await Promise.all(
      Array.from({ length: 100 })
        .map((name) => {

          const randomOrganizationId = organizations[Math.floor(Math.random() * organizations.length)].id;

          return prisma.team.create({
            data: {
              name: faker.company.name(),
              organization: {
                connect: { id: randomOrganizationId },
              },
            },
          })
        }
        )
    );

    // Create users
    let i = 0;
    const users = await Promise.all(
      Array.from({ length: 1000 }).map(() => {

        const firstName = faker.person.firstName();
        const lastName = faker.person.lastName();
        const randomRoleId = roles[Math.floor(Math.random() * roles.length)].id;
        const randomTeamId = teams[Math.floor(Math.random() * teams.length)].id;

        return prisma.user.create({
          data: {
            firstName,
            lastName,
            email: faker.internet.email({ firstName, lastName }),
            username: `faker.internet.userName()-${i++}`,
            passwordHash: faker.internet.password(),
            role: {
              connect: {
                id: randomRoleId,
              },
            },
            teams: {
              connect: {
                id: randomTeamId,
              },
            },
          },
        })
      }
      )
    );

    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const randomRoleId = roles[Math.floor(Math.random() * roles.length)].id;
    const randomTeamId = teams[Math.floor(Math.random() * teams.length)].id;

    await prisma.user.create({
      data: {
        firstName,
        lastName,
        email: "abdoudu78130@gmail.com",
        username: "adia-dev",
        passwordHash: faker.internet.password(),
        role: {
          connect: {
            id: randomRoleId,
          },
        },
        teams: {
          connect: {
            id: randomTeamId,
          },
        },
        firebaseId: "fisyuEg0EHUzCIHBqHyoj2Ad0Eu2",
        avatar: "https://www.nautiljon.com/images/perso/00/46/zora_ideale_20264.webp"
      },
    })

    await prisma.user.create({
      data: {
        firstName,
        lastName,
        email: "admin@mail.com",
        username: "admin",
        passwordHash: faker.internet.password(),
        role: {
          connect: {
            id: await prisma.role.findFirst({
              where: {
                name: "SUPER_ADMIN"
              }
            }).then(role => role.id)
          },
        },
        teams: {
          connect: {
            id: randomTeamId,
          },
        },
        firebaseId: "tB8sHle3yGfSfDdjsqRMSMcVwLp1",
        avatar: "https://www.nautiljon.com/images/perso/00/46/zora_ideale_20264.webp"
      },
    })

    // Create projects
    const projects = await Promise.all(
      Array.from({ length: 100 }).map((name) => {
        const randomOrganizationId = organizations[Math.floor(Math.random() * organizations.length)].id;
        return prisma.project.create({
          data: {
            name: faker.company.name(),
            organization: {
              connect: { id: randomOrganizationId },
            },
          },
        })
      }
      )
    );

    // Create tasks Statuses
    const taskStatusNames = ["TODO", "IN_PROGRESS", "DONE"];
    const taskStatuses = await Promise.all(
      taskStatusNames.map((name) =>
        prisma.taskStatus.create({
          data: {
            name,
            color: faker.internet.color(),
          },
        })
      )
    );

    // Create tasks
    const tasks = await Promise.all(
      Array.from({ length: 200 }).map(() => {

        const randomTeamId = teams[Math.floor(Math.random() * teams.length)].id;
        const randomProjectId = projects[Math.floor(Math.random() * projects.length)].id;
        const randomTaskStatusId = taskStatuses[Math.floor(Math.random() * taskStatuses.length)].id;
        const randomDueDate = faker.date.future();

        return prisma.task.create({
          data: {
            name: faker.lorem.word(),
            description: faker.lorem.sentence(),
            dueDate: randomDueDate,
            project: {
              connect: { id: randomProjectId },
            },
            team: {
              connect: { id: randomTeamId },
            },
            status: {
              connect: { id: randomTaskStatusId },
            }
          },
        })
      }
      )
    );

    console.log("Data seeding completed!");
  } catch (error) {
    console.error("Error seeding data:", error);
  } finally {
    await prisma.$disconnect();
  }
}


seed()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
