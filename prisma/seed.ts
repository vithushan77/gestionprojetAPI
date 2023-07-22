import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

async function seed() {
  try {

    const roleNames = ["ADMIN", "USER"];
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



    // Create users
    let i = 0;
    const users = await Promise.all(
      Array.from({ length: 1000 }).map(() => {

        const firstName = faker.person.firstName();
        const lastName = faker.person.lastName();
        const randomRoleId = roles[Math.floor(Math.random() * roles.length)].id;
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
          },
        })
      }
      )
    );

    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const randomRoleId = roles[Math.floor(Math.random() * roles.length)].id;

    await prisma.user.create({
      data: {
        firstName,
        lastName,
        email: "vithushan@gmail.com",
        username: "vithushan",
        passwordHash: faker.internet.password(),
        role: {
          connect: {
            id: randomRoleId,
          },
        },
      },
    })


    // Create tasks Statuses
   /* const taskStatusNames = ["TODO", "IN_PROGRESS", "DONE"];
    const taskStatuses = await Promise.all(
      taskStatusNames.map((name) =>
        prisma.taskStatus.create({
          data: {
            name,
            color: faker.internet.color(),
          },
        })
      )
    );*/


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
