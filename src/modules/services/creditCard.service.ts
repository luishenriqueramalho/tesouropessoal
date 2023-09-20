import { prisma } from "../../config/prisma";
import { CreateCreditCardInput } from "../schemas/creditCard.schema";

export function getCreditCards() {
  return prisma.creditCard.findMany({
    orderBy: [
      {
        id: "asc",
      },
    ],
  });
}

export function createCreditCard(data: CreateCreditCardInput) {
  return prisma.creditCard.create({ data });
}

export function deleteCreditCard(id: string) {
  return prisma.creditCard.delete({
    where: {
      id: id,
    },
  });
}
