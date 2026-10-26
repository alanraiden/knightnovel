import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  // Only run files under __tests__ — avoids accidentally picking up Next.js pages.
  testMatch: ["**/src/__tests__/**/*.test.ts"],
  // Silence ts-jest diagnostics for the test files (they use `any` intentionally).
  globals: {
    "ts-jest": {
      diagnostics: false,
    },
  },
};

export default config;
