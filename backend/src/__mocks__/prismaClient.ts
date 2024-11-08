import { mockDeep, mockReset } from "jest-mock-extended";
import { PrismaClient } from "@prisma/client";

const prismaMock = mockDeep<PrismaClient>();

// Reset the mock state before each test to ensure isolation
beforeEach(() => {
  mockReset(prismaMock);
});

export default prismaMock;
