export default {
  testEnvironment: "node",
  testMatch: ["**/tests/unit/**/*.test.js"],
  collectCoverage: true,
  coverageDirectory: "tests/coverage",
  reporters: [
    "default",
    ["jest-junit", { outputDirectory: "tests/reports", outputName: "junit.xml" }]
  ]
};
