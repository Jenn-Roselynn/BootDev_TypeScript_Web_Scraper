import { JSDOM } from "jsdom";

export interface ExtractedPageData {
  url: string;
  heading: string;
  first_paragraph: string;
  outgoing_links: string[];
  image_urls: string[];
}

export async function crawlPage(
  baseURL: string,
  currentURL: string = baseURL,
  pages: Record<string, number> = {}
): Promise<Record<string, number>> {
  const baseURLObj = new URL(baseURL);
  const currentURLObj = new URL(currentURL);

  // 1. Check if the current URL is on the same domain
  if (baseURLObj.hostname !== currentURLObj.hostname) {
    return pages;
  }

  // 2. Get normalized current URL
  const normalizedCurrentURL = normalizeURL(currentURL);

  // 3. Increment count if already visited, or set to 1
  if (pages[normalizedCurrentURL] > 0) {
    pages[normalizedCurrentURL]++;
    return pages;
  }

  pages[normalizedCurrentURL] = 1;
  console.log(`crawling: ${currentURL}`);

  // 4. Fetch HTML
  const html = await getHTML(currentURL);
  if (!html) {
    return pages;
  }

  // 5. Recursively crawl links
  const nextURLs = getURLsFromHTML(html, baseURL);
  for (const nextURL of nextURLs) {
    pages = await crawlPage(baseURL, nextURL, pages);
  }

  return pages;
}

export async function getHTML(url: string): Promise<string | undefined> {
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent": "BootCrawler/1.0",
      },
    });

    if (response.status >= 400) {
      console.error(`Error: Received HTTP status code ${response.status}`);
      return;
    }

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("text/html")) {
      console.error(`Error: Expected text/html, but received ${contentType}`);
      return;
    }

    return await response.text();
  } catch (err) {
    console.error(`Error: Failed to fetch ${url}: ${err}`);
    return;
  }
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