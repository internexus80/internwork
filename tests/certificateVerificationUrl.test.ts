import assert from 'node:assert/strict';
import test from 'node:test';
import { certificateVerificationUrl } from '../utils/certificateVerificationUrl';

test('builds certificate links from the current deployed site origin', () => {
  assert.equal(
    certificateVerificationUrl('IJAS-2026-ABC123', 'https://internjourneys.vercel.app'),
    'https://internjourneys.vercel.app/verify/IJAS-2026-ABC123'
  );
});

test('encodes certificate IDs when building verification links', () => {
  assert.equal(
    certificateVerificationUrl('IJAS/2026/ABC123', 'https://internjourneys.vercel.app/'),
    'https://internjourneys.vercel.app/verify/IJAS%2F2026%2FABC123'
  );
});
