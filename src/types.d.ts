declare global {
  interface Window {
    prisma: () => string;
  }
}
