// apps/server/jest.config.js
module.exports = {
  roots: ['<rootDir>/__tests__'],
  testMatch: ['**/*.test.ts'],
  preset: 'ts-jest',
  testEnvironment: 'node',
  modulePathIgnorePatterns: ['<rootDir>/node_modules/'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  globals: {
    DATABASE_URL:
      process.env.DATABASE_URL ||
      'mysql://root:68562520@localhost:3306/bank_system_test?sslaccept=accept_invalid_certs',
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { useESM: false }],
  },
  // 关键修改：同步 @/* 别名路径（对应 tsconfig 的 paths）
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  verbose: true,
  reporters: [
    'default',
    [
      'jest-html-reporter',
      {
        pageTitle: '测试报告',
        outputPath: 'reports/test-report.html',
      },
    ],
  ],
}
