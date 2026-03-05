import { PrismaClient } from '../src/generated/prisma/client.ts';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';
dotenv.config();

const NEW_SECTION = {
  heading: "Reader Insight: Tighten the Spread to 1340/1280 for 3.46x R:R",
  body: "A reader pointed out that tightening the spread to 1340/1280 improves the reward-to-risk ratio from 1.7x to 3.46x while requiring only a 2% move for max profit — a valid optimization if you can get fills at the 1340 strike. The logic is sound: a narrower spread with strikes closer to spot reduces the net debit and pushes the breakeven higher, which dramatically improves the payout math.\n\nHowever, liquidity is the key risk. The 1340 strike may have wider bid-ask spreads and lower open interest compared to the round-number 1300 strike. Before entering, verify OI and bid-ask width at the 1340 strike — if the spread is more than ₹2-3 wide, slippage could eat into the theoretical edge. If you can get clean fills, this is a strictly superior structure to the 1300/1200 spread we analyzed above."
};

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  // Get the latest post
  const post = await prisma.post.findFirst({
    orderBy: { publishedAt: 'desc' },
    select: { id: true, videoId: true, slug: true, title: true, sections: true }
  });

  if (!post) {
    console.error('No posts found');
    process.exit(1);
  }

  console.log(`Updating post: "${post.title}" (${post.slug})`);

  const sections = post.sections as Array<{ heading: string; body: string; chartRef?: string }>;

  // Insert the new section before the P&L table section (last section)
  // Current order: Setup, Vol Premium, Monte Carlo, ATM 1300, Only Positive-EV, Theta Trap, Earnings, P&L
  // Insert after "The Only Positive-EV Trade" (index 4) so it flows naturally
  const insertIndex = 5; // After "The Only Positive-EV Trade on the Board"
  sections.splice(insertIndex, 0, NEW_SECTION);

  await prisma.post.update({
    where: { id: post.id },
    data: { sections: sections }
  });

  console.log(`Added section "${NEW_SECTION.heading}" at position ${insertIndex + 1}`);
  console.log(`Post now has ${sections.length} sections`);

  await prisma.$disconnect();
}
main();
