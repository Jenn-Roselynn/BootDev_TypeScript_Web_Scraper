import { JSDOM } from "jsdom";

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
      // Relative URL
      try {
        const urlObj = new URL(aElement.href, baseURL);
        urls.push(urlObj.href);
      } catch (err) {
        console.error(`Error with relative url: ${err}`);
      }
    } else {
      // Absolute URL
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