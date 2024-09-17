import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  verbose: true,
  collectCoverage: false,
  // collectCoverageFrom: ['<rootDir>/src/**/*.ts'],
  // testMatch: ['<rootDir>/src/__tests__/integration/**/*.test.ts'],
};

export default config;
