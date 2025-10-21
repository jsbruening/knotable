/** @type {import('jest').Config} */
const config = {
  // Test environment
  testEnvironment: "jsdom",

  // Setup files
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],

  // FIXED: moduleNameMapper (not moduleNameMapping)
  moduleNameMapper: {
    "^~/(.*)$": "<rootDir>/src/$1",
    "^@/(.*)$": "<rootDir>/src/$1",
  },

  // Transform files
  transform: {
    "^.+\\.(ts|tsx)$": [
      "ts-jest",
      {
        tsconfig: {
          jsx: "react-jsx",
        },
      },
    ],
  },

  // File extensions
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],

  // Test patterns
  testMatch: [
    "<rootDir>/src/**/__tests__/**/*.(ts|tsx|js)",
    "<rootDir>/src/**/*.(test|spec).(ts|tsx|js)",
  ],

  // Coverage configuration
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/*.stories.{ts,tsx}",
    "!src/**/__tests__/**",
    "!src/**/node_modules/**",
  ],

  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },

  // Ignore patterns
  testPathIgnorePatterns: ["<rootDir>/.next/", "<rootDir>/node_modules/"],

  // Module directories
  moduleDirectories: ["node_modules", "<rootDir>/"],

  // Extensions to resolve
  extensionsToTreatAsEsm: [".ts", ".tsx"],

  // Globals
  globals: {
    "ts-jest": {
      useESM: true,
    },
  },
};

export default config;
