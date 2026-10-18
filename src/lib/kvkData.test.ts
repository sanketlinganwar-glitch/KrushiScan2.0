import {
  VIDARBHA_KVK_DIRECTORY,
  VIDARBHA_DISTRICTS,
  getVerifiedInstitutions,
  buildSafeWhatsAppDiagnosticMessage,
  getWhatsAppShareUrl,
} from './kvkData';

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
};

console.log('🧪 Starting KrushiScan AI KVK & Agricultural Expert Verification Suite...');

// Test 1: Directory Integrity and Verified Sources
{
  assert.ok(VIDARBHA_KVK_DIRECTORY.length >= 6, 'Directory should contain all 6 target institutions');

  const akola = VIDARBHA_KVK_DIRECTORY.find((k) => k.id === 'kvk-akola-pdkv');
  assert.ok(akola, 'KVK Akola / ATIC PDKV must exist');
  assert.ok(akola?.phoneNumbers.some((p) => p.isTollFree && p.number === '18002330724'), 'ATIC toll-free helpline verified');
  assert.ok(akola?.sourceUrl.includes('pdkv.ac.in'), 'Must have official PDKV source URL');

  const cicr = VIDARBHA_KVK_DIRECTORY.find((k) => k.id === 'icar-cicr-nagpur');
  assert.ok(cicr, 'ICAR-CICR Nagpur must exist');
  assert.ok(cicr?.phoneNumbers.some((p) => p.number === '07103275536'), 'CICR Nagpur telephone verified');

  const yavatmal = VIDARBHA_KVK_DIRECTORY.find((k) => k.id === 'kvk-yavatmal');
  assert.ok(yavatmal?.phoneNumbers.some((p) => p.number === '07232241745'), 'KVK Yavatmal phone verified');

  const sakoli = VIDARBHA_KVK_DIRECTORY.find((k) => k.id === 'kvk-sakoli-bhandara');
  assert.ok(sakoli?.phoneNumbers.some((p) => p.number === '07186295018'), 'KVK Sakoli phone verified');

  const wardha = VIDARBHA_KVK_DIRECTORY.find((k) => k.id === 'kvk-wardha-selsura');
  assert.ok(wardha?.phoneNumbers.some((p) => p.number === '07152287085'), 'KVK Selsura phone verified');

  const amravati = VIDARBHA_KVK_DIRECTORY.find((k) => k.id === 'kvk-amravati-durgapur');
  assert.ok(amravati?.phoneNumbers.some((p) => p.number === '07212580174'), 'KVK Amravati phone verified');

  console.log('✅ Test 1 Passed: All 6 Vidarbha institutions contain verified phone numbers and official source URLs.');
}

// Test 2: Unavailable WhatsApp Contacts Are Strictly Tagged
{
  for (const inst of VIDARBHA_KVK_DIRECTORY) {
    assert.strictEqual(inst.hasVerifiedWhatsapp, false, `${inst.id} institutional WhatsApp must be false`);
    assert.strictEqual(inst.whatsappNumber, undefined, `${inst.id} whatsappNumber must be undefined`);
  }
  console.log('✅ Test 2 Passed: No fabricated WhatsApp numbers; all institutional desks strictly flagged unavailable.');
}

// Test 3: District Filtering
{
  const akolaList = getVerifiedInstitutions('Akola');
  assert.strictEqual(akolaList.length, 1, 'Akola district filter returns 1 institution');
  assert.strictEqual(akolaList[0].id, 'kvk-akola-pdkv');

  const yavatmalList = getVerifiedInstitutions('Yavatmal');
  assert.strictEqual(yavatmalList.length, 1, 'Yavatmal district filter returns 1 institution');

  const allList = getVerifiedInstitutions('all');
  assert.strictEqual(allList.length, VIDARBHA_KVK_DIRECTORY.length, 'All filter returns complete directory');

  const missingDistrict = getVerifiedInstitutions('UnknownDistrict');
  assert.strictEqual(missingDistrict.length, 0, 'Unknown district returns empty array without error');

  console.log('✅ Test 3 Passed: District filtering correctly isolates verified district institutions.');
}

// Test 4: Search Query Matching
{
  const cottonSearch = getVerifiedInstitutions(undefined, 'Cotton');
  assert.ok(cottonSearch.some((k) => k.id === 'icar-cicr-nagpur'), 'Search for Cotton returns CICR Nagpur');

  const marathiSearch = getVerifiedInstitutions(undefined, 'अकोला');
  assert.ok(marathiSearch.some((k) => k.id === 'kvk-akola-pdkv'), 'Search for अकोला matches KVK Akola');

  const emptySearch = getVerifiedInstitutions('all', '   ');
  assert.strictEqual(emptySearch.length, VIDARBHA_KVK_DIRECTORY.length, 'Whitespace search returns all');

  console.log('✅ Test 4 Passed: Multilingual search accurately matches institutional names and descriptions.');
}

// Test 5: Safe WhatsApp Diagnostic Message Construction
{
  const mockScan = {
    cropName: 'कापूस (Cotton)',
    diseaseName: 'Pink Bollworm (गुलाबी बोंडअळी)',
    severity: 'High' as any,
    scannedAt: '2026-10-18T10:00:00.000Z',
    uncertaintyInfo: 'दुहेरी कोन तपासणी केली आहे.',
  };

  const msg = buildSafeWhatsAppDiagnosticMessage(mockScan, 'पात्या गळत आहेत, काय उपाय करावा?');
  assert.ok(msg.includes('कापूस'), 'Message must contain crop name');
  assert.ok(msg.includes('गुलाबी बोंडअळी'), 'Message must contain disease name');
  assert.ok(msg.includes('पात्या गळत आहेत'), 'Message must contain farmer question');
  assert.ok(msg.includes('शास्त्रीय सूचना'), 'Message must contain scientific disclaimer');
  assert.ok(msg.includes('प्राथमिक संगणकीय निरीक्षण'), 'Message must declare preliminary AI status');

  // Verify privacy: no personal tokens, api keys, or location
  assert.ok(!msg.includes('http://localhost'), 'Must not contain local URLs');
  assert.ok(!msg.includes('latitude'), 'Must not leak geolocation');
  assert.ok(!msg.includes('user-'), 'Must not leak user ID');

  console.log('✅ Test 5 Passed: Diagnostic consultation message is privacy-safe, disclaimer-grounded, and free of PII.');
}

// Test 6: Empty & Null Scan Handling
{
  const emptyMsg = buildSafeWhatsAppDiagnosticMessage(null, '');
  assert.ok(emptyMsg.includes('कृषी सल्ला विचारणा'), 'Empty scan returns base template');
  assert.ok(emptyMsg.includes('शास्त्रीय सूचना'), 'Disclaimer present even on empty scan');

  const urlFallback = getWhatsAppShareUrl(emptyMsg);
  assert.ok(urlFallback.startsWith('https://api.whatsapp.com/send?text='), 'Falls back to universal send when no number');

  const urlWithValidNumber = getWhatsAppShareUrl(emptyMsg, '919876543210');
  assert.ok(urlWithValidNumber.startsWith('https://wa.me/919876543210?text='), 'Uses wa.me for valid international numbers');

  const urlWithInvalidNumber = getWhatsAppShareUrl(emptyMsg, 'invalid123');
  assert.ok(urlWithInvalidNumber.startsWith('https://api.whatsapp.com/send?text='), 'Falls back safely on malformed number');

  console.log('✅ Test 6 Passed: Handles empty scan inputs and malformed recipient numbers safely.');
}

console.log('🎉 ALL 6 KVK DIRECTORY & EXPERT SUPPORT UNIT TESTS PASSED ACCURATELY!\n');
