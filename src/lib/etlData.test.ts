import {
  VERIFIED_ETL_RULES,
  evaluatePestScouting,
  getRulesByCrop,
} from './etlData';

const assert = {
  strictEqual(actual: any, expected: any, message?: string) {
    if (actual !== expected) {
      throw new Error(`Assertion Failed: ${actual} !== ${expected}. ${message || ''}`);
    }
  },
  ok(val: any, message?: string) {
    if (!val) {
      throw new Error(`Assertion Failed: Expected truthy value. ${message || ''}`);
    }
  },
  throws(fn: () => void, message?: string) {
    let threw = false;
    try {
      fn();
    } catch {
      threw = true;
    }
    if (!threw) {
      throw new Error(`Assertion Failed: Expected function to throw. ${message || ''}`);
    }
  },
};

console.log('🧪 Starting KrushiScan AI Pest Scouting & ETL Verification Suite...');

// Test 1: Registry Completeness across 5 core crops
const crops = ['cotton', 'soybean', 'tur', 'chana', 'citrus'];
for (const crop of crops) {
  const rules = getRulesByCrop(crop);
  assert.ok(rules.length > 0, `Crop '${crop}' must have at least one verified ETL rule.`);
}
console.log('✅ Test 1 Passed: Verified ETL rules exist across all 5 Vidarbha focal crops.');

// Test 2: Cotton Pink Bollworm Threshold Boundary
// Threshold is 8.0 moths/trap/day
const subThreshold = evaluatePestScouting('cotton-pink-bollworm-trap', 3, 21); // 21 / 3 = 7.0 (87.5% -> APPROACHING_ETL)
assert.strictEqual(subThreshold.calculatedAverage, 7.0);
assert.strictEqual(subThreshold.status, 'APPROACHING_ETL');

const aboveThreshold = evaluatePestScouting('cotton-pink-bollworm-trap', 3, 24); // 24 / 3 = 8.0 (100% -> ABOVE_ETL)
assert.strictEqual(aboveThreshold.calculatedAverage, 8.0);
assert.strictEqual(aboveThreshold.status, 'ABOVE_ETL');

const safePheromone = evaluatePestScouting('cotton-pink-bollworm-trap', 3, 6); // 6 / 3 = 2.0 (25% -> BELOW_ETL)
assert.strictEqual(safePheromone.status, 'BELOW_ETL');
console.log('✅ Test 2 Passed: Cotton Pink Bollworm pheromone boundary conditions verified strictly at 8.0 cutoff.');

// Test 3: Cotton Jassid Nymph Density Calculation
// Threshold is 2.0 nymphs/leaf across 20 plants
const jassidsSafe = evaluatePestScouting('cotton-jassids', 20, 20); // 1.0 nymph/leaf -> BELOW_ETL
assert.strictEqual(jassidsSafe.status, 'BELOW_ETL');
assert.strictEqual(jassidsSafe.isSufficientSample, true);

const jassidsCritical = evaluatePestScouting('cotton-jassids', 20, 50); // 2.5 nymphs/leaf -> ABOVE_ETL
assert.strictEqual(jassidsCritical.status, 'ABOVE_ETL');
console.log('✅ Test 3 Passed: Jassid nymph evaluation accurately computes leaf averages with sample verification.');

// Test 4: Sample Size Verification & Warning Flag
const insufficientSample = evaluatePestScouting('cotton-jassids', 5, 15); // only 5 plants inspected
assert.strictEqual(insufficientSample.isSufficientSample, false, 'Inspecting 5 plants should flag insufficient sample size');
console.log('✅ Test 4 Passed: Insufficient sample size correctly flagged when below scientific minimum (20 plants).');

// Test 5: Validation of Invalid Numbers
assert.throws(() => {
  evaluatePestScouting('cotton-jassids', 0, 10);
}, 'Zero sample count must throw validation error');

assert.throws(() => {
  evaluatePestScouting('non-existent-rule', 20, 10);
}, 'Unregistered rule must throw validation error');
console.log('✅ Test 5 Passed: Zero sample counts and unknown rule IDs cleanly throw validation errors.');

// Test 6: Multilingual Explanation & Source Attribution
const turResult = evaluatePestScouting('tur-helicoverpa', 20, 25);
assert.ok(turResult.explanation.mr.includes(`अधिकृत ईटीएल मर्यादा: ${turResult.rule.etlThreshold}`), 'Marathi explanation must include threshold value');
assert.ok(turResult.rule.sourceAuthority.includes('PDKV'), 'Must cite PDKV authority');
assert.ok(turResult.rule.revisionDate.length >= 4, 'Must have active revision year');
console.log('✅ Test 6 Passed: Multilingual explanations include transparent calculations and institutional citations.');

console.log('🎉 ALL 6 PEST SCOUTING & ETL UNIT TESTS PASSED ACCURATELY!\n');
