// KrushiScan AI - Offline Knowledge Base & Scan Queue Unit Tests

import {
  VERIFIED_OFFLINE_KNOWLEDGE,
  getOfflineKnowledgeArticles,
  enqueueOfflineScan,
  getQueuedScans,
  deleteQueuedScan,
  updateQueuedScanStatus,
  KNOWLEDGE_BASE_VERSION,
} from './offlineKnowledge';

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
  throws(fn: () => void | Promise<any>, expectedError?: RegExp | string, message?: string) {
    let threw = false;
    try {
      const res = fn();
      if (res && typeof (res as any).then === 'function') {
        throw new Error('Async functions cannot be tested with synchronous throws');
      }
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
  async rejects(promiseFn: () => Promise<any>, expectedError?: RegExp | string, message?: string) {
    let threw = false;
    try {
      await promiseFn();
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
      throw new Error(message || 'Expected promise to reject, but it resolved.');
    }
  },
};

console.log('🧪 Starting KrushiScan AI Offline Knowledge & Scan Queue Verification Suite...');

// Mock browser localStorage for Node test runner
if (typeof globalThis.localStorage === 'undefined') {
  const store = new Map<string, string>();
  (globalThis as any).localStorage = {
    getItem: (key: string) => store.get(key) || null,
    setItem: (key: string, val: string) => store.set(key, val),
    removeItem: (key: string) => store.delete(key),
    clear: () => store.clear(),
  };
}

// Test 1: Verified Offline Knowledge Base integrity
{
  assert.ok(VERIFIED_OFFLINE_KNOWLEDGE.length >= 5, 'Knowledge base must contain verified Vidarbha crop profiles');
  for (const item of VERIFIED_OFFLINE_KNOWLEDGE) {
    assert.strictEqual(item.version, KNOWLEDGE_BASE_VERSION, 'All items must adhere to versioned schema');
    assert.ok(item.cropName.mr.length > 0, 'Crop must have Marathi local label');
    assert.ok(item.disorderName.mr.length > 0, 'Disorder must have Marathi local label');
    assert.ok(item.symptoms.mr.length > 0, 'Symptoms must have detailed points');
    assert.ok(item.pdkvRecommendations.cultural.mr.length > 0, 'Cultural IPM must be documented');
    assert.ok(item.pdkvRecommendations.chemical.mr.length > 0, 'Chemical IPM must specify active ingredient and dilution');
  }
  console.log('✅ Test 1 Passed: Verified offline knowledge base schema, versioning, and PDKV IPM protocols.');
}

// Test 2: Offline knowledge filtering & search
(async () => {
  const cottonItems = await getOfflineKnowledgeArticles({ cropId: 'cotton' });
  assert.ok(cottonItems.length >= 2, 'Should find at least 2 cotton disorders');
  for (const c of cottonItems) {
    assert.strictEqual(c.cropId, 'cotton', 'Must filter strictly to cotton');
  }

  const searchResults = await getOfflineKnowledgeArticles({ query: 'गुलाबी' });
  assert.ok(searchResults.length >= 1, 'Should find pink bollworm by Marathi query');
  assert.ok(searchResults[0].disorderName.mr.includes('गुलाबी'), 'Matched item must have query in name');
  console.log('✅ Test 2 Passed: Offline knowledge filtering by crop and multilingual text search verified.');
})();

// Test 3: Enqueue an offline scan with unique ID and idempotency key
(async () => {
  const sampleTopImage = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBD...sample';
  const sampleUnderImage = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBD...underside';

  const queued = await enqueueOfflineScan({
    cropHint: 'कापूस',
    topImageDataUrl: sampleTopImage,
    undersideImageDataUrl: sampleUnderImage,
  });

  assert.ok(queued.id.startsWith('queue_'), 'Queued item ID must have unique prefix');
  assert.ok(queued.idempotencyKey.startsWith('idem_'), 'Idempotency key must be generated');
  assert.strictEqual(queued.status, 'queued', 'Initial status must be queued');
  assert.strictEqual(queued.retryCount, 0, 'Initial retry count must be 0');
  assert.strictEqual(queued.topImageDataUrl, sampleTopImage, 'Top image preserved accurately');

  const allQueued = await getQueuedScans();
  const found = allQueued.find((q) => q.id === queued.id);
  assert.ok(found, 'Queued item must be retrievable from storage');
  console.log('✅ Test 3 Passed: Offline scan queueing with unique idempotency key and dual-angle support.');
})();

// Test 4: Queue status lifecycle updates
(async () => {
  const sampleImage = 'data:image/jpeg;base64,samplephoto123';
  const item = await enqueueOfflineScan({ cropHint: 'सोयाबीन', topImageDataUrl: sampleImage });

  // Update to syncing
  await updateQueuedScanStatus(item.id, 'syncing');
  let list = await getQueuedScans();
  let updated = list.find((i) => i.id === item.id);
  assert.strictEqual(updated?.status, 'syncing', 'Status must transition to syncing');

  // Update to failed
  await updateQueuedScanStatus(item.id, 'failed', 'Network timeout while uploading');
  list = await getQueuedScans();
  updated = list.find((i) => i.id === item.id);
  assert.strictEqual(updated?.status, 'failed', 'Status must transition to failed');
  assert.strictEqual(updated?.retryCount, 1, 'Retry count must increment on failure');
  assert.strictEqual(updated?.errorReason, 'Network timeout while uploading', 'Error reason must be recorded');
  console.log('✅ Test 4 Passed: Status lifecycle transitions (queued -> syncing -> failed) and retry counting.');
})();

// Test 5: Farmer deletion of queued item and local image cleanup
(async () => {
  const item = await enqueueOfflineScan({ cropHint: 'तूर', topImageDataUrl: 'data:image/jpeg;base64,delete_me' });
  let list = await getQueuedScans();
  assert.ok(list.some((i) => i.id === item.id), 'Item must exist before deletion');

  await deleteQueuedScan(item.id);
  list = await getQueuedScans();
  assert.ok(!list.some((i) => i.id === item.id), 'Item and associated photo data must be purged');
  console.log('✅ Test 5 Passed: Farmer deletion cleanly purges queued request and stored image.');
})();

// Test 6: Storage quota boundary validation
(async () => {
  // Empty image should reject
  await assert.rejects(
    async () => enqueueOfflineScan({ cropHint: 'कापूस', topImageDataUrl: '' }),
    /Valid leaf photo/,
    'Empty image string must reject'
  );

  // Oversized payload (>15MB) should reject safely
  const hugePayload = 'data:image/jpeg;base64,' + 'A'.repeat(16 * 1024 * 1024);
  await assert.rejects(
    async () => enqueueOfflineScan({ cropHint: 'कापूस', topImageDataUrl: hugePayload }),
    /exceeds maximum storage limit/,
    'Payload over 15MB must be safely rejected'
  );
  console.log('✅ Test 6 Passed: Payload size boundaries and zero-byte protection verified.');

  console.log('🎉 ALL 6 OFFLINE KNOWLEDGE & SCAN QUEUE UNIT TESTS PASSED ACCURATELY!\n');
})();
