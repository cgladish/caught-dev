declare global {
  interface Window {
    prisma: () => PrismaClient;
  }
}
