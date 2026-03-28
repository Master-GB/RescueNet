export default {
  testEnvironment: "node",
  testMatch: ["**/tests/integration/**/*.test.js"],
  collectCoverage: false,
  reporters: [
    "default",
    ["jest-junit", { outputDirectory: "tests/reports", outputName: "junit-integration.xml" }]
  ]
};
