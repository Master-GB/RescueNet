export default {
  testEnvironment: "node",
  rootDir: ".",
  testMatch: ["**/tests/integration/**/*.test.js"],
  maxWorkers: 1,
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1"
  },
  moduleDirectories: ["node_modules", "src"],
  setupFiles: ["<rootDir>/src/tests/integration/setup/globalMocks.js"],
  setupFilesAfterEnv: ["<rootDir>/src/tests/integration/setup/testEnv.js"],
  globalSetup: "<rootDir>/src/tests/integration/setup/globalSetup.js",
  globalTeardown: "<rootDir>/src/tests/integration/setup/globalTeardown.js",
  testTimeout: 30000,
  reporters: [
    "default",
    ["jest-junit", { outputDirectory: "tests/reports", outputName: "junit-integration.xml" }]
  ]
};
