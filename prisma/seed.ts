import { Prisma, PrismaClient, Role } from "@prisma/client";
import { faker } from "@faker-js/faker";

const ORGANIZATION_NAME = "My Organization";
const ROLES = [
  {
    name: "ADMIN",
    description: "This is the admin role, it most of the permissions. There is only one role above this one, the super admin role."
  },
  {
    name: "USER",
    description: "This is the user role, it has the permissions necessary to use the application."
  },
  {
    name: "SUPER_ADMIN",
    description: "This is the super admin role, it has all the permissions."
  },
  {
    name: "GUEST",
    description: "This is the guest role, it has the permissions necessary to visit the application."
  }
]
const USERS = [
  {
    email: "user@mail.com",
    role: "USER",
    firstName: "user",
    lastName: "user",
    username: "user",
  },
  {
    email: "admin@mail.com",
    role: "ADMIN",
    firstName: "admin",
    lastName: "admin",
    username: "admin",
  },
  {
    email: "superadmin@mail.com",
    role: "SUPER_ADMIN",
    firstName: "superadmin",
    lastName: "superadmin",
    username: "superadmin",
  },
  {
    email: "guest@mail.com",
    role: "GUEST",
    firstName: "guest",
    lastName: "guest",
    username: "guest",
  },
];

const prisma = new PrismaClient();
async function seed() {
  try {

    // delete all data
    await prisma.user.deleteMany()
    await prisma.team.deleteMany()
    await prisma.organization.deleteMany()
    await prisma.role.deleteMany()

    await seedRoles()
    await seedOrganization()
    await seedUsers()
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function seedRoles() {
  console.log('🔑 Seeding roles...');

  const createdRoles = await prisma.role.createMany({
    data: ROLES
  })

  console.log('🔑 Seeded roles:', createdRoles);
}

async function seedOrganization() {
  console.log('🌐 Seeding organization...')
  const organization = await prisma.organization.create({
    data: {
      name: ORGANIZATION_NAME
    }
  })

  console.log('🌐 Seeded organization:', organization.name)
}

async function seedUsers() {
  console.log('👤 Seeding users...')
  const users = USERS.map(async (user) => {
    return await prisma.user.create({
      data: {
        ...user,
        passwordHash: faker.internet.password(),
        role: {
          connect: {
            name: user.role
          }
        },
        teams: {
          create: {
            name: faker.company.name(),
            description: faker.company.catchPhraseDescriptor(),
            organization: {
              connect: {
                name: ORGANIZATION_NAME
              }
            },
          }
        },
      }
    })
  })

  const createdUsers = await Promise.all(users)
  console.log('👤 Seeded users:', createdUsers.length)
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
