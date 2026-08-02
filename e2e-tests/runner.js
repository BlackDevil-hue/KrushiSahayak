#!/usr/bin/env node

/**
 * KrishiSahayak Standalone E2E Test Suite Runner
 *
 * Command Line Usage:
 *   node e2e-tests/runner.js [--tier=1|2|3|4|all] [--baseUrl=http://localhost:5000/api]
 */

const { runTier1Tests } = require('./suites/tier1_features.test');
const { runTier2Tests } = require('./suites/tier2_boundaries.test');
const { runTier3Tests } = require('./suites/tier3_combinations.test');
const { runTier4Tests } = require('./suites/tier4_workloads.test');

// Parse CLI flags
const args = process.argv.slice(2);
let selectedTier = 'all';
let baseUrl = process.env.BASE_URL || null;

for (const arg of args) {
  if (arg.startsWith('--tier=')) {
    selectedTier = arg.split('=')[1].toLowerCase();
  }
  if (arg.startsWith('--baseUrl=')) {
    baseUrl = arg.split('=')[1];
  }
}

if (baseUrl) {
  process.env.BASE_URL = baseUrl;
}

async function runRunner() {
  const startTime = Date.now();

  console.log('====================================================');
  console.log('🌾 KrishiSahayak E2E Test Suite Runner');
  console.log('====================================================');
  console.log(`Execution Mode: ${baseUrl ? `Live HTTP (${baseUrl})` : 'Offline Mock Server'}`);
  console.log(`Selected Tier : ${selectedTier}`);
  console.log('----------------------------------------------------');

  let totalRun = 0;
  let totalPassed = 0;
  let totalFailed = 0;
  const failures = [];

  const suitesToRun = [];
  if (selectedTier === '1' || selectedTier === 'all') {
    suitesToRun.push({ name: 'Tier 1: Feature Coverage', fn: runTier1Tests });
  }
  if (selectedTier === '2' || selectedTier === 'all') {
    suitesToRun.push({ name: 'Tier 2: Boundary & Corner Cases', fn: runTier2Tests });
  }
  if (selectedTier === '3' || selectedTier === 'all') {
    suitesToRun.push({ name: 'Tier 3: Cross-Feature Combinations', fn: runTier3Tests });
  }
  if (selectedTier === '4' || selectedTier === 'all') {
    suitesToRun.push({ name: 'Tier 4: Real-World Application Scenarios', fn: runTier4Tests });
  }

  for (const suite of suitesToRun) {
    console.log(`\n▶ Running ${suite.name}...`);
    const suiteStartTime = Date.now();
    const result = await suite.fn();
    const duration = Date.now() - suiteStartTime;

    const runCount = result.testsRun.length;
    const passCount = result.testsPassed.length;
    const failCount = result.testsFailed.length;

    totalRun += runCount;
    totalPassed += passCount;
    totalFailed += failCount;

    for (const testName of result.testsPassed) {
      console.log(`  ✓ ${testName}`);
    }

    if (failCount > 0) {
      for (const f of result.testsFailed) {
        console.log(`  ✗ ${f.name}`);
        console.log(`    Error: ${f.error}`);
        failures.push({ suite: suite.name, test: f.name, error: f.error, stack: f.stack });
      }
    }

    console.log(`  Summary for ${suite.name}: ${passCount}/${runCount} passed (${duration}ms)`);
  }

  const totalDuration = Date.now() - startTime;

  console.log('\n====================================================');
  console.log('📊 FINAL TEST EXECUTION SUMMARY');
  console.log('====================================================');
  console.log(`Total Test Cases Executed : ${totalRun}`);
  console.log(`Passed Assertions         : ${totalPassed} ✓`);
  console.log(`Failed Assertions         : ${totalFailed} ${totalFailed === 0 ? '✓' : '✗'}`);
  console.log(`Total Execution Time      : ${totalDuration}ms`);
  console.log('====================================================');

  if (totalFailed > 0) {
    console.error('\n❌ FAILURE DETAILED BREAKDOWN:');
    for (const f of failures) {
      console.error(`\n[${f.suite}] ${f.test}`);
      console.error(`Message: ${f.error}`);
    }
    process.exit(1);
  } else {
    console.log('\n✨ ALL E2E TEST SUITES PASSED SUCCESSFULLY WITH ZERO ERRORS!');
    process.exit(0);
  }
}

runRunner().catch(err => {
  console.error('Fatal Runner Exception:', err);
  process.exit(1);
});
