import { Prisma, PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();
async function seed() {
  try {

    await prisma.user.deleteMany();
    await prisma.role.deleteMany();

    const rolesToCreate = ["ADMIN", "USER", "SUPER_ADMIN"];
    const createdRoles = rolesToCreate.map(async (role) => {
      return await prisma.role.create({
        data: {
          name: role,
        },
      });
    });

    console.log("Created roles:", createdRoles);

    const usersToCreate: Prisma.UserCreateInput[] = [...Array(10)].map(() => {
      const firstName = faker.person.firstName();
      const lastName = faker.person.firstName();
      return {
        firstName,
        lastName,
        email: faker.internet.email({ firstName, lastName }),
        passwordHash: faker.internet.password({ length: 16 }),
        role: {
          connect: {
            name: "USER",
          },
        },
      };
    });

    usersToCreate.forEach(async (data) => {
      await prisma.user.create({
        data,
      });
    });
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
