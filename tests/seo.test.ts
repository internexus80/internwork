import assert from 'node:assert/strict';
import test from 'node:test';
import { SITE_URL, STATIC_SITEMAP_PATHS, canonicalUrl, sitemapUrls } from '../lib/siteMetadata';

test('canonical URLs use the production origin', () => {
  assert.equal(canonicalUrl('/about'), `${SITE_URL}/about`);
});

test('sitemap includes public routes and unique active domain URLs only', () => {
  const urls = sitemapUrls(['web-development', 'data-science', 'web-development']);

  assert.equal(urls.length, STATIC_SITEMAP_PATHS.length + 2);
  assert.equal(urls.filter((url) => url.endsWith('/domains/web-development')).length, 1);
  assert.ok(urls.includes(`${SITE_URL}/domains/data-science`));
  assert.ok(urls.every((url) => !/\/(admin|dashboard|login|register|verify)(\/|$)/.test(new URL(url).pathname)));
});
