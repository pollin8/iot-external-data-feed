module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["./**/?(*.)+(integration|micro).ts"],
  roots: ["./external-data-connector"],
  testPathIgnorePatterns: ["node_modules", ".devcontainer", "dist"],
  watchPathIgnorePatterns: ["node_modules", ".devcontainer", "dist"],
}
