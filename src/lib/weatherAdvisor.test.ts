// KrushiScan AI - Seven-Day Weather Advisor Unit Tests
import {
  evaluateDrySpellAndCropStress,
  getVidarbhaOfflineForecast,
  VIDARBHA_DISTRICTS_COORDS,
  IMD_DRY_DAY_THRESHOLD_MM,
  DailyForecastDay,
} from './weatherAdvisor';

const assert = {
  strictEqual(actual: any, expected: any, message?: string) {
    if (actual !== expected) {
      throw new Error(message || `Assertion failed: expected ${expected}, got ${actual}`);
    }
  },
  ok(value: any, message?: string) {
    if (!value) {
      throw new Error(message || `Assertion failed: expected truthy value, got ${value}`);
    }
  },
  throws(fn: () => void, expectedError?: RegExp | string, message?: string) {
    let threw = false;
    try {
      fn();
    } catch (err: any) {
      threw = true;
      if (expectedError) {
        const str = err.message || String(err);
        if (typeof expectedError === 'string') {
          if (!str.includes(expectedError)) {
            throw new Error(`Expected error containing "${expectedError}", but got "${str}"`);
          }
        } else if (!expectedError.test(str)) {
          throw new Error(`Expected error matching ${expectedError}, but got "${str}"`);
        }
      }
    }
    if (!threw) {
      throw new Error(message || 'Expected function to throw, but it did not.');
    }
  },
};

console.log('🧪 Starting KrushiScan AI 7-Day Weather-Stress & Dry-Spell Verification Suite...');

// Helper to construct mock 7-day forecast
function createMockDays(rainValues: number[], et0Values: number[] = [4.5, 4.5, 4.5, 4.5, 4.5, 4.5, 4.5]): DailyForecastDay[] {
  return rainValues.map((r, i) => ({
    date: `2026-10-${20 + i}`,
    dayName: { mr: 'वार', hi: 'वार', en: 'Day' },
    tempMax: 33,
    tempMin: 21,
    rainProb: r > 0 ? 30 : 5,
    rainMm: r,
    et0Mm: et0Values[i] || 4.5,
    weatherCode: r > 0 ? 51 : 0,
    condition: r > 0 ? 'पाऊस' : 'कोरडे',
    isDryDay: r < 2.5,
  }));
}

// Test 1: Severe dry spell evaluation (7 consecutive dry days)
{
  const days = createMockDays([0.0, 0.5, 1.0, 0.0, 0.2, 0.0, 0.0]); // All < 2.5mm
  const result = evaluateDrySpellAndCropStress(days, 2.5, 'Yavatmal');

  assert.strictEqual(result.consecutiveDryDays, 7, 'Should calculate exactly 7 consecutive dry days');
  assert.strictEqual(result.drySpellSeverity, 'severe', 'Severity should be marked severe');
  assert.ok(result.totalRainForecastMm <= 2.0, 'Total rain should sum accurately');
  assert.ok(result.waterDeficitMm > 25, 'Water deficit should be positive and significant');
  assert.ok(result.severityHeadline.mr.includes('सावधान'), 'Marathi headline should warn farmer');
  console.log('✅ Test 1 Passed: Severe dry spell (7 days < 2.5mm) correctly evaluated with high moisture deficit.');
}

// Test 2: Threshold configurability (1.0 mm vs 2.5 mm vs 5.0 mm)
{
  // Days with rain: 0.0, 1.5, 0.0, 3.0, 0.0, 1.2, 0.0
  const rain = [0.0, 1.5, 0.0, 3.0, 0.0, 1.2, 0.0];

  // At 1.0mm threshold: dry days are index 0, 2, 4, 6 (individual 1s). Max streak is 1.
  const res1 = evaluateDrySpellAndCropStress(createMockDays(rain), 1.0);
  assert.strictEqual(res1.consecutiveDryDays, 1, 'At 1.0mm threshold, days with 1.5 & 1.2 break dry streak');

  // At 2.5mm threshold: 1.5 and 1.2 are dry days (<2.5mm).
  // Days: Dry(0), Dry(1.5), Dry(0) -> 3 days streak; then 3.0mm (Rain); then Dry(0), Dry(1.2), Dry(0) -> 3 days streak.
  const res2 = evaluateDrySpellAndCropStress(createMockDays(rain), 2.5);
  assert.strictEqual(res2.consecutiveDryDays, 3, 'At 2.5mm standard threshold, max streak is 3 days');

  // At 5.0mm threshold: all days are < 5.0mm, so all 7 days are dry. Streak is 7.
  const res3 = evaluateDrySpellAndCropStress(createMockDays(rain), 5.0);
  assert.strictEqual(res3.consecutiveDryDays, 7, 'At 5.0mm threshold, all days under 5mm count as dry');
  console.log('✅ Test 2 Passed: Configurable threshold dynamically updates dry-day flags and streaks.');
}

// Test 3: Heavy rainfall / water stagnation trigger (excess_rain)
{
  const rainyDays = createMockDays([10.0, 25.0, 30.0, 5.0, 0.0, 0.0, 0.0]); // Total = 70mm
  const result = evaluateDrySpellAndCropStress(rainyDays, 2.5, 'Nagpur');

  assert.strictEqual(result.drySpellSeverity, 'excess_rain', 'Should detect excess_rain severity');
  assert.ok(result.totalRainForecastMm >= 60, 'Accumulated rain >= 60mm');
  assert.ok(result.generalActions.mr.some((a) => a.includes('निचरा')), 'Must recommend drainage furrows');
  console.log('✅ Test 3 Passed: High accumulation (>=60mm) activates waterlogging and drainage alerts.');
}

// Test 4: Crop-specific agronomic recommendations grounded in PDKV guidelines
{
  const days = createMockDays([0, 0, 0, 0, 0, 0, 0]); // Severe drought
  const result = evaluateDrySpellAndCropStress(days, 2.5, 'Akola');

  const cotton = result.cropRisks.find((c) => c.cropId === 'cotton');
  assert.ok(cotton, 'Cotton profile must exist');
  assert.strictEqual(cotton!.stressLevel, 'severe_stress', 'Cotton must flag severe stress under 7-day drought');
  // Check that 2% urea or 1% potassium nitrate is mentioned in PDKV recommendations
  const cottonPdkv = cotton!.pdkvGuidance.mr.join(' ');
  assert.ok(cottonPdkv.includes('युरिया') || cottonPdkv.includes('पोटॅशियम नायट्रेट'), 'Must recommend PDKV foliar rescue');
  assert.ok(cottonPdkv.includes('कोळपणी') || cottonPdkv.includes('डवरणी'), 'Must recommend dust mulching');

  const tur = result.cropRisks.find((c) => c.cropId === 'tur');
  assert.ok(tur, 'Tur profile must exist');
  assert.ok(tur!.impactExplanation.mr.includes('सोटमूळ'), 'Must explain deep taproot drought resilience');
  console.log('✅ Test 4 Passed: Crop-specific PDKV rescue guidance correctly assigned for Vidarbha crops.');
}

// Test 5: Scientific disclaimers and forecast vs historical distinction
{
  const offline = getVidarbhaOfflineForecast('Amravati', 2.5);
  assert.ok(offline.scientificSoilDisclaimer.mr.includes('काळी कसदार'), 'Must mention Vidarbha black vertisol soil context');
  assert.ok(offline.forecastVsHistoricalClarification.mr.includes('भविष्यातील'), 'Must clarify forecast vs historical rainfall');
  assert.strictEqual(offline.dailyForecast.length, 7, 'Must generate exactly 7 daily forecast points');
  assert.strictEqual(offline.isLive, false, 'Offline forecast must declare isLive=false');
  console.log('✅ Test 5 Passed: Scientific disclaimers and offline baseline verification.');
}

// Test 6: Input validation & Error handling
{
  assert.throws(
    () => evaluateDrySpellAndCropStress([]),
    /Valid daily forecast/,
    'Empty forecast array should throw clean error'
  );

  assert.ok(VIDARBHA_DISTRICTS_COORDS['Yavatmal'], 'Yavatmal coordinates present');
  assert.ok(VIDARBHA_DISTRICTS_COORDS['Gondia'], 'Gondia coordinates present');
  assert.strictEqual(Object.keys(VIDARBHA_DISTRICTS_COORDS).length, 11, 'All 11 Vidarbha districts must be registered');
  console.log('✅ Test 6 Passed: Error handling and Vidarbha 11-district coordinate validation.');
}

console.log('🎉 ALL 6 SEVEN-DAY WEATHER ADVISOR UNIT TESTS PASSED ACCURATELY!\n');
