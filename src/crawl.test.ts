import { expect, test } from 'vitest';
import { 
  normalizeURL, 
  getHeadingFromHTML, 
  getFirstParagraphFromHTML, 
  getURLsFromHTML, 
  getImagesFromHTML 
} from './crawl';

// --- Normalization Tests ---
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

// --- HTML Parsing Tests ---
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

// --- Link Extraction Tests ---
test("getURLsFromHTML absolute", () => {
  const inputURL = "https://crawler-test.com";
  const inputBody = `<html><body><a href="https://crawler-test.com/path/one"><span>Boot.dev</span></a></body></html>`;

  const actual = getURLsFromHTML(inputBody, inputURL);
  const expected = ["https://crawler-test.com/path/one"];

  expect(actual).toEqual(expected);
});

test("getURLsFromHTML relative", () => {
  const inputURL = "https://crawler-test.com";
  const inputBody = `<html><body><a href="/path/one"><span>Boot.dev</span></a></body></html>`;

  const actual = getURLsFromHTML(inputBody, inputURL);
  const expected = ["https://crawler-test.com/path/one"];

  expect(actual).toEqual(expected);
});

test("getURLsFromHTML multiple", () => {
  const inputURL = "https://crawler-test.com";
  const inputBody = `
    <html>
      <body>
        <a href="/path/one">Link One</a>
        <a href="https://other.com/path/two">Link Two</a>
      </body>
    </html>
  `;

  const actual = getURLsFromHTML(inputBody, inputURL);
  const expected = ["https://crawler-test.com/path/one", "https://other.com/path/two"];

  expect(actual).toEqual(expected);
});

// --- Image Extraction Tests ---
test("getImagesFromHTML relative", () => {
  const inputURL = "https://crawler-test.com";
  const inputBody = `<html><body><img src="/logo.png" alt="Logo"></body></html>`;

  const actual = getImagesFromHTML(inputBody, inputURL);
  const expected = ["https://crawler-test.com/logo.png"];

  expect(actual).toEqual(expected);
});

test("getImagesFromHTML multiple", () => {
  const inputURL = "https://crawler-test.com";
  const inputBody = `
    <html>
      <body>
        <img src="/logo.png" alt="Logo">
        <img src="https://other.com/photo.jpg" alt="Photo">
      </body>
    </html>
  `;

  const actual = getImagesFromHTML(inputBody, inputURL);
  const expected = ["https://crawler-test.com/logo.png", "https://other.com/photo.jpg"];

  expect(actual).toEqual(expected);
});

test("getImagesFromHTML missing src", () => {
  const inputURL = "https://crawler-test.com";
  const inputBody = `<html><body><img alt="No source here"></body></html>`;

  const actual = getImagesFromHTML(inputBody, inputURL);
  const expected: string[] = [];

  expect(actual).toEqual(expected);
});