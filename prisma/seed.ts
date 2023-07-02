import { Prisma, PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();
async function seed() {
  try {
    // Create SUPER_ADMIN role
    const superAdminRole = await prisma.role.create({
      data: {
        name: 'SUPER_ADMIN',
        description: 'Super Admin Role',
      },
    });

    // Create SUPER_ADMIN user
    const password = "Respons11"
    const superAdminUser = await prisma.user.create({
      data: {
        email: 'admin@example.com',
        firstName: 'Admin',
        lastName: 'User',
        passwordHash: password,
        roleId: superAdminRole.id,
      },
    });

    const team = await prisma.team.create({
      data: {
        name: 'Akatsuki',
        description: 'Association de malfaiteurs, bandits, voyous, criminels, ninjas déserteurs de leur village',
      },
    });

    const project = await prisma.project.create({
      data: {
        name: "Capture des bijuu",
        description: "L'Akatsuki est une organisation criminelle composée de ninjas déserteurs de leur village, spécialisée dans les missions d'assassinat et de capture de bijū.",
        teams: {
          connect: {
            id: team.id,
          },
        },
      },
    });


    // add tasks to project
    const tasks = await prisma.task.createMany({
      data: [
        {
          name: 'Capture du démon à une queue',
          description: 'Le démon à une queue, aussi appelé Ichibi, est un démon de type tanuki. Il est scellé dans le corps de Gaara, le Kazekage du village caché du Sable.',
          projectId: project.id,
          authorId: superAdminUser.id,
        },
      ],
    });


    console.log('Seed data created successfully.');
  } catch (error) {
    console.error('Error seeding data:', error);
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
