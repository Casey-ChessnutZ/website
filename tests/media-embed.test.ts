import assert from 'node:assert/strict';
import test from 'node:test';

import { getSafeMediaEmbedUrl } from '../app/lib/media-embed.ts';

test('accepts a published Google Sheet iframe URL', () => {
  assert.equal(
    getSafeMediaEmbedUrl('https://docs.google.com/spreadsheets/u/0/d/e/2PACX-1vRIr-eFPQCMvn-TbOfLNzHheAVduNUKX2wOTsYjJOM8zf_uhqe3B3H8Z01bofnCPg/pubhtml/sheet?headers=false&gid=1166263116'),
    'https://docs.google.com/spreadsheets/u/0/d/e/2PACX-1vRIr-eFPQCMvn-TbOfLNzHheAVduNUKX2wOTsYjJOM8zf_uhqe3B3H8Z01bofnCPg/pubhtml/sheet?headers=false&gid=1166263116',
  );
});

test('accepts a Google Form iframe URL', () => {
  assert.equal(
    getSafeMediaEmbedUrl('https://docs.google.com/forms/d/e/1FAIpQLScZkl6Nqy8m2-LyNHsSJ9wttndss_OaRCJSdHPQpofMVY5d1Q/viewform?embedded=true'),
    'https://docs.google.com/forms/d/e/1FAIpQLScZkl6Nqy8m2-LyNHsSJ9wttndss_OaRCJSdHPQpofMVY5d1Q/viewform?embedded=true',
  );
});

test('rejects an unapproved iframe origin', () => {
  assert.equal(getSafeMediaEmbedUrl('https://untrusted.example/widget'), null);
});
