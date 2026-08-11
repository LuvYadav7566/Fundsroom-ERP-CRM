import { prisma } from '../config/db';

export async function generateChallanNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `FR-CH-${year}-`;

  const latestChallan = await prisma.challan.findFirst({
    where: {
      challanNumber: {
        startsWith: prefix,
      },
    },
    orderBy: {
      challanNumber: 'desc',
    },
    select: {
      challanNumber: true,
    },
  });

  if (!latestChallan) {
    return `${prefix}0001`;
  }

  const lastSeq = latestChallan.challanNumber.replace(prefix, '');
  const nextSeqNum = parseInt(lastSeq, 10) + 1;
  const nextSeqStr = nextSeqNum.toString().padStart(4, '0');

  return `${prefix}${nextSeqStr}`;
}
