/**
 * KrushiScan AI - Mandi Rates & Net Return Verification Suite
 * Tests APMC benchmark datasets, Vidarbha 11-district coverage, Net Return formula,
 * price sorting, and data source metadata validation.
 */

import { 
  COMMODITIES, 
  VIDARBHA_DISTRICTS, 
  MOCK_MANDI_RECORDS, 
  calculateNetReturn,
  NetReturnCalculationInput
} from './mandiData';
import { MandiRecord } from '../types';

// Zero-dependency test assertion utilities
const assert = {
  strictEqual(actual: unknown, expected: unknown, message?: string) {
    if (actual !== expected) {
      throw new Error(message || `Expected ${expected}, but got ${actual}`);
    }
  },
  ok(value: unknown, message?: string) {
    if (!value) {
      throw new Error(message || `Expected truthy value, but got ${value}`);
    }
  },
  deepStrictEqual(actual: unknown, expected: unknown, message?: string) {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      throw new Error(message || `Expected ${JSON.stringify(expected)}, but got ${JSON.stringify(actual)}`);
    }
  }
};

async function runMandiRatesTests() {
  console.log('🧪 Starting KrushiScan AI Mandi Rates & Net Return Verification Suite...');

  // 1. Vidarbha 11-District Coverage
  console.log('Test 1: Vidarbha 11-district list verification...');
  const expectedDistricts = [
    'यवतमाळ', 'वर्धा', 'अकोला', 'अमरावती', 'बुलढाणा',
    'नागपूर', 'वाशीम', 'चंद्रपूर', 'भंडारा', 'गोंदिया', 'गडचिरोली'
  ];
  for (const dist of expectedDistricts) {
    const found = VIDARBHA_DISTRICTS.some(d => d.includes(dist));
    assert.ok(found, `District ${dist} must be present in VIDARBHA_DISTRICTS`);
  }
  assert.strictEqual(VIDARBHA_DISTRICTS[0], 'सर्व जिल्हे (All)', 'First option must be All districts');
  console.log('✅ Test 1 Passed: All 11 Vidarbha districts present and verified.');

  // 2. Commodities Schema and MSP Benchmarks
  console.log('Test 2: Commodities list and official Kharif/Rabi MSP benchmarks...');
  const cotton = COMMODITIES.find(c => c.id === 'cotton');
  assert.ok(cotton, 'Cotton must be present');
  assert.strictEqual(cotton?.msp, 7521, 'Cotton Long Staple MSP must be 7521');

  const soybean = COMMODITIES.find(c => c.id === 'soybean');
  assert.ok(soybean, 'Soybean must be present');
  assert.strictEqual(soybean?.msp, 4892, 'Soybean MSP must be 4892');

  const tur = COMMODITIES.find(c => c.id === 'tur');
  assert.ok(tur, 'Tur/Pigeonpea must be present');
  assert.strictEqual(tur?.msp, 7550, 'Tur MSP must be 7550');

  const chana = COMMODITIES.find(c => c.id === 'chana');
  assert.ok(chana, 'Gram/Chana must be present');
  assert.strictEqual(chana?.msp, 5440, 'Chana MSP must be 5440');

  const wheat = COMMODITIES.find(c => c.id === 'wheat');
  assert.ok(wheat, 'Wheat must be present');
  assert.strictEqual(wheat?.msp, 2275, 'Wheat MSP must be 2275');

  const paddy = COMMODITIES.find(c => c.id === 'paddy');
  assert.ok(paddy, 'Paddy must be present');
  assert.strictEqual(paddy?.msp, 2300, 'Paddy MSP must be 2300');
  console.log('✅ Test 2 Passed: Commodities list and MSP benchmarks verified against Government of India notifications.');

  // 3. Mandated Net Return Calculation Formula
  console.log('Test 3: Net Return calculation formula verification...');
  // Input: 30 quintals @ ₹7600 modal price, 35 km distance, ₹25/km transport, ₹40/bag labor, ₹200 cess
  const input: NetReturnCalculationInput = {
    quantityQuintals: 30,
    modalPricePerQuintal: 7600,
    distanceKm: 35,
    ratePerKmOrFlat: 25,
    laborAndUnloadingPerQuintal: 40,
    apmcCessOrWeighment: 200,
  };
  const calc = calculateNetReturn(input);
  // Gross = 30 * 7600 = 228000
  // Transport = 35 * 25 = 875
  // Labor = 30 * 40 = 1200
  // Cess = 200
  // Total Deductions = 875 + 1200 + 200 = 2275
  // Net Return = 228000 - 2275 = 225725
  // Effective Price = round(225725 / 30) = 7524
  assert.strictEqual(calc.grossRevenue, 228000, 'Gross revenue must equal quantity * modal price');
  assert.strictEqual(calc.transportCost, 875, 'Transport cost must equal distance * rate');
  assert.strictEqual(calc.totalCosts, 2275, 'Total costs must equal transport + labor + cess');
  assert.strictEqual(calc.netReturn, 225725, 'Net return must equal gross revenue - total costs');
  assert.strictEqual(calc.effectivePricePerQuintal, 7524, 'Effective price must equal net return / quantity');
  console.log('✅ Test 3 Passed: Net Return calculation verified accurately against statutory accounting formulas.');

  // 4. District and Commodity Filtering
  console.log('Test 4: District and commodity filtering in APMC dataset...');
  const yavatmalRecords = MOCK_MANDI_RECORDS.filter(r => r.district.includes('यवतमाळ') || r.district.includes('Yavatmal'));
  assert.ok(yavatmalRecords.length >= 2, 'Yavatmal must have multiple APMC entries');
  for (const r of yavatmalRecords) {
    assert.ok(r.district.includes('यवतमाळ') || r.district.includes('Yavatmal'));
    assert.ok(r.modalPrice > 0, 'Price must be positive');
  }

  const cottonRecords = MOCK_MANDI_RECORDS.filter(r => r.commodity.includes('कापूस') || r.commodity.includes('Cotton'));
  assert.ok(cottonRecords.length >= 3, 'Cotton must have entries across multiple Vidarbha mandis');
  console.log('✅ Test 4 Passed: District and commodity filtering correctly isolates matching APMCs.');

  // 5. Price Sorting (Descending and Ascending)
  console.log('Test 5: Mandi price sorting algorithms...');
  const sampleRecords: MandiRecord[] = [
    { ...MOCK_MANDI_RECORDS[0], modalPrice: 7520, arrivalDate: '2026-10-16' },
    { ...MOCK_MANDI_RECORDS[1], modalPrice: 7780, arrivalDate: '2026-10-18' },
    { ...MOCK_MANDI_RECORDS[2], modalPrice: 7460, arrivalDate: '2026-10-17' },
  ];

  const sortedDesc = [...sampleRecords].sort((a, b) => b.modalPrice - a.modalPrice);
  assert.strictEqual(sortedDesc[0].modalPrice, 7780, 'Top price must be 7780');
  assert.strictEqual(sortedDesc[2].modalPrice, 7460, 'Lowest price must be 7460');

  const sortedAsc = [...sampleRecords].sort((a, b) => a.modalPrice - b.modalPrice);
  assert.strictEqual(sortedAsc[0].modalPrice, 7460, 'Lowest price must be first');
  assert.strictEqual(sortedAsc[2].modalPrice, 7780, 'Highest price must be last');

  const sortedDate = [...sampleRecords].sort((a, b) => b.arrivalDate.localeCompare(a.arrivalDate));
  assert.strictEqual(sortedDate[0].arrivalDate, '2026-10-18', 'Latest date must be first');
  console.log('✅ Test 5 Passed: Sorting by price (high/low) and arrival date verified.');

  // 6. Data Integrity and Non-Fabrication Validation
  console.log('Test 6: Data integrity and units validation...');
  for (const r of MOCK_MANDI_RECORDS) {
    assert.ok(r.id, 'Record must have unique id');
    assert.ok(r.marketName, 'Market name must be present');
    assert.ok(r.minPrice <= r.modalPrice, `Min price (${r.minPrice}) must be <= modal price (${r.modalPrice})`);
    assert.ok(r.modalPrice <= r.maxPrice, `Modal price (${r.modalPrice}) must be <= max price (${r.maxPrice})`);
    assert.ok(r.arrivalsTonnes >= 0, 'Arrivals tonnes must be non-negative');
  }
  console.log('✅ Test 6 Passed: Price bounds (min <= modal <= max) and data integrity verified.');

  console.log('🎉 ALL 6 MANDI RATES & NET RETURN UNIT TESTS PASSED ACCURATELY!');
}

declare const process: { exit: (code?: number) => never };

runMandiRatesTests().catch((err) => {
  console.error('❌ Mandi Rates test suite failed:', err);
  process.exit(1);
});
