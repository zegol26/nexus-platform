import { prisma } from "../lib/db/prisma";

async function main() {
  const count = await prisma.nihongoLesson.count();
  const lessons = await prisma.nihongoLesson.findMany({ take: 5 });

  console.log("NihongoLesson count:", count);
  console.log(lessons);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
  
