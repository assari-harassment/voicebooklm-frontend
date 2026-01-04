/** @type {import('jest').Config} */
module.exports = {
  // ts-jest を使用（Expo SDK 54 互換）
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts?(x)'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    // Expo モジュールをモック
    '^expo$': '<rootDir>/__mocks__/expo.js',
    '^expo-secure-store$': '<rootDir>/__mocks__/expo-secure-store.js',
    '^expo-router$': '<rootDir>/__mocks__/expo-router.js',
    '^expo-file-system$': '<rootDir>/__mocks__/expo-file-system.js',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: {
          jsx: 'react',
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
        },
      },
    ],
  },
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts', '!src/api/generated/**'],
  // カバレッジ閾値（テスト拡充に伴い段階的に上げる）
  coverageThreshold: {
    global: {
      branches: 10,
      functions: 10,
      lines: 10,
      statements: 10,
    },
  },
};
