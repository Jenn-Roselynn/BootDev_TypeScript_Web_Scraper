import { expect, test } from 'vitest';
import { normalizeURL } from './crawl';

test('normalizeURL strip protocol', () => {
  const input = 'https://blog.boot.dev/path';
  const actual = normalizeURL(input);
  const expected = 'blog.boot.dev/path';
  expect(actual).toBe(expected);
});

test('normalizeURL strip trailing slash', () => {
  const input = 'https://blog.boot.dev/path/';
  const actual = normalizeURL(input);
  const expected = 'blog.boot.dev/path';
  expect(actual).toBe(expected);
});

test('normalizeURL capitals', () => {
  const input = 'https://BLOG.boot.dev/path';
  const actual = normalizeURL(input);
  const expected = 'blog.boot.dev/path';
  expect(actual).toBe(expected);
});