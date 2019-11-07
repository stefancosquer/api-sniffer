module.exports = {
  globals: {
    'ts-jest': {
      tsConfig: 'tsconfig.json'
    }
  },
  setupFiles: ["./jest.setup.js"],
  moduleFileExtensions: ['ts', 'js'],
  transform: {
    '^.+\\.(ts|tsx|js)$': 'ts-jest'
  },
  transformIgnorePatterns: [],
  testMatch: ['**/src/**/*.spec.ts'],
  testEnvironment: 'node',
};
