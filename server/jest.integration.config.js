export default {
  testEnvironment: "node",
  testMatch: ["**/tests/integration/**/*.test.js"],
  collectCoverage: false,
  setupFilesAfterEnv: ["<rootDir>/src/tests/integration/setup/testEnv.js"],
  globalSetup: "<rootDir>/src/tests/integration/setup/globalSetup.js",
  globalTeardown: "<rootDir>/src/tests/integration/setup/globalTeardown.js",
  testTimeout: 30000,
  reporters: [
    "default",
    ["jest-junit", { outputDirectory: "tests/reports", outputName: "junit-integration.xml" }]
  ]
};
