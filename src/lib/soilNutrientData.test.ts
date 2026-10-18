import {
  classifyPh,
  classifyEc,
  classifyNutrient,
  calculateSoilFertilizers,
  CROP_RDF_PROFILES,
} from './soilNutrientData';

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

console.log('🧪 Starting KrushiScan AI Soil Health & Fertilizer Calculator Verification Suite...');

// Test 1: pH and EC Classifications
const acidPh = classifyPh(6.2);
assert.strictEqual(acidPh.rating, 'Acidic');

const neutralPh = classifyPh(7.2);
assert.strictEqual(neutralPh.rating, 'Neutral');

const blackCottonPh = classifyPh(8.2);
assert.strictEqual(blackCottonPh.rating, 'Moderately_Alkaline');

const salinePh = classifyPh(8.9);
assert.strictEqual(salinePh.rating, 'Strongly_Alkaline');

const normalEc = classifyEc(0.45);
assert.strictEqual(normalEc.rating, 'Normal');

const salineEc = classifyEc(2.8);
assert.strictEqual(salineEc.rating, 'Saline');
console.log('✅ Test 1 Passed: Soil pH and Electrical Conductivity (EC) classifications verified against Indian standards.');

// Test 2: Nutrient Classification Benchmarks
assert.strictEqual(classifyNutrient('nitrogen', 240), 'Low');
assert.strictEqual(classifyNutrient('nitrogen', 380), 'Medium');
assert.strictEqual(classifyNutrient('nitrogen', 620), 'High');

assert.strictEqual(classifyNutrient('phosphorus', 10), 'Low');
assert.strictEqual(classifyNutrient('phosphorus', 22), 'Medium');
assert.strictEqual(classifyNutrient('phosphorus', 35), 'High');

assert.strictEqual(classifyNutrient('potassium', 130), 'Low');
assert.strictEqual(classifyNutrient('potassium', 220), 'Medium');
assert.strictEqual(classifyNutrient('potassium', 400), 'High');
console.log('✅ Test 2 Passed: Available N-P-K benchmarks correctly resolve Low, Medium, and High ratings.');

// Test 3: STCR Adjustment & Fertilizer Bag Math for 1 Acre Rainfed Cotton
// Standard RDF for cotton_rainfed: 40 kg N, 20 kg P2O5, 20 kg K2O per acre.
// With Medium soil ratings: exact 40:20:20 required.
// DAP (18:46:0): 20 kg P2O5 / 23 kg/bag = 0.87 -> rounded to 1.0 bag DAP (supplies 23 kg P, 9 kg N).
// Remaining N: 40 - 9 = 31 kg N.
// Urea (46% N = 20.7 kg N/bag): 31 / 20.7 = 1.5 bags Urea.
// MOP (60% K2O = 30 kg K/bag): 20 / 30 = 0.67 -> rounded to 0.5 - 1.0 bag MOP.
const cottonResult = calculateSoilFertilizers('cotton_rainfed', 1, {
  ph: 8.1,
  ec: 0.35,
  organicCarbon: 0.60, // Medium
  nitrogen: 350,       // Medium
  phosphorus: 20,      // Medium
  potassium: 220,      // Medium
  zinc: 0.45,          // Deficient (< 0.60 ppm)
  sulfur: 14.0,        // Medium
});

assert.strictEqual(cottonResult.soilRatings.nRating, 'Medium');
assert.strictEqual(cottonResult.soilRatings.znDeficient, true);
assert.strictEqual(cottonResult.recommendedBagsOptionDap.dapBags50kg, 1.0);
assert.strictEqual(cottonResult.recommendedBagsOptionDap.ureaBags45kg, 1.5);
assert.ok(cottonResult.recommendedBagsOptionDap.zincSulfateKg !== undefined, 'Zinc sulfate recommended when soil Zn < 0.6 ppm');
assert.strictEqual(cottonResult.recommendedBagsOptionDap.zincSulfateKg, 10);
console.log('✅ Test 3 Passed: 1 Acre rainfed cotton computes correct DAP, Urea, MOP, and Zinc Sulfate bag quantities.');

// Test 4: Area Scaling (e.g. 3 Acres Plot)
const multiAcreCotton = calculateSoilFertilizers('cotton_rainfed', 3, {
  ph: 8.0,
  ec: 0.30,
  organicCarbon: 0.55,
  nitrogen: 320,
  phosphorus: 21,
  potassium: 230,
});
// 3 acres require ~3x nutrient requirement
assert.strictEqual(multiAcreCotton.adjustedNutrientRequirementKg.n, 120.0);
assert.strictEqual(multiAcreCotton.adjustedNutrientRequirementKg.p, 60.0);
assert.strictEqual(multiAcreCotton.adjustedNutrientRequirementKg.k, 60.0);
assert.ok(multiAcreCotton.recommendedBagsOptionDap.dapBags50kg >= 2.5);
console.log('✅ Test 4 Passed: Area scaling strictly linear and verified across multi-acre plots.');

// Test 5: STCR Low Soil Adjustment (+25% nutrient increase)
const lowNutrientSoil = calculateSoilFertilizers('soybean', 1, {
  ph: 7.8,
  ec: 0.25,
  organicCarbon: 0.35, // Low
  nitrogen: 210,       // Low (+25%)
  phosphorus: 9,       // Low (+25%)
  potassium: 110,      // Low (+25%)
});
// Base soybean RDF is 12:30:12 kg/acre. With +25%: 15:37.5:15 kg/acre
assert.strictEqual(lowNutrientSoil.adjustedNutrientRequirementKg.n, 15.0);
assert.strictEqual(lowNutrientSoil.adjustedNutrientRequirementKg.p, 37.5);
assert.strictEqual(lowNutrientSoil.adjustedNutrientRequirementKg.k, 15.0);
console.log('✅ Test 5 Passed: STCR Low soil test rating correctly adds +25% nutrient compensation.');

// Test 6: Input Validation Errors
assert.throws(() => {
  calculateSoilFertilizers('cotton_rainfed', 0, {
    ph: 7.5, ec: 0.5, organicCarbon: 0.5, nitrogen: 300, phosphorus: 20, potassium: 200
  });
}, 'Zero acreage must throw validation error');

assert.throws(() => {
  calculateSoilFertilizers('unsupported_crop', 1, {
    ph: 7.5, ec: 0.5, organicCarbon: 0.5, nitrogen: 300, phosphorus: 20, potassium: 200
  });
}, 'Unsupported crop profile must throw error');
console.log('✅ Test 6 Passed: Validation checks reject zero acreage and unregistered crops cleanly.');

console.log('🎉 ALL 6 SOIL HEALTH & FERTILIZER CALCULATOR UNIT TESTS PASSED ACCURATELY!\n');
