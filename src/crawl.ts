import { JSDOM } from "jsdom";
import pLimit, { Limit } from "p-limit";

export interface ExtractedPageData {
  url: string;
  heading: string;
  first_paragraph: string;
  outgoing_links: string[];
  image_urls: string[];
}

export class ConcurrentCrawler {
  private baseURL: string;
  private pages: Record<string, number>;
  private limit: Limit;

  constructor(baseURL: string, maxConcurrency: number) {
    this.baseURL = baseURL;
    this.pages = {};
    this.limit = pLimit(maxConcurrency);
  }

  private addPageVisit(normalizedURL: string): boolean {
    if (this.pages[normalizedURL] > 0) {
      this.pages[normalizedURL]++;
      return false;
    }
    this.pages[normalizedURL] = 1;
    return true;
  }

  private async getHTML(currentURL: string): Promise<string> {
    return await this.limit(async () => {
      try {
        const response = await fetch(currentURL, {
          method: "GET",
          headers: {
            "User-Agent": "BootCrawler/1.0",
          },
        });

        if (response.status >= 400) {
          throw new Error(`Received HTTP status code ${response.status}`);
        }

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("text/html")) {
          throw new Error(`Expected text/html, but received ${contentType}`);
        }

        return await response.text();
      } catch (err) {
        throw new Error(`Failed to fetch ${currentURL}: ${err}`);
      }
    });
  }

  private async crawlPage(currentURL: string): Promise<void> {
    const baseURLObj = new URL(this.baseURL);
    const currentURLObj = new URL(currentURL);

    if (baseURLObj.hostname !== currentURLObj.hostname) {
      return;
    }

    const normalized = normalizeURL(currentURL);
    if (!this.addPageVisit(normalized)) {
      return;
    }

    console.log(`crawling: ${currentURL}`);

    let html: string;
    try {
      html = await this.getHTML(currentURL);
    } catch (err) {
      console.error(err);
      return;
    }

    const nextURLs = getURLsFromHTML(html, this.baseURL);
    const promises = nextURLs.map((url) => this.crawlPage(url));
    await Promise.all(promises);
  }

  async crawl(): Promise<Record<string, number>> {
    await this.crawlPage(this.baseURL);
    return this.pages;
  }
}

export async function crawlSiteAsync(baseURL: string): Promise<Record<string, number>> {
  const crawler = new ConcurrentCrawler(baseURL, 5);
  return await crawler.crawl();
}

export function normalizeURL(urlString: string): string {
  const urlObj = new URL(urlString);
  const hostPath = `${urlObj.hostname}${urlObj.pathname}`;
  
  if (hostPath.length > 0 && hostPath.endsWith('/')) {
    return hostPath.slice(0, -1);
  }
  
  return hostPath;
}

export function getHeadingFromHTML(html: string): string {
  const dom = new JSDOM(html);
  const h1 = dom.window.document.querySelector("h1");
  const h2 = dom.window.document.querySelector("h2");
  
  return h1?.textContent || h2?.textContent || "";
}

export function getFirstParagraphFromHTML(html: string): string {
  const dom = new JSDOM(html);
  const document = dom.window.document;
  
  const mainP = document.querySelector("main p");
  if (mainP) {
    return mainP.textContent || "";
  }
  
  const firstP = document.querySelector("p");
  return firstP?.textContent || "";
}

export function getURLsFromHTML(html: string, baseURL: string): string[] {
  const dom = new JSDOM(html);
  const anchorElements = dom.window.document.querySelectorAll("a");
  const urls: string[] = [];

  for (const aElement of anchorElements) {
    if (aElement.href.startsWith("/")) {
      try {
        const urlObj = new URL(aElement.href, baseURL);
        urls.push(urlObj.href);
      } catch (err) {
        console.error(`Error with relative url: ${err}`);
      }
    } else {
      try {
        const urlObj = new URL(aElement.href);
        urls.push(urlObj.href);
      } catch (err) {
        console.error(`Error with absolute url: ${err}`);
      }
    }
  }
  return urls;
}

export function getImagesFromHTML(html: string, baseURL: string): string[] {
  const dom = new JSDOM(html);
  const imgElements = dom.window.document.querySelectorAll("img");
  const images: string[] = [];

  for (const imgElement of imgElements) {
    const src = imgElement.src;
    if (src) {
      try {
        const urlObj = new URL(src, baseURL);
        images.push(urlObj.href);
      } catch (err) {
        console.error(`Error with image url: ${err}`);
      }
    }
  }
  return images;
}

export function extractPageData(html: string, pageURL: string): ExtractedPageData {
  return {
    url: pageURL,
    heading: getHeadingFromHTML(html),
    first_paragraph: getFirstParagraphFromHTML(html),
    outgoing_links: getURLsFromHTML(html, pageURL),
    image_urls: getImagesFromHTML(html, pageURL),
  };
}