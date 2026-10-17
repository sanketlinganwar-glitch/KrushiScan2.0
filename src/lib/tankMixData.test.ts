import { 
  evaluateTankMix, 
  generateWalesSequence, 
  VIDARBHA_CHEMICAL_REGISTRY,
  VERIFIED_COMPATIBILITY_RULES 
} from './tankMixData';

/**
 * KrushiScan AI - TankMix Data & Evaluator Test Suite
 * Executable in Node.js ES Modules environment.
 */
function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion Failed: ${message}`);
  }
}

console.log('🧪 Starting KrushiScan AI Tank-Mix Verification Suite...');

// Test 1: Verified Compatible Pair (Copper Oxychloride + Streptocycline)
{
  const result = evaluateTankMix(['copper-oxychloride-wp', 'streptocycline-sp']);
  assert(result.overallStatus === 'verified_compatible', 'COC + Streptocycline must be verified_compatible');
  assert(result.rulesTriggered.length === 1, 'Should trigger exactly 1 verified rule');
  assert(result.rulesTriggered[0].sourceAuthority.includes('PDKV'), 'Must cite Dr. PDKV / CICR authority');
  assert(result.jarTestMandatory === false, 'Verified compatible does not have mandatory jar test');
  console.log('✅ Test 1 Passed: Copper Oxychloride + Streptocycline verified as compatible.');
}

// Test 2: Verified Compatible Pair (MgSO4 + 19:19:19 Lalya Recipe)
{
  const result = evaluateTankMix(['magnesium-sulphate', 'npk-19-19-19-wsf']);
  assert(result.overallStatus === 'verified_compatible', 'MgSO4 + 19:19:19 must be verified_compatible');
  assert(result.rulesTriggered[0].id === 'rule-mgso4-191919', 'Must trigger Lalya rule');
  console.log('✅ Test 2 Passed: MgSO4 + 19:19:19 verified as compatible for Lalya mitigation.');
}

// Test 3: Incompatible Pair - Chemical Hydrolysis (Copper Oxychloride + Profenofos Organophosphate)
{
  const result = evaluateTankMix(['copper-oxychloride-wp', 'profenofos-50-ec']);
  assert(result.overallStatus === 'incompatible', 'COC + Profenofos must be incompatible');
  assert(result.highestRisk === 'chemical_neutralization', 'Risk must be chemical_neutralization');
  console.log('✅ Test 3 Passed: Copper Oxychloride + Profenofos strictly flagged as Incompatible.');
}

// Test 4: Incompatible Pair - Calcium Precipitation (Calcium Nitrate + MgSO4)
{
  const result = evaluateTankMix(['calcium-nitrate', 'magnesium-sulphate']);
  assert(result.overallStatus === 'incompatible', 'Calcium Nitrate + MgSO4 must be incompatible (Gypsum)');
  assert(result.highestRisk === 'precipitation_curdling', 'Risk must be precipitation_curdling');
  assert(result.rulesTriggered[0].sourceAuthority.includes('IISS'), 'Must cite ICAR-IISS / Fertigation science');
  assert(!result.rulesTriggered[0].sectionOrPage?.includes('Schedule 1(f)'), 'Must NOT misattribute tank-mix restrictions to FCO Schedule 1(f)');
  console.log('✅ Test 4 Passed: Calcium Nitrate + MgSO4 flagged as Incompatible (Gypsum precipitation grounded in solubility science).');
}

// Test 5: Biocontrol Interaction - Strain-Dependent Sensitivity (Copper Oxychloride + Trichoderma)
{
  const result = evaluateTankMix(['copper-oxychloride-wp', 'trichoderma-bio']);
  assert(result.overallStatus === 'caution_jar_test', 'COC + Trichoderma must resolve to caution_jar_test (strain-dependent), not blanket incompatible');
  assert(result.rulesTriggered[0].evidenceType === 'conditional_field_practice', 'Evidence type must be conditional_field_practice');
  assert(result.rulesTriggered[0].explanation.en.includes('strain') || result.rulesTriggered[0].explanation.en.includes('isolate'), 'Must detail strain-dependent tolerance');
  console.log('✅ Test 5 Passed: Copper Oxychloride + Trichoderma verified as strain-dependent caution (no unevidenced blanket ban).');
}

// Test 6: Unverified Pair (Safety Fallback)
{
  const result = evaluateTankMix(['profenofos-50-ec', 'acetamiprid-20-sp']);
  assert(result.overallStatus === 'unverified', 'Unlisted pair must resolve to unverified');
  assert(result.statusHeadline.en === 'Compatibility Not Verified', 'Headline must be Compatibility Not Verified');
  assert(result.jarTestMandatory === true, 'Jar test must be mandatory for unverified mixes');
  console.log('✅ Test 6 Passed: Unlisted combination strictly resolves to Compatibility Not Verified.');
}

// Test 7: Multi-Product Cocktail (3+ products can NEVER be green "Safe")
{
  // Even if pair 1 is compatible, mixing 3 products must trigger caution
  const result = evaluateTankMix(['copper-oxychloride-wp', 'streptocycline-sp', 'npk-19-19-19-wsf']);
  assert(result.overallStatus === 'caution_jar_test', '3+ products must resolve to caution_jar_test, never verified_compatible');
  assert(result.isMultiProductCaution === true, 'Multi-product caution flag must be true');
  assert(result.jarTestMandatory === true, 'Jar test mandatory for 3+ products');
  console.log('✅ Test 7 Passed: 3+ Multi-product mix strictly receives caution_jar_test (Never green safe).');
}

// Test 8: Single product or duplicate selection
{
  const single = evaluateTankMix(['profenofos-50-ec']);
  assert(single.overallStatus === 'unverified', 'Single product should prompt for at least 2');
  
  const duplicate = evaluateTankMix(['profenofos-50-ec', 'profenofos-50-ec']);
  assert(duplicate.selectedChemicals.length === 1, 'Duplicates must be deduped');
  console.log('✅ Test 8 Passed: Single & duplicate inputs handled cleanly.');
}

// Test 9: W.A.L.E.S. Sequence Ordering Validation
{
  const chemicals = [
    VIDARBHA_CHEMICAL_REGISTRY.find(c => c.id === 'silicon-spreader')!, // Adjuvant (S)
    VIDARBHA_CHEMICAL_REGISTRY.find(c => c.id === 'profenofos-50-ec')!, // EC (E)
    VIDARBHA_CHEMICAL_REGISTRY.find(c => c.id === 'copper-oxychloride-wp')!, // WP (W)
    VIDARBHA_CHEMICAL_REGISTRY.find(c => c.id === 'azoxy-difen-sc')!, // SC (L)
    VIDARBHA_CHEMICAL_REGISTRY.find(c => c.id === 'npk-19-19-19-wsf')!, // WSF (S)
  ];
  
  const sequence = generateWalesSequence(chemicals);
  assert(sequence[0].walesCategory === 'Water', 'Step 1 must be clean water');
  assert(sequence[1].walesCategory === 'W', 'Step 2 must be W (Powders/Granules)');
  assert(sequence[2].walesCategory === 'A', 'Step 3 must be A (Agitation)');
  assert(sequence[3].walesCategory === 'L', 'Step 4 must be L (Suspension SC)');
  assert(sequence[4].walesCategory === 'E', 'Step 5 must be E (Emulsifiable EC)');
  assert(sequence[5].walesCategory === 'S', 'Step 6 must be S (Soluble NPK & Adjuvants)');
  console.log('✅ Test 9 Passed: W.A.L.E.S. sequential ordering strictly verified.');
}

// Test 10: Incompatible Pair - Calcium Phosphate Precipitation (Calcium Nitrate + 19:19:19)
{
  const result = evaluateTankMix(['calcium-nitrate', 'npk-19-19-19-wsf']);
  assert(result.overallStatus === 'incompatible', 'Calcium Nitrate + 19:19:19 must be incompatible');
  assert(result.highestRisk === 'precipitation_curdling', 'Risk must be precipitation_curdling');
  assert(result.rulesTriggered[0].sourceAuthority.includes('IISS'), 'Must cite ICAR-IISS / Fertigation science');
  assert(!result.rulesTriggered[0].sectionOrPage?.includes('Schedule 1(f)'), 'Must NOT misattribute tank-mix restrictions to FCO Schedule 1(f)');
  console.log('✅ Test 10 Passed: Calcium Nitrate + 19:19:19 correctly grounded in ionic solubility science without FCO misattribution.');
}

// Test 11: Verified Compatible with Adjuvant (Azoxystrobin + Difenoconazole SC + Silicon Spreader)
{
  const result = evaluateTankMix(['azoxy-difen-sc', 'silicon-spreader']);
  assert(result.overallStatus === 'verified_compatible', 'Azoxy-Difen SC + Silicon Spreader must be verified_compatible');
  assert(result.rulesTriggered[0].evidenceType === 'statutory_label_leaflet', 'Evidence type must be statutory_label_leaflet');
  assert(result.rulesTriggered[0].sourceAuthority.includes('CIR-65,710/2010'), 'Must cite CIBRC registration number');
  console.log('✅ Test 11 Passed: Azoxystrobin + Difenoconazole SC + Silicon Spreader verified with Statutory Label Leaflet.');
}

// Test 12: Multi-Product Cocktail WITH Incompatible Pair (Hazard must override multi-mix caution)
{
  const result = evaluateTankMix(['copper-oxychloride-wp', 'profenofos-50-ec', 'npk-19-19-19-wsf']);
  assert(result.overallStatus === 'incompatible', 'Hazardous combination must result in incompatible even in 3+ mix');
  assert(result.highestRisk === 'chemical_neutralization', 'Highest risk must be chemical_neutralization');
  console.log('✅ Test 12 Passed: Incompatibility takes absolute priority over 3+ multi-product caution.');
}

// Test 13: Mandatory Notices Presence & Trilingual Completeness
{
  const result = evaluateTankMix(['copper-oxychloride-wp', 'streptocycline-sp']);
  assert(!!result.labelPrecedenceNotice.en && !!result.labelPrecedenceNotice.mr && !!result.labelPrecedenceNotice.hi, 'labelPrecedenceNotice must be trilingual');
  assert(!!result.waterQualityNotice.en && !!result.waterQualityNotice.mr && !!result.waterQualityNotice.hi, 'waterQualityNotice must be trilingual');
  assert(result.labelPrecedenceNotice.en.includes('precedence'), 'labelPrecedenceNotice must state product label precedence');
  assert(result.waterQualityNotice.mr.includes('पूर्णा') || result.waterQualityNotice.en.includes('Purna'), 'waterQualityNotice must mention Vidarbha / Purna river basin water conditions');
  console.log('✅ Test 13 Passed: Label precedence and Vidarbha water quality notices verified.');
}

// Test 14: No Arbitrary 5–7-day or 10-day Separation Mandates in Dataset
{
  for (const rule of VERIFIED_COMPATIBILITY_RULES) {
    const condEn = rule.applicableConditions.en;
    const condMr = rule.applicableConditions.mr;
    assert(!condEn.includes('5 to 7 days') && !condEn.includes('10-day separation'), `Rule ${rule.id} must not impose arbitrary 5-7 or 10-day intervals`);
    assert(!condMr.includes('५ ते ७') && !condMr.includes('१० दिवसांचे'), `Rule ${rule.id} Marathi must not impose arbitrary 5-7 or 10-day intervals`);
  }
  console.log('✅ Test 14 Passed: All arbitrary 5–7-day and 10-day separation mandates verified removed.');
}

// Test 15: Qualified Water Quality Guidance (No Blanket pH Mandate)
{
  const result = evaluateTankMix(['copper-oxychloride-wp', 'streptocycline-sp']);
  assert(result.waterQualityNotice.en.includes('product-specific'), 'Water quality notice must state optimal pH is product-specific');
  assert(!result.waterQualityNotice.en.includes('Ensure water pH is neutral (6.5 – 7.0) before spray mixing'), 'Must not mandate universal 6.5-7.0 pH for all sprays');
  for (const caution of result.safetyCautions.en) {
    assert(!caution.includes('between 6.5 and 7.5'), 'Safety cautions must not impose blanket pH range across all chemistries');
  }
  console.log('✅ Test 15 Passed: Water quality guidance verified as qualified and product-label directed.');
}

// Test 16: 5 Dimensions of Compatibility Explicitly Articulated
{
  const result = evaluateTankMix(['copper-oxychloride-wp', 'streptocycline-sp']);
  const discEn = result.disclaimer.en;
  assert(discEn.includes('Physical Compatibility'), 'Must include Physical Compatibility dimension');
  assert(discEn.includes('Chemical Stability'), 'Must include Chemical Stability dimension');
  assert(discEn.includes('Crop Safety'), 'Must include Crop Safety dimension');
  assert(discEn.includes('Biological Efficacy'), 'Must include Biological Efficacy dimension');
  assert(discEn.includes('Regulatory Approval'), 'Must include Regulatory Approval dimension');
  console.log('✅ Test 16 Passed: All 5 distinct dimensions of agrochemical compatibility verified.');
}

console.log('🎉 ALL 16 TANK-MIX UNIT TESTS PASSED ACCURATELY!');

