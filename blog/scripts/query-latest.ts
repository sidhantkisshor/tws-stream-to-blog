import { PrismaClient } from '../src/generated/prisma/client.ts';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';
dotenv.config();

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });
  const posts = await prisma.post.findMany({ orderBy: { publishedAt: 'desc' }, take: 1 });
  console.log(JSON.stringify(posts, null, 2));
  await prisma.$disconnect();
}
main();
