# ProPublica API Integration Test Plan

This document outlines the steps to test the ProPublica Non-Profit Explorer API integration and debug issues with financial data retrieval.

## 1. Create Test Files

To test the API, you need two temporary files: a test script and a TypeScript configuration file.

### `test-propublica.ts`

This script will call the `fetchNonProfitData` function and log the results. For debugging, it can be modified to call the `inspectLatestFiling` function to view the raw API response.

```typescript
// /home/user/studio/test-propublica.ts
import { fetchNonProfitData, inspectLatestFiling } from './src/lib/propublica/api';

async function runTest() {
  const ein = '22-3862361'; // Use a known EIN for testing
  console.log(`Testing ProPublica API with EIN "${ein}"...`);
  const data = await fetchNonProfitData(ein);
  
  if (data) {
    console.log('Successfully fetched data:');
    console.log(JSON.stringify(data, null, 2));
  } else {
    console.error('Failed to fetch data.');
  }
}

async function inspect() {
  const ein = '22-3862361';
  console.log(`Inspecting latest filing for EIN "${ein}"...`);
  await inspectLatestFiling(ein);
}

// To run the main test, use this line:
runTest();

// To inspect the raw API response, comment out runTest() and uncomment inspect():
// inspect();
```

### `tsconfig.test.json`

This file configures the TypeScript compiler to run the test script with the correct module settings.

```json
{
  "compilerOptions": {
    "module": "CommonJS",
    "target": "ES2017",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "preserve",
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["test-propublica.ts", "src/**/*.ts"],
  "exclude": ["node_modules"]
}
```

## 2. Install `ts-node`

If you don't have `ts-node` installed, add it as a dev dependency:

```bash
npm install --save-dev ts-node
```

## 3. Run the Test

Execute the test script using `ts-node`, pointing to the custom `tsconfig.json`:

```bash
npx ts-node --project tsconfig.test.json test-propublica.ts
```

## 4. Clean Up

After testing is complete, remove the temporary files:

```bash
rm test-propublica.ts tsconfig.test.json
```
