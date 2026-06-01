import { expect, test } from 'vitest';
import { normalizeURL } from './crawl';
import { getHeadingFromHTML, getFirstParagraphFromHTML } from './crawl';

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

test('getHeadingFromHTML basic', () => {
  const inputBody = `<html><body><h1>Test Title</h1></body></html>`;
  expect(getHeadingFromHTML(inputBody)).toBe("Test Title");
});

test('getHeadingFromHTML fallback to h2', () => {
  const inputBody = `<html><body><h2>Fallback Title</h2></body></html>`;
  expect(getHeadingFromHTML(inputBody)).toBe("Fallback Title");
});

test('getHeadingFromHTML empty', () => {
  expect(getHeadingFromHTML("<html><body></body></html>")).toBe("");
});

test('getFirstParagraphFromHTML main priority', () => {
  const inputBody = `
    <html><body>
      <p>Outside paragraph.</p>
      <main>
        <p>Main paragraph.</p>
      </main>
    </body></html>
  `;
  expect(getFirstParagraphFromHTML(inputBody)).toBe("Main paragraph.");
});

test('getFirstParagraphFromHTML fallback to first p', () => {
  const inputBody = `<html><body><p>Just a paragraph.</p></body></html>`;
  expect(getFirstParagraphFromHTML(inputBody)).toBe("Just a paragraph.");
});

test('getFirstParagraphFromHTML empty', () => {
  expect(getFirstParagraphFromHTML("<html><body></body></html>")).toBe("");
});