import { coverageConfigDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'istanbul',
      reporter: ['clover', 'html', 'json', 'lcov', 'text', 'text-summary'],
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.d.ts',
        'src/db/{extensions,manual-migrations,migrations,seeds}/**',
        'src/db/codes/generate.ts',
        'src/db/dataConnection.ts',
        'src/db/stamps.ts',
        'src/db/utils/transactionWrapper.ts',
        'src/db/utils/yars.ts',
        'src/interfaces/**',
        'src/routes/utils.ts',
        'src/types/**',
        ...coverageConfigDefaults.exclude
      ]
    },
    globals: true,
    reporters: ['verbose'],
    setupFiles: ['./tests/__mocks__/prismaMock.ts']
  }
});
