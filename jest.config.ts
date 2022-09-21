import type { Config } from "@jest/types";
// Sync object
const config: Config.InitialOptions = {
  verbose: true,
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  testPathIgnorePatterns: ["node_modules", "dist", "build"],
  setupFilesAfterEnv: ["./jest.setup.ts"],
};
export default config;
