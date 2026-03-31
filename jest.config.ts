import type { Config } from '@jest/types'

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/src/**/*.(spec|test).[jt]s?(x)', '**/__tests__/**/*.(spec|test).[jt]s?(x)'],
  modulePathIgnorePatterns: ['<rootDir>/lib/'],
  moduleNameMapper: {
    '^@qubitcoin/sdk$': '<rootDir>/vendor/@qubitcoin/sdk/dist/index.cjs.js',
  },
}

export default config
